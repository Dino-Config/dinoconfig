import React, { useEffect, useState } from 'react';
import { tokenRenewalService } from '../auth/token-renewal.service';
import { IdleWarningModal } from './idle-warning-modal';
import { environment } from '../../environments';

interface IdleWarningProviderProps {
  children: React.ReactNode;
}

export const IdleWarningProvider: React.FC<IdleWarningProviderProps> = ({ children }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Register callback with token renewal service
    tokenRenewalService.setIdleWarningCallback((seconds) => {
      if (seconds > 0) {
        setRemainingSeconds(seconds);
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setRemainingSeconds(0);
      }
    });
  }, []);

  const handleKeepSession = async () => {
    setIsVisible(false);
    setRemainingSeconds(0);
    await tokenRenewalService.keepSessionActive();
  };

  const handleLogout = () => {
    setIsVisible(false);
    window.location.href = environment.homeUrl;
  };

  return (
    <>
      {children}
      <IdleWarningModal
        isVisible={isVisible}
        remainingSeconds={remainingSeconds}
        onKeepSession={handleKeepSession}
        onLogout={handleLogout}
      />
    </>
  );
};

