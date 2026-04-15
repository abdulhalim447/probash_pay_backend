import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPinDto {
  @ApiProperty({ example: '1234', description: 'The PIN of the user (Min 4 digits)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'PIN must be at least 4 digits' })
  pin: string;
}
