import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import "./Login.scss";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated, initialized } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Where to redirect after login (saved by ProtectedRoute when it bounced
  // an unauthenticated request). Defaults to "/" — the dashboard home.
  const redirectTo = (location.state as any)?.from || "/";

  // If a session is already valid when the user lands on /login, send
  // them straight in.
  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [initialized, isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message
        || err?.response?.data?.message
        || err?.message
        || "Login failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || loading;

  return (
    <div className="bm-login-shell">
      <div className="bm-login-bg" aria-hidden>
        <div className="bm-login-orb bm-login-orb-1" />
        <div className="bm-login-orb bm-login-orb-2" />
        <div className="bm-login-orb bm-login-orb-3" />
        <div className="bm-login-grid" />
      </div>

      <div className="bm-login-panel">
        <div className="bm-login-brand">
          <div className="bm-login-logo">
            <HiOutlineShieldCheck />
          </div>
          <div>
            <div className="bm-login-brand-name">BharatMithra</div>
            <div className="bm-login-brand-sub">Staff Console</div>
          </div>
        </div>

        <div className="bm-login-card">
          <div className="bm-login-card-head">
            <h1>Sign in</h1>
            <p>Use your staff credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="bm-login-form">
            <label className="bm-login-field">
              <span className="bm-login-label">Email</span>
              <div className="bm-login-input">
                <HiOutlineMail />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="you@bharatmithra.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  autoFocus
                />
              </div>
            </label>

            <label className="bm-login-field">
              <span className="bm-login-label">Password</span>
              <div className="bm-login-input">
                <HiOutlineLockClosed />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
                <button
                  type="button"
                  className="bm-login-eye"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </label>

            {error && (
              <div className="bm-login-error">
                <HiOutlineExclamationCircle />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="bm-login-submit"
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="bm-login-foot">
            <span>Need help?</span>
            <a href="mailto:support@bharatmithra.in">Contact support</a>
          </div>
        </div>

        <div className="bm-login-legal">
          © {new Date().getFullYear()} BharatMithra. Authorised access only.
          All sessions are logged.
        </div>
      </div>
    </div>
  );
};

export default Login;
