import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LimitViolationsResult } from '../services/subscription.service';
import { subscriptionService } from '../services/subscription.service';
import './subscription-violation-modal.scss';

interface SubscriptionViolationModalProps {
  violations: LimitViolationsResult;
}

export const SubscriptionViolationModal: React.FC<SubscriptionViolationModalProps> = ({ 
  violations
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  const getRecommendedPlan = () => {
    // Find the plan that would accommodate all current usage
    const maxBrandsNeeded = Math.max(...violations.violations
      .filter(v => v.type === 'brands')
      .map(v => v.current), 1);
    
    const maxConfigsNeeded = Math.max(...violations.violations
      .filter(v => v.type === 'configs')
      .map(v => v.current), 1);

    // If more than 5 brands, recommend PRO plan
    if (maxBrandsNeeded > 5) {
      return 'pro';
    }
    
    if (maxBrandsNeeded <= 1 && maxConfigsNeeded <= 1) {
      return 'free';
    } else if (maxBrandsNeeded <= 5 && maxConfigsNeeded <= 10) {
      return 'starter';
    } else if (maxBrandsNeeded <= 20 && maxConfigsNeeded <= 20) {
      return 'pro';
    } else {
      return 'custom';
    }
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <div className="subscription-violation-modal-overlay">
      <div className="subscription-violation-modal">
        <div className="subscription-violation-modal__header">
          <div className="subscription-violation-modal__icon">🚨</div>
          <h2>Subscription Upgrade Required</h2>
          <p>Your current usage exceeds your plan limits. Please upgrade to continue using all features.</p>
        </div>

        <div className="subscription-violation-modal__content">
          <div className="violations-list">
            {violations.violations.map((violation, index) => (
              <div key={index} className="violation-item">
                <div className="violation-item__icon">
                  {violation.type === 'brands' ? '🏢' : '⚙️'}
                </div>
                <div className="violation-item__content">
                  <h4>{violation.type === 'brands' ? 'Brands' : 'Configs'} Limit</h4>
                  <p>{violation.message}</p>
                  <div className="violation-item__stats">
                    <span className="current">{violation.current}</span>
                    <span className="separator">/</span>
                    <span className="limit">{violation.limit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="recommendation">
            <h3>Recommended Plan</h3>
            <p>
              Based on your current usage, we recommend upgrading to the{' '}
              <strong>{subscriptionService.getTierDisplayName(recommendedPlan)}</strong> plan.
            </p>
            <div className="plan-benefits">
              {recommendedPlan === 'starter' && (
                <ul>
                  <li>✅ Up to 5 brands</li>
                  <li>✅ Up to 10 configs per brand</li>
                  <li>✅ Basic SDK</li>
                  <li>✅ Community support</li>
                </ul>
              )}
              {recommendedPlan === 'pro' && (
                <ul>
                  <li>✅ Up to 20 brands</li>
                  <li>✅ Up to 20 configs per brand</li>
                  <li>✅ All SDKs & APIs</li>
                  <li>✅ Advanced targeting</li>
                  <li>✅ Priority support</li>
                </ul>
              )}
              {recommendedPlan === 'custom' && (
                <ul>
                  <li>✅ Unlimited brands & configs</li>
                  <li>✅ Everything in Pro</li>
                  <li>✅ SAML SSO</li>
                  <li>✅ Custom integrations</li>
                  <li>✅ Dedicated support</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="subscription-violation-modal__actions">
          <button 
            className="btn btn--primary" 
            onClick={handleUpgrade}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};
