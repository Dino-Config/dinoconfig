import React from 'react';
import { useNavigate } from 'react-router-dom';
import './subscription-limit-warning.scss';

interface SubscriptionLimitWarningProps {
  message: string;
  currentTier: string;
}

export const SubscriptionLimitWarning: React.FC<SubscriptionLimitWarningProps> = ({ 
  message, 
  currentTier 
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  return (
    <div className="subscription-limit-warning">
      <div className="subscription-limit-warning__icon">⚠️</div>
      <div className="subscription-limit-warning__content">
        <h3>Subscription Limit Reached</h3>
        <p>{message}</p>
        {currentTier === 'free' && (
          <button className="subscription-limit-warning__button" onClick={handleUpgrade}>
            Upgrade to Pro
          </button>
        )}
      </div>
    </div>
  );
};

