import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SubscriptionTier } from './subscription.entity';

@Entity('subscription_plans')
@Unique(['tier'])
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({
    type: 'enum',
    enum: SubscriptionTier,
  })
  tier: SubscriptionTier;

  @Column({ type: 'int' })
  maxBrands: number;

  @Column({ type: 'int' })
  maxConfigsPerBrand: number;

  // Stored as JSON array of feature enum string values
  @Column({ type: 'jsonb', nullable: true })
  features?: string[] | null;
}


