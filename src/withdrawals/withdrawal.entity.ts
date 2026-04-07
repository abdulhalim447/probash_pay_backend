import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum PayoutMethod {
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  ROCKET = 'ROCKET',
  UPAY = 'UPAY',
  BANK = 'BANK',
}

export enum PayoutType {
  CASHOUT = 'CASHOUT',
  SEND_MONEY = 'SEND_MONEY',
}

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  // ─── Amount Fields ───
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'amount_bdt' })
  amountBDT: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount_myr' })
  amountMYR: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    name: 'exchange_rate_used',
  })
  exchangeRateUsed: number;

  // ─── Payout Info ───
  @Column({ type: 'enum', enum: PayoutMethod, name: 'payout_method' })
  payoutMethod: PayoutMethod;

  @Column({
    type: 'enum',
    enum: PayoutType,
    name: 'payout_type',
    nullable: true,
  })
  payoutType: PayoutType;

  @Column({ name: 'receiver_name' })
  receiverName: string;

  @Column({ name: 'receiver_number', nullable: true })
  receiverNumber: string;

  // ─── Bank Fields (only for BANK method) ───
  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_branch', nullable: true })
  bankBranch: string;

  @Column({ name: 'bank_routing_number', nullable: true })
  bankRoutingNumber: string;

  // ─── Status & Admin ───
  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
    name: 'status',
  })
  status: WithdrawalStatus;

  @Column({ name: 'admin_note', nullable: true })
  adminNote: string;

  @Column({ name: 'transaction_ref', nullable: true })
  transactionRef: string;

  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
