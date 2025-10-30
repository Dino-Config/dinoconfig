import { useState, useEffect, useCallback } from 'react';
import { subscriptionService, SubscriptionStatus } from '../services/subscription.service';
import { Feature } from '../types/features';

export const useFeatures = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscription(status);
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setError('Failed to load subscription features');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Listen for subscription changes
  useEffect(() => {
    const handleSubscriptionChange = () => {
      loadSubscription();
    };

    window.addEventListener('subscriptionChanged', handleSubscriptionChange);
    
    return () => {
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
    };
  }, [loadSubscription]);

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
    reload: loadSubscription,
  };
};

