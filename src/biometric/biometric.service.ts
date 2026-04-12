import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { BiometricKey } from './entities/biometric-key.entity';
import { BiometricChallenge } from './entities/biometric-challenge.entity';
import { RegisterBiometricDto } from './dto/register-biometric.dto';
import { VerifyBiometricDto } from './dto/verify-biometric.dto';

@Injectable()
export class BiometricService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(BiometricKey)
    private readonly biometricKeyRepo: Repository<BiometricKey>,
    @InjectRepository(BiometricChallenge)
    private readonly challengeRepo: Repository<BiometricChallenge>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Helper: Generate random challenge ───
  private generateChallenge(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  // ─── Helper: Verify RSA signature ───
  private verifySignature(publicKey: string, challenge: string, signature: string): boolean {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(challenge);
      verify.end();
      return verify.verify(publicKey, Buffer.from(signature, 'base64'));
    } catch {
      return false;
    }
  }

  // ─── Helper: Generate JWT tokens ───
  private async generateUserTokens(userId: string, phone: string) {
    const payload = { sub: userId, phone, role: 'user' };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
    });
    return { accessToken, refreshToken };
  }

  // ─── API 1: Get challenge (for logged-in user → setup fingerprint) ───
  async getChallenge(userId: string): Promise<{ challengeId: string; challenge: string }> {
    const challenge = this.generateChallenge();
    const saved = this.challengeRepo.create({ userId, challenge });
    const result = await this.challengeRepo.save(saved);
    return { challengeId: result.id, challenge: result.challenge };
  }

  // ─── API 2: Register fingerprint (for logged-in user) ───
  async registerBiometric(userId: string, dto: RegisterBiometricDto): Promise<{ success: boolean; message: string }> {
    // Find and validate the challenge
    const challengeRecord = await this.challengeRepo.findOne({ where: { id: dto.challengeId } });
    if (!challengeRecord) throw new NotFoundException('Challenge not found');
    if (challengeRecord.isUsed) throw new BadRequestException('Challenge has already been used');
    if (new Date() > challengeRecord.expiresAt) throw new BadRequestException('Challenge has expired');
    if (challengeRecord.userId !== userId) throw new UnauthorizedException('Challenge mismatch');

    // Verify the signature with the provided public key
    const isValid = this.verifySignature(dto.publicKey, challengeRecord.challenge, dto.signature);
    if (!isValid) throw new UnauthorizedException('Invalid signature');

    // Deactivate any existing key for same device
    await this.biometricKeyRepo.update(
      { userId, deviceId: dto.deviceId },
      { isActive: false },
    );

    // Save the new biometric key
    const biometricKey = this.biometricKeyRepo.create({
      userId,
      publicKey: dto.publicKey,
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
    });
    await this.biometricKeyRepo.save(biometricKey);

    // Mark challenge as used
    challengeRecord.isUsed = true;
    await this.challengeRepo.save(challengeRecord);

    return { success: true, message: 'Biometric registered successfully' };
  }

  // ─── API 3: Get challenge for login (no auth needed) ───
  async getChallengeForLogin(userId: string): Promise<{ challengeId: string; challenge: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.status === 'blocked') throw new UnauthorizedException('Your account is blocked');
    if (user.status === 'pending') throw new UnauthorizedException('Your account is pending verification');

    const challenge = this.generateChallenge();
    const saved = this.challengeRepo.create({ userId, challenge });
    const result = await this.challengeRepo.save(saved);
    return { challengeId: result.id, challenge: result.challenge };
  }

  // ─── API 4: Verify fingerprint + Login (returns JWT) ───
  async verifyBiometric(dto: VerifyBiometricDto) {
    // Find and validate the challenge
    const challengeRecord = await this.challengeRepo.findOne({
      where: { id: dto.challengeId, userId: dto.userId },
    });
    if (!challengeRecord) throw new NotFoundException('Challenge not found');
    if (challengeRecord.isUsed) throw new BadRequestException('Challenge has already been used');
    if (new Date() > challengeRecord.expiresAt) throw new BadRequestException('Challenge has expired');

    // Find the active biometric key for this device
    const biometricKey = await this.biometricKeyRepo.findOne({
      where: { userId: dto.userId, deviceId: dto.deviceId, isActive: true },
    });
    if (!biometricKey) throw new NotFoundException('No registered fingerprint found for this device');

    // Verify the signature using the stored public key
    const isValid = this.verifySignature(biometricKey.publicKey, challengeRecord.challenge, dto.signature);
    if (!isValid) throw new UnauthorizedException('Fingerprint verification failed');

    // Mark challenge as used
    challengeRecord.isUsed = true;
    await this.challengeRepo.save(challengeRecord);

    // Get user details
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    // Generate JWT tokens
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

  // ─── API 5: Deactivate a biometric device ───
  async deactivateDevice(userId: string, deviceId: string): Promise<{ success: boolean }> {
    const key = await this.biometricKeyRepo.findOne({
      where: { userId, deviceId, isActive: true },
    });
    if (!key) throw new NotFoundException('Device not found or already deactivated');

    key.isActive = false;
    await this.biometricKeyRepo.save(key);
    return { success: true };
  }

  // ─── API 6: List all active devices for the user ───
  async getDevices(userId: string): Promise<any[]> {
    const keys = await this.biometricKeyRepo.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
    return keys.map((k) => ({
      id: k.id,
      deviceId: k.deviceId,
      deviceName: k.deviceName,
      createdAt: k.createdAt,
    }));
  }
}
