import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import './DashboardLayout.scss';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved) : 260;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  const collapsedWidth = 72;
  const currentWidth = isCollapsed ? collapsedWidth : sidebarWidth;

  return (
    <div className="bm-layout-wrapper">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
      />
      <Topbar
        sidebarWidth={sidebarWidth}
        isCollapsed={isCollapsed}
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
