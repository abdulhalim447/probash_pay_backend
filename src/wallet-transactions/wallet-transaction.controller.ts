import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { WalletTransactionService } from './wallet-transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller()
export class WalletTransactionController {
  constructor(private readonly walletTransactionService: WalletTransactionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('transactions/my')
  @ApiOperation({ summary: 'নিজের সব ওয়ালেট ট্রানজ্যাকশন হিস্টোরি (ডিপোজিট, উইথড্রয়াল, রিফান্ড)' })
  @ApiResponse({ status: 200, description: 'হিস্টোরি সফলভাবে পাওয়া গেছে' })
  async getMyTransactions(@Req() req) {
    const userId = req.user.id.toString();
    const transactions = await this.walletTransactionService.getUserTransactions(userId);
    return {
      message: 'Transactions fetched successfully',
      data: transactions,
    };
  }

  @ApiTags('Admin / Transactions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/transactions')
  @ApiOperation({ summary: 'এডমিন: পুরো সিস্টেমের সকল ট্রানজ্যাকশন দেখা' })
  @ApiQuery({ name: 'userId', required: false, description: 'নির্দিষ্ট ইউজারের জন্য ফিল্টার' })
  @ApiQuery({ name: 'type', required: false, description: 'টাইপ: DEPOSIT, WITHDRAWAL, REFUND' })
  @ApiQuery({ name: 'status', required: false, description: 'স্ট্যাটাস: PENDING, SUCCESS, REJECTED' })
  async getAllTransactions(
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const transactions = await this.walletTransactionService.getAllTransactions({
      userId,
      type,
      status,
    });
    return {
      message: 'All transactions fetched',
      data: transactions,
    };
  }
}
