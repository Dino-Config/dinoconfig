import React, { useEffect, useState } from 'react';
import './idle-warning-modal.scss';

interface IdleWarningModalProps {
  isVisible: boolean;
  remainingSeconds: number;
  onKeepSession: () => void;
  onLogout: () => void;
}

export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({
  isVisible,
  remainingSeconds,
  onKeepSession,
  onLogout
}) => {
  const [countdown, setCountdown] = useState(remainingSeconds);

  useEffect(() => {
    setCountdown(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="idle-warning-overlay">
      <div className="idle-warning-modal">
        <div className="idle-warning-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#f59e0b" strokeWidth="4" fill="#fef3c7"/>
            <path d="M32 20v16M32 44h.02" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 className="idle-warning-title">Session Expiring Soon</h2>
        
        <p className="idle-warning-message">
          You've been inactive for a while. Your session will expire in:
        </p>

        <div className="idle-warning-countdown">
          <span className="countdown-time">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        <p className="idle-warning-submessage">
          Click "Keep Session" to continue working, or you'll be logged out automatically.
        </p>

        <div className="idle-warning-actions">
          <button 
            className="btn btn--primary btn--large"
            onClick={onKeepSession}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16.667 9.167v5a1.667 1.667 0 01-1.667 1.666H5a1.667 1.667 0 01-1.667-1.666v-10A1.667 1.667 0 015 2.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.333 2.5h5v5M8.333 11.667L18.333 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Keep Session Active
          </button>
          
          <button 
            className="btn btn--outline btn--large"
            onClick={onLogout}
          >
            Logout Now
          </button>
        </div>

        <div className="idle-warning-info">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Any activity will automatically extend your session</span>
        </div>
      </div>
    </div>
  );
};

