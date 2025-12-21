import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlineKey,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import ThemeSwitcher from '../../../components/common/ThemeSwitcher';

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="auth-page">
      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <h2>Bharat <span>Mithra</span></h2>
          </div>

          <div className="brand-tagline">
            <h1>Trusted by <span>Thousands</span>, Built for Indian Citizens</h1>
            <p>Empowering citizens with seamless access to government services across India</p>
          </div>

          <div className="brand-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <HiOutlineCog />
              </div>
              <div className="stat-number">1000+</div>
              <div className="stat-label">Services Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <HiOutlineOfficeBuilding />
              </div>
              <div className="stat-number">100+</div>
              <div className="stat-label">Service Centers</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <HiOutlineDocumentText />
              </div>
              <div className="stat-number">50+</div>
              <div className="stat-label">Govt Schemes</div>
            </div>
          </div>

          <div className="brand-features">
            <div className="feature-item">
              <HiOutlineCheckCircle />
              <span>Passport & Visa Services</span>
            </div>
            <div className="feature-item">
              <HiOutlineCheckCircle />
              <span>PAN & Aadhaar Services</span>
            </div>
            <div className="feature-item">
              <HiOutlineCheckCircle />
              <span>Driving License & RC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-section">
        {/* Theme Switcher */}
        <div className="auth-theme-switcher">
          <ThemeSwitcher />
        </div>

        <div className="auth-form-container">
          <div className="auth-header">
            <div className="auth-logo-small">
              <HiOutlineLockClosed />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="auth-message error">
              <HiOutlineLockClosed />
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email, Mobile or Username</label>
              <div className="input-wrapper">
                <span className="input-icon"><HiOutlineUser /></span>
                <input
                  type="text"
                  placeholder="Enter email, mobile or username"
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
    </div>
  );
};

export default Login;
