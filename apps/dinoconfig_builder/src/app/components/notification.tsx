import React, { useEffect, useState } from 'react';
import './notification.scss';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#10b981"/>
            <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#ef4444"/>
            <path d="M6 6l8 8M14 6l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#3b82f6"/>
            <path d="M10 6v4M10 14h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return (
    <div className={`notification notification--${type}`}>
      <div className="notification__content">
        <div className="notification__icon">
          {getIcon()}
        </div>
        <div className="notification__message">
          {message}
        </div>
        <button 
          className="notification__close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    notification,
    showNotification,
    hideNotification
  };
};

