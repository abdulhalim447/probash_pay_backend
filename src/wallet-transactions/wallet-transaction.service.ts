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

  async getUserTransactions(userId: string): Promise<WalletTransaction[]> {
    return await this.walletTransactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllTransactions(filters: {
    userId?: string;
    type?: string;
    status?: string;
  }): Promise<WalletTransaction[]> {
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

    return await query.getMany();
  }
}
