import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './support-ticket.entity';
import { TicketReply } from './ticket-reply.entity';
import { TicketStatus } from './enums/ticket-status.enum';
import { SenderType } from './enums/sender-type.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
    @InjectRepository(TicketReply)
    private readonly replyRepository: Repository<TicketReply>,
  ) {}

  async createTicket(userId: string, dto: CreateTicketDto): Promise<SupportTicket> {
    const ticket = this.ticketRepository.create({
      userId,
      subject: dto.subject,
      message: dto.message,
      status: TicketStatus.OPEN,
    });
    return await this.ticketRepository.save(ticket);
  }

  async getMyTickets(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.ticketRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['replies'],
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyTicketById(userId: string, ticketId: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, userId },
      relations: ['replies', 'user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async addReply(
    ticketId: string,
    senderId: string,
    senderType: SenderType,
    message: string,
  ): Promise<TicketReply> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Cannot reply to a closed ticket');
    }

    const reply = this.replyRepository.create({
      ticketId,
      senderId,
      senderType,
      message,
    });

    const savedReply = await this.replyRepository.save(reply);

    // If sender is USER, update status to IN_PROGRESS (if it was OPEN) or keep IN_PROGRESS
    // Prompt says: senderType USER হলে ticket status OPEN → IN_PROGRESS update করো
    if (senderType === SenderType.USER && ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
      await this.ticketRepository.save(ticket);
    }

    return savedReply;
  }

  async getAllTickets(page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.ticketRepository.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketById(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['replies', 'user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async updateStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);
    ticket.status = status;
    return await this.ticketRepository.save(ticket);
  }
}
