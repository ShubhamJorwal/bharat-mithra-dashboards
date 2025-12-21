import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        {/* Sidebar content will go here */}
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          {/* Navigation items */}
        </nav>
      </aside>
      <main className="main-content">
        <header className="top-header">
          {/* Top header content */}
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
