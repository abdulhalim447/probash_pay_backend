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
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Admin / Notices')
@ApiBearerAuth('access-token')
@Controller('admin/notices')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminNoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  @ApiOperation({ summary: 'সব নোটিশ লিস্ট দেখা (অ্যাক্টিভ ও ইনঅ্যাক্টিভ)' })
  async findAll() {
    return await this.noticesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'নতুন নোটিশ তৈরি করা' })
  @ApiResponse({ status: 201, description: 'সফলভাবে তৈরি হয়েছে' })
  async create(@Body() dto: CreateNoticeDto) {
    return await this.noticesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'আইডি দিয়ে নোটিশ আপডেট করা' })
  @ApiParam({ name: 'id', description: 'নোটিশ আইডি' })
  async update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return await this.noticesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'আইডি দিয়ে নোটিশ ডিলিট করা' })
  @ApiParam({ name: 'id', description: 'নোটিশ আইডি' })
  async remove(@Param('id') id: string) {
    return await this.noticesService.remove(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'নোটিশ অ্যাক্টিভ/ইনঅ্যাক্টিভ করা' })
  @ApiParam({ name: 'id', description: 'নোটিশ আইডি' })
  async toggleActive(@Param('id') id: string) {
    return await this.noticesService.toggleActive(id);
  }
}
