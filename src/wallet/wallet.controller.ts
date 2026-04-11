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
    summary: 'ওয়ালেট ব্যালেন্স দেখা (BDT)',
    description: 'লগইনকৃত ইউজারের বর্তমান BDT ওয়ালেট ব্যালেন্স রিটার্ন করে।',
  })
  @ApiResponse({
    status: 200,
    description: 'ব্যালেন্স সফলভাবে পাওয়া গেছে',
    schema: {
      example: {
        message: 'Wallet balance fetched successfully',
        data: {
          balance: 13250.0,
          currency: 'BDT',
          display: '13,250.00 BDT',
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
