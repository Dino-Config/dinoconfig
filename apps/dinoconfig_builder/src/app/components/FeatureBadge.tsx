import React from 'react';
import './FeatureBadge.scss';

interface FeatureBadgeProps {
  tier: 'free' | 'starter' | 'pro' | 'custom';
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Badge component to show which tier a feature belongs to
 */
export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ 
  tier, 
  text,
  size = 'small' 
}) => {
  const displayText = text || tier.toUpperCase();

  return (
    <span className={`feature-badge feature-badge--${tier} feature-badge--${size}`}>
      {displayText}
    </span>
  );
};

