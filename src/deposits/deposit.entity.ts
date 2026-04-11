import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DepositStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  REJECTED = 'REJECTED',
}

@Entity('deposits')
export class Deposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'sender_name', nullable: true })
  senderName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount_bdt', nullable: true })
  amountBdt: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'exchange_rate', nullable: true })
  exchangeRate: number;

  @Column({ default: 'MYR', name: 'currency' })
  currency: string;

  @Column({ name: 'bank_name' })
  bankName: string;

  @Column({ name: 'transaction_reference', nullable: true })
  transactionReference: string;

  @Column({ name: 'receipt_image_url', nullable: true })
  receiptImageUrl: string;

  @Column({
    type: 'enum',
    enum: DepositStatus,
    default: DepositStatus.PENDING,
    name: 'status',
  })
  status: DepositStatus;

  @Column({ name: 'admin_note', nullable: true })
  adminNote: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
