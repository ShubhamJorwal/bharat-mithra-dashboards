import { useState, useRef, useEffect, useCallback, useMemo, type FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineCollection,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineCamera,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineCalendar,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineBadgeCheck,
  HiOutlineHome,
  HiOutlineGlobe,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineMenu,
} from 'react-icons/hi';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import InfinityLogo from '../../common/InfinityLogo/InfinityLogo';
import { loadTransactions, computeSnapshot, subscribe, type WalletTransaction } from '@/services/wallet/walletStore';
import {
  fetchInbox, fetchUnreadCount, markRead, markAllRead,
  subscribe as subscribeNotifications, fmtRelative as fmtNotifTime,
  type NotificationView,
} from '@/services/notifications/notificationsStore';
import './Topbar.scss';

// Brand text animation variants — one picked randomly on each mount/refresh
const brandAnimations = [
  'brand-anim-typewriter',
  'brand-anim-slide-up',
  'brand-anim-slide-in',
  'brand-anim-blur-in',
  'brand-anim-bounce-in',
  'brand-anim-flip-in',
  'brand-anim-glow-in',
  'brand-anim-wave',
] as const;

const BharatMithraLogo: FC = () => {
  const animClass = useMemo(
    () => brandAnimations[Math.floor(Math.random() * brandAnimations.length)],
    []
  );
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    // Delay animation until after splash screen finishes (3.2s)
    const timer = setTimeout(() => setAnimReady(true), 3300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bm-topbar-brand">
      <InfinityLogo size="sm" />
      <div className={`bm-brand-text ${animReady ? animClass : ''}`}>
        <span className="bm-brand-bharat">Bharat</span>
        <span className="bm-brand-space">&nbsp;</span>
        <span className="bm-brand-mithra">Mithra</span>
      </div>
    </div>
  );
};

interface HistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

const getPageTitle = (path: string): string => {
  const routes: Record<string, string> = {
    '/': 'Dashboard',
    '/services': 'Services',
    '/services/new': 'Create Service',
    '/services/categories': 'Categories',
    '/services/categories/new': 'Create Category',
    '/applications': 'Applications',
    '/users': 'Users',
    '/analytics': 'Analytics',
    '/reports': 'Reports',
    '/updates': 'Updates',
    '/settings': 'Settings',
    '/profile': 'Profile',
    '/help': 'Help & Support',
  };

  // Check for dynamic routes
  if (path.match(/\/services\/[^/]+\/edit/)) return 'Edit Service';
  if (path.match(/\/services\/categories\/[^/]+\/edit/)) return 'Edit Category';
  if (path.match(/\/users\/[^/]+/)) return 'User Details';

  return routes[path] || 'Page';
};

// Static data - will come from API later
const dashboardInfo = {
  name: 'Agent Dashboard',
  agentName: 'Thimma Shetty'
};

// Profile mock data
const profileData = {
  firstName: 'Thimma',
  lastName: 'Shetty',
  username: 'thimma.shetty',
  email: 'thimma.shetty@gov.in',
  mobile: '+91 98765 43210',
  role: 'Agent',
  joinedAt: '15 Jan 2025',
  verified: true,
  photoUrl: '',
};

const fmtRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

// Command-palette suggestions, grouped by section.
// Each section renders as its own block in the popup. Live-filtered against
// the search query in the JSX below.
type CmdItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  path: string;
  keywords?: string;
  group: 'actions' | 'pages' | 'recents';
};

const commandItems: CmdItem[] = [
  // Quick actions — verbs the user can do in one click
  { icon: HiOutlinePlus,            label: 'New application',     hint: 'Create',       path: '/applications/new',     keywords: 'add new create application',  group: 'actions' },
  { icon: HiOutlinePlus,            label: 'Add staff',           hint: 'Invite',       path: '/staff/new',            keywords: 'add new invite staff team',   group: 'actions' },
  { icon: HiOutlinePlus,            label: 'Add service',         hint: 'Catalog',      path: '/services/new',         keywords: 'add new service catalog',     group: 'actions' },
  { icon: HiOutlineCreditCard,      label: 'Top up wallet',       hint: 'Money in',     path: '/wallet',               keywords: 'wallet money credit add',     group: 'actions' },

  // Pages — main destinations
  { icon: HiOutlineHome,            label: 'Dashboard',           hint: 'Overview',     path: '/',                     keywords: 'dashboard overview home',     group: 'pages' },
  { icon: HiOutlineCollection,      label: 'Services',            hint: 'Catalog',      path: '/services',             keywords: 'services catalog',            group: 'pages' },
  { icon: HiOutlineDocumentText,    label: 'Applications',        hint: 'All',          path: '/applications',         keywords: 'applications cases',          group: 'pages' },
  { icon: HiOutlineUserGroup,       label: 'Users',               hint: 'Citizens',     path: '/users',                keywords: 'users citizens customers',    group: 'pages' },
  { icon: HiOutlineUserGroup,       label: 'Staff',               hint: 'Team',         path: '/staff',                keywords: 'staff team employees',        group: 'pages' },
  { icon: HiOutlineGlobe,           label: 'Geography',           hint: 'India',        path: '/geography',            keywords: 'geography india states',      group: 'pages' },
  { icon: HiOutlineChartBar,        label: 'Reports',             hint: 'Analytics',    path: '/reports',              keywords: 'reports analytics insights',  group: 'pages' },
  { icon: HiOutlineCreditCard,      label: 'Wallet',              hint: 'Balance',      path: '/wallet',               keywords: 'wallet balance money',        group: 'pages' },
  { icon: HiOutlineCog,             label: 'Settings',            hint: 'Preferences',  path: '/settings',             keywords: 'settings preferences theme',  group: 'pages' },
];

interface TopbarProps {
  // Provided by DashboardLayout when the layout is in mobile (drawer) mode.
  isMobile?: boolean;
  isDrawerOpen?: boolean;
  onMenuClick?: () => void;
}

const Topbar = ({ isMobile = false, isDrawerOpen = false, onMenuClick }: TopbarProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { logout: doLogout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [walletTxns, setWalletTxns] = useState<WalletTransaction[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  // Live notifications — backed by /api/v1/notifications
  const [notifItems, setNotifItems] = useState<NotificationView[]>([]);
  const [notifUnread, setNotifUnread] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const [r, n] = await Promise.all([fetchInbox({ limit: 8 }), fetchUnreadCount()]);
      if (cancelled) return;
      setNotifItems(r.items);
      setNotifUnread(n);
    };
    void refresh();
    // Re-poll on focus + every 60s in the background
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    const t = setInterval(() => { void refresh(); }, 60_000);
    const unsub = subscribeNotifications(() => { void refresh(); });
    return () => {
      cancelled = true;
      clearInterval(t);
      window.removeEventListener('focus', onFocus);
      unsub();
    };
  }, []);

  // Live wallet data — subscribes to walletStore changes
  useEffect(() => {
    const refresh = () => setWalletTxns(loadTransactions());
    refresh();
    return subscribe(refresh);
  }, []);

  const walletSnapshot = useMemo(() => computeSnapshot(walletTxns), [walletTxns]);
  const walletRecent = useMemo(() => walletTxns.slice(0, 5), [walletTxns]);

  // Track navigation history
  useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
      return;
    }

    const newItem: HistoryItem = {
      path: location.pathname,
      title: getPageTitle(location.pathname),
      timestamp: Date.now()
    };

    setHistory(prev => {
      // If we're not at the end, remove forward history
      const trimmed = historyIndex >= 0 ? prev.slice(0, historyIndex + 1) : prev;
      // Don't add duplicate consecutive items
      if (trimmed.length > 0 && trimmed[trimmed.length - 1].path === newItem.path) {
        return trimmed;
      }
      // Keep max 20 items
      const updated = [...trimmed, newItem].slice(-20);
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [location.pathname]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const handleGoBack = useCallback(() => {
    if (canGoBack) {
      setIsNavigating(true);
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      navigate(history[newIndex].path);
    }
  }, [canGoBack, historyIndex, history, navigate]);

  const handleGoForward = useCallback(() => {
    if (canGoForward) {
      setIsNavigating(true);
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      navigate(history[newIndex].path);
    }
  }, [canGoForward, historyIndex, history, navigate]);

  const handleHistoryItemClick = useCallback((index: number) => {
    setIsNavigating(true);
    setHistoryIndex(index);
    navigate(history[index].path);
    setShowHistory(false);
  }, [history, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setShowWallet(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchNavigate = (path: string) => {
    navigate(path);
    setShowSearch(false);
    setSearchQuery('');
    setSearchSelectedIndex(0);
  };

  // Live-filter command-palette items by query (matches label + keywords)
  const filteredCommandItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return commandItems;
    return commandItems.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      (item.keywords || '').toLowerCase().includes(q) ||
      (item.hint || '').toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Group items in a stable order: actions → pages → recents
  const groupedCommandItems = useMemo(() => {
    const groups = { actions: [] as CmdItem[], pages: [] as CmdItem[], recents: [] as CmdItem[] };
    filteredCommandItems.forEach((item) => groups[item.group].push(item));
    return groups;
  }, [filteredCommandItems]);

  // Reset selection whenever the visible list changes
  useEffect(() => {
    setSearchSelectedIndex(0);
  }, [searchQuery, showSearch]);

  // Keyboard navigation inside the search input — arrow up/down + Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearch) return;
    const flat = filteredCommandItems;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchSelectedIndex((i) => Math.min(i + 1, Math.max(0, flat.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchSelectedIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const item = flat[searchSelectedIndex];
      if (item) {
        e.preventDefault();
        handleSearchNavigate(item.path);
      }
    } else if (e.key === 'Escape') {
      setShowSearch(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'darkMode' ? 'confluence' : 'darkMode');
  };

  const handleLogout = async () => {
    try { await doLogout(); } catch {/* ignore */}
    navigate('/login', { replace: true });
  };

  const unreadCount = notifUnread;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount)).replace('₹', '₹ ');
  };

  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <header className={`bm-topbar ${isMobile ? 'is-mobile' : ''}`}>
      {/* Left Section */}
      <div className="bm-topbar-left">
        {/* Hamburger — only on mobile, opens the sidebar drawer */}
        {isMobile && (
          <button
            className={`bm-menu-btn ${isDrawerOpen ? 'is-active' : ''}`}
            onClick={onMenuClick}
            aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isDrawerOpen}
            type="button"
          >
            <HiOutlineMenu />
          </button>
        )}

        {/* Bharat Mithra Logo */}
        <BharatMithraLogo />

        {/* Navigation Controls (back/forward/history) — desktop only */}
        <div className="bm-nav-controls">
          <button
            className={`bm-nav-btn ${!canGoBack ? 'disabled' : ''}`}
            onClick={handleGoBack}
            disabled={!canGoBack}
            title="Go back"
          >
            <HiOutlineChevronLeft />
          </button>
          <button
            className={`bm-nav-btn ${!canGoForward ? 'disabled' : ''}`}
            onClick={handleGoForward}
            disabled={!canGoForward}
            title="Go forward"
          >
            <HiOutlineChevronRight />
          </button>

          {/* History Dropdown */}
          <div className="bm-history-wrapper" ref={historyRef}>
            <button
              className={`bm-nav-btn bm-history-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
              title="Navigation history"
            >
              <HiOutlineClock />
            </button>

            {showHistory && history.length > 0 && (
              <div className="bm-history-dropdown bm-dark-dropdown">
                <div className="bm-dropdown-header">
                  <span>Recent Pages</span>
                </div>
                <div className="bm-history-list">
                  {[...history].reverse().map((item, idx) => {
                    const actualIndex = history.length - 1 - idx;
                    return (
                      <button
                        key={`${item.path}-${item.timestamp}`}
                        className={`bm-history-item ${actualIndex === historyIndex ? 'current' : ''}`}
                        onClick={() => handleHistoryItemClick(actualIndex)}
                      >
                        <span className="bm-history-title">{item.title}</span>
                        <span className="bm-history-time">{formatTime(item.timestamp)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Box */}
        <div className="bm-search-wrapper" ref={searchRef}>
          <div className={`bm-topbar-search ${showSearch ? 'focused' : ''}`}>
            <HiOutlineSearch className="bm-search-icon" />
            <input
              type="text"
              className="bm-search-input"
              placeholder="Search services, users, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onKeyDown={handleSearchKeyDown}
            />
            <kbd className="bm-search-shortcut">Ctrl+K</kbd>
          </div>

          {/* Command Palette Popup */}
          {showSearch && (
            <div className="bm-cmdp" role="listbox">
              {/* Decorative aurora layers behind the content */}
              <span className="bm-cmdp-aurora bm-cmdp-aurora--gold" aria-hidden />
              <span className="bm-cmdp-aurora bm-cmdp-aurora--blue" aria-hidden />
              <span className="bm-cmdp-grid" aria-hidden />

              <div className="bm-cmdp-content">
                {filteredCommandItems.length === 0 ? (
                  <div className="bm-cmdp-empty">
                    <HiOutlineSearch />
                    <p>No results for <strong>"{searchQuery}"</strong></p>
                    <span>Try different keywords or browse the sections below.</span>
                  </div>
                ) : (
                  <>
                    {(['actions', 'pages', 'recents'] as const).map((group) => {
                      const items = groupedCommandItems[group];
                      if (!items.length) return null;
                      const groupLabel =
                        group === 'actions' ? 'Quick actions' :
                        group === 'pages'   ? 'Pages' :
                                              'Recents';
                      const groupIcon =
                        group === 'actions' ? <HiOutlineLightningBolt /> :
                        group === 'pages'   ? <HiOutlineSparkles /> :
                                              <HiOutlineClock />;
                      return (
                        <div key={group} className="bm-cmdp-group">
                          <div className="bm-cmdp-group-head">
                            {groupIcon}
                            <span>{groupLabel}</span>
                            <em>{items.length}</em>
                          </div>
                          <div className="bm-cmdp-list">
                            {items.map((item) => {
                              const flatIndex = filteredCommandItems.indexOf(item);
                              const isSelected = flatIndex === searchSelectedIndex;
                              return (
                                <button
                                  key={item.path + item.label}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  className={`bm-cmdp-item ${isSelected ? 'is-selected' : ''}`}
                                  onMouseEnter={() => setSearchSelectedIndex(flatIndex)}
                                  onClick={() => handleSearchNavigate(item.path)}
                                >
                                  <span className="bm-cmdp-item-icon">
                                    <item.icon />
                                  </span>
                                  <div className="bm-cmdp-item-text">
                                    <span className="bm-cmdp-item-label">{item.label}</span>
                                    {item.hint && <span className="bm-cmdp-item-hint">{item.hint}</span>}
                                  </div>
                                  <span className="bm-cmdp-item-go">
                                    <HiOutlineArrowRight />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="bm-cmdp-foot">
                <span className="bm-cmdp-foot-keys">
                  <kbd>↑</kbd><kbd>↓</kbd> navigate
                </span>
                <span className="bm-cmdp-foot-keys">
                  <kbd>Enter</kbd> open
                </span>
                <span className="bm-cmdp-foot-keys">
                  <kbd>Esc</kbd> close
                </span>
                <span className="bm-cmdp-foot-brand">Bharat Mithra · Command</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Section */}
      <div className="bm-wallet-wrapper" ref={walletRef}>
        <button
          className={`bm-wallet-btn ${showWallet ? 'active' : ''}`}
          onClick={() => setShowWallet(!showWallet)}
          title="Wallet"
        >
          <span className="bm-wallet-btn__dot" aria-hidden />
          <HiOutlineCreditCard className="bm-wallet-icon" />
          <span className="bm-wallet-balance">{formatCurrency(walletSnapshot.balance)}</span>
        </button>

        {showWallet && (
          <>
          <div className="bm-dropdown-backdrop" onClick={() => setShowWallet(false)} />
          <div className="bm-wlt">
            {/* Decorative aurora behind the balance hero */}
            <span className="bm-wlt-aurora" aria-hidden />

            {/* Compact header */}
            <div className="bm-wlt-head">
              <div className="bm-wlt-head-title">
                <HiOutlineCreditCard />
                <span>Wallet</span>
              </div>
              <button
                type="button"
                className="bm-wlt-close"
                onClick={() => setShowWallet(false)}
                aria-label="Close"
              >
                <HiOutlineX />
              </button>
            </div>

            {/* Big balance hero */}
            <div className="bm-wlt-hero">
              <span className="bm-wlt-hero-label">Available Balance</span>
              <div className="bm-wlt-hero-amount">
                <span className="bm-wlt-hero-currency">₹</span>
                <span className="bm-wlt-hero-value">
                  {walletSnapshot.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bm-wlt-hero-meta">
                <span className="bm-wlt-hero-dot" />
                <span>Live · synced just now</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bm-wlt-actions">
              <button
                type="button"
                className="bm-wlt-action bm-wlt-action--primary"
                onClick={() => { navigate('/wallet'); setShowWallet(false); }}
              >
                <HiOutlinePlus />
                <span>Add money</span>
              </button>
              <button
                type="button"
                className="bm-wlt-action"
                onClick={() => { navigate('/wallet'); setShowWallet(false); }}
              >
                <HiOutlineArrowUp />
                <span>Send</span>
              </button>
              <button
                type="button"
                className="bm-wlt-action"
                onClick={() => { navigate('/transactions'); setShowWallet(false); }}
              >
                <HiOutlineClock />
                <span>History</span>
              </button>
            </div>

            {/* Stats strip */}
            <div className="bm-wlt-stats">
              <div className="bm-wlt-stat">
                <span className="bm-wlt-stat-icon credit"><HiOutlineArrowDown /></span>
                <div className="bm-wlt-stat-text">
                  <span className="bm-wlt-stat-label">Today in</span>
                  <span className="bm-wlt-stat-value credit">{formatCurrency(walletSnapshot.todayCredits)}</span>
                </div>
              </div>
              <div className="bm-wlt-stat">
                <span className="bm-wlt-stat-icon pending"><HiOutlineClock /></span>
                <div className="bm-wlt-stat-text">
                  <span className="bm-wlt-stat-label">Pending</span>
                  <span className="bm-wlt-stat-value pending">{formatCurrency(walletSnapshot.pendingCredits)}</span>
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="bm-wlt-tx-head">
              <span>Recent activity</span>
              <button
                type="button"
                onClick={() => { navigate('/transactions'); setShowWallet(false); }}
              >
                See all <HiOutlineArrowRight />
              </button>
            </div>
            <div className="bm-wlt-tx-list">
              {walletRecent.length === 0 ? (
                <div className="bm-wlt-tx-empty">
                  <HiOutlineClock />
                  <p>No transactions yet</p>
                  <span>Top up your wallet to get started.</span>
                </div>
              ) : walletRecent.map((txn) => {
                const isCredit = txn.type === 'credit';
                const isRequest = txn.type === 'request';
                const cssType = isCredit ? 'credit' : isRequest ? 'pending' : 'debit';
                return (
                  <div key={txn.id} className={`bm-wlt-tx ${cssType}`}>
                    <div className="bm-wlt-tx-icon">
                      {isCredit ? <HiOutlineArrowDown /> :
                       isRequest ? <HiOutlineClock /> :
                       <HiOutlineArrowUp />}
                    </div>
                    <div className="bm-wlt-tx-info">
                      <span className="bm-wlt-tx-desc">{txn.description}</span>
                      <span className="bm-wlt-tx-time">
                        {fmtRelativeTime(txn.createdAt)}
                        {txn.status !== 'success' && (
                          <> · <em className={`bm-wlt-tx-status bm-wlt-tx-status--${txn.status}`}>{txn.status}</em></>
                        )}
                      </span>
                    </div>
                    <span className={`bm-wlt-tx-amount ${cssType}`}>
                      {isCredit ? '+' : isRequest ? '' : '−'} {formatCurrency(txn.amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="bm-wlt-foot">
              <button
                type="button"
                className="bm-wlt-foot-btn"
                onClick={() => { navigate('/wallet'); setShowWallet(false); }}
              >
                Open Wallet <HiOutlineArrowRight />
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      <div className="bm-topbar-actions">
        <button
          className="bm-action-btn"
          onClick={toggleTheme}
          title={theme === 'darkMode' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'darkMode' ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>

        <div className="bm-notification-wrapper" ref={notificationRef}>
          <button
            className={`bm-action-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <HiOutlineBell />
            {unreadCount > 0 && <span className="bm-notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <>
            <div className="bm-dropdown-backdrop" onClick={() => setShowNotifications(false)} />
            <div className="bm-notification-dropdown bm-dark-dropdown">
              <div className="bm-dropdown-header">
                <span>Notifications {notifUnread > 0 && <em style={{ color: '#fcd34d', fontStyle: 'normal' }}>({notifUnread})</em>}</span>
                {notifUnread > 0 && (
                  <button className="bm-mark-read" onClick={() => { void markAllRead(); }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="bm-notification-list">
                {notifItems.length === 0 ? (
                  <div className="bm-notification-empty" style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    No notifications yet.<br />
                    <small style={{ opacity: 0.7 }}>Updates from the team will appear here.</small>
                  </div>
                ) : notifItems.map((n) => {
                  const unread = !n.readAt;
                  return (
                    <div
                      key={n.recipientId}
                      className={`bm-notification-item ${unread ? 'unread' : ''}`}
                      onClick={() => {
                        if (unread) void markRead(n.recipientId);
                        if (n.actionUrl) { navigate(n.actionUrl); setShowNotifications(false); }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="bm-notification-content">
                        <span className="bm-notification-title">{n.title}</span>
                        {n.body && <span className="bm-notification-message">{n.body}</span>}
                      </div>
                      <span className="bm-notification-time">{fmtNotifTime(n.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="bm-dropdown-footer">
                <button onClick={() => { navigate('/notifications'); setShowNotifications(false); }}>
                  View all notifications
                </button>
                <button onClick={() => { navigate('/notifications/compose'); setShowNotifications(false); }} style={{ marginLeft: 8 }}>
                  Compose
                </button>
              </div>
            </div>
            </>
          )}
        </div>

      </div>

      {/* Center Section - Dashboard Info (Clickable for Profile) */}
      <div className="bm-topbar-center" ref={profileRef}>
        <button
          className={`bm-dashboard-info ${showProfile ? 'active' : ''}`}
          onClick={() => setShowProfile(!showProfile)}
        >
          <span className="bm-dashboard-name">{dashboardInfo.name}</span>
          <span className="bm-dashboard-divider">|</span>
          <span className="bm-agent-name">{dashboardInfo.agentName}</span>
          {/* <HiOutlineChevronDown className={`bm-dropdown-arrow ${showProfile ? 'open' : ''}`} /> */}
          <span className="bm-avatar bm-avatar-sm">TS</span>
        </button>

        {showProfile && (
          <>
          <div className="bm-dropdown-backdrop" onClick={() => setShowProfile(false)} />
          <div className="bm-profile-dropdown bm-dark-dropdown">
            <div className="bm-profile-header">
              <span className="bm-avatar bm-avatar-lg">TS</span>
              <div className="bm-profile-info">
                <span className="bm-profile-name">{dashboardInfo.agentName}</span>
                <span className="bm-profile-email">thimma.shetty@gov.in</span>
              </div>
            </div>
            <div className="bm-dropdown-divider"></div>
            <div className="bm-dropdown-menu">
              <button className="bm-dropdown-item" onClick={() => { setShowProfileModal(true); setShowProfile(false); }}>
                <HiOutlineUser />
                <span>View Profile</span>
              </button>
              <button className="bm-dropdown-item" onClick={() => navigate('/settings')}>
                <HiOutlineCog />
                <span>Settings</span>
              </button>
              <button className="bm-dropdown-item" onClick={() => navigate('/help')}>
                <HiOutlineQuestionMarkCircle />
                <span>Help & Support</span>
              </button>
            </div>
            <div className="bm-dropdown-divider"></div>
            <button className="bm-dropdown-item bm-logout" onClick={handleLogout}>
              <HiOutlineLogout />
              <span>Logout</span>
            </button>
          </div>
          </>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <>
          <div className="bm-modal-backdrop" onClick={() => setShowProfileModal(false)} />
          <div className="bm-profile-modal">
            <div className="bm-profile-modal__header">
              <h3>Profile</h3>
              <button className="bm-profile-modal__close" onClick={() => setShowProfileModal(false)}>
                <HiOutlineX />
              </button>
            </div>

            <div className="bm-profile-modal__body">
              {/* Photo Section */}
              <div className="bm-profile-modal__photo-section">
                <div className="bm-profile-modal__avatar">
                  {profileData.photoUrl ? (
                    <img src={profileData.photoUrl} alt="Profile" />
                  ) : (
                    <span>{profileData.firstName[0]}{profileData.lastName[0]}</span>
                  )}
                  <button className="bm-profile-modal__photo-btn" title="Upload photo">
                    <HiOutlineCamera />
                  </button>
                </div>
                <div className="bm-profile-modal__name-block">
                  <h4>{profileData.firstName} {profileData.lastName}</h4>
                  <span className="bm-profile-modal__role">
                    <HiOutlineShieldCheck />
                    {profileData.role}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="bm-profile-modal__details">
                <div className="bm-profile-modal__row">
                  <span className="bm-profile-modal__label">
                    <HiOutlineUser /> Username
                  </span>
                  <span className="bm-profile-modal__value">@{profileData.username}</span>
                </div>
                <div className="bm-profile-modal__row">
                  <span className="bm-profile-modal__label">
                    <HiOutlineMail /> Email
                  </span>
                  <span className="bm-profile-modal__value">{profileData.email}</span>
                </div>
                <div className="bm-profile-modal__row">
                  <span className="bm-profile-modal__label">
                    <HiOutlinePhone /> Mobile
                  </span>
                  <span className="bm-profile-modal__value">{profileData.mobile}</span>
                </div>
                <div className="bm-profile-modal__row">
                  <span className="bm-profile-modal__label">
                    <HiOutlineCalendar /> Joined
                  </span>
                  <span className="bm-profile-modal__value">{profileData.joinedAt}</span>
                </div>
                <div className="bm-profile-modal__row">
                  <span className="bm-profile-modal__label">
                    <HiOutlineCreditCard /> Wallet balance
                  </span>
                  <span className="bm-profile-modal__value bm-profile-modal__balance">{formatCurrency(walletSnapshot.balance)}</span>
                </div>
                <div className="bm-profile-modal__row">
                  <span className="bm-profile-modal__label">
                    <HiOutlineBadgeCheck /> Verified
                  </span>
                  <span className={`bm-profile-modal__value bm-profile-modal__verified ${profileData.verified ? 'yes' : 'no'}`}>
                    {profileData.verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </header>
  );
};

export default Topbar;
