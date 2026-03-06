import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AccountEventType {
  ACCOUNT_CLOSED = 'ACCOUNT_CLOSED',
  ACCOUNT_RESTORED = 'ACCOUNT_RESTORED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
}

@Entity('account_events')
export class AccountEvent {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ nullable: true })
  accountId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'accountId' })
  account: User | null;

  @Column({ length: 50 })
  eventType: AccountEventType;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
