import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { environment } from '../../environments';
import { useUser } from '../auth/user-context';
import './EmailVerificationPending.scss';

export default function EmailVerificationPending() {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [autoCheckCount, setAutoCheckCount] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const handleResendEmail = async () => {
    if (!user?.auth0Id) return;
    
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      await axios.post(
        `${environment.apiUrl}/auth/send-verification`,
        { userId: user.auth0Id },
        { withCredentials: true }
      );
      setResendSuccess(true);
      setCooldownSeconds(60); // 60 second cooldown to prevent spam
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      setResendError(error.response?.data?.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // Redirect if user becomes verified
  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/brands', { replace: true });
    }
  }, [user?.emailVerified, navigate]);

  // Automatically check verification status every 10 seconds
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        await refreshUser();
        setAutoCheckCount(prev => prev + 1);
      } catch (error) {
        console.error('Auto-check verification failed:', error);
      }
    };

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(() => {
      checkVerificationStatus();
    }, 5000);

    // Then check every 10 seconds
    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 10000);

    // Cleanup on unmount
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [refreshUser]);

  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    setResendError(null);
    
    try {
      await refreshUser();
        
      setTimeout(() => {
        if (!user?.emailVerified) {
          setResendError('Email not verified yet. Please check your email and click the verification link.');
        }
      }, 1000);
    } catch (error: any) {
      console.error('Failed to check verification status:', error);
      setResendError(error.response?.data?.message || 'Failed to check verification status. Please try again.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

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

  return (
    <div className="email-verification-pending">
      <div className="verification-card">
        <div className="verification-icon">
        <img src="assets/dino-email.svg" alt="Dino Thinking" className="dino-email" />
        </div>
        
        <h1>Verify Your Email Address</h1>
        
        <p className="verification-message">
          We've sent a verification email to <strong>{user?.email}</strong>
        </p>
        
        <p className="verification-instructions">
          Please check your inbox and click the verification link to complete your registration and access DinoConfig Builder.
        </p>

        {autoCheckCount > 0 && (
          <p className="auto-check-info">
            Automatically checking verification status...
          </p>
        )}

        <div className="verification-tips">
          <h3>Didn't receive the email?</h3>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes for the email to arrive</li>
          </ul>
        </div>

        <div className="verification-actions">
          <button 
            className="btn-primary"
            onClick={handleCheckVerification}
            disabled={isCheckingVerification}
          >
            {isCheckingVerification ? (
              <>
                <span className="spinner-small"></span>
                <span>Checking...</span>
              </>
            ) : (
              <span>I've Verified My Email</span>
            )}
          </button>

          <button 
            className="btn-secondary"
            onClick={handleResendEmail}
            disabled={isResending || cooldownSeconds > 0}
          >
            {isResending ? (
              <>
                <span className="spinner-small"></span>
                <span>Sending...</span>
              </>
            ) : cooldownSeconds > 0 ? (
              <span>Wait {cooldownSeconds}s to resend</span>
            ) : (
              <span>Resend Verification Email</span>
            )}
          </button>

          <button 
            className="btn-text"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {resendSuccess && (
          <div className="alert alert-success">
            Verification email sent successfully! Please check your inbox.
          </div>
        )}

        {resendError && (
          <div className="alert alert-error">
            {resendError}
          </div>
        )}
      </div>
    </div>
  );
}

