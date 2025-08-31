import { HttpException, HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { MatchEntity } from './entities/follower.entity';
import { FirebaseAdminService } from '../common/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypeEnum } from '../notification/enum/notification.enum';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { TITLE_FOR_MATCH_NOTIFICATION } from '../language';
import { NotificationEntity } from '../notification/entities/notification.entity';
import { generateToken } from '../utils/agoraToken';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly notificationService: NotificationService,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  // Handle swipe action and create match if mutual swipe happens
  async handleSwipe(userAId: number, userBId: number): Promise<object> {
    const userASwipe = await this.matchRepository.findOne({
      where: { userAId: userAId, userBId: userBId },
    });

    const userBHasSwipedRight = await this.matchRepository.findOne({
      where: { userAId: userBId, userBId: userAId },
    });

    if (userBHasSwipedRight) {
      const match = this.matchRepository.create({ userAId, userBId });
      const matchedData = await this.matchRepository.save(match);

      const userA = await this.userRepository.findOne({ where: { id: userAId } });
      const userB = await this.userRepository.findOne({ where: { id: userBId } });

      if (userA && userB) {
        try {
          // Define titles and bodies for both users
          const title = TITLE_FOR_MATCH_NOTIFICATION;
          const bodyForUserA = `You and ${userB.fullName} have matched!`;
          const bodyForUserB = `You and ${userA.fullName} have matched!`;

          // Check if userAId and userBId exist
          if (userAId && userBId) {
            // Create notifications for both users
            const notificationDataForUserA = new CreateNotificationDto();
            notificationDataForUserA.notificationType = NotificationTypeEnum.MATCHES;
            notificationDataForUserA.userAId = userAId;
            notificationDataForUserA.userBId = userBId;
            notificationDataForUserA.body = bodyForUserB;
            notificationDataForUserA.title = title;

            const notificationDataForUserB = new CreateNotificationDto();
            notificationDataForUserB.notificationType = NotificationTypeEnum.MATCHES;
            notificationDataForUserB.userAId = userBId; // userAId for userB
            notificationDataForUserB.userBId = userAId; // userBId for userA
            notificationDataForUserB.body = bodyForUserA;
            notificationDataForUserB.title = title;

            // Call the service to create notifications for both users and await their resolution
            const notificationForUserA = await this.notificationService.createNotification(notificationDataForUserA);
            const notificationForUserB = await this.notificationService.createNotification(notificationDataForUserB);

            // Now send notifications after they have been created
            try {
              await this.sendMatchNotification(userA, userB, title, bodyForUserA, bodyForUserB, notificationForUserA, notificationForUserB);
              await this.updateFirebaseDatabase(userA, userB, matchedData?.id);
            } catch (error) {
              console.log(error, "updated error log 1")
            }

            // Await notifications and database updates (do not block notification creation)
            // await Promise.all([sendNotificationPromise]);
          }
        } catch (error) {
          console.log('Error sending notification or updating Firebase', error);

          // Throw an HTTP exception with a status code and error details
          // throw new HttpException(
          //   {
          //     message: 'Error sending notification or updating Firebase',
          //     match_occured: false,
          //     error: error.message || 'Unknown error',
          //   },
          //   HttpStatus.INTERNAL_SERVER_ERROR // You can choose a different status code if needed
          // );
        }
      }

      return {
        msg: 'Match created successfully and notifications sent',
        match_occured: true
      }
    }

    if (!userASwipe) {
      const swipeRequest = this.matchRepository.create({ userAId, userBId });
      await this.matchRepository.save(swipeRequest);
      return {
        msg: 'Swipe recorded. Waiting for mutual swipe to create a match.',
        match_occured: false
      }
    }

    return {
      msg: 'Swipe recorded. You have already swiped on this user.',
      match_occured: false
    }
  }

  // Send match notification to both users
  private async sendMatchNotification(userA: UserEntity, userB: UserEntity, title: string, bodyForUserA: string, bodyForUserB: string, notificationForUserA: NotificationEntity, notificationForUserB: NotificationEntity) {
    // Validate required fields for userA
    if (!userA || !userA.fcmToken || !notificationForUserA || !notificationForUserA.id || !notificationForUserA.notificationType || !title || !bodyForUserA || !(userA.photos && userA.photos[0] && userA.photos[0].url)) {
      console.log('Required fields for user A notification are missing.');
    }

    // Validate required fields for userB
    if (!userB || !userB.fcmToken || !notificationForUserB || !notificationForUserB.id || !notificationForUserB.notificationType || !title || !bodyForUserB || !(userB.photos && userB.photos[0] && userB.photos[0].url)) {
      console.log('Required fields for user B notification are missing.');
    }
    if (userA.fcmToken) {
      await this.firebaseAdminService.sendNotification(userA.fcmToken, notificationForUserA.id.toString(), notificationForUserA.notificationType, '', title, bodyForUserA, userB.id.toString(), userA?.photos[0]?.url);
    }
    if (userB.fcmToken) {
      await this.firebaseAdminService.sendNotification(userB.fcmToken, notificationForUserB.id.toString(), notificationForUserB.notificationType, '', title, bodyForUserB, userA.id.toString(), userB?.photos[0]?.url);
    }
  }

  // Update Firebase Database with the match information
  private async updateFirebaseDatabase(userA: UserEntity, userB: UserEntity, matchId: number) {

    const userARef = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_users`).doc(userA.id.toString());
    const userBRef = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_users`).doc(userB.id.toString());

    // Paths for the settings sub-collection for both users
    const userASettings = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_chat`).doc(userA.id.toString()).collection('settings').doc(userB.id.toString());
    const userBSettings = this.firebaseAdminService.getDatabase().collection(`${process.env.ENVIRONMENT}_chat`).doc(userB.id.toString()).collection('settings').doc(userA.id.toString());

    try {

      // Generate Agora token for the match


      let agoraToken: string = '';

      // Try generating the Agora token, but if it fails, don't stop the server
      try {
        agoraToken = generateToken(matchId.toString(), matchId.toString(), 'publisher', 31536000); // Adjust expiry as needed
      } catch (error) {
        console.error('Error generating Agora token:', error);
        // You can decide to handle this error in any way you prefer
        agoraToken = ''; // Optionally, set to null if token generation fails
      }

      // Update User A's matches
      await userARef.get().then(async (doc) => {
        if (doc.exists) {
          await userARef.update({
            matches: FieldValue.arrayUnion(Number(userB.id)),
            lastActivityOn: FieldValue.serverTimestamp(),
            deletedAt: null // Ensure 'deletedAt' is set to null
          });
        } else {
          await userARef.set({
            id: Number(userA.id),
            fullName: userA.fullName,
            matches: [Number(userB.id)],
            lastActivityOn: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            deletedAt: null // Add default value of 'deletedAt'
          });
        }
      });

      // Update User B's matches
      await userBRef.get().then(async (doc) => {
        if (doc.exists) {
          await userBRef.update({
            matches: FieldValue.arrayUnion(Number(userA.id)),
            lastActivityOn: FieldValue.serverTimestamp(),
            deletedAt: null // Ensure 'deletedAt' is set to null
          });
        } else {
          await userBRef.set({
            id: Number(userB.id),
            fullName: userB.fullName,
            matches: [Number(userA.id)],
            lastActivityOn: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            deletedAt: null // Add default value of 'deletedAt'
          });
        }
      });

      // Update User A's settings with Agora token
      await userASettings.get().then(async (doc) => {
        if (doc.exists) {
          await userASettings.update({
            agoraToken: agoraToken,
            matchId: matchId,
            updatedAt: FieldValue.serverTimestamp()
          });
        } else {
          await userASettings.set({
            agoraToken: agoraToken,
            matchId: matchId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      });

      // Update User B's settings with Agora token
      await userBSettings.get().then(async (doc) => {
        if (doc.exists) {
          await userBSettings.update({
            agoraToken: agoraToken,
            matchId: matchId,
            updatedAt: FieldValue.serverTimestamp()
          });
        } else {
          await userBSettings.set({
            agoraToken: agoraToken,
            matchId: matchId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      });

      console.log('Firebase matches and agora token updated for both users.');
    } catch (error) {
      console.log(error, "error");
    }
  }

  async getMatches(userId: number) {

    const rawQuery = `
  SELECT u.*
FROM users u
WHERE u."isDeleted" = false 
  AND u.role != 'admin'
  AND u.id != ${userId}
  AND u.id IN (
    SELECT m."userBId" 
    FROM matches m
    WHERE m."userAId" = ${userId}
  )
  AND u.id NOT IN (
    SELECT b."user_id" 
    FROM blocked_users b
    WHERE b."user_id" = ${userId}
  )
  AND u.id NOT IN (
    SELECT m."userAId" 
    FROM matches m
    WHERE m."userBId" = ${userId}
  )
UNION ALL
SELECT u.*
FROM users u
WHERE u."isDeleted" = false
  AND u.role != 'admin'
  AND u.id != ${userId}
  AND NOT EXISTS (
    SELECT 1
    FROM blocked_users b
    WHERE b."user_id" = ${userId}
  )
  AND u.id IN (
    SELECT m."userBId"
    FROM matches m
    WHERE m."userAId" = ${userId}
  );
`;

    try {
      const match = await this.entityManager.query(rawQuery);
      console.log('Matched User:', match);  // Log the matched user
    return match.length ? match[0] : []; // Return the single user or null if no match
    } catch (error) {
      console.error('Error fetching match:', error);
      throw new Error('Unable to fetch match');
    }
  }


  // Get specific match
  async getSpecificMatch(userAId: number, userBId: number) {
    const match = await this.matchRepository.findOne({
      where: [
        { userAId: userAId, userBId: userBId },
        { userAId: userBId, userBId: userAId },
      ],
      relations: ['userA', 'userB'],
    });

    if (!match) {
      return { message: 'Match not found.' };
    }

    return match;
  }


  // // Update tokens for either a specific or all mutual matches
  // async updateAgoraTokensForMutualMatches(userAId?: number, userBId?: number): Promise<void> {
  //   // If userAId and userBId are provided, fetch only the mutual match for these users
  //   if (userAId && userBId) {
  //     const userAMatch = await this.matchRepository.findOne({
  //       where: { userAId: userAId, userBId: userBId },
  //     });
  //     const userBMatch = await this.matchRepository.findOne({
  //       where: { userAId: userBId, userBId: userAId },
  //     });

  //     if (userAMatch && userBMatch) {
  //       const agoraToken = generateToken(userAMatch.id.toString(), userAMatch.id.toString(), 'publisher', 31536000);

  //       console.log(agoraToken, "agoraToken")

  //       await this.updateChatSettingsWithToken(userAId, userBId, agoraToken, userAMatch.id);
  //       await this.updateChatSettingsWithToken(userBId, userAId, agoraToken, userAMatch.id);

  //       console.log('Agora token updated for the specified mutual match');
  //     } else {
  //       console.log('No mutual match found for the specified users');
  //     }
  //     return;
  //   }

  //   // Update tokens for all mutual matches if no specific IDs are provided
  //   const matches = await this.matchRepository.find({});
  //   for (const match of matches) {
  //     const { userAId, userBId } = match;
  //     const userAMatch = await this.matchRepository.findOne({
  //       where: { userAId: userAId, userBId: userBId },
  //     });
  //     const userBMatch = await this.matchRepository.findOne({
  //       where: { userAId: userBId, userBId: userAId },
  //     });

  //     if (userAMatch && userBMatch) {
  //       const agoraToken = generateToken(userAMatch.id.toString(), userAMatch.id.toString(), 'publisher', 31536000);

  //       await this.updateChatSettingsWithToken(userAId, userBId, agoraToken, userAMatch.id);
  //       await this.updateChatSettingsWithToken(userBId, userAId, agoraToken, userAMatch.id);
  //     }
  //   }

  //   console.log('Agora tokens updated for all mutual matches.');
  // }

  // // Helper function to update chat settings with Agora token
  // private async updateChatSettingsWithToken(userId: number, matchedUserId: number, agoraToken: string, matchId: number) {
  //   const userSettingsRef = this.firebaseAdminService
  //     .getDatabase()
  //     .collection('chat')
  //     .doc(userId.toString())
  //     .collection('settings')
  //     .doc(matchedUserId.toString());


  //   try {
  //     // Agora token
  //     await userSettingsRef.get().then(async (doc) => {
  //       if (doc.exists) {
  //         await userSettingsRef.update({
  //           agoraToken: agoraToken,
  //           matchId: matchId,
  //           updatedAt: FieldValue.serverTimestamp()
  //         });
  //       } else {
  //         await userSettingsRef.set({
  //           agoraToken: agoraToken,
  //           matchId: matchId,
  //           createdAt: FieldValue.serverTimestamp(),
  //           updatedAt: FieldValue.serverTimestamp()
  //         });
  //       }
  //     });
  //     console.log('Firebase matches and agora token updated for both users.');
  //   } catch (error) {
  //     console.log("error", error)
  //   }

  // }

}
