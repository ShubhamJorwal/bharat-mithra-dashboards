import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle
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
    <div className="auth-container">
      <div className="auth-card">
        <button className="auth-back-btn" onClick={() => navigate('/enter-otp')}>
          <HiOutlineArrowLeft />
          Back
        </button>

        <div className="auth-header">
          <div className="auth-logo">
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
              <span className="strength-text weak">Passwords do not match</span>
            )}
            {confirmPassword && password === confirmPassword && (
              <span className="strength-text strong">Passwords match</span>
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
  );
};

export default ResetPassword;
