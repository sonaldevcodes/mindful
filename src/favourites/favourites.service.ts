import { Injectable, NotFoundException, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchPaginationDto } from '../common/dtos/search-pagination.dto';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { FavoriteEntity } from './entities/favourite.entity';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { TITLE_FOR_PROFILE_FAVOURITED } from '../language';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { NotificationTypeEnum } from '../notification/enum/notification.enum';
import { NotificationService } from '../notification/notification.service';
import { ActivityEntity } from '../activities/entities/activity.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoritesRepository: Repository<FavoriteEntity>,
    
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly notificationService: NotificationService,

  ) { }

  async favoriteUser(currentUserId: number, userId: number): Promise<FavoriteEntity> {
    if (currentUserId === userId) {
      throw new ConflictException('You cannot favorite yourself.');
    }

    // Check if the favorite already exists
    const existingFavorite = await this.favoritesRepository.findOne({
      where: {
        user: { id: currentUserId },
        favoritedUser: { id: userId },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('User is already in favorites.');
    }

    // Fetch both users
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    const favoritedUser = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !favoritedUser) {
      throw new NotFoundException('User not found.');
    }

    // Create and save the favorite
    const favorite = this.favoritesRepository.create({
      user,
      favoritedUser,
    });

    const savedFavorite = await this.favoritesRepository.save(favorite);
    const title = TITLE_FOR_PROFILE_FAVOURITED;

    let creanotificationCreatedData: any

    // Create notifications for favorited
    try {

      // Notification for the favorited user
      const notificationDataForFavoritedUser = new CreateNotificationDto();
      notificationDataForFavoritedUser.notificationType = NotificationTypeEnum.FAVORITES;
      notificationDataForFavoritedUser.userAId = currentUserId; // The user who favorites
      notificationDataForFavoritedUser.userBId = userId; // The user who is favorited
      notificationDataForFavoritedUser.body = `${user.fullName} has favorited your profile.`;
      notificationDataForFavoritedUser.title = title;

      // Call the service to create notification for the favorited user
      creanotificationCreatedData = await this.notificationService.createNotification(notificationDataForFavoritedUser);

      // // Optionally, you can create a notification for the current user as well
      // const notificationDataForCurrentUser = new CreateNotificationDto();
      // notificationDataForCurrentUser.notificationType = NotificationTypeEnum.FAVORITED;
      // notificationDataForCurrentUser.userAId = currentUserId; // The user who favorites
      // notificationDataForCurrentUser.userBId = userId; // The user who is favorited
      // notificationDataForCurrentUser.body = `You have favorited ${favoritedUser.fullName}'s profile.`;
      // notificationDataForCurrentUser.title = title;

      // Call the service to create notification for the current user
      // await this.notificationService.createNotification(notificationDataForCurrentUser);

    } catch (error) {
      console.error('Error creating notifications: ', error);
      // Do not throw error here, so the server doesn't crash
    }

    // Send notification to the favorited user
    try {
      if (favoritedUser.fcmToken) {
        const bodyForUserB = `${user.fullName} has favorited your profile.`;

        // Validate required fields
        if (!favoritedUser.fcmToken || !creanotificationCreatedData.id || !creanotificationCreatedData.notificationType || !title || !bodyForUserB || !user.id || !(user && user.photos && user.photos[0] && user.photos[0].url)) {
          console.log('All fields are required to send notification');
        }else {
           // Send notification to the favorited user
        await this.firebaseAdminService.sendNotification(
          favoritedUser.fcmToken,
          creanotificationCreatedData.id.toString(),
          creanotificationCreatedData.notificationType.toString(),
          '', // Assuming this is for subType and can be empty
          title,
          bodyForUserB,
          user.id.toString(),
          user.photos[0].url
        );
        }
      } else {
        console.log('No FCM token available for the favorited user.');
      }
    } catch (error) {
      console.log('Error sending notification: ', error);
      // Do not throw error here, so the server doesn't crash
      // if (error instanceof UnprocessableEntityException) {
      //   throw error; // Re-throw specific validation errors
      // }
      // Handle other errors as needed
    }


    return savedFavorite;
  }

  async unfavoriteUser(currentUserId: number, userId: number): Promise<void> {
    // Find the favorite relationship
    const favorite = await this.favoritesRepository.findOne({
      where: {
        user: { id: currentUserId },
        favoritedUser: { id: userId },
      },
      relations: ['user', 'favoritedUser'], // Ensure you are loading related entities if necessary
    });

    // If the favorite relationship does not exist, throw a NotFoundException
    if (!favorite) {
      throw new NotFoundException('Favorite not found.');
    }

    // Remove the favorite relationship
    await this.favoritesRepository.remove(favorite);
  }

  async getFavoritesForUser(currentUserId: number, searchPaginationDto: SearchPaginationDto): Promise<FavoriteEntity[]> {
    const { search, limit, offset } = searchPaginationDto;

    const query = this.favoritesRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.favoritedUser', 'favoritedUser') // Joining the favorited user
      .leftJoinAndSelect('favorite.user', 'user') // Joining the user who has favorites
      .where('favorite.userId = :currentUserId', { currentUserId })
      .andWhere(`NOT EXISTS (
      SELECT 1 
      FROM blocked_users bu
      WHERE bu."user_id" = :currentUserId 
      AND bu."blocked_user_id" = favorite."favoritedUserId" -- Use the column instead of alias
    )`, { currentUserId })
      .andWhere('favoritedUser.isDeleted = false'); // Exclude deleted users

    if (search) {
      query.andWhere('(user.fullName ILIKE :search)', { search: `%${search}%` });
    }

    // Apply pagination
    if (limit) {
      query.take(limit ? Number(limit) : 10);
    }

    if (offset) {
      query.skip(offset ? Number(offset) : 0);
    }
    const logs = await query.getMany();
    // Sanitize the favorite to add specific keys
    const sanitizedFavorites = await Promise.all(logs?.map(async favorite => {

        if (favorite && favorite?.favoritedUser && favorite?.favoritedUser?.spiritualPractices && favorite?.favoritedUser?.spiritualPractices?.activities && Array.isArray(favorite?.favoritedUser?.spiritualPractices?.activities)) {
          const query = `SELECT * FROM activities WHERE id IN (${favorite?.favoritedUser?.spiritualPractices?.activities.join(',')})`;
          // Execute the raw SQL query using TypeORM's query method and await the result
          const activities = await this.activityRepository.query(query);
          favorite.favoritedUser.spiritualPractices.activities = activities || []
        }
     
      return favorite;
    }));
    return sanitizedFavorites
  }

  async getUsersWhoFavoritedUser(currentUserId: number, searchPaginationDto: SearchPaginationDto): Promise<FavoriteEntity[]> {
    const { search, limit, offset } = searchPaginationDto;

    const query = this.favoritesRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.user', 'user')
      .where('favorite.favoritedUserId = :currentUserId', { currentUserId });

    if (search) {
      query.andWhere('(user.fullName ILIKE :search)', { search: `%${search}%` });
    }

    // Apply pagination
    if (limit) {
      query.take(limit ? Number(limit) : 10);
    }

    if (offset) {
      query.skip(offset ? Number(offset) : 0);
    }


    return query.getMany();
  }

}
