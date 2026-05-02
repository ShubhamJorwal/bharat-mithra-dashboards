import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import AnimatedBackground from '../../common/AnimatedBackground';
import InfinityLogo from '../../common/InfinityLogo/InfinityLogo';
import { bootstrapFromBackend } from '@/services/planner/plannerStore';
import { useViewport } from '@/hooks/useViewport';
import './DashboardLayout.scss';

// Full-screen splash animation variants — one picked randomly per refresh
const splashVariants = [
  'splash-var-zoom-out',
  'splash-var-split-reveal',
  'splash-var-circle-expand',
  'splash-var-slide-up-reveal',
  'splash-var-blur-reveal',
  'splash-var-rotate-fade',
] as const;

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved) : 200;
  });

  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  const splashVariant = useMemo(
    () => splashVariants[Math.floor(Math.random() * splashVariants.length)],
    []
  );

  // ─── Mobile drawer state ─────────────────────────────────────────
  // Sidebar becomes an off-canvas drawer below 1024 px. We only listen
  // for its open/close via this state; isCollapsed remains the desktop
  // collapse-to-rail concept.
  const { isMobile } = useViewport();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer when the route changes (so tapping a sidebar link on
  // mobile dismisses the drawer immediately).
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // If user resizes from mobile → desktop while drawer is open, close it.
  useEffect(() => {
    if (!isMobile && isDrawerOpen) setIsDrawerOpen(false);
  }, [isMobile, isDrawerOpen]);

  // Esc closes the drawer.
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen]);

  // Lock body scroll while drawer is open on mobile.
  useEffect(() => {
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = isDrawerOpen ? 'hidden' : prev;
    return () => { document.body.style.overflow = prev; };
  }, [isMobile, isDrawerOpen]);

  useEffect(() => {
    // Show splash for 2.2s then start exit animation
    const exitTimer = setTimeout(() => {
      setSplashExiting(true);
    }, 2200);

    // Remove splash from DOM after exit animation completes
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Bootstrap planner data from backend on first dashboard load — silent
  // fallback to localStorage if the backend is unreachable.
  useEffect(() => {
    void bootstrapFromBackend();
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  const collapsedWidth = 64;
  const currentWidth = isCollapsed ? collapsedWidth : sidebarWidth;

  return (
    <div
      className={[
        'bm-layout-wrapper',
        isMobile ? 'is-mobile' : '',
        isDrawerOpen ? 'drawer-open' : '',
      ].filter(Boolean).join(' ')}
    >
      {showSplash && (
        <div className={`bm-app-splash ${splashVariant} ${splashExiting ? 'bm-app-splash--exit' : ''}`}>
          <div className="bm-app-splash-content">
            <div className="bm-app-splash-logo">
              <InfinityLogo size="xl" />
            </div>
            <div className="bm-app-splash-brand">
              <span className="bm-app-splash-bharat">Bharat</span>
              <span className="bm-app-splash-space">&nbsp;</span>
              <span className="bm-app-splash-mithra">Mithra</span>
            </div>
            <p className="bm-app-splash-tagline">ALL SERVICES, AT ONE PLACE</p>
            <div className="bm-app-splash-dots">
              <span className="bm-app-splash-dot"></span>
              <span className="bm-app-splash-dot"></span>
              <span className="bm-app-splash-dot"></span>
            </div>
          </div>
        </div>
      )}
      <AnimatedBackground variant="subtle" />
      <Topbar
        isMobile={isMobile}
        onMenuClick={() => setIsDrawerOpen(o => !o)}
        isDrawerOpen={isDrawerOpen}
      />
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
        isMobile={isMobile}
        isDrawerOpen={isDrawerOpen}
      />

      {/* Drawer backdrop — only visible on mobile when drawer is open */}
      {isMobile && isDrawerOpen && (
        <div
          className="bm-drawer-backdrop"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden
        />
      )}

      <main
        className="bm-main-area"
        // On desktop, push content right by the sidebar width.
        // On mobile, sidebar is overlay → main area takes full width.
        style={isMobile ? undefined : { marginLeft: currentWidth }}
      >
        <div className="bm-page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
