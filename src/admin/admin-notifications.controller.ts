import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  sendToUser(
    @Body('userId') userId: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    return this.notificationsService.sendToUser(userId, title, body, NotificationType.MANUAL);
  }

  @Post('broadcast')
  sendBroadcast(
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    return this.notificationsService.sendBroadcast(title, body);
  }

  @Get()
  getNotificationHistory(@Query('page') page: string = '1') {
    return this.notificationsService.getNotificationHistory(parseInt(page, 10));
  }
}
