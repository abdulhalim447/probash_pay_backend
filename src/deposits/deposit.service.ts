import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deposit, DepositStatus } from './deposit.entity';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionService } from '../wallet-transactions/wallet-transaction.service';
import { TransactionType } from '../wallet-transactions/wallet-transaction.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private depositRepository: Repository<Deposit>,
    private walletService: WalletService,
    private walletTransactionService: WalletTransactionService,
    private notificationsService: NotificationsService,
  ) {}

  async createDeposit(userId: string, dto: CreateDepositDto): Promise<Deposit> {
    const deposit = this.depositRepository.create({
      userId,
      ...dto,
      status: DepositStatus.PENDING,
    });

    const savedDeposit = await this.depositRepository.save(deposit);

    await this.walletTransactionService.createTransaction({
      userId,
      type: TransactionType.DEPOSIT,
      amount: savedDeposit.amount,
      currency: 'MYR',
      status: 'PENDING' as any,
      referenceId: savedDeposit.id,
      description: `Deposit via ${savedDeposit.bankName}`,
    });

    return savedDeposit;
  }

  async getMyDeposits(userId: string): Promise<Deposit[]> {
    return await this.depositRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllDeposits(status?: string): Promise<Deposit[]> {
    const whereCondition = status ? { status: status as DepositStatus } : {};
    return await this.depositRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  async getDepositById(id: string): Promise<Deposit> {
    const deposit = await this.depositRepository.findOne({ where: { id } });
    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }
    return deposit;
  }

  async reviewDeposit(
    id: string,
    adminId: string,
    status: DepositStatus,
    adminNote?: string,
  ): Promise<Deposit> {
    const deposit = await this.getDepositById(id);

    if (
      deposit.status === DepositStatus.SUCCESS ||
      deposit.status === DepositStatus.REJECTED
    ) {
      throw new BadRequestException('Deposit already reviewed');
    }

    deposit.status = status;
    deposit.reviewedBy = adminId;
    deposit.reviewedAt = new Date();

    if (adminNote) {
      deposit.adminNote = adminNote;
    }

    if (deposit.status === DepositStatus.SUCCESS) {
      deposit.processedAt = new Date();
      await this.walletService.addBalance(deposit.userId, Number(deposit.amount));
      await this.walletTransactionService.updateTransactionStatus(
        deposit.id,
        'SUCCESS',
      );

      // Trigger Notification
      try {
        await this.notificationsService.sendToUser(
          deposit.userId,
          'Deposit Successful! ✅',
          `Your deposit of ${deposit.amount} MYR has been approved.`,
          NotificationType.DEPOSIT_SUCCESS,
        );
      } catch (error) {
        // Log error but don't fail the transaction
        console.error('Failed to send deposit success notification', error);
      }
    } else if (deposit.status === DepositStatus.REJECTED) {
      await this.walletTransactionService.updateTransactionStatus(
        deposit.id,
        'REJECTED',
      );
    } else if (deposit.status === DepositStatus.PROCESSING) {
      await this.walletTransactionService.updateTransactionStatus(
        deposit.id,
        'PROCESSING',
      );
    }

    return await this.depositRepository.save(deposit);
  }
}
