import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  // GET /admin/settings — সব settings দেখবে
  @Get()
  async getAllSettings() {
    const settings = await this.appSettingsService.getAllSettings();
    return {
      message: 'Settings fetched successfully',
      data: settings,
    };
  }

  // PATCH /admin/settings/:key — একটি setting update করবে
  @Patch(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body('value') value: string,
  ) {
    const setting = await this.appSettingsService.updateSetting(key, value);
    return {
      message: `Setting "${key}" updated successfully`,
      data: setting,
    };
  }
}
