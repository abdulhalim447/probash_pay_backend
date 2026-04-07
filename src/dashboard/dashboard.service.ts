import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../users/user.entity';
import { Deposit, DepositStatus } from '../deposits/deposit.entity';
import { Withdrawal, WithdrawalStatus } from '../withdrawals/withdrawal.entity';
import { Wallet } from '../wallet/wallet.entity';
import { AppSettingsService } from '../app-settings/app-settings.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Deposit)
    private readonly depositRepo: Repository<Deposit>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepo: Repository<Withdrawal>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly appSettingsService: AppSettingsService,
  ) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Users
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { isActive: true } });
    const blockedUsers = await this.userRepo.count({ where: { isActive: false } });
    const newUsersToday = await this.userRepo.count({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    // Deposits
    const totalDeposits = await this.depositRepo.count();
    const pendingDeposits = await this.depositRepo.count({ where: { status: DepositStatus.PENDING } });
    const todayDepositsCount = await this.depositRepo.count({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    const { sum: totalDepositAmountMYR } = await this.depositRepo
      .createQueryBuilder('deposit')
      .select('SUM(deposit.amount)', 'sum')
      .where('deposit.status = :status', { status: DepositStatus.SUCCESS })
      .getRawOne();

    const { sum: todayDepositAmountMYR } = await this.depositRepo
      .createQueryBuilder('deposit')
      .select('SUM(deposit.amount)', 'sum')
      .where('deposit.status = :status', { status: DepositStatus.SUCCESS })
      .andWhere('deposit.createdAt >= :today', { today })
      .getRawOne();

    // Withdrawals
    const totalWithdrawals = await this.withdrawalRepo.count();
    const pendingWithdrawals = await this.withdrawalRepo.count({ where: { status: WithdrawalStatus.PENDING } });
    const processingWithdrawals = await this.withdrawalRepo.count({ where: { status: WithdrawalStatus.PROCESSING } });
    const todayWithdrawalsCount = await this.withdrawalRepo.count({
      where: { createdAt: MoreThanOrEqual(today) },
    });

    const { sum: totalWithdrawalAmountBDT } = await this.withdrawalRepo
      .createQueryBuilder('withdrawal')
      .select('SUM(withdrawal.amountBDT)', 'sum')
      .where('withdrawal.status = :status', { status: WithdrawalStatus.COMPLETED })
      .getRawOne();

    const { sum: todayWithdrawalAmountBDT } = await this.withdrawalRepo
      .createQueryBuilder('withdrawal')
      .select('SUM(withdrawal.amountBDT)', 'sum')
      .where('withdrawal.status = :status', { status: WithdrawalStatus.COMPLETED })
      .andWhere('withdrawal.createdAt >= :today', { today })
      .getRawOne();

    // Wallet
    const { sum: totalBalanceMYR } = await this.walletRepo
      .createQueryBuilder('wallet')
      .select('SUM(wallet.balance)', 'sum')
      .getRawOne();

    // Exchange Rate
    const currentRate = await this.appSettingsService.getExchangeRate();

    const parseToFixed = (val: any) => Number(Number(val || 0).toFixed(2));

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
        newToday: newUsersToday,
      },
      deposits: {
        total: totalDeposits,
        totalAmountMYR: parseToFixed(totalDepositAmountMYR),
        pending: pendingDeposits,
        todayCount: todayDepositsCount,
        todayAmountMYR: parseToFixed(todayDepositAmountMYR),
      },
      withdrawals: {
        total: totalWithdrawals,
        totalAmountBDT: parseToFixed(totalWithdrawalAmountBDT),
        pending: pendingWithdrawals,
        processing: processingWithdrawals,
        todayCount: todayWithdrawalsCount,
        todayAmountBDT: parseToFixed(todayWithdrawalAmountBDT),
      },
      wallet: {
        totalBalanceMYR: parseToFixed(totalBalanceMYR),
      },
      exchangeRate: {
        currentRate,
        from: 'MYR',
        to: 'BDT',
      },
    };
  }
}
