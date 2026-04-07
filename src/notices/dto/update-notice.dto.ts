import { PartialType } from '@nestjs/mapped-types';
import { CreateNoticeDto } from './create-notice.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNoticeDto extends PartialType(CreateNoticeDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
