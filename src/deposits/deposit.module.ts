import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from './deposit.entity';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { WalletModule } from '../wallet/wallet.module';
import { WalletTransactionModule } from '../wallet-transactions/wallet-transaction.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppSettingsModule } from '../app-settings/app-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit]),
    WalletModule,
    WalletTransactionModule,
    NotificationsModule,
    AppSettingsModule,
  ],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}
