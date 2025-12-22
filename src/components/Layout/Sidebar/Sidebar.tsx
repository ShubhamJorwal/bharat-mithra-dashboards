import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
  HiOutlineLightningBolt,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineFolder,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMenu
} from 'react-icons/hi';
import './Sidebar.scss';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed, sidebarWidth, setSidebarWidth }: SidebarProps) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const minWidth = 220;
  const maxWidth = 320;
  const collapsedWidth = 72;

  // Navigation items
  const mainNavItems = [
    { path: '/', icon: HiOutlineHome, label: 'Dashboard', badge: null },
    { path: '/services', icon: HiOutlineCollection, label: 'Services', badge: '12' },
    { path: '/applications', icon: HiOutlineClipboardList, label: 'Applications', badge: '3' },
    { path: '/documents', icon: HiOutlineDocumentText, label: 'Documents', badge: null },
    { path: '/calendar', icon: HiOutlineCalendar, label: 'Calendar', badge: null },
    { path: '/reports', icon: HiOutlineChartBar, label: 'Reports', badge: null },
  ];

  const secondaryNavItems = [
    { path: '/users', icon: HiOutlineUsers, label: 'Users', badge: null },
    { path: '/notifications', icon: HiOutlineBell, label: 'Notifications', badge: '5' },
    { path: '/files', icon: HiOutlineFolder, label: 'Files', badge: null },
  ];

  const bottomNavItems = [
    { path: '/shortcuts', icon: HiOutlineLightningBolt, label: 'Shortcuts', badge: null },
    { path: '/help', icon: HiOutlineQuestionMarkCircle, label: 'Help & Support', badge: null },
    { path: '/settings', icon: HiOutlineCog, label: 'Settings', badge: null },
  ];

  // Handle mouse down on resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setSidebarWidth]);

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        title={isCollapsed ? item.label : undefined}
      >
        <span className="nav-icon">
          <item.icon />
        </span>
        {!isCollapsed && (
          <>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </>
        )}
        {isCollapsed && item.badge && (
          <span className="nav-badge-dot"></span>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{ width: isCollapsed ? collapsedWidth : sidebarWidth }}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="brand">
          {!isCollapsed ? (
            <>
              <div className="brand-icon">
                <span>BM</span>
              </div>
              <div className="brand-text">
                <h1>Bharat Mithra</h1>
                <span className="brand-tagline">Government Services</span>
              </div>
            </>
          ) : (
            <div className="brand-icon">
              <span>BM</span>
            </div>
          )}
        </div>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {!isCollapsed && <span className="nav-section-title">Main Menu</span>}
          <div className="nav-items">
            {mainNavItems.map(renderNavItem)}
          </div>
        </div>

        <div className="nav-section">
          {!isCollapsed && <span className="nav-section-title">Management</span>}
          <div className="nav-items">
            {secondaryNavItems.map(renderNavItem)}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="sidebar-footer">
        <div className="nav-items">
          {bottomNavItems.map(renderNavItem)}
        </div>
      </div>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
        />
      )}
    </aside>
  );
};

export default Sidebar;
