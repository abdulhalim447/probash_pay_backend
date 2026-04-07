import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PaymentAccountsService } from './payment-accounts.service';
import { CreatePaymentAccountDto } from './dto/create-payment-account.dto';
import { UpdatePaymentAccountDto } from './dto/update-payment-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Admin / Payment Accounts')
@ApiBearerAuth('access-token')
@Controller('admin/payment-accounts')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminPaymentAccountsController {
  constructor(private readonly paymentAccountsService: PaymentAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'সব পেমেন্ট অ্যাকাউন্ট লিস্ট দেখা' })
  async findAll() {
    return await this.paymentAccountsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'নতুন পেমেন্ট অ্যাকাউন্ট তৈরি করা (ডিপোজিট রিসিভ করার জন্য)' })
  @ApiResponse({ status: 201, description: 'সফলভাবে তৈরি হয়েছে' })
  async create(@Body() dto: CreatePaymentAccountDto) {
    return await this.paymentAccountsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'আইডি দিয়ে পেমেন্ট অ্যাকাউন্ট আপডেট করা' })
  @ApiParam({ name: 'id', description: 'অ্যাকাউন্ট আইডি' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentAccountDto) {
    return await this.paymentAccountsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'আইডি দিয়ে পেমেন্ট অ্যাকাউন্ট ডিলিট করা' })
  @ApiParam({ name: 'id', description: 'অ্যাকাউন্ট আইডি' })
  async remove(@Param('id') id: string) {
    return await this.paymentAccountsService.remove(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'পেমেন্ট অ্যাকাউন্ট অ্যাক্টিভ/ইনঅ্যাক্টিভ করা' })
  @ApiParam({ name: 'id', description: 'অ্যাকাউন্ট আইডি' })
  async toggleActive(@Param('id') id: string) {
    return await this.paymentAccountsService.toggleActive(id);
  }
}
