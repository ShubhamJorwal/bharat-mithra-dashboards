import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineBell, HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineX,
  HiOutlinePaperAirplane, HiOutlineSearch, HiOutlineFilter,
  HiOutlineExclamation, HiOutlineInformationCircle, HiOutlineSpeakerphone,
  HiOutlineCog, HiOutlineCash, HiOutlineClock, HiOutlineArchive,
  HiOutlineStar, HiOutlineCheck,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import {
  fetchInbox, markRead, markAllRead, dismiss, togglePin, subscribe,
  CATEGORY_META, SEVERITY_META, fmtRelative,
  type NotificationView, type Category, type Severity,
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
  system:       <HiOutlineCog />,
  announcement: <HiOutlineSpeakerphone />,
  mention:      <HiOutlineBell />,
  task:         <HiOutlineClock />,
};

const NotificationsInbox = () => {
  const [tab, setTab] = useState<ViewTab>('all');
  const [category, setCategory] = useState<Category | ''>('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<NotificationView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

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

  const unreadCount = items.filter(i => !i.readAt).length;
  const pinnedCount = items.filter(i => i.pinned).length;

  const handleClick = async (n: NotificationView) => {
    if (!n.readAt) await markRead(n.recipientId);
    if (n.actionUrl) navigate(n.actionUrl);
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

  return (
    <div className="bm-notif">
      <PageHeader
        icon={<HiOutlineBell />}
        title="Notifications"
        description={`${total} total · ${unreadCount} unread${pinnedCount ? ` · ${pinnedCount} pinned` : ''}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bm-btn" onClick={() => void load()} title="Refresh">
              <HiOutlineRefresh />
            </button>
            {unreadCount > 0 && (
              <button className="bm-btn" onClick={handleMarkAllRead} disabled={busy}>
                <HiOutlineCheck /> Mark all read
              </button>
            )}
            <Link to="/notifications/compose" className="bm-btn bm-btn-primary">
              <HiOutlinePaperAirplane /> Compose
            </Link>
          </div>
        }
      />

      {/* Tabs */}
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

      {/* Filters */}
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
        <div className="bm-notif-filter">
          <HiOutlineFilter />
          <select value={category} onChange={e => setCategory(e.target.value as Category | '')}>
            {CATEGORY_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
          <select value={severity} onChange={e => setSeverity(e.target.value as Severity | '')}>
            {SEVERITY_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bm-notif-loading">Loading…</div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<HiOutlineBell />}
          title={
            tab === 'unread' ? 'No unread notifications' :
            tab === 'pinned' ? 'No pinned notifications' :
            'No notifications yet'
          }
          description={
            tab === 'all'
              ? "When applications change status, wallet activity happens, or admins broadcast updates — you'll see them here."
              : 'Try a different filter or tab.'
          }
          size="lg"
        />
      ) : (
        <ul className="bm-notif-list">
          {visible.map(n => (
            <li
              key={n.recipientId}
              className={`bm-notif-row sev-${n.severity} ${n.readAt ? 'read' : 'unread'} ${n.pinned ? 'pinned' : ''}`}
              onClick={() => void handleClick(n)}
            >
              <div className="bm-notif-row-icon" style={{ color: SEVERITY_META[n.severity].color }}>
                {CATEGORY_ICON[n.category]}
              </div>
              <div className="bm-notif-row-body">
                <div className="bm-notif-row-line1">
                  <span className="bm-notif-row-title">{n.title}</span>
                  <span className={`bm-notif-row-cat cat-${n.category}`}>
                    {CATEGORY_META[n.category].label}
                  </span>
                  <span className={`bm-notif-row-sev sev-${n.severity}`}>
                    {SEVERITY_ICON[n.severity]} {SEVERITY_META[n.severity].label}
                  </span>
                </div>
                {n.body && <div className="bm-notif-row-body-text">{n.body}</div>}
                <div className="bm-notif-row-meta">
                  <span>{fmtRelative(n.createdAt)}</span>
                  {n.actionLabel && n.actionUrl && (
                    <span className="bm-notif-row-action">→ {n.actionLabel}</span>
                  )}
                </div>
              </div>
              <div className="bm-notif-row-actions">
                <button
                  className="bm-notif-row-btn"
                  onClick={(e) => void handleTogglePin(e, n)}
                  title={n.pinned ? 'Unpin' : 'Pin'}
                >
                  <HiOutlineStar style={n.pinned ? { color: '#f59e0b', fill: '#f59e0b' } : {}} />
                </button>
                <button
                  className="bm-notif-row-btn"
                  onClick={(e) => void handleDismiss(e, n)}
                  title="Dismiss"
                >
                  <HiOutlineArchive />
                </button>
              </div>
              {!n.readAt && <span className="bm-notif-row-dot" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsInbox;
