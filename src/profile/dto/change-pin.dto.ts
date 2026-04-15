import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePinDto {
  @ApiProperty({ example: '123456', description: 'বর্তমান পিন' })
  @IsNotEmpty()
  @IsString()
  currentPin: string;

  @ApiProperty({ example: '654321', description: 'নতুন পিন (নূন্যতম ৪ ডিজিট)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  newPin: string;

  @ApiProperty({ example: '654321', description: 'পিন নিশ্চিতকরণ' })
  @IsNotEmpty()
  @IsString()
  confirmPin: string;
}
