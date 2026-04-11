import { Controller, Patch, Body, UseGuards, Get, Request, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Firebase (FCM) টোকেন সেভ করা (পুশ নোটিফিকেশন পাওয়ার জন্য)' })
  @ApiBody({ schema: { properties: { fcmToken: { type: 'string', example: 'fcm_token_here' } } } })
  @ApiResponse({ status: 200, description: 'টোকেন সফলভাবে সেভ হয়েছে' })
  saveFcmToken(@Request() req: any, @Body('fcmToken') fcmToken: string) {
    return this.notificationsService.saveFcmToken(req.user.id, fcmToken);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'নিজের সকল ইন-অ্যাপ নোটিফিকেশন চেক করা' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'লিস্ট সফলভাবে পাওয়া গেছে' })
  async getUserNotifications(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.notificationsService.getUserNotifications(req.user.id, page, limit);
    return {
      message: 'Notifications fetched',
      ...result,
    };
  }
}
