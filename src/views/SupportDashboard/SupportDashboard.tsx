import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  HiOutlineSupport,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineExclamationCircle,
  HiOutlineChat,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineStar,
  HiOutlineRefresh,
  HiOutlineArrowSmRight,
  HiOutlineStatusOnline,
  HiOutlineAnnotation,
  HiOutlineClipboardCheck,
  HiOutlineLightningBolt,
  HiOutlineCalendar,
} from 'react-icons/hi';
import './SupportDashboard.scss';

// ─── Types ────────────────────────────────────────────────

type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed' | 'escalated';
type TicketPriority = 'critical' | 'high' | 'medium' | 'low';
type TicketChannel = 'phone' | 'email' | 'chat' | 'portal' | 'whatsapp';
type TicketCategory = 'technical' | 'billing' | 'service_request' | 'complaint' | 'information' | 'feedback';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  category: TicketCategory;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  responseTime: string;
  resolutionTime?: string;
  tags: string[];
  satisfaction?: number;
  messages: number;
}

interface SupportAgent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  satisfaction: number;
  specialization: string[];
}

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
  lastUpdated: string;
}

interface SatisfactionData {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

// ─── Component ────────────────────────────────────────────

type TabType = 'overview' | 'tickets' | 'agents' | 'knowledge' | 'analytics';

const SupportDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ─── Mock Data ──────────────────────────────────────────

  const [tickets, setTickets] = useLocalStorage<SupportTicket[]>('bm-support-tickets', [
    { id: 'TKT-1001', subject: 'Unable to upload documents for caste certificate', description: 'Customer is getting file size error while uploading supporting documents.', status: 'open', priority: 'high', channel: 'phone', category: 'technical', customerName: 'Ramesh Kumar', customerEmail: 'ramesh.k@email.com', customerPhone: '+91 98765 43210', customerLocation: 'Bengaluru, KA', assignedTo: 'Anita Singh', createdAt: '2026-02-21 09:15', updatedAt: '2026-02-21 09:15', responseTime: 'Pending', tags: ['upload', 'documents', 'certificate'], messages: 1 },
    { id: 'TKT-1002', subject: 'Payment failed but amount deducted', description: 'Payment of Rs. 500 was deducted for income certificate but status shows failed.', status: 'escalated', priority: 'critical', channel: 'email', category: 'billing', customerName: 'Sunita Devi', customerEmail: 'sunita.d@email.com', customerPhone: '+91 87654 32109', customerLocation: 'Pune, MH', assignedTo: 'Deepak Joshi', createdAt: '2026-02-21 08:30', updatedAt: '2026-02-21 10:45', responseTime: '15 min', tags: ['payment', 'refund', 'urgent'], messages: 4 },
    { id: 'TKT-1003', subject: 'Application status not updating after approval', description: 'Domicile certificate application was approved by officer but portal still shows pending.', status: 'in_progress', priority: 'high', channel: 'chat', category: 'technical', customerName: 'Vikram Singh', customerEmail: 'vikram.s@email.com', customerPhone: '+91 76543 21098', customerLocation: 'Jaipur, RJ', assignedTo: 'Anita Singh', createdAt: '2026-02-21 07:00', updatedAt: '2026-02-21 11:30', responseTime: '8 min', tags: ['status', 'sync', 'application'], messages: 6 },
    { id: 'TKT-1004', subject: 'Need help with GST registration process', description: 'First-time user needs guidance on required documents for GST registration.', status: 'waiting', priority: 'medium', channel: 'whatsapp', category: 'information', customerName: 'Meena Agarwal', customerEmail: 'meena.a@email.com', customerPhone: '+91 65432 10987', customerLocation: 'Ahmedabad, GJ', assignedTo: 'Rahul Mehta', createdAt: '2026-02-20 16:00', updatedAt: '2026-02-21 09:00', responseTime: '22 min', tags: ['gst', 'registration', 'guidance'], messages: 3 },
    { id: 'TKT-1005', subject: 'Certificate has wrong name spelling', description: 'Issued caste certificate has name spelled incorrectly. Needs correction.', status: 'in_progress', priority: 'high', channel: 'portal', category: 'complaint', customerName: 'Arjun Reddy', customerEmail: 'arjun.r@email.com', customerPhone: '+91 54321 09876', customerLocation: 'Hyderabad, TS', assignedTo: 'Priya Verma', createdAt: '2026-02-20 14:30', updatedAt: '2026-02-21 10:00', responseTime: '12 min', tags: ['correction', 'certificate', 'name'], messages: 5 },
    { id: 'TKT-1006', subject: 'Portal extremely slow during peak hours', description: 'Multiple users reporting very slow portal response between 10 AM and 2 PM.', status: 'escalated', priority: 'critical', channel: 'email', category: 'technical', customerName: 'IT Department', customerEmail: 'it@bharatmithra.gov.in', customerPhone: '+91 11234 56789', customerLocation: 'Internal', assignedTo: 'Deepak Joshi', createdAt: '2026-02-20 12:00', updatedAt: '2026-02-21 08:00', responseTime: '5 min', tags: ['performance', 'server', 'critical'], messages: 8 },
    { id: 'TKT-1007', subject: 'Requesting bulk application processing feature', description: 'District office needs ability to process multiple certificates at once.', status: 'open', priority: 'medium', channel: 'email', category: 'service_request', customerName: 'District Collector Office', customerEmail: 'dc.pune@gov.in', customerPhone: '+91 20123 45678', customerLocation: 'Pune, MH', assignedTo: 'Unassigned', createdAt: '2026-02-20 11:00', updatedAt: '2026-02-20 11:00', responseTime: 'Pending', tags: ['feature', 'bulk', 'processing'], messages: 1 },
    { id: 'TKT-1008', subject: 'Excellent service - want to give feedback', description: 'Very happy with the quick turnaround on income certificate. Completed in just 1 day.', status: 'resolved', priority: 'low', channel: 'portal', category: 'feedback', customerName: 'Kavitha Nair', customerEmail: 'kavitha.n@email.com', customerPhone: '+91 43210 98765', customerLocation: 'Chennai, TN', assignedTo: 'Rahul Mehta', createdAt: '2026-02-19 15:00', updatedAt: '2026-02-20 10:00', responseTime: '30 min', resolutionTime: '19h', tags: ['feedback', 'positive', 'certificate'], satisfaction: 5, messages: 2 },
    { id: 'TKT-1009', subject: 'OTP not received for login', description: 'User has been trying to login for 2 hours but OTP is not coming to registered mobile.', status: 'resolved', priority: 'high', channel: 'phone', category: 'technical', customerName: 'Deepak Sharma', customerEmail: 'deepak.s@email.com', customerPhone: '+91 32109 87654', customerLocation: 'Delhi, DL', assignedTo: 'Anita Singh', createdAt: '2026-02-19 11:00', updatedAt: '2026-02-19 14:00', responseTime: '3 min', resolutionTime: '3h', tags: ['otp', 'login', 'sms'], satisfaction: 4, messages: 4 },
    { id: 'TKT-1010', subject: 'Refund pending for 15 days', description: 'Payment refund for rejected application has been pending for 15 days. Reference: PAY-78945.', status: 'in_progress', priority: 'high', channel: 'phone', category: 'billing', customerName: 'Anjali Mishra', customerEmail: 'anjali.m@email.com', customerPhone: '+91 21098 76543', customerLocation: 'Lucknow, UP', assignedTo: 'Priya Verma', createdAt: '2026-02-18 09:00', updatedAt: '2026-02-21 11:00', responseTime: '10 min', tags: ['refund', 'payment', 'pending'], messages: 7 },
    { id: 'TKT-1011', subject: 'How to check application tracking', description: 'New user wants to know how to track the status of submitted application online.', status: 'closed', priority: 'low', channel: 'chat', category: 'information', customerName: 'Santosh Patil', customerEmail: 'santosh.p@email.com', customerPhone: '+91 10987 65432', customerLocation: 'Mumbai, MH', assignedTo: 'Rahul Mehta', createdAt: '2026-02-18 14:00', updatedAt: '2026-02-18 14:30', responseTime: '5 min', resolutionTime: '30 min', tags: ['tracking', 'how-to'], satisfaction: 5, messages: 3 },
    { id: 'TKT-1012', subject: 'Wrong district showing in application form', description: 'Dropdown for district selection is showing incorrect district under Karnataka state.', status: 'resolved', priority: 'medium', channel: 'portal', category: 'technical', customerName: 'Ganesh Rao', customerEmail: 'ganesh.r@email.com', customerPhone: '+91 98123 45678', customerLocation: 'Bengaluru, KA', assignedTo: 'Deepak Joshi', createdAt: '2026-02-17 10:00', updatedAt: '2026-02-19 16:00', responseTime: '15 min', resolutionTime: '2d 6h', tags: ['dropdown', 'district', 'form'], satisfaction: 3, messages: 5 },
  ]);

  const [supportAgents] = useLocalStorage<SupportAgent[]>('bm-support-agents', [
    { id: 'SA001', name: 'Anita Singh', avatar: 'AS', role: 'Senior Support Engineer', status: 'online', openTickets: 3, resolvedToday: 5, avgResponseTime: '8 min', avgResolutionTime: '4h', satisfaction: 4.7, specialization: ['Technical', 'Portal Issues'] },
    { id: 'SA002', name: 'Deepak Joshi', avatar: 'DJ', role: 'Technical Lead', status: 'busy', openTickets: 2, resolvedToday: 3, avgResponseTime: '5 min', avgResolutionTime: '6h', satisfaction: 4.8, specialization: ['Infrastructure', 'Performance'] },
    { id: 'SA003', name: 'Priya Verma', avatar: 'PV', role: 'Support Specialist', status: 'online', openTickets: 2, resolvedToday: 4, avgResponseTime: '12 min', avgResolutionTime: '5h', satisfaction: 4.5, specialization: ['Billing', 'Complaints'] },
    { id: 'SA004', name: 'Rahul Mehta', avatar: 'RM', role: 'Support Agent', status: 'online', openTickets: 2, resolvedToday: 6, avgResponseTime: '15 min', avgResolutionTime: '2h', satisfaction: 4.6, specialization: ['General', 'Information'] },
    { id: 'SA005', name: 'Kavya Desai', avatar: 'KD', role: 'Support Agent', status: 'away', openTickets: 1, resolvedToday: 2, avgResponseTime: '20 min', avgResolutionTime: '3h', satisfaction: 4.4, specialization: ['Service Requests', 'Feedback'] },
    { id: 'SA006', name: 'Arun Kumar', avatar: 'AK', role: 'Junior Agent', status: 'offline', openTickets: 0, resolvedToday: 0, avgResponseTime: '25 min', avgResolutionTime: '8h', satisfaction: 4.2, specialization: ['General'] },
  ]);

  const knowledgeArticles: KnowledgeArticle[] = [
    { id: 'KB001', title: 'How to Apply for Caste Certificate', category: 'Certificates', views: 12456, helpful: 11234, lastUpdated: '2026-02-15' },
    { id: 'KB002', title: 'Payment Troubleshooting Guide', category: 'Billing', views: 8976, helpful: 7654, lastUpdated: '2026-02-10' },
    { id: 'KB003', title: 'Document Upload Size & Format Requirements', category: 'Technical', views: 7654, helpful: 6543, lastUpdated: '2026-02-18' },
    { id: 'KB004', title: 'GST Registration Step-by-Step', category: 'Services', views: 6543, helpful: 5432, lastUpdated: '2026-02-12' },
    { id: 'KB005', title: 'How to Track Application Status', category: 'General', views: 15234, helpful: 14123, lastUpdated: '2026-02-20' },
    { id: 'KB006', title: 'OTP & Login Issues - FAQ', category: 'Technical', views: 9876, helpful: 8765, lastUpdated: '2026-02-19' },
    { id: 'KB007', title: 'Refund Policy & Process', category: 'Billing', views: 5432, helpful: 4321, lastUpdated: '2026-02-08' },
    { id: 'KB008', title: 'Certificate Correction Process', category: 'Certificates', views: 4321, helpful: 3210, lastUpdated: '2026-02-14' },
  ];

  // ─── Computed Stats ─────────────────────────────────────

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const escalatedTickets = tickets.filter(t => t.status === 'escalated').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const waitingTickets = tickets.filter(t => t.status === 'waiting').length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical').length;
  const avgSatisfaction = tickets.filter(t => t.satisfaction).reduce((sum, t) => sum + (t.satisfaction || 0), 0) / (tickets.filter(t => t.satisfaction).length || 1);
  const onlineAgentCount = supportAgents.filter(a => a.status === 'online' || a.status === 'busy').length;

  const satisfactionData: SatisfactionData[] = [
    { label: 'Excellent (5)', count: tickets.filter(t => t.satisfaction === 5).length, percentage: 0, color: '#22c55e' },
    { label: 'Good (4)', count: tickets.filter(t => t.satisfaction === 4).length, percentage: 0, color: '#3b82f6' },
    { label: 'Average (3)', count: tickets.filter(t => t.satisfaction === 3).length, percentage: 0, color: '#f59e0b' },
    { label: 'Poor (2)', count: tickets.filter(t => t.satisfaction === 2).length, percentage: 0, color: '#f97316' },
    { label: 'Bad (1)', count: tickets.filter(t => t.satisfaction === 1).length, percentage: 0, color: '#ef4444' },
  ];
  const totalRated = satisfactionData.reduce((s, d) => s + d.count, 0);
  satisfactionData.forEach(d => { d.percentage = totalRated > 0 ? (d.count / totalRated) * 100 : 0; });

  const channelBreakdown = (['phone', 'email', 'chat', 'portal', 'whatsapp'] as TicketChannel[]).map(ch => ({
    channel: ch,
    count: tickets.filter(t => t.channel === ch).length,
  }));

  const categoryBreakdown = (['technical', 'billing', 'service_request', 'complaint', 'information', 'feedback'] as TicketCategory[]).map(cat => ({
    category: cat,
    count: tickets.filter(t => t.category === cat).length,
  }));

  // ─── Helpers ────────────────────────────────────────────

  const getStatusColor = (s: TicketStatus) => {
    const map: Record<TicketStatus, string> = {
      open: '#3b82f6', in_progress: '#f59e0b', waiting: '#8b5cf6',
      resolved: '#22c55e', closed: '#94a3b8', escalated: '#ef4444',
    };
    return map[s];
  };

  const getPriorityColor = (p: TicketPriority) => {
    const map: Record<TicketPriority, string> = {
      critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e',
    };
    return map[p];
  };

  const getChannelIcon = (ch: TicketChannel) => {
    const map: Record<TicketChannel, React.ReactNode> = {
      phone: <HiOutlinePhone />, email: <HiOutlineMail />, chat: <HiOutlineChat />,
      portal: <HiOutlineSupport />, whatsapp: <HiOutlineAnnotation />,
    };
    return map[ch];
  };

  const getChannelColor = (ch: TicketChannel) => {
    const map: Record<TicketChannel, string> = {
      phone: '#3b82f6', email: '#f59e0b', chat: '#22c55e', portal: '#8b5cf6', whatsapp: '#10b981',
    };
    return map[ch];
  };

  const getCategoryLabel = (c: TicketCategory) => {
    const map: Record<TicketCategory, string> = {
      technical: 'Technical', billing: 'Billing', service_request: 'Service Request',
      complaint: 'Complaint', information: 'Information', feedback: 'Feedback',
    };
    return map[c];
  };

  const getCategoryColor = (c: TicketCategory) => {
    const map: Record<TicketCategory, string> = {
      technical: '#3b82f6', billing: '#f59e0b', service_request: '#8b5cf6',
      complaint: '#ef4444', information: '#06b6d4', feedback: '#22c55e',
    };
    return map[c];
  };

  const getAgentStatusColor = (s: string) => {
    const map: Record<string, string> = {
      online: '#22c55e', busy: '#f59e0b', away: '#8b5cf6', offline: '#94a3b8',
    };
    return map[s] || '#94a3b8';
  };

  // ─── Filters ────────────────────────────────────────────

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = searchQuery === '' ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
      const matchesChannel = filterChannel === 'all' || ticket.channel === filterChannel;
      return matchesSearch && matchesStatus && matchesPriority && matchesChannel;
    });
  }, [tickets, searchQuery, filterStatus, filterPriority, filterChannel]);

  const handleDeleteTicket = useCallback((id: string) => {
    setTickets(tickets.filter(t => t.id !== id));
    setShowDeleteConfirm(null);
  }, [tickets, setTickets]);

  // ─── Tabs ───────────────────────────────────────────────

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <HiOutlineChartBar /> },
    { key: 'tickets', label: 'Tickets', icon: <HiOutlineClipboardCheck /> },
    { key: 'agents', label: 'Agents', icon: <HiOutlineUsers /> },
    { key: 'knowledge', label: 'Knowledge Base', icon: <HiOutlineDocumentText /> },
    { key: 'analytics', label: 'Analytics', icon: <HiOutlineTrendingUp /> },
  ];

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="sp-container">
      {/* Header */}
      <header className="sp-header">
        <div className="sp-header-left">
          <h1 className="sp-title">Support Dashboard</h1>
          <p className="sp-subtitle">Manage tickets, agents & knowledge base</p>
        </div>
        <div className="sp-header-right">
          <div className="sp-live-badge">
            <HiOutlineStatusOnline />
            <span>{onlineAgentCount} Agents Online</span>
          </div>
          <button className="sp-btn sp-btn-secondary" onClick={() => setShowNewTicketModal(true)}>
            <HiOutlinePlus /> New Ticket
          </button>
          <button className="sp-btn sp-btn-primary">
            <HiOutlineDownload /> Export
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="sp-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`sp-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="sp-overview">
          {/* Stats Cards */}
          <div className="sp-stats-grid">
            <div className="sp-stat-card sp-stat-card--open">
              <div className="sp-stat-icon"><HiOutlineExclamationCircle /></div>
              <div className="sp-stat-content">
                <span className="sp-stat-value">{openTickets}</span>
                <span className="sp-stat-label">Open Tickets</span>
              </div>
            </div>
            <div className="sp-stat-card sp-stat-card--progress">
              <div className="sp-stat-icon"><HiOutlineRefresh /></div>
              <div className="sp-stat-content">
                <span className="sp-stat-value">{inProgressTickets}</span>
                <span className="sp-stat-label">In Progress</span>
              </div>
            </div>
            <div className="sp-stat-card sp-stat-card--escalated">
              <div className="sp-stat-icon"><HiOutlineExclamation /></div>
              <div className="sp-stat-content">
                <span className="sp-stat-value">{escalatedTickets}</span>
                <span className="sp-stat-label">Escalated</span>
              </div>
            </div>
            <div className="sp-stat-card sp-stat-card--waiting">
              <div className="sp-stat-icon"><HiOutlineClock /></div>
              <div className="sp-stat-content">
                <span className="sp-stat-value">{waitingTickets}</span>
                <span className="sp-stat-label">Awaiting Response</span>
              </div>
            </div>
            <div className="sp-stat-card sp-stat-card--resolved">
              <div className="sp-stat-icon"><HiOutlineCheck /></div>
              <div className="sp-stat-content">
                <span className="sp-stat-value">{resolvedTickets}</span>
                <span className="sp-stat-label">Resolved/Closed</span>
              </div>
            </div>
            <div className="sp-stat-card sp-stat-card--satisfaction">
              <div className="sp-stat-icon"><HiOutlineStar /></div>
              <div className="sp-stat-content">
                <span className="sp-stat-value">{avgSatisfaction.toFixed(1)}</span>
                <span className="sp-stat-label">Avg Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          {criticalTickets > 0 && (
            <div className="sp-alert-banner">
              <HiOutlineExclamation />
              <span><strong>{criticalTickets} critical ticket{criticalTickets > 1 ? 's' : ''}</strong> require immediate attention!</span>
              <button className="sp-alert-btn" onClick={() => { setActiveTab('tickets'); setFilterPriority('critical'); }}>View Now</button>
            </div>
          )}

          {/* Row: Channel Breakdown + Priority Distribution */}
          <div className="sp-overview-row">
            <section className="sp-card">
              <div className="sp-card-header">
                <h2>Channel Distribution</h2>
              </div>
              <div className="sp-channel-grid">
                {channelBreakdown.map(item => (
                  <div key={item.channel} className="sp-channel-card" style={{ borderLeftColor: getChannelColor(item.channel) }}>
                    <div className="sp-channel-icon" style={{ color: getChannelColor(item.channel), background: `${getChannelColor(item.channel)}15` }}>
                      {getChannelIcon(item.channel)}
                    </div>
                    <div className="sp-channel-info">
                      <span className="sp-channel-name">{item.channel}</span>
                      <span className="sp-channel-count">{item.count} tickets</span>
                    </div>
                    <div className="sp-channel-bar">
                      <div className="sp-channel-bar-fill" style={{ width: `${(item.count / tickets.length) * 100}%`, background: getChannelColor(item.channel) }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="sp-card">
              <div className="sp-card-header">
                <h2>Category Breakdown</h2>
              </div>
              <div className="sp-category-grid">
                {categoryBreakdown.map(item => (
                  <div key={item.category} className="sp-category-item">
                    <div className="sp-category-dot" style={{ background: getCategoryColor(item.category as TicketCategory) }}></div>
                    <span className="sp-category-label">{getCategoryLabel(item.category as TicketCategory)}</span>
                    <span className="sp-category-count">{item.count}</span>
                    <div className="sp-category-bar">
                      <div className="sp-category-bar-fill" style={{ width: `${(item.count / tickets.length) * 100}%`, background: getCategoryColor(item.category as TicketCategory) }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Row: Recent Tickets + Agent Workload */}
          <div className="sp-overview-row">
            <section className="sp-card">
              <div className="sp-card-header">
                <h2>Recent Tickets</h2>
                <button className="sp-link-btn" onClick={() => setActiveTab('tickets')}>View all <HiOutlineArrowSmRight /></button>
              </div>
              <div className="sp-recent-tickets">
                {tickets.slice(0, 5).map(ticket => (
                  <div key={ticket.id} className="sp-recent-ticket" onClick={() => setSelectedTicket(ticket)}>
                    <div className="sp-recent-ticket-priority" style={{ background: getPriorityColor(ticket.priority) }}></div>
                    <div className="sp-recent-ticket-info">
                      <div className="sp-recent-ticket-top">
                        <span className="sp-recent-ticket-id">{ticket.id}</span>
                        <span className="sp-recent-ticket-status" style={{ color: getStatusColor(ticket.status), background: `${getStatusColor(ticket.status)}15` }}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="sp-recent-ticket-subject">{ticket.subject}</span>
                      <span className="sp-recent-ticket-meta">
                        <span>{ticket.customerName}</span>
                        <span className="sp-recent-ticket-channel" style={{ color: getChannelColor(ticket.channel) }}>
                          {getChannelIcon(ticket.channel)} {ticket.channel}
                        </span>
                        <span>{ticket.createdAt}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="sp-card">
              <div className="sp-card-header">
                <h2>Agent Workload</h2>
                <button className="sp-link-btn" onClick={() => setActiveTab('agents')}>View all <HiOutlineArrowSmRight /></button>
              </div>
              <div className="sp-agent-workload">
                {supportAgents.filter(a => a.status !== 'offline').map(agent => (
                  <div key={agent.id} className="sp-agent-workload-item">
                    <div className="sp-agent-workload-left">
                      <div className="sp-agent-avatar-sm" style={{ borderColor: getAgentStatusColor(agent.status) }}>
                        {agent.avatar}
                      </div>
                      <div className="sp-agent-workload-info">
                        <span className="sp-agent-workload-name">{agent.name}</span>
                        <span className="sp-agent-workload-role">{agent.role}</span>
                      </div>
                    </div>
                    <div className="sp-agent-workload-right">
                      <div className="sp-agent-workload-stat">
                        <span className="sp-agent-workload-val">{agent.openTickets}</span>
                        <span>Open</span>
                      </div>
                      <div className="sp-agent-workload-stat">
                        <span className="sp-agent-workload-val" style={{ color: '#22c55e' }}>{agent.resolvedToday}</span>
                        <span>Resolved</span>
                      </div>
                      <div className="sp-agent-workload-stat">
                        <span className="sp-agent-workload-val"><HiOutlineStar style={{ color: '#f59e0b' }} /> {agent.satisfaction}</span>
                        <span>Rating</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Satisfaction */}
          <section className="sp-card">
            <div className="sp-card-header">
              <h2>Customer Satisfaction</h2>
              <span className="sp-satisfaction-avg"><HiOutlineStar /> {avgSatisfaction.toFixed(1)} / 5.0</span>
            </div>
            <div className="sp-satisfaction-bars">
              {satisfactionData.map(item => (
                <div key={item.label} className="sp-satisfaction-row">
                  <span className="sp-satisfaction-label">{item.label}</span>
                  <div className="sp-satisfaction-bar">
                    <div className="sp-satisfaction-fill" style={{ width: `${item.percentage}%`, background: item.color }}></div>
                  </div>
                  <span className="sp-satisfaction-count">{item.count} ({item.percentage.toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ─── Tickets Tab ─────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <div className="sp-tickets">
          <div className="sp-toolbar">
            <div className="sp-search-box">
              <HiOutlineSearch />
              <input
                type="text"
                placeholder="Search tickets by ID, subject, customer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button className="sp-search-clear" onClick={() => setSearchQuery('')}><HiOutlineX /></button>}
            </div>
            <div className="sp-filters">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="sp-select">
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="sp-select">
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} className="sp-select">
                <option value="all">All Channels</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="chat">Chat</option>
                <option value="portal">Portal</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="sp-table-wrapper">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Response</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className={ticket.priority === 'critical' ? 'sp-row-critical' : ''}>
                    <td className="sp-ticket-id">{ticket.id}</td>
                    <td>
                      <div className="sp-ticket-subject">
                        <span>{ticket.subject}</span>
                        <div className="sp-ticket-tags">
                          {ticket.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="sp-tag">{tag}</span>
                          ))}
                          {ticket.tags.length > 2 && <span className="sp-tag sp-tag-more">+{ticket.tags.length - 2}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{ticket.customerName}</td>
                    <td>
                      <span className="sp-priority-badge" style={{ color: getPriorityColor(ticket.priority), background: `${getPriorityColor(ticket.priority)}15` }}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className="sp-channel-badge" style={{ color: getChannelColor(ticket.channel) }}>
                        {getChannelIcon(ticket.channel)} {ticket.channel}
                      </span>
                    </td>
                    <td>
                      <span className="sp-status-pill" style={{ color: getStatusColor(ticket.status), background: `${getStatusColor(ticket.status)}15` }}>
                        {ticket.status === 'escalated' && <span className="sp-pulse-dot"></span>}
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{ticket.assignedTo}</td>
                    <td className="sp-response-time">{ticket.responseTime}</td>
                    <td className="sp-created-at">{ticket.createdAt}</td>
                    <td className="sp-actions">
                      <button className="sp-icon-btn" title="View" onClick={() => setSelectedTicket(ticket)}><HiOutlineEye /></button>
                      <button className="sp-icon-btn sp-icon-btn--danger" title="Delete" onClick={() => setShowDeleteConfirm(ticket.id)}><HiOutlineTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTickets.length === 0 && (
            <div className="sp-empty">
              <HiOutlineSupport />
              <p>No tickets found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Agents Tab ──────────────────────────────────────── */}
      {activeTab === 'agents' && (
        <div className="sp-agents">
          <div className="sp-agents-overview">
            <div className="sp-agents-stat"><span className="sp-agents-stat-val">{supportAgents.length}</span><span>Total</span></div>
            <div className="sp-agents-stat"><span className="sp-agents-stat-val" style={{ color: '#22c55e' }}>{supportAgents.filter(a => a.status === 'online').length}</span><span>Online</span></div>
            <div className="sp-agents-stat"><span className="sp-agents-stat-val" style={{ color: '#f59e0b' }}>{supportAgents.filter(a => a.status === 'busy').length}</span><span>Busy</span></div>
            <div className="sp-agents-stat"><span className="sp-agents-stat-val" style={{ color: '#8b5cf6' }}>{supportAgents.filter(a => a.status === 'away').length}</span><span>Away</span></div>
            <div className="sp-agents-stat"><span className="sp-agents-stat-val" style={{ color: '#94a3b8' }}>{supportAgents.filter(a => a.status === 'offline').length}</span><span>Offline</span></div>
          </div>

          <div className="sp-agents-grid">
            {supportAgents.map(agent => (
              <div key={agent.id} className="sp-agent-card">
                <div className="sp-agent-card-header">
                  <div className="sp-agent-avatar-lg" style={{ borderColor: getAgentStatusColor(agent.status) }}>
                    {agent.avatar}
                    <span className="sp-agent-status-dot" style={{ background: getAgentStatusColor(agent.status) }}></span>
                  </div>
                  <div className="sp-agent-card-info">
                    <span className="sp-agent-card-name">{agent.name}</span>
                    <span className="sp-agent-card-role">{agent.role}</span>
                  </div>
                  <div className="sp-agent-rating">
                    <HiOutlineStar style={{ color: '#f59e0b' }} />
                    <span>{agent.satisfaction}</span>
                  </div>
                </div>
                <div className="sp-agent-specializations">
                  {agent.specialization.map(spec => (
                    <span key={spec} className="sp-agent-spec-tag">{spec}</span>
                  ))}
                </div>
                <div className="sp-agent-card-stats">
                  <div className="sp-agent-card-stat">
                    <span className="sp-agent-card-stat-val">{agent.openTickets}</span>
                    <span>Open</span>
                  </div>
                  <div className="sp-agent-card-stat">
                    <span className="sp-agent-card-stat-val" style={{ color: '#22c55e' }}>{agent.resolvedToday}</span>
                    <span>Resolved Today</span>
                  </div>
                  <div className="sp-agent-card-stat">
                    <span className="sp-agent-card-stat-val">{agent.avgResponseTime}</span>
                    <span>Avg Response</span>
                  </div>
                  <div className="sp-agent-card-stat">
                    <span className="sp-agent-card-stat-val">{agent.avgResolutionTime}</span>
                    <span>Avg Resolution</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Knowledge Base Tab ──────────────────────────────── */}
      {activeTab === 'knowledge' && (
        <div className="sp-knowledge">
          <div className="sp-knowledge-header">
            <div className="sp-knowledge-stats">
              <div className="sp-knowledge-stat">
                <span className="sp-knowledge-stat-val">{knowledgeArticles.length}</span>
                <span>Total Articles</span>
              </div>
              <div className="sp-knowledge-stat">
                <span className="sp-knowledge-stat-val">{knowledgeArticles.reduce((s, a) => s + a.views, 0).toLocaleString()}</span>
                <span>Total Views</span>
              </div>
              <div className="sp-knowledge-stat">
                <span className="sp-knowledge-stat-val">{((knowledgeArticles.reduce((s, a) => s + a.helpful, 0) / knowledgeArticles.reduce((s, a) => s + a.views, 0)) * 100).toFixed(1)}%</span>
                <span>Helpful Rate</span>
              </div>
            </div>
          </div>
          <div className="sp-knowledge-grid">
            {knowledgeArticles.map(article => (
              <div key={article.id} className="sp-knowledge-card">
                <div className="sp-knowledge-card-header">
                  <HiOutlineDocumentText />
                  <span className="sp-knowledge-category">{article.category}</span>
                </div>
                <h3 className="sp-knowledge-title">{article.title}</h3>
                <div className="sp-knowledge-meta">
                  <span><HiOutlineEye /> {article.views.toLocaleString()} views</span>
                  <span><HiOutlineCheck /> {((article.helpful / article.views) * 100).toFixed(0)}% helpful</span>
                  <span><HiOutlineCalendar /> {article.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Analytics Tab ───────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="sp-analytics">
          <div className="sp-analytics-kpis">
            <div className="sp-kpi-card">
              <div className="sp-kpi-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}><HiOutlineClock /></div>
              <div className="sp-kpi-content">
                <span className="sp-kpi-value">12 min</span>
                <span className="sp-kpi-label">Avg First Response</span>
              </div>
              <div className="sp-kpi-trend positive"><HiOutlineTrendingUp /> -18%</div>
            </div>
            <div className="sp-kpi-card">
              <div className="sp-kpi-icon" style={{ background: '#22c55e15', color: '#22c55e' }}><HiOutlineCheck /></div>
              <div className="sp-kpi-content">
                <span className="sp-kpi-value">4.5h</span>
                <span className="sp-kpi-label">Avg Resolution Time</span>
              </div>
              <div className="sp-kpi-trend positive"><HiOutlineTrendingUp /> -12%</div>
            </div>
            <div className="sp-kpi-card">
              <div className="sp-kpi-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}><HiOutlineLightningBolt /></div>
              <div className="sp-kpi-content">
                <span className="sp-kpi-value">87%</span>
                <span className="sp-kpi-label">First Contact Resolution</span>
              </div>
              <div className="sp-kpi-trend positive"><HiOutlineTrendingUp /> +5%</div>
            </div>
            <div className="sp-kpi-card">
              <div className="sp-kpi-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}><HiOutlineStar /></div>
              <div className="sp-kpi-content">
                <span className="sp-kpi-value">{avgSatisfaction.toFixed(1)}/5</span>
                <span className="sp-kpi-label">CSAT Score</span>
              </div>
              <div className="sp-kpi-trend positive"><HiOutlineTrendingUp /> +3%</div>
            </div>
          </div>

          <div className="sp-overview-row">
            <section className="sp-card">
              <div className="sp-card-header">
                <h2>Tickets by Status</h2>
              </div>
              <div className="sp-status-breakdown">
                {(['open', 'in_progress', 'waiting', 'escalated', 'resolved', 'closed'] as TicketStatus[]).map(status => {
                  const count = tickets.filter(t => t.status === status).length;
                  const pct = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
                  return (
                    <div key={status} className="sp-status-row">
                      <div className="sp-status-dot" style={{ background: getStatusColor(status) }}></div>
                      <span className="sp-status-name">{status.replace('_', ' ')}</span>
                      <div className="sp-status-bar">
                        <div className="sp-status-bar-fill" style={{ width: `${pct}%`, background: getStatusColor(status) }}></div>
                      </div>
                      <span className="sp-status-count">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="sp-card">
              <div className="sp-card-header">
                <h2>Tickets by Priority</h2>
              </div>
              <div className="sp-priority-breakdown">
                {(['critical', 'high', 'medium', 'low'] as TicketPriority[]).map(priority => {
                  const count = tickets.filter(t => t.priority === priority).length;
                  const pct = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
                  return (
                    <div key={priority} className="sp-priority-row">
                      <div className="sp-priority-dot" style={{ background: getPriorityColor(priority) }}></div>
                      <span className="sp-priority-name">{priority}</span>
                      <div className="sp-priority-bar">
                        <div className="sp-priority-bar-fill" style={{ width: `${pct}%`, background: getPriorityColor(priority) }}></div>
                      </div>
                      <span className="sp-priority-count">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Agent Performance Table */}
          <section className="sp-card">
            <div className="sp-card-header">
              <h2>Agent Performance Rankings</h2>
            </div>
            <div className="sp-table-wrapper">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Agent</th>
                    <th>Open</th>
                    <th>Resolved Today</th>
                    <th>Avg Response</th>
                    <th>Avg Resolution</th>
                    <th>Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {[...supportAgents].sort((a, b) => b.satisfaction - a.satisfaction).map((agent, idx) => (
                    <tr key={agent.id}>
                      <td><span className="sp-rank-badge">#{idx + 1}</span></td>
                      <td>
                        <div className="sp-agent-cell">
                          <div className="sp-agent-avatar-xs" style={{ borderColor: getAgentStatusColor(agent.status) }}>{agent.avatar}</div>
                          <span>{agent.name}</span>
                        </div>
                      </td>
                      <td>{agent.openTickets}</td>
                      <td style={{ color: '#22c55e' }}>{agent.resolvedToday}</td>
                      <td>{agent.avgResponseTime}</td>
                      <td>{agent.avgResolutionTime}</td>
                      <td><span className="sp-sat-badge"><HiOutlineStar /> {agent.satisfaction}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ─── Ticket Detail Modal ─────────────────────────────── */}
      {selectedTicket && (
        <div className="sp-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h2>{selectedTicket.id} — Ticket Details</h2>
              <button className="sp-modal-close" onClick={() => setSelectedTicket(null)}><HiOutlineX /></button>
            </div>
            <div className="sp-modal-body">
              <div className="sp-ticket-detail-top">
                <h3>{selectedTicket.subject}</h3>
                <div className="sp-ticket-detail-badges">
                  <span className="sp-priority-badge" style={{ color: getPriorityColor(selectedTicket.priority), background: `${getPriorityColor(selectedTicket.priority)}15` }}>{selectedTicket.priority}</span>
                  <span className="sp-status-pill" style={{ color: getStatusColor(selectedTicket.status), background: `${getStatusColor(selectedTicket.status)}15` }}>{selectedTicket.status.replace('_', ' ')}</span>
                  <span className="sp-channel-badge" style={{ color: getChannelColor(selectedTicket.channel) }}>{getChannelIcon(selectedTicket.channel)} {selectedTicket.channel}</span>
                  <span className="sp-category-badge" style={{ color: getCategoryColor(selectedTicket.category) }}>{getCategoryLabel(selectedTicket.category)}</span>
                </div>
              </div>
              <div className="sp-ticket-detail-grid">
                <div className="sp-detail-section">
                  <h4>Customer Information</h4>
                  <div className="sp-detail-row"><span>Name</span><span>{selectedTicket.customerName}</span></div>
                  <div className="sp-detail-row"><span>Email</span><span>{selectedTicket.customerEmail}</span></div>
                  <div className="sp-detail-row"><span>Phone</span><span>{selectedTicket.customerPhone}</span></div>
                  <div className="sp-detail-row"><span>Location</span><span>{selectedTicket.customerLocation}</span></div>
                </div>
                <div className="sp-detail-section">
                  <h4>Ticket Information</h4>
                  <div className="sp-detail-row"><span>Assigned To</span><span>{selectedTicket.assignedTo}</span></div>
                  <div className="sp-detail-row"><span>Created</span><span>{selectedTicket.createdAt}</span></div>
                  <div className="sp-detail-row"><span>Updated</span><span>{selectedTicket.updatedAt}</span></div>
                  <div className="sp-detail-row"><span>Response Time</span><span>{selectedTicket.responseTime}</span></div>
                  {selectedTicket.resolutionTime && <div className="sp-detail-row"><span>Resolution Time</span><span>{selectedTicket.resolutionTime}</span></div>}
                  <div className="sp-detail-row"><span>Messages</span><span>{selectedTicket.messages}</span></div>
                  {selectedTicket.satisfaction && <div className="sp-detail-row"><span>Satisfaction</span><span><HiOutlineStar style={{ color: '#f59e0b' }} /> {selectedTicket.satisfaction}/5</span></div>}
                </div>
              </div>
              <div className="sp-ticket-detail-desc">
                <h4>Description</h4>
                <p>{selectedTicket.description}</p>
              </div>
              <div className="sp-ticket-detail-tags">
                <h4>Tags</h4>
                <div className="sp-tags-row">
                  {selectedTicket.tags.map(tag => (
                    <span key={tag} className="sp-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── New Ticket Modal ────────────────────────────────── */}
      {showNewTicketModal && (
        <div className="sp-modal-overlay" onClick={() => setShowNewTicketModal(false)}>
          <div className="sp-modal sp-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h2>Create New Ticket</h2>
              <button className="sp-modal-close" onClick={() => setShowNewTicketModal(false)}><HiOutlineX /></button>
            </div>
            <div className="sp-modal-body">
              <div className="sp-form-group">
                <label>Subject</label>
                <input type="text" className="sp-input" placeholder="Ticket subject" />
              </div>
              <div className="sp-form-group">
                <label>Customer Name</label>
                <input type="text" className="sp-input" placeholder="Customer name" />
              </div>
              <div className="sp-form-row">
                <div className="sp-form-group">
                  <label>Priority</label>
                  <select className="sp-select sp-select-full">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="sp-form-group">
                  <label>Channel</label>
                  <select className="sp-select sp-select-full">
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="chat">Chat</option>
                    <option value="portal">Portal</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>
              <div className="sp-form-group">
                <label>Category</label>
                <select className="sp-select sp-select-full">
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="complaint">Complaint</option>
                  <option value="service_request">Service Request</option>
                  <option value="information">Information</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              <div className="sp-form-group">
                <label>Description</label>
                <textarea className="sp-textarea" placeholder="Describe the issue..." rows={3}></textarea>
              </div>
              <div className="sp-form-actions">
                <button className="sp-btn sp-btn-secondary" onClick={() => setShowNewTicketModal(false)}>Cancel</button>
                <button className="sp-btn sp-btn-primary" onClick={() => setShowNewTicketModal(false)}><HiOutlinePlus /> Create Ticket</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ──────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="sp-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="sp-modal sp-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="sp-confirm-icon"><HiOutlineExclamation /></div>
            <h3>Delete Ticket?</h3>
            <p>This action cannot be undone. The ticket and all its data will be permanently deleted.</p>
            <div className="sp-confirm-actions">
              <button className="sp-btn sp-btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="sp-btn sp-btn-danger" onClick={() => handleDeleteTicket(showDeleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;
