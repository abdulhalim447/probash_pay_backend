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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly walletService: WalletService,
    private readonly appSettingsService: AppSettingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const wallet = await this.walletService.getWalletByUserId(userId);

    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      profilePhoto: user.profilePhoto,
      status: user.status,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
      wallet: {
        balance: Number(wallet.balance),
        currency: wallet.currency,
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

  async getAllUsers(page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const data: any[] = [];
    for (const user of users) {
      const wallet = await this.walletService.getWalletByUserId(user.id);
      data.push({
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        wallet: {
          balance: Number(wallet.balance),
          currency: wallet.currency,
        },
      });
    }

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

  async verifyUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.status === 'active' as any) {
      throw new BadRequestException('User is already verified and active');
    }

    user.status = 'active' as any;
    user.isActive = true;

    const savedUser = await this.userRepo.save(user);

    // Trigger Push Notification
    try {
      await this.notificationsService.sendToUser(
        user.id,
        'Account Verified! 🎉',
        'Your account has been verified. You can now login and explore all features.',
        NotificationType.ACCOUNT_VERIFIED,
      );
    } catch (error) {
      console.error('Failed to send verification notification', error);
    }

    return savedUser;
  }

  async rejectUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.status = 'blocked' as any;
    user.isActive = false;

    const savedUser = await this.userRepo.save(user);

    // Trigger Push Notification
    try {
      await this.notificationsService.sendToUser(
        user.id,
        'Account Verification Failed ❌',
        'Unfortunately, your account verification has been rejected.',
        NotificationType.ACCOUNT_REJECTED,
      );
    } catch (error) {
      console.error('Failed to send rejection notification', error);
    }

    return savedUser;
  }
}
