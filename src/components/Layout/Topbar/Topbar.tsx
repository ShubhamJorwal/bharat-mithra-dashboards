import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import { useTheme } from '../../../context/ThemeContext';
import './Topbar.scss';

const Topbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'Application Approved', message: 'Your passport application has been approved', time: '2m ago', unread: true },
    { id: 2, title: 'Document Required', message: 'Please upload your address proof', time: '1h ago', unread: true },
    { id: 3, title: 'Payment Received', message: 'Payment of Rs. 500 received successfully', time: '3h ago', unread: false },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'darkMode' ? 'confluence' : 'darkMode');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bm-topbar">
      <div className="bm-topbar-brand">
        <span className="bm-brand-bharat">bharat</span>
        <span className="bm-brand-dot">.</span>
        <span className="bm-brand-mithra">mithra</span>
      </div>

      <div className="bm-topbar-search">
        <HiOutlineSearch className="bm-search-icon" />
        <input
          type="text"
          className="bm-search-input"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd className="bm-search-shortcut">/</kbd>
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
            <div className="bm-notification-dropdown">
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

        <div className="bm-profile-wrapper" ref={profileRef}>
          <button
            className={`bm-avatar-btn ${showProfile ? 'active' : ''}`}
            onClick={() => setShowProfile(!showProfile)}
          >
            <span className="bm-avatar">JD</span>
          </button>

          {showProfile && (
            <div className="bm-profile-dropdown">
              <div className="bm-profile-header">
                <span className="bm-avatar bm-avatar-lg">JD</span>
                <div className="bm-profile-info">
                  <span className="bm-profile-name">John Doe</span>
                  <span className="bm-profile-email">john.doe@gov.in</span>
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
      </div>
    </header>
  );
};

export default Topbar;
