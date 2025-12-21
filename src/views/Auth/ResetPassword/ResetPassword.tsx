import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText
} from 'react-icons/hi';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { level: '', score: 0 };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', score };
    if (score <= 3) return { level: 'medium', score };
    return { level: 'strong', score };
  }, [password]);

  const getStrengthText = () => {
    switch (passwordStrength.level) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium strength';
      case 'strong': return 'Strong password';
      default: return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength.level === 'weak') {
      setError('Please choose a stronger password');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Clear session storage
      sessionStorage.removeItem('resetIdentifier');
      sessionStorage.removeItem('resetMethod');

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch {
      setError('Failed to reset password. Please try again.');
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

      {/* Right Side - Reset Password Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <button className="auth-back-btn" onClick={() => navigate('/enter-otp')}>
              <HiOutlineArrowLeft />
              Back
            </button>

            <div className="auth-logo-small">
              <HiOutlineLockClosed />
            </div>
            <h1>Reset Password</h1>
            <p>Create a new secure password for your account.</p>
          </div>

          {error && (
            <div className="auth-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message success">
              <HiOutlineCheckCircle />
              Password reset successfully! Redirecting to login...
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><HiOutlineLockClosed /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="has-icon-right"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={success}
                />
                <span
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </span>
              </div>
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className={`strength-fill ${passwordStrength.level}`}></div>
                  </div>
                  <span className={`strength-text ${passwordStrength.level}`}>
                    {getStrengthText()}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><HiOutlineLockClosed /></span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="has-icon-right"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={success}
                />
                <span
                  className="input-icon-right"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </span>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span className="password-match no-match">Passwords do not match</span>
              )}
              {confirmPassword && password === confirmPassword && (
                <span className="password-match match">Passwords match</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isLoading || success}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
