import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, BeforeInsert, Index,
} from 'typeorm';

@Entity('biometric_challenges')
export class BiometricChallenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 512 })
  challenge: string;

  @Column({ default: false, name: 'is_used' })
  isUsed: boolean;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @BeforeInsert()
  setExpiry() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // expire in 5 minutes
    this.expiresAt = now;
  }
}
