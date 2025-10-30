import axios from "../auth/axios-interceptor";
import { useNavigate, useLocation } from "react-router-dom";
import { IoHammerOutline, IoPersonOutline, IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import { useUser } from "../auth/user-context";
import { environment } from "../../environments";
import { useState, useEffect } from "react";
import { subscriptionService, SubscriptionStatus } from "../services/subscription.service";
import "./left-navigation.scss";

type LeftNavigationProps = {  
  isCollapsed: boolean;
  onToggle: () => void;
  activeItem: 'builder' | 'profile' | 'settings';
};

export default function LeftNavigation({ isCollapsed, onToggle, activeItem }: LeftNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  const goBuilder = () => {
    const lastBrandId = localStorage.getItem('lastBrandId');

    if (!lastBrandId) {
      navigate(`/brands`);
      return;
    }

    navigate(`/brands/${lastBrandId}/builder`);
  };

  const goProfile = () => navigate(`/profile`);
  const goSettings = () => navigate(`/settings`);
  const goSettingsFeatures = () => navigate(`/settings/features`);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();

      await axios.post(`${environment.apiUrl}/auth/logout`, {}, {
        withCredentials: true
      });

      window.location.href = environment.homeUrl;
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = environment.homeUrl;
    }
  };

  useEffect(() => {
    if (user && !loading) {
      loadSubscription();
    }
  }, [user, loading]);

  // Listen for subscription changes
  useEffect(() => {
    const handleSubscriptionChange = () => {
      if (user && !loading) {
        loadSubscription();
      }
    };

    window.addEventListener('subscriptionChanged', handleSubscriptionChange);
    
    return () => {
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
    };
  }, [user, loading]);

  const loadSubscription = async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscription(status);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <nav className={`left-navigation ${isCollapsed ? 'collapsed' : ''}`}>
      <div className={`nav-header ${isCollapsed ? 'collapsed' : ''}`}>
        {isCollapsed ? (
          <img 
            src="assets/dinoconfig-logo.svg" 
            alt="DinoConfig" 
            className="nav-logo clickable-logo"
            onClick={onToggle}
          />
        ) : (
          <>
            <h2 
              className="nav-title-clickable"
              onClick={onToggle}
            >
              DinoConfig Builder
            </h2>
          </>
        )}
      </div>

      <div className="nav-sections">
        <div className="nav-section">
          <h3 className={`nav-section-title ${isCollapsed ? 'hidden' : ''}`}>Main</h3>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeItem === 'builder' ? 'active' : ''}`}
                onClick={goBuilder}
              >
                <IoHammerOutline className="nav-icon" />
                <span className={isCollapsed ? 'hidden' : ''}>Builder</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <h3 className={`nav-section-title ${isCollapsed ? 'hidden' : ''}`}>Account</h3>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeItem === 'profile' ? 'active' : ''}`}
                onClick={goProfile}
              >
                <IoPersonOutline className="nav-icon" />
                <span className={isCollapsed ? 'hidden' : ''}>Profile</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeItem === 'settings' ? 'active' : ''}`}
                onClick={goSettings}
              >
                <IoSettingsOutline className="nav-icon" />
                <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
              </button>
            </li>
            {/* Settings child: Features (visible as nested under Settings) */}
            {!isCollapsed && location.pathname.startsWith('/settings') && (
              <li className="nav-item nav-subitem">
                <button 
                  className={`nav-link ${location.pathname.startsWith('/settings/features') ? 'active' : ''}`}
                  onClick={goSettingsFeatures}
                  title={isCollapsed ? 'Features' : ''}
                >
                  <span className="nav-sub-bullet" />
                  <span className={isCollapsed ? 'hidden' : ''}>Features</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* User info and logout section */}
      <div className="nav-footer">
        {!loading && user && subscription && !isCollapsed && (
          <div className="subscription-tier-box" onClick={() => navigate('/subscription')}>
            <div className="tier-info">
              <span className="tier-label">Current Plan</span>
              <span className={`tier-badge tier-badge--${subscription.tier}`}>
                {subscriptionService.getTierDisplayName(subscription.tier)}
              </span>
            </div>
            {subscription.tier === 'free' && (
              <button className="upgrade-btn-small">
                Upgrade to Pro
              </button>
            )}
          </div>
        )}

        {!loading && user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={`user-details ${isCollapsed ? 'hidden' : ''}`} onClick={goProfile}>
              <div className="user-name">{getUserDisplayName()}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        )}
        
        <button 
          className="logout-button"
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
        >
          <IoLogOutOutline className="logout-icon" />
          <span className={isCollapsed ? 'hidden' : ''}>Logout</span>
        </button>
      </div>
    </nav>
  );
}



