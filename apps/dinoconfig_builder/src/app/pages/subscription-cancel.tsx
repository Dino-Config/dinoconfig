import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionService, SubscriptionStatus } from '../services/subscription.service';
import './subscription-cancel.scss';

export const SubscriptionCancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentSubscription();
  }, []);

  const loadCurrentSubscription = async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTierName = () => {
    if (!subscription) return 'Free';
    return subscriptionService.getTierDisplayName(subscription.tier);
  };

  const getCurrentTierDescription = () => {
    if (!subscription) return '1 brand, 1 config per brand';
    return subscriptionService.getTierDescription(subscription.tier);
  };

  return (
    <div className="subscription-cancel">
      <div className="subscription-cancel__card">
        <div className="subscription-cancel__icon">✗</div>
        <h1>Checkout Cancelled</h1>
        <p>Your subscription upgrade was cancelled.</p>
        <p>No charges were made to your account.</p>
        
        {!loading && subscription && (
          <div className="subscription-cancel__current-plan">
            <h3>Your current plan:</h3>
            <div className="subscription-cancel__plan-info">
              <span className="subscription-cancel__plan-name">{getCurrentTierName()}</span>
              <span className="subscription-cancel__plan-description">{getCurrentTierDescription()}</span>
            </div>
          </div>
        )}

        <div className="subscription-cancel__help">
          <h4>Need help?</h4>
          <p>If you encountered any issues during checkout, please:</p>
          <ul>
            <li>Check your payment method details</li>
            <li>Ensure you have sufficient funds</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>

        <div className="subscription-cancel__actions">
          <button 
            className="subscription-cancel__button subscription-cancel__button--primary"
            onClick={() => navigate('/subscription')}
          >
            Try Again
          </button>
          <button 
            className="subscription-cancel__button subscription-cancel__button--secondary"
            onClick={() => navigate('/')}
          >
            Return Home
          </button>
          <button 
            className="subscription-cancel__button subscription-cancel__button--link"
            onClick={() => window.open('mailto:support@dinoconfig.com?subject=Checkout%20Issue', '_blank')}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

