import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin / Dashboard')
@ApiBearerAuth('access-token')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'এডমিন ড্যাশবোর্ড স্ট্যাটিসটিকস (মোট ইউজার, ব্যালেন্স, ডিপোজিট ট্রানজ্যাকশন ইত্যাদি)' })
  @ApiResponse({ status: 200, description: 'ড্যাশবোর্ড তথ্য সফলভাবে পাওয়া গেছে' })
  async getDashboardStats() {
    return await this.dashboardService.getStats();
  }
}
