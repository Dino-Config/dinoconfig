import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './ForgotPassword.scss';
import dinoconfigLogo from '../../assets/dinoconfig-logo.svg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 0 || !err.response) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1 className="page-title">Reset Password</h1>
              <p>Enter your email to receive a password reset link</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="button-loading">
                    <span className="spinner"></span>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link to="/signin" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="auth-visual-section">
          <div className="visual-content">
            <div className="logo-container">
              <img src={dinoconfigLogo} alt="DinoConfig" className="logo" />
            </div>
            <div className="visual-text">
              <h2>Reset Your Password</h2>
              <p>We'll send you a link to reset your password securely.</p>
            </div>
            <div className="visual-decoration">
              <div className="decoration-circle circle-1"></div>
              <div className="decoration-circle circle-2"></div>
              <div className="decoration-circle circle-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

