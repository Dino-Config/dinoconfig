import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { subscriptionService, SubscriptionStatus, LimitViolationsResult } from "../services/subscription.service";

type SubscriptionContextType = {
  subscription: SubscriptionStatus | null;
  violations: LimitViolationsResult | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  updateSubscriptionData: (data: LimitViolationsResult) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  violations: null,
  loading: false,
  error: null,
  refreshSubscription: async () => {},
  updateSubscriptionData: () => {},
});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [violations, setViolations] = useState<LimitViolationsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Get both subscription status and violations in one call
      const data = await subscriptionService.getSubscriptionWithViolations();
      
      // Extract subscription status from the combined response
      const subscriptionStatus: SubscriptionStatus = {
        tier: data.tier,
        status: data.status,
        limits: data.limits,
        features: data.features,
        currentPeriodEnd: data.currentPeriodEnd,
        isActive: data.isActive,
      };
      
      setSubscription(subscriptionStatus);
      setViolations(data);
    } catch (err: any) {
      console.error('Failed to load subscription:', err);
      setError('Failed to load subscription data');
      setSubscription(null);
      setViolations(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    await loadSubscription();
  }, [loadSubscription]);

  const updateSubscriptionData = useCallback((data: LimitViolationsResult) => {
    // Extract subscription status from the combined response
    const subscriptionStatus: SubscriptionStatus = {
      tier: data.tier,
      status: data.status,
      limits: data.limits,
      features: data.features,
      currentPeriodEnd: data.currentPeriodEnd,
      isActive: data.isActive,
    };
    
    // Update state synchronously in a single batch to ensure immediate UI update
    // Using a callback to ensure React batches these updates together
    setError(null);
    setLoading(false);
    setSubscription(subscriptionStatus);
    setViolations(data);
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Listen for subscription changes
  useEffect(() => {
    const handleSubscriptionChange = () => {
      // Add a small delay to ensure backend has processed the change
      setTimeout(() => {
        loadSubscription();
      }, 500);
    };

    window.addEventListener('subscriptionChanged', handleSubscriptionChange);
    
    return () => {
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
    };
  }, [loadSubscription]);

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        violations, 
        loading, 
        error, 
        refreshSubscription,
        updateSubscriptionData
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

