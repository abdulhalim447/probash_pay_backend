import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BiometricController } from './biometric.controller';
import { BiometricService } from './biometric.service';
import { BiometricKey } from './entities/biometric-key.entity';
import { BiometricChallenge } from './entities/biometric-challenge.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BiometricKey, BiometricChallenge, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_EXPIRES') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [BiometricController],
  providers: [BiometricService],
})
export class BiometricModule {}
