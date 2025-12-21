import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineArrowLeft,
  HiOutlineKey,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import ThemeSwitcher from '../../../components/common/ThemeSwitcher';

const RequestCode = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store identifier for OTP verification
      sessionStorage.setItem('loginIdentifier', identifier);

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

      {/* Right Side - Request Code Form */}
      <div className="auth-form-section">
        {/* Theme Switcher */}
        <div className="auth-theme-switcher">
          <ThemeSwitcher />
        </div>

        <div className="auth-form-container">
          <div className="auth-header">
            <button className="auth-back-btn" onClick={() => navigate('/login')}>
              <HiOutlineArrowLeft />
              Back to Login
            </button>

            <div className="auth-logo-small">
              <HiOutlineKey />
            </div>
            <h1>Login with Code</h1>
            <p>Enter your registered email, mobile or username and we'll send you a one-time login code.</p>
          </div>

          {error && (
            <div className="auth-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message success">
              <HiOutlineCheckCircle />
              Login code sent! Redirecting to verification...
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
                  disabled={success}
                />
              </div>
              <span className="input-hint">We'll send a one-time login code to your registered mobile</span>
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
    </div>
  );
};

export default RequestCode;
