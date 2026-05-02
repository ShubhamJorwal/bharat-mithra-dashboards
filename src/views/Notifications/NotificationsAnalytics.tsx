import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineChartBar, HiOutlineArrowLeft, HiOutlineRefresh,
  HiOutlinePaperAirplane, HiOutlineUserGroup, HiOutlineEye,
  HiOutlineCursorClick, HiOutlineLightningBolt,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import {
  fetchAnalytics, CATEGORY_META, SEVERITY_META,
  type NotifAnalytics, type Category, type Severity,
} from '@/services/notifications/notificationsStore';
import './NotificationsAnalytics.scss';

const RANGES = [
  { v: 7,   label: '7 days'  },
  { v: 30,  label: '30 days' },
  { v: 90,  label: '90 days' },
];

const fmtPct = (n: number): string => `${(n * 100).toFixed(1)}%`;
const fmtNum = (n: number): string => new Intl.NumberFormat('en-IN').format(n);

const NotificationsAnalytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<NotifAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const d = await fetchAnalytics(days);
    setData(d);
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [days]);

  // Sparkline chart bounds
  const sparkPath = useMemo(() => {
    if (!data || !data.last30Days || data.last30Days.length === 0) return '';
    const pts = data.last30Days;
    const max = Math.max(1, ...pts.map(p => p.sent));
    const w = 600;
    const h = 120;
    const stepX = w / Math.max(1, pts.length - 1);
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * stepX).toFixed(1)} ${(h - (p.sent / max) * h).toFixed(1)}`)
      .join(' ');
  }, [data]);

  return (
    <div className="bm-an">
      <PageHeader
        icon={<HiOutlineChartBar />}
        title="Notification analytics"
        description="See how your notifications perform — sent, read, clicked, and which actions get the most response."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="bm-an-range"
              value={days}
              onChange={e => setDays(parseInt(e.target.value))}
            >
              {RANGES.map(r => <option key={r.v} value={r.v}>Last {r.label}</option>)}
            </select>
            <button className="bm-btn" onClick={() => void load()}>
              <HiOutlineRefresh />
            </button>
            <Link to="/notifications/compose" className="bm-btn bm-btn-primary">
              <HiOutlinePaperAirplane /> Compose
            </Link>
            <Link to="/notifications" className="bm-btn">
              <HiOutlineArrowLeft /> Inbox
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="bm-an-loading">Loading analytics…</div>
      ) : !data ? (
        <div className="bm-an-empty">
          <p>Couldn't load analytics. Backend may need migration 215 or the endpoint isn't reachable.</p>
        </div>
      ) : (
        <>
          {/* ─── Headline KPIs ─── */}
          <div className="bm-an-kpis">
            <div className="bm-an-kpi tone-primary">
              <div className="bm-an-kpi-icon"><HiOutlinePaperAirplane /></div>
              <div className="bm-an-kpi-body">
                <div className="bm-an-kpi-num">{fmtNum(data.totalSent)}</div>
                <div className="bm-an-kpi-label">Notifications sent</div>
              </div>
            </div>
            <div className="bm-an-kpi tone-info">
              <div className="bm-an-kpi-icon"><HiOutlineUserGroup /></div>
              <div className="bm-an-kpi-body">
                <div className="bm-an-kpi-num">{fmtNum(data.totalRecipients)}</div>
                <div className="bm-an-kpi-label">Total recipients</div>
              </div>
            </div>
            <div className="bm-an-kpi tone-success">
              <div className="bm-an-kpi-icon"><HiOutlineEye /></div>
              <div className="bm-an-kpi-body">
                <div className="bm-an-kpi-num">{fmtPct(data.readRate)}</div>
                <div className="bm-an-kpi-label">Read rate</div>
                <div className="bm-an-kpi-sub">{fmtNum(data.totalRead)} of {fmtNum(data.totalRecipients)}</div>
              </div>
            </div>
            <div className="bm-an-kpi tone-warn">
              <div className="bm-an-kpi-icon"><HiOutlineCursorClick /></div>
              <div className="bm-an-kpi-body">
                <div className="bm-an-kpi-num">{fmtPct(data.clickRate)}</div>
                <div className="bm-an-kpi-label">Action / click rate</div>
                <div className="bm-an-kpi-sub">{fmtNum(data.totalClicked)} actions taken</div>
              </div>
            </div>
          </div>

          {/* ─── Volume chart ─── */}
          <div className="bm-an-card">
            <div className="bm-an-card-head">
              <h3>Volume — last {days} days</h3>
              <span className="bm-an-card-sub">Notifications sent per day</span>
            </div>
            {data.last30Days.length === 0 ? (
              <div className="bm-an-chart-empty">No notifications sent in this range.</div>
            ) : (
              <svg viewBox="0 0 600 120" className="bm-an-spark" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bm-an-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Fill */}
                <path
                  d={`${sparkPath} L 600 120 L 0 120 Z`}
                  fill="url(#bm-an-fill)"
                />
                {/* Stroke */}
                <path
                  d={sparkPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                {/* Bars (subtle) */}
                {data.last30Days.map((p, i, arr) => {
                  const max = Math.max(1, ...arr.map(x => x.sent));
                  const stepX = 600 / Math.max(1, arr.length - 1);
                  const x = i * stepX;
                  const h = (p.sent / max) * 120;
                  return (
                    <circle key={i} cx={x.toFixed(1)} cy={(120 - h).toFixed(1)} r="3" fill="#3b82f6">
                      <title>{p.date}: {p.sent} sent</title>
                    </circle>
                  );
                })}
              </svg>
            )}
            {/* X-axis labels: first, middle, last */}
            {data.last30Days.length > 1 && (
              <div className="bm-an-spark-x">
                <span>{data.last30Days[0].date}</span>
                <span>{data.last30Days[Math.floor(data.last30Days.length / 2)].date}</span>
                <span>{data.last30Days[data.last30Days.length - 1].date}</span>
              </div>
            )}
          </div>

          {/* ─── By category + severity ─── */}
          <div className="bm-an-row-2">
            <div className="bm-an-card">
              <div className="bm-an-card-head">
                <h3>By category</h3>
                <span className="bm-an-card-sub">Where your notifications come from</span>
              </div>
              <BarRows
                rows={Object.entries(data.byCategory).map(([k, v]) => ({
                  key: k,
                  label: CATEGORY_META[k as Category]?.label || k,
                  emoji: CATEGORY_META[k as Category]?.emoji || '',
                  color: CATEGORY_META[k as Category]?.color || '#3b82f6',
                  sent: v.sent,
                  recipients: v.recipients,
                }))}
              />
            </div>

            <div className="bm-an-card">
              <div className="bm-an-card-head">
                <h3>By severity</h3>
                <span className="bm-an-card-sub">How urgent the notifications are</span>
              </div>
              <BarRows
                rows={Object.entries(data.bySeverity).map(([k, v]) => ({
                  key: k,
                  label: SEVERITY_META[k as Severity]?.label || k,
                  emoji: '',
                  color: SEVERITY_META[k as Severity]?.color || '#3b82f6',
                  sent: v.sent,
                  recipients: v.recipients,
                }))}
              />
            </div>
          </div>

          {/* ─── Top action responses ─── */}
          <div className="bm-an-card">
            <div className="bm-an-card-head">
              <h3><HiOutlineLightningBolt /> Top action responses</h3>
              <span className="bm-an-card-sub">Which inline buttons recipients click most</span>
            </div>
            {data.topActions.length === 0 ? (
              <div className="bm-an-chart-empty">No action responses yet. Add inline buttons in your notifications.</div>
            ) : (
              <div className="bm-an-actions-grid">
                {data.topActions.map(t => (
                  <div key={t.actionKey} className="bm-an-action">
                    <div className="bm-an-action-key">{t.actionKey}</div>
                    <div className="bm-an-action-count">{fmtNum(t.count)}</div>
                    <div className="bm-an-action-label">responses</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Helper: bar rows ────────────────────────────────────────────────

interface BarRow {
  key: string;
  label: string;
  emoji: string;
  color: string;
  sent: number;
  recipients: number;
}

const BarRows = ({ rows }: { rows: BarRow[] }) => {
  if (rows.length === 0) return <div className="bm-an-chart-empty">No data yet.</div>;
  const max = Math.max(1, ...rows.map(r => r.sent));
  return (
    <ul className="bm-an-bars">
      {rows.sort((a, b) => b.sent - a.sent).map(r => {
        const pct = (r.sent / max) * 100;
        return (
          <li key={r.key}>
            <div className="bm-an-bar-head">
              <span className="bm-an-bar-name">
                {r.emoji && <span className="bm-an-bar-emoji">{r.emoji}</span>}
                {r.label}
              </span>
              <span className="bm-an-bar-vals">
                <strong>{fmtNum(r.sent)}</strong> sent · <em>{fmtNum(r.recipients)}</em> recipients
              </span>
            </div>
            <div className="bm-an-bar-track">
              <div
                className="bm-an-bar-fill"
                style={{ width: `${pct}%`, background: r.color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default NotificationsAnalytics;
