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
  const [cooldownSeconds, setCooldownSeconds] = useState(() => {
    const cooldownEndTime = localStorage.getItem('verificationEmailCooldown');
    if (cooldownEndTime) {
      const remainingMs = parseInt(cooldownEndTime) - Date.now();
      if (remainingMs > 0) {
        return Math.ceil(remainingMs / 1000);
      } else {
        localStorage.removeItem('verificationEmailCooldown');
        return 0;
      }
    }
    return 0;
  });

  // Continuously check cooldown from localStorage
  useEffect(() => {
    const checkCooldown = () => {
      const cooldownEndTime = localStorage.getItem('verificationEmailCooldown');
      if (cooldownEndTime) {
        const remainingMs = parseInt(cooldownEndTime) - Date.now();
        if (remainingMs > 0) {
          setCooldownSeconds(Math.ceil(remainingMs / 1000));
        } else {
          localStorage.removeItem('verificationEmailCooldown');
          setCooldownSeconds(0);
        }
      } else {
        setCooldownSeconds(0);
      }
    };

    const interval = setInterval(checkCooldown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResendEmail = async () => {
    if (!user?.auth0Id) return;
    
    if (user.verificationEmailResendCount >= 3) {
      setResendError('You have reached the maximum number of verification email attempts (3). Please contact support for assistance.');
      return;
    }
    
    const cooldownEndTime = localStorage.getItem('verificationEmailCooldown');
    if (cooldownEndTime) {
      const remainingMs = parseInt(cooldownEndTime) - Date.now();
      if (remainingMs > 0) {
        setResendError(`Please wait ${Math.ceil(remainingMs / 1000)} seconds before requesting another email.`);
        return;
      }
    }
    
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
      
      await refreshUser();
      
      const newCooldownEndTime = Date.now() + (60 * 1000);
      localStorage.setItem('verificationEmailCooldown', newCooldownEndTime.toString());
      setCooldownSeconds(60);
      
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      setResendError(error.response?.data?.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (cooldownSeconds === 0) {
      localStorage.removeItem('verificationEmailCooldown');
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

        {user && user.verificationEmailResendCount >= 3 && !user.emailVerified && (
          <div className="alert alert-error">
            ⚠️ You have reached the maximum number of verification email attempts. Please contact support for assistance.
          </div>
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
            disabled={isResending || cooldownSeconds > 0 || (user?.verificationEmailResendCount ?? 0) >= 3}
            key={cooldownSeconds}
          >
            {isResending ? (
              <>
                <span className="spinner-small"></span>
                <span>Sending...</span>
              </>
            ) : cooldownSeconds > 0 ? (
              <span>Wait {cooldownSeconds}s to resend</span>
            ) : (user?.verificationEmailResendCount ?? 0) >= 3 ? (
              <span>Resend Limit Reached</span>
            ) : (
              <span>Resend Verification Email ({3 - (user?.verificationEmailResendCount ?? 0)} left)</span>
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

