import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'ইউজারের পুরো নাম', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'john@example.com', description: 'ইউজারের ইমেইল', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}
