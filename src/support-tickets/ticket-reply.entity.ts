import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SenderType } from './enums/sender-type.enum';

@Entity('ticket_replies')
export class TicketReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_id' })
  ticketId: string;

  // Using string-based relation for circular dependency
  @ManyToOne('SupportTicket', 'replies')
  @JoinColumn({ name: 'ticket_id' })
  ticket: any;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({ type: 'enum', enum: SenderType })
  senderType: SenderType;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
