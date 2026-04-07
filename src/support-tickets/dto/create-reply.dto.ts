import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty({ example: 'ধন্যবাদ, আমি অপেক্ষা করছি।', description: ' টিকেটের রিপ্লাই মেসেজ' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
