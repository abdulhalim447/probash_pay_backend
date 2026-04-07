import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePinDto {
  @ApiProperty({ example: '123456', description: 'বর্তমান পিন' })
  @IsNotEmpty()
  @IsString()
  currentPin: string;

  @ApiProperty({ example: '654321', description: 'নতুন পিন (৪-৬ ডিজিট)' })
  @IsNotEmpty()
  @IsString()
  @Length(4, 6)
  newPin: string;

  @ApiProperty({ example: '654321', description: 'পিন নিশ্চিতকরণ' })
  @IsNotEmpty()
  @IsString()
  confirmPin: string;
}
