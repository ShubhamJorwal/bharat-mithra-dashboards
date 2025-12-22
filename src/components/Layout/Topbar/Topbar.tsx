import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineMoon,
  HiOutlineSun
} from 'react-icons/hi';
import { useTheme } from '../../../context/ThemeContext';
import './Topbar.scss';

const Topbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
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

  return (
    <header className="bm-topbar-full">
      <div className="bm-topbar-brand">
        <span className="bm-brand-bharat">bharat</span>
        <span className="bm-brand-dot">.</span>
        <span className="bm-brand-mithra">mithra</span>
      </div>

      <div className="bm-topbar-search-area">
        <div className="bm-search-box">
          <HiOutlineSearch className="bm-search-icon" />
          <input
            type="text"
            className="bm-search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bm-topbar-actions-area">
        <button
          className="bm-topbar-action-btn"
          onClick={toggleTheme}
          title={theme === 'darkMode' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'darkMode' ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>

        <button className="bm-topbar-action-btn bm-notification-btn">
          <HiOutlineBell />
          <span className="bm-notification-dot"></span>
        </button>

        <div className="bm-profile-wrapper" ref={profileRef}>
          <button
            className={`bm-profile-trigger ${showProfile ? 'active' : ''}`}
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="bm-profile-avatar">
              <span>JD</span>
            </div>
            <HiOutlineChevronDown className={`bm-profile-chevron ${showProfile ? 'rotated' : ''}`} />
          </button>

          {showProfile && (
            <div className="bm-profile-dropdown">
              <div className="bm-profile-info">
                <div className="bm-profile-avatar-lg">
                  <span>JD</span>
                </div>
                <div className="bm-profile-details">
                  <span className="bm-profile-name">John Doe</span>
                  <span className="bm-profile-email">john.doe@gov.in</span>
                </div>
              </div>
              <div className="bm-profile-divider"></div>
              <button className="bm-profile-logout" onClick={handleLogout}>
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
