import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineDocumentDownload,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineCurrencyRupee,
  HiOutlineGlobe,
  HiOutlineRefresh,
  HiOutlineTable,
  HiOutlinePresentationChartBar,
  HiOutlineDocumentText,
  HiOutlinePrinter
} from 'react-icons/hi';
import { PageHeader } from '../../components/common/PageHeader';
import './Reports.scss';

interface ReportStat {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  lastGenerated?: string;
}

interface ReportData {
  month: string;
  applications: number;
  approved: number;
  rejected: number;
  revenue: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState<ReportStat[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [monthlyData, setMonthlyData] = useState<ReportData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'generate'>('overview');

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        setStats([
          {
            label: 'Total Applications',
            value: '85,642',
            change: '+12.5%',
            changeType: 'positive',
            icon: HiOutlineClipboardList,
            color: 'primary'
          },
          {
            label: 'Active Users',
            value: '2,84,520',
            change: '+8.3%',
            changeType: 'positive',
            icon: HiOutlineUsers,
            color: 'success'
          },
          {
            label: 'Monthly Revenue',
            value: '₹4.28 Cr',
            change: '+15.2%',
            changeType: 'positive',
            icon: HiOutlineCurrencyRupee,
            color: 'warning'
          },
          {
            label: 'States Active',
            value: '28',
            change: '+2',
            changeType: 'positive',
            icon: HiOutlineGlobe,
            color: 'info'
          }
        ]);

        setReportTypes([
          {
            id: 'application-summary',
            name: 'Application Summary Report',
            description: 'Comprehensive report of all applications with status breakdown',
            category: 'applications',
            icon: HiOutlineClipboardList,
            lastGenerated: '2 hours ago'
          },
          {
            id: 'revenue-analysis',
            name: 'Revenue Analysis Report',
            description: 'Detailed revenue breakdown by service, state, and time period',
            category: 'financial',
            icon: HiOutlineCurrencyRupee,
            lastGenerated: '1 day ago'
          },
          {
            id: 'user-activity',
            name: 'User Activity Report',
            description: 'User registration trends, active users, and engagement metrics',
            category: 'users',
            icon: HiOutlineUsers,
            lastGenerated: '3 hours ago'
          },
          {
            id: 'service-performance',
            name: 'Service Performance Report',
            description: 'Service-wise application counts, processing times, and success rates',
            category: 'services',
            icon: HiOutlinePresentationChartBar,
            lastGenerated: '5 hours ago'
          },
          {
            id: 'state-wise',
            name: 'State-wise Report',
            description: 'Geographical distribution of applications and performance metrics',
            category: 'geography',
            icon: HiOutlineGlobe,
            lastGenerated: '12 hours ago'
          },
          {
            id: 'staff-performance',
            name: 'Staff Performance Report',
            description: 'Staff member productivity, processing times, and case handling',
            category: 'staff',
            icon: HiOutlineUsers,
            lastGenerated: '1 day ago'
          },
          {
            id: 'compliance',
            name: 'Compliance Report',
            description: 'SLA adherence, pending verifications, and audit trail',
            category: 'compliance',
            icon: HiOutlineDocumentText,
            lastGenerated: '2 days ago'
          },
          {
            id: 'trends',
            name: 'Trends & Analytics Report',
            description: 'Historical trends, forecasting, and comparative analysis',
            category: 'analytics',
            icon: HiOutlineTrendingUp,
            lastGenerated: '6 hours ago'
          }
        ]);

        setMonthlyData([
          { month: 'Jul', applications: 6234, approved: 5621, rejected: 321, revenue: 1870200 },
          { month: 'Aug', applications: 7456, approved: 6823, rejected: 412, revenue: 2236800 },
          { month: 'Sep', applications: 8123, approved: 7456, rejected: 389, revenue: 2436900 },
          { month: 'Oct', applications: 9234, approved: 8567, rejected: 456, revenue: 2770200 },
          { month: 'Nov', applications: 10456, approved: 9734, rejected: 512, revenue: 3136800 },
          { month: 'Dec', applications: 11234, approved: 10456, rejected: 534, revenue: 3370200 }
        ]);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleGenerateReport = (reportId: string) => {
    console.log('Generating report:', reportId);
    // Would trigger actual report generation
  };

  const handleDownloadReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    console.log('Downloading report:', reportId, 'format:', format);
    // Would trigger actual download
  };

  const maxValue = Math.max(...monthlyData.map(d => d.applications));

  const filteredReports = selectedCategory === 'all'
    ? reportTypes
    : reportTypes.filter(r => r.category === selectedCategory);

  if (loading) {
    return (
      <div className="bm-reports">
        <div className="bm-loading">
          <div className="bm-loading-spinner"></div>
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-reports">
      <PageHeader
        icon={<HiOutlineChartBar />}
        title="Reports & Analytics"
        description="Generate comprehensive reports and analyze performance metrics"
        actions={
          <div className="bm-header-actions">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bm-period-select"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
            <button className="bm-btn bm-btn-secondary">
              <HiOutlineRefresh />
              <span>Refresh</span>
            </button>
            <button className="bm-btn bm-btn-primary">
              <HiOutlineDocumentDownload />
              <span>Export All</span>
            </button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="bm-reports-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`bm-report-stat bm-report-stat--${stat.color}`}>
            <div className={`bm-report-stat-icon bm-report-stat-icon--${stat.color}`}>
              <stat.icon className="icon" />
            </div>
            <div className="bm-report-stat-content">
              <span className="bm-report-stat-value">{stat.value}</span>
              <span className="bm-report-stat-label">{stat.label}</span>
            </div>
            <div className={`bm-report-stat-change bm-report-stat-change--${stat.changeType}`}>
              {stat.changeType === 'positive' ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bm-reports-tabs">
        <button
          className={`bm-reports-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <HiOutlinePresentationChartBar />
          <span>Overview</span>
        </button>
        <button
          className={`bm-reports-tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          <HiOutlineDocumentDownload />
          <span>Generate Reports</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="bm-reports-content">
          {/* Chart Section */}
          <div className="bm-reports-chart-section">
            <div className="bm-card">
              <div className="bm-card-header">
                <h2 className="bm-card-title">Application Trends</h2>
                <div className="bm-chart-legend">
                  <span className="bm-legend-item bm-legend-item--applications">Applications</span>
                  <span className="bm-legend-item bm-legend-item--approved">Approved</span>
                  <span className="bm-legend-item bm-legend-item--rejected">Rejected</span>
                </div>
              </div>
              <div className="bm-chart-container">
                <div className="bm-bar-chart">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="bm-bar-group">
                      <div className="bm-bar-wrapper">
                        <div
                          className="bm-bar bm-bar--applications"
                          style={{ height: `${(data.applications / maxValue) * 100}%` }}
                          title={`Applications: ${formatNumber(data.applications)}`}
                        />
                        <div
                          className="bm-bar bm-bar--approved"
                          style={{ height: `${(data.approved / maxValue) * 100}%` }}
                          title={`Approved: ${formatNumber(data.approved)}`}
                        />
                        <div
                          className="bm-bar bm-bar--rejected"
                          style={{ height: `${(data.rejected / maxValue) * 15}%` }}
                          title={`Rejected: ${formatNumber(data.rejected)}`}
                        />
                      </div>
                      <span className="bm-bar-label">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bm-card">
              <div className="bm-card-header">
                <h2 className="bm-card-title">Revenue Trend</h2>
              </div>
              <div className="bm-revenue-chart">
                {monthlyData.map((data, index) => (
                  <div key={index} className="bm-revenue-item">
                    <div className="bm-revenue-info">
                      <span className="bm-revenue-month">{data.month}</span>
                      <span className="bm-revenue-value">{formatCurrency(data.revenue)}</span>
                    </div>
                    <div className="bm-revenue-bar-container">
                      <div
                        className="bm-revenue-bar"
                        style={{ width: `${(data.revenue / Math.max(...monthlyData.map(d => d.revenue))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bm-card bm-reports-table-card">
            <div className="bm-card-header">
              <h2 className="bm-card-title">Monthly Summary</h2>
              <button className="bm-btn bm-btn-sm bm-btn-secondary">
                <HiOutlineDocumentDownload />
                <span>Export</span>
              </button>
            </div>
            <div className="bm-table-container">
              <table className="bm-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Applications</th>
                    <th>Approved</th>
                    <th>Rejected</th>
                    <th>Success Rate</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((data, index) => (
                    <tr key={index}>
                      <td><strong>{data.month} 2024</strong></td>
                      <td>{formatNumber(data.applications)}</td>
                      <td className="bm-text-success">{formatNumber(data.approved)}</td>
                      <td className="bm-text-danger">{formatNumber(data.rejected)}</td>
                      <td>
                        <span className="bm-success-rate">
                          {((data.approved / data.applications) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td><strong>{formatCurrency(data.revenue)}</strong></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>{formatNumber(monthlyData.reduce((a, b) => a + b.applications, 0))}</strong></td>
                    <td className="bm-text-success"><strong>{formatNumber(monthlyData.reduce((a, b) => a + b.approved, 0))}</strong></td>
                    <td className="bm-text-danger"><strong>{formatNumber(monthlyData.reduce((a, b) => a + b.rejected, 0))}</strong></td>
                    <td>
                      <span className="bm-success-rate">
                        {((monthlyData.reduce((a, b) => a + b.approved, 0) / monthlyData.reduce((a, b) => a + b.applications, 0)) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td><strong>{formatCurrency(monthlyData.reduce((a, b) => a + b.revenue, 0))}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="bm-reports-generate">
          {/* Category Filter */}
          <div className="bm-reports-filter">
            <HiOutlineFilter className="bm-filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bm-category-select"
            >
              <option value="all">All Categories</option>
              <option value="applications">Applications</option>
              <option value="financial">Financial</option>
              <option value="users">Users</option>
              <option value="services">Services</option>
              <option value="geography">Geography</option>
              <option value="staff">Staff</option>
              <option value="compliance">Compliance</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>

          {/* Report Types Grid */}
          <div className="bm-reports-grid">
            {filteredReports.map((report) => (
              <div key={report.id} className="bm-report-card">
                <div className="bm-report-card-header">
                  <div className="bm-report-icon">
                    <report.icon className="icon" />
                  </div>
                  <div className="bm-report-meta">
                    <span className="bm-report-category">{report.category}</span>
                    {report.lastGenerated && (
                      <span className="bm-report-last">Last: {report.lastGenerated}</span>
                    )}
                  </div>
                </div>
                <h3 className="bm-report-name">{report.name}</h3>
                <p className="bm-report-desc">{report.description}</p>
                <div className="bm-report-actions">
                  <button
                    className="bm-btn bm-btn-primary bm-btn-sm"
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    <HiOutlineRefresh />
                    Generate
                  </button>
                  <div className="bm-download-options">
                    <button
                      className="bm-btn bm-btn-outline bm-btn-sm"
                      onClick={() => handleDownloadReport(report.id, 'pdf')}
                      title="Download PDF"
                    >
                      PDF
                    </button>
                    <button
                      className="bm-btn bm-btn-outline bm-btn-sm"
                      onClick={() => handleDownloadReport(report.id, 'excel')}
                      title="Download Excel"
                    >
                      Excel
                    </button>
                    <button
                      className="bm-btn bm-btn-outline bm-btn-sm"
                      onClick={() => handleDownloadReport(report.id, 'csv')}
                      title="Download CSV"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scheduled Reports */}
          <div className="bm-card bm-scheduled-reports">
            <div className="bm-card-header">
              <h2 className="bm-card-title">Scheduled Reports</h2>
              <button className="bm-btn bm-btn-sm bm-btn-primary">
                <HiOutlineCalendar />
                <span>Schedule New</span>
              </button>
            </div>
            <div className="bm-scheduled-list">
              <div className="bm-scheduled-item">
                <div className="bm-scheduled-info">
                  <HiOutlineClipboardList className="bm-scheduled-icon" />
                  <div>
                    <span className="bm-scheduled-name">Daily Application Summary</span>
                    <span className="bm-scheduled-schedule">Every day at 6:00 AM</span>
                  </div>
                </div>
                <div className="bm-scheduled-actions">
                  <span className="bm-scheduled-status active">Active</span>
                  <button className="bm-btn bm-btn-sm bm-btn-outline">Edit</button>
                </div>
              </div>
              <div className="bm-scheduled-item">
                <div className="bm-scheduled-info">
                  <HiOutlineCurrencyRupee className="bm-scheduled-icon" />
                  <div>
                    <span className="bm-scheduled-name">Weekly Revenue Report</span>
                    <span className="bm-scheduled-schedule">Every Monday at 9:00 AM</span>
                  </div>
                </div>
                <div className="bm-scheduled-actions">
                  <span className="bm-scheduled-status active">Active</span>
                  <button className="bm-btn bm-btn-sm bm-btn-outline">Edit</button>
                </div>
              </div>
              <div className="bm-scheduled-item">
                <div className="bm-scheduled-info">
                  <HiOutlineGlobe className="bm-scheduled-icon" />
                  <div>
                    <span className="bm-scheduled-name">Monthly State Performance</span>
                    <span className="bm-scheduled-schedule">1st of every month at 8:00 AM</span>
                  </div>
                </div>
                <div className="bm-scheduled-actions">
                  <span className="bm-scheduled-status active">Active</span>
                  <button className="bm-btn bm-btn-sm bm-btn-outline">Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
