import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @UseGuards(AdminGuard)
  sendToUser(
    @Body('userId') userId: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    return this.notificationsService.sendToUser(userId, title, body, NotificationType.MANUAL);
  }

  @Post('broadcast')
  @UseGuards(AdminGuard)
  sendBroadcast(
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    return this.notificationsService.sendBroadcast(title, body);
  }

  @Get()
  @UseGuards(AdminGuard)
  getNotificationHistory(@Query('page') page: string = '1') {
    return this.notificationsService.getNotificationHistory(parseInt(page, 10));
  }
}
