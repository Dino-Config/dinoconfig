import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { subscriptionService, LimitViolationsResult } from '../services/subscription.service';

export const useLimitViolations = () => {
  const [violations, setViolations] = useState<LimitViolationsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const checkViolations = async () => {
    try {
      setLoading(true);
      setError(null);
      // First refresh subscription status to ensure we have latest data
      await subscriptionService.refreshSubscriptionStatus();
      // Add a small delay to ensure backend has processed the refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      // Then check violations
      const result = await subscriptionService.checkLimitViolations();
      setViolations(result);
    } catch (err) {
      console.error('Failed to check limit violations:', err);
      setError('Failed to check subscription limits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkViolations();
  }, []);

  useEffect(() => {
    if (location.pathname === '/subscription/success') {
      const timer = setTimeout(() => {
        checkViolations();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Listen for subscription changes
  useEffect(() => {
    const handleSubscriptionChange = () => {
      // Add a delay to ensure all components have updated their subscription data
      setTimeout(() => {
        checkViolations();
      }, 1500);
    };

    window.addEventListener('subscriptionChanged', handleSubscriptionChange);
    
    return () => {
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
    };
  }, []);

  return {
    violations,
    loading,
    error,
    checkViolations
  };
};
