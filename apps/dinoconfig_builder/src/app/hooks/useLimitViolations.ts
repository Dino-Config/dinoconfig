import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSubscription } from '../auth/subscription-context';

export const useLimitViolations = () => {
  const { violations, loading, error, refreshSubscription } = useSubscription();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/subscription/success') {
      const timer = setTimeout(() => {
        refreshSubscription();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, refreshSubscription]);

  return {
    violations,
    loading,
    error,
    checkViolations: refreshSubscription
  };
};
