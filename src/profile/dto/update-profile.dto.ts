import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'ইউজারের পুরো নাম', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', description: 'প্রোফাইল পিকচার URL', required: false })
  @IsOptional()
  @IsString()
  profilePhoto?: string;
}
