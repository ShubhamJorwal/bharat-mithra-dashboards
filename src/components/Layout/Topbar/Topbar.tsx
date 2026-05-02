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
} from 'react-icons/hi';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import InfinityLogo from '../../common/InfinityLogo/InfinityLogo';
import { loadTransactions, computeSnapshot, subscribe, type WalletTransaction } from '@/services/wallet/walletStore';
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

// Quick search suggestions
const searchSuggestions = [
  { icon: HiOutlineCollection, label: 'Services', path: '/services', type: 'page' },
  { icon: HiOutlineDocumentText, label: 'Applications', path: '/applications', type: 'page' },
  { icon: HiOutlineUserGroup, label: 'Users', path: '/users', type: 'page' },
  { icon: HiOutlineChartBar, label: 'Reports', path: '/reports', type: 'page' },
];

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { logout: doLogout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
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

  const notifications = [
    { id: 1, title: 'Application Approved', message: 'Your passport application has been approved', time: '2m ago', unread: true },
    { id: 2, title: 'Document Required', message: 'Please upload your address proof', time: '1h ago', unread: true },
    { id: 3, title: 'Payment Received', message: 'Payment of Rs. 500 received successfully', time: '3h ago', unread: false },
  ];

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
  };

  const toggleTheme = () => {
    setTheme(theme === 'darkMode' ? 'confluence' : 'darkMode');
  };

  const handleLogout = async () => {
    try { await doLogout(); } catch {/* ignore */}
    navigate('/login', { replace: true });
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
    <header className="bm-topbar">
      {/* Left Section */}
      <div className="bm-topbar-left">
        {/* Bharat Mithra Logo */}
        <BharatMithraLogo />

        {/* Divider */}
        {/* <div className="bm-topbar-divider"></div> */}

        {/* Menu Icon */}
        {/* <button className="bm-menu-btn" title="Menu">
          <HiOutlineMenu />
        </button> */}

        {/* Navigation Controls */}
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
            />
            <kbd className="bm-search-shortcut">Ctrl+K</kbd>
          </div>

          {/* Search Popup */}
          {showSearch && (
            <div className="bm-search-dropdown bm-dark-dropdown">
              <div className="bm-search-dropdown-header">
                <span>Quick Navigation</span>
              </div>
              <div className="bm-search-suggestions">
                {searchSuggestions.map((item) => (
                  <button
                    key={item.path}
                    className="bm-search-suggestion-item"
                    onClick={() => handleSearchNavigate(item.path)}
                  >
                    <item.icon className="bm-suggestion-icon" />
                    <span className="bm-suggestion-label">{item.label}</span>
                    <span className="bm-suggestion-type">{item.type}</span>
                  </button>
                ))}
              </div>
              <div className="bm-search-dropdown-footer">
                <span>Press <kbd>Enter</kbd> to search</span>
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
          <HiOutlineCreditCard className="bm-wallet-icon" />
          <span className="bm-wallet-balance">{formatCurrency(walletSnapshot.balance)}</span>
        </button>

        {showWallet && (
          <>
          <div className="bm-dropdown-backdrop" onClick={() => setShowWallet(false)} />
          <div className="bm-wallet-dropdown bm-dark-dropdown">
            <div className="bm-dropdown-header">
              <span>Wallet</span>
              <button className="bm-wallet-add-btn" onClick={() => { navigate('/wallet'); setShowWallet(false); }}>
                <HiOutlinePlus />
                Add Money
              </button>
            </div>

            <div className="bm-wallet-balance-section">
              <span className="bm-wallet-balance-label">Available Balance</span>
              <span className="bm-wallet-balance-amount">{formatCurrency(walletSnapshot.balance)}</span>
              <div className="bm-wallet-balance-stats">
                <div className="bm-wallet-stat">
                  <span className="bm-wallet-stat-label">Today's Credits</span>
                  <span className="bm-wallet-stat-value credit">{formatCurrency(walletSnapshot.todayCredits)}</span>
                </div>
                <div className="bm-wallet-stat">
                  <span className="bm-wallet-stat-label">Pending</span>
                  <span className="bm-wallet-stat-value pending">{formatCurrency(walletSnapshot.pendingCredits)}</span>
                </div>
              </div>
            </div>

            <div className="bm-wallet-transactions-header">
              <span>Recent Transactions</span>
            </div>
            <div className="bm-wallet-transactions">
              {walletRecent.length === 0 ? (
                <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  No transactions yet.
                </div>
              ) : walletRecent.map((txn) => {
                const isCredit = txn.type === 'credit';
                const isRequest = txn.type === 'request';
                const cssType = isCredit ? 'credit' : isRequest ? 'pending' : 'debit';
                return (
                  <div key={txn.id} className={`bm-wallet-txn ${cssType}`}>
                    <div className="bm-wallet-txn-icon">
                      {isCredit ? <HiOutlineArrowDown /> :
                       isRequest ? <HiOutlineClock /> :
                       <HiOutlineArrowUp />}
                    </div>
                    <div className="bm-wallet-txn-info">
                      <span className="bm-wallet-txn-desc">{txn.description}</span>
                      <span className="bm-wallet-txn-time">
                        {fmtRelativeTime(txn.createdAt)}
                        {txn.status !== 'success' && (
                          <> · <em style={{ color: txn.status === 'failed' || txn.status === 'reversed' ? '#ef4444' : '#f59e0b' }}>{txn.status}</em></>
                        )}
                      </span>
                    </div>
                    <span className={`bm-wallet-txn-amount ${cssType}`}>
                      {isCredit ? '+' : isRequest ? '' : '−'} {formatCurrency(txn.amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bm-dropdown-footer">
              <button onClick={() => { navigate('/wallet'); setShowWallet(false); }}>Open Wallet</button>
              <button onClick={() => { navigate('/transactions'); setShowWallet(false); }}>View All Transactions</button>
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
                <span>Notifications</span>
                <button className="bm-mark-read">Mark all read</button>
              </div>
              <div className="bm-notification-list">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`bm-notification-item ${notification.unread ? 'unread' : ''}`}>
                    <div className="bm-notification-content">
                      <span className="bm-notification-title">{notification.title}</span>
                      <span className="bm-notification-message">{notification.message}</span>
                    </div>
                    <span className="bm-notification-time">{notification.time}</span>
                  </div>
                ))}
              </div>
              <div className="bm-dropdown-footer">
                <button onClick={() => navigate('/notifications')}>View all notifications</button>
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
