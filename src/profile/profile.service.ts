import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { WalletService } from '../wallet/wallet.service';
import { AppSettingsService } from '../app-settings/app-settings.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly walletService: WalletService,
    private readonly appSettingsService: AppSettingsService,
  ) {}

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const wallet = await this.walletService.getWalletByUserId(userId);
    const exchangeRate = await this.appSettingsService.getExchangeRate();

    const balanceMYR = Number(wallet.balance);
    const balanceBDT = balanceMYR * exchangeRate;

    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      wallet: {
        balanceMYR,
        balanceBDT,
        currency: 'MYR',
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    if (dto.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    return await this.userRepo.save(user);
  }

  async changePin(userId: string, dto: ChangePinDto): Promise<{ message: string }> {
    if (dto.newPin !== dto.confirmPin) {
      throw new BadRequestException('PINs do not match');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const pinMatch = await bcrypt.compare(dto.currentPin, user.pin);
    if (!pinMatch) {
      throw new BadRequestException('Current PIN is incorrect');
    }

    user.pin = await bcrypt.hash(dto.newPin, 10);
    await this.userRepo.save(user);

    return { message: 'PIN changed successfully' };
  }

  async getAllUsers(): Promise<any[]> {
    const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
    const result: any[] = [];
    
    for (const user of users) {
      const wallet = await this.walletService.getWalletByUserId(user.id);
      result.push({
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        wallet: {
          balanceMYR: Number(wallet.balance),
        },
      });
    }

    return result;
  }

  async toggleUserActive(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.isActive = !user.isActive;
    
    // Align legacy status field
    if (!user.isActive) {
      user.status = 'blocked' as any;
    } else {
      user.status = 'active' as any;
    }

    return await this.userRepo.save(user);
  }
}
