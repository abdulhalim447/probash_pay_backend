import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Withdrawal problem', description: ' টিকেটের বিষয়' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: 'আমার withdrawal ৩ দিন হলো pending আছে।', description: ' বিস্তারিত মেসেজ' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
