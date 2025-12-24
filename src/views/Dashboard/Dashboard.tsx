import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineCloudUpload,
  HiOutlineSearch,
  HiOutlineSupport,
  HiOutlineArrowRight,
  HiOutlineUsers,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown
} from 'react-icons/hi';
import './Dashboard.scss';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  totalServices: number;
  totalUsers: number;
  activeServices: number;
}

interface RecentActivity {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  date: string;
  type: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalServices: 0,
    totalUsers: 0,
    activeServices: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Mock data - will be replaced with actual API calls
        await new Promise(resolve => setTimeout(resolve, 500));

        setStats({
          totalApplications: 156,
          pendingApplications: 23,
          approvedApplications: 128,
          totalServices: 45,
          totalUsers: 1250,
          activeServices: 38,
        });

        setRecentActivity([
          { id: '1', title: 'Passport Application', status: 'pending', date: '2 hours ago', type: 'application' },
          { id: '2', title: 'New User: Rahul Kumar', status: 'completed', date: '5 hours ago', type: 'user' },
          { id: '3', title: 'PAN Card Service', status: 'approved', date: 'Yesterday', type: 'service' },
          { id: '4', title: 'Aadhaar Update Request', status: 'pending', date: 'Yesterday', type: 'application' },
          { id: '5', title: 'Birth Certificate', status: 'completed', date: '2 days ago', type: 'application' },
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Total Applications',
      value: stats.totalApplications,
      change: '+12.5%',
      changeType: 'positive' as const,
      subtext: `${stats.pendingApplications} pending`,
      icon: HiOutlineClipboardList,
      color: 'primary'
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      change: '+8.2%',
      changeType: 'positive' as const,
      subtext: 'Active accounts',
      icon: HiOutlineUsers,
      color: 'success'
    },
    {
      label: 'Services',
      value: stats.totalServices,
      change: '+3',
      changeType: 'positive' as const,
      subtext: `${stats.activeServices} active`,
      icon: HiOutlineCollection,
      color: 'warning'
    },
    {
      label: 'Approved',
      value: stats.approvedApplications,
      change: '+15.3%',
      changeType: 'positive' as const,
      subtext: 'This month',
      icon: HiOutlineCheckCircle,
      color: 'danger'
    },
  ];

  const quickActions = [
    { icon: HiOutlineDocumentText, label: 'New Application', desc: 'Start a new service request', path: '/applications/new' },
    { icon: HiOutlineCloudUpload, label: 'Upload Document', desc: 'Add documents to existing', path: '/documents' },
    { icon: HiOutlineSearch, label: 'Track Status', desc: 'Check application progress', path: '/applications' },
    { icon: HiOutlineSupport, label: 'Get Support', desc: 'Contact helpdesk', path: '/help' },
  ];

  if (loading) {
    return (
      <div className="bm-dashboard">
        <div className="bm-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bm-dashboard">
      {/* Animated Background Effects */}
      <div className="bm-dashboard-bg">
        <div className="bm-bg-orb bm-bg-orb--1"></div>
        <div className="bm-bg-orb bm-bg-orb--2"></div>
        <div className="bm-bg-orb bm-bg-orb--3"></div>
        <div className="bm-bg-orb bm-bg-orb--4"></div>
        <div className="bm-bg-orb bm-bg-orb--5"></div>
        <div className="bm-bg-grid"></div>
      </div>

      <header className="bm-page-header">
        <div>
          <h1 className="bm-page-title">Dashboard</h1>
          <p className="bm-page-desc">Welcome back, Thimma Shetty. Here's what's happening.</p>
        </div>
      </header>

      <div className="bm-stats-row">
        {statCards.map((stat, index) => (
          <div key={index} className={`bm-stat-card bm-stat-card--${stat.color}`}>
            <div className={`bm-stat-icon bm-stat-icon--${stat.color}`}>
              <stat.icon />
            </div>
            <div className="bm-stat-value">{stat.value.toLocaleString()}</div>
            <div className="bm-stat-label">{stat.label}</div>
            <div className="bm-stat-meta">
              <span className={`bm-stat-change bm-stat-change--${stat.changeType}`}>
                {stat.changeType === 'positive' ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                {stat.change}
              </span>
              <span className="bm-stat-subtext">{stat.subtext}</span>
            </div>
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
              <button
                key={index}
                className="bm-quick-action"
                onClick={() => navigate(action.path)}
              >
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
            <button className="bm-link-btn" onClick={() => navigate('/notifications')}>
              View all
            </button>
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
