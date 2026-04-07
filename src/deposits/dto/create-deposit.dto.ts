import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  Min,
  Max,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateDepositDto {
  @ApiProperty({ example: 1000, description: 'ডিপোজিটের পরিমাণ (RM/MYR)', minimum: 10, maximum: 50000 })
  @IsNumber()
  @Min(10)
  @Max(50000)
  amount: number;

  @ApiProperty({ example: 'Maybank', description: 'ব্যাংকের নাম যেখানে টাকা পাঠানো হয়েছে' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: 'John Doe', description: 'টাকা প্রেরণকারীর নাম (ঐচ্ছিক)', required: false })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiProperty({ example: 'TXN123456789', description: 'ট্রানজ্যাকশন রেফারেন্স নম্বর (রিসিট ইমেজ না থাকলে বাধ্যতামূলক)', required: false })
  @ValidateIf((o) => !o.receiptImageUrl)
  @IsNotEmpty({ message: 'Transaction reference or receipt image is required' })
  @IsString()
  transactionReference?: string;

  @ApiProperty({ example: 'https://storage.link/receipt.jpg', description: 'রিসিটের ছবি ইউআরএল (রেফারেন্স না থাকলে বাধ্যতামূলক)', required: false })
  @ValidateIf((o) => !o.transactionReference)
  @IsNotEmpty({ message: 'Transaction reference or receipt image is required' })
  @IsString()
  receiptImageUrl?: string;
}
