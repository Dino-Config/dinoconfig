import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components';
import { useUser } from '../auth/user-context';
import { subscriptionService, SubscriptionStatus } from '../services/subscription.service';
import './Profile.scss';

export default function Profile() {
    const navigate = useNavigate();
    const { user, loading, refreshUser } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personal', 'address', 'account', 'subscription', 'brands']));
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [loadingSubscription, setLoadingSubscription] = useState(true);

    useEffect(() => {
      loadSubscription();
    }, []);

    const loadSubscription = async () => {
      try {
        const status = await subscriptionService.getSubscriptionStatus();
        setSubscription(status);
      } catch (err) {
        console.error('Failed to load subscription:', err);
      } finally {
        setLoadingSubscription(false);
      }
    };

    const toggleSection = (section: string) => {
      const newExpanded = new Set(expandedSections);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      setExpandedSections(newExpanded);
    };
  
  if (loading) {
    return (
      <div className="profile-page">
        <Spinner text="Loading profile..." size="large" fullHeight />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-state">
          <h2>Error loading profile</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="main-layout">
        <div className="profile-header">
          <div className="header-content">
            <h1 className="page-title">User Profile</h1>
            <p className="page-subtitle">View and manage your account information</p>
          </div>
          <button 
            className="btn btn-outline refresh-btn" 
            onClick={refreshUser}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Profile'}
          </button>
        </div>

        <div className="main-content">
          <div className="profile-container">
            <div className="profile-content">
              
              <div className="profile-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('personal')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('personal') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* <span className="section-icon">👤</span> */}
                  <span className="section-title">Personal Information</span>
                </button>
                
                {expandedSections.has('personal') && (
                <div className="profile-grid">
                  <div className="profile-field">
                    <span className="field-label">First Name:</span>
                    <span className="field-value">{user?.firstName}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Last Name:</span>
                    <span className="field-value">{user?.lastName}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Email:</span>
                    <span className="field-value">{user?.email}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Phone Number:</span>
                    <span className="field-value">{user?.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Company Name:</span>
                    <span className="field-value">{user?.companyName || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Account Status:</span>
                    <span className={`field-value status ${user?.isActive ? 'active' : 'inactive'}`}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                )}
              </div>

              <div className="profile-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('address')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('address') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* <span className="section-icon">📍</span> */}
                  <span className="section-title">Address Information</span>
                </button>
                
                {expandedSections.has('address') && (
                <div className="profile-grid">
                  <div className="profile-field full-width">
                    <span className="field-label">Address:</span>
                    <span className="field-value">{user?.address || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">City:</span>
                    <span className="field-value">{user?.city || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">State:</span>
                    <span className="field-value">{user?.state || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">ZIP Code:</span>
                    <span className="field-value">{user?.zip || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Country:</span>
                    <span className="field-value">{user?.country || 'Not provided'}</span>
                  </div>
                </div>
                )}
              </div>

              <div className="profile-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('subscription')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('subscription') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="section-title">Subscription & Plan</span>
                </button>
                
                {expandedSections.has('subscription') && (
                  <div className="profile-grid">
                    {loadingSubscription ? (
                      <div className="profile-field full-width">
                        <span className="field-value">Loading subscription details...</span>
                      </div>
                    ) : subscription ? (
                      <>
                        <div className="profile-field">
                          <span className="field-label">Current Plan:</span>
                          <span className={`field-value tier-badge tier-badge--${subscription.tier}`}>
                            {subscriptionService.getTierDisplayName(subscription.tier)}
                          </span>
                        </div>
                        <div className="profile-field">
                          <span className="field-label">Status:</span>
                          <span className={`field-value status ${subscription.isActive ? 'active' : 'inactive'}`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </div>
                        <div className="profile-field">
                          <span className="field-label">Max Brands:</span>
                          <span className="field-value">
                            {subscription.limits.maxBrands === -1 ? 'Unlimited' : subscription.limits.maxBrands}
                          </span>
                        </div>
                        <div className="profile-field">
                          <span className="field-label">Max Configs per Brand:</span>
                          <span className="field-value">
                            {subscription.limits.maxConfigsPerBrand === -1 ? 'Unlimited' : subscription.limits.maxConfigsPerBrand}
                          </span>
                        </div>
                        {subscription.currentPeriodEnd && (
                          <div className="profile-field">
                            <span className="field-label">Renewal Date:</span>
                            <span className="field-value">
                              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="profile-field full-width">
                          <button 
                            className="btn btn-primary manage-subscription-btn" 
                            onClick={() => navigate('/subscription')}
                          >
                            {subscription.tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="profile-field full-width">
                        <span className="field-value">Unable to load subscription details</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('account')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('account') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* <span className="section-icon">🔑</span> */}
                  <span className="section-title">Account Details</span>
                </button>
                
                {expandedSections.has('account') && (
                <div className="profile-grid">
                  <div className="profile-field">
                    <span className="field-label">User ID:</span>
                    <span className="field-value">{user?.id}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Auth0 ID:</span>
                    <span className="field-value">{user?.auth0Id}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Member Since:</span>
                    <span className="field-value">{new Date(user?.createdAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
                )}
              </div>

              <div className="profile-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('brands')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('brands') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* <span className="section-icon">🏢</span> */}
                  <span className="section-title">Associated Brands</span>
                  {user?.brands && user?.brands.length > 0 && (
                    <span className="badge">{user.brands.length}</span>
                  )}
                </button>
                
                {expandedSections.has('brands') && (
                  <>
                  {user?.brands && user?.brands.length > 0 ? (
                  <div className="brands-list">
                    {user?.brands.map((brand) => (
                      <div key={brand.id} className="brand-item">
                        <div className="brand-info">
                          <h4 className="brand-name">{brand.name}</h4>
                          {brand.description && (
                            <p className="brand-description">{brand.description}</p>
                          )}
                          {brand.website && (
                            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="brand-website">
                              {brand.website}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  ) : (
                    <p className="empty-message">No brands associated with this account.</p>
                  )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
