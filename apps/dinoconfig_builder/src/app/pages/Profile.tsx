import React, { useState } from 'react';
import { Spinner } from '../components';
import { useUser } from '../auth/user-context';
import './Profile.scss';

export default function Profile() {
    const { user, loading, refreshUser } = useUser();
    const [error, setError] = useState<string | null>(null);
  
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
        <div className="brand-header">
          <div className="brand-info">
            <div className="brand-field">
              <span className="field-label">View:</span>
              <h1 className="field-value">User Profile</h1>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="profile-container">
            <div className="profile-content">
              <div className="profile-header">
                <h2 className="profile-title">User Profile</h2>
                <button 
                  className="btn primary refresh-btn" 
                  onClick={refreshUser}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              <div className="profile-section">
                <h3 className="section-title">Personal Information</h3>
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
              </div>

              <div className="profile-section">
                <h3 className="section-title">Address Information</h3>
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
              </div>

              <div className="profile-section">
                <h3 className="section-title">Account Details</h3>
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
              </div>

              <div className="profile-section">
                <h3 className="section-title">Associated Brands</h3>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
