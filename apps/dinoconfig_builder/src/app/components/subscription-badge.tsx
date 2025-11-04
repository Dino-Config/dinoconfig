import React from 'react';
import { subscriptionService } from '../services/subscription.service';
import { useSubscription } from '../auth/subscription-context';
import './subscription-badge.scss';

export const SubscriptionBadge: React.FC = () => {
  const { subscription, loading } = useSubscription();

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

