import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPinDto {
  @ApiProperty({ example: '123456', description: 'The 6-digit PIN of the user' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'PIN must be exactly 6 digits' })
  pin: string;
}
