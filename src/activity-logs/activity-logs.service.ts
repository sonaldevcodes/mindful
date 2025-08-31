import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { SearchPaginationDto } from '../common/dtos/search-pagination.dto';
import { GetActivityLogDto } from './dto/get-activity-log.dto';
import { NotificationService } from '../notification/notification.service';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { ALLOWED_ACTIVITY_TYPES, NotificationTypeEnum } from '../notification/enum/notification.enum';
import { TITLE_FOR_ACTIVITY_END, TITLE_FOR_ACTIVITY_STARTED } from '../language';
import { NotificationSubTypeEnum } from '../notification/enum/notification.sub-type';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLogEntity)
    private activityLogRepository: Repository<ActivityLogEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly notificationService: NotificationService,

  ) { }

  // Create activity log
  async createActivityLog(
    createDto: CreateActivityLogDto,
    startedByUserId: number,
  ): Promise<any> {
    try {
      const currentTimestamp = new Date()
      // Ensure the startedByUserId is valid
      if (!startedByUserId) {
        throw new NotFoundException('Started by user ID is required');
      }

      // Validate the activityType
      const { activityType } = createDto;
      if (!activityType || !ALLOWED_ACTIVITY_TYPES.includes(activityType)) {
        throw new UnprocessableEntityException(
          'activityType is required and must be one of: Video Call, Voice Call, Text Messaging',
        );
      }

      // Fetch the user who started the activity
      const user = await this.userRepository.findOne({ where: { id: startedByUserId } });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      // Create a new ActivityLogEntity and map the fields from the DTO
      const activityLog = new ActivityLogEntity();
      activityLog.activityType = createDto.activityType;
      activityLog.activityName = createDto.activityName;
      activityLog.startTime = createDto.startTime;
      activityLog.endTime = createDto.endTime;
      activityLog.duration = createDto.duration;
      activityLog.startedByUserId = startedByUserId;
      activityLog.ratings_1 = createDto.ratings_1 ?? []; // Default to 0 if null or undefined
      activityLog.ratings_2 = createDto.ratings_2 ?? []; // Default to 0 if null or undefined
      activityLog.feedback = createDto.feedback ?? ''; // Default to empty string if null or undefined
      activityLog.participantDetails = createDto.participants ?? null; // Handle optional participant details
      activityLog.createdAt = currentTimestamp

      // Save the activity log directly without fetching participants
      const savedActivityLog = await this.activityLogRepository.save(activityLog);

      // Fetch participant details after saving, if participant IDs are provided
      let participantsDetails: UserEntity[] = [];
      if (createDto.participants && createDto.participants.length > 0) {
        participantsDetails = await this.userRepository.findBy({
          id: In(createDto.participants),
        });
      }

      // Notify participants about the activity start
      if (createDto.participants && createDto.participants.length > 0) {
        const title = TITLE_FOR_ACTIVITY_STARTED;
        const body = `${user.fullName} has started the activity "${createDto.activityName}".`;

        // Create notifications for each participant
        for (const participantId of createDto.participants) {
          const participant = await this.userRepository.findOne({ where: { id: participantId } });

          if (participant) {
            // Create the notification data first
            const notificationData = new CreateNotificationDto();
            notificationData.notificationType = NotificationTypeEnum.ACTIVITY_START;
            // Use switch to map activityType to subType, throw error on invalid activityType
            switch (savedActivityLog.activityType) {
              case 'Text Messaging':
                notificationData.subType = NotificationSubTypeEnum.TEXT_ACTIVITY;
                break;
              case 'Voice Call':
                notificationData.subType = NotificationSubTypeEnum.AUDIO_CALL;
                break;
              case 'Video Call':
                notificationData.subType = NotificationSubTypeEnum.VIDEO_CALL;
                break;
              default:
                // Throw an error if activityType is not valid
                console.log(
                  'Invalid activityType. It should be one of: "Text Messaging", "Voice Call", or "Video Call".'
                );
            }
            notificationData.userAId = startedByUserId; // The user who started the activity
            notificationData.userBId = participantId; // The participant
            notificationData.body = body;
            notificationData.title = title;


            try {
              // Call the service to create the notification
              await this.notificationService.createNotification(notificationData);
            } catch (error) {
              console.log('Error creating the notificaiton', error)
              // Throw an HTTP exception with a status code and error details
              // throw new HttpException(
              //   {
              //     message: 'Error creating the notificaiton',
              //     match_occured: false,
              //     error: error.message || 'Unknown error',
              //   },
              //   HttpStatus.INTERNAL_SERVER_ERROR // You can choose a different status code if needed
              // );
            }
            // Check if participant has a valid FCM token before sending notification
            // if (participant.fcmToken) {
            // try {
            //   // Check if all required fields are valid
            //   if (
            //     !notificationCreatedData.id ||
            //     !notificationCreatedData.notificationType ||
            //     !notificationCreatedData.subType ||
            //     !title ||
            //     !body ||
            //     !startedByUserId ||
            //     !(user && user.photos && user.photos[0] && user.photos[0].url)
            //   ) {
            //     throw new UnprocessableEntityException(
            //       'Missing required fields for sending notification'
            //     );
            //   }

            //   // Send notification to each participant

            //   // await this.firebaseAdminService?.sendNotification(
            //   //   participant.fcmToken?.toString() || '',
            //   //   notificationCreatedData.id?.toString() || '',
            //   //   notificationCreatedData.notificationType?.toString() || '',
            //   //   notificationCreatedData.subType?.toString() || '',
            //   //   title?.toString() || '',
            //   //   body?.toString() || '',
            //   //   startedByUserId?.toString() || '',
            //   //   user?.photos[0]?.url?.toString() || ''
            //   // );
            // } catch (error) {
            //   console.error(`Error sending notification to participant ${participantId}:`, error);
            //   // Handle the error (optional: log it, send a fallback notification, etc.)
            // }
            // }
            // else {
            //   // Throw an error if the participant does not have an FCM token
            //   throw new UnprocessableEntityException(
            //     `Participant ${participantId} does not have a valid FCM token`
            //   );
            // }

          }
        }
      }

      // Return the saved activity log along with participant details
      return {
        ...savedActivityLog,
        participants: participantsDetails, // Include participant details in the response
      };
    } catch (error) {
      // Handle specific errors and rethrow them as appropriate
      if (error instanceof NotFoundException) {
        throw error; // Specific error for missing user ID
      }

      // Catch any other error and throw a generic internal server error
      throw new InternalServerErrorException(
        'Failed to create activity log',
        error.message,
      );
    }
  }

  async updateActivityLog(id: number, updateDto: UpdateActivityLogDto, endedByUserId: number): Promise<ActivityLogEntity> {

    // Fetch the activity log and its participants
    const activity = await this.activityLogRepository.findOne({
      where: { id },
      relations: ['participants'], // Include participants in the fetch
    });

    // Fetch the user who ended the activity
    const user = await this.userRepository.findOne({ where: { id: endedByUserId } });

    if (!activity) {
      throw new NotFoundException('Activity log not found');
    }

    // Initialize ratings array if it doesn't exist
    if (!activity.ratings_1) {
      activity.ratings_1 = [];
    }

    if (!activity.ratings_2) {
      activity.ratings_2 = [];
    }

    // Update or add new ratings
    if (updateDto?.ratings_1) {
      for (const newRating of updateDto?.ratings_1) {
        const existingIndex = activity.ratings_1.findIndex(r => r.userId === newRating.userId);
        const ratingWithTimestamp = {
          userId: newRating.userId,
          rating: newRating.rating,
          timestamp: new Date()
        };
        if (existingIndex !== -1) {
          activity.ratings_1[existingIndex] = ratingWithTimestamp;
        } else {
          activity.ratings_1.push(ratingWithTimestamp);
        }
      }
    }

    if (updateDto?.ratings_2) {
      for (const newRating of updateDto?.ratings_2) {
        const existingIndex = activity.ratings_2.findIndex(r => r.userId === newRating.userId);
        const ratingWithTimestamp = {
          userId: newRating.userId,
          rating: newRating.rating,
          timestamp: new Date()
        };
        if (existingIndex !== -1) {
          activity.ratings_2[existingIndex] = ratingWithTimestamp;
        } else {
          activity.ratings_2.push(ratingWithTimestamp);
        }
      }
    }

    updateDto.ratings_1 = activity?.ratings_1
    updateDto.ratings_2 = activity?.ratings_2

    // Ensure only the user who started the activity can end it
    // if (activity.startedByUserId !== endedByUserId) {
    //   throw new ForbiddenException('Only the user who started the activity can end it.');
    // }

    // Ensure endTime is provided in the updateDto
    const endTime = updateDto?.endTime;
    if (endTime) {
      // Calculate duration
      const startTime = activity.startTime;
      const durationInMinutes = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);

      // Update activity
      activity.endTime = endTime;
      activity.duration = durationInMinutes;
    }


    Object.assign(activity, updateDto);

    // Notify participants about the activity ending
    const participantIds = activity.participantDetails?.map(participant => participant) || []; // Extract IDs
    if (participantIds.length === 0) {
      console.log('No participants found for this activity.');
      return this.activityLogRepository.save(activity);
    }

    // Fetch participants from the database using the extracted IDs
    const participantsDetails = await this.userRepository.findBy({ id: In(participantIds) });

    // Prepare notification data
    const title = TITLE_FOR_ACTIVITY_END;
    const body = `The activity "${activity?.activityName}" has ended by ${user?.fullName}.`;

    // Create and send notifications for each participant
    for (const participant of participantsDetails) {
      if (participant.fcmToken) {
        // Create notification data regardless of send success
        const notificationData = new CreateNotificationDto();
        notificationData.notificationType = NotificationTypeEnum.ACTIVITY_END;
        // Use switch to map activityType to subType, throw error on invalid activityType
        switch (activity.activityType) {
          case 'Text Messaging':
            notificationData.subType = NotificationSubTypeEnum.TEXT_ACTIVITY;
            break;
          case 'Voice Call':
            notificationData.subType = NotificationSubTypeEnum.AUDIO_CALL;
            break;
          case 'Video Call':
            notificationData.subType = NotificationSubTypeEnum.VIDEO_CALL;
            break;
          default:
            // Throw an error if activityType is not valid
            throw new UnprocessableEntityException(
              'Invalid activityType. It should be one of: "Text Messaging", "Voice Call", or "Video Call".'
            );
        }
        notificationData.userAId = endedByUserId; // The user who ended the activity
        notificationData.body = body;
        notificationData.title = title;

        // Check if endedByUserId is the same as participant.id
        if (endedByUserId == participant?.id) {
          notificationData.userBId = activity?.startedByUserId; // Set to activity's startedByUserId
        } else {
          notificationData.userBId = participant?.id; // Keep as the participant
        }


        try {
          if (endTime) {
            // Create the notification entry in the database
            await this.notificationService.createNotification(notificationData);

          }

          // Check for required fields before sending notification
          // const {
          //   id,
          //   notificationType,
          //   subType,
          // } = notificationCreatedData;

          // // Validate required fields
          // if (!participant.fcmToken || !id || !notificationType || !subType || !title || !body || !endedByUserId ||  !(user && user.photos && user.photos[0] && user.photos[0].url)) {
          //   throw new UnprocessableEntityException('All fields are required to send notification');
          // }

          // Attempt to send notification
          // directly being managed on cloud functions
          // await this.firebaseAdminService.sendNotification(
          //   participant?.fcmToken.toString(),
          //   id.toString(),
          //   notificationType.toString(),
          //   subType.toString(),
          //   title.toString(),
          //   body.toString(),
          //   endedByUserId.toString(),
          //   user.photos[0].url
          // );
        } catch (error) {
          console.error(`Error processing notification for participant ${participant.id}:`, error);
          // Handle sending error without throwing, to continue processing
          // if (error instanceof UnprocessableEntityException) {
          //   throw error; // Re-throw specific validation errors
          // }
        }
      }
    }

    // Save the updated activity
    return this.activityLogRepository.save(activity);
  }

  // Get activity logs with pagination and search
  async getActivityLogs(
    searchDto: SearchPaginationDto,
    userId?: number,
  ): Promise<{
    data: (ActivityLogEntity & {
      totalHours?: number;
      engagement?: number;
      activityCount?: number;
    })[];
    total: number;
  }> {
    const targetedId = searchDto?.targetedId

    // Start building the query
    const queryBuilder = this.activityLogRepository.createQueryBuilder('activityLog')





    if (targetedId) {
      const targetedIdToInt = Number(targetedId);

      queryBuilder.where(
        new Brackets((qb) => {
          // Condition 1: targetedId is the starter, userId is a participant
          qb.where('activityLog.startedByUserId = :targetedId', { targetedId: targetedIdToInt })
            .andWhere(
              '"activityLog"."participantDetails"::jsonb @> :userIdJson',
              { userIdJson: JSON.stringify([userId]) }
            );

          // Condition 2: targetedId is a participant, userId is the starter
          qb.orWhere(
            new Brackets((qb2) => {
              qb2.where(
                '"activityLog"."participantDetails"::jsonb @> :targetedIdJson',
                { targetedIdJson: JSON.stringify([targetedIdToInt]) }
              ).andWhere('activityLog.startedByUserId = :userId', { userId });
            })
          );
        })
      );
    } else {
      // Case when targetedId is not provided
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('activityLog.startedByUserId = :userId', { userId }) // userId is the initiator
            .orWhere(
              '"activityLog"."participantDetails"::jsonb @> :userIdJson',
              { userIdJson: JSON.stringify([userId]) }
            ); // userId is in participantDetails
        })
      );
    }


    // Apply pagination
    queryBuilder.skip(searchDto.offset).take(searchDto.limit);

    // Execute the query and count results
    const [data, total] = await queryBuilder.getManyAndCount();



    // The rest of the code remains the same for handling detailed participant information and calculations
    const detailedData = await Promise.all(
      data.map(async (log) => {
        const participantIds = log.participantDetails
          ? log.participantDetails?.map((p) => p)
          : [];
        let participantDetails: UserEntity[] = [];
        if (participantIds.length > 0) {
          participantDetails = await this.userRepository.findBy({
            id: In(participantIds),
          });
        }

        const totalHours = log.duration / 60;
        const activityCount = log.participants ? log.participants.length : 0;
        const engagement =
          activityCount > 0 ? (totalHours / (activityCount * 2)) * 100 : 0;

        return {
          ...log,
          participantDetails,
          totalHours,
          engagement,
          activityCount,
        };
      }),
    );

    const formattedData: any = [];
    let maxDuration = 0;

    detailedData?.forEach((detail) => {
      if (detail.duration > maxDuration) {
        maxDuration = detail.duration;
      }
    });


    for (const detail of detailedData ?? []) {
      // Convert inner forEach to for...of
      for (const participant of detail?.participantDetails ?? []) {
        const exist = formattedData?.findIndex(
          (fParticipant) => {
            return fParticipant.id == participant.id || fParticipant.id === detail.startedByUserId
          },
        );
        // console.log(exist, ">>>>>> exist 1",formattedData)
        // if(exist === -1 && userId === detail.startedByUserId ){
        //   // here push the data with the name  of  participant.id wala user
        //   continue 
        // }

        if (exist != -1) {
          // If participant already exists in formattedData, update the data
          const data = formattedData[exist];
          const totalHours = data.totalHours + detail.duration;
          const activityCount =
            data.activityCount +
            (detail.participantDetails
              ? detail.participantDetails?.filter(
                (parti) => parti.id == data.id,
              ).length
              : 0);
          const engagement =
            activityCount > 0 ? (detail.duration * 100) / maxDuration : 0;

          formattedData[exist] = {
            ...data,
            totalHours,
            engagement,
            activityCount,
          };



        } else {
          // If participant does not exist in formattedData, fetch user data
          let name = '';
          let images = [];
          let locationAddress = '';
          let id;
          //22 === 22(23 -par), //22 === 23 (23-push)
          let copyParticipant;
          if (userId == detail?.startedByUserId) {
            // console.log("userId : ", userId, "detail?.startedByUserId : ",detail?.startedByUserId, "if participant.id", participant.id )
            name = participant?.fullName || '';
            //@ts-ignore
            images = participant?.photos || [];
            locationAddress = participant?.address || '';
            // id = participant.id
            copyParticipant = participant
          } else {// 
            // console.log("userId : ", userId, "detail?.startedByUserId : ",detail?.startedByUserId, "else" )
            // This is an async operation, so we await it
            const startedByUserData = await this.userRepository.findOne({
              where: { id: detail?.startedByUserId },
            });
            // id = detail?.startedByUserId
            copyParticipant = startedByUserData
            name = startedByUserData?.fullName || '';
            //@ts-ignore
            images = startedByUserData?.photos || [];
            locationAddress = startedByUserData?.address || '';
          }

          const totalHours = detail.duration;
          const activityCount = detail?.participantDetails
            ? detail?.participantDetails?.filter(
              (parti) => parti.id == participant.id,
            ).length
            : 0;
          const engagement =
            activityCount > 0 ? (detail.duration * 100) / maxDuration : 0;



          formattedData.push({
            // ...participant,
            // ...(id ? {id} :{}),
            // fullName: name,
            // photos: images,
            // address: locationAddress,
            ...copyParticipant,
            totalHours,
            activityCount,
            engagement,
          });

        }
      }
    }



    return { data: formattedData, total };
  }

  // Get weekly progress
  async getWeeklyProgress(
    userId: number,
    getActivityLogDto: GetActivityLogDto,
  ) {
    const { startDate, endDate, targetUserId } = getActivityLogDto;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const targetUserIdToNumber = Number(targetUserId)

    // const activityLogs1 = await this.activityLogRepository.find({
    //   where: {
    //     createdAt: Between(start, end),
    //   },
    // });

    const activityLogs = await this.activityLogRepository.createQueryBuilder('activityLog')
    .where('"activityLog"."createdAt" BETWEEN :start AND :end', { start, end }) // Correctly reference createdAt
    .andWhere(
      new Brackets((qb) => {
        qb.where('activityLog.startedByUserId = :userId', { userId })
          .orWhere('activityLog.startedByUserId = :targetUserIdToNumber', { targetUserIdToNumber })
          .orWhere('"activityLog"."participantDetails"::jsonb @> :userIdJson', { userIdJson: JSON.stringify([userId]) })
          .orWhere('"activityLog"."participantDetails"::jsonb @> :targetUserIdJson', { targetUserIdJson: JSON.stringify([targetUserIdToNumber]) });
      })
    )
    .select('DATE(activityLog.createdAt) AS date')
    .addSelect('SUM(activityLog.duration) AS totalDuration')
    .groupBy('DATE(activityLog.createdAt)')
    .getRawMany();

    return {
      data: activityLogs
      // totalHours,
      // engagement,
      // activityCount: logs.length,
    };
  }

  async getLogsForTargetUser(userId: number, targetUserId: number) {

    const logs = await this.activityLogRepository.createQueryBuilder('activityLog')
      .where(
        // Condition 1: targetUserId is the initiator and userId is in participantDetails
        new Brackets((qb) => {
          qb.where('activityLog.startedByUserId = :targetUserId', { targetUserId })
            .andWhere('"activityLog"."participantDetails"::jsonb @> :userIdJson', { userIdJson: JSON.stringify([userId]) });
        })
      )
      .orWhere(
        // Condition 2: targetUserId is in participantDetails and userId is the initiator
        new Brackets((qb) => {
          qb.where('"activityLog"."participantDetails"::jsonb @> :targetUserIdJson', { targetUserIdJson: JSON.stringify([targetUserId]) })
            .andWhere('activityLog.startedByUserId = :userId', { userId });
        })
      )
      .orderBy('activityLog.createdAt', 'DESC')
      .getMany();


    return logs;
  }

  async getLastActivityLogForUser(
    userId: number,
    targetUserId: number,
  ) {
    // Build the query to fetch the last activity log where both the user and target are involved
    const queryBuilder = this.activityLogRepository.createQueryBuilder('activityLog')
      .where('activityLog.startedByUserId = :userId', { userId }) // Where current user is the initiator
      .andWhere('"activityLog"."participantDetails"::jsonb @> :targetUserIdJson', { targetUserIdJson: JSON.stringify([targetUserId]) }) // And target user is in participants
      .orWhere('activityLog.startedByUserId = :targetUserId', { targetUserId }) // OR target user is the initiator
      .andWhere('"activityLog"."participantDetails"::jsonb @> :userIdJson', { userIdJson: JSON.stringify([userId]) }) // And current user is in participants
      .orderBy('activityLog.createdAt', 'DESC') // Order by the most recent log
      .limit(1); // Limit to the latest log

    // Execute the query and get the last activity log
    const lastActivityLog = await queryBuilder.getOne();

    // Return an empty array if no activity log is found
    if (!lastActivityLog) {
      return [];
    }

    // Optionally, fetch and attach participant details
    if (lastActivityLog) {
      const participantIds = lastActivityLog.participantDetails
        ? lastActivityLog.participantDetails.map((p) => p)
        : [];
      if (participantIds.length > 0) {
        const participantDetails = await this.userRepository.findBy({
          id: In(participantIds),
        });
        lastActivityLog['participantDetails'] = participantDetails;
      }
    }

    return lastActivityLog;
  }

}
