import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineDeviceMobile,
  HiOutlineArrowLeft,
  HiOutlineKey
} from 'react-icons/hi';

type RequestMethod = 'email' | 'mobile' | 'username';

const RequestCode = () => {
  const navigate = useNavigate();
  const [requestMethod, setRequestMethod] = useState<RequestMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getPlaceholder = () => {
    switch (requestMethod) {
      case 'email': return 'Enter your email';
      case 'mobile': return 'Enter your mobile number';
      case 'username': return 'Enter your username';
    }
  };

  const getIcon = () => {
    switch (requestMethod) {
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
      sessionStorage.setItem('loginIdentifier', identifier);
      sessionStorage.setItem('loginMethod', requestMethod);

      setSuccess(true);

      // Redirect to OTP page after 2 seconds
      setTimeout(() => {
        navigate('/enter-otp', { state: { type: 'login-code' } });
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
          <h1>Login with Code</h1>
          <p>Enter your registered details and we'll send you a one-time login code.</p>
        </div>

        {/* Request Method Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${requestMethod === 'email' ? 'active' : ''}`}
            onClick={() => setRequestMethod('email')}
          >
            Email
          </button>
          <button
            className={`auth-tab ${requestMethod === 'mobile' ? 'active' : ''}`}
            onClick={() => setRequestMethod('mobile')}
          >
            Mobile
          </button>
          <button
            className={`auth-tab ${requestMethod === 'username' ? 'active' : ''}`}
            onClick={() => setRequestMethod('username')}
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
            Login code sent! Redirecting to verification...
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              {requestMethod === 'email' ? 'Email Address' :
               requestMethod === 'mobile' ? 'Mobile Number' : 'Username'}
            </label>
            <div className="input-wrapper">
              <span className="input-icon">{getIcon()}</span>
              <input
                type={requestMethod === 'email' ? 'email' : 'text'}
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
            {isLoading ? 'Sending Code...' : 'Request Login Code'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <Link to="/login" className="auth-btn auth-btn-outline">
          Login with Password
        </Link>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestCode;
