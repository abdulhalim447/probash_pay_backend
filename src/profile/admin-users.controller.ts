import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin / Users')
@ApiBearerAuth('access-token')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'সব ইউজারের লিস্ট দেখা' })
  @ApiResponse({ status: 200, description: 'লিস্ট সফলভাবে পাওয়া গেছে' })
  async getAllUsers() {
    return await this.profileService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'আইডি দিয়ে ইউজারের বিস্তারিত তথ্য দেখা' })
  @ApiResponse({ status: 200, description: 'ইউজার তথ্য সফলভাবে পাওয়া গেছে' })
  async getUserDetail(@Param('id') id: string) {
    return await this.profileService.getProfile(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'ইউজারকে ব্লক বা আনব্লক করা' })
  @ApiResponse({ status: 200, description: 'ইউজারের স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে' })
  async toggleUserActive(@Param('id') id: string) {
    return await this.profileService.toggleUserActive(id);
  }
}
