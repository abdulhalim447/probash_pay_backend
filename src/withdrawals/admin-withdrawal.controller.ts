import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CompleteWithdrawalDto } from './dto/complete-withdrawal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Admin / Withdrawals')
@ApiBearerAuth('access-token')
@Controller('admin/withdrawals')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminWithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Get()
  @ApiOperation({ summary: 'সব ইউজারের উইথড্রয়াল রিকোয়েস্ট লিস্ট দেখা' })
  @ApiQuery({ name: 'status', required: false, description: 'ফিল্টার: PENDING, PROCESSING, COMPLETED, REJECTED' })
  @ApiQuery({ name: 'userId', required: false, description: 'নির্দিষ্ট ইউজারের জন্য ফিল্টার' })
  async getAllWithdrawals(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const withdrawals = await this.withdrawalService.getAllWithdrawals({
      status,
      userId,
    });
    return {
      message: 'All withdrawals fetched',
      data: withdrawals,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'উইথড্রয়াল আইডি দিয়ে রিকোয়েস্টের বিস্তারিত দেখা' })
  @ApiParam({ name: 'id', description: 'উইথড্রয়াল আইডি' })
  async getWithdrawalById(@Param('id') id: string) {
    const withdrawal = await this.withdrawalService.getWithdrawalById(id);
    return {
      message: 'Withdrawal fetched',
      data: withdrawal,
    };
  }

  @Patch(':id/process')
  @ApiOperation({ summary: 'উইথড্রয়াল রিকোয়েস্ট প্রোসেসিং শুরু করা (PENDING -> PROCESSING)' })
  @ApiParam({ name: 'id', description: 'উইথড্রয়াল আইডি' })
  async processWithdrawal(@Param('id') id: string, @Req() req) {
    const adminId = req.user.id.toString();
    const withdrawal = await this.withdrawalService.processWithdrawal(
      id,
      adminId,
    );
    return {
      message: 'Withdrawal marked as processing',
      data: withdrawal,
    };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'উইথড্রয়াল রিকোয়েস্ট সম্পন্ন করা (PROCESSING -> COMPLETED)' })
  @ApiParam({ name: 'id', description: 'উইথড্রয়াল আইডি' })
  @ApiResponse({ status: 200, description: 'উইথড্রয়াল সফলভাবে সম্পন্ন হয়েছে এবং ইউজারকে নোটিফিকেশন পাঠানো হয়েছে' })
  async completeWithdrawal(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: CompleteWithdrawalDto,
  ) {
    const adminId = req.user.id.toString();
    const withdrawal = await this.withdrawalService.completeWithdrawal(
      id,
      adminId,
      dto,
    );
    return {
      message: 'Withdrawal completed successfully',
      data: withdrawal,
    };
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'উইথড্রয়াল রিকোয়েস্ট রিজেক্ট করা (টাকা অটোমেটিক ওয়ালেটে ফেরত যাবে)' })
  @ApiParam({ name: 'id', description: 'উইথড্রয়াল আইডি' })
  @ApiBody({ schema: { properties: { adminNote: { type: 'string', example: 'ভুল পেমেন্ট তথ্য' } } } })
  @ApiResponse({ status: 200, description: 'রিকোয়েস্ট রিজেক্ট হয়েছে এবং ব্যালেন্স রিফান্ড হয়েছে' })
  async rejectWithdrawal(
    @Param('id') id: string,
    @Req() req,
    @Body('adminNote') adminNote?: string,
  ) {
    const adminId = req.user.id.toString();
    const withdrawal = await this.withdrawalService.rejectWithdrawal(
      id,
      adminId,
      adminNote,
    );
    return {
      message: 'Withdrawal rejected and balance refunded',
      data: withdrawal,
    };
  }
}
