import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentAccount } from './payment-account.entity';
import { CreatePaymentAccountDto } from './dto/create-payment-account.dto';
import { UpdatePaymentAccountDto } from './dto/update-payment-account.dto';

@Injectable()
export class PaymentAccountsService {
  constructor(
    @InjectRepository(PaymentAccount)
    private readonly paymentAccountRepo: Repository<PaymentAccount>,
  ) {}

  async create(dto: CreatePaymentAccountDto): Promise<PaymentAccount> {
    const account = this.paymentAccountRepo.create(dto);
    return await this.paymentAccountRepo.save(account);
  }

  async findAll(): Promise<PaymentAccount[]> {
    return await this.paymentAccountRepo.find({
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findActive(): Promise<PaymentAccount[]> {
    return await this.paymentAccountRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PaymentAccount> {
    const account = await this.paymentAccountRepo.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Payment account with id ${id} not found`);
    }
    return account;
  }

  async update(id: string, dto: UpdatePaymentAccountDto): Promise<PaymentAccount> {
    const account = await this.findOne(id);
    Object.assign(account, dto);
    return await this.paymentAccountRepo.save(account);
  }

  async remove(id: string): Promise<{ message: string }> {
    const account = await this.findOne(id);
    await this.paymentAccountRepo.remove(account);
    return { message: 'Account deleted successfully' };
  }

  async toggleActive(id: string): Promise<PaymentAccount> {
    const account = await this.findOne(id);
    account.isActive = !account.isActive;
    return await this.paymentAccountRepo.save(account);
  }
}
