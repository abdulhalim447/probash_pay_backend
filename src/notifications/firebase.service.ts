import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendToDevice(fcmToken: string, title: string, body: string): Promise<boolean> {
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send notification to device (Token: ${fcmToken})`, error);
      return false;
    }
  }

  async sendToMultiple(fcmTokens: string[], title: string, body: string): Promise<void> {
    if (!fcmTokens || fcmTokens.length === 0) return;

    try {
      await admin.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification: { title, body },
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (error) {
      this.logger.error(`Failed to send multicast notification`, error);
    }
  }
}
