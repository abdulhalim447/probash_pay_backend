import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { UserStatus, KycStatus } from '../../users/user.entity';

export class AdminEditUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '01712345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'newpin12', description: 'নতুন লগইন পিন', required: false })
  @IsOptional()
  @IsString()
  pin?: string;

  @ApiProperty({ example: 1000.50, description: 'ওয়ালেট ব্যালেন্স', required: false })
  @IsOptional()
  @IsNumber()
  walletBalance?: number;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ enum: KycStatus, required: false })
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;
}
