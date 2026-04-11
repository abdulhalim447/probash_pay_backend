import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Withdrawals')
@ApiBearerAuth('access-token')
@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  @ApiOperation({ summary: 'উইথড্রয়াল (টাকা উত্তোলন) রিকোয়েস্ট তৈরি করা' })
  @ApiResponse({ status: 201, description: 'উইথড্রয়াল রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে' })
  @ApiResponse({ status: 400, description: 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই' })
  async createWithdrawal(@Req() req, @Body() dto: CreateWithdrawalDto) {
    const userId = req.user.id.toString();
    const withdrawal = await this.withdrawalService.createWithdrawal(
      userId,
      dto,
    );
    return {
      message: 'Withdrawal request submitted successfully',
      data: withdrawal,
    };
  }

  @Get('my')
  @ApiOperation({ summary: 'নিজের করা আগের সব উইথড্রয়াল রিকোয়েস্ট দেখা' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'লিস্ট সফলভাবে পাওয়া গেছে' })
  async getMyWithdrawals(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.id.toString();
    const result = await this.withdrawalService.getMyWithdrawals(userId, page, limit);
    return {
      message: 'Withdrawals fetched successfully',
      ...result,
    };
  }

  @Get('my/:id')
  @ApiOperation({ summary: 'উইথড্রয়াল রিকোয়েস্টের বিস্তারিত স্ট্যাটাস দেখা' })
  @ApiParam({ name: 'id', description: 'উইথড্রয়াল আইডি' })
  @ApiResponse({ status: 200, description: 'তথ্য সফলভাবে পাওয়া গেছে' })
  async getMyWithdrawalById(@Req() req, @Param('id') id: string) {
    const userId = req.user.id.toString();
    const withdrawal = await this.withdrawalService.getMyWithdrawalById(
      userId,
      id,
    );
    return {
      message: 'Withdrawal fetched successfully',
      data: withdrawal,
    };
  }
}
