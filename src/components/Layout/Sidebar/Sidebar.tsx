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
  HiOutlineChevronRight
} from 'react-icons/hi';
import Settings from '../../common/Settings/Settings';
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
        className={`bm-nav-link ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        title={isCollapsed ? item.label : undefined}
      >
        <span className="bm-nav-icon">
          <item.icon />
        </span>
        {!isCollapsed && (
          <>
            <span className="bm-nav-text">{item.label}</span>
            {item.badge && <span className="bm-nav-badge">{item.badge}</span>}
          </>
        )}
        {isCollapsed && item.badge && (
          <span className="bm-nav-badge-indicator"></span>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      className={`bm-sidebar-panel ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{ width: isCollapsed ? collapsedWidth : sidebarWidth }}
    >
      <div className="bm-sidebar-top">
        <button
          className="bm-collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
        </button>
      </div>

      <nav className="bm-sidebar-navigation">
        <div className="bm-nav-group">
          {!isCollapsed && <span className="bm-nav-group-label">Main Menu</span>}
          <div className="bm-nav-list">
            {mainNavItems.map(renderNavItem)}
          </div>
        </div>

        <div className="bm-nav-group">
          {!isCollapsed && <span className="bm-nav-group-label">Management</span>}
          <div className="bm-nav-list">
            {secondaryNavItems.map(renderNavItem)}
          </div>
        </div>
      </nav>

      <div className="bm-sidebar-bottom">
        <div className="bm-nav-list">
          {bottomNavItems.map(renderNavItem)}
          <Settings position="bottom-left" />
        </div>
      </div>

      {!isCollapsed && (
        <div
          className="bm-resize-bar"
          onMouseDown={handleMouseDown}
        />
      )}
    </aside>
  );
};

export default Sidebar;
