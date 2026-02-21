import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  HiOutlinePhone,
  HiOutlinePhoneIncoming,
  HiOutlinePhoneOutgoing,
  HiOutlinePhoneMissedCall,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlinePlay,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineStar,
  HiOutlineLocationMarker,
  HiOutlineDownload,
  HiOutlineBell,
  HiOutlineStatusOnline,
  HiOutlineArrowSmRight,
} from 'react-icons/hi';
import './Telecaller.scss';

// ─── Types ────────────────────────────────────────────────

type CallStatus = 'completed' | 'missed' | 'scheduled' | 'in_progress' | 'voicemail' | 'callback';
type CallType = 'inbound' | 'outbound';
type CallDisposition = 'interested' | 'not_interested' | 'callback' | 'wrong_number' | 'no_answer' | 'voicemail' | 'converted' | 'information';
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'follow_up' | 'converted' | 'lost';
type Priority = 'high' | 'medium' | 'low';

interface CallRecord {
  id: string;
  callerName: string;
  callerPhone: string;
  callerLocation: string;
  type: CallType;
  status: CallStatus;
  disposition: CallDisposition;
  duration: string;
  date: string;
  time: string;
  agent: string;
  notes: string;
  leadStatus: LeadStatus;
  service: string;
  followUpDate?: string;
  recording?: boolean;
}

interface TelecallerAgent {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'on_call' | 'break' | 'offline';
  totalCalls: number;
  connectedCalls: number;
  avgDuration: string;
  conversionRate: number;
  rating: number;
  currentCall?: string;
  shift: string;
  callsToday: number;
  department: string;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  startDate: string;
  endDate: string;
  totalLeads: number;
  contacted: number;
  converted: number;
  target: number;
  type: string;
  assignedAgents: number;
}

interface ScheduledCallback {
  id: string;
  callerName: string;
  callerPhone: string;
  scheduledDate: string;
  scheduledTime: string;
  agent: string;
  service: string;
  priority: Priority;
  notes: string;
}

interface DailyMetric {
  hour: string;
  calls: number;
  connected: number;
}

// ─── Component ────────────────────────────────────────────

type TabType = 'overview' | 'calls' | 'agents' | 'campaigns' | 'callbacks';

const Telecaller = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<TelecallerAgent | null>(null);
  const [showNewCallModal, setShowNewCallModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ─── Mock Data ──────────────────────────────────────────

  const [calls, setCalls] = useLocalStorage<CallRecord[]>('bm-telecaller-calls', [
    { id: 'C001', callerName: 'Ramesh Kumar', callerPhone: '+91 98765 43210', callerLocation: 'Bengaluru, KA', type: 'inbound', status: 'completed', disposition: 'interested', duration: '04:32', date: '2026-02-21', time: '09:15 AM', agent: 'Priya Sharma', notes: 'Interested in caste certificate service. Needs to submit documents.', leadStatus: 'qualified', service: 'Caste Certificate', recording: true },
    { id: 'C002', callerName: 'Sunita Devi', callerPhone: '+91 87654 32109', callerLocation: 'Pune, MH', type: 'outbound', status: 'completed', disposition: 'converted', duration: '08:17', date: '2026-02-21', time: '09:45 AM', agent: 'Amit Patel', notes: 'Converted for income certificate. Payment link sent via SMS.', leadStatus: 'converted', service: 'Income Certificate', recording: true },
    { id: 'C003', callerName: 'Vikram Singh', callerPhone: '+91 76543 21098', callerLocation: 'Jaipur, RJ', type: 'inbound', status: 'missed', disposition: 'no_answer', duration: '00:00', date: '2026-02-21', time: '10:02 AM', agent: 'Neha Gupta', notes: 'Missed call - scheduled callback for afternoon.', leadStatus: 'new', service: 'PAN Card', followUpDate: '2026-02-21' },
    { id: 'C004', callerName: 'Meena Agarwal', callerPhone: '+91 65432 10987', callerLocation: 'Ahmedabad, GJ', type: 'outbound', status: 'completed', disposition: 'callback', duration: '02:15', date: '2026-02-21', time: '10:30 AM', agent: 'Rajesh Verma', notes: 'Customer busy, asked to call back at 3 PM.', leadStatus: 'contacted', service: 'GST Registration', followUpDate: '2026-02-21' },
    { id: 'C005', callerName: 'Arjun Reddy', callerPhone: '+91 54321 09876', callerLocation: 'Hyderabad, TS', type: 'inbound', status: 'completed', disposition: 'information', duration: '06:45', date: '2026-02-21', time: '11:00 AM', agent: 'Priya Sharma', notes: 'General inquiry about MSME registration process and fees.', leadStatus: 'follow_up', service: 'MSME Registration', recording: true },
    { id: 'C006', callerName: 'Kavitha Nair', callerPhone: '+91 43210 98765', callerLocation: 'Chennai, TN', type: 'outbound', status: 'completed', disposition: 'not_interested', duration: '01:23', date: '2026-02-21', time: '11:30 AM', agent: 'Amit Patel', notes: 'Not interested in renewal at this time. Try again next month.', leadStatus: 'lost', service: 'Driving License Renewal' },
    { id: 'C007', callerName: 'Deepak Joshi', callerPhone: '+91 32109 87654', callerLocation: 'Delhi, DL', type: 'inbound', status: 'in_progress', disposition: 'interested', duration: '03:15', date: '2026-02-21', time: '12:05 PM', agent: 'Neha Gupta', notes: 'Currently on call - discussing land record mutation.', leadStatus: 'contacted', service: 'Land Records', recording: true },
    { id: 'C008', callerName: 'Anjali Mishra', callerPhone: '+91 21098 76543', callerLocation: 'Lucknow, UP', type: 'outbound', status: 'voicemail', disposition: 'voicemail', duration: '00:45', date: '2026-02-21', time: '12:30 PM', agent: 'Rajesh Verma', notes: 'Left voicemail about pending birth certificate application status.', leadStatus: 'contacted', service: 'Birth Certificate' },
    { id: 'C009', callerName: 'Santosh Patil', callerPhone: '+91 10987 65432', callerLocation: 'Mumbai, MH', type: 'inbound', status: 'completed', disposition: 'converted', duration: '12:08', date: '2026-02-20', time: '02:00 PM', agent: 'Priya Sharma', notes: 'Converted for domicile certificate. Documents verified on call.', leadStatus: 'converted', service: 'Domicile Certificate', recording: true },
    { id: 'C010', callerName: 'Rekha Sharma', callerPhone: '+91 09876 54321', callerLocation: 'Kolkata, WB', type: 'outbound', status: 'completed', disposition: 'interested', duration: '05:30', date: '2026-02-20', time: '03:00 PM', agent: 'Amit Patel', notes: 'Interested in Aadhaar correction service. Will send documents via email.', leadStatus: 'qualified', service: 'Aadhaar Update', followUpDate: '2026-02-22' },
    { id: 'C011', callerName: 'Ganesh Rao', callerPhone: '+91 98123 45678', callerLocation: 'Bengaluru, KA', type: 'inbound', status: 'completed', disposition: 'wrong_number', duration: '00:18', date: '2026-02-20', time: '03:30 PM', agent: 'Neha Gupta', notes: 'Wrong number - person was looking for a different department.', leadStatus: 'lost', service: 'General' },
    { id: 'C012', callerName: 'Pooja Verma', callerPhone: '+91 87123 45678', callerLocation: 'Bhopal, MP', type: 'outbound', status: 'scheduled', disposition: 'callback', duration: '00:00', date: '2026-02-22', time: '10:00 AM', agent: 'Rajesh Verma', notes: 'Follow-up call for marriage certificate application.', leadStatus: 'follow_up', service: 'Marriage Certificate' },
    { id: 'C013', callerName: 'Manoj Tiwari', callerPhone: '+91 76123 45678', callerLocation: 'Patna, BR', type: 'outbound', status: 'completed', disposition: 'converted', duration: '09:22', date: '2026-02-20', time: '04:00 PM', agent: 'Priya Sharma', notes: 'Successfully converted. Payment received for property mutation.', leadStatus: 'converted', service: 'Property Mutation', recording: true },
    { id: 'C014', callerName: 'Lakshmi Iyer', callerPhone: '+91 65123 45678', callerLocation: 'Trivandrum, KL', type: 'inbound', status: 'completed', disposition: 'information', duration: '03:45', date: '2026-02-20', time: '04:30 PM', agent: 'Amit Patel', notes: 'Inquiry about voter ID correction process.', leadStatus: 'new', service: 'Voter ID Card' },
    { id: 'C015', callerName: 'Suresh Menon', callerPhone: '+91 54123 45678', callerLocation: 'Kochi, KL', type: 'outbound', status: 'completed', disposition: 'interested', duration: '07:10', date: '2026-02-19', time: '11:00 AM', agent: 'Neha Gupta', notes: 'Very interested in GST filing service. Scheduled a demo.', leadStatus: 'qualified', service: 'GST Filing', followUpDate: '2026-02-23', recording: true },
  ]);

  const [agents] = useLocalStorage<TelecallerAgent[]>('bm-telecaller-agents', [
    { id: 'A001', name: 'Priya Sharma', avatar: 'PS', status: 'on_call', totalCalls: 2456, connectedCalls: 1987, avgDuration: '5:32', conversionRate: 34.5, rating: 4.8, currentCall: 'Deepak Joshi', shift: '9 AM - 6 PM', callsToday: 18, department: 'Certificates' },
    { id: 'A002', name: 'Amit Patel', avatar: 'AP', status: 'available', totalCalls: 2123, connectedCalls: 1756, avgDuration: '4:15', conversionRate: 29.8, rating: 4.6, shift: '9 AM - 6 PM', callsToday: 15, department: 'Digital Services' },
    { id: 'A003', name: 'Neha Gupta', avatar: 'NG', status: 'available', totalCalls: 1987, connectedCalls: 1534, avgDuration: '4:48', conversionRate: 27.3, rating: 4.5, shift: '9 AM - 6 PM', callsToday: 12, department: 'Government Schemes' },
    { id: 'A004', name: 'Rajesh Verma', avatar: 'RV', status: 'break', totalCalls: 1876, connectedCalls: 1423, avgDuration: '6:02', conversionRate: 32.1, rating: 4.7, shift: '9 AM - 6 PM', callsToday: 10, department: 'Land Records' },
    { id: 'A005', name: 'Sneha Reddy', avatar: 'SR', status: 'available', totalCalls: 1654, connectedCalls: 1298, avgDuration: '3:45', conversionRate: 25.6, rating: 4.4, shift: '10 AM - 7 PM', callsToday: 8, department: 'PAN Services' },
    { id: 'A006', name: 'Vikash Kumar', avatar: 'VK', status: 'offline', totalCalls: 1432, connectedCalls: 1123, avgDuration: '5:15', conversionRate: 22.8, rating: 4.3, shift: '2 PM - 11 PM', callsToday: 0, department: 'MSME' },
  ]);

  const [campaigns] = useLocalStorage<Campaign[]>('bm-telecaller-campaigns', [
    { id: 'CAM001', name: 'Q1 Certificate Drive', status: 'active', startDate: '2026-01-15', endDate: '2026-03-31', totalLeads: 5000, contacted: 3245, converted: 876, target: 1500, type: 'Outbound', assignedAgents: 4 },
    { id: 'CAM002', name: 'GST Registration Push', status: 'active', startDate: '2026-02-01', endDate: '2026-02-28', totalLeads: 2000, contacted: 1234, converted: 345, target: 600, type: 'Outbound', assignedAgents: 3 },
    { id: 'CAM003', name: 'Customer Retention Drive', status: 'paused', startDate: '2026-01-01', endDate: '2026-03-31', totalLeads: 3000, contacted: 1876, converted: 543, target: 900, type: 'Outbound', assignedAgents: 2 },
    { id: 'CAM004', name: 'Aadhaar Update Awareness', status: 'completed', startDate: '2025-12-01', endDate: '2026-01-31', totalLeads: 4000, contacted: 3876, converted: 1234, target: 1200, type: 'Outbound', assignedAgents: 5 },
    { id: 'CAM005', name: 'New Service Launch - PVC Cards', status: 'scheduled', startDate: '2026-03-01', endDate: '2026-04-30', totalLeads: 6000, contacted: 0, converted: 0, target: 1800, type: 'Outbound', assignedAgents: 6 },
  ]);

  const [scheduledCallbacks] = useLocalStorage<ScheduledCallback[]>('bm-telecaller-callbacks', [
    { id: 'CB001', callerName: 'Vikram Singh', callerPhone: '+91 76543 21098', scheduledDate: '2026-02-21', scheduledTime: '02:00 PM', agent: 'Neha Gupta', service: 'PAN Card', priority: 'high', notes: 'Missed earlier call. Customer specifically requested afternoon.' },
    { id: 'CB002', callerName: 'Meena Agarwal', callerPhone: '+91 65432 10987', scheduledDate: '2026-02-21', scheduledTime: '03:00 PM', agent: 'Rajesh Verma', service: 'GST Registration', priority: 'medium', notes: 'Customer was busy. Requested callback at 3 PM.' },
    { id: 'CB003', callerName: 'Rekha Sharma', callerPhone: '+91 09876 54321', scheduledDate: '2026-02-22', scheduledTime: '10:00 AM', agent: 'Amit Patel', service: 'Aadhaar Update', priority: 'medium', notes: 'Needs document verification. Will have docs ready by tomorrow.' },
    { id: 'CB004', callerName: 'Pooja Verma', callerPhone: '+91 87123 45678', scheduledDate: '2026-02-22', scheduledTime: '10:00 AM', agent: 'Rajesh Verma', service: 'Marriage Certificate', priority: 'low', notes: 'Follow-up for marriage certificate. Documents pending.' },
    { id: 'CB005', callerName: 'Suresh Menon', callerPhone: '+91 54123 45678', scheduledDate: '2026-02-23', scheduledTime: '11:00 AM', agent: 'Neha Gupta', service: 'GST Filing', priority: 'high', notes: 'Demo scheduled for GST filing service. Very interested lead.' },
  ]);

  const hourlyMetrics: DailyMetric[] = [
    { hour: '9AM', calls: 12, connected: 9 },
    { hour: '10AM', calls: 18, connected: 14 },
    { hour: '11AM', calls: 22, connected: 17 },
    { hour: '12PM', calls: 15, connected: 11 },
    { hour: '1PM', calls: 8, connected: 5 },
    { hour: '2PM', calls: 20, connected: 16 },
    { hour: '3PM', calls: 25, connected: 19 },
    { hour: '4PM', calls: 19, connected: 15 },
    { hour: '5PM', calls: 14, connected: 10 },
  ];

  // ─── Computed Stats ─────────────────────────────────────

  const todayCalls = calls.filter(c => c.date === '2026-02-21');
  const totalCallsToday = todayCalls.length;
  const completedCallsToday = todayCalls.filter(c => c.status === 'completed').length;
  const missedCallsToday = todayCalls.filter(c => c.status === 'missed').length;
  const inProgressCalls = todayCalls.filter(c => c.status === 'in_progress').length;
  const convertedToday = todayCalls.filter(c => c.disposition === 'converted').length;
  const avgDurationToday = todayCalls.filter(c => c.duration !== '00:00').length > 0 ? '4:38' : '0:00';
  const onlineAgents = agents.filter(a => a.status !== 'offline').length;
  const availableAgents = agents.filter(a => a.status === 'available').length;

  // ─── Helpers ────────────────────────────────────────────

  const getCallStatusColor = (status: CallStatus) => {
    const map: Record<CallStatus, string> = {
      completed: '#22c55e', missed: '#ef4444', scheduled: '#3b82f6',
      in_progress: '#f59e0b', voicemail: '#8b5cf6', callback: '#06b6d4',
    };
    return map[status];
  };

  const getCallStatusBg = (status: CallStatus) => `${getCallStatusColor(status)}15`;

  const getDispositionLabel = (d: CallDisposition) => {
    const map: Record<CallDisposition, string> = {
      interested: 'Interested', not_interested: 'Not Interested', callback: 'Callback',
      wrong_number: 'Wrong Number', no_answer: 'No Answer', voicemail: 'Voicemail',
      converted: 'Converted', information: 'Information',
    };
    return map[d];
  };

  const getDispositionColor = (d: CallDisposition) => {
    const map: Record<CallDisposition, string> = {
      interested: '#3b82f6', not_interested: '#ef4444', callback: '#f59e0b',
      wrong_number: '#94a3b8', no_answer: '#94a3b8', voicemail: '#8b5cf6',
      converted: '#22c55e', information: '#06b6d4',
    };
    return map[d];
  };

  const getLeadStatusColor = (s: LeadStatus) => {
    const map: Record<LeadStatus, string> = {
      new: '#3b82f6', contacted: '#f59e0b', qualified: '#8b5cf6',
      follow_up: '#06b6d4', converted: '#22c55e', lost: '#ef4444',
    };
    return map[s];
  };

  const getAgentStatusColor = (s: string) => {
    const map: Record<string, string> = {
      available: '#22c55e', on_call: '#f59e0b', break: '#8b5cf6', offline: '#94a3b8',
    };
    return map[s] || '#94a3b8';
  };

  const getCampaignStatusColor = (s: string) => {
    const map: Record<string, string> = {
      active: '#22c55e', paused: '#f59e0b', completed: '#3b82f6', scheduled: '#8b5cf6',
    };
    return map[s] || '#94a3b8';
  };

  const getPriorityColor = (p: Priority) => {
    const map: Record<Priority, string> = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
    return map[p];
  };

  // ─── Filters ────────────────────────────────────────────

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const matchesSearch = searchQuery === '' ||
        call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.callerPhone.includes(searchQuery) ||
        call.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.agent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
      const matchesType = filterType === 'all' || call.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [calls, searchQuery, filterStatus, filterType]);

  const handleDeleteCall = useCallback((id: string) => {
    setCalls(calls.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
  }, [calls, setCalls]);

  // ─── Tabs Config ────────────────────────────────────────

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <HiOutlineChartBar /> },
    { key: 'calls', label: 'Call Log', icon: <HiOutlinePhone /> },
    { key: 'agents', label: 'Agents', icon: <HiOutlineUsers /> },
    { key: 'campaigns', label: 'Campaigns', icon: <HiOutlineClipboardList /> },
    { key: 'callbacks', label: 'Callbacks', icon: <HiOutlineBell /> },
  ];

  const maxHourlyCalls = Math.max(...hourlyMetrics.map(m => m.calls));

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="tc-container">
      {/* Header */}
      <header className="tc-header">
        <div className="tc-header-left">
          <h1 className="tc-title">Telecaller Dashboard</h1>
          <p className="tc-subtitle">Manage calls, agents & campaigns</p>
        </div>
        <div className="tc-header-right">
          <div className="tc-live-badge">
            <HiOutlineStatusOnline />
            <span>{onlineAgents} Agents Online</span>
          </div>
          <button className="tc-btn tc-btn-secondary" onClick={() => setShowNewCallModal(true)}>
            <HiOutlinePlus /> New Call
          </button>
          <button className="tc-btn tc-btn-primary">
            <HiOutlineDownload /> Export
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tc-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tc-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="tc-overview">
          {/* Stats Cards */}
          <div className="tc-stats-grid">
            <div className="tc-stat-card tc-stat-card--total">
              <div className="tc-stat-icon"><HiOutlinePhone /></div>
              <div className="tc-stat-content">
                <span className="tc-stat-value">{totalCallsToday}</span>
                <span className="tc-stat-label">Total Calls Today</span>
              </div>
              <div className="tc-stat-trend positive"><HiOutlineTrendingUp /> +12%</div>
            </div>
            <div className="tc-stat-card tc-stat-card--completed">
              <div className="tc-stat-icon"><HiOutlineCheck /></div>
              <div className="tc-stat-content">
                <span className="tc-stat-value">{completedCallsToday}</span>
                <span className="tc-stat-label">Connected</span>
              </div>
              <div className="tc-stat-trend positive"><HiOutlineTrendingUp /> +8%</div>
            </div>
            <div className="tc-stat-card tc-stat-card--missed">
              <div className="tc-stat-icon"><HiOutlinePhoneMissedCall /></div>
              <div className="tc-stat-content">
                <span className="tc-stat-value">{missedCallsToday}</span>
                <span className="tc-stat-label">Missed</span>
              </div>
              <div className="tc-stat-trend negative"><HiOutlineTrendingDown /> -5%</div>
            </div>
            <div className="tc-stat-card tc-stat-card--progress">
              <div className="tc-stat-icon"><HiOutlineClock /></div>
              <div className="tc-stat-content">
                <span className="tc-stat-value">{inProgressCalls}</span>
                <span className="tc-stat-label">In Progress</span>
              </div>
              <div className="tc-stat-badge">LIVE</div>
            </div>
            <div className="tc-stat-card tc-stat-card--converted">
              <div className="tc-stat-icon"><HiOutlineStar /></div>
              <div className="tc-stat-content">
                <span className="tc-stat-value">{convertedToday}</span>
                <span className="tc-stat-label">Converted</span>
              </div>
              <div className="tc-stat-trend positive"><HiOutlineTrendingUp /> +15%</div>
            </div>
            <div className="tc-stat-card tc-stat-card--duration">
              <div className="tc-stat-icon"><HiOutlineClock /></div>
              <div className="tc-stat-content">
                <span className="tc-stat-value">{avgDurationToday}</span>
                <span className="tc-stat-label">Avg Duration</span>
              </div>
              <span className="tc-stat-sub">min:sec</span>
            </div>
          </div>

          {/* Hourly Call Volume Chart + Agent Status */}
          <div className="tc-overview-row">
            <section className="tc-card tc-chart-card">
              <div className="tc-card-header">
                <h2>Today's Call Volume (Hourly)</h2>
                <div className="tc-chart-legend">
                  <span><span className="tc-legend-dot" style={{ background: 'var(--color-primary)' }}></span> Total</span>
                  <span><span className="tc-legend-dot" style={{ background: '#22c55e' }}></span> Connected</span>
                </div>
              </div>
              <div className="tc-hourly-chart">
                {hourlyMetrics.map((m, i) => (
                  <div key={i} className="tc-hourly-bar-group">
                    <div className="tc-hourly-bars">
                      <div className="tc-hourly-bar tc-hourly-bar--total" style={{ height: `${(m.calls / maxHourlyCalls) * 100}%` }}>
                        <span className="tc-bar-tooltip">{m.calls}</span>
                      </div>
                      <div className="tc-hourly-bar tc-hourly-bar--connected" style={{ height: `${(m.connected / maxHourlyCalls) * 100}%` }}>
                        <span className="tc-bar-tooltip">{m.connected}</span>
                      </div>
                    </div>
                    <span className="tc-hourly-label">{m.hour}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="tc-card tc-agents-summary">
              <div className="tc-card-header">
                <h2>Agent Status</h2>
                <span className="tc-badge">{onlineAgents}/{agents.length} Online</span>
              </div>
              <div className="tc-agent-status-list">
                {agents.map(agent => (
                  <div key={agent.id} className="tc-agent-status-item">
                    <div className="tc-agent-avatar" style={{ borderColor: getAgentStatusColor(agent.status) }}>
                      {agent.avatar}
                    </div>
                    <div className="tc-agent-status-info">
                      <span className="tc-agent-status-name">{agent.name}</span>
                      <span className="tc-agent-status-detail">
                        {agent.status === 'on_call' && agent.currentCall ? `On call: ${agent.currentCall}` : agent.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="tc-agent-status-badge" style={{ color: getAgentStatusColor(agent.status), background: `${getAgentStatusColor(agent.status)}15` }}>
                      <span className="tc-status-dot" style={{ background: getAgentStatusColor(agent.status) }}></span>
                      {agent.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Lead Pipeline + Recent Calls */}
          <div className="tc-overview-row">
            <section className="tc-card">
              <div className="tc-card-header">
                <h2>Lead Disposition Breakdown</h2>
              </div>
              <div className="tc-disposition-grid">
                {(['converted', 'interested', 'callback', 'information', 'not_interested', 'no_answer', 'wrong_number', 'voicemail'] as CallDisposition[]).map(d => {
                  const count = calls.filter(c => c.disposition === d).length;
                  const pct = calls.length > 0 ? ((count / calls.length) * 100).toFixed(1) : '0';
                  return (
                    <div key={d} className="tc-disposition-item">
                      <div className="tc-disposition-bar" style={{ width: `${pct}%`, background: getDispositionColor(d) }}></div>
                      <div className="tc-disposition-info">
                        <span className="tc-disposition-label">{getDispositionLabel(d)}</span>
                        <span className="tc-disposition-count">{count} ({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="tc-card">
              <div className="tc-card-header">
                <h2>Upcoming Callbacks</h2>
                <span className="tc-badge">{scheduledCallbacks.length}</span>
              </div>
              <div className="tc-callbacks-mini">
                {scheduledCallbacks.slice(0, 4).map(cb => (
                  <div key={cb.id} className="tc-callback-mini-item">
                    <div className="tc-callback-priority" style={{ background: getPriorityColor(cb.priority) }}></div>
                    <div className="tc-callback-mini-info">
                      <span className="tc-callback-mini-name">{cb.callerName}</span>
                      <span className="tc-callback-mini-meta">{cb.service} · {cb.scheduledTime}</span>
                    </div>
                    <span className="tc-callback-mini-date">{cb.scheduledDate === '2026-02-21' ? 'Today' : cb.scheduledDate.split('-').slice(1).join('/')}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Active Campaigns Summary */}
          <section className="tc-card">
            <div className="tc-card-header">
              <h2>Active Campaigns</h2>
              <button className="tc-link-btn" onClick={() => setActiveTab('campaigns')}>View all <HiOutlineArrowSmRight /></button>
            </div>
            <div className="tc-campaigns-summary">
              {campaigns.filter(c => c.status === 'active').map(camp => (
                <div key={camp.id} className="tc-campaign-summary-card">
                  <div className="tc-campaign-summary-header">
                    <span className="tc-campaign-summary-name">{camp.name}</span>
                    <span className="tc-campaign-status-badge" style={{ color: getCampaignStatusColor(camp.status), background: `${getCampaignStatusColor(camp.status)}15` }}>
                      {camp.status}
                    </span>
                  </div>
                  <div className="tc-campaign-progress">
                    <div className="tc-campaign-progress-bar">
                      <div className="tc-campaign-progress-fill" style={{ width: `${(camp.converted / camp.target) * 100}%` }}></div>
                    </div>
                    <span className="tc-campaign-progress-text">{camp.converted}/{camp.target} conversions</span>
                  </div>
                  <div className="tc-campaign-summary-stats">
                    <span><HiOutlineUsers /> {camp.assignedAgents} agents</span>
                    <span><HiOutlinePhone /> {camp.contacted}/{camp.totalLeads} contacted</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ─── Calls Tab ───────────────────────────────────────── */}
      {activeTab === 'calls' && (
        <div className="tc-calls">
          <div className="tc-toolbar">
            <div className="tc-search-box">
              <HiOutlineSearch />
              <input
                type="text"
                placeholder="Search calls by name, phone, service..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button className="tc-search-clear" onClick={() => setSearchQuery('')}><HiOutlineX /></button>}
            </div>
            <div className="tc-filters">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="tc-select">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="voicemail">Voicemail</option>
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="tc-select">
                <option value="all">All Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </div>
          </div>

          <div className="tc-table-wrapper">
            <table className="tc-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Caller</th>
                  <th>Phone</th>
                  <th>Service</th>
                  <th>Agent</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Disposition</th>
                  <th>Date/Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map(call => (
                  <tr key={call.id} className={call.status === 'in_progress' ? 'tc-row-active' : ''}>
                    <td>
                      <span className={`tc-call-type tc-call-type--${call.type}`}>
                        {call.type === 'inbound' ? <HiOutlinePhoneIncoming /> : <HiOutlinePhoneOutgoing />}
                      </span>
                    </td>
                    <td>
                      <div className="tc-caller-info">
                        <span className="tc-caller-name">{call.callerName}</span>
                        <span className="tc-caller-location"><HiOutlineLocationMarker /> {call.callerLocation}</span>
                      </div>
                    </td>
                    <td className="tc-phone">{call.callerPhone}</td>
                    <td>{call.service}</td>
                    <td>{call.agent}</td>
                    <td className="tc-duration">{call.duration}</td>
                    <td>
                      <span className="tc-status-pill" style={{ color: getCallStatusColor(call.status), background: getCallStatusBg(call.status) }}>
                        {call.status === 'in_progress' && <span className="tc-pulse-dot"></span>}
                        {call.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="tc-disposition-pill" style={{ color: getDispositionColor(call.disposition) }}>
                        {getDispositionLabel(call.disposition)}
                      </span>
                    </td>
                    <td className="tc-datetime">
                      <span>{call.date}</span>
                      <span>{call.time}</span>
                    </td>
                    <td className="tc-actions">
                      <button className="tc-icon-btn" title="View" onClick={() => setSelectedCall(call)}><HiOutlineEye /></button>
                      <button className="tc-icon-btn tc-icon-btn--danger" title="Delete" onClick={() => setShowDeleteConfirm(call.id)}><HiOutlineTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCalls.length === 0 && (
            <div className="tc-empty">
              <HiOutlinePhone />
              <p>No calls found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Agents Tab ──────────────────────────────────────── */}
      {activeTab === 'agents' && (
        <div className="tc-agents">
          <div className="tc-agents-overview">
            <div className="tc-agents-stat"><span className="tc-agents-stat-val">{agents.length}</span><span>Total</span></div>
            <div className="tc-agents-stat"><span className="tc-agents-stat-val" style={{ color: '#22c55e' }}>{availableAgents}</span><span>Available</span></div>
            <div className="tc-agents-stat"><span className="tc-agents-stat-val" style={{ color: '#f59e0b' }}>{agents.filter(a => a.status === 'on_call').length}</span><span>On Call</span></div>
            <div className="tc-agents-stat"><span className="tc-agents-stat-val" style={{ color: '#8b5cf6' }}>{agents.filter(a => a.status === 'break').length}</span><span>On Break</span></div>
            <div className="tc-agents-stat"><span className="tc-agents-stat-val" style={{ color: '#94a3b8' }}>{agents.filter(a => a.status === 'offline').length}</span><span>Offline</span></div>
          </div>

          <div className="tc-agents-grid">
            {agents.map(agent => (
              <div key={agent.id} className="tc-agent-card" onClick={() => setSelectedAgent(agent)}>
                <div className="tc-agent-card-header">
                  <div className="tc-agent-avatar-lg" style={{ borderColor: getAgentStatusColor(agent.status) }}>
                    {agent.avatar}
                    <span className="tc-agent-status-indicator" style={{ background: getAgentStatusColor(agent.status) }}></span>
                  </div>
                  <div className="tc-agent-card-info">
                    <span className="tc-agent-card-name">{agent.name}</span>
                    <span className="tc-agent-card-dept">{agent.department}</span>
                    <span className="tc-agent-card-shift"><HiOutlineClock /> {agent.shift}</span>
                  </div>
                  <div className="tc-agent-rating">
                    <HiOutlineStar />
                    <span>{agent.rating}</span>
                  </div>
                </div>
                {agent.status === 'on_call' && agent.currentCall && (
                  <div className="tc-agent-current-call">
                    <span className="tc-pulse-dot"></span>
                    <span>On call with: {agent.currentCall}</span>
                  </div>
                )}
                <div className="tc-agent-card-stats">
                  <div className="tc-agent-card-stat">
                    <span className="tc-agent-card-stat-val">{agent.callsToday}</span>
                    <span>Today</span>
                  </div>
                  <div className="tc-agent-card-stat">
                    <span className="tc-agent-card-stat-val">{agent.totalCalls.toLocaleString()}</span>
                    <span>Total Calls</span>
                  </div>
                  <div className="tc-agent-card-stat">
                    <span className="tc-agent-card-stat-val">{agent.conversionRate}%</span>
                    <span>Conversion</span>
                  </div>
                  <div className="tc-agent-card-stat">
                    <span className="tc-agent-card-stat-val">{agent.avgDuration}</span>
                    <span>Avg Duration</span>
                  </div>
                </div>
                <div className="tc-agent-card-progress">
                  <div className="tc-agent-card-progress-label">
                    <span>Connection Rate</span>
                    <span>{((agent.connectedCalls / agent.totalCalls) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="tc-progress-bar">
                    <div className="tc-progress-fill" style={{ width: `${(agent.connectedCalls / agent.totalCalls) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Campaigns Tab ───────────────────────────────────── */}
      {activeTab === 'campaigns' && (
        <div className="tc-campaigns">
          <div className="tc-campaigns-grid">
            {campaigns.map(camp => {
              const progress = camp.totalLeads > 0 ? (camp.contacted / camp.totalLeads) * 100 : 0;
              const conversionProgress = camp.target > 0 ? (camp.converted / camp.target) * 100 : 0;
              return (
                <div key={camp.id} className="tc-campaign-card">
                  <div className="tc-campaign-header">
                    <div>
                      <span className="tc-campaign-name">{camp.name}</span>
                      <span className="tc-campaign-type">{camp.type}</span>
                    </div>
                    <span className="tc-campaign-status" style={{ color: getCampaignStatusColor(camp.status), background: `${getCampaignStatusColor(camp.status)}15` }}>
                      {camp.status === 'active' && <span className="tc-pulse-dot"></span>}
                      {camp.status}
                    </span>
                  </div>
                  <div className="tc-campaign-dates">
                    <HiOutlineCalendar />
                    <span>{camp.startDate} to {camp.endDate}</span>
                  </div>
                  <div className="tc-campaign-metrics">
                    <div className="tc-campaign-metric">
                      <span className="tc-campaign-metric-val">{camp.totalLeads.toLocaleString()}</span>
                      <span>Total Leads</span>
                    </div>
                    <div className="tc-campaign-metric">
                      <span className="tc-campaign-metric-val">{camp.contacted.toLocaleString()}</span>
                      <span>Contacted</span>
                    </div>
                    <div className="tc-campaign-metric">
                      <span className="tc-campaign-metric-val" style={{ color: '#22c55e' }}>{camp.converted.toLocaleString()}</span>
                      <span>Converted</span>
                    </div>
                    <div className="tc-campaign-metric">
                      <span className="tc-campaign-metric-val">{camp.assignedAgents}</span>
                      <span>Agents</span>
                    </div>
                  </div>
                  <div className="tc-campaign-bars">
                    <div className="tc-campaign-bar-item">
                      <div className="tc-campaign-bar-label">
                        <span>Contact Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="tc-progress-bar">
                        <div className="tc-progress-fill tc-progress-fill--blue" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <div className="tc-campaign-bar-item">
                      <div className="tc-campaign-bar-label">
                        <span>Conversion Target</span>
                        <span>{conversionProgress.toFixed(0)}%</span>
                      </div>
                      <div className="tc-progress-bar">
                        <div className="tc-progress-fill tc-progress-fill--green" style={{ width: `${Math.min(conversionProgress, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Callbacks Tab ───────────────────────────────────── */}
      {activeTab === 'callbacks' && (
        <div className="tc-callbacks">
          <div className="tc-callbacks-header">
            <div className="tc-callbacks-stats">
              <div className="tc-callback-stat">
                <span className="tc-callback-stat-val">{scheduledCallbacks.length}</span>
                <span>Total Scheduled</span>
              </div>
              <div className="tc-callback-stat">
                <span className="tc-callback-stat-val" style={{ color: '#ef4444' }}>{scheduledCallbacks.filter(c => c.priority === 'high').length}</span>
                <span>High Priority</span>
              </div>
              <div className="tc-callback-stat">
                <span className="tc-callback-stat-val" style={{ color: '#3b82f6' }}>{scheduledCallbacks.filter(c => c.scheduledDate === '2026-02-21').length}</span>
                <span>Today</span>
              </div>
            </div>
          </div>
          <div className="tc-callbacks-list">
            {scheduledCallbacks.map(cb => (
              <div key={cb.id} className="tc-callback-card">
                <div className="tc-callback-priority-bar" style={{ background: getPriorityColor(cb.priority) }}></div>
                <div className="tc-callback-content">
                  <div className="tc-callback-top">
                    <div className="tc-callback-caller">
                      <span className="tc-callback-name">{cb.callerName}</span>
                      <span className="tc-callback-phone"><HiOutlinePhone /> {cb.callerPhone}</span>
                    </div>
                    <div className="tc-callback-schedule">
                      <span className="tc-callback-date"><HiOutlineCalendar /> {cb.scheduledDate === '2026-02-21' ? 'Today' : cb.scheduledDate}</span>
                      <span className="tc-callback-time"><HiOutlineClock /> {cb.scheduledTime}</span>
                    </div>
                  </div>
                  <div className="tc-callback-bottom">
                    <span className="tc-callback-service">{cb.service}</span>
                    <span className="tc-callback-agent"><HiOutlineUser /> {cb.agent}</span>
                    <span className="tc-callback-priority-badge" style={{ color: getPriorityColor(cb.priority), background: `${getPriorityColor(cb.priority)}15` }}>
                      {cb.priority}
                    </span>
                  </div>
                  <p className="tc-callback-notes">{cb.notes}</p>
                  <div className="tc-callback-actions">
                    <button className="tc-btn tc-btn-sm tc-btn-primary"><HiOutlinePhone /> Call Now</button>
                    <button className="tc-btn tc-btn-sm tc-btn-secondary"><HiOutlineCalendar /> Reschedule</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Call Detail Modal ───────────────────────────────── */}
      {selectedCall && (
        <div className="tc-modal-overlay" onClick={() => setSelectedCall(null)}>
          <div className="tc-modal" onClick={e => e.stopPropagation()}>
            <div className="tc-modal-header">
              <h2>Call Details — {selectedCall.id}</h2>
              <button className="tc-modal-close" onClick={() => setSelectedCall(null)}><HiOutlineX /></button>
            </div>
            <div className="tc-modal-body">
              <div className="tc-detail-grid">
                <div className="tc-detail-section">
                  <h3>Caller Information</h3>
                  <div className="tc-detail-row"><span>Name</span><span>{selectedCall.callerName}</span></div>
                  <div className="tc-detail-row"><span>Phone</span><span>{selectedCall.callerPhone}</span></div>
                  <div className="tc-detail-row"><span>Location</span><span>{selectedCall.callerLocation}</span></div>
                  <div className="tc-detail-row"><span>Service</span><span>{selectedCall.service}</span></div>
                </div>
                <div className="tc-detail-section">
                  <h3>Call Information</h3>
                  <div className="tc-detail-row"><span>Type</span><span className={`tc-call-type tc-call-type--${selectedCall.type}`}>{selectedCall.type === 'inbound' ? <><HiOutlinePhoneIncoming /> Inbound</> : <><HiOutlinePhoneOutgoing /> Outbound</>}</span></div>
                  <div className="tc-detail-row"><span>Status</span><span className="tc-status-pill" style={{ color: getCallStatusColor(selectedCall.status), background: getCallStatusBg(selectedCall.status) }}>{selectedCall.status.replace('_', ' ')}</span></div>
                  <div className="tc-detail-row"><span>Disposition</span><span style={{ color: getDispositionColor(selectedCall.disposition) }}>{getDispositionLabel(selectedCall.disposition)}</span></div>
                  <div className="tc-detail-row"><span>Duration</span><span>{selectedCall.duration}</span></div>
                  <div className="tc-detail-row"><span>Date/Time</span><span>{selectedCall.date} {selectedCall.time}</span></div>
                  <div className="tc-detail-row"><span>Agent</span><span>{selectedCall.agent}</span></div>
                  <div className="tc-detail-row"><span>Lead Status</span><span style={{ color: getLeadStatusColor(selectedCall.leadStatus) }}>{selectedCall.leadStatus.replace('_', ' ')}</span></div>
                  {selectedCall.followUpDate && <div className="tc-detail-row"><span>Follow-up</span><span>{selectedCall.followUpDate}</span></div>}
                  {selectedCall.recording && <div className="tc-detail-row"><span>Recording</span><span className="tc-recording-badge"><HiOutlinePlay /> Available</span></div>}
                </div>
              </div>
              <div className="tc-detail-notes">
                <h3>Notes</h3>
                <p>{selectedCall.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Agent Detail Modal ──────────────────────────────── */}
      {selectedAgent && (
        <div className="tc-modal-overlay" onClick={() => setSelectedAgent(null)}>
          <div className="tc-modal" onClick={e => e.stopPropagation()}>
            <div className="tc-modal-header">
              <h2>Agent Profile — {selectedAgent.name}</h2>
              <button className="tc-modal-close" onClick={() => setSelectedAgent(null)}><HiOutlineX /></button>
            </div>
            <div className="tc-modal-body">
              <div className="tc-agent-detail-header">
                <div className="tc-agent-avatar-xl" style={{ borderColor: getAgentStatusColor(selectedAgent.status) }}>
                  {selectedAgent.avatar}
                  <span className="tc-agent-status-indicator" style={{ background: getAgentStatusColor(selectedAgent.status) }}></span>
                </div>
                <div>
                  <h3>{selectedAgent.name}</h3>
                  <p>{selectedAgent.department} · {selectedAgent.shift}</p>
                </div>
              </div>
              <div className="tc-agent-detail-stats">
                <div className="tc-agent-detail-stat"><span className="tc-agent-detail-val">{selectedAgent.totalCalls.toLocaleString()}</span><span>Total Calls</span></div>
                <div className="tc-agent-detail-stat"><span className="tc-agent-detail-val">{selectedAgent.connectedCalls.toLocaleString()}</span><span>Connected</span></div>
                <div className="tc-agent-detail-stat"><span className="tc-agent-detail-val">{selectedAgent.conversionRate}%</span><span>Conversion</span></div>
                <div className="tc-agent-detail-stat"><span className="tc-agent-detail-val">{selectedAgent.avgDuration}</span><span>Avg Duration</span></div>
                <div className="tc-agent-detail-stat"><span className="tc-agent-detail-val">{selectedAgent.callsToday}</span><span>Calls Today</span></div>
                <div className="tc-agent-detail-stat"><span className="tc-agent-detail-val"><HiOutlineStar /> {selectedAgent.rating}</span><span>Rating</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── New Call Modal ──────────────────────────────────── */}
      {showNewCallModal && (
        <div className="tc-modal-overlay" onClick={() => setShowNewCallModal(false)}>
          <div className="tc-modal tc-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="tc-modal-header">
              <h2>Log New Call</h2>
              <button className="tc-modal-close" onClick={() => setShowNewCallModal(false)}><HiOutlineX /></button>
            </div>
            <div className="tc-modal-body">
              <div className="tc-form-group">
                <label>Caller Name</label>
                <input type="text" className="tc-input" placeholder="Enter caller name" />
              </div>
              <div className="tc-form-group">
                <label>Phone Number</label>
                <input type="text" className="tc-input" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="tc-form-row">
                <div className="tc-form-group">
                  <label>Call Type</label>
                  <select className="tc-select tc-select-full">
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                  </select>
                </div>
                <div className="tc-form-group">
                  <label>Service</label>
                  <select className="tc-select tc-select-full">
                    <option>Caste Certificate</option>
                    <option>Income Certificate</option>
                    <option>PAN Card</option>
                    <option>GST Registration</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="tc-form-group">
                <label>Notes</label>
                <textarea className="tc-textarea" placeholder="Add call notes..." rows={3}></textarea>
              </div>
              <div className="tc-form-actions">
                <button className="tc-btn tc-btn-secondary" onClick={() => setShowNewCallModal(false)}>Cancel</button>
                <button className="tc-btn tc-btn-primary" onClick={() => setShowNewCallModal(false)}><HiOutlinePhone /> Log Call</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ──────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="tc-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="tc-modal tc-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="tc-confirm-icon"><HiOutlineExclamation /></div>
            <h3>Delete Call Record?</h3>
            <p>This action cannot be undone. The call record will be permanently deleted.</p>
            <div className="tc-confirm-actions">
              <button className="tc-btn tc-btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="tc-btn tc-btn-danger" onClick={() => handleDeleteCall(showDeleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telecaller;
