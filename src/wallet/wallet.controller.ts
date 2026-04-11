import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Wallet')
@ApiBearerAuth('access-token')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  @ApiOperation({
    summary: 'ওয়ালেট ব্যালেন্স দেখা (MYR + BDT কনভার্টেড)',
    description:
      'লগইনকৃত ইউজারের ওয়ালেট ব্যালেন্স MYR এ এবং বর্তমান এক্সচেঞ্জ রেট অনুযায়ী BDT কনভার্টেড ব্যালেন্স সহ রিটার্ন করে।',
  })
  @ApiResponse({
    status: 200,
    description: 'ব্যালেন্স সফলভাবে পাওয়া গেছে',
    schema: {
      example: {
        message: 'Wallet balance fetched successfully',
        data: {
          balanceMYR: 500.0,
          balanceBDT: 13250.0,
          exchangeRate: 26.5,
          currency: 'MYR',
          display: '500.00 MYR ≈ 13,250.00 BDT',
        },
      },
    },
  })
  async getBalance(@Req() req) {
    const userId = req.user.id.toString();
    const data = await this.walletService.getWalletBalance(userId);
    return {
      message: 'Wallet balance fetched successfully',
      data,
    };
  }
}
