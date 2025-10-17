import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionService, SubscriptionStatus } from '../services/subscription.service';
import { Spinner } from '../components';
import './subscription-success.scss';

export const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Wait a moment for webhook to process, then fetch updated subscription
      setTimeout(() => {
        loadSubscriptionStatus();
      }, 2000);
    } else {
      setError('No session ID found');
      setLoading(false);
    }
  }, [searchParams]);

  const loadSubscriptionStatus = async () => {
    try {
      // First try to refresh the status from Stripe
      const status = await subscriptionService.refreshSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error('Failed to refresh subscription status, trying regular status:', error);
      try {
        // Fallback to regular status if refresh fails
        const status = await subscriptionService.getSubscriptionStatus();
        setSubscription(status);
      } catch (fallbackError) {
        console.error('Failed to load subscription status:', fallbackError);
        setError('Failed to load subscription details');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case 'starter':
        return [
          'Up to 5 brands',
          'Up to 10 configs per brand',
          'Basic SDK access',
          'Community support',
          '99.9% uptime SLA'
        ];
      case 'pro':
        return [
          'Up to 20 brands',
          'Up to 20 configs per brand',
          'All SDKs & APIs',
          'Advanced targeting',
          'Priority support',
          'Version history',
          'Team collaboration',
          '99.99% uptime SLA'
        ];
      case 'custom':
        return [
          'Unlimited brands & configs',
          'Everything in Pro',
          'SAML SSO',
          'Custom integrations',
          'Dedicated support',
          'On-premise option'
        ];
      default:
        return [
          'Basic features',
          'Community support'
        ];
    }
  };

  if (loading) {
    return (
      <div className="subscription-success">
        <div className="subscription-success__card subscription-success__card--loading">
          <Spinner text="Processing your subscription..." size="large" />
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="subscription-success">
        <div className="subscription-success__card">
          <div className="subscription-success__icon subscription-success__icon--error">⚠</div>
          <h1>Something went wrong</h1>
          <p>{error || 'Unable to load subscription details'}</p>
          <div className="subscription-success__actions">
            <button 
              className="subscription-success__button subscription-success__button--primary"
              onClick={() => navigate('/subscription')}
            >
              View Subscription
            </button>
            <button 
              className="subscription-success__button subscription-success__button--secondary"
              onClick={() => navigate('/')}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tierName = subscriptionService.getTierDisplayName(subscription.tier);
  const benefits = getTierBenefits(subscription.tier);

  return (
    <div className="subscription-success">
      <div className="subscription-success__card">
        <div className="subscription-success__icon">✓</div>
        <h1>Welcome to {tierName}!</h1>
        <p>Your subscription has been activated successfully.</p>
        
        {subscription.currentPeriodEnd && (
          <p className="subscription-success__renewal">
            Your subscription will renew on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}

        <div className="subscription-success__details">
          <h3>You now have access to:</h3>
          <ul className="subscription-success__benefits">
            {benefits.map((benefit, index) => (
              <li key={index}>
                <svg className="check-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="9" fill="#10b981"/>
                  <path d="M5 9L8 12L13 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="subscription-success__actions">
          <button 
            className="subscription-success__button subscription-success__button--primary"
            onClick={() => navigate('/')}
          >
            Get Started
          </button>
          <button 
            className="subscription-success__button subscription-success__button--secondary"
            onClick={() => navigate('/subscription')}
          >
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

