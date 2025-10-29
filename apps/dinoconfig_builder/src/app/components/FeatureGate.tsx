import React, { ReactNode } from 'react';
import { useFeatures } from '../hooks/useFeatures';
import { Feature } from '../types/features';
import { subscriptionService } from '../services/subscription.service';

interface FeatureGateProps {
  feature: Feature | Feature[];
  requireAll?: boolean; // If true, require all features. If false (default), require any feature
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component that conditionally renders children based on feature availability
 * 
 * Examples:
 * 
 * Single feature:
 * <FeatureGate feature={Feature.ADVANCED_ANALYTICS}>
 *   <AdvancedAnalytics />
 * </FeatureGate>
 * 
 * Multiple features (OR logic):
 * <FeatureGate feature={[Feature.ANALYTICS, Feature.ADVANCED_ANALYTICS]}>
 *   <Analytics />
 * </FeatureGate>
 * 
 * Multiple features (AND logic):
 * <FeatureGate feature={[Feature.ANALYTICS, Feature.AUDIT_LOGS]} requireAll={true}>
 *   <AnalyticsWithAudit />
 * </FeatureGate>
 * 
 * With fallback:
 * <FeatureGate 
 *   feature={Feature.ADVANCED_ANALYTICS} 
 *   fallback={<div>Upgrade to Pro to access this feature</div>}
 * >
 *   <AdvancedAnalytics />
 * </FeatureGate>
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasFeature, hasAllFeatures, hasAnyFeature, loading } = useFeatures();

  if (loading) {
    return null;
  }

  const features = Array.isArray(feature) ? feature : [feature];
  const hasAccess = requireAll 
    ? hasAllFeatures(...features)
    : hasAnyFeature(...features);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface FeatureTooltipProps {
  feature: Feature;
  children: ReactNode;
}

/**
 * Adds a tooltip explaining why a feature is not available
 */
export const FeatureTooltip: React.FC<FeatureTooltipProps> = ({ feature, children }) => {
  const { hasFeature, subscription } = useFeatures();
  const available = hasFeature(feature);

  if (available) {
    return <>{children}</>;
  }

  const featureDescription = subscriptionService.getFeatureDescription(feature);
  const currentTier = subscription?.tier || 'free';
  const tierDisplayName = subscriptionService.getTierDisplayName(currentTier);

  return (
    <div 
      title={`${featureDescription}\nNot available on ${tierDisplayName} plan. Upgrade to access this feature.`}
      style={{ cursor: 'not-allowed', opacity: 0.5 }}
    >
      {children}
    </div>
  );
};

