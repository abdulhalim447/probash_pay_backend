import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction, TransactionStatus } from './wallet-transaction.entity';
import { Deposit } from '../deposits/deposit.entity';
import { Withdrawal } from '../withdrawals/withdrawal.entity';

@Injectable()
export class WalletTransactionService {
  constructor(
    @InjectRepository(WalletTransaction)
    private walletTransactionRepo: Repository<WalletTransaction>,
    @InjectRepository(Deposit)
    private depositRepo: Repository<Deposit>,
    @InjectRepository(Withdrawal)
    private withdrawalRepo: Repository<Withdrawal>,
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
    const [transactions, total] = await this.walletTransactionRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const enrichedData = await Promise.all(
      transactions.map(async (tx) => {
        let details: any = {};
        
        if (tx.type === 'DEPOSIT') {
          const deposit = await this.depositRepo.findOne({ where: { id: tx.referenceId } });
          if (deposit) {
            details = {
              amount: deposit.amount, // MYR amount requested
              amountBdt: deposit.amountBdt, // Calculated BDT amount
              exchangeRate: deposit.exchangeRate,
              currency: deposit.currency, // e.g. MYR
            };
            if (deposit.adminNote) details.adminNote = deposit.adminNote;
          }
        } else if (tx.type === 'WITHDRAWAL') {
          const withdrawal = await this.withdrawalRepo.findOne({ where: { id: tx.referenceId } });
          if (withdrawal) {
            details = {
              amountBDT: withdrawal.amountBDT,
              amountMYR: withdrawal.amountMYR,
              exchangeRateUsed: withdrawal.exchangeRateUsed,
              payoutMethod: withdrawal.payoutMethod,
            };
            if (withdrawal.adminNote) details.adminNote = withdrawal.adminNote;
          }
        }

        return {
          ...tx,
          ...details,
        };
      })
    );

    return {
      data: enrichedData,
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

    const [transactions, total] = await query.getManyAndCount();

    const enrichedData = await Promise.all(
      transactions.map(async (tx) => {
        let details: any = {};
        
        if (tx.type === 'DEPOSIT') {
          const deposit = await this.depositRepo.findOne({ where: { id: tx.referenceId } });
          if (deposit) {
            details = {
              amount: deposit.amount,
              amountBdt: deposit.amountBdt,
              exchangeRate: deposit.exchangeRate,
              currency: deposit.currency,
            };
            if (deposit.adminNote) details.adminNote = deposit.adminNote;
          }
        } else if (tx.type === 'WITHDRAWAL') {
          const withdrawal = await this.withdrawalRepo.findOne({ where: { id: tx.referenceId } });
          if (withdrawal) {
            details = {
              amountBDT: withdrawal.amountBDT,
              amountMYR: withdrawal.amountMYR,
              exchangeRateUsed: withdrawal.exchangeRateUsed,
              payoutMethod: withdrawal.payoutMethod,
            };
            if (withdrawal.adminNote) details.adminNote = withdrawal.adminNote;
          }
        }

        return {
          ...tx,
          ...details,
        };
      })
    );

    return {
      data: enrichedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
