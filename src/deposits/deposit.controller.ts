import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { DepositStatus } from './deposit.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Deposits')
@ApiBearerAuth('access-token')
@Controller()
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @UseGuards(JwtAuthGuard)
  @Post('deposits')
  @ApiOperation({ summary: 'ডিপোজিট রিকোয়েস্ট সাবমিট করা' })
  @ApiResponse({ status: 201, description: 'ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে' })
  async createDeposit(@Req() req, @Body() dto: CreateDepositDto) {
    const userId = req.user.id.toString();
    const deposit = await this.depositService.createDeposit(userId, dto);
    return {
      message: 'Deposit request submitted successfully',
      data: deposit,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('deposits/my')
  @ApiOperation({ summary: 'ইউজারের নিজের করা আগের সব ডিপোজিট দেখা' })
  @ApiResponse({ status: 200, description: 'লিস্ট সফলভাবে পাওয়া গেছে' })
  async getMyDeposits(@Req() req) {
    const userId = req.user.id.toString();
    const deposits = await this.depositService.getMyDeposits(userId);
    return {
      message: 'Deposits fetched successfully',
      data: deposits,
    };
  }

  @ApiTags('Admin / Deposits')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/deposits')
  @ApiOperation({ summary: 'এডমিন: সব ইউজারের ডিপোজিট রিকোয়েস্ট দেখা' })
  @ApiQuery({ name: 'status', required: false, description: 'ফিল্টার: PENDING, SUCCESS, REJECTED' })
  async getAllDeposits(@Query('status') status?: string) {
    const deposits = await this.depositService.getAllDeposits(status);
    return {
      message: 'All deposits fetched',
      data: deposits,
    };
  }

  @ApiTags('Admin / Deposits')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/deposits/:id')
  @ApiOperation({ summary: 'এডমিন: ডিপোজিট আইডি দিয়ে বিস্তারিত তথ্য দেখা' })
  @ApiParam({ name: 'id', description: 'ডিপোজিট আইডি' })
  async getDepositById(@Param('id') id: string) {
    const deposit = await this.depositService.getDepositById(id);
    return {
      message: 'Deposit fetched',
      data: deposit,
    };
  }

  @ApiTags('Admin / Deposits')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/deposits/:id/approve')
  @ApiOperation({ summary: 'এডমিন: ডিপোজিট রিকোয়েস্ট অ্যাপ্রুভ করা (ওয়ালেটে ব্যালেন্স বাড়বে)' })
  @ApiParam({ name: 'id', description: 'ডিপোজিট আইডি' })
  async approveDeposit(@Param('id') id: string, @Req() req) {
    const adminId = req.user.id.toString();
    const deposit = await this.depositService.reviewDeposit(
      id,
      adminId,
      DepositStatus.SUCCESS,
    );
    return {
      message: 'Deposit approved successfully',
      data: deposit,
    };
  }

  @ApiTags('Admin / Deposits')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/deposits/:id/reject')
  @ApiOperation({ summary: 'এডমিন: ডিপোজিট রিকোয়েস্ট রিজেক্ট করা' })
  @ApiParam({ name: 'id', description: 'ডিপোজিট আইডি' })
  @ApiBody({ schema: { properties: { adminNote: { type: 'string', example: 'ভুল রিকোয়েস্ট' } } } })
  async rejectDeposit(
    @Param('id') id: string,
    @Req() req,
    @Body('adminNote') adminNote: string,
  ) {
    const adminId = req.user.id.toString();
    const deposit = await this.depositService.reviewDeposit(
      id,
      adminId,
      DepositStatus.REJECTED,
      adminNote,
    );
    return {
      message: 'Deposit rejected successfully',
      data: deposit,
    };
  }
}
