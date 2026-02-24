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
  HiOutlinePhotograph,
  HiOutlineCheck,
  HiOutlineCash,
} from 'react-icons/hi';
import { useTheme } from '../../../context/ThemeContext';
import InfinityLogo from '../../common/InfinityLogo/InfinityLogo';
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

// Wallet mock data
const walletData = {
  balance: 12458.60,
  todayEarnings: 3240.00,
  pendingSettlement: 1850.00,
  recentTransactions: [
    { id: 1, type: 'credit', description: 'Service Fee - PAN Card', amount: 250.00, time: '10m ago' },
    { id: 2, type: 'credit', description: 'Service Fee - Aadhaar Update', amount: 150.00, time: '1h ago' },
    { id: 3, type: 'debit', description: 'Commission Payout', amount: -1200.00, time: '3h ago' },
    { id: 4, type: 'credit', description: 'Service Fee - Passport', amount: 500.00, time: '5h ago' },
  ]
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
  balance: 12458.60,
  verified: true,
  photoUrl: '',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addMoneyForm, setAddMoneyForm] = useState({ amount: '', utrNumber: '', paymentMethodId: '', screenshot: '' });
  const [addMoneySubmitting, setAddMoneySubmitting] = useState(false);
  const addMoneyFileRef = useRef<HTMLInputElement>(null);
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
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

  // Load active payment methods from localStorage (set by PaymentGateways page)
  const getActivePaymentMethods = () => {
    const methods: { id: string; label: string; type: 'bank' | 'upi'; detail: string }[] = [];
    try {
      const banks = JSON.parse(localStorage.getItem('bm_payment_banks') || '[]');
      banks.filter((b: { isActive: boolean }) => b.isActive).forEach((b: { id: string; bankName: string; accountNumber: string }) => {
        methods.push({ id: b.id, label: b.bankName, type: 'bank', detail: b.accountNumber });
      });
      const upis = JSON.parse(localStorage.getItem('bm_payment_upi') || '[]');
      upis.filter((u: { isActive: boolean }) => u.isActive).forEach((u: { id: string; providerName: string; upiId: string }) => {
        methods.push({ id: u.id, label: u.providerName, type: 'upi', detail: u.upiId });
      });
    } catch { /* ignore */ }
    return methods;
  };

  const handleAddMoneyScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setAddMoneyForm(prev => ({ ...prev, screenshot: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmitAddMoney = () => {
    if (!addMoneyForm.amount || !addMoneyForm.utrNumber || !addMoneyForm.paymentMethodId) return;
    setAddMoneySubmitting(true);

    // Create a pending wallet request in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('bm_wallet_transactions') || '[]');
      const methods = getActivePaymentMethods();
      const selectedMethod = methods.find(m => m.id === addMoneyForm.paymentMethodId);

      const newTxn = {
        id: `TXN${String(existing.length + 1).padStart(5, '0')}`,
        agentId: 'AG_SELF',
        agentName: profileData.firstName + ' ' + profileData.lastName,
        agentCode: profileData.username,
        type: 'request',
        category: 'wallet_request',
        amount: parseFloat(addMoneyForm.amount),
        status: 'pending',
        description: `Add Money via ${selectedMethod?.label || 'Unknown'} - UTR: ${addMoneyForm.utrNumber}`,
        reference: `UTR-${addMoneyForm.utrNumber}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentMethod: selectedMethod ? `${selectedMethod.label} (${selectedMethod.detail})` : 'N/A',
        screenshot: addMoneyForm.screenshot,
      };

      localStorage.setItem('bm_wallet_transactions', JSON.stringify([newTxn, ...existing]));
    } catch { /* ignore */ }

    setTimeout(() => {
      setAddMoneySubmitting(false);
      setShowAddMoney(false);
      setShowWallet(false);
      setAddMoneyForm({ amount: '', utrNumber: '', paymentMethodId: '', screenshot: '' });
    }, 500);
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
          <span className="bm-wallet-balance">{formatCurrency(walletData.balance)}</span>
        </button>

        {showWallet && (
          <>
          <div className="bm-dropdown-backdrop" onClick={() => setShowWallet(false)} />
          <div className="bm-wallet-dropdown bm-dark-dropdown">
            <div className="bm-dropdown-header">
              <span>Wallet</span>
              <button className="bm-wallet-add-btn" onClick={() => { setShowAddMoney(true); setShowWallet(false); }}>
                <HiOutlinePlus />
                Add Money
              </button>
            </div>

            <div className="bm-wallet-balance-section">
              <span className="bm-wallet-balance-label">Available Balance</span>
              <span className="bm-wallet-balance-amount">{formatCurrency(walletData.balance)}</span>
              <div className="bm-wallet-balance-stats">
                <div className="bm-wallet-stat">
                  <span className="bm-wallet-stat-label">Today's Earnings</span>
                  <span className="bm-wallet-stat-value credit">{formatCurrency(walletData.todayEarnings)}</span>
                </div>
                <div className="bm-wallet-stat">
                  <span className="bm-wallet-stat-label">Pending</span>
                  <span className="bm-wallet-stat-value pending">{formatCurrency(walletData.pendingSettlement)}</span>
                </div>
              </div>
            </div>

            <div className="bm-wallet-transactions-header">
              <span>Recent Transactions</span>
            </div>
            <div className="bm-wallet-transactions">
              {walletData.recentTransactions.map((txn) => (
                <div key={txn.id} className={`bm-wallet-txn ${txn.type}`}>
                  <div className="bm-wallet-txn-icon">
                    {txn.type === 'credit' ? <HiOutlineArrowDown /> : <HiOutlineArrowUp />}
                  </div>
                  <div className="bm-wallet-txn-info">
                    <span className="bm-wallet-txn-desc">{txn.description}</span>
                    <span className="bm-wallet-txn-time">{txn.time}</span>
                  </div>
                  <span className={`bm-wallet-txn-amount ${txn.type}`}>
                    {txn.type === 'credit' ? '+' : '-'} {formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bm-dropdown-footer">
              <button onClick={() => { navigate('/statements/wallet'); setShowWallet(false); }}>View All Transactions</button>
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
                    <HiOutlineCreditCard /> Balance
                  </span>
                  <span className="bm-profile-modal__value bm-profile-modal__balance">{formatCurrency(profileData.balance)}</span>
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

      {/* Add Money Modal */}
      {showAddMoney && (() => {
        const activeMethods = getActivePaymentMethods();
        return (
          <>
            <div className="bm-modal-backdrop" onClick={() => setShowAddMoney(false)} />
            <div className="bm-addmoney-modal">
              <div className="bm-addmoney-modal__header">
                <h3><HiOutlineCash /> Add Money to Wallet</h3>
                <button className="bm-profile-modal__close" onClick={() => setShowAddMoney(false)}>
                  <HiOutlineX />
                </button>
              </div>

              <div className="bm-addmoney-modal__body">
                {/* Select Payment Method */}
                <div className="bm-addmoney-field">
                  <label>Select Payment Method *</label>
                  {activeMethods.length === 0 ? (
                    <div className="bm-addmoney-no-methods">
                      <p>No active payment methods available.</p>
                      <button onClick={() => { navigate('/payment-gateways'); setShowAddMoney(false); }}>
                        <HiOutlinePlus /> Add Payment Method
                      </button>
                    </div>
                  ) : (
                    <div className="bm-addmoney-methods">
                      {activeMethods.map(method => (
                        <button
                          key={method.id}
                          className={`bm-addmoney-method ${addMoneyForm.paymentMethodId === method.id ? 'selected' : ''}`}
                          onClick={() => setAddMoneyForm(p => ({ ...p, paymentMethodId: method.id }))}
                        >
                          <div className={`bm-addmoney-method__icon ${method.type}`}>
                            {method.type === 'bank' ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                            )}
                          </div>
                          <div className="bm-addmoney-method__info">
                            <strong>{method.label}</strong>
                            <small>{method.detail}</small>
                          </div>
                          {addMoneyForm.paymentMethodId === method.id && (
                            <span className="bm-addmoney-method__check"><HiOutlineCheck /></span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="bm-addmoney-field">
                  <label>Amount (INR) *</label>
                  <div className="bm-addmoney-input-wrap">
                    <span className="bm-addmoney-currency">₹</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={addMoneyForm.amount}
                      onChange={e => setAddMoneyForm(p => ({ ...p, amount: e.target.value }))}
                      min="1"
                    />
                  </div>
                </div>

                {/* UTR Number */}
                <div className="bm-addmoney-field">
                  <label>UTR / Transaction Reference Number *</label>
                  <input
                    type="text"
                    placeholder="Enter UTR number from your payment"
                    value={addMoneyForm.utrNumber}
                    onChange={e => setAddMoneyForm(p => ({ ...p, utrNumber: e.target.value }))}
                  />
                </div>

                {/* Screenshot Upload */}
                <div className="bm-addmoney-field">
                  <label>Payment Screenshot *</label>
                  <div className="bm-addmoney-upload" onClick={() => addMoneyFileRef.current?.click()}>
                    {addMoneyForm.screenshot ? (
                      <div className="bm-addmoney-upload__preview">
                        <img src={addMoneyForm.screenshot} alt="Payment screenshot" />
                        <button
                          className="bm-addmoney-upload__remove"
                          onClick={e => { e.stopPropagation(); setAddMoneyForm(p => ({ ...p, screenshot: '' })); }}
                        >
                          <HiOutlineX />
                        </button>
                      </div>
                    ) : (
                      <div className="bm-addmoney-upload__placeholder">
                        <HiOutlinePhotograph />
                        <span>Upload payment screenshot</span>
                        <small>PNG, JPG up to 5MB</small>
                      </div>
                    )}
                    <input
                      ref={addMoneyFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAddMoneyScreenshot}
                      hidden
                    />
                  </div>
                </div>

                <div className="bm-addmoney-footer">
                  <button className="bm-addmoney-cancel" onClick={() => setShowAddMoney(false)}>Cancel</button>
                  <button
                    className="bm-addmoney-submit"
                    onClick={handleSubmitAddMoney}
                    disabled={!addMoneyForm.amount || !addMoneyForm.utrNumber || !addMoneyForm.paymentMethodId || addMoneySubmitting}
                  >
                    {addMoneySubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}

    </header>
  );
};

export default Topbar;
