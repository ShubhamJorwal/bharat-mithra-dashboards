import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineMail,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronDown,
  HiOutlineMoon,
  HiOutlineSun
} from 'react-icons/hi';
import { useTheme } from '../../../context/ThemeContext';
import Settings from '../../common/Settings/Settings';
import './Topbar.scss';

interface TopbarProps {
  sidebarWidth: number;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Topbar = ({ sidebarWidth, isCollapsed, toggleSidebar }: TopbarProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowMessages(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'darkMode' ? 'confluence' : 'darkMode');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Mock data
  const notifications = [
    { id: 1, title: 'New application submitted', time: '5 min ago', unread: true },
    { id: 2, title: 'Document verified successfully', time: '1 hour ago', unread: true },
    { id: 3, title: 'Payment received', time: '3 hours ago', unread: false },
    { id: 4, title: 'Application approved', time: '1 day ago', unread: false },
  ];

  const messages = [
    { id: 1, from: 'Support Team', message: 'Your query has been resolved', time: '10 min ago', avatar: 'ST' },
    { id: 2, from: 'Admin', message: 'New policy update available', time: '2 hours ago', avatar: 'AD' },
    { id: 3, from: 'System', message: 'Scheduled maintenance tonight', time: '5 hours ago', avatar: 'SY' },
  ];

  const collapsedWidth = 72;

  return (
    <header
      className="topbar"
      style={{ left: isCollapsed ? collapsedWidth : sidebarWidth }}
    >
      <div className="topbar-left">
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <HiOutlineMenu />
        </button>

        {/* Search Bar */}
        <form className={`search-container ${isSearchFocused ? 'focused' : ''}`} onSubmit={handleSearch}>
          <span className="search-icon">
            <HiOutlineSearch />
          </span>
          <input
            type="text"
            placeholder="Search services, documents, applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearchQuery('')}
            >
              <HiOutlineX />
            </button>
          )}
          <span className="search-shortcut">Ctrl + K</span>
        </form>
      </div>

      <div className="topbar-right">
        {/* Theme Toggle */}
        <button
          className="topbar-icon-btn"
          onClick={toggleTheme}
          title={theme === 'darkMode' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'darkMode' ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>

        {/* Help */}
        <button className="topbar-icon-btn" title="Help">
          <HiOutlineQuestionMarkCircle />
        </button>

        {/* Notifications */}
        <div className="dropdown-container" ref={notificationRef}>
          <button
            className={`topbar-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
              setShowProfile(false);
            }}
            title="Notifications"
          >
            <HiOutlineBell />
            <span className="badge">4</span>
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button className="mark-all">Mark all as read</button>
              </div>
              <div className="dropdown-body">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`dropdown-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <div className="item-icon notification-icon">
                      <HiOutlineBell />
                    </div>
                    <div className="item-content">
                      <p className="item-title">{notification.title}</p>
                      <span className="item-time">{notification.time}</span>
                    </div>
                    {notification.unread && <span className="unread-dot"></span>}
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="dropdown-container" ref={messageRef}>
          <button
            className={`topbar-icon-btn ${showMessages ? 'active' : ''}`}
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            title="Messages"
          >
            <HiOutlineMail />
            <span className="badge">3</span>
          </button>

          {showMessages && (
            <div className="dropdown-menu messages-dropdown">
              <div className="dropdown-header">
                <h3>Messages</h3>
                <button className="mark-all">Mark all as read</button>
              </div>
              <div className="dropdown-body">
                {messages.map((message) => (
                  <div key={message.id} className="dropdown-item">
                    <div className="item-avatar">
                      <span>{message.avatar}</span>
                    </div>
                    <div className="item-content">
                      <p className="item-title">{message.from}</p>
                      <p className="item-message">{message.message}</p>
                      <span className="item-time">{message.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button>View all messages</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Settings position="top-right" />

        {/* Profile Dropdown */}
        <div className="dropdown-container profile-dropdown-container" ref={profileRef}>
          <button
            className={`profile-btn ${showProfile ? 'active' : ''}`}
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowMessages(false);
            }}
          >
            <div className="profile-avatar">
              <span>JD</span>
            </div>
            <div className="profile-info">
              <span className="profile-name">John Doe</span>
              <span className="profile-role">Administrator</span>
            </div>
            <HiOutlineChevronDown className={`chevron ${showProfile ? 'rotated' : ''}`} />
          </button>

          {showProfile && (
            <div className="dropdown-menu profile-dropdown">
              <div className="profile-header">
                <div className="profile-avatar large">
                  <span>JD</span>
                </div>
                <div className="profile-details">
                  <h4>John Doe</h4>
                  <p>john.doe@gov.in</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-body">
                <button className="dropdown-item">
                  <HiOutlineUser />
                  <span>My Profile</span>
                </button>
                <button className="dropdown-item">
                  <HiOutlineCog />
                  <span>Account Settings</span>
                </button>
                <button className="dropdown-item">
                  <HiOutlineQuestionMarkCircle />
                  <span>Help Center</span>
                </button>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-body">
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <HiOutlineLogout />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
