import React from 'react';
import './Settings.scss';
import { useFeatures } from '../hooks/useFeatures';
import { Feature } from '../types/features';
import { FeatureBadge } from '../components';
import { subscriptionService } from '../services/subscription.service';

export default function Features() {
  const { subscription, hasFeature, loading } = useFeatures();

  return (
    <div className="settings-page">
      <div className="main-layout">
        <div className="settings-header">
          <div className="header-content">
            <h1 className="page-title">Features</h1>
            <p className="page-subtitle">Your plan and available capabilities</p>
          </div>
        </div>

        <div className="main-content">
          <div className="settings-container">
            <div className="settings-content">
              <div className="settings-section">
                <div className="settings-grid">
                  <div className="setting-item features-section">
                    {loading ? (
                      <div className="features-loading">Loading features...</div>
                    ) : subscription ? (
                      <>
                        <div className="subscription-info">
                          <div className="subscription-tier">
                            <span className="tier-label">Current Plan:</span>
                            <span className={`tier-badge tier-${subscription.tier}`}>
                              {subscriptionService.getTierDisplayName(subscription.tier)}
                            </span>
                            {subscription.status !== 'active' && subscription.status !== 'trialing' && (
                              <span className="status-warning">({subscription.status})</span>
                            )}
                          </div>
                          <div className="subscription-limits">
                            <div className="limit-item">
                              <span className="limit-label">Brands:</span>
                              <span className="limit-value">
                                {subscription.limits.maxBrands === -1 ? 'Unlimited' : subscription.limits.maxBrands}
                              </span>
                            </div>
                            <div className="limit-item">
                              <span className="limit-label">Configs per Brand:</span>
                              <span className="limit-value">
                                {subscription.limits.maxConfigsPerBrand === -1 ? 'Unlimited' : subscription.limits.maxConfigsPerBrand}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="features-list">
                          <h4>Available Features</h4>
                          <div className="features-grid">
                            {Object.values(Feature).map((feature) => {
                              const isEnabled = hasFeature(feature);
                              const description = subscriptionService.getFeatureDescription(feature);

                              let featureTier: 'free' | 'starter' | 'pro' | 'custom' = 'free';
                              if (feature === Feature.BASIC_CONFIGS || feature === Feature.BASIC_SDK) {
                                featureTier = 'free';
                              } else if ([Feature.MULTIPLE_BRANDS, Feature.MULTIPLE_CONFIGS].includes(feature)) {
                                featureTier = 'starter';
                              } else if ([Feature.UNLIMITED_BRANDS, Feature.UNLIMITED_CONFIGS, Feature.CONFIG_ROLLBACK, Feature.ADVANCED_SDK, Feature.API_RATE_LIMIT_INCREASED, Feature.ADVANCED_TARGETING, Feature.USER_SEGMENTATION, Feature.AB_TESTING, Feature.ADVANCED_ANALYTICS, Feature.AUDIT_LOGS, Feature.TEAM_COLLABORATION, Feature.PRIORITY_SUPPORT].includes(feature)) {
                                featureTier = 'pro';
                              } else {
                                featureTier = 'custom';
                              }

                              return (
                                <div key={feature} className={`feature-item ${isEnabled ? 'enabled' : 'disabled'}`} title={description}>
                                  <div className="feature-status">
                                    {isEnabled ? (
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="icon-enabled">
                                        <circle cx="10" cy="10" r="9" fill="#10b981" stroke="#059669" strokeWidth="2"/>
                                        <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    ) : (
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="icon-disabled">
                                        <circle cx="10" cy="10" r="9" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2"/>
                                        <path d="M7 10L13 10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                                      </svg>
                                    )}
                                  </div>
                                  <div className="feature-info">
                                    <div className="feature-name">{description}</div>
                                    {!isEnabled && <FeatureBadge tier={featureTier} size="small" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {subscription.tier !== 'custom' && (
                          <div className="upgrade-prompt">
                            <h4>Want more features?</h4>
                            <p>Upgrade your plan to unlock additional capabilities for your configurations.</p>
                            <a href="/subscription" className="btn btn-primary">
                              View Plans & Upgrade
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="features-error">
                        <p>Unable to load subscription features.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


