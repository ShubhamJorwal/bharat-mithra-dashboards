import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineBell, HiOutlineRefresh, HiOutlineX, HiOutlineCheck,
  HiOutlinePaperAirplane, HiOutlineSearch, HiOutlineFilter,
  HiOutlineExclamation, HiOutlineInformationCircle, HiOutlineCheckCircle,
  HiOutlineCog, HiOutlineCash, HiOutlineClock, HiOutlineArchive,
  HiOutlineStar, HiOutlineSpeakerphone, HiOutlineChartBar,
  HiOutlineExternalLink, HiOutlineCog as HiOutlineSystem,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import { useToast } from '@/components/common/Toast/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import {
  fetchInbox, markRead, markAllRead, dismiss, togglePin,
  snooze, triggerAction, subscribe,
  CATEGORY_META, SEVERITY_META, fmtRelative,
  type NotificationView, type Category, type Severity,
  type NotificationAction,
} from '@/services/notifications/notificationsStore';
import './NotificationsInbox.scss';

type ViewTab = 'all' | 'unread' | 'pinned';

const CATEGORY_OPTS: { v: Category | ''; label: string }[] = [
  { v: '',             label: 'All categories'   },
  { v: 'operations',   label: 'Operations'       },
  { v: 'financial',    label: 'Financial'        },
  { v: 'task',         label: 'Tasks'            },
  { v: 'announcement', label: 'Announcements'    },
  { v: 'mention',      label: 'Mentions'         },
  { v: 'system',       label: 'System'           },
];

const SEVERITY_OPTS: { v: Severity | ''; label: string }[] = [
  { v: '',         label: 'Any severity' },
  { v: 'critical', label: 'Critical'     },
  { v: 'warning',  label: 'Warning'      },
  { v: 'info',     label: 'Info'         },
  { v: 'success',  label: 'Success'      },
];

const SEVERITY_ICON: Record<Severity, React.ReactNode> = {
  critical: <HiOutlineExclamation />,
  warning:  <HiOutlineExclamation />,
  info:     <HiOutlineInformationCircle />,
  success:  <HiOutlineCheckCircle />,
};

const CATEGORY_ICON: Record<Category, React.ReactNode> = {
  operations:   <HiOutlineCog />,
  financial:    <HiOutlineCash />,
  system:       <HiOutlineSystem />,
  announcement: <HiOutlineSpeakerphone />,
  mention:      <HiOutlineBell />,
  task:         <HiOutlineClock />,
};

const SNOOZE_OPTS = [
  { mins: 15,    label: '15 min'  },
  { mins: 60,    label: '1 hour'  },
  { mins: 240,   label: '4 hours' },
  { mins: 1440,  label: '1 day'   },
];

// ─── Helpers ─────────────────────────────────────────────────────────

const dayBucketLabel = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const y = new Date(today); y.setDate(today.getDate() - 1);
  const start = new Date(d); start.setHours(0,0,0,0);
  if (start.getTime() === today.getTime()) return 'Today';
  if (start.getTime() === y.getTime())     return 'Yesterday';
  const week = 7 * 86_400_000;
  if (today.getTime() - start.getTime() < week) {
    return d.toLocaleDateString('en-IN', { weekday: 'long' });
  }
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Component ───────────────────────────────────────────────────────

const NotificationsInbox = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<ViewTab>('all');
  const [category, setCategory] = useState<Category | ''>('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<NotificationView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [openSnooze, setOpenSnooze] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetchInbox({
      unread: tab === 'unread',
      category: category || undefined,
      severity: severity || undefined,
      limit: 100,
      offset: 0,
    });
    setItems(r.items);
    setTotal(r.total);
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tab, category, severity]);
  useEffect(() => subscribe(() => { void load(); }), []);

  const visible = useMemo(() => {
    let data = items;
    if (tab === 'pinned') data = data.filter(i => i.pinned);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.body?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [items, tab, search]);

  // Group by day (pinned first, ungrouped)
  const grouped = useMemo(() => {
    const pinned: NotificationView[] = [];
    const groups: { label: string; items: NotificationView[] }[] = [];
    const map = new Map<string, NotificationView[]>();
    for (const n of visible) {
      if (n.pinned) { pinned.push(n); continue; }
      const k = dayBucketLabel(n.createdAt);
      const arr = map.get(k) || [];
      arr.push(n);
      map.set(k, arr);
    }
    for (const [label, items] of map.entries()) {
      groups.push({ label, items });
    }
    return { pinned, groups };
  }, [visible]);

  const unreadCount = items.filter(i => !i.readAt).length;
  const pinnedCount = items.filter(i => i.pinned).length;

  const handleClick = async (n: NotificationView) => {
    if (!n.readAt) await markRead(n.recipientId);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  const handleAction = async (e: React.MouseEvent, n: NotificationView, a: NotificationAction) => {
    e.stopPropagation();
    if (a.handler === 'dismiss') {
      await dismiss(n.recipientId);
      return;
    }
    if (a.handler === 'snooze') {
      const mins = (a.payload?.snoozeMinutes as number) || 60;
      await snooze(n.recipientId, mins);
      toast.info('Snoozed', `We'll bring this back in ${mins >= 60 ? `${Math.round(mins/60)}h` : `${mins}m`}.`);
      return;
    }
    if (a.handler === 'link' && a.url) {
      // Record the click as well
      void triggerAction(n.recipientId, a.key);
      navigate(a.url);
      return;
    }
    // callback
    const ok = await triggerAction(n.recipientId, a.key, a.payload || {});
    if (ok) toast.success(`${a.label} recorded`);
    else toast.error('Could not record action');
  };

  const handleMarkAllRead = async () => {
    setBusy(true);
    await markAllRead();
    await load();
    setBusy(false);
  };

  const handleDismiss = async (e: React.MouseEvent, n: NotificationView) => {
    e.stopPropagation();
    await dismiss(n.recipientId);
  };

  const handleTogglePin = async (e: React.MouseEvent, n: NotificationView) => {
    e.stopPropagation();
    await togglePin(n.recipientId);
  };

  const handleSnooze = async (e: React.MouseEvent, n: NotificationView, mins: number) => {
    e.stopPropagation();
    await snooze(n.recipientId, mins);
    setOpenSnooze(null);
    toast.info('Snoozed', `Coming back in ${mins >= 60 ? `${Math.round(mins/60)}h` : `${mins}m`}.`);
  };

  const renderRow = (n: NotificationView) => {
    const unread = !n.readAt;
    const acted = !!n.actionTaken;
    const sev = SEVERITY_META[n.severity];
    return (
      <li
        key={n.recipientId}
        className={`bm-notif-row sev-${n.severity} ${unread ? 'unread' : 'read'} ${n.pinned ? 'pinned' : ''} ${acted ? 'acted' : ''}`}
        onClick={() => void handleClick(n)}
      >
        {/* Severity rail */}
        <div className="bm-notif-row-rail" />

        {/* Icon */}
        <div className="bm-notif-row-icon" style={{ color: sev.color }}>
          {CATEGORY_ICON[n.category]}
        </div>

        {/* Body */}
        <div className="bm-notif-row-body">
          <div className="bm-notif-row-line1">
            <span className="bm-notif-row-title">{n.title}</span>
            <span className={`bm-notif-row-cat cat-${n.category}`}>
              {CATEGORY_META[n.category].label}
            </span>
            <span className={`bm-notif-row-sev sev-${n.severity}`}>
              {SEVERITY_ICON[n.severity]} {sev.label}
            </span>
            {n.pinned && <span className="bm-notif-row-pinned">PINNED</span>}
          </div>
          {n.body && <div className="bm-notif-row-body-text">{n.body}</div>}

          {/* Inline actions */}
          {n.actions && n.actions.length > 0 && (
            <div className="bm-notif-row-acts">
              {n.actions.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  className={`bm-notif-row-act bm-notif-row-act-${a.style || 'primary'} ${acted && n.actionTaken === a.key ? 'taken' : ''}`}
                  onClick={(e) => void handleAction(e, n, a)}
                  disabled={acted}
                  title={acted ? `Already responded with "${n.actionTaken}"` : undefined}
                >
                  {a.label}
                  {acted && n.actionTaken === a.key && <HiOutlineCheck />}
                </button>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="bm-notif-row-meta">
            <span><HiOutlineClock /> {fmtRelative(n.createdAt)}</span>
            {n.actionLabel && n.actionUrl && (
              <span className="bm-notif-row-action">
                <HiOutlineExternalLink /> {n.actionLabel}
              </span>
            )}
            {n.channelsRequested.length > 1 && (
              <span className="bm-notif-row-channels">
                {n.channelsRequested.map(c => <span key={c}>{c}</span>)}
              </span>
            )}
            {acted && n.actionTakenAt && (
              <span className="bm-notif-row-acted">
                Responded "{n.actionTaken}" {fmtRelative(n.actionTakenAt)}
              </span>
            )}
          </div>
        </div>

        {/* Right-side actions */}
        <div className="bm-notif-row-side">
          <button
            className="bm-notif-row-btn"
            onClick={(e) => void handleTogglePin(e, n)}
            title={n.pinned ? 'Unpin' : 'Pin'}
          >
            <HiOutlineStar style={n.pinned ? { color: '#f59e0b', fill: '#f59e0b' } : {}} />
          </button>
          <div className="bm-notif-row-snooze">
            <button
              className="bm-notif-row-btn"
              onClick={(e) => { e.stopPropagation(); setOpenSnooze(openSnooze === n.recipientId ? null : n.recipientId); }}
              title="Snooze"
            >
              <HiOutlineClock />
            </button>
            {openSnooze === n.recipientId && (
              <div className="bm-notif-snooze-menu" onClick={e => e.stopPropagation()}>
                <span className="bm-notif-snooze-menu-head">Remind me in…</span>
                {SNOOZE_OPTS.map(o => (
                  <button key={o.mins} onClick={(e) => void handleSnooze(e, n, o.mins)}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="bm-notif-row-btn"
            onClick={(e) => void handleDismiss(e, n)}
            title="Archive"
          >
            <HiOutlineArchive />
          </button>
        </div>

        {unread && <span className="bm-notif-row-dot" />}
      </li>
    );
  };

  // Derived stats for the hero strip
  const actedCount = items.filter(i => i.actionTaken).length;

  return (
    <div className="bm-notif">
      <PageHeader
        icon={<HiOutlineBell />}
        title="Notifications"
        description="Stay on top of every update — applications, team broadcasts, wallet activity, and more."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bm-btn" onClick={() => void load()} title="Refresh">
              <HiOutlineRefresh />
            </button>
            <Link to="/notifications/analytics" className="bm-btn">
              <HiOutlineChartBar /> Analytics
            </Link>
            <Link to="/notifications/compose" className="bm-btn bm-btn-primary">
              <HiOutlinePaperAirplane /> Compose
            </Link>
          </div>
        }
      />

      {/* ─── Hero KPI strip ─── */}
      <div className="bm-notif-hero">
        <div className="bm-notif-hero-main">
          <div className="bm-notif-hero-eyebrow">
            <HiOutlineBell /> Inbox
          </div>
          <div className="bm-notif-hero-num">{unreadCount}</div>
          <div className="bm-notif-hero-tagline">
            {unreadCount === 0
              ? "You're all caught up. Nothing waiting for you."
              : `${unreadCount === 1 ? 'notification' : 'notifications'} waiting for your attention`}
          </div>
          <div className="bm-notif-hero-actions">
            {unreadCount > 0 && (
              <button className="bm-notif-hero-btn" onClick={handleMarkAllRead} disabled={busy}>
                <HiOutlineCheck /> Mark all read
              </button>
            )}
            <Link to="/notifications/compose" className="bm-notif-hero-btn">
              <HiOutlinePaperAirplane /> New broadcast
            </Link>
          </div>
        </div>

        <div className="bm-notif-stat tone-pinned">
          <div className="bm-notif-stat-icon"><HiOutlineStar /></div>
          <div className="bm-notif-stat-num">{pinnedCount}</div>
          <div className="bm-notif-stat-label">Pinned</div>
        </div>
        <div className="bm-notif-stat tone-actioned">
          <div className="bm-notif-stat-icon"><HiOutlineLightningBolt /></div>
          <div className="bm-notif-stat-num">{actedCount}</div>
          <div className="bm-notif-stat-label">You responded</div>
        </div>
        <div className="bm-notif-stat tone-archived">
          <div className="bm-notif-stat-icon"><HiOutlineArchive /></div>
          <div className="bm-notif-stat-num">{total}</div>
          <div className="bm-notif-stat-label">Total in inbox</div>
        </div>
      </div>

      {/* ─── Toolbar: tabs + filters ─── */}
      <div className="bm-notif-toolbar">
        <div className="bm-notif-tabs">
          <button className={`bm-notif-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
            All <span className="bm-notif-tab-count">{total}</span>
          </button>
          <button className={`bm-notif-tab ${tab === 'unread' ? 'active' : ''}`} onClick={() => setTab('unread')}>
            Unread {unreadCount > 0 && <span className="bm-notif-tab-count primary">{unreadCount}</span>}
          </button>
          <button className={`bm-notif-tab ${tab === 'pinned' ? 'active' : ''}`} onClick={() => setTab('pinned')}>
            <HiOutlineStar /> Pinned {pinnedCount > 0 && <span className="bm-notif-tab-count">{pinnedCount}</span>}
          </button>
        </div>

        <div className="bm-notif-filters">
          <div className="bm-notif-search">
            <HiOutlineSearch />
            <input
              placeholder="Search title, body…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')}><HiOutlineX /></button>}
          </div>
          <div className="bm-notif-filter-pill">
            <HiOutlineFilter />
            <select value={category} onChange={e => setCategory(e.target.value as Category | '')}>
              {CATEGORY_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
          <div className="bm-notif-filter-pill">
            <HiOutlineExclamation />
            <select value={severity} onChange={e => setSeverity(e.target.value as Severity | '')}>
              {SEVERITY_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      {loading ? (
        <div className="bm-notif-loading">
          <div className="bm-notif-skel" />
          <div className="bm-notif-skel" />
          <div className="bm-notif-skel" />
        </div>
      ) : visible.length === 0 ? (
        <div className="bm-notif-empty-wrap">
          <div className="bm-notif-empty-icon"><HiOutlineBell /></div>
          <h3 className="bm-notif-empty-title">
            {tab === 'unread' ? 'Inbox zero — nice work' :
             tab === 'pinned' ? 'Nothing pinned yet' :
             'No notifications yet'}
          </h3>
          <p className="bm-notif-empty-desc">
            {tab === 'all'
              ? "Updates from applications, the team, wallet activity, and broadcasts will land here in real time."
              : tab === 'unread'
                ? "You've read everything in your inbox. Pour yourself a coffee."
                : "Tap the star on any notification to pin it and keep it at the top of your list."}
          </p>
          <Link to="/notifications/compose" className="bm-btn bm-btn-primary">
            <HiOutlinePaperAirplane /> Send a notification
          </Link>
        </div>
      ) : (
        <>
          {/* Pinned banner */}
          {grouped.pinned.length > 0 && (
            <div className="bm-notif-section">
              <h4 className="bm-notif-section-h">
                <HiOutlineStar /> Pinned
              </h4>
              <ul className="bm-notif-list">
                {grouped.pinned.map(renderRow)}
              </ul>
            </div>
          )}
          {grouped.groups.map(g => (
            <div key={g.label} className="bm-notif-section">
              <h4 className="bm-notif-section-h">{g.label}</h4>
              <ul className="bm-notif-list">
                {g.items.map(renderRow)}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default NotificationsInbox;
