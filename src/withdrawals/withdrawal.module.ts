import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from './withdrawal.entity';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { AdminWithdrawalController } from './admin-withdrawal.controller';
import { WalletModule } from '../wallet/wallet.module';
import { WalletTransactionModule } from '../wallet-transactions/wallet-transaction.module';
import { AppSettingsModule } from '../app-settings/app-settings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdrawal]),
    WalletModule,
    WalletTransactionModule,
    AppSettingsModule,
    NotificationsModule,
  ],
  controllers: [WithdrawalController, AdminWithdrawalController],
  providers: [WithdrawalService],
})
export class WithdrawalModule {}
