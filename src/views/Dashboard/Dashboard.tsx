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
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineReceiptRefund,
  HiOutlinePhone,
  HiOutlineDesktopComputer,
  HiOutlineLocationMarker,
  HiOutlineDotsHorizontal,
  HiOutlineArrowSmRight,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineStatusOnline,
  HiOutlineChat,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import './Dashboard.scss';

// ─── Interfaces ────────────────────────────────────────────

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

interface ServiceOverviewItem {
  name: string;
  todayCount: number;
  allTimeCount: number;
  status: 'active' | 'moderate' | 'low' | 'inactive';
}

interface PaymentOverview {
  id: string;
  name: string;
  icon: string;
  amount: number;
  subStats: { label: string; value: string }[];
  color: string;
}

interface PipelineStage {
  label: string;
  count: number;
  color: string;
}

interface LoginHistoryItem {
  id: string;
  dateTime: string;
  deviceOS: string;
  browser: string;
  location: string;
  ip: string;
  network: string;
}

// ─── Component ─────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0, pendingApplications: 0, approvedApplications: 0,
    rejectedApplications: 0, completedApplications: 0, totalServices: 0,
    totalUsers: 0, activeServices: 0, monthlyRevenue: 0, dailyAverage: 0,
    statesActive: 0, districtsActive: 0, successRate: 0, avgProcessingDays: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [statePerformance, setStatePerformance] = useState<StatePerformance[]>([]);
  const [documentServices, setDocumentServices] = useState<ServiceOverviewItem[]>([]);
  const [digitalServices, setDigitalServices] = useState<ServiceOverviewItem[]>([]);
  const [paymentOverview, setPaymentOverview] = useState<PaymentOverview[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 400));

        setStats({
          totalApplications: 85642, pendingApplications: 2341, approvedApplications: 78456,
          rejectedApplications: 1245, completedApplications: 74521, totalServices: 755,
          totalUsers: 284520, activeServices: 142, monthlyRevenue: 42800000, dailyAverage: 2856,
          statesActive: 28, districtsActive: 756, successRate: 93.7, avgProcessingDays: 2.6,
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

        // Document / Print Services Overview
        setDocumentServices([
          { name: 'Caste Certificate', todayCount: 12, allTimeCount: 28456, status: 'active' },
          { name: 'Income Certificate', todayCount: 8, allTimeCount: 21342, status: 'active' },
          { name: 'Domicile Certificate', todayCount: 5, allTimeCount: 15678, status: 'active' },
          { name: 'Birth Certificate', todayCount: 3, allTimeCount: 12456, status: 'moderate' },
          { name: 'Marriage Certificate', todayCount: 2, allTimeCount: 7890, status: 'moderate' },
          { name: 'Death Certificate', todayCount: 1, allTimeCount: 4523, status: 'low' },
          { name: 'Land Record (RoR)', todayCount: 4, allTimeCount: 9876, status: 'active' },
          { name: 'Driving Licence', todayCount: 0, allTimeCount: 6543, status: 'inactive' },
          { name: 'Aadhaar Update', todayCount: 6, allTimeCount: 18234, status: 'active' },
          { name: 'Voter ID Card', todayCount: 0, allTimeCount: 3456, status: 'low' },
        ]);

        // Digital / Online Services Overview
        setDigitalServices([
          { name: 'Instant PAN', todayCount: 15, allTimeCount: 32456, status: 'active' },
          { name: 'PAN Correction', todayCount: 3, allTimeCount: 8765, status: 'moderate' },
          { name: 'Digital Signature (DSC)', todayCount: 2, allTimeCount: 5432, status: 'moderate' },
          { name: 'GST Registration', todayCount: 7, allTimeCount: 14523, status: 'active' },
          { name: 'MSME Registration', todayCount: 4, allTimeCount: 9876, status: 'active' },
          { name: 'E-PAN Download', todayCount: 0, allTimeCount: 23456, status: 'inactive' },
          { name: 'PassPort Application', todayCount: 1, allTimeCount: 3456, status: 'low' },
          { name: 'E-Governance Portal', todayCount: 8, allTimeCount: 12345, status: 'active' },
          { name: 'ITR Filing', todayCount: 0, allTimeCount: 7654, status: 'inactive' },
          { name: 'TDS Return', todayCount: 0, allTimeCount: 2345, status: 'inactive' },
        ]);

        // Payment / Business Overview
        setPaymentOverview([
          {
            id: '1', name: 'Service Fees Collected', icon: 'fees',
            amount: 4285600, color: '#3b82f6',
            subStats: [{ label: 'Commission Earned', value: '₹ 42,856' }],
          },
          {
            id: '2', name: 'Online Payments', icon: 'online',
            amount: 3256000, color: '#10b981',
            subStats: [{ label: 'Gateway Charges', value: '₹ 6,512' }],
          },
          {
            id: '3', name: 'Money Transfer', icon: 'transfer',
            amount: 1250000, color: '#f59e0b',
            subStats: [
              { label: 'Pending', value: '₹ 25,000' },
              { label: 'Failed', value: '₹ 5,000' },
              { label: 'Refund', value: '₹ 2,500' },
            ],
          },
        ]);

        // Application Pipeline
        setPipeline([
          { label: 'Draft', count: 456, color: '#94a3b8' },
          { label: 'Submitted', count: 1234, color: '#3b82f6' },
          { label: 'Under Review', count: 856, color: '#f59e0b' },
          { label: 'Verified', count: 623, color: '#8b5cf6' },
          { label: 'Approved', count: 78456, color: '#10b981' },
          { label: 'Completed', count: 74521, color: '#059669' },
        ]);

        // Login History
        setLoginHistory([
          { id: '1', dateTime: '10-Feb-2026 07:07:54', deviceOS: 'Windows 10', browser: 'Chrome 144.0.0.0', location: 'Bengaluru', ip: '104.23.175.195', network: '175.195' },
          { id: '2', dateTime: '10-Feb-2026 07:06:12', deviceOS: 'Windows 10', browser: 'Chrome 144.0.0.0', location: 'Bengaluru', ip: '172.71.81.131', network: '81.131' },
          { id: '3', dateTime: '10-Feb-2026 04:40:09', deviceOS: 'Windows 10', browser: 'Chrome 144.0.0.0', location: 'Bengaluru', ip: '172.69.166.71', network: '166.71' },
          { id: '4', dateTime: '09-Feb-2026 02:41:18', deviceOS: 'Windows 10', browser: 'Chrome 109.0.0.0', location: 'Mumbai', ip: '104.23.170.99', network: '170.99' },
          { id: '5', dateTime: '09-Feb-2026 01:59:12', deviceOS: 'Windows 10', browser: 'Chrome 144.0.0.0', location: 'Bengaluru', ip: '172.71.182.66', network: '182.66' },
          { id: '6', dateTime: '06-Feb-2026 05:39:19', deviceOS: 'Windows 10', browser: 'Chrome 109.0.0.0', location: 'Delhi', ip: '172.71.95.82', network: '95.82' },
          { id: '7', dateTime: '05-Feb-2026 12:28:24', deviceOS: 'Windows 10', browser: 'Chrome 144.0.0.0', location: 'Bengaluru', ip: '104.23.166.153', network: '166.153' },
          { id: '8', dateTime: '03-Feb-2026 11:05:08', deviceOS: 'Windows 10', browser: 'Chrome 109.0.0.0', location: 'Hyderabad', ip: '172.70.92.222', network: '92.222' },
          { id: '9', dateTime: '02-Feb-2026 11:47:38', deviceOS: 'Windows 8.1', browser: 'Firefox 115.0', location: 'Chennai', ip: '172.71.210.161', network: '210.161' },
          { id: '10', dateTime: '31-Jan-2026 03:37:51', deviceOS: 'Linux', browser: 'Chrome 144.0.0.0', location: 'Bengaluru', ip: '104.23.168.37', network: '168.37' },
        ]);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ─── Formatters ────────────────────────────────────────────

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
  };

  const getStatusDot = (status: string) => {
    const colors: Record<string, string> = {
      active: '#22c55e', moderate: '#f59e0b', low: '#f97316', inactive: '#94a3b8',
    };
    return colors[status] || '#94a3b8';
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'warning', approved: 'primary', completed: 'success',
      rejected: 'danger', in_progress: 'info',
    };
    return map[status] || 'default';
  };

  // ─── Primary Stat Cards Config ─────────────────────────────

  const primaryStats = [
    {
      label: 'Total Applications', value: formatNumber(stats.totalApplications),
      change: '+11.8%', changeType: 'positive' as const,
      subStats: [
        { label: 'Daily Avg', value: formatNumber(stats.dailyAverage) },
        { label: 'Pending', value: formatNumber(stats.pendingApplications) },
        { label: 'Processing', value: `${stats.avgProcessingDays} days` },
      ],
      icon: HiOutlineClipboardList, color: 'primary',
      gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    },
    {
      label: 'Active Users', value: formatNumber(stats.totalUsers),
      change: '+4.2%', changeType: 'positive' as const,
      subStats: [
        { label: 'New (30d)', value: '18.5K' },
        { label: 'States', value: stats.statesActive.toString() },
        { label: 'Districts', value: stats.districtsActive.toString() },
      ],
      icon: HiOutlineUsers, color: 'success',
      gradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
    },
    {
      label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue),
      change: '+14.2%', changeType: 'positive' as const,
      subStats: [
        { label: 'Daily Avg', value: formatCurrency(stats.monthlyRevenue / 30) },
        { label: 'Success Rate', value: `${stats.successRate}%` },
        { label: 'Services', value: stats.activeServices.toString() },
      ],
      icon: HiOutlineCurrencyRupee, color: 'warning',
      gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    },
    {
      label: 'Completed', value: formatNumber(stats.completedApplications),
      change: '+15.3%', changeType: 'positive' as const,
      subStats: [
        { label: 'Approved', value: formatNumber(stats.approvedApplications) },
        { label: 'Rejected', value: formatNumber(stats.rejectedApplications) },
        { label: 'Rate', value: `${stats.successRate}%` },
      ],
      icon: HiOutlineCheckCircle, color: 'info',
      gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    },
  ];

  const quickActions = [
    { icon: HiOutlineDocumentText, label: 'New Application', desc: 'Start a new service request', path: '/applications/new' },
    { icon: HiOutlineCloudUpload, label: 'Upload Document', desc: 'Add documents to existing', path: '/documents' },
    { icon: HiOutlineSearch, label: 'Track Status', desc: 'Check application progress', path: '/applications' },
    { icon: HiOutlineSupport, label: 'Get Support', desc: 'Contact helpdesk', path: '/help' },
  ];

  // ─── Loading State ─────────────────────────────────────────

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

  const totalPipeline = pipeline.reduce((sum, s) => sum + s.count, 0);

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="bm-dashboard">
      {/* Animated Background */}
      <div className="bm-dashboard-bg">
        <div className="bm-bg-orb bm-bg-orb--1"></div>
        <div className="bm-bg-orb bm-bg-orb--2"></div>
        <div className="bm-bg-orb bm-bg-orb--3"></div>
        <div className="bm-bg-orb bm-bg-orb--4"></div>
        <div className="bm-bg-orb bm-bg-orb--5"></div>
        <div className="bm-bg-grid"></div>
      </div>

      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="bm-page-header">
        <div className="bm-header-left">
          <h1 className="bm-page-title">Dashboard</h1>
          <p className="bm-page-desc">Business Overview</p>
        </div>
        <div className="bm-header-right">
          <div className="bm-today-badge">
            <HiOutlineCalendar />
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
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

      {/* ─── Wallet + Stats Row ─────────────────────────────── */}
      <div className="bm-wallet-stats-row">
        {/* Wallet Summary Card */}
        <div className="bm-wallet-summary-card">
          <div className="bm-wallet-summary-header">
            <div className="bm-wallet-summary-icon">
              <HiOutlineCreditCard />
            </div>
            <span className="bm-wallet-summary-title">Wallet Balance</span>
          </div>
          <div className="bm-wallet-summary-balance">₹ 12,458.60</div>
          <div className="bm-wallet-summary-substats">
            <div className="bm-wallet-summary-sub">
              <span className="bm-wallet-summary-sub-value positive">+ ₹ 3,250</span>
              <span className="bm-wallet-summary-sub-label">Today's Earnings</span>
            </div>
            <div className="bm-wallet-summary-sub">
              <span className="bm-wallet-summary-sub-value">₹ 1,200</span>
              <span className="bm-wallet-summary-sub-label">Pending</span>
            </div>
          </div>
          <button className="bm-wallet-add-btn">+ Add Money</button>
        </div>

        {/* Existing Stat Cards */}
        {primaryStats.map((stat, index) => (
          <div key={index} className={`bm-stat-card bm-stat-card--${stat.color}`} style={{ background: stat.gradient }}>
            <div className="bm-stat-header">
              <div className={`bm-stat-icon bm-stat-icon--${stat.color}`}><stat.icon /></div>
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

      {/* ─── Today's Summary Bar ────────────────────────────── */}
      <div className="bm-today-summary">
        <div className="bm-today-item">
          <HiOutlineClipboardList className="bm-today-icon" />
          <div className="bm-today-info">
            <span className="bm-today-value">47</span>
            <span className="bm-today-label">Applications Today</span>
          </div>
          <span className="bm-today-change positive">+12%</span>
        </div>
        <div className="bm-today-divider"></div>
        <div className="bm-today-item">
          <HiOutlineCheckCircle className="bm-today-icon" />
          <div className="bm-today-info">
            <span className="bm-today-value">38</span>
            <span className="bm-today-label">Processed Today</span>
          </div>
          <span className="bm-today-change positive">+8%</span>
        </div>
        <div className="bm-today-divider"></div>
        <div className="bm-today-item">
          <HiOutlineCurrencyRupee className="bm-today-icon" />
          <div className="bm-today-info">
            <span className="bm-today-value">₹ 1.42L</span>
            <span className="bm-today-label">Revenue Today</span>
          </div>
          <span className="bm-today-change positive">+18%</span>
        </div>
        <div className="bm-today-divider"></div>
        <div className="bm-today-item">
          <HiOutlineUsers className="bm-today-icon" />
          <div className="bm-today-info">
            <span className="bm-today-value">126</span>
            <span className="bm-today-label">New Users Today</span>
          </div>
          <span className="bm-today-change negative">-3%</span>
        </div>
      </div>

      {/* ─── Application Pipeline ───────────────────────────── */}
      <section className="bm-card bm-pipeline-card">
        <div className="bm-card-header">
          <h2 className="bm-card-title">Application Pipeline</h2>
          <button className="bm-link-btn" onClick={() => navigate('/applications')}>View all <HiOutlineArrowSmRight /></button>
        </div>
        <div className="bm-pipeline">
          {pipeline.map((stage, idx) => (
            <div key={idx} className="bm-pipeline-stage">
              <div className="bm-pipeline-bar-wrapper">
                <div className="bm-pipeline-bar"
                  style={{ width: `${Math.max((stage.count / totalPipeline) * 100, 5)}%`, background: stage.color }}
                ></div>
              </div>
              <div className="bm-pipeline-info">
                <span className="bm-pipeline-count" style={{ color: stage.color }}>{formatNumber(stage.count)}</span>
                <span className="bm-pipeline-label">{stage.label}</span>
              </div>
              {idx < pipeline.length - 1 && <HiOutlineArrowSmRight className="bm-pipeline-arrow" />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Service Overview Tables ────────────────────────── */}
      <div className="bm-overview-row">
        {/* Document Services */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Document Services Overview</h2>
            <button className="bm-link-btn"><HiOutlineDotsHorizontal /></button>
          </div>
          <div className="bm-overview-table">
            <div className="bm-overview-table-header">
              <span></span>
              <span>Service</span>
              <span>Today</span>
              <span>All Time</span>
            </div>
            {documentServices.map((item, idx) => (
              <div key={idx} className="bm-overview-table-row">
                <span className="bm-overview-dot" style={{ background: getStatusDot(item.status) }}></span>
                <span className="bm-overview-name">{item.name}</span>
                <span className="bm-overview-count">{item.todayCount}</span>
                <span className="bm-overview-count">{item.allTimeCount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Digital Services */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Digital Services Overview</h2>
            <button className="bm-link-btn"><HiOutlineDotsHorizontal /></button>
          </div>
          <div className="bm-overview-table">
            <div className="bm-overview-table-header">
              <span></span>
              <span>Service</span>
              <span>Today</span>
              <span>All Time</span>
            </div>
            {digitalServices.map((item, idx) => (
              <div key={idx} className="bm-overview-table-row">
                <span className="bm-overview-dot" style={{ background: getStatusDot(item.status) }}></span>
                <span className="bm-overview-name">{item.name}</span>
                <span className="bm-overview-count">{item.todayCount}</span>
                <span className="bm-overview-count">{item.allTimeCount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── Payment / Business Overview ────────────────────── */}
      <section className="bm-card">
        <div className="bm-card-header">
          <h2 className="bm-card-title">Today's Business Overview (Payments)</h2>
        </div>
        <div className="bm-payment-overview">
          {paymentOverview.map((payment) => (
            <div key={payment.id} className="bm-payment-card" style={{ borderLeftColor: payment.color }}>
              <div className="bm-payment-icon-wrap" style={{ background: `${payment.color}15`, color: payment.color }}>
                {payment.icon === 'fees' && <HiOutlineCreditCard />}
                {payment.icon === 'online' && <HiOutlineCash />}
                {payment.icon === 'transfer' && <HiOutlineReceiptRefund />}
              </div>
              <div className="bm-payment-info">
                <span className="bm-payment-name">{payment.name}</span>
                <span className="bm-payment-amount">₹ {payment.amount.toLocaleString('en-IN')}</span>
                <div className="bm-payment-substats">
                  {payment.subStats.map((sub, idx) => (
                    <span key={idx} className="bm-payment-sub">
                      <span className="bm-payment-sub-dot" style={{ background: payment.color }}></span>
                      {sub.label}: <strong>{sub.value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Main Content Grid ──────────────────────────────── */}
      <div className="bm-content-main">
        {/* Left Column */}
        <div className="bm-content-left">
          {/* Top Services */}
          <section className="bm-card">
            <div className="bm-card-header">
              <h2 className="bm-card-title">Top Services</h2>
              <button className="bm-link-btn" onClick={() => navigate('/services')}>View all</button>
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
              <button className="bm-link-btn" onClick={() => navigate('/geography/states')}>View all</button>
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
                <button key={index} className="bm-quick-action" onClick={() => navigate(action.path)}>
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
              <button className="bm-link-btn" onClick={() => navigate('/applications')}>View all</button>
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

          {/* Support Center Card */}
          <section className="bm-card bm-support-card">
            <div className="bm-card-header">
              <h2 className="bm-card-title">Support Center</h2>
            </div>
            <div className="bm-support-content">
              <div className="bm-support-status">
                <HiOutlineStatusOnline className="bm-support-status-icon online" />
                <div>
                  <span className="bm-support-status-label">Status: ONLINE</span>
                  <span className="bm-support-available">AVAILABLE</span>
                </div>
              </div>
              <div className="bm-support-info-row">
                <HiOutlineClock />
                <div>
                  <span className="bm-support-info-title">Working Hours</span>
                  <span className="bm-support-info-desc">10AM to 6PM, Mon-Sat</span>
                </div>
              </div>
              <div className="bm-support-info-row">
                <HiOutlinePhone />
                <div>
                  <span className="bm-support-info-title">Helpline</span>
                  <span className="bm-support-info-desc bm-support-phone">1800-XXX-XXXX</span>
                </div>
              </div>
              <div className="bm-support-info-row">
                <HiOutlineChat />
                <div>
                  <span className="bm-support-info-title">WhatsApp</span>
                  <span className="bm-support-info-desc bm-support-phone">+91 XXXXX XXXXX</span>
                </div>
              </div>
              <div className="bm-support-note">
                <HiOutlineInformationCircle />
                <span>Response during working hours only</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ─── Login History ──────────────────────────────────── */}
      <section className="bm-card bm-login-history-card">
        <div className="bm-card-header">
          <h2 className="bm-card-title">Login History</h2>
          <button className="bm-link-btn"><HiOutlineDotsHorizontal /></button>
        </div>
        <div className="bm-login-table-wrapper">
          <table className="bm-login-table">
            <thead>
              <tr>
                <th>DATE & TIME</th>
                <th>DEVICE/OS</th>
                <th>BROWSER</th>
                <th>LOCATION</th>
                <th>IP</th>
                <th>NETWORK</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((entry) => (
                <tr key={entry.id}>
                  <td className="bm-login-date">{entry.dateTime}</td>
                  <td>
                    <span className="bm-login-device">
                      <HiOutlineDesktopComputer />
                      {entry.deviceOS}
                    </span>
                  </td>
                  <td>{entry.browser}</td>
                  <td>
                    <span className="bm-login-location">
                      <HiOutlineLocationMarker />
                      {entry.location}
                    </span>
                  </td>
                  <td><span className="bm-login-ip">{entry.ip}</span></td>
                  <td>{entry.network}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── System Health ──────────────────────────────────── */}
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
          <div className="bm-health-item">
            <HiOutlineShieldCheck className="bm-health-icon bm-health-icon--success" />
            <div className="bm-health-info">
              <span className="bm-health-label">Security</span>
              <span className="bm-health-value">Secure</span>
            </div>
          </div>
          <div className="bm-health-item">
            <HiOutlineGlobe className="bm-health-icon bm-health-icon--success" />
            <div className="bm-health-info">
              <span className="bm-health-label">DB Connections</span>
              <span className="bm-health-value">42/100</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
