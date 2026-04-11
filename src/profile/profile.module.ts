import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AdminUsersController } from './admin-users.controller';
import { WalletModule } from '../wallet/wallet.module';
import { AppSettingsModule } from '../app-settings/app-settings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    WalletModule,
    AppSettingsModule,
    NotificationsModule,
  ],
  controllers: [ProfileController, AdminUsersController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
