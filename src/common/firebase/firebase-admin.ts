import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';
const { cert } = require('firebase-admin/app');

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private static isInitialized = false;

  constructor(private configService: ConfigService) { } // Inject ConfigService

  onModuleInit() {
    if (!FirebaseAdminService.isInitialized) {
      const serviceAccountPath = path.join(__dirname, '../../../firebase-admin.json');
      const firebaseDatabaseUrl = this.configService.get<string>('FIREBASE_DATABASE_URL');

      admin.initializeApp({
        credential: cert(serviceAccountPath),
        databaseURL: firebaseDatabaseUrl
      });
      FirebaseAdminService.isInitialized = true;
    }
  }

  // Verify Firebase token and return decoded token 
  async verifyToken(firebaseToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(firebaseToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  // Send notification to a given FCM token
  async sendNotification(fcmToken: string, notificationId: string, type: string, subType: string, title: string, body: string, entityId: string, entityImage: string): Promise<void> {
    const message = {
      token: fcmToken,
      data: {
        notificationId: notificationId,
        type: type,
        subType: subType,
        title: title,
        body: body,
        entityId: entityId,
        entityImage: entityImage
      },
      apns: {
        headers: {
          "apns-push-type": "background"
        },
        payload: {
          aps: {
            contentAvailable: true
          },
        },
      }
    }

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.log('Error sending message:', error);
      console.log('Failed to send notification');
    }
  }

  // Get the Firebase Realtime Database reference
  getDatabase() {
    return admin.firestore();
  }

  // Add a method to update Firebase Database for matched users
  async updateUserChat(userId: string, otherUserId: string, userDetails: any): Promise<void> {
    const userChatRef = this.getDatabase().collection(`/${process.env.ENVIRONMENT}_users/${userId}/chat/${otherUserId}`);
    try {
      await userChatRef.add({
        details: userDetails,
      });
      console.log(`Chat entry added for user ${userId} with ${otherUserId}`);
    } catch (error) {
      console.error('Error updating Firebase Database:', error);
      throw new Error('Failed to update Firebase Database');
    }
  }

}
