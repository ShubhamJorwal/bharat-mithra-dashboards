import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText
} from 'react-icons/hi';

const EnterOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const otpType = location.state?.type || 'reset-password'; // 'reset-password' or 'login-code'

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimer(60);
    setError('');

    // Simulate resend API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);

      // Redirect based on type
      setTimeout(() => {
        if (otpType === 'reset-password') {
          navigate('/reset-password');
        } else {
          // Login with code - store token and redirect to dashboard
          localStorage.setItem('authToken', 'test-token');
          navigate('/');
        }
      }, 1500);
    } catch {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

      {/* Right Side - OTP Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <button
              className="auth-back-btn"
              onClick={() => navigate(otpType === 'reset-password' ? '/forgot-password' : '/request-code')}
            >
              <HiOutlineArrowLeft />
              Back
            </button>

            <div className="auth-logo-small">
              <HiOutlineShieldCheck />
            </div>
            <h1>Verify Code</h1>
            <p>
              We've sent a 6-digit verification code to your registered email and mobile number.
            </p>
          </div>

          {error && (
            <div className="auth-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message success">
              <HiOutlineCheckCircle />
              {otpType === 'reset-password'
                ? 'Verified! Redirecting to reset password...'
                : 'Verified! Logging you in...'}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="otp-container" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`otp-input ${digit ? 'filled' : ''}`}
                  disabled={success}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="otp-timer">
              {canResend ? (
                <p>
                  Didn't receive the code?{' '}
                  <button type="button" className="resend-btn" onClick={handleResend}>
                    Resend Code
                  </button>
                </p>
              ) : (
                <p>
                  Resend code in <span className="timer">{formatTime(timer)}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isLoading || success || otp.join('').length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnterOTP;
