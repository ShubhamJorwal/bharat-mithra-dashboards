import { useEffect, useState } from 'react';
import {
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import {
  getCatalogue,
  getHealth,
  getRecentCalls,
  type SurepassService,
  type SurepassHealth,
  type SurepassCallRow,
} from '@/services/surepass/surepassStore';
import './SurepassCatalogue.scss';

// Group label + accent colour for each Surepass category we render.
const CATEGORY_META: Record<string, { label: string; accent: string }> = {
  identity: { label: 'Identity & KYC',  accent: '#7c8cff' },
  banking:  { label: 'Banking & Payments', accent: '#22c55e' },
  business: { label: 'Business & Corporate', accent: '#f59e0b' },
  vehicle:  { label: 'Vehicle & Driving',    accent: '#c084fc' },
  employment: { label: 'Employment & EPFO',  accent: '#38bdf8' },
  utility:  { label: 'Utility & Telecom',    accent: '#f472b6' },
};

const formatPaise = (paise: number) => {
  if (paise === 0) return 'Free';
  return `₹${(paise / 100).toFixed(paise % 100 === 0 ? 0 : 2)}`;
};

const SurepassCatalogue = () => {
  const [services, setServices] = useState<SurepassService[]>([]);
  const [health, setHealth] = useState<SurepassHealth | null>(null);
  const [recent, setRecent] = useState<SurepassCallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [svc, h, calls] = await Promise.all([
        getCatalogue().catch(() => []),
        getHealth().catch(() => null),
        getRecentCalls().catch(() => []),
      ]);
      setServices(svc);
      setHealth(h);
      setRecent(calls);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load Surepass data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  // Group services by category for the section list.
  const grouped: Record<string, SurepassService[]> = {};
  for (const s of services) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }
  const categoryOrder = Object.keys(grouped).sort((a, b) => {
    const order = ['identity', 'banking', 'business', 'vehicle', 'employment', 'utility'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const enabledCount = services.filter(s => s.enabled).length;
  const pendingCount = services.length - enabledCount;

  return (
    <div className="sp-catalogue">
      {/* ─── Hero ───────────────────────────────────────────────── */}
      <div className="sp-hero">
        <div className="sp-hero__main">
          <div className="sp-hero__icon">
            <HiOutlineShieldCheck />
          </div>
          <div>
            <h1>KYC & Verification (Surepass)</h1>
            <p>
              Identity, banking, business and vehicle verifications powered by Surepass.
              Each service is integrated separately with its own form and audit trail.
            </p>
          </div>
        </div>

        <div className="sp-hero__stats">
          <div className="sp-hero__stat">
            <div className="sp-hero__n">{services.length}</div>
            <div className="sp-hero__l">In catalogue</div>
          </div>
          <div className="sp-hero__stat sp-hero__stat--good">
            <div className="sp-hero__n">{enabledCount}</div>
            <div className="sp-hero__l">Enabled</div>
          </div>
          <div className="sp-hero__stat sp-hero__stat--warn">
            <div className="sp-hero__n">{pendingCount}</div>
            <div className="sp-hero__l">Sandbox pending</div>
          </div>
        </div>
      </div>

      {/* ─── Health bar ─────────────────────────────────────────── */}
      <div className={`sp-health ${health?.configured ? 'sp-health--ok' : 'sp-health--off'}`}>
        <div className="sp-health__dot" />
        <div className="sp-health__txt">
          {health?.configured ? (
            <>
              <b>API token configured.</b> Hitting <code>{health.baseUrl}</code>
              {' '}({health.environment}).
            </>
          ) : (
            <>
              <b>API token not set.</b> Add <code>SUREPASS_API_TOKEN</code> in App Runner
              environment variables, then click Refresh.
            </>
          )}
        </div>
        <button className="sp-btn" onClick={() => void load()} disabled={loading}>
          <HiOutlineRefresh /> Refresh
        </button>
      </div>

      {error && (
        <div className="sp-error">
          <HiOutlineExclamationCircle /> {error}
        </div>
      )}

      {/* ─── Category sections ─────────────────────────────────── */}
      {loading && services.length === 0 ? (
        <div className="sp-empty">Loading services…</div>
      ) : services.length === 0 ? (
        <div className="sp-empty">
          No services in the catalogue yet. Run migration 216 to seed the
          initial 4 services from the Surepass proposal.
        </div>
      ) : (
        categoryOrder.map(cat => {
          const meta = CATEGORY_META[cat] || { label: cat, accent: '#7c8cff' };
          return (
            <section key={cat} className="sp-section">
              <h2 className="sp-section__title">
                <span className="sp-section__bar" style={{ background: meta.accent }} />
                {meta.label}
                <span className="sp-section__count">{grouped[cat].length}</span>
              </h2>

              <div className="sp-grid">
                {grouped[cat].map(s => (
                  <div
                    key={s.slug}
                    className={`sp-card ${s.enabled ? '' : 'sp-card--disabled'}`}
                  >
                    <div className="sp-card__head">
                      <div className="sp-card__icon" style={{ background: `${meta.accent}22`, color: meta.accent }}>
                        {s.icon || s.name.charAt(0)}
                      </div>
                      <div className="sp-card__name">
                        <h3>{s.name}</h3>
                        {!s.enabled && <span className="sp-pill sp-pill--warn">Sandbox pending</span>}
                        {s.enabled && <span className="sp-pill sp-pill--good">Active</span>}
                      </div>
                    </div>

                    {s.description && <p className="sp-card__desc">{s.description}</p>}

                    <div className="sp-card__meta">
                      <div className="sp-card__row">
                        <span>Cost</span>
                        <b>{formatPaise(s.costPaise)}</b>
                      </div>
                      <div className="sp-card__row">
                        <span>Sell</span>
                        <b>{formatPaise(s.pricePaise)}</b>
                      </div>
                      <div className="sp-card__row">
                        <span>Margin</span>
                        <b style={{ color: '#22c55e' }}>{formatPaise(s.pricePaise - s.costPaise)}</b>
                      </div>
                    </div>

                    <div className="sp-card__foot">
                      <code>{s.endpoint}</code>
                      <button
                        className="sp-card__try"
                        disabled={!s.enabled}
                        title={s.enabled ? 'Open service form' : 'Service not yet activated by Surepass'}
                      >
                        Run <HiOutlineExternalLink />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}

      {/* ─── Recent calls ─────────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="sp-section">
          <h2 className="sp-section__title">
            <span className="sp-section__bar" style={{ background: '#98a3d8' }} />
            Recent calls
            <span className="sp-section__count">{recent.length}</span>
          </h2>
          <div className="sp-table">
            <div className="sp-table__head">
              <span>When</span>
              <span>Service</span>
              <span>Status</span>
              <span>Billable</span>
              <span>Latency</span>
              <span>Env</span>
            </div>
            {recent.map(r => (
              <div key={r.id} className="sp-table__row">
                <span title={r.createdAt}>{new Date(r.createdAt).toLocaleString()}</span>
                <span><code>{r.serviceSlug}</code></span>
                <span className={r.success ? 'sp-status sp-status--ok' : 'sp-status sp-status--err'}>
                  {r.success ? <HiOutlineCheckCircle /> : <HiOutlineExclamationCircle />}
                  {r.responseStatus ?? '—'}
                </span>
                <span>{r.isBillable ? 'Yes' : 'No'}</span>
                <span><HiOutlineClock /> {r.durationMs ?? '—'}ms</span>
                <span>{r.environment}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SurepassCatalogue;
