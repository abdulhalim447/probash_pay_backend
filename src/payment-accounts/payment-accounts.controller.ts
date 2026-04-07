import { Controller, Get } from '@nestjs/common';
import { PaymentAccountsService } from './payment-accounts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Accounts')
@Controller('payment-accounts')
export class PaymentAccountsController {
  constructor(private readonly paymentAccountsService: PaymentAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'ডিপোজিটের জন্য অ্যাপের অ্যাক্টিভ পেমেন্ট অ্যাকাউন্টগুলো দেখা' })
  @ApiResponse({ status: 200, description: 'লিস্ট সফলভাবে পাওয়া গেছে' })
  async getActiveAccounts() {
    return await this.paymentAccountsService.findActive();
  }
}
