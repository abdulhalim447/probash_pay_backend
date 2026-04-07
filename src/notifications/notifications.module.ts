import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { FirebaseService } from './firebase.service';
import { NotificationsService } from './notifications.service';
import { User } from '../users/user.entity';
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from '../admin/admin-notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [FirebaseService, NotificationsService],
  exports: [FirebaseService, NotificationsService],
})
export class NotificationsModule {}
