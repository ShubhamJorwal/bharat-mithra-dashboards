import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineDeviceMobile,
  HiOutlineArrowLeft,
  HiOutlineKey
} from 'react-icons/hi';

type RecoveryMethod = 'email' | 'mobile' | 'username';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getPlaceholder = () => {
    switch (recoveryMethod) {
      case 'email': return 'Enter your registered email';
      case 'mobile': return 'Enter your registered mobile number';
      case 'username': return 'Enter your username';
    }
  };

  const getIcon = () => {
    switch (recoveryMethod) {
      case 'email': return <HiOutlineMail />;
      case 'mobile': return <HiOutlineDeviceMobile />;
      case 'username': return <HiOutlineUser />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store identifier for OTP verification
      sessionStorage.setItem('resetIdentifier', identifier);
      sessionStorage.setItem('resetMethod', recoveryMethod);

      setSuccess(true);

      // Redirect to OTP page after 2 seconds
      setTimeout(() => {
        navigate('/enter-otp', { state: { type: 'reset-password' } });
      }, 2000);
    } catch {
      setError('Account not found. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="auth-back-btn" onClick={() => navigate('/login')}>
          <HiOutlineArrowLeft />
          Back to Login
        </button>

        <div className="auth-header">
          <div className="auth-logo">
            <HiOutlineKey />
          </div>
          <h1>Forgot Password?</h1>
          <p>No worries! Enter your registered details and we'll send you a verification code.</p>
        </div>

        {/* Recovery Method Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${recoveryMethod === 'email' ? 'active' : ''}`}
            onClick={() => setRecoveryMethod('email')}
          >
            Email
          </button>
          <button
            className={`auth-tab ${recoveryMethod === 'mobile' ? 'active' : ''}`}
            onClick={() => setRecoveryMethod('mobile')}
          >
            Mobile
          </button>
          <button
            className={`auth-tab ${recoveryMethod === 'username' ? 'active' : ''}`}
            onClick={() => setRecoveryMethod('username')}
          >
            Username
          </button>
        </div>

        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message success">
            Verification code sent! Redirecting to OTP verification...
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              {recoveryMethod === 'email' ? 'Email Address' :
               recoveryMethod === 'mobile' ? 'Mobile Number' : 'Username'}
            </label>
            <div className="input-wrapper">
              <span className="input-icon">{getIcon()}</span>
              <input
                type={recoveryMethod === 'email' ? 'email' : 'text'}
                placeholder={getPlaceholder()}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={success}
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading || success}
          >
            {isLoading ? 'Sending Code...' : 'Send Verification Code'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
