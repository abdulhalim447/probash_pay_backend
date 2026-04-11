import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { FirebaseService } from './firebase.service';
import { User } from '../users/user.entity';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async saveFcmToken(userId: string, fcmToken: string): Promise<{ message: string }> {
    await this.userRepository.update(userId, { fcmToken });
    return { message: 'FCM token saved' };
  }

  async sendToUser(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
  ): Promise<Notification | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) return null;

      const notification = this.notificationRepository.create({
        userId,
        title,
        body,
        type,
        isSent: false,
      });

      const savedNotification = await this.notificationRepository.save(notification);

      if (user.fcmToken) {
        const isSent = await this.firebaseService.sendToDevice(user.fcmToken, title, body);
        if (isSent) {
          savedNotification.isSent = true;
          savedNotification.sentAt = new Date();
          await this.notificationRepository.save(savedNotification);
        }
      }

      return savedNotification;
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}`, error);
      return null; // Return null so main transaction flow isn't affected
    }
  }

  async sendBroadcast(title: string, body: string): Promise<{ message: string }> {
    try {
      const usersWithToken = await this.userRepository
        .createQueryBuilder('user')
        .where('user.isActive = :isActive', { isActive: true })
        .andWhere('user.fcmToken IS NOT NULL')
        .getMany();

      const notification = this.notificationRepository.create({
        userId: null,
        title,
        body,
        type: NotificationType.BROADCAST,
        isSent: false,
      });

      const savedNotification = await this.notificationRepository.save(notification);

      const fcmTokens = usersWithToken.map(user => user.fcmToken).filter(t => t); // Double check for truthy

      if (fcmTokens.length > 0) {
        await this.firebaseService.sendToMultiple(fcmTokens, title, body);
        savedNotification.isSent = true;
        savedNotification.sentAt = new Date();
        await this.notificationRepository.save(savedNotification);
      }

      return { message: `Broadcast sent to ${fcmTokens.length} users` };
    } catch (error) {
      this.logger.error('Failed to send broadcast notification', error);
      return { message: 'Failed to send broadcast' };
    }
  }

  async getNotificationHistory(page: number = 1): Promise<{ data: Notification[], total: number }> {
    const limit = 20;
    const skip = (page - 1) * limit;
    const [data, total] = await this.notificationRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total };
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
