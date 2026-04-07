import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewDepositStatus {
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  REJECTED = 'REJECTED',
}

export class ReviewDepositDto {
  @IsEnum(ReviewDepositStatus)
  status: string;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
