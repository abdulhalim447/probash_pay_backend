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
import { SocialLinksService } from './social-links.service';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Admin / Social Links')
@ApiBearerAuth('access-token')
@Controller('admin/social-links')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminSocialLinksController {
  constructor(private readonly socialLinksService: SocialLinksService) {}

  @Get()
  @ApiOperation({ summary: 'সব সোশ্যাল লিঙ্ক লিস্ট দেখা' })
  async findAll() {
    return await this.socialLinksService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'নতুন সোশ্যাল লিঙ্ক তৈরি করা' })
  @ApiResponse({ status: 201, description: 'সফলভাবে তৈরি হয়েছে' })
  async create(@Body() dto: CreateSocialLinkDto) {
    return await this.socialLinksService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'আইডি দিয়ে সোশ্যাল লিঙ্ক আপডেট করা' })
  @ApiParam({ name: 'id', description: 'সোশ্যাল লিঙ্ক আইডি' })
  async update(@Param('id') id: string, @Body() dto: UpdateSocialLinkDto) {
    return await this.socialLinksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'আইডি দিয়ে সোশ্যাল লিঙ্ক ডিলিট করা' })
  @ApiParam({ name: 'id', description: 'সোশ্যাল লিঙ্ক আইডি' })
  async remove(@Param('id') id: string) {
    return await this.socialLinksService.remove(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'সোশ্যাল লিঙ্ক অ্যাক্টিভ/ইনঅ্যাক্টিভ করা' })
  @ApiParam({ name: 'id', description: 'সোশ্যাল লিঙ্ক আইডি' })
  async toggleActive(@Param('id') id: string) {
    return await this.socialLinksService.toggleActive(id);
  }
}
