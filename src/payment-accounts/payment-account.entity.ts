import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountType } from './enums/account-type.enum';
import { AccountCountry } from './enums/account-country.enum';

@Entity('admin_payment_accounts')
export class PaymentAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @Column()
  accountHolderName: string;

  @Column()
  accountNumber: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  branchName: string;

  @Column({ nullable: true })
  routingNumber: string;

  @Column({ type: 'enum', enum: AccountCountry })
  country: AccountCountry;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
