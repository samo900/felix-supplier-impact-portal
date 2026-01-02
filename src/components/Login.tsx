import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(''); // For development only
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.sendOTP(email);
      // @ts-ignore - dev_otp only exists in development
      if (response.dev_otp) {
        setDevOtp(response.dev_otp);
      }
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.verifyOTP(email, otpCode);
      login(response.email, response.token, response.accountId);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/felix-logo.png" alt="The Felix Project" className="login-logo" />
          <h1>Supplier Impact Portal</h1>
          <p>View the impact of your food donations</p>
          <p className="tagline">The Felix Project</p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supplier@example.com"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <p className="help-text">
              Enter your registered supplier email address to receive a one-time verification code.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                type="text"
                id="otp"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                disabled={loading}
                maxLength={6}
                className="otp-input"
              />
            </div>

            {devOtp && (
              <div className="dev-otp">
                Development OTP: <strong>{devOtp}</strong>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading || otpCode.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setOtpSent(false);
                setOtpCode('');
                setError('');
                setDevOtp('');
              }}
              disabled={loading}
            >
              Use Different Email
            </button>

            <p className="help-text">
              Check your email for the 6-digit verification code. Code expires in 10 minutes.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
