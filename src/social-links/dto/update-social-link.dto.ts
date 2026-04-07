import { PartialType } from '@nestjs/mapped-types';
import { CreateSocialLinkDto } from './create-social-link.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSocialLinkDto extends PartialType(CreateSocialLinkDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
