import { useState, useEffect, useCallback } from 'react';
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
  HiOutlinePresentationChartBar,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineClock,
  HiOutlineExclamation,
} from 'react-icons/hi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PageHeader } from '../../components/common/PageHeader';
import './Reports.scss';

// ============================================
// TYPES
// ============================================
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

// localStorage persisted types
interface GeneratedReport {
  id: string;
  reportTypeId: string;
  reportName: string;
  category: string;
  format: 'pdf' | 'excel' | 'csv';
  period: string;
  generatedAt: string;
  status: 'completed' | 'generating' | 'failed';
  fileSize?: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  reportTypeId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  day?: string; // for weekly (Mon, Tue etc.) or monthly (1-31)
  format: 'pdf' | 'excel' | 'csv';
  recipients: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// CONSTANTS
// ============================================
const REPORT_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'applications', label: 'Applications' },
  { value: 'financial', label: 'Financial' },
  { value: 'users', label: 'Users' },
  { value: 'services', label: 'Services' },
  { value: 'geography', label: 'Geography' },
  { value: 'staff', label: 'Staff' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'analytics', label: 'Analytics' },
];

const generateId = () => `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ============================================
// COMPONENT
// ============================================
const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState<ReportStat[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [monthlyData, setMonthlyData] = useState<ReportData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'history'>('overview');

  // localStorage CRUD
  const [generatedReports, setGeneratedReports] = useLocalStorage<GeneratedReport[]>('bm-generated-reports', []);
  const [scheduledReports, setScheduledReports] = useLocalStorage<ScheduledReport[]>('bm-scheduled-reports', []);

  // Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'schedule' | 'history'>('schedule');

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    reportTypeId: 'application-summary',
    frequency: 'daily' as ScheduledReport['frequency'],
    time: '06:00',
    day: '',
    format: 'pdf' as ScheduledReport['format'],
    recipients: '',
    isActive: true,
  });

  // ============================================
  // LOAD MOCK DATA
  // ============================================
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 400));

        setStats([
          { label: 'Total Applications', value: '85,642', change: '+12.5%', changeType: 'positive', icon: HiOutlineClipboardList, color: 'primary' },
          { label: 'Active Users', value: '2,84,520', change: '+8.3%', changeType: 'positive', icon: HiOutlineUsers, color: 'success' },
          { label: 'Monthly Revenue', value: '₹4.28 Cr', change: '+15.2%', changeType: 'positive', icon: HiOutlineCurrencyRupee, color: 'warning' },
          { label: 'States Active', value: '28', change: '+2', changeType: 'positive', icon: HiOutlineGlobe, color: 'info' },
        ]);

        setReportTypes([
          { id: 'application-summary', name: 'Application Summary Report', description: 'Comprehensive report of all applications with status breakdown', category: 'applications', icon: HiOutlineClipboardList, lastGenerated: '2 hours ago' },
          { id: 'revenue-analysis', name: 'Revenue Analysis Report', description: 'Detailed revenue breakdown by service, state, and time period', category: 'financial', icon: HiOutlineCurrencyRupee, lastGenerated: '1 day ago' },
          { id: 'user-activity', name: 'User Activity Report', description: 'User registration trends, active users, and engagement metrics', category: 'users', icon: HiOutlineUsers, lastGenerated: '3 hours ago' },
          { id: 'service-performance', name: 'Service Performance Report', description: 'Service-wise application counts, processing times, and success rates', category: 'services', icon: HiOutlinePresentationChartBar, lastGenerated: '5 hours ago' },
          { id: 'state-wise', name: 'State-wise Report', description: 'Geographical distribution of applications and performance metrics', category: 'geography', icon: HiOutlineGlobe, lastGenerated: '12 hours ago' },
          { id: 'staff-performance', name: 'Staff Performance Report', description: 'Staff member productivity, processing times, and case handling', category: 'staff', icon: HiOutlineUsers, lastGenerated: '1 day ago' },
          { id: 'compliance', name: 'Compliance Report', description: 'SLA adherence, pending verifications, and audit trail', category: 'compliance', icon: HiOutlineDocumentText, lastGenerated: '2 days ago' },
          { id: 'trends', name: 'Trends & Analytics Report', description: 'Historical trends, forecasting, and comparative analysis', category: 'analytics', icon: HiOutlineTrendingUp, lastGenerated: '6 hours ago' },
        ]);

        setMonthlyData([
          { month: 'Jul', applications: 6234, approved: 5621, rejected: 321, revenue: 1870200 },
          { month: 'Aug', applications: 7456, approved: 6823, rejected: 412, revenue: 2236800 },
          { month: 'Sep', applications: 8123, approved: 7456, rejected: 389, revenue: 2436900 },
          { month: 'Oct', applications: 9234, approved: 8567, rejected: 456, revenue: 2770200 },
          { month: 'Nov', applications: 10456, approved: 9734, rejected: 512, revenue: 3136800 },
          { month: 'Dec', applications: 11234, approved: 10456, rejected: 534, revenue: 3370200 },
        ]);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [selectedPeriod]);

  // ============================================
  // GENERATED REPORTS CRUD
  // ============================================
  const handleGenerateReport = useCallback((reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    const report = reportTypes.find(r => r.id === reportId);
    if (!report) return;

    const fileSizes = { pdf: '2.4 MB', excel: '1.8 MB', csv: '856 KB' };
    const newGenerated: GeneratedReport = {
      id: generateId(),
      reportTypeId: reportId,
      reportName: report.name,
      category: report.category,
      format,
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      status: 'generating',
    };

    setGeneratedReports(prev => [newGenerated, ...prev]);

    // Simulate generation
    setTimeout(() => {
      setGeneratedReports(prev =>
        prev.map(r => r.id === newGenerated.id ? { ...r, status: 'completed', fileSize: fileSizes[format] } : r)
      );
    }, 1500);
  }, [reportTypes, selectedPeriod, setGeneratedReports]);

  const deleteGeneratedReport = useCallback((id: string) => {
    setGeneratedReports(prev => prev.filter(r => r.id !== id));
    setDeleteConfirm(null);
  }, [setGeneratedReports]);

  const clearAllHistory = useCallback(() => {
    setGeneratedReports([]);
  }, [setGeneratedReports]);

  // ============================================
  // SCHEDULED REPORTS CRUD
  // ============================================
  const resetScheduleForm = () => {
    setScheduleForm({
      name: '',
      reportTypeId: 'application-summary',
      frequency: 'daily',
      time: '06:00',
      day: '',
      format: 'pdf',
      recipients: '',
      isActive: true,
    });
    setEditingSchedule(null);
  };

  const openScheduleModal = () => {
    resetScheduleForm();
    setShowScheduleModal(true);
  };

  const openEditSchedule = (schedule: ScheduledReport) => {
    setScheduleForm({
      name: schedule.name,
      reportTypeId: schedule.reportTypeId,
      frequency: schedule.frequency,
      time: schedule.time,
      day: schedule.day || '',
      format: schedule.format,
      recipients: schedule.recipients,
      isActive: schedule.isActive,
    });
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const createSchedule = useCallback(() => {
    if (!scheduleForm.name.trim()) return;
    const newSchedule: ScheduledReport = {
      id: generateId(),
      name: scheduleForm.name.trim(),
      reportTypeId: scheduleForm.reportTypeId,
      frequency: scheduleForm.frequency,
      time: scheduleForm.time,
      day: scheduleForm.day || undefined,
      format: scheduleForm.format,
      recipients: scheduleForm.recipients.trim(),
      isActive: scheduleForm.isActive,
      createdAt: new Date().toISOString(),
    };
    setScheduledReports(prev => [...prev, newSchedule]);
    resetScheduleForm();
    setShowScheduleModal(false);
  }, [scheduleForm, setScheduledReports]);

  const updateSchedule = useCallback(() => {
    if (!editingSchedule || !scheduleForm.name.trim()) return;
    setScheduledReports(prev =>
      prev.map(s =>
        s.id === editingSchedule.id
          ? {
              ...s,
              name: scheduleForm.name.trim(),
              reportTypeId: scheduleForm.reportTypeId,
              frequency: scheduleForm.frequency,
              time: scheduleForm.time,
              day: scheduleForm.day || undefined,
              format: scheduleForm.format,
              recipients: scheduleForm.recipients.trim(),
              isActive: scheduleForm.isActive,
            }
          : s
      )
    );
    resetScheduleForm();
    setShowScheduleModal(false);
  }, [editingSchedule, scheduleForm, setScheduledReports]);

  const toggleScheduleActive = useCallback((id: string) => {
    setScheduledReports(prev =>
      prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
    );
  }, [setScheduledReports]);

  const deleteSchedule = useCallback((id: string) => {
    setScheduledReports(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
  }, [setScheduledReports]);

  // ============================================
  // FORMATTERS
  // ============================================
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatTime12h = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
  };

  const getFrequencyLabel = (schedule: ScheduledReport) => {
    switch (schedule.frequency) {
      case 'daily': return `Every day at ${formatTime12h(schedule.time)}`;
      case 'weekly': return `Every ${schedule.day || 'Monday'} at ${formatTime12h(schedule.time)}`;
      case 'monthly': return `${schedule.day ? `Day ${schedule.day}` : '1st'} of every month at ${formatTime12h(schedule.time)}`;
      default: return '';
    }
  };

  // ============================================
  // COMPUTED
  // ============================================
  const maxValue = Math.max(...monthlyData.map(d => d.applications), 1);
  const filteredReports = selectedCategory === 'all' ? reportTypes : reportTypes.filter(r => r.category === selectedCategory);

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
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="bm-period-select">
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
        <button className={`bm-reports-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <HiOutlinePresentationChartBar />
          <span>Overview</span>
        </button>
        <button className={`bm-reports-tab ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>
          <HiOutlineDocumentDownload />
          <span>Generate Reports</span>
        </button>
        <button className={`bm-reports-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <HiOutlineClock />
          <span>History ({generatedReports.length})</span>
        </button>
      </div>

      {/* ============================================
          OVERVIEW TAB
          ============================================ */}
      {activeTab === 'overview' && (
        <div className="bm-reports-content">
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
                        <div className="bm-bar bm-bar--applications" style={{ height: `${(data.applications / maxValue) * 100}%` }} title={`Applications: ${formatNumber(data.applications)}`} />
                        <div className="bm-bar bm-bar--approved" style={{ height: `${(data.approved / maxValue) * 100}%` }} title={`Approved: ${formatNumber(data.approved)}`} />
                        <div className="bm-bar bm-bar--rejected" style={{ height: `${(data.rejected / maxValue) * 15}%` }} title={`Rejected: ${formatNumber(data.rejected)}`} />
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
                      <div className="bm-revenue-bar" style={{ width: `${(data.revenue / Math.max(...monthlyData.map(d => d.revenue))) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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

      {/* ============================================
          GENERATE TAB
          ============================================ */}
      {activeTab === 'generate' && (
        <div className="bm-reports-generate">
          <div className="bm-reports-filter">
            <HiOutlineFilter className="bm-filter-icon" />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bm-category-select">
              {REPORT_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

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
                  <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => handleGenerateReport(report.id, 'pdf')}>
                    <HiOutlineRefresh />
                    Generate
                  </button>
                  <div className="bm-download-options">
                    <button className="bm-btn bm-btn-outline bm-btn-sm" onClick={() => handleGenerateReport(report.id, 'pdf')} title="Download PDF">PDF</button>
                    <button className="bm-btn bm-btn-outline bm-btn-sm" onClick={() => handleGenerateReport(report.id, 'excel')} title="Download Excel">Excel</button>
                    <button className="bm-btn bm-btn-outline bm-btn-sm" onClick={() => handleGenerateReport(report.id, 'csv')} title="Download CSV">CSV</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scheduled Reports - CRUD */}
          <div className="bm-card bm-scheduled-reports">
            <div className="bm-card-header">
              <h2 className="bm-card-title">Scheduled Reports ({scheduledReports.length})</h2>
              <button className="bm-btn bm-btn-sm bm-btn-primary" onClick={openScheduleModal}>
                <HiOutlinePlus />
                <span>Schedule New</span>
              </button>
            </div>
            <div className="bm-scheduled-list">
              {scheduledReports.length === 0 && (
                <div className="bm-scheduled-empty">
                  <HiOutlineCalendar />
                  <p>No scheduled reports yet. Click "Schedule New" to create one.</p>
                </div>
              )}
              {scheduledReports.map(schedule => (
                <div key={schedule.id} className="bm-scheduled-item">
                  <div className="bm-scheduled-info">
                    <HiOutlineClipboardList className="bm-scheduled-icon" />
                    <div>
                      <span className="bm-scheduled-name">{schedule.name}</span>
                      <span className="bm-scheduled-schedule">{getFrequencyLabel(schedule)}</span>
                      <span className="bm-scheduled-format">{schedule.format.toUpperCase()} {schedule.recipients && `• ${schedule.recipients}`}</span>
                    </div>
                  </div>
                  <div className="bm-scheduled-actions">
                    <button
                      className={`bm-scheduled-status ${schedule.isActive ? 'active' : 'paused'}`}
                      onClick={() => toggleScheduleActive(schedule.id)}
                      title={schedule.isActive ? 'Click to pause' : 'Click to activate'}
                    >
                      {schedule.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button className="bm-btn bm-btn-sm bm-btn-outline" onClick={() => openEditSchedule(schedule)}>
                      <HiOutlinePencil />
                    </button>
                    <button
                      className="bm-btn bm-btn-sm bm-btn-outline bm-btn-outline--danger"
                      onClick={() => { setDeleteConfirm(schedule.id); setDeleteType('schedule'); }}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          HISTORY TAB
          ============================================ */}
      {activeTab === 'history' && (
        <div className="bm-reports-history">
          <div className="bm-reports-history-header">
            <span className="bm-reports-history-count">{generatedReports.length} reports generated</span>
            {generatedReports.length > 0 && (
              <button className="bm-btn bm-btn-sm bm-btn-outline bm-btn-outline--danger" onClick={clearAllHistory}>
                <HiOutlineTrash /> Clear All
              </button>
            )}
          </div>

          {generatedReports.length === 0 ? (
            <div className="bm-reports-history-empty">
              <HiOutlineDocumentText />
              <h3>No Reports Generated</h3>
              <p>Generated reports will appear here. Go to the "Generate Reports" tab to create one.</p>
            </div>
          ) : (
            <div className="bm-table-container bm-card">
              <table className="bm-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Category</th>
                    <th>Format</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Generated</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReports.map(report => (
                    <tr key={report.id}>
                      <td><strong>{report.reportName}</strong></td>
                      <td>
                        <span className="bm-report-category-badge">{report.category}</span>
                      </td>
                      <td>
                        <span className="bm-format-badge">{report.format.toUpperCase()}</span>
                      </td>
                      <td>{report.period}</td>
                      <td>
                        <span className={`bm-status-badge bm-status-badge--${report.status}`}>
                          {report.status === 'generating' && <span className="bm-mini-spinner"></span>}
                          {report.status}
                        </span>
                      </td>
                      <td>{formatDateTime(report.generatedAt)}</td>
                      <td>{report.fileSize || '—'}</td>
                      <td>
                        <div className="bm-history-actions">
                          {report.status === 'completed' && (
                            <button className="bm-btn bm-btn-sm bm-btn-outline" title="Download">
                              <HiOutlineDocumentDownload />
                            </button>
                          )}
                          <button
                            className="bm-btn bm-btn-sm bm-btn-outline bm-btn-outline--danger"
                            onClick={() => { setDeleteConfirm(report.id); setDeleteType('history'); }}
                            title="Delete"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================
          SCHEDULE MODAL
          ============================================ */}
      {showScheduleModal && (
        <div className="bm-modal-overlay" onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }}>
          <div className="bm-modal" onClick={e => e.stopPropagation()}>
            <div className="bm-modal__header">
              <h2>{editingSchedule ? 'Edit Scheduled Report' : 'Schedule a Report'}</h2>
              <button className="bm-modal__close" onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }}>
                <HiOutlineX />
              </button>
            </div>
            <div className="bm-modal__body">
              <div className="bm-schedule-form">
                <div className="bm-schedule-form__field bm-schedule-form__field--full">
                  <label>Schedule Name *</label>
                  <input
                    type="text"
                    value={scheduleForm.name}
                    onChange={e => setScheduleForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Daily Application Summary"
                    autoFocus
                  />
                </div>

                <div className="bm-schedule-form__field">
                  <label>Report Type</label>
                  <select value={scheduleForm.reportTypeId} onChange={e => setScheduleForm(f => ({ ...f, reportTypeId: e.target.value }))}>
                    {reportTypes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bm-schedule-form__field">
                  <label>Format</label>
                  <select value={scheduleForm.format} onChange={e => setScheduleForm(f => ({ ...f, format: e.target.value as ScheduledReport['format'] }))}>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <div className="bm-schedule-form__field">
                  <label>Frequency</label>
                  <select value={scheduleForm.frequency} onChange={e => setScheduleForm(f => ({ ...f, frequency: e.target.value as ScheduledReport['frequency'] }))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="bm-schedule-form__field">
                  <label>Time</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))}
                  />
                </div>

                {scheduleForm.frequency === 'weekly' && (
                  <div className="bm-schedule-form__field">
                    <label>Day of Week</label>
                    <select value={scheduleForm.day} onChange={e => setScheduleForm(f => ({ ...f, day: e.target.value }))}>
                      <option value="">Select day</option>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                {scheduleForm.frequency === 'monthly' && (
                  <div className="bm-schedule-form__field">
                    <label>Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={scheduleForm.day}
                      onChange={e => setScheduleForm(f => ({ ...f, day: e.target.value }))}
                      placeholder="1-31"
                    />
                  </div>
                )}

                <div className="bm-schedule-form__field bm-schedule-form__field--full">
                  <label>Recipients (Email)</label>
                  <input
                    type="text"
                    value={scheduleForm.recipients}
                    onChange={e => setScheduleForm(f => ({ ...f, recipients: e.target.value }))}
                    placeholder="admin@bharatmithra.com (optional)"
                  />
                </div>

                <div className="bm-schedule-form__field bm-schedule-form__field--full">
                  <label className="bm-schedule-form__checkbox">
                    <input
                      type="checkbox"
                      checked={scheduleForm.isActive}
                      onChange={e => setScheduleForm(f => ({ ...f, isActive: e.target.checked }))}
                    />
                    Active (start generating immediately)
                  </label>
                </div>
              </div>
            </div>
            <div className="bm-modal__footer">
              <button className="bm-btn bm-btn-outline" onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }}>Cancel</button>
              <button
                className="bm-btn bm-btn-primary"
                onClick={editingSchedule ? updateSchedule : createSchedule}
                disabled={!scheduleForm.name.trim()}
              >
                <HiOutlineCheck />
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          DELETE CONFIRM MODAL
          ============================================ */}
      {deleteConfirm && (
        <div className="bm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="bm-modal bm-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="bm-confirm">
              <div className="bm-confirm__icon">
                <HiOutlineExclamation />
              </div>
              <h3>Delete {deleteType === 'schedule' ? 'Schedule' : 'Report'}?</h3>
              <p>This action cannot be undone.</p>
              <div className="bm-confirm__actions">
                <button className="bm-btn bm-btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button
                  className="bm-btn bm-btn-danger"
                  onClick={() => deleteType === 'schedule' ? deleteSchedule(deleteConfirm) : deleteGeneratedReport(deleteConfirm)}
                >
                  <HiOutlineTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
