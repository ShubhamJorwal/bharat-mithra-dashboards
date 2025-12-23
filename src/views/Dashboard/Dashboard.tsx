import {
  HiOutlineDocumentText,
  HiOutlineCloudUpload,
  HiOutlineSearch,
  HiOutlineSupport,
  HiOutlineArrowRight
} from 'react-icons/hi';
import './Dashboard.scss';

const Dashboard = () => {
  const stats = [
    { label: 'Total Applications', value: '24', change: '+3 this week' },
    { label: 'Pending', value: '8', change: '2 require action' },
    { label: 'Approved', value: '14', change: '+5 this month' },
    { label: 'Services Used', value: '6', change: 'of 45 available' },
  ];

  const quickActions = [
    { icon: HiOutlineDocumentText, label: 'New Application', desc: 'Start a new service request' },
    { icon: HiOutlineCloudUpload, label: 'Upload Document', desc: 'Add documents to existing' },
    { icon: HiOutlineSearch, label: 'Track Status', desc: 'Check application progress' },
    { icon: HiOutlineSupport, label: 'Get Support', desc: 'Contact helpdesk' },
  ];

  const recentActivity = [
    { id: 1, title: 'Passport Application', status: 'pending', date: '2 hours ago' },
    { id: 2, title: 'Address Proof Upload', status: 'completed', date: 'Yesterday' },
    { id: 3, title: 'PAN Card Request', status: 'approved', date: '3 days ago' },
  ];

  return (
    <div className="bm-dashboard">
      <header className="bm-page-header">
        <div>
          <h1 className="bm-page-title">Dashboard</h1>
          <p className="bm-page-desc">Welcome back, John</p>
        </div>
      </header>

      <div className="bm-stats-row">
        {stats.map((stat, index) => (
          <div key={index} className="bm-stat-card">
            <div className="bm-stat-value">{stat.value}</div>
            <div className="bm-stat-label">{stat.label}</div>
            <div className="bm-stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="bm-content-grid">
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Quick Actions</h2>
          </div>
          <div className="bm-actions-grid">
            {quickActions.map((action, index) => (
              <button key={index} className="bm-quick-action">
                <action.icon className="bm-action-icon" />
                <div className="bm-action-content">
                  <span className="bm-action-label">{action.label}</span>
                  <span className="bm-action-desc">{action.desc}</span>
                </div>
                <HiOutlineArrowRight className="bm-action-arrow" />
              </button>
            ))}
          </div>
        </section>

        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Recent Activity</h2>
            <button className="bm-link-btn">View all</button>
          </div>
          <div className="bm-activity-list">
            {recentActivity.map((item) => (
              <div key={item.id} className="bm-activity-item">
                <div className="bm-activity-info">
                  <span className="bm-activity-title">{item.title}</span>
                  <span className="bm-activity-date">{item.date}</span>
                </div>
                <span className={`bm-status bm-status--${item.status}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
