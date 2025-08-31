import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { EnrichedQuestion, UserEntity, UserWithEnrichedQuestions } from './infrastructure/persistence/relational/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomSearchDto } from '../common/dtos/custom-search-dto';
import { Questionnaire } from '../questionnaire/entities/questionnaire.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from '../auth/dto/login-auth.dto';
import { Question } from '../questionnaire/questions/question.entity';
import { Blocked_UnBlocked } from './enum/blocked-unblocked.enum';
import { FieldValue } from 'firebase-admin/firestore';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { FavoriteEntity } from '../favourites/entities/favourite.entity';
import { MatchEntity } from '../follower/entities/follower.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(Questionnaire)
    private readonly activityRepository: Repository<ActivityEntity>,

    @InjectRepository(Question)
    private readonly question: Repository<Question>,

    @InjectRepository(FavoriteEntity)
    private readonly favoritesRepository: Repository<FavoriteEntity>,

    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,

    private readonly jwtService: JwtService,

    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async findByMobileNumber(mobileNumber: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { mobileNumber } });

    if (!user) {
      throw new NotFoundException(`User with mobile number ${mobileNumber} not found`);
    }

    return user;
  }

  // Create a new user
  async createUser(firebaseToken: string, createUserDto: CreateUserDto): Promise<UserEntity> {
    createUserDto.firebaseToken = firebaseToken
    // Check if a user with the same mobile number already exists
    const existingUser = await this.userRepository.findOne({
      where: { mobileNumber: createUserDto.mobileNumber, isDeleted: false },
    });

    if (existingUser) {
      throw new ConflictException('A user with this mobile number already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  // Get a user by ID, excluding deleted users
  async getUserById(id: number): Promise<UserWithEnrichedQuestions> {
    // Fetch the user by ID, excluding deleted users
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Ensure user has a spiritualPractices object
    if (!user.spiritualPractices) {
      user.spiritualPractices = { questionnaire: [], activities: [] } as any;
    }

    // Enrich the questionnaire
    const questionnaireData = user.spiritualPractices?.questionnaire || [];
    let enrichedQuestions: EnrichedQuestion[] = [];

    // Check if there are questionnaire entries
    if (Array.isArray(questionnaireData) && questionnaireData.length > 0) {
      const questionIds = questionnaireData.map(q => q.questionId);
      const questions = await this.question.find({ where: { id: In(questionIds) } });

      enrichedQuestions = questions.map(question => {
        const answerEntry = questionnaireData.find(q => q.questionId === question.id);
        return {
          questionId: question.id,
          text: question.text,
          type: question.type,
          answer: answerEntry?.answer || '', // Default to empty string if no answer found
        };
      });
    }


    // Assign enriched questionnaire to the user
    user.spiritualPractices.questionnaire = enrichedQuestions;

    // Get activities IDs from spiritualPractices.activities
    const activityIds = user.spiritualPractices?.activities || [];

    // Build the raw SQL query to fetch activities based on the IDs
    const query = `SELECT * FROM activities WHERE id IN (${activityIds.join(',')})`;

    if (Array.isArray(activityIds) && activityIds.length > 0) {
      // Execute the raw SQL query using TypeORM's query method
      const activities = await this.activityRepository.query(query);

      // Ensure all the fetched activities are assigned to spiritualPractices
      user.spiritualPractices.activities = activities.length > 0 ? activities : []; // Assign fetched activities or empty array
    } else {
      user.spiritualPractices.activities = []; // Assign empty if no activityIds present
    }

    return { user };
  }

  // Update a user using Firebase token and mobile number from UpdateUserDto
  async updateUser(
    updateUserDto: UpdateUserDto,
    id: number,
    jwtToken: string
  ): Promise<AuthResponseDto> {
    const { mobileNumber } = updateUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with mobile number ${mobileNumber} not found or has been deleted.`);
    }

    // Create a copy of the existing user to update
    const updatedUser: Partial<UserEntity> = { ...existingUser };

    // Update fields directly from updateUserDto
    Object.keys(updateUserDto).forEach(key => {
      if (key === 'spiritualPractices') {
        const newQuestionnaire = updateUserDto?.spiritualPractices?.questionnaire || [];
        const existingQuestionnaire = existingUser?.spiritualPractices?.questionnaire || [];

        // Replace existing entries if the questionId is the same
        const updatedQuestionnaire = existingQuestionnaire?.map(existingQ => {
          const newQ = newQuestionnaire.find(q => q?.questionId === existingQ?.questionId);
          return newQ
            ? {
              ...existingQ,
              answer: newQ.answer,
              text: '', // Ensure text is retained if not provided in newQ
            }
            : existingQ;
        });

        // Add any new questions that didn't exist before
        newQuestionnaire?.forEach(newQ => {
          if (!existingQuestionnaire.some(existingQ => existingQ.questionId === newQ.questionId)) {
            updatedQuestionnaire.push({
              ...newQ,
              text: '', // Provide a default value for text if missing
            });
          }
        });

        updatedUser.spiritualPractices = {
          ...existingUser.spiritualPractices,
          ...updateUserDto.spiritualPractices,
          questionnaire: updatedQuestionnaire,
        };
      } else if (key === 'lifestylePreferences') {
        updatedUser.lifestylePreferences = {
          ...existingUser.lifestylePreferences, // Retain existing preferences
          ...updateUserDto.lifestylePreferences, // Update with new preferences
        };
      } else if (key === 'personalDetails') {
        updatedUser.personalDetails = {
          ...existingUser.personalDetails, // Retain existing details
          ...updateUserDto.personalDetails, // Update with new details
        };
      } else {
        // For other fields, directly assign the value from updateUserDto
        updatedUser[key] = updateUserDto[key];
      }
    });

    // console.log(updatedUser, ">>>>>>>>")

    // const updatedUser = this.userRepository.merge(existingUser, updateUserDto);
    // updatedUser.firebaseToken = firebaseToken
    const user = await this.userRepository.save(updatedUser);

    if (user) {
      try {
        await this.updateFirebaseDatabase(user);
      } catch (error) {
        console.log(error, "updated error log 2")
      }

    }

    // Ensure user has a spiritualPractices object
    if (!user.spiritualPractices) {
      user.spiritualPractices = { questionnaire: [], activities: [] } as any;
    }


    // Enrich the questionnaire
    const questionnaireData = user.spiritualPractices?.questionnaire || [];
    let enrichedQuestions: EnrichedQuestion[] = [];

    // Check if there are questionnaire entries
    if (Array.isArray(questionnaireData) && questionnaireData.length > 0) {
      const questionIds = questionnaireData.map(q => q.questionId);
      const questions = await this.question.find({ where: { id: In(questionIds) } });

      enrichedQuestions = questions.map(question => {
        const answerEntry = questionnaireData.find(q => q.questionId === question.id);
        return {
          questionId: question.id,
          text: question.text,
          type: question.type,
          answer: answerEntry?.answer || '', // Default to empty string if no answer found
        };
      });
    }


    // Assign enriched questionnaire to the user
    user.spiritualPractices.questionnaire = enrichedQuestions;

    // Get activities IDs from spiritualPractices.activities
    const activityIds = user.spiritualPractices?.activities || [];

    // Build the raw SQL query to fetch activities based on the IDs
    const query = `SELECT * FROM activities WHERE id IN (${activityIds.join(',')})`;

    if (Array.isArray(activityIds) && activityIds.length > 0) {
      // Execute the raw SQL query using TypeORM's query method
      const activities = await this.activityRepository.query(query);

      // Ensure all the fetched activities are assigned to spiritualPractices
      user.spiritualPractices.activities = activities.length > 0 ? activities : []; // Assign fetched activities or empty array
    } else {
      user.spiritualPractices.activities = []; // Assign empty if no activityIds present
    }

    return {
      jwtToken: jwtToken,
      user: user
    };
  }

  // Soft delete a user (isDeleted = true)
  async deleteUser(id: number): Promise<void> {
    // Fetch the user by id and ensure the user exists and isn't already deleted
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });

    // If the user doesn't exist or is already deleted, throw a NotFoundException
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted`);
    }

    // Modify the mobileNumber to make it unique and mark the user as deleted
    user.mobileNumber = `${user.mobileNumber}-deleted-${Date.now()}`;
    user.isDeleted = true;

    // Save the user entity with the updated mobileNumber and isDeleted fields
    await this.userRepository.save(user);

    // Update Firebase `deletedAt` field to the current timestamp
    const userRef = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_users`).doc(id.toString());

    try {
      await userRef.update({
        deletedAt: FieldValue.serverTimestamp(), // Set `deletedAt` to the current timestamp
      });
      console.log(`User with ID ${id} marked as deleted in Firebase.`);
    } catch (error) {
      console.error('Error updating Firebase on user deletion:', error);
    }
  }

  // Block another user
  async blockUser(userId: number, blockedUserId: number): Promise<void> {
    // Fetch user and blocked user entities
    const userWithEnrichedQuestions = await this.getUserById(userId);
    const blockedUserWithEnrichedQuestions = await this.getUserById(blockedUserId);

    const user = userWithEnrichedQuestions.user;
    const blockedUser = blockedUserWithEnrichedQuestions.user;

    // Custom line to map activities in spiritualPractices
    if (user.activities) {
      user.spiritualPractices.activities = user.spiritualPractices.activities?.map(({ id }: any) => id);
    }

    // Check if users have matched
    const userAHasSwipedRight = await this.matchRepository.findOne({
      where: { userAId: userId, userBId: blockedUserId },
    });
    const userBHasSwipedRight = await this.matchRepository.findOne({
      where: { userAId: blockedUserId, userBId: userId },
    });

    const isMatched = userAHasSwipedRight && userBHasSwipedRight;

    // Ensure blockedUsers array is initialized and fully loaded
    user.blockedUsers = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['blockedUsers'],
    }).then((u) => u?.blockedUsers || []);

    // Check if the user is already blocked
    const isAlreadyBlocked = user.blockedUsers.some((bu) => bu.id === blockedUser.id);

    if (!isAlreadyBlocked) {
      // Append the new blocked user to the blockedUsers array
      user.blockedUsers.push(blockedUser);

      // Save the updated user with the blocked user list
      await this.userRepository.save(user);

      // If matched, update Firebase with blockedMatches
      if (isMatched) {
        try {
          // Reference Firebase for both users
          const userARef = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_users`).doc(userId.toString());
          const userBRef = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_users`).doc(blockedUserId.toString());

          // Update `blockedMatches` for user A
          userARef.get().then((doc) => {
            if (doc.exists) {
              const data = doc.data();
              if (Array.isArray(data?.blockedMatches)) {
                // Add `blockedUserId` if `blockedMatches` exists
                userARef.update({
                  blockedMatches: FieldValue.arrayUnion(blockedUserId),
                });
                // Remove `blockedUserId` from `matches`
                if (Array.isArray(data?.matches)) {
                  userARef.update({
                    matches: FieldValue.arrayRemove(blockedUserId),
                  });
                }
              } else {
                // Initialize `blockedMatches` if it doesn't exist
                userARef.set({ blockedMatches: [blockedUserId] }, { merge: true });
                // Remove `blockedUserId` from `matches`
                if (Array.isArray(data?.matches)) {
                  userARef.update({
                    matches: FieldValue.arrayRemove(blockedUserId),
                  });
                }
              }
            } else {
              // If document doesn't exist, create it with `blockedMatches`
              userARef.set({ blockedMatches: [blockedUserId] });
            }
          });

          // Update `blockedMatches` for user B
          userBRef.get().then((doc) => {
            if (doc.exists) {
              const data = doc.data();
              if (Array.isArray(data?.blockedMatches)) {
                // Add `userId` if `blockedMatches` exists
                userBRef.update({
                  blockedMatches: FieldValue.arrayUnion(userId),
                });
                // Remove `userId` from `matches`
                if (Array.isArray(data?.matches)) {
                  userBRef.update({
                    matches: FieldValue.arrayRemove(userId),
                  });
                }
              } else {
                // Initialize `blockedMatches` if it doesn't exist
                userBRef.set({ blockedMatches: [userId] }, { merge: true });
                // Remove `userId` from `matches`
                if (Array.isArray(data?.matches)) {
                  userBRef.update({
                    matches: FieldValue.arrayRemove(userId),
                  });
                }
              }
            } else {
              // If document doesn't exist, create it with `blockedMatches`
              userBRef.set({ blockedMatches: [userId] });
            }
          });

          console.log('Blocked matches updated in Firebase');
        } catch (error) {
          console.error('Error updating Firebase with blocked matches:', error);
        }
      }
    }
  }

  // Unblock a user
  async unblockUser(userId: number, blockedUserId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
      relations: ['blockedUsers'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const blockedUser = user.blockedUsers.map(bu => bu.id === blockedUserId);
    if (!blockedUser) {
      throw new NotFoundException(`User with ID ${blockedUserId} is not blocked`);
    }
    const unblocked = user.blockedUsers.filter(bu => bu.id != Number(blockedUserId));
    user.blockedUsers = unblocked
    await this.userRepository.save(user);

    // Update Firebase
    try {
      const userARef = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_users`).doc(userId.toString());
      const userBRef = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_users`).doc(blockedUserId.toString());

      // Update Firebase for user A
      userARef.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (Array.isArray(data?.blockedMatches)) {
            // Remove `blockedUserId` from `blockedMatches`
            userARef.update({
              blockedMatches: FieldValue.arrayRemove(blockedUserId),
            });
            // Optionally re-add `blockedUserId` to `matches` if necessary
            if (Array.isArray(data?.matches)) {
              userARef.update({
                matches: FieldValue.arrayUnion(blockedUserId),
              });
            }
          }
        }
      });

      // Update Firebase for user B
      userBRef.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (Array.isArray(data?.blockedMatches)) {
            // Remove `userId` from `blockedMatches`
            userBRef.update({
              blockedMatches: FieldValue.arrayRemove(userId),
            });
            // Optionally re-add `userId` to `matches` if necessary
            if (Array.isArray(data?.matches)) {
              userBRef.update({
                matches: FieldValue.arrayUnion(userId),
              });
            }
          }
        }
      });

      console.log('Unblocked matches updated in Firebase');
    } catch (error) {
      console.error('Error updating Firebase during unblock:', error);
    }

  }

  // Retrieve all unblocked or blocked users based on filter
  async getUnblockedUsers(userId: number, searchFilters: CustomSearchDto): Promise<UserEntity[]> {

    const {
      limit,
      offset,
      sortOrder,
      sortBy,
      // latitude,
      // longitude,
      radius,
      minAge,
      maxAge,
      languages,
      race,
      sexuality,
      maxWeight,
      minWeight,
      maxHeight,
      minHeight,
      ...filters
    } = searchFilters;
    const query = this.userRepository.createQueryBuilder('user');

    const getUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.blockedUsers', 'blockedUser')
      .where('user.id = :userId', { userId })
      .andWhere('user.isDeleted = false') // Ensure the requesting user is not deleted
      .getOne();


    if (!getUser) {
      return []; // Or handle according to your requirements
    }
    ``

    const latitude = getUser?.lat
    const longitude = getUser?.lon
    let filterRadius = radius
    let userRadius = getUser?.radius

    const blockedUserIds = getUser.blockedUsers?.map(bu => bu.id) || [];
    // blockedUserIds.push(userId); // Exclude the requesting user

    // Filter based on blocked or unblocked user type
    if (searchFilters.userDataType === Blocked_UnBlocked.UNBLOCKED) {
      // if (blockedUserIds.length > 0) {
      //   // Fetch unblocked users who are not deleted
      //   query.andWhere('user.id NOT IN (:...blockedUserIds)', { blockedUserIds })
      //     .andWhere('user.isDeleted = false')
      //     .andWhere('user.role != :adminRole', { adminRole: 'admin' });
      // } else {
      // No blocked users, just ensure users are not deleted
      query
        .andWhere('user.isDeleted = false')
        .andWhere('user.id NOT IN (:...blockedUserIds)', { blockedUserIds: [...blockedUserIds, userId] })
        .andWhere('user.role != :adminRole', { adminRole: 'admin' })
        .andWhere('user.id != :userId', { userId }) // Exclude user
        .andWhere(
          `user.id NOT IN (
            SELECT m."userBId"
            FROM matches m
            WHERE m."userAId" = :userId
          )`,
          { userId }
        )
      // }
      const currentDate = new Date();
      let minBirthdate: Date | null = null;
      let maxBirthdate: Date | null = null;
      // If both min and max are provided
      if (minAge && maxAge) {
        minBirthdate = new Date(
          currentDate.getFullYear() - maxAge,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        maxBirthdate = new Date(
          currentDate.getFullYear() - minAge,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        query.andWhere(
          'user.birthday BETWEEN :minBirthdate AND :maxBirthdate',
          { minBirthdate, maxBirthdate },
        );
      }
      // If only min is provided, fetch users older than or equal to min age
      else if (minAge) {
        maxBirthdate = new Date(
          currentDate.getFullYear() - minAge,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        query.andWhere('user.birthday <= :maxBirthdate', { maxBirthdate });
      }
      // If only max is provided, fetch users younger than or equal to max age
      else if (maxAge) {
        minBirthdate = new Date(
          currentDate.getFullYear() - maxAge,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        query.andWhere('user.birthday >= :minBirthdate', { minBirthdate });
      }

    } else if (searchFilters.userDataType === Blocked_UnBlocked.BLOCKED) {
      if (blockedUserIds.length > 0) {
        // Fetch only blocked users who are not deleted
        query.andWhere('user.id IN (:...blockedUserIds)', { blockedUserIds })
          .andWhere('user.isDeleted = false')
          .andWhere('user.role != :adminRole', { adminRole: 'admin' });
      } else {
        return []; // No blocked users
      }
    }

    if (languages && languages.length >= 1) {
      const s = query.andWhere(
        // `\"personalDetails\"->'languages' @> '${JSON.stringify(languages)}'`,
        `\"personalDetails\"->'languages' ?| array[${languages.map(lang => `'${lang}'`).join(', ')}]`
      );
    }

    if (race && race.length >= 1) {
      query.andWhere(
        `\"personalDetails\"->>'race' IN (:...race)`,
        {
          race
        }
      );
    }

    if (sexuality && sexuality.length >= 1) {
      query.andWhere(
        `\"sexualIdentity\" IN (:...sexuality)`,
        {
          sexuality
        }
      );
    }

    if (minWeight) {
      query.andWhere("\"personalDetails\"->'weight' >= :minWeight", { minWeight })
    }

    if (maxWeight) {
      query.andWhere("\"personalDetails\"->'weight'<= :maxWeight", { maxWeight })
    }

    if (minHeight) {
      query.andWhere("\"personalDetails\"->'height' >= :minHeight", { minHeight })
    }

    if (maxHeight) {
      query.andWhere("\"personalDetails\"->'height'<= :maxHeight", { maxHeight })
    }

    // // Dynamic filters
    // if (filters.age) {
    //   const minBirthdate = new Date();
    //   const maxBirthdate = new Date();
    //   const ageRanges = filters.age.split(',').map(range => {
    //     const [minAge, maxAge] = range.split('-').map(Number);
    //     minBirthdate.setFullYear(minBirthdate.getFullYear() - maxAge);
    //     maxBirthdate.setFullYear(maxBirthdate.getFullYear() - minAge);
    //     return `user.birthday BETWEEN :minBirthdate AND :maxBirthdate`;
    //   }).join(' OR ');

    //   query.andWhere(ageRanges, {
    //     minBirthdate: minBirthdate,
    //     maxBirthdate: maxBirthdate,
    //   });
    // }

    // if (filters.height) {
    //   const heightRanges = filters.height.split(',').map(range => {
    //     const [minHeight, maxHeight] = range.split('-');
    //     return `user.height BETWEEN :minHeight AND :maxHeight`;
    //   }).join(' OR ');

    //   query.andWhere(heightRanges, {
    //     minHeight: filters.height,
    //     maxHeight: filters.height,
    //   });
    // }

    // if (filters.languages) {
    //   query.andWhere('user.languages && :languages', { languages: filters.languages });
    // }

    // if (filters.distance) {
    //   // Assuming you have latitude and longitude to calculate distance
    //   const distanceRanges = filters.distance.split(',').map(range => {
    //     const [minDistance, maxDistance] = range.split('-').map(Number);
    //     return `user.distance BETWEEN :minDistance AND :maxDistance`;
    //   }).join(' OR ');

    //   query.andWhere(distanceRanges, {
    //     minDistance: filters.distance,
    //     maxDistance: filters.distance,
    //   });
    // }

    // if (filters.race) {
    //   query.andWhere('user.race IN (:...races)', { races: filters.race });
    // }

    // if (filters.sexuality) {
    //   query.andWhere('user.sexuality IN (:...sexualities)', { sexualities: filters.sexuality });
    // }

    // if (filters.weight) {
    //   const weightRanges = filters.weight.split(',').map(range => {
    //     const [minWeight, maxWeight] = range.split('-').map(Number);
    //     return `user.weight BETWEEN :minWeight AND :maxWeight`;
    //   }).join(' OR ');

    //   query.andWhere(weightRanges, {
    //     minWeight: filters.weight,
    //     maxWeight: filters.weight,
    //   });
    // }

    // Apply dynamic search filters safely
    Object.keys(filters).forEach(column => {
      const value = filters[column];
      if (value) {
        const escapedColumn = this.userRepository.metadata.columns.find(col => col.propertyName === column);
        if (escapedColumn) {
          query.andWhere(`user.${escapedColumn.databaseName} ILIKE :${column}`, { [column]: `%${value}%` });
        }
      }
    });

    // Apply location-based filtering if latitude, longitude, and radius are provided

    if (!filterRadius) {
      filterRadius = Number(userRadius)
    }

    if (latitude && longitude && filterRadius) {

      const radiusNumber = Number(filterRadius);

      const haversineFormula = `
    6371 * acos(
      cos(radians(:latitude)) *
      cos(radians(user.lat)) *
      cos(radians(user.lon) - radians(:longitude)) +
      sin(radians(:latitude)) *
      sin(radians(user.lat))
    ) <= :radius
  `;
      query.andWhere(haversineFormula, { latitude, longitude, radius: radiusNumber });
    }

    // Apply pagination
    if (limit) {
      query.take(limit ? Number(limit) : 10);
    }

    if (offset) {
      query.skip(offset ? Number(offset) : 0);
    }

    try {
      let res = await query.getMany();

      const updatedUsers = await Promise.all(
        res?.map(async (user) => {
          // Ensure user has a spiritualPractices object
          if (!user.spiritualPractices) {
            user.spiritualPractices = { questionnaire: [], activities: [] } as any;
          }
          // Enrich the questionnaire
          const questionnaireData = user.spiritualPractices?.questionnaire || [];
          let enrichedQuestions: EnrichedQuestion[] = [];

          // Check if there are questionnaire entries
          if (Array.isArray(questionnaireData) && questionnaireData.length > 0) {
            const questionIds = questionnaireData.map(q => q.questionId);
            const questions = await this.question.find({ where: { id: In(questionIds) } });

            enrichedQuestions = questions.map(question => {
              const answerEntry = questionnaireData.find(q => q.questionId === question.id);
              return {
                questionId: question.id,
                text: question.text,
                type: question.type,
                answer: answerEntry?.answer || '', // Default to empty string if no answer found
              };
            });
          }
          // Assign enriched questionnaire to the user
          user.spiritualPractices.questionnaire = enrichedQuestions;

          // Get activities IDs from spiritualPractices.activities
          const activityIds = user.spiritualPractices?.activities || [];

          // Build the raw SQL query to fetch activities based on the IDs
          const query = `SELECT * FROM activities WHERE id IN (${activityIds.join(',')})`;

          if (Array.isArray(activityIds) && activityIds.length > 0) {
            // Execute the raw SQL query using TypeORM's query method
            const activities = await this.activityRepository.query(query);

            // Ensure all the fetched activities are assigned to spiritualPractices
            user.spiritualPractices.activities = activities.length > 0 ? activities : []; // Assign fetched activities or empty array
          } else {
            user.spiritualPractices.activities = []; // Assign empty if no activityIds present
          }

          // TO DO optimize 
          // Check if the current user has favorited this mapped user
          const isFavorited = await this.favoritesRepository.findOne({
            where: {
              user: { id: userId },  // Referencing the user who favorited someone
              favoritedUser: { id: user.id },  // Referencing the user being favorited
            },
          });

          // TO DO isFavorited key enter in response using best way
          // Add the isFavorited flag
          user['isFavourite'] = isFavorited ? true : false;

          return user; // Return the modified user object
        })
      );

      return updatedUsers;
    } catch (error) {
      console.error('Error executing query', error);
      throw new Error('Unable to fetch user activities');
    }

  }

  // Update Firebase Database with the match information
  private async updateFirebaseDatabase(userData: UserEntity) {
    console.log(userData.fcmToken, 'userData.fcmToken')
    const userRef = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_users`).doc(userData.id.toString());

    try {
      await userRef.get().then(async (doc) => {
        const profileImage = userData?.photos?.[0].url ?? null; // Get the first photo from the photos array, or null if it doesn't exist
        const fullNameLowerCase = userData?.fullName?.toLowerCase() ?? ''; // Convert fullName to lowercase

        const userDataToUpdate = {
          fullName: userData?.fullName ?? '',
          lastActivityOn: FieldValue.serverTimestamp(),
          deletedAt: userData?.isDeleted ? FieldValue.serverTimestamp() : null, // If the user is deleted, set the deletedAt timestamp, otherwise keep it null
          profileImage, // Profile image from the first photo
          fullNameLowerCase, // Full name in lowercase
          fcmToken: userData?.fcmToken ?? ''
        };

        if (doc.exists) {
          await userRef.update(userDataToUpdate);
        } else {
          await userRef.set({
            id: Number(userData?.id),
            fullName: userData?.fullName ?? '',
            lastActivityOn: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            deletedAt: null, // Initially set deletedAt to null when the user is created
            profileImage,
            fullNameLowerCase,
            fcmToken: userData?.fcmToken ?? ''
          });
        }
      });

      console.log('Firebase user created or updated');
    } catch (error) {
      console.log(error, "error");
    }
  }
}

