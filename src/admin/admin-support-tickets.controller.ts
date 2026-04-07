import { Controller, Get, Post, Body, UseGuards, Param, Patch, Request } from '@nestjs/common';
import { SupportTicketsService } from '../support-tickets/support-tickets.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateReplyDto } from '../support-tickets/dto/create-reply.dto';
import { SenderType } from '../support-tickets/enums/sender-type.enum';
import { TicketStatus } from '../support-tickets/enums/ticket-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Admin / Tickets')
@ApiBearerAuth('access-token')
@Controller('admin/support-tickets')
export class AdminSupportTicketsController {
  constructor(
    private readonly supportTicketsService: SupportTicketsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'সব টিকেট দেখা (সব ইউজারের)' })
  getAllTickets() {
    return this.supportTicketsService.getAllTickets();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'টিকেটের আইডি দিয়ে বিস্তারিত দেখা (পুরাতন রিপ্লাই ও ইউজার ইনফো সহ)' })
  getTicketById(@Param('id') id: string) {
    return this.supportTicketsService.getTicketById(id);
  }

  @Post(':id/reply')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'ইউজারের টিকেটে এডমিন রিপ্লাই দেওয়া' })
  @ApiResponse({ status: 201, description: 'এডমিন রিপ্লাই সফল হয়েছে এবং ইউজারকে নোটিফিকেশন পাঠানো হয়েছে' })
  async addReply(@Request() req: any, @Param('id') id: string, @Body() dto: CreateReplyDto) {
    const adminId = req.user.id.toString();
    const reply = await this.supportTicketsService.addReply(id, adminId, SenderType.ADMIN, dto.message);
    
    // Get ticket to get userId for notification
    const ticket = await this.supportTicketsService.getTicketById(id);
    
    // Trigger Notification
    try {
      await this.notificationsService.sendToUser(
        ticket.userId,
        'Support Reply Received 💬',
        'Admin has replied to your support ticket.',
        NotificationType.MANUAL,
      );
    } catch (error) {
      console.error('Failed to send support reply notification', error);
    }

    return reply;
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'টিকেটের স্ট্যাটাস পরিবর্তন করা (OPEN, IN_PROGRESS, CLOSED)' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'CLOSED'] } } } })
  updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
    return this.supportTicketsService.updateStatus(id, status);
  }
}
