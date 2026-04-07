import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AdminUsersController } from './admin-users.controller';
import { WalletModule } from '../wallet/wallet.module';
import { AppSettingsModule } from '../app-settings/app-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    WalletModule,
    AppSettingsModule,
  ],
  controllers: [ProfileController, AdminUsersController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
