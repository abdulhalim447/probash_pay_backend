import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransaction } from './wallet-transaction.entity';
import { WalletTransactionService } from './wallet-transaction.service';
import { WalletTransactionController } from './wallet-transaction.controller';
import { Deposit } from '../deposits/deposit.entity';
import { Withdrawal } from '../withdrawals/withdrawal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WalletTransaction, Deposit, Withdrawal])],
  controllers: [WalletTransactionController],
  providers: [WalletTransactionService],
  exports: [WalletTransactionService],
})
export class WalletTransactionModule {}
