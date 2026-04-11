import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { IsNumber, Min } from 'class-validator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiProperty, ApiQuery } from '@nestjs/swagger';

export class UpdateExchangeRateDto {
  @ApiProperty({ example: 26.50, description: 'নতুন এক্সচেঞ্জ রেট (১ MYR = কত BDT)' })
  @IsNumber()
  @Min(0.0001)
  rate: number;
}

@ApiTags('Admin / Exchange Rate')
@ApiBearerAuth('access-token')
@Controller('admin/exchange-rate')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Post()
  @ApiOperation({ summary: 'নতুন এক্সচেঞ্জ রেট সেট করা' })
  @ApiResponse({ status: 201, description: 'রেট সফলভাবে আপডেট হয়েছে' })
  async setRate(@Req() req, @Body() dto: UpdateExchangeRateDto) {
    const adminId = Number(req.user.id);
    const historyRecord = await this.exchangeRateService.setRate(
      adminId,
      dto.rate,
    );
    return historyRecord;
  }

  @Get('history')
  @ApiOperation({ summary: 'এক্সচেঞ্জ রেট পরিবর্তনের ইতিহাস দেখা' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.exchangeRateService.getHistory(page, limit);
    return {
      message: 'Exchange rate history fetched',
      ...result,
    };
  }
}
