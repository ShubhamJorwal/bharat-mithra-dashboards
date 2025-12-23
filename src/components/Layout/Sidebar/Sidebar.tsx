import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineQuestionMarkCircle,
  HiOutlineLightningBolt,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineFolder,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCog
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

  const minWidth = 200;
  const maxWidth = 280;
  const collapsedWidth = 56;

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
    { path: '/help', icon: HiOutlineQuestionMarkCircle, label: 'Help', badge: null },
    { path: '/settings', icon: HiOutlineCog, label: 'Settings', badge: null },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    setIsResizing(true);
  };

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
        className={`bm-nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        title={isCollapsed ? item.label : undefined}
      >
        <span className="bm-nav-icon">
          <item.icon />
        </span>
        {!isCollapsed && (
          <>
            <span className="bm-nav-label">{item.label}</span>
            {item.badge && <span className="bm-nav-badge">{item.badge}</span>}
          </>
        )}
        {isCollapsed && item.badge && (
          <span className="bm-badge-dot"></span>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      className={`bm-sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{ width: isCollapsed ? collapsedWidth : sidebarWidth }}
    >
      <nav className="bm-sidebar-nav">
        <div className="bm-nav-section">
          {!isCollapsed && <span className="bm-nav-section-title">Menu</span>}
          <div className="bm-nav-list">
            {mainNavItems.map(renderNavItem)}
          </div>
        </div>

        <div className="bm-nav-section">
          {!isCollapsed && <span className="bm-nav-section-title">Management</span>}
          <div className="bm-nav-list">
            {secondaryNavItems.map(renderNavItem)}
          </div>
        </div>
      </nav>

      <div className="bm-sidebar-footer">
        <div className="bm-nav-list">
          {bottomNavItems.map(renderNavItem)}
        </div>
        <div className="bm-collapse-section">
          <button
            className="bm-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div
          className="bm-resize-handle"
          onMouseDown={handleMouseDown}
        />
      )}
    </aside>
  );
};

export default Sidebar;
