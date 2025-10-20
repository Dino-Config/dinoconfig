import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SubscriptionViolationModal } from '../components';
import { useLimitViolations } from '../hooks/useLimitViolations';

interface LimitViolationGuardProps {
  children: React.ReactNode;
}

export const LimitViolationGuard: React.FC<LimitViolationGuardProps> = ({ children }) => {
  const { violations, loading } = useLimitViolations();
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!loading && violations?.hasViolations) {
      if (location.pathname !== '/subscription' && location.pathname !== '/subscription/success') {
        setShowModal(true);
      }
    }
  }, [violations, loading, location.pathname]);

  useEffect(() => {
    if (location.pathname === '/subscription' || location.pathname === '/subscription/success') {
      setShowModal(false);
    }
  }, [location.pathname]);

  if (loading) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {showModal && violations && (
        <SubscriptionViolationModal
          violations={violations}
        />
      )}
    </>
  );
};
