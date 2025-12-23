import './Dashboard.scss';

const Dashboard = () => {
  return (
    <div className="bm-dashboard-page">
      <div className="bm-page-header">
        <div className="bm-page-header-content">
          <h1 className="bm-page-title">Dashboard</h1>
          <p className="bm-page-subtitle">Welcome to Bharat Mithra Government Services Portal</p>
        </div>
      </div>

      <div className="bm-dashboard-content">
        {/* Stats Cards Section */}
        <section className="bm-dashboard-section">
          <div className="bm-stats-grid">
            <div className="bm-stat-card">
              <div className="bm-stat-icon bm-stat-icon--primary">
                <span>📋</span>
              </div>
              <div className="bm-stat-info">
                <span className="bm-stat-value">0</span>
                <span className="bm-stat-label">Total Applications</span>
              </div>
            </div>
            <div className="bm-stat-card">
              <div className="bm-stat-icon bm-stat-icon--warning">
                <span>⏳</span>
              </div>
              <div className="bm-stat-info">
                <span className="bm-stat-value">0</span>
                <span className="bm-stat-label">Pending</span>
              </div>
            </div>
            <div className="bm-stat-card">
              <div className="bm-stat-icon bm-stat-icon--success">
                <span>✓</span>
              </div>
              <div className="bm-stat-info">
                <span className="bm-stat-value">0</span>
                <span className="bm-stat-label">Approved</span>
              </div>
            </div>
            <div className="bm-stat-card">
              <div className="bm-stat-icon bm-stat-icon--info">
                <span>📊</span>
              </div>
              <div className="bm-stat-info">
                <span className="bm-stat-value">0</span>
                <span className="bm-stat-label">Services Used</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions & Recent Activity */}
        <div className="bm-dashboard-grid">
          <section className="bm-dashboard-section">
            <div className="bm-section-header">
              <h2 className="bm-section-title">Quick Actions</h2>
            </div>
            <div className="bm-quick-actions">
              <button className="bm-action-card">
                <span className="bm-action-icon">📝</span>
                <span className="bm-action-text">New Application</span>
              </button>
              <button className="bm-action-card">
                <span className="bm-action-icon">📄</span>
                <span className="bm-action-text">Upload Document</span>
              </button>
              <button className="bm-action-card">
                <span className="bm-action-icon">🔍</span>
                <span className="bm-action-text">Track Status</span>
              </button>
              <button className="bm-action-card">
                <span className="bm-action-icon">💬</span>
                <span className="bm-action-text">Get Support</span>
              </button>
            </div>
          </section>

          <section className="bm-dashboard-section">
            <div className="bm-section-header">
              <h2 className="bm-section-title">Recent Activity</h2>
            </div>
            <div className="bm-activity-list">
              <div className="bm-empty-state">
                <span className="bm-empty-icon">📭</span>
                <p className="bm-empty-text">No recent activity</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
