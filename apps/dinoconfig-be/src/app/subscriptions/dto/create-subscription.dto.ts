import { IsEnum, IsOptional } from 'class-validator';
import { SubscriptionTier, SubscriptionStatus } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  stripeCustomerId?: string;

  @IsOptional()
  stripeSubscriptionId?: string;

  @IsOptional()
  stripePriceId?: string;
}

