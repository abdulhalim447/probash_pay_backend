import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_versions')
export class AppVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  versionName: string; // e.g., "2.0.1"

  @Column()
  versionCode: number; // e.g., 201

  @Column()
  apkUrl: string;

  @Column({ type: 'text', nullable: true })
  releaseNotes: string;

  @Column({ default: false })
  isForceUpdate: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
