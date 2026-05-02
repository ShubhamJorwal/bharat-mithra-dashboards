import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineFolder,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineGlobe,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineCurrencyRupee,
  HiOutlinePhone,
  HiOutlineSupport,
  HiOutlineViewGrid,
} from 'react-icons/hi';
import SidebarLauncher from '../SidebarLauncher/SidebarLauncher';
import './Sidebar.scss';

interface NavItem {
  path: string;
  icon: React.ComponentType;
  label: string;
  badge: string | null;
  subItems?: { path: string; label: string }[];
}

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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const minWidth = 180;
  const maxWidth = 500;
  const collapsedWidth = 46;

  const mainNavItems: NavItem[] = [
    { path: '/', icon: HiOutlineHome, label: 'Dashboard', badge: null },
    {
      path: '/services',
      icon: HiOutlineViewGrid,
      label: 'Services',
      badge: null,
      subItems: [
        { path: '/services', label: 'Catalog' },
        { path: '/services/new', label: 'Add Service' },
        { path: '/services/categories', label: 'Categories' },
      ]
    },
    {
      path: '/applications',
      icon: HiOutlineDocumentText,
      label: 'Applications',
      badge: null,
      subItems: [
        { path: '/applications', label: 'All' },
        { path: '/applications/new', label: 'New application' },
      ]
    },
    {
      path: '/geography',
      icon: HiOutlineGlobe,
      label: 'Geography',
      badge: null,
      subItems: [
        { path: '/geography', label: 'India Overview' },
        { path: '/geography/states', label: 'States & UTs' },
        // Districts / Taluks / GPs / Villages now reached by drilling into a state.
        // Old flat list routes remain accessible for admin CRUD direct links.
      ]
    },
    { path: '/documents', icon: HiOutlineDocumentText, label: 'Documents', badge: null },
    { path: '/reports', icon: HiOutlineChartBar, label: 'Reports', badge: null },
    {
      path: '/wallet',
      icon: HiOutlineCash,
      label: 'Wallet',
      badge: null,
      subItems: [
        { path: '/wallet', label: 'Overview' },
        { path: '/transactions', label: 'Transactions' },
      ]
    },
    { path: '/payment-gateways', icon: HiOutlineCreditCard, label: 'Payment Gateways', badge: null },
    { path: '/finance', icon: HiOutlineCurrencyRupee, label: 'Finance', badge: null },
    // Calendar + Notebook live in the animated planner launcher in the
    // sidebar footer (below the Collapse button). Routes still active.
  ];

  const secondaryNavItems: NavItem[] = [
    { path: '/users', icon: HiOutlineUsers, label: 'Users', badge: null },
    { path: '/staff', icon: HiOutlineUsers, label: 'Staff', badge: null },
    { path: '/telecaller', icon: HiOutlinePhone, label: 'Telecaller', badge: null },
    { path: '/support', icon: HiOutlineSupport, label: 'Support', badge: null },
    { path: '/notifications', icon: HiOutlineBell, label: 'Notifications', badge: null },
    { path: '/files', icon: HiOutlineFolder, label: 'Files', badge: null },
  ];

  // Shortcuts / Help / Settings live in the SidebarLauncher row (footer);
  // no Support section in the sidebar nav anymore.

  // Helper to check if a sub-item path matches current location
  const isSubItemActive = (subPath: string) => {
    if (subPath.includes('?')) {
      const [basePath, queryString] = subPath.split('?');
      const params = new URLSearchParams(queryString);
      const currentParams = new URLSearchParams(location.search);

      if (location.pathname !== basePath) return false;

      // Check if all params in subPath match current URL params
      for (const [key, value] of params.entries()) {
        if (currentParams.get(key) !== value) return false;
      }
      return true;
    }
    return location.pathname === subPath || location.pathname.startsWith(subPath + '/');
  };

  // Auto-expand parent when visiting a sub-item
  useEffect(() => {
    mainNavItems.forEach(item => {
      if (item.subItems) {
        const isSubActive = item.subItems.some(sub => isSubItemActive(sub.path));
        if (isSubActive && !expandedItems.includes(item.path)) {
          setExpandedItems(prev => [...prev, item.path]);
        }
      }
    });
  }, [location.pathname, location.search]);

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

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const isParentActive = hasSubItems && item.subItems?.some(sub => isSubItemActive(sub.path));

    if (hasSubItems && !isCollapsed) {
      return (
        <div key={item.path} className="bm-nav-item-group">
          <button
            className={`bm-nav-item bm-nav-parent ${isParentActive ? 'active' : ''}`}
            onClick={() => toggleExpanded(item.path)}
          >
            <span className="bm-nav-icon">
              <item.icon />
            </span>
            <span className="bm-nav-label">{item.label}</span>
            {item.badge && <span className="bm-nav-badge">{item.badge}</span>}
            <span className={`bm-nav-arrow ${isExpanded ? 'expanded' : ''}`}>
              <HiOutlineChevronDown />
            </span>
          </button>
          {isExpanded && (
            <div className="bm-nav-subitems">
              {item.subItems?.map(sub => {
                const subIsActive = isSubItemActive(sub.path);
                // Use Link for paths with query params, NavLink for regular paths
                if (sub.path.includes('?')) {
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`bm-nav-subitem ${subIsActive ? 'active' : ''}`}
                    >
                      <span className="bm-nav-label">{sub.label}</span>
                    </Link>
                  );
                }
                return (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    end={sub.path === '/geography' || sub.path === '/services' || sub.path === '/wallet'}
                    className={({ isActive: navIsActive }) => `bm-nav-subitem ${navIsActive ? 'active' : ''}`}
                  >
                    <span className="bm-nav-label">{sub.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => `bm-nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
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
        <SidebarLauncher isCollapsed={isCollapsed} />
      </div>

      {/* Circular collapse handle sitting on the right border */}
      <button
        className="bm-collapse-handle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand' : 'Collapse'}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
      </button>

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
