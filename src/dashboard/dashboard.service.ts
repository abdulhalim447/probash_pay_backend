import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../users/user.entity';
import { Deposit, DepositStatus } from '../deposits/deposit.entity';
import { Withdrawal, WithdrawalStatus } from '../withdrawals/withdrawal.entity';
import { Wallet } from '../wallet/wallet.entity';
import { SupportTicket } from '../support-tickets/support-ticket.entity';
import { TicketStatus } from '../support-tickets/enums/ticket-status.enum';
import { PayoutMethod } from '../withdrawals/withdrawal.entity';
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
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: Repository<SupportTicket>,
    private readonly appSettingsService: AppSettingsService,
  ) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Core Counts
    const totalUsers = await this.userRepo.count();
    const pendingWithdrawalsCount = await this.withdrawalRepo.count({
      where: { status: WithdrawalStatus.PENDING },
    });
    const activeTicketsCount = await this.ticketRepo.count({
      where: [
        { status: TicketStatus.OPEN },
        { status: TicketStatus.IN_PROGRESS },
      ],
    });

    // 2. Financial Totals (BDT)
    // Total Balance in BDT (Sum of all wallet balances)
    const { sum: totalBalanceBDT } = await this.walletRepo
      .createQueryBuilder('wallet')
      .select('SUM(wallet.balance)', 'sum')
      .getRawOne();

    // Deposits Today (Successful only, in BDT)
    const { sum: todayDepositsBDT } = await this.depositRepo
      .createQueryBuilder('deposit')
      .select('SUM(deposit.amountBdt)', 'sum')
      .where('deposit.status = :status', { status: DepositStatus.SUCCESS })
      .andWhere('deposit.createdAt >= :today', { today })
      .getRawOne();

    // Withdrawals Today (Successful only, in BDT)
    const { sum: todayWithdrawalsBDT } = await this.withdrawalRepo
      .createQueryBuilder('withdrawal')
      .select('SUM(withdrawal.amountBDT)', 'sum')
      .where('withdrawal.status = :status', { status: WithdrawalStatus.COMPLETED })
      .andWhere('withdrawal.createdAt >= :today', { today })
      .getRawOne();

    // 3. Daily Remittance Volume (Last 7 Days)
    const dailyVolume = await this.depositRepo
      .createQueryBuilder('deposit')
      .select("TO_CHAR(deposit.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(deposit.amountBdt)', 'total')
      .where('deposit.status = :status', { status: DepositStatus.SUCCESS })
      .andWhere('deposit.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 4. Payment Methods Distribution
    const paymentMethods = await this.withdrawalRepo
      .createQueryBuilder('withdrawal')
      .select('withdrawal.payoutMethod', 'method')
      .addSelect('COUNT(withdrawal.id)', 'count')
      .where('withdrawal.status = :status', { status: WithdrawalStatus.COMPLETED })
      .groupBy('withdrawal.payoutMethod')
      .getRawMany();

    const totalCompletedWithdrawals = paymentMethods.reduce((acc, curr) => acc + parseInt(curr.count), 0);
    const paymentMethodsFormatted = paymentMethods.map(pm => ({
      method: pm.method,
      count: parseInt(pm.count),
      percentage: totalCompletedWithdrawals > 0 ? Math.round((parseInt(pm.count) / totalCompletedWithdrawals) * 100) : 0
    }));

    const parseToFixed = (val: any) => Number(Number(val || 0).toFixed(2));

    return {
      summary: {
        totalUsers,
        depositsToday: parseToFixed(todayDepositsBDT),
        withdrawalsToday: parseToFixed(todayWithdrawalsBDT),
        pendingWithdrawals: pendingWithdrawalsCount,
        activeTickets: activeTicketsCount,
        totalBalanceBDT: parseToFixed(totalBalanceBDT),
      },
      charts: {
        dailyVolume: dailyVolume.map(v => ({
          date: v.date,
          amount: parseToFixed(v.total),
        })),
        paymentMethods: paymentMethodsFormatted,
      },
      // Keep old structure for compatibility if needed, but updated to BDT
      users: {
        total: totalUsers,
      },
      wallet: {
        totalBalanceBDT: parseToFixed(totalBalanceBDT),
      }
    };
  }
}
