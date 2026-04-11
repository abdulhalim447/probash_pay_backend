import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction, TransactionStatus } from './wallet-transaction.entity';

@Injectable()
export class WalletTransactionService {
  constructor(
    @InjectRepository(WalletTransaction)
    private walletTransactionRepo: Repository<WalletTransaction>,
  ) {}

  async createTransaction(data: Partial<WalletTransaction>): Promise<WalletTransaction> {
    const transaction = this.walletTransactionRepo.create(data);
    return await this.walletTransactionRepo.save(transaction);
  }

  async updateTransactionStatus(referenceId: string, status: string): Promise<void> {
    await this.walletTransactionRepo.update({ referenceId }, { status: status as TransactionStatus });
  }

  async getUserTransactions(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.walletTransactionRepo.findAndCount({
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

  async getAllTransactions(
    filters: {
      userId?: string;
      type?: string;
      status?: string;
    },
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const query = this.walletTransactionRepo.createQueryBuilder('transaction');

    if (filters.userId) {
      query.andWhere('transaction.userId = :userId', { userId: filters.userId });
    }
    if (filters.type) {
      query.andWhere('transaction.type = :type', { type: filters.type });
    }
    if (filters.status) {
      query.andWhere('transaction.status = :status', { status: filters.status });
    }

    query.orderBy('transaction.createdAt', 'DESC');
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

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
}
