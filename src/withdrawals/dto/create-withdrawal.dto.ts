import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import { PayoutMethod, PayoutType } from '../withdrawal.entity';

export class CreateWithdrawalDto {
  @ApiProperty({ example: '123456', description: 'আপনার ৬ ডিজিটের পিন নম্বর (রেজিস্ট্রেশনে দেওয়া)' })
  @IsString()
  @IsNotEmpty({ message: 'PIN is required' })
  pin: string;

  @ApiProperty({ example: 1000, description: 'উত্তোলনের পরিমাণ (টাকা/BDT)', minimum: 1 })
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than 0' })
  amountBDT: number;

  @ApiProperty({ enum: PayoutMethod, example: PayoutMethod.BKASH, description: 'পেমেন্ট মেথড (BKASH, NAGAD, ROCKET, UPAY, or BANK)' })
  @IsEnum(PayoutMethod, {
    message: 'Payout method must be BKASH, NAGAD, ROCKET, UPAY, or BANK',
  })
  payoutMethod: PayoutMethod;

  // ─── Mobile Banking Fields ───
  @ApiProperty({ enum: PayoutType, example: PayoutType.CASHOUT, description: 'পেমেন্ট টাইপ (CASHOUT or SEND_MONEY)', required: false })
  @ValidateIf((o) => o.payoutMethod !== PayoutMethod.BANK)
  @IsEnum(PayoutType, { message: 'Payout type must be CASHOUT or SEND_MONEY' })
  payoutType?: PayoutType;

  @ApiProperty({ example: 'Mrs. Rohima', description: 'প্রাপকের নাম' })
  @IsString()
  @IsNotEmpty({ message: 'Receiver name is required' })
  receiverName: string;

  @ApiProperty({ example: '01711223344', description: 'প্রাপকের মোবাইল নম্বর (মোবাইল ব্যাংকিং এর জন্য)', required: false })
  @ValidateIf((o) => o.payoutMethod !== PayoutMethod.BANK)
  @IsString()
  @IsNotEmpty({ message: 'Receiver number is required for mobile banking' })
  receiverNumber?: string;

  // ─── Bank Fields ───
  @ApiProperty({ example: 'Sonali Bank', description: 'ব্যাংকের নাম (ব্যাংক ট্রান্সফার এর জন্য)', required: false })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.BANK)
  @IsString()
  @IsNotEmpty({ message: 'Bank name is required for bank transfer' })
  bankName?: string;

  @ApiProperty({ example: '1234567890', description: 'ব্যাংক অ্যাকাউন্ট নম্বর', required: false })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.BANK)
  @IsString()
  @IsNotEmpty({ message: 'Bank account number is required' })
  bankAccountNumber?: string;

  @ApiProperty({ example: 'Dhaka Main Branch', description: 'ব্যাংক ব্রাঞ্চ', required: false })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.BANK)
  @IsString()
  @IsNotEmpty({ message: 'Bank branch is required' })
  bankBranch?: string;

  @ApiProperty({ example: '123456789', description: 'রাউটিং নম্বর (ঐচ্ছিক)', required: false })
  @IsOptional()
  @IsString()
  bankRoutingNumber?: string;
}
