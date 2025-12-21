import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          {/* Navigation items will be added here */}
        </nav>
      </aside>
      <main className="main-content">
        <header className="top-header">
          {/* Top header content will be added here */}
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
