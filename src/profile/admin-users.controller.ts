import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
  Body,
  Delete,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AdminEditUserDto } from './dto/admin-edit-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Admin / Users')
@ApiBearerAuth('access-token')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'সব ইউজারের লিস্ট দেখা' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'নাম বা নাম্বার দিয়ে সার্চ' })
  @ApiResponse({ status: 200, description: 'লিস্ট সফলভাবে পাওয়া গেছে' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    const result = await this.profileService.getAllUsers(page, limit, search);
    return {
      message: 'Users fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'আইডি দিয়ে ইউজারের বিস্তারিত তথ্য দেখা' })
  @ApiResponse({ status: 200, description: 'ইউজার তথ্য সফলভাবে পাওয়া গেছে' })
  async getUserDetail(@Param('id') id: string) {
    return await this.profileService.getProfile(id, true);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'ইউজারকে ব্লক বা আনব্লক করা' })
  @ApiResponse({ status: 200, description: 'ইউজারের স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে' })
  async toggleUserActive(@Param('id') id: string) {
    return await this.profileService.toggleUserActive(id);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'পেন্ডিং ইউজারকে ভেরিফাই (অ্যাপ্রুভ) করা' })
  @ApiResponse({ status: 200, description: 'ইউজার সফলভাবে ভেরিফাই হয়েছে' })
  async verifyUser(@Param('id') id: string) {
    return await this.profileService.verifyUser(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'পেন্ডিং ইউজারকে রিজেক্ট (ব্লক) করা' })
  @ApiResponse({ status: 200, description: 'ইউজারকে রিজেক্ট করা হয়েছে' })
  async rejectUser(@Param('id') id: string) {
    return await this.profileService.rejectUser(id);
  }

  @Patch(':id/edit')
  @ApiOperation({ summary: 'অ্যাডমিন কর্তৃক ইউজারের ডাটা আপডেট (ব্যালেন্স, পিন সহ)' })
  @ApiResponse({ status: 200, description: 'ইউজারের তথ্য সফলভাবে আপডেট হয়েছে' })
  async editUser(@Param('id') id: string, @Body() dto: AdminEditUserDto) {
    return await this.profileService.adminEditUser(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'সম্পূর্ণভাবে ইউজার ডিলিট করা' })
  @ApiResponse({ status: 200, description: 'ইউজার সফলভাবে ডিলিট করা হয়েছে' })
  async deleteUser(@Param('id') id: string) {
    return await this.profileService.deleteUser(id);
  }
}
