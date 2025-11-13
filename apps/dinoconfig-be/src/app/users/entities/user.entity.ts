import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne, Index } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { ApiKey } from '../../security/entities/api-key.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  auth0Id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Index({ unique: true })
  @Column({ type: 'citext' })
  email: string;

  @Column({ length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 100, nullable: true })
  state?: string;

  @Column({ length: 20, nullable: true })
  zip?: string;

  @Column({ length: 100, nullable: true })
  country?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 255, nullable: true })
  companyName?: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: 0 })
  verificationEmailResendCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Brand, brand => brand.user, { cascade: true })
  brands: Brand[];

  @OneToMany(() => ApiKey, apiKey => apiKey.user, { cascade: true })
  apiKeys: ApiKey[];
}