import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlineDeviceMobile,
  HiOutlineKey
} from 'react-icons/hi';

type LoginMethod = 'email' | 'mobile' | 'username';

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getPlaceholder = () => {
    switch (loginMethod) {
      case 'email': return 'Enter your email';
      case 'mobile': return 'Enter your mobile number';
      case 'username': return 'Enter your username';
    }
  };

  const getIcon = () => {
    switch (loginMethod) {
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

      // For testing - store token and redirect
      localStorage.setItem('authToken', 'test-token');
      navigate('/');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <HiOutlineLockClosed />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your dashboard</p>
        </div>

        {/* Login Method Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${loginMethod === 'email' ? 'active' : ''}`}
            onClick={() => setLoginMethod('email')}
          >
            Email
          </button>
          <button
            className={`auth-tab ${loginMethod === 'mobile' ? 'active' : ''}`}
            onClick={() => setLoginMethod('mobile')}
          >
            Mobile
          </button>
          <button
            className={`auth-tab ${loginMethod === 'username' ? 'active' : ''}`}
            onClick={() => setLoginMethod('username')}
          >
            Username
          </button>
        </div>

        {error && (
          <div className="auth-message error">
            <HiOutlineLockClosed />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{loginMethod === 'email' ? 'Email Address' : loginMethod === 'mobile' ? 'Mobile Number' : 'Username'}</label>
            <div className="input-wrapper">
              <span className="input-icon">{getIcon()}</span>
              <input
                type={loginMethod === 'email' ? 'email' : 'text'}
                placeholder={getPlaceholder()}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><HiOutlineLockClosed /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="has-icon-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </span>
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <Link to="/request-code" className="auth-btn auth-btn-outline">
          <HiOutlineKey />
          Login with Code
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

export default Login;
