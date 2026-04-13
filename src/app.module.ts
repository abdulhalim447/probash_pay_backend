import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Admin } from './admin/admin.entity';
import { Wallet } from './wallet/wallet.entity';
import { DepositModule } from './deposits/deposit.module';
import { WalletTransactionModule } from './wallet-transactions/wallet-transaction.module';
import { Deposit } from './deposits/deposit.entity';
import { WalletTransaction } from './wallet-transactions/wallet-transaction.entity';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { AppSetting } from './app-settings/app-setting.entity';
import { WithdrawalModule } from './withdrawals/withdrawal.module';
import { Withdrawal } from './withdrawals/withdrawal.entity';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { ExchangeRateHistory } from './exchange-rate/exchange-rate.entity';
import { PaymentAccountsModule } from './payment-accounts/payment-accounts.module';
import { PaymentAccount } from './payment-accounts/payment-account.entity';
import { NoticesModule } from './notices/notices.module';
import { Notice } from './notices/notice.entity';
import { ProfileModule } from './profile/profile.module';
import { SocialLinksModule } from './social-links/social-links.module';
import { SocialLink } from './social-links/social-link.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/notification.entity';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { SupportTicket } from './support-tickets/support-ticket.entity';
import { TicketReply } from './support-tickets/ticket-reply.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadController } from './uploads/upload.controller';
import { BiometricModule } from './biometric/biometric.module';
import { BiometricKey } from './biometric/entities/biometric-key.entity';
import { BiometricChallenge } from './biometric/entities/biometric-challenge.entity';
import { AppVersionsModule } from './app-versions/app-versions.module';
import { AppVersion } from './app-versions/app-version.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'postgres'),
        entities: [
          User,
          Admin,
          Wallet,
          Deposit,
          WalletTransaction,
          AppSetting,
          Withdrawal,
          ExchangeRateHistory,
          PaymentAccount,
          Notice,
          SocialLink,
          Notification,
          SupportTicket,
          TicketReply,
          BiometricKey,
          BiometricChallenge,
          AppVersion,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    WalletTransactionModule,
    DepositModule,
    AppSettingsModule,
    WithdrawalModule,
    ExchangeRateModule,
    PaymentAccountsModule,
    NoticesModule,
    ProfileModule,
    SocialLinksModule,
    DashboardModule,
    NotificationsModule,
    SupportTicketsModule,
    CloudinaryModule,
    BiometricModule,
    AppVersionsModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}