import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal, WithdrawalStatus } from './withdrawal.entity';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CompleteWithdrawalDto } from './dto/complete-withdrawal.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionService } from '../wallet-transactions/wallet-transaction.service';
import { TransactionType } from '../wallet-transactions/wallet-transaction.entity';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private withdrawalRepo: Repository<Withdrawal>,
    private walletService: WalletService,
    private walletTransactionService: WalletTransactionService,
    private appSettingsService: AppSettingsService,
    private notificationsService: NotificationsService,
  ) {}

  // ══════════════════════════════════════════════════════════
  //  USER: Create Withdrawal Request
  // ══════════════════════════════════════════════════════════
  async createWithdrawal(
    userId: string,
    dto: CreateWithdrawalDto,
  ): Promise<Withdrawal> {
    // 1️⃣ Get exchange rate & limits
    const exchangeRate = await this.appSettingsService.getExchangeRate();
    const { minBDT, maxBDT } = await this.appSettingsService.getWithdrawalLimits();

    // 2️⃣ Validate amount against limits
    if (dto.amountBDT < minBDT) {
      throw new BadRequestException(
        `Minimum withdrawal amount is ${minBDT} BDT`,
      );
    }
    if (maxBDT > 0 && dto.amountBDT > maxBDT) {
      throw new BadRequestException(
        `Maximum withdrawal amount is ${maxBDT} BDT`,
      );
    }

    // 3️⃣ Convert BDT → MYR
    const amountMYR = parseFloat(
      (dto.amountBDT / exchangeRate).toFixed(2),
    );

    // 4️⃣ Deduct from wallet (fails if insufficient balance)
    await this.walletService.deductBalance(userId, amountMYR);

    // 5️⃣ Create withdrawal record
    const withdrawal = this.withdrawalRepo.create({
      userId,
      amountBDT: dto.amountBDT,
      amountMYR,
      exchangeRateUsed: exchangeRate,
      payoutMethod: dto.payoutMethod,
      payoutType: dto.payoutType,
      receiverName: dto.receiverName,
      receiverNumber: dto.receiverNumber,
      bankName: dto.bankName,
      bankAccountNumber: dto.bankAccountNumber,
      bankBranch: dto.bankBranch,
      bankRoutingNumber: dto.bankRoutingNumber,
      status: WithdrawalStatus.PENDING,
    });

    const savedWithdrawal = await this.withdrawalRepo.save(withdrawal);

    // 6️⃣ Create wallet transaction log
    await this.walletTransactionService.createTransaction({
      userId,
      type: TransactionType.WITHDRAWAL,
      amount: amountMYR,
      currency: 'MYR',
      status: 'PENDING' as any,
      referenceId: savedWithdrawal.id,
      description: `Withdrawal ${dto.amountBDT} BDT via ${dto.payoutMethod}`,
    });

    return savedWithdrawal;
  }

  // ══════════════════════════════════════════════════════════
  //  USER: Get My Withdrawals
  // ══════════════════════════════════════════════════════════
  async getMyWithdrawals(userId: string): Promise<Withdrawal[]> {
    return await this.withdrawalRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ══════════════════════════════════════════════════════════
  //  USER: Get Single Withdrawal
  // ══════════════════════════════════════════════════════════
  async getMyWithdrawalById(userId: string, id: string): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepo.findOne({
      where: { id, userId },
    });
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }
    return withdrawal;
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN: Get All Withdrawals (with filters)
  // ══════════════════════════════════════════════════════════
  async getAllWithdrawals(filters: {
    status?: string;
    userId?: string;
  }): Promise<Withdrawal[]> {
    const query = this.withdrawalRepo.createQueryBuilder('w');

    if (filters.status) {
      query.andWhere('w.status = :status', { status: filters.status });
    }
    if (filters.userId) {
      query.andWhere('w.user_id = :userId', { userId: filters.userId });
    }

    query.orderBy('w.created_at', 'DESC');
    return await query.getMany();
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN: Get Withdrawal Detail
  // ══════════════════════════════════════════════════════════
  async getWithdrawalById(id: string): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepo.findOne({ where: { id } });
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }
    return withdrawal;
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN: Process → PENDING → PROCESSING
  // ══════════════════════════════════════════════════════════
  async processWithdrawal(
    id: string,
    adminId: string,
  ): Promise<Withdrawal> {
    const withdrawal = await this.getWithdrawalById(id);

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING withdrawals can be processed. Current status: ${withdrawal.status}`,
      );
    }

    withdrawal.status = WithdrawalStatus.PROCESSING;
    withdrawal.reviewedBy = adminId;
    withdrawal.reviewedAt = new Date();

    await this.walletTransactionService.updateTransactionStatus(
      id,
      'PROCESSING',
    );

    return await this.withdrawalRepo.save(withdrawal);
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN: Complete → PROCESSING → COMPLETED
  // ══════════════════════════════════════════════════════════
  async completeWithdrawal(
    id: string,
    adminId: string,
    dto: CompleteWithdrawalDto,
  ): Promise<Withdrawal> {
    const withdrawal = await this.getWithdrawalById(id);

    if (withdrawal.status !== WithdrawalStatus.PROCESSING) {
      throw new BadRequestException(
        `Only PROCESSING withdrawals can be completed. Current status: ${withdrawal.status}`,
      );
    }

    withdrawal.status = WithdrawalStatus.COMPLETED;
    withdrawal.transactionRef = dto.transactionRef;
    withdrawal.receiptUrl = dto.receiptUrl || withdrawal.receiptUrl;
    withdrawal.adminNote = dto.adminNote || withdrawal.adminNote;
    withdrawal.completedAt = new Date();
    withdrawal.reviewedBy = adminId;

    await this.walletTransactionService.updateTransactionStatus(id, 'SUCCESS');

    const result = await this.withdrawalRepo.save(withdrawal);

    // Trigger Notification
    try {
      await this.notificationsService.sendToUser(
        withdrawal.userId,
        'Withdrawal Completed! ✅',
        `Your withdrawal of ${withdrawal.amountBDT} BDT has been processed.`,
        NotificationType.WITHDRAWAL_SUCCESS,
      );
    } catch (error) {
      console.error('Failed to send withdrawal completion notification', error);
    }

    return result;
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN: Reject → ANY stage → REJECTED (with refund)
  // ══════════════════════════════════════════════════════════
  async rejectWithdrawal(
    id: string,
    adminId: string,
    adminNote?: string,
  ): Promise<Withdrawal> {
    const withdrawal = await this.getWithdrawalById(id);

    if (
      withdrawal.status === WithdrawalStatus.COMPLETED ||
      withdrawal.status === WithdrawalStatus.REJECTED
    ) {
      throw new BadRequestException(
        `Cannot reject a ${withdrawal.status} withdrawal`,
      );
    }

    // 💰 Refund MYR back to user's wallet
    await this.walletService.refundBalance(
      withdrawal.userId,
      Number(withdrawal.amountMYR),
    );

    withdrawal.status = WithdrawalStatus.REJECTED;
    withdrawal.adminNote = adminNote || withdrawal.adminNote;
    withdrawal.reviewedBy = adminId;
    withdrawal.reviewedAt = new Date();

    await this.walletTransactionService.updateTransactionStatus(
      id,
      'REJECTED',
    );

    const result = await this.withdrawalRepo.save(withdrawal);

    // Trigger Notification
    try {
      await this.notificationsService.sendToUser(
        withdrawal.userId,
        'Withdrawal Rejected ❌',
        `Your withdrawal request has been rejected. Amount refunded to wallet.`,
        NotificationType.WITHDRAWAL_REJECTED,
      );
    } catch (error) {
      console.error('Failed to send withdrawal rejection notification', error);
    }

    return result;
  }
}
