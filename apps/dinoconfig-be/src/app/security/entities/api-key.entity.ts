import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ unique: true, length: 64 })
  keyHash: string; // SHA-256 hash for secure storage and fast DB lookup

  @Column({ length: 100 })
  name: string;

  @Index()
  @Column()
  auth0Id: string;

  @ManyToOne(() => User, user => user.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'auth0Id', referencedColumnName: 'auth0Id' })
  user: User;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Scopes/permissions for future use
  @Column({ type: 'jsonb', nullable: true })
  scopes?: string[];
}

