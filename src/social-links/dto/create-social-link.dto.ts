import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Platform } from '../enums/platform.enum';

export class CreateSocialLinkDto {
  @ApiProperty({ enum: Platform, example: Platform.WHATSAPP, description: 'সোশ্যাল মিডিয়া প্লাটফর্ম' })
  @IsNotEmpty()
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({ example: 'Customer Support', description: 'লিঙ্কের নাম বা লেবেল (ঐচ্ছিক)', required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: 'https://wa.me/60123456789', description: 'লিঙ্ক ইউআরএল' })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({ example: 1, description: 'প্রদর্শনের ক্রম (সর্টিং)', required: false })
  @IsOptional()
  displayOrder?: number;
}
