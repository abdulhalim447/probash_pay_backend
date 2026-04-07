import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'ব্যবহারকারীর নিজের প্রোফাইল তথ্য দেখা' })
  @ApiResponse({ status: 200, description: 'প্রোফাইল তথ্য সফলভাবে পাওয়া গেছে' })
  async getProfile(@Req() req) {
    return await this.profileService.getProfile(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'প্রোফাইল তথ্য আপডেট করা (নাম, ইমেইল ইত্যাদি)' })
  @ApiResponse({ status: 200, description: 'প্রোফাইল সফলভাবে আপডেট হয়েছে' })
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return await this.profileService.updateProfile(req.user.id, dto);
  }

  @Patch('change-pin')
  @ApiOperation({ summary: 'লগইন পিন (PIN) পরিবর্তন করা' })
  @ApiResponse({ status: 200, description: 'পিন সফলভাবে পরিবর্তন হয়েছে' })
  @ApiResponse({ status: 400, description: 'বর্তমান পিন ভুল অথবা নতুন পিন ম্যাচ করেনি' })
  async changePin(@Req() req, @Body() dto: ChangePinDto) {
    return await this.profileService.changePin(req.user.id, dto);
  }
}
