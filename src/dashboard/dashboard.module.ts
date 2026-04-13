import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDashboardController } from './admin-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/user.entity';
import { Deposit } from '../deposits/deposit.entity';
import { Withdrawal } from '../withdrawals/withdrawal.entity';
import { Wallet } from '../wallet/wallet.entity';
import { SupportTicket } from '../support-tickets/support-ticket.entity';
import { AppSettingsModule } from '../app-settings/app-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Deposit, Withdrawal, Wallet, SupportTicket]),
    AppSettingsModule,
  ],
  controllers: [AdminDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
