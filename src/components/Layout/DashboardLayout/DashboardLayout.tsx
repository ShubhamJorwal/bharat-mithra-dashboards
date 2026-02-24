import { useState, useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import AnimatedBackground from '../../common/AnimatedBackground';
import InfinityLogo from '../../common/InfinityLogo/InfinityLogo';
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

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  const collapsedWidth = 64;
  const currentWidth = isCollapsed ? collapsedWidth : sidebarWidth;

  return (
    <div className="bm-layout-wrapper">
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
      <Topbar />
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
      />
      <main
        className="bm-main-area"
        style={{ marginLeft: currentWidth }}
      >
        <div className="bm-page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
