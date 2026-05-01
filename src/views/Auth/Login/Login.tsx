import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineExclamationCircle,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import InfinityLogo from "@/components/common/InfinityLogo/InfinityLogo";
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
  const [capsOn, setCapsOn] = useState(false);

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
      {/* Animated background — soft orbs + grid */}
      <div className="bm-login-bg" aria-hidden>
        <div className="bm-login-orb bm-login-orb-1" />
        <div className="bm-login-orb bm-login-orb-2" />
        <div className="bm-login-orb bm-login-orb-3" />
        <div className="bm-login-grid" />
      </div>

      <div className="bm-login-stage">
        {/* ─── Left: brand panel ──────────────────────────────────── */}
        <aside className="bm-login-brand-panel">
          <div className="bm-login-brand-mark">
            <InfinityLogo size="lg" />
          </div>

          <div className="bm-login-brand-copy">
            <div className="bm-login-eyebrow">
              <HiOutlineSparkles /> Staff Console
            </div>
            <h1 className="bm-login-headline">
              Bharat<span className="bm-login-headline-accent">Mithra</span>
            </h1>
            <p className="bm-login-tagline">
              The trusted bridge between citizens and services across every state,
              district, taluk, and gram panchayat in India.
            </p>

            <ul className="bm-login-pitch">
              <li>
                <span className="bm-login-pitch-icon"><HiOutlineShieldCheck /></span>
                <div>
                  <strong>Encrypted sessions</strong>
                  <small>Every login is logged and rate-limited.</small>
                </div>
              </li>
              <li>
                <span className="bm-login-pitch-icon"><HiOutlineLightningBolt /></span>
                <div>
                  <strong>Built for the field</strong>
                  <small>Agents, caseworkers, telecallers — one platform.</small>
                </div>
              </li>
            </ul>
          </div>

          <div className="bm-login-brand-foot">
            <span>© {new Date().getFullYear()} BharatMithra</span>
            <span className="bm-login-dot">·</span>
            <span>Authorised access only</span>
          </div>
        </aside>

        {/* ─── Right: form panel ──────────────────────────────────── */}
        <section className="bm-login-form-panel">
          <div className="bm-login-form-mobile-brand">
            <InfinityLogo size="sm" />
            <span>BharatMithra</span>
          </div>

          <div className="bm-login-card">
            <div className="bm-login-card-head">
              <div className="bm-login-step">
                <span className="bm-login-step-num">1</span>
                <span>Sign in</span>
              </div>
              <h2>Welcome back</h2>
              <p>Use your staff credentials to continue. Your session is logged for security.</p>
            </div>

            <form onSubmit={handleSubmit} className="bm-login-form">
              <label className="bm-login-field">
                <span className="bm-login-label">
                  Email address
                </span>
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
                <span className="bm-login-label">
                  Password
                  {capsOn && (
                    <span className="bm-login-caps-warn">
                      <HiOutlineExclamationCircle /> Caps Lock is on
                    </span>
                  )}
                </span>
                <div className="bm-login-input">
                  <HiOutlineLockClosed />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                    onKeyDown={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
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
                {busy ? (
                  <>
                    <span className="bm-login-spinner" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>Sign in &rarr;</>
                )}
              </button>
            </form>

            <div className="bm-login-divider"><span>Trouble signing in?</span></div>

            <div className="bm-login-foot">
              <a href="mailto:support@bharatmithra.in">Contact your administrator</a>
            </div>
          </div>

          <div className="bm-login-legal">
            By signing in you agree that your activity may be reviewed for
            quality and compliance. Unauthorised access is prohibited.
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
