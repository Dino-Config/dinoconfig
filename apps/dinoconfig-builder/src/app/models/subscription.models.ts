export interface SubscriptionStatus {
  tier: 'free' | 'starter' | 'pro' | 'custom';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  limits: {
    maxBrands: number;
    maxConfigsPerBrand: number;
  };
  features: Record<string, boolean>;
  currentPeriodEnd?: string;
  isActive: boolean;
}

export interface LimitViolationsResult extends SubscriptionStatus {
  hasViolations: boolean;
  violations: LimitViolation[];
}

export interface LimitViolation {
  type: 'brands' | 'configs';
  current: number;
  limit: number;
  message: string;
}

