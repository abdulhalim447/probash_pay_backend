import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('exchange_rate_history')
export class ExchangeRateHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  rate: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    name: 'previous_rate',
  })
  previousRate: number;

  @Column({ type: 'int', nullable: true, name: 'changed_by_admin_id' })
  changedByAdminId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
