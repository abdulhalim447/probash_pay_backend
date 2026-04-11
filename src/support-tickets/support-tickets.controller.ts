import { Controller, Get, Post, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { SenderType } from './enums/sender-type.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tickets')
@ApiBearerAuth('access-token')
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'নতুন সাপোর্ট টিকেট তৈরি করা' })
  @ApiResponse({ status: 201, description: 'টিকেট সফলভাবে তৈরি হয়েছে' })
  createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.supportTicketsService.createTicket(req.user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'নিজের সব টিকেট দেখা' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getMyTickets(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.supportTicketsService.getMyTickets(req.user.id, page, limit);
    return {
      message: 'Tickets fetched successfully',
      ...result,
    };
  }

  @Get('my/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'টিকেটের আইডি দিয়ে বিস্তারিত দেখা (সাথে সব রিপ্লাই)' })
  getMyTicketById(@Request() req: any, @Param('id') id: string) {
    return this.supportTicketsService.getMyTicketById(req.user.id, id);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'টিকেটে রিপ্লাই দেওয়া' })
  @ApiResponse({ status: 201, description: 'রিপ্লাই সফলভাবে যোগ হয়েছে' })
  @ApiResponse({ status: 400, description: 'টিকেট ক্লোজড থাকলে রিপ্লাই দেওয়া যাবে না' })
  addReply(@Request() req: any, @Param('id') id: string, @Body() dto: CreateReplyDto) {
    return this.supportTicketsService.addReply(id, req.user.id, SenderType.USER, dto.message);
  }
}
