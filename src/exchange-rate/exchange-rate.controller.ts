import { Controller, Get } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Exchange Rate')
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  @ApiOperation({ summary: 'বর্তমান এক্সচেঞ্জ রেট (MYR to BDT) দেখা' })
  @ApiResponse({ status: 200, description: 'রেট সফলভাবে পাওয়া গেছে' })
  async getCurrentRate() {
    const rate = await this.exchangeRateService.getCurrentRate();
    return {
      rate: Number(rate),
      from: 'MYR',
      to: 'BDT',
      display: `1 MYR = ${Number(rate).toFixed(2)} BDT`,
    };
  }
}
