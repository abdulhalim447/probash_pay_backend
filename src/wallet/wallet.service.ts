import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async createWallet(userId: string): Promise<Wallet> {
    const existingWallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (existingWallet) {
      return existingWallet;
    }

    const newWallet = this.walletRepository.create({
      userId,
      balance: 0,
      currency: 'BDT',
      isActive: true,
    });

    return await this.walletRepository.save(newWallet);
  }

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException(`Wallet for user ID ${userId} not found`);
    }
    return wallet;
  }

  async addBalance(userId: string, amount: number): Promise<void> {
    await this.walletRepository
      .createQueryBuilder()
      .update(Wallet)
      .set({
        balance: () => `balance + ${amount}`,
      })
      .where('user_id = :userId', { userId })
      .execute();
  }

  // ─── Set Exact Balance (for admin) ───
  async setBalance(userId: string, newBalance: number): Promise<void> {
    await this.walletRepository
      .createQueryBuilder()
      .update(Wallet)
      .set({ balance: newBalance })
      .where('user_id = :userId', { userId })
      .execute();
  }

  // ─── Deduct Balance (for withdrawals) ───
  async deductBalance(userId: string, amount: number): Promise<void> {
    const wallet = await this.getWalletByUserId(userId);

    if (Number(wallet.balance) < amount) {
      throw new BadRequestException(
        `Insufficient balance. Current: ${wallet.balance} BDT, Required: ${amount} BDT`,
      );
    }

    await this.walletRepository
      .createQueryBuilder()
      .update(Wallet)
      .set({
        balance: () => `balance - ${amount}`,
      })
      .where('user_id = :userId AND balance >= :amount', { userId, amount })
      .execute();
  }

  // ─── Refund Balance (for rejected withdrawals) ───
  async refundBalance(userId: string, amount: number): Promise<void> {
    await this.walletRepository
      .createQueryBuilder()
      .update(Wallet)
      .set({
        balance: () => `balance + ${amount}`,
      })
      .where('user_id = :userId', { userId })
      .execute();
  }

  // ─── Get Wallet Balance ───
  async getWalletBalance(userId: string) {
    const wallet = await this.getWalletByUserId(userId);
    const balance = Number(wallet.balance);
    const exchangeRate = await this.exchangeRateService.getCurrentRate();

    return {
      balance: parseFloat(balance.toFixed(2)),
      currency: wallet.currency,
      display: `${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`,
      exchangeRate: Number(exchangeRate),
    };
  }
}
