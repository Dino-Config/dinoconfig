import React, { useEffect, useState } from 'react';
import { subscriptionService, SubscriptionStatus } from '../services/subscription.service';
import './subscription-badge.scss';

export const SubscriptionBadge: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) {
    return null;
  }

  const tierClass = `subscription-badge subscription-badge--${subscription.tier}`;
  const displayName = subscriptionService.getTierDisplayName(subscription.tier);

  return (
    <div className={tierClass}>
      <span className="subscription-badge__tier">{displayName}</span>
    </div>
  );
};

