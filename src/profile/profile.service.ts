import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { encryptPin, decryptPin, isBcryptHash } from '../common/utils/crypto.util';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { AdminEditUserDto } from './dto/admin-edit-user.dto';
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
  ) { }

  async getProfile(userId: string, isAdmin = false): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const wallet = await this.walletService.getWalletByUserId(userId);

    const profile: any = {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
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

    // Admin হলে ডিক্রিপ্টেড PIN যোগ করুন
    if (isAdmin) {
      profile.pin = isBcryptHash(user.pin)
        ? 'ঊদ্ধারযোগ্য নয় (পুরনো bcrypt) — এডমিন থেকে পিন রিসেট করুন'
        : decryptPin(user.pin);
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
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

    // পুরনো bcrypt বা নতুন AES দুটো-ই সাপোর্ট
    let pinMatch: boolean;
    if (isBcryptHash(user.pin)) {
      pinMatch = await bcrypt.compare(dto.currentPin, user.pin);
    } else {
      pinMatch = decryptPin(user.pin) === dto.currentPin;
    }
    if (!pinMatch) {
      throw new BadRequestException('Current PIN is incorrect');
    }

    user.pin = encryptPin(dto.newPin);
    await this.userRepo.save(user);

    return { message: 'PIN changed successfully' };
  }

  async getAllUsers(page: number = 1, limit: number = 20, search?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const searchTerm = search?.trim();

    const whereCondition = searchTerm
      ? [
        { fullName: ILike(`%${searchTerm}%`) },
        { phone: ILike(`%${searchTerm}%`) },
      ]
      : {};

    const [users, total] = await this.userRepo.findAndCount({
      where: whereCondition,
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
        // অ্যাডমিন API — ডিক্রিপ্টেড PIN দেখাবে
        pin: isBcryptHash(user.pin)
          ? 'রিসেট দরকার (পুরনো)'
          : decryptPin(user.pin),
        status: user.status,
        kycStatus: user.kycStatus,
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

  async adminEditUser(userId: string, dto: AdminEditUserDto): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.kycStatus) user.kycStatus = dto.kycStatus;

    if (dto.status) {
      user.status = dto.status;
      user.isActive = dto.status === 'active' as any;
    }

    if (dto.pin) {
      user.pin = encryptPin(dto.pin);
    }

    await this.userRepo.save(user);

    if (dto.walletBalance !== undefined && dto.walletBalance !== null) {
      await this.walletService.setBalance(userId, dto.walletBalance);
    }

    return this.getProfile(userId, true);
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Use query runner / transaction to delete all related data safely to avoid foreign key constraints
    await this.userRepo.manager.transaction(async (manager) => {
      // 1. Delete ticket replies
      await manager.query(`DELETE FROM ticket_replies WHERE sender_id = $1`, [userId]).catch(() => { });

      // 2. Delete support tickets
      await manager.query(`DELETE FROM support_tickets WHERE user_id = $1`, [userId]).catch(() => { });

      // 3. Delete notifications
      await manager.query(`DELETE FROM notifications WHERE "userId" = $1`, [userId]).catch(() => { });

      // 4. Delete withdrawals
      await manager.query(`DELETE FROM withdrawals WHERE user_id = $1`, [userId]).catch(() => { });

      // 5. Delete deposits
      await manager.query(`DELETE FROM deposits WHERE user_id = $1`, [userId]).catch(() => { });

      // 6. Delete wallet transactions
      await manager.query(`DELETE FROM wallet_transactions WHERE user_id = $1`, [userId]).catch(() => { });

      // 7. Delete wallet
      await manager.query(`DELETE FROM wallets WHERE user_id = $1`, [userId]).catch(() => { });

      // Finally, delete the user
      await manager.delete(User, userId);
    });

    return { message: 'User deleted successfully' };
  }
}
