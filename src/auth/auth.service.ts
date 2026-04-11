import {
  Injectable, UnauthorizedException,
  ConflictException, BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Admin } from '../admin/admin.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private walletService: WalletService,
  ) { }

  // ─── User Register ───
  async userRegister(phone: string, pin: string, fullName: string) {
    const exists = await this.userRepo.findOne({ where: { phone } });
    if (exists) throw new ConflictException('Phone number already registered');

    const hashedPin = await bcrypt.hash(pin, 10);
    const referralCode = 'PP' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = this.userRepo.create({
      phone,
      pin: hashedPin,
      fullName,
      referralCode,
    });

    const savedUser = await this.userRepo.save(user);
    await this.walletService.createWallet(savedUser.id.toString());

    return { message: 'Registration successful' };
  }

  // ─── User Login ───
  async userLogin(phone: string, pin: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new UnauthorizedException('Invalid phone or PIN');

    if (user.status === 'blocked')
      throw new UnauthorizedException('Your account is blocked');

    if (user.status === 'pending') {
      throw new UnauthorizedException({
        message: 'Your account is pending verification by the admin.',
        status: 'pending',
      });
    }

    const pinMatch = await bcrypt.compare(pin, user.pin);
    if (!pinMatch) throw new UnauthorizedException('Invalid phone or PIN');

    const tokens = await this.generateUserTokens(user.id, user.phone);
    await this.userRepo.update(user.id, { refreshToken: tokens.refreshToken });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        kycStatus: user.kycStatus,
        status: user.status,
      },
    };
  }

  // ─── Admin Login ───
  async adminLogin(email: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const passMatch = await bcrypt.compare(password, admin.password);
    if (!passMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateAdminTokens(admin.id, admin.email);
    await this.adminRepo.update(admin.id, { refreshToken: tokens.refreshToken });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  // ─── Generate User Tokens ───
  private async generateUserTokens(userId: string, phone: string) {
    const payload = { sub: userId, phone, role: 'user' };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
    });
    return { accessToken, refreshToken };
  }

  // ─── Generate Admin Tokens ───
  private async generateAdminTokens(adminId: number, email: string) {
    const payload = { sub: adminId, email, role: 'admin' };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
    });
    return { accessToken, refreshToken };
  }

  // ─── Seed Admin (first time) ───
  async seedAdmin() {
    const exists = await this.adminRepo.findOne({ where: { email: 'admin@probashpay.com' } });
    if (exists) return { message: 'Admin already exists' };

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = this.adminRepo.create({
      email: 'admin@probashpay.com',
      password: hashedPassword,
      name: 'Super Admin',
    });
    await this.adminRepo.save(admin);
    return { message: 'Admin created successfully' };
  }
}
