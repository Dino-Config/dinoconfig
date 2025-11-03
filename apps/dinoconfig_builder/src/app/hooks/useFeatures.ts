import { useCallback } from 'react';
import { subscriptionService } from '../services/subscription.service';
import { Feature } from '../types/features';
import { useSubscription } from '../auth/subscription-context';

export const useFeatures = () => {
  const { subscription, loading, error, refreshSubscription } = useSubscription();

  const hasFeature = useCallback(
    (feature: Feature): boolean => {
      if (!subscription) return false;
      return subscriptionService.hasFeature(feature, subscription);
    },
    [subscription]
  );

  const hasAnyFeature = useCallback(
    (...features: Feature[]): boolean => {
      return features.some((feature) => hasFeature(feature));
    },
    [hasFeature]
  );

  const hasAllFeatures = useCallback(
    (...features: Feature[]): boolean => {
      return features.every((feature) => hasFeature(feature));
    },
    [hasFeature]
  );

  return {
    subscription,
    loading,
    error,
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    reload: refreshSubscription,
  };
};

