import { useState, useRef, useEffect, useCallback } from 'react';
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
  HiOutlineChartBar
} from 'react-icons/hi';
import { useTheme } from '../../../context/ThemeContext';
import './Topbar.scss';

// Bharat Mithra Logo Component with Indian Flag Colors
const BharatMithraLogo = () => (
  <div className="bm-topbar-brand">
    <span className="bm-brand-bharat">Bharat</span>
    <span className="bm-brand-dot">.</span>
    <span className="bm-brand-mithra">Mithra</span>
  </div>
);

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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
              <button className="bm-dropdown-item" onClick={() => navigate('/profile')}>
                <HiOutlineUser />
                <span>Profile</span>
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
        )}
      </div>

    </header>
  );
};

export default Topbar;
