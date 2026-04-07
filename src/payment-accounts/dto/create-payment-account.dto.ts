import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { AccountType } from '../enums/account-type.enum';
import { AccountCountry } from '../enums/account-country.enum';

export class CreatePaymentAccountDto {
  @ApiProperty({ enum: AccountType, example: AccountType.BANK_MY, description: 'অ্যাকাউন্টের ধরন (BANK_BD, BANK_MY, BKASH, NAGAD, etc.)' })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ example: 'Probash Pay Admin', description: 'অ্যাকাউন্ট হোল্ডারের নাম' })
  @IsNotEmpty()
  @IsString()
  accountHolderName: string;

  @ApiProperty({ example: '1234567890', description: 'অ্যাকাউন্ট নম্বর' })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'Maybank', description: 'ব্যাংকের নাম (ব্যাংক ট্রান্সফার এর জন্য)', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: 'Kuala Lumpur', description: 'শাখার নাম (ঐচ্ছিক)', required: false })
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiProperty({ example: '123456', description: 'রাউটিং নম্বর (ঐচ্ছিক)', required: false })
  @IsOptional()
  @IsString()
  routingNumber?: string;

  @ApiProperty({ enum: AccountCountry, example: AccountCountry.MY, description: 'অ্যাকাউন্টের দেশ (MY or BD)' })
  @IsEnum(AccountCountry)
  country: AccountCountry;

  @ApiProperty({ example: 1, description: 'প্রদর্শনের ক্রম (ঐচ্ছিক)', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
