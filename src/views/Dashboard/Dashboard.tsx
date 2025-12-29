import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineCloudUpload,
  HiOutlineSearch,
  HiOutlineSupport,
  HiOutlineArrowRight,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCurrencyRupee,
  HiOutlineGlobe,
  HiOutlineLightningBolt,
  HiOutlineRefresh,
  HiOutlineDownload,
  HiOutlineCalendar,
  HiOutlineChartBar
} from 'react-icons/hi';
import './Dashboard.scss';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  completedApplications: number;
  totalServices: number;
  totalUsers: number;
  activeServices: number;
  monthlyRevenue: number;
  dailyAverage: number;
  statesActive: number;
  districtsActive: number;
  successRate: number;
  avgProcessingDays: number;
}

interface RecentActivity {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected' | 'in_progress';
  date: string;
  type: string;
  applicant?: string;
}

interface TopService {
  id: string;
  name: string;
  applications: number;
  revenue: number;
  trend: number;
}

interface StatePerformance {
  state: string;
  stateCode: string;
  applications: number;
  completed: number;
  revenue: number;
  successRate: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    completedApplications: 0,
    totalServices: 0,
    totalUsers: 0,
    activeServices: 0,
    monthlyRevenue: 0,
    dailyAverage: 0,
    statesActive: 0,
    districtsActive: 0,
    successRate: 0,
    avgProcessingDays: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [statePerformance, setStatePerformance] = useState<StatePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        setStats({
          totalApplications: 85642,
          pendingApplications: 2341,
          approvedApplications: 78456,
          rejectedApplications: 1245,
          completedApplications: 74521,
          totalServices: 156,
          totalUsers: 284520,
          activeServices: 142,
          monthlyRevenue: 42800000,
          dailyAverage: 2856,
          statesActive: 28,
          districtsActive: 756,
          successRate: 93.7,
          avgProcessingDays: 2.6,
        });

        setRecentActivity([
          { id: '1', title: 'Caste Certificate Application', status: 'pending', date: '2 minutes ago', type: 'application', applicant: 'Rahul Kumar' },
          { id: '2', title: 'Income Certificate', status: 'approved', date: '15 minutes ago', type: 'application', applicant: 'Priya Sharma' },
          { id: '3', title: 'Domicile Certificate', status: 'completed', date: '1 hour ago', type: 'application', applicant: 'Amit Patel' },
          { id: '4', title: 'Birth Certificate', status: 'in_progress', date: '2 hours ago', type: 'application', applicant: 'Sneha Reddy' },
          { id: '5', title: 'Marriage Certificate', status: 'rejected', date: '3 hours ago', type: 'application', applicant: 'Vikram Singh' },
          { id: '6', title: 'Land Record Update', status: 'pending', date: '4 hours ago', type: 'application', applicant: 'Meera Joshi' },
        ]);

        setTopServices([
          { id: '1', name: 'Caste Certificate', applications: 28456, revenue: 8536800, trend: 12.5 },
          { id: '2', name: 'Income Certificate', applications: 21342, revenue: 6402600, trend: 8.2 },
          { id: '3', name: 'Domicile Certificate', applications: 15678, revenue: 4703400, trend: 5.6 },
          { id: '4', name: 'Birth Certificate', applications: 12456, revenue: 3736800, trend: -2.1 },
          { id: '5', name: 'Marriage Certificate', applications: 7890, revenue: 2367000, trend: 15.3 },
        ]);

        setStatePerformance([
          { state: 'Maharashtra', stateCode: 'MH', applications: 12456, completed: 11234, revenue: 3736800, successRate: 95.2 },
          { state: 'Karnataka', stateCode: 'KA', applications: 10234, completed: 9456, revenue: 3070200, successRate: 94.1 },
          { state: 'Gujarat', stateCode: 'GJ', applications: 9876, completed: 9123, revenue: 2962800, successRate: 93.5 },
          { state: 'Tamil Nadu', stateCode: 'TN', applications: 8765, completed: 8234, revenue: 2629500, successRate: 92.8 },
          { state: 'Uttar Pradesh', stateCode: 'UP', applications: 8456, completed: 7654, revenue: 2536800, successRate: 90.5 },
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)} L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const primaryStats = [
    {
      label: 'Total Applications',
      value: formatNumber(stats.totalApplications),
      change: '+11.8%',
      changeType: 'positive' as const,
      subStats: [
        { label: 'Daily Avg', value: formatNumber(stats.dailyAverage) },
        { label: 'Pending', value: formatNumber(stats.pendingApplications) },
        { label: 'Processing', value: `${stats.avgProcessingDays} days` },
      ],
      icon: HiOutlineClipboardList,
      color: 'primary',
      gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
    },
    {
      label: 'Active Users',
      value: formatNumber(stats.totalUsers),
      change: '+4.2%',
      changeType: 'positive' as const,
      subStats: [
        { label: 'New (30d)', value: '18.5K' },
        { label: 'States', value: stats.statesActive.toString() },
        { label: 'Districts', value: stats.districtsActive.toString() },
      ],
      icon: HiOutlineUsers,
      color: 'success',
      gradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      change: '+14.2%',
      changeType: 'positive' as const,
      subStats: [
        { label: 'Daily Avg', value: formatCurrency(stats.monthlyRevenue / 30) },
        { label: 'Success Rate', value: `${stats.successRate}%` },
        { label: 'Services', value: stats.activeServices.toString() },
      ],
      icon: HiOutlineCurrencyRupee,
      color: 'warning',
      gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
    },
    {
      label: 'Completed',
      value: formatNumber(stats.completedApplications),
      change: '+15.3%',
      changeType: 'positive' as const,
      subStats: [
        { label: 'Approved', value: formatNumber(stats.approvedApplications) },
        { label: 'Rejected', value: formatNumber(stats.rejectedApplications) },
        { label: 'Rate', value: `${stats.successRate}%` },
      ],
      icon: HiOutlineCheckCircle,
      color: 'info',
      gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
    },
  ];

  const quickActions = [
    { icon: HiOutlineDocumentText, label: 'New Application', desc: 'Start a new service request', path: '/applications/new' },
    { icon: HiOutlineCloudUpload, label: 'Upload Document', desc: 'Add documents to existing', path: '/documents' },
    { icon: HiOutlineSearch, label: 'Track Status', desc: 'Check application progress', path: '/applications' },
    { icon: HiOutlineSupport, label: 'Get Support', desc: 'Contact helpdesk', path: '/help' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'primary';
      case 'completed': return 'success';
      case 'rejected': return 'danger';
      case 'in_progress': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="bm-dashboard">
        <div className="bm-loading">
          <div className="bm-loading-spinner"></div>
          <span>Loading dashboard...</span>
        </div>
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

      {/* Header */}
      <header className="bm-page-header">
        <div className="bm-header-left">
          <h1 className="bm-page-title">Command Center</h1>
          <p className="bm-page-desc">Real-time overview of Bharat Mithra operations across India</p>
        </div>
        <div className="bm-header-right">
          <div className={`bm-live-indicator ${isLive ? 'active' : ''}`} onClick={() => setIsLive(!isLive)}>
            <span className="bm-live-dot"></span>
            <span>System Live</span>
          </div>
          <button className="bm-btn bm-btn-secondary" onClick={() => window.location.reload()}>
            <HiOutlineRefresh />
            <span>Refresh</span>
          </button>
          <button className="bm-btn bm-btn-primary">
            <HiOutlineDownload />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Primary Stats */}
      <div className="bm-stats-row">
        {primaryStats.map((stat, index) => (
          <div
            key={index}
            className={`bm-stat-card bm-stat-card--${stat.color}`}
            style={{ background: stat.gradient }}
          >
            <div className="bm-stat-header">
              <div className={`bm-stat-icon bm-stat-icon--${stat.color}`}>
                <stat.icon />
              </div>
              <div className={`bm-stat-change bm-stat-change--${stat.changeType}`}>
                {stat.changeType === 'positive' ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                {stat.change}
              </div>
            </div>
            <div className="bm-stat-value">{stat.value}</div>
            <div className="bm-stat-label">{stat.label}</div>
            <div className="bm-stat-substats">
              {stat.subStats.map((sub, idx) => (
                <div key={idx} className="bm-stat-substat">
                  <span className="bm-stat-substat-value">{sub.value}</span>
                  <span className="bm-stat-substat-label">{sub.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="bm-content-main">
        {/* Left Column */}
        <div className="bm-content-left">
          {/* Top Services */}
          <section className="bm-card">
            <div className="bm-card-header">
              <h2 className="bm-card-title">Top Services</h2>
              <button className="bm-link-btn" onClick={() => navigate('/services')}>
                View all
              </button>
            </div>
            <div className="bm-services-table">
              <div className="bm-services-header">
                <span>Service</span>
                <span>Applications</span>
                <span>Revenue</span>
                <span>Trend</span>
              </div>
              {topServices.map((service) => (
                <div key={service.id} className="bm-services-row" onClick={() => navigate(`/services/${service.id}`)}>
                  <span className="bm-service-name">{service.name}</span>
                  <span className="bm-service-apps">{formatNumber(service.applications)}</span>
                  <span className="bm-service-revenue">{formatCurrency(service.revenue)}</span>
                  <span className={`bm-service-trend ${service.trend >= 0 ? 'positive' : 'negative'}`}>
                    {service.trend >= 0 ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                    {Math.abs(service.trend)}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* State Performance */}
          <section className="bm-card">
            <div className="bm-card-header">
              <h2 className="bm-card-title">State Performance</h2>
              <button className="bm-link-btn" onClick={() => navigate('/geography/states')}>
                View all
              </button>
            </div>
            <div className="bm-states-grid">
              {statePerformance.map((state) => (
                <div key={state.stateCode} className="bm-state-card" onClick={() => navigate(`/geography/states/${state.stateCode}`)}>
                  <div className="bm-state-header">
                    <span className="bm-state-code">{state.stateCode}</span>
                    <span className="bm-state-name">{state.state}</span>
                  </div>
                  <div className="bm-state-stats">
                    <div className="bm-state-stat">
                      <span className="bm-state-stat-value">{formatNumber(state.applications)}</span>
                      <span className="bm-state-stat-label">Applications</span>
                    </div>
                    <div className="bm-state-stat">
                      <span className="bm-state-stat-value">{formatCurrency(state.revenue)}</span>
                      <span className="bm-state-stat-label">Revenue</span>
                    </div>
                    <div className="bm-state-stat">
                      <span className="bm-state-stat-value bm-state-success">{state.successRate}%</span>
                      <span className="bm-state-stat-label">Success</span>
                    </div>
                  </div>
                  <div className="bm-state-progress">
                    <div className="bm-state-progress-bar" style={{ width: `${(state.completed / state.applications) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="bm-content-right">
          {/* Quick Actions */}
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

          {/* Recent Activity */}
          <section className="bm-card">
            <div className="bm-card-header">
              <h2 className="bm-card-title">Recent Activity</h2>
              <button className="bm-link-btn" onClick={() => navigate('/applications')}>
                View all
              </button>
            </div>
            <div className="bm-activity-list">
              {recentActivity.map((item) => (
                <div key={item.id} className="bm-activity-item" onClick={() => navigate(`/applications/${item.id}`)}>
                  <div className="bm-activity-info">
                    <span className="bm-activity-title">{item.title}</span>
                    <span className="bm-activity-meta">
                      {item.applicant && <span className="bm-activity-applicant">{item.applicant}</span>}
                      <span className="bm-activity-date">{item.date}</span>
                    </span>
                  </div>
                  <span className={`bm-status bm-status--${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* System Health */}
          <section className="bm-card bm-card--compact">
            <div className="bm-card-header">
              <h2 className="bm-card-title">System Health</h2>
            </div>
            <div className="bm-health-grid">
              <div className="bm-health-item">
                <HiOutlineLightningBolt className="bm-health-icon bm-health-icon--success" />
                <div className="bm-health-info">
                  <span className="bm-health-label">API Response</span>
                  <span className="bm-health-value">178ms</span>
                </div>
              </div>
              <div className="bm-health-item">
                <HiOutlineGlobe className="bm-health-icon bm-health-icon--success" />
                <div className="bm-health-info">
                  <span className="bm-health-label">Uptime</span>
                  <span className="bm-health-value">99.9%</span>
                </div>
              </div>
              <div className="bm-health-item">
                <HiOutlineCalendar className="bm-health-icon bm-health-icon--success" />
                <div className="bm-health-info">
                  <span className="bm-health-label">States Online</span>
                  <span className="bm-health-value">28/28</span>
                </div>
              </div>
              <div className="bm-health-item">
                <HiOutlineChartBar className="bm-health-icon bm-health-icon--warning" />
                <div className="bm-health-info">
                  <span className="bm-health-label">Open Tickets</span>
                  <span className="bm-health-value">234</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
