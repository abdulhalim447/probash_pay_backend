import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CompleteWithdrawalDto {
  @ApiProperty({ example: 'TXN123456789', description: 'উইথড্রয়াল পেমেন্ট ট্রানজ্যাকশন আইডি' })
  @IsString()
  @IsNotEmpty({ message: 'Transaction reference is required' })
  transactionRef: string;

  @ApiProperty({ example: 'https://storage.link/receipt.jpg', description: 'পে-আউট রিসিট ইউআরএল (ঐচ্ছিক)', required: false })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({ example: 'পেমেন্ট সফলভাবে পাঠানো হয়েছে।', description: 'এডমিন নোট (ঐচ্ছিক)', required: false })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
