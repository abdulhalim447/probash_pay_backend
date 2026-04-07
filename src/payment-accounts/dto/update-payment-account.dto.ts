import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentAccountDto } from './create-payment-account.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePaymentAccountDto extends PartialType(CreatePaymentAccountDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
