import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('token_blacklist')
export class TokenBlacklist {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  @Index()
  jti: string; // JWT ID (jti claim)

  @Column()
  userId: string; // Auth0 user ID

  @Column()
  tokenType: 'access' | 'refresh'; // Type of token

  @Column({ type: 'timestamp' })
  expiresAt: Date; // When the token would naturally expire

  @CreateDateColumn()
  blacklistedAt: Date; // When the token was blacklisted

  @Column({ type: 'text', nullable: true })
  reason?: string; // Reason for blacklisting (e.g., 'logout', 'security')
}
