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
import { AppSettingsService } from '../app-settings/app-settings.service';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private depositRepository: Repository<Deposit>,
    private walletService: WalletService,
    private walletTransactionService: WalletTransactionService,
    private notificationsService: NotificationsService,
    private appSettingsService: AppSettingsService,
  ) {}

  async createDeposit(userId: string, dto: CreateDepositDto): Promise<Deposit> {
    const exchangeRate = await this.appSettingsService.getExchangeRate();
    const amountBdt = dto.amount * Number(exchangeRate);

    const deposit = this.depositRepository.create({
      userId,
      ...dto,
      amountBdt,
      exchangeRate: Number(exchangeRate),
      status: DepositStatus.PENDING,
    });

    const savedDeposit = await this.depositRepository.save(deposit);

    await this.walletTransactionService.createTransaction({
      userId,
      type: TransactionType.DEPOSIT,
      amount: savedDeposit.amountBdt,
      currency: 'BDT',
      status: 'PENDING' as any,
      referenceId: savedDeposit.id,
      description: `Deposit via ${savedDeposit.bankName}`,
    });

    return savedDeposit;
  }

  async getMyDeposits(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.depositRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllDeposits(status?: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const whereCondition = status ? { status: status as DepositStatus } : {};
    const [data, total] = await this.depositRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
      await this.walletService.addBalance(deposit.userId, Number(deposit.amountBdt));
      await this.walletTransactionService.updateTransactionStatus(
        deposit.id,
        'SUCCESS',
      );

      // Trigger Notification
      try {
        await this.notificationsService.sendToUser(
          deposit.userId,
          'Deposit Successful! ✅',
          `Your deposit of ${deposit.amount} MYR (~${deposit.amountBdt} BDT) has been approved.`,
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
