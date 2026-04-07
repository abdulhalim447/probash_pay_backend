import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from './support-ticket.entity';
import { TicketReply } from './ticket-reply.entity';
import { SupportTicketsService } from './support-tickets.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { SupportTicketsController } from './support-tickets.controller';
import { AdminSupportTicketsController } from '../admin/admin-support-tickets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicket, TicketReply]),
    NotificationsModule,
  ],
  controllers: [SupportTicketsController, AdminSupportTicketsController],
  providers: [SupportTicketsService],
  exports: [SupportTicketsService],
})
export class SupportTicketsModule {}
