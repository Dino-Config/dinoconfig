import React, { useEffect, useState } from "react";
import LeftNavigation from "../navigation/left-navigation";
import axios from "../../auth/axios-interceptor";
import { environment } from "../../../environments";
import "./profile.scss";

type Brand = { id: number; name: string; description?: string; website?: string };
type User = {
  id: number;
  auth0Id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isActive: boolean;
  companyName?: string;
  createdAt: string | Date;
  brands: Brand[];
};

export default function ProfilePage() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${environment.apiUrl}/users`, { withCredentials: true });
      setUser(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, []);

  return (
    <div className="multi-config">
      <LeftNavigation
        isCollapsed={isNavCollapsed}
        onToggle={() => setIsNavCollapsed(!isNavCollapsed)}
        activeItem="profile"
      />
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
          {loading ? (
            <div className="loading"><h2>Loading profile...</h2></div>
          ) : error ? (
            <div className="error-state">
              <h2>Error loading profile</h2>
              <p>{error}</p>
              <button className="btn primary" onClick={loadUser}>Retry</button>
            </div>
          ) : !user ? (
            <div className="empty-state">
              <h2>No profile data</h2>
              <button className="btn primary" onClick={loadUser}>Load Profile</button>
            </div>
          ) : (
            <div className="profile-container">
              <div className="profile-content">
                <h2 className="profile-title">User Profile</h2>

                <div className="profile-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="profile-grid">
                    <div className="profile-field"><span className="field-label">First Name:</span><span className="field-value">{user.firstName}</span></div>
                    <div className="profile-field"><span className="field-label">Last Name:</span><span className="field-value">{user.lastName}</span></div>
                    <div className="profile-field"><span className="field-label">Email:</span><span className="field-value">{user.email}</span></div>
                    <div className="profile-field"><span className="field-label">Phone Number:</span><span className="field-value">{user.phoneNumber || 'Not provided'}</span></div>
                    <div className="profile-field"><span className="field-label">Company Name:</span><span className="field-value">{user.companyName || 'Not provided'}</span></div>
                    <div className="profile-field"><span className="field-label">Account Status:</span><span className={`field-value status ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3 className="section-title">Address Information</h3>
                  <div className="profile-grid">
                    <div className="profile-field full-width"><span className="field-label">Address:</span><span className="field-value">{user.address || 'Not provided'}</span></div>
                    <div className="profile-field"><span className="field-label">City:</span><span className="field-value">{user.city || 'Not provided'}</span></div>
                    <div className="profile-field"><span className="field-label">State:</span><span className="field-value">{user.state || 'Not provided'}</span></div>
                    <div className="profile-field"><span className="field-label">ZIP Code:</span><span className="field-value">{user.zip || 'Not provided'}</span></div>
                    <div className="profile-field"><span className="field-label">Country:</span><span className="field-value">{user.country || 'Not provided'}</span></div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3 className="section-title">Account Details</h3>
                  <div className="profile-grid">
                    <div className="profile-field"><span className="field-label">User ID:</span><span className="field-value">{user.id}</span></div>
                    <div className="profile-field"><span className="field-label">Auth0 ID:</span><span className="field-value">{user.auth0Id}</span></div>
                    <div className="profile-field"><span className="field-label">Member Since:</span><span className="field-value">{new Date(user.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3 className="section-title">Associated Brands</h3>
                  {user.brands && user.brands.length > 0 ? (
                    <div className="brands-list">
                      {user.brands.map((b) => (
                        <div key={b.id} className="brand-item">
                          <div className="brand-info">
                            <h4 className="brand-name">{b.name}</h4>
                            {b.description && (<p className="brand-description">{b.description}</p>)}
                            {b.website && (<a href={b.website} target="_blank" rel="noopener noreferrer" className="brand-website">{b.website}</a>)}
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
          )}
        </div>
      </div>
    </div>
  );
}


