import { useState, useEffect, useMemo } from 'react';
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
  HiOutlineStar,
  HiOutlineFolder,
  HiOutlineExclamationCircle,
  HiOutlineBell,
  HiOutlineOfficeBuilding,
  HiOutlineEye,
  HiOutlineMap,
  HiOutlineSpeakerphone,
  HiOutlineUserGroup,
  HiOutlineBadgeCheck,
  HiOutlineChartPie,
  HiOutlineViewGrid,
  HiOutlineFingerPrint,
  HiOutlineDatabase,
  HiOutlineServer,
  HiOutlineWifi,
  HiOutlinePaperAirplane,
} from 'react-icons/hi';
import InfinityLogo from '../../components/common/InfinityLogo/InfinityLogo';
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

interface RevenueMonth {
  month: string;
  revenue: number;
  target: number;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  applicationsHandled: number;
  avgProcessingTime: string;
  rating: number;
  status: 'online' | 'offline' | 'busy';
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'training' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
}

interface RecentDocument {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  date: string;
  size: string;
}

interface PendingApproval {
  id: string;
  title: string;
  applicant: string;
  type: string;
  submittedDate: string;
  urgency: 'urgent' | 'normal' | 'low';
  amount?: string;
}

interface TopDistrict {
  name: string;
  state: string;
  applications: number;
  revenue: number;
  growth: number;
  rank: number;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'update' | 'alert' | 'info' | 'achievement';
  isNew: boolean;
}

interface GrievanceData {
  category: string;
  total: number;
  resolved: number;
  pending: number;
  color: string;
}

interface CitizenFeedback {
  id: string;
  name: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface HourlyTraffic {
  hour: string;
  visitors: number;
  applications: number;
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
  const [revenueData, setRevenueData] = useState<RevenueMonth[]>([]);
  const [staffLeaderboard, setStaffLeaderboard] = useState<StaffMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [topDistricts, setTopDistricts] = useState<TopDistrict[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [grievances, setGrievances] = useState<GrievanceData[]>([]);
  const [citizenFeedback, setCitizenFeedback] = useState<CitizenFeedback[]>([]);
  const [hourlyTraffic, setHourlyTraffic] = useState<HourlyTraffic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [activeOverviewTab, setActiveOverviewTab] = useState<'document' | 'digital'>('document');
  const [refreshing, setRefreshing] = useState(false);

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
          { id: '7', title: 'PAN Card Application', status: 'approved', date: '5 hours ago', type: 'application', applicant: 'Suresh Patil' },
          { id: '8', title: 'GST Registration', status: 'in_progress', date: '6 hours ago', type: 'application', applicant: 'Deepak Enterprises' },
        ]);

        setTopServices([
          { id: '1', name: 'Caste Certificate', applications: 28456, revenue: 8536800, trend: 12.5 },
          { id: '2', name: 'Income Certificate', applications: 21342, revenue: 6402600, trend: 8.2 },
          { id: '3', name: 'Domicile Certificate', applications: 15678, revenue: 4703400, trend: 5.6 },
          { id: '4', name: 'Birth Certificate', applications: 12456, revenue: 3736800, trend: -2.1 },
          { id: '5', name: 'Marriage Certificate', applications: 7890, revenue: 2367000, trend: 15.3 },
          { id: '6', name: 'Instant PAN', applications: 32456, revenue: 9736800, trend: 22.1 },
        ]);

        setStatePerformance([
          { state: 'Maharashtra', stateCode: 'MH', applications: 12456, completed: 11234, revenue: 3736800, successRate: 95.2 },
          { state: 'Karnataka', stateCode: 'KA', applications: 10234, completed: 9456, revenue: 3070200, successRate: 94.1 },
          { state: 'Gujarat', stateCode: 'GJ', applications: 9876, completed: 9123, revenue: 2962800, successRate: 93.5 },
          { state: 'Tamil Nadu', stateCode: 'TN', applications: 8765, completed: 8234, revenue: 2629500, successRate: 92.8 },
          { state: 'Uttar Pradesh', stateCode: 'UP', applications: 8456, completed: 7654, revenue: 2536800, successRate: 90.5 },
        ]);

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

        setPaymentOverview([
          {
            id: '1', name: 'Service Fees Collected', icon: 'fees',
            amount: 4285600, color: '#3b82f6',
            subStats: [
              { label: 'Commission Earned', value: '₹ 42,856' },
              { label: 'Transactions', value: '1,284' },
            ],
          },
          {
            id: '2', name: 'Online Payments', icon: 'online',
            amount: 3256000, color: '#10b981',
            subStats: [
              { label: 'Gateway Charges', value: '₹ 6,512' },
              { label: 'Success Rate', value: '98.2%' },
            ],
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
          {
            id: '4', name: 'Stamp Duty & Fees', icon: 'stamp',
            amount: 876500, color: '#8b5cf6',
            subStats: [
              { label: 'Processed', value: '342' },
              { label: 'Avg Amount', value: '₹ 2,562' },
            ],
          },
        ]);

        setPipeline([
          { label: 'Draft', count: 456, color: '#94a3b8' },
          { label: 'Submitted', count: 1234, color: '#3b82f6' },
          { label: 'Under Review', count: 856, color: '#f59e0b' },
          { label: 'Verified', count: 623, color: '#8b5cf6' },
          { label: 'Approved', count: 78456, color: '#10b981' },
          { label: 'Completed', count: 74521, color: '#059669' },
        ]);

        setLoginHistory([
          { id: '1', dateTime: '21-Feb-2026 09:12:34', deviceOS: 'Windows 11', browser: 'Chrome 145.0.0.0', location: 'Bengaluru', ip: '104.23.175.195', network: '175.195' },
          { id: '2', dateTime: '21-Feb-2026 07:06:12', deviceOS: 'Windows 11', browser: 'Chrome 145.0.0.0', location: 'Bengaluru', ip: '172.71.81.131', network: '81.131' },
          { id: '3', dateTime: '20-Feb-2026 18:40:09', deviceOS: 'macOS 15.3', browser: 'Safari 19.0', location: 'Mumbai', ip: '172.69.166.71', network: '166.71' },
          { id: '4', dateTime: '20-Feb-2026 14:41:18', deviceOS: 'Windows 10', browser: 'Edge 131.0.0.0', location: 'Delhi', ip: '104.23.170.99', network: '170.99' },
          { id: '5', dateTime: '19-Feb-2026 11:59:12', deviceOS: 'Android 15', browser: 'Chrome Mobile', location: 'Hyderabad', ip: '172.71.182.66', network: '182.66' },
          { id: '6', dateTime: '19-Feb-2026 05:39:19', deviceOS: 'Windows 11', browser: 'Chrome 145.0.0.0', location: 'Chennai', ip: '172.71.95.82', network: '95.82' },
          { id: '7', dateTime: '18-Feb-2026 12:28:24', deviceOS: 'iOS 19.1', browser: 'Safari Mobile', location: 'Pune', ip: '104.23.166.153', network: '166.153' },
          { id: '8', dateTime: '17-Feb-2026 11:05:08', deviceOS: 'Windows 10', browser: 'Firefox 134.0', location: 'Jaipur', ip: '172.70.92.222', network: '92.222' },
        ]);

        setRevenueData([
          { month: 'Jul', revenue: 28500000, target: 30000000 },
          { month: 'Aug', revenue: 32100000, target: 31000000 },
          { month: 'Sep', revenue: 29800000, target: 32000000 },
          { month: 'Oct', revenue: 35600000, target: 33000000 },
          { month: 'Nov', revenue: 38200000, target: 35000000 },
          { month: 'Dec', revenue: 33400000, target: 36000000 },
          { month: 'Jan', revenue: 40100000, target: 38000000 },
          { month: 'Feb', revenue: 42800000, target: 40000000 },
        ]);

        setStaffLeaderboard([
          { id: '1', name: 'Rajesh Verma', role: 'Senior Clerk', department: 'Revenue', applicationsHandled: 1245, avgProcessingTime: '1.8 days', rating: 4.9, status: 'online' },
          { id: '2', name: 'Sunita Devi', role: 'District Officer', department: 'Land Records', applicationsHandled: 1102, avgProcessingTime: '2.1 days', rating: 4.8, status: 'online' },
          { id: '3', name: 'Arvind Kumar', role: 'Tehsildar', department: 'Civil Services', applicationsHandled: 987, avgProcessingTime: '2.4 days', rating: 4.7, status: 'busy' },
          { id: '4', name: 'Meena Sharma', role: 'Assistant', department: 'Certificates', applicationsHandled: 876, avgProcessingTime: '1.6 days', rating: 4.6, status: 'online' },
          { id: '5', name: 'Pankaj Singh', role: 'Inspector', department: 'Verification', applicationsHandled: 823, avgProcessingTime: '3.1 days', rating: 4.5, status: 'offline' },
        ]);

        setUpcomingEvents([
          { id: '1', title: 'District Collectors Meeting', date: '22 Feb', time: '10:00 AM', type: 'meeting', priority: 'high' },
          { id: '2', title: 'Q4 Report Submission Deadline', date: '25 Feb', time: '5:00 PM', type: 'deadline', priority: 'high' },
          { id: '3', title: 'Staff Training - New Portal', date: '28 Feb', time: '2:00 PM', type: 'training', priority: 'medium' },
          { id: '4', title: 'System Maintenance Window', date: '01 Mar', time: '11:00 PM', type: 'maintenance', priority: 'medium' },
          { id: '5', title: 'Budget Review Meeting', date: '03 Mar', time: '11:00 AM', type: 'meeting', priority: 'low' },
        ]);

        setRecentDocuments([
          { id: '1', name: 'Revenue Report Q4 2025.pdf', type: 'pdf', uploadedBy: 'Admin', date: '21 Feb 2026', size: '2.4 MB' },
          { id: '2', name: 'Staff Performance Metrics.xlsx', type: 'spreadsheet', uploadedBy: 'HR Dept', date: '20 Feb 2026', size: '1.1 MB' },
          { id: '3', name: 'Citizen Feedback Analysis.pdf', type: 'pdf', uploadedBy: 'Quality Team', date: '19 Feb 2026', size: '3.7 MB' },
          { id: '4', name: 'Infrastructure Upgrade Plan.docx', type: 'document', uploadedBy: 'IT Dept', date: '18 Feb 2026', size: '856 KB' },
          { id: '5', name: 'District Boundary Maps.png', type: 'image', uploadedBy: 'Geo Team', date: '17 Feb 2026', size: '5.2 MB' },
        ]);

        setPendingApprovals([
          { id: '1', title: 'OBC Certificate Request', applicant: 'Ramesh Yadav', type: 'Certificate', submittedDate: '21 Feb', urgency: 'urgent', amount: '₹ 300' },
          { id: '2', title: 'GST Registration', applicant: 'Sundar Enterprises', type: 'Business', submittedDate: '20 Feb', urgency: 'urgent', amount: '₹ 1,500' },
          { id: '3', title: 'Land Mutation Request', applicant: 'Anil Gupta', type: 'Land Record', submittedDate: '19 Feb', urgency: 'normal', amount: '₹ 500' },
          { id: '4', title: 'Building Plan Approval', applicant: 'Sharma Constructions', type: 'Property', submittedDate: '18 Feb', urgency: 'normal', amount: '₹ 5,000' },
          { id: '5', title: 'Water Connection', applicant: 'Priya Nagar Society', type: 'Utility', submittedDate: '17 Feb', urgency: 'low', amount: '₹ 800' },
          { id: '6', title: 'Shop License Renewal', applicant: 'Kiran General Store', type: 'License', submittedDate: '16 Feb', urgency: 'low', amount: '₹ 1,200' },
        ]);

        setTopDistricts([
          { name: 'Pune', state: 'Maharashtra', applications: 4567, revenue: 1370100, growth: 14.2, rank: 1 },
          { name: 'Bengaluru Urban', state: 'Karnataka', applications: 4234, revenue: 1270200, growth: 12.8, rank: 2 },
          { name: 'Ahmedabad', state: 'Gujarat', applications: 3987, revenue: 1196100, growth: 11.5, rank: 3 },
          { name: 'Chennai', state: 'Tamil Nadu', applications: 3654, revenue: 1096200, growth: 9.3, rank: 4 },
          { name: 'Lucknow', state: 'Uttar Pradesh', applications: 3421, revenue: 1026300, growth: 7.8, rank: 5 },
          { name: 'Jaipur', state: 'Rajasthan', applications: 3198, revenue: 959400, growth: 10.1, rank: 6 },
          { name: 'Hyderabad', state: 'Telangana', applications: 3045, revenue: 913500, growth: 13.6, rank: 7 },
          { name: 'Mumbai', state: 'Maharashtra', applications: 2987, revenue: 896100, growth: 6.4, rank: 8 },
        ]);

        setAnnouncements([
          { id: '1', title: 'New Digital Signature Service Launched', description: 'DSC service is now available for all citizens across 28 states.', date: '21 Feb 2026', type: 'update', isNew: true },
          { id: '2', title: 'System Maintenance Scheduled', description: 'Planned maintenance on Mar 1, 11 PM - 3 AM. Services may be unavailable.', date: '20 Feb 2026', type: 'alert', isNew: true },
          { id: '3', title: '85,000+ Applications Milestone', description: 'We have crossed 85,000 total processed applications. Great teamwork!', date: '19 Feb 2026', type: 'achievement', isNew: false },
          { id: '4', title: 'Updated Data Privacy Guidelines', description: 'New privacy guidelines effective from March 1, 2026. Please review.', date: '17 Feb 2026', type: 'info', isNew: false },
        ]);

        setGrievances([
          { category: 'Service Delays', total: 342, resolved: 278, pending: 64, color: '#ef4444' },
          { category: 'Technical Issues', total: 186, resolved: 156, pending: 30, color: '#f59e0b' },
          { category: 'Staff Behaviour', total: 78, resolved: 72, pending: 6, color: '#8b5cf6' },
          { category: 'Payment Issues', total: 124, resolved: 110, pending: 14, color: '#3b82f6' },
          { category: 'Document Errors', total: 95, resolved: 82, pending: 13, color: '#06b6d4' },
        ]);

        setCitizenFeedback([
          { id: '1', name: 'Ananya Verma', service: 'Caste Certificate', rating: 5, comment: 'Very fast processing. Got my certificate in 2 days!', date: '21 Feb', sentiment: 'positive' },
          { id: '2', name: 'Mohit Agarwal', service: 'PAN Card', rating: 4, comment: 'Good service but the portal could be faster.', date: '20 Feb', sentiment: 'positive' },
          { id: '3', name: 'Rekha Devi', service: 'Income Certificate', rating: 3, comment: 'Average experience, took longer than expected.', date: '19 Feb', sentiment: 'neutral' },
          { id: '4', name: 'Sanjay Patel', service: 'Land Record', rating: 2, comment: 'Had to visit the office multiple times for corrections.', date: '18 Feb', sentiment: 'negative' },
          { id: '5', name: 'Kavita Singh', service: 'GST Registration', rating: 5, comment: 'Seamless process! Highly recommended.', date: '17 Feb', sentiment: 'positive' },
        ]);

        setHourlyTraffic([
          { hour: '6AM', visitors: 120, applications: 8 },
          { hour: '7AM', visitors: 340, applications: 22 },
          { hour: '8AM', visitors: 780, applications: 56 },
          { hour: '9AM', visitors: 1250, applications: 98 },
          { hour: '10AM', visitors: 1680, applications: 142 },
          { hour: '11AM', visitors: 1890, applications: 165 },
          { hour: '12PM', visitors: 1420, applications: 118 },
          { hour: '1PM', visitors: 1100, applications: 85 },
          { hour: '2PM', visitors: 1560, applications: 134 },
          { hour: '3PM', visitors: 1780, applications: 156 },
          { hour: '4PM', visitors: 1650, applications: 138 },
          { hour: '5PM', visitors: 1200, applications: 92 },
          { hour: '6PM', visitors: 680, applications: 45 },
          { hour: '7PM', visitors: 340, applications: 18 },
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

  const getEventColor = (type: string) => {
    const map: Record<string, string> = {
      meeting: '#3b82f6', deadline: '#ef4444', training: '#8b5cf6', maintenance: '#f59e0b',
    };
    return map[type] || '#6b7280';
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'update': return <HiOutlineLightningBolt />;
      case 'alert': return <HiOutlineExclamationCircle />;
      case 'achievement': return <HiOutlineStar />;
      case 'info': return <HiOutlineInformationCircle />;
      default: return <HiOutlineBell />;
    }
  };

  const getAnnouncementColor = (type: string) => {
    const map: Record<string, string> = {
      update: '#3b82f6', alert: '#ef4444', achievement: '#f59e0b', info: '#6366f1',
    };
    return map[type] || '#6b7280';
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <HiOutlineDocumentText />;
      case 'spreadsheet': return <HiOutlineChartBar />;
      case 'image': return <HiOutlineEye />;
      default: return <HiOutlineFolder />;
    }
  };

  const getDocColor = (type: string) => {
    const map: Record<string, string> = {
      pdf: '#ef4444', spreadsheet: '#22c55e', document: '#3b82f6', image: '#8b5cf6',
    };
    return map[type] || '#6b7280';
  };

  const getSentimentColor = (sentiment: string) => {
    const map: Record<string, string> = { positive: '#22c55e', neutral: '#f59e0b', negative: '#ef4444' };
    return map[sentiment] || '#94a3b8';
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // ─── Computed Values ─────────────────────────────────────

  const citizenSatisfaction = useMemo(() => {
    if (!citizenFeedback.length) return { avg: 0, positive: 0, neutral: 0, negative: 0 };
    const avg = citizenFeedback.reduce((s, f) => s + f.rating, 0) / citizenFeedback.length;
    const positive = citizenFeedback.filter(f => f.sentiment === 'positive').length;
    const neutral = citizenFeedback.filter(f => f.sentiment === 'neutral').length;
    const negative = citizenFeedback.filter(f => f.sentiment === 'negative').length;
    return { avg, positive, neutral, negative };
  }, [citizenFeedback]);

  const totalGrievances = useMemo(() => {
    return grievances.reduce((s, g) => s + g.total, 0);
  }, [grievances]);

  const resolvedGrievances = useMemo(() => {
    return grievances.reduce((s, g) => s + g.resolved, 0);
  }, [grievances]);

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
    { icon: HiOutlineDocumentText, label: 'New Application', desc: 'Start a new service request', path: '/applications/new', color: '#3b82f6' },
    { icon: HiOutlineCloudUpload, label: 'Upload Document', desc: 'Add documents to existing', path: '/documents', color: '#8b5cf6' },
    { icon: HiOutlineSearch, label: 'Track Status', desc: 'Check application progress', path: '/applications', color: '#10b981' },
    { icon: HiOutlineSupport, label: 'Get Support', desc: 'Contact helpdesk', path: '/support', color: '#f59e0b' },
    { icon: HiOutlineUserGroup, label: 'Manage Staff', desc: 'View team & performance', path: '/staff', color: '#ec4899' },
    { icon: HiOutlineChartPie, label: 'View Reports', desc: 'Analytics & insights', path: '/finance', color: '#06b6d4' },
  ];

  // ─── Loading State ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="bm-dashboard">
        <div className="bm-splash-screen">
          <div className="bm-splash-content">
            <InfinityLogo size="splash" />
            <div className="bm-splash-text">
              <h1 className="bm-splash-title">
                <span className="bm-splash-bharat">Bharat</span>
                <span className="bm-splash-mithra"> Mithra</span>
              </h1>
              <p className="bm-splash-tagline">ALL SERVICES, AT ONE PLACE</p>
              <div className="bm-splash-loader">
                <div className="bm-splash-loader-bar"></div>
              </div>
              <span className="bm-splash-loading-text">Preparing your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPipeline = pipeline.reduce((sum, s) => sum + s.count, 0);
  const maxRevenue = Math.max(...revenueData.map(r => Math.max(r.revenue, r.target)));
  const maxTraffic = Math.max(...hourlyTraffic.map(t => t.visitors));
  const activeServices = documentServices.concat(digitalServices);
  const currentActiveOverview = activeOverviewTab === 'document' ? documentServices : digitalServices;
  const todayTotalServices = activeServices.reduce((s, svc) => s + svc.todayCount, 0);

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
          <div className="bm-header-greeting">
            <h1 className="bm-page-title">Dashboard</h1>
            <span className="bm-header-wave">Welcome back, Admin</span>
          </div>
          <p className="bm-page-desc">Here's what's happening across your services today</p>
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
          <button className={`bm-btn bm-btn-secondary ${refreshing ? 'bm-btn-spinning' : ''}`} onClick={handleRefresh}>
            <HiOutlineRefresh />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button className="bm-btn bm-btn-primary">
            <HiOutlineDownload />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* ─── Announcements Ticker ─────────────────────────────── */}
      <div className="bm-announcements-ticker">
        <div className="bm-announcements-label">
          <HiOutlineSpeakerphone />
          <span>Updates</span>
        </div>
        <div className="bm-announcements-scroll">
          {announcements.map((a) => (
            <div key={a.id} className="bm-announcement-item" style={{ '--ann-color': getAnnouncementColor(a.type) } as React.CSSProperties}>
              <span className="bm-announcement-icon" style={{ color: getAnnouncementColor(a.type) }}>
                {getAnnouncementIcon(a.type)}
              </span>
              <span className="bm-announcement-text">
                <strong>{a.title}</strong> — {a.description}
              </span>
              {a.isNew && <span className="bm-announcement-new">NEW</span>}
              <span className="bm-announcement-date">{a.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Wallet + Stats Row ─────────────────────────────── */}
      <div className="bm-wallet-stats-row">
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
        <div className="bm-today-divider"></div>
        <div className="bm-today-item">
          <HiOutlineViewGrid className="bm-today-icon" />
          <div className="bm-today-info">
            <span className="bm-today-value">{todayTotalServices}</span>
            <span className="bm-today-label">Services Used</span>
          </div>
          <span className="bm-today-change positive">+5%</span>
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

      {/* ─── Revenue Analytics + Traffic Heatmap Row ──────────── */}
      <div className="bm-overview-row">
        <section className="bm-card bm-revenue-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Revenue Analytics (8 Months)</h2>
            <div className="bm-revenue-legend">
              <span className="bm-revenue-legend-item"><span className="bm-legend-dot" style={{ background: 'var(--color-primary)' }}></span> Revenue</span>
              <span className="bm-revenue-legend-item"><span className="bm-legend-dot" style={{ background: '#94a3b8' }}></span> Target</span>
            </div>
          </div>
          <div className="bm-revenue-chart">
            <div className="bm-revenue-y-axis">
              <span>₹4.5Cr</span>
              <span>₹3.0Cr</span>
              <span>₹1.5Cr</span>
              <span>₹0</span>
            </div>
            <div className="bm-revenue-bars">
              {revenueData.map((item, idx) => (
                <div key={idx} className="bm-revenue-bar-group">
                  <div className="bm-revenue-bar-container">
                    <div
                      className="bm-revenue-bar bm-revenue-bar--actual"
                      style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                      title={formatCurrency(item.revenue)}
                    >
                      <span className="bm-revenue-bar-tooltip">{formatCurrency(item.revenue)}</span>
                    </div>
                    <div
                      className="bm-revenue-bar bm-revenue-bar--target"
                      style={{ height: `${(item.target / maxRevenue) * 100}%` }}
                      title={`Target: ${formatCurrency(item.target)}`}
                    ></div>
                  </div>
                  <span className="bm-revenue-bar-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bm-revenue-summary">
            <div className="bm-revenue-summary-item">
              <span className="bm-revenue-summary-label">Total Revenue</span>
              <span className="bm-revenue-summary-value">{formatCurrency(revenueData.reduce((s, r) => s + r.revenue, 0))}</span>
            </div>
            <div className="bm-revenue-summary-item">
              <span className="bm-revenue-summary-label">Average Monthly</span>
              <span className="bm-revenue-summary-value">{formatCurrency(revenueData.reduce((s, r) => s + r.revenue, 0) / revenueData.length)}</span>
            </div>
            <div className="bm-revenue-summary-item">
              <span className="bm-revenue-summary-label">Best Month</span>
              <span className="bm-revenue-summary-value success">{formatCurrency(Math.max(...revenueData.map(r => r.revenue)))}</span>
            </div>
            <div className="bm-revenue-summary-item">
              <span className="bm-revenue-summary-label">Target Achievement</span>
              <span className="bm-revenue-summary-value success">
                {((revenueData.reduce((s, r) => s + r.revenue, 0) / revenueData.reduce((s, r) => s + r.target, 0)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </section>

        {/* Today's Traffic Pattern */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Today's Traffic Pattern</h2>
            <div className="bm-traffic-legend">
              <span className="bm-traffic-legend-item"><span className="bm-legend-dot" style={{ background: '#3b82f6' }}></span> Visitors</span>
              <span className="bm-traffic-legend-item"><span className="bm-legend-dot" style={{ background: '#10b981' }}></span> Applications</span>
            </div>
          </div>
          <div className="bm-traffic-chart">
            {hourlyTraffic.map((item, idx) => (
              <div key={idx} className="bm-traffic-bar-group">
                <div className="bm-traffic-bar-container">
                  <div className="bm-traffic-bar bm-traffic-bar--visitors"
                    style={{ height: `${(item.visitors / maxTraffic) * 100}%` }}
                    title={`${item.visitors} visitors`}
                  ></div>
                  <div className="bm-traffic-bar bm-traffic-bar--apps"
                    style={{ height: `${(item.applications / maxTraffic) * 100}%` }}
                    title={`${item.applications} applications`}
                  ></div>
                </div>
                <span className="bm-traffic-hour">{item.hour}</span>
              </div>
            ))}
          </div>
          <div className="bm-traffic-summary">
            <div className="bm-traffic-stat">
              <span className="bm-traffic-stat-value">{hourlyTraffic.reduce((s, t) => s + t.visitors, 0).toLocaleString('en-IN')}</span>
              <span className="bm-traffic-stat-label">Total Visitors</span>
            </div>
            <div className="bm-traffic-stat">
              <span className="bm-traffic-stat-value">{hourlyTraffic.reduce((s, t) => s + t.applications, 0).toLocaleString('en-IN')}</span>
              <span className="bm-traffic-stat-label">Total Applications</span>
            </div>
            <div className="bm-traffic-stat">
              <span className="bm-traffic-stat-value">{hourlyTraffic.length > 0 ? hourlyTraffic.reduce((max, t) => t.visitors > max.visitors ? t : max, hourlyTraffic[0]).hour : '-'}</span>
              <span className="bm-traffic-stat-label">Peak Hour</span>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Service Overview (Tabbed) ────────────────────────── */}
      <section className="bm-card">
        <div className="bm-card-header">
          <h2 className="bm-card-title">Service Overview</h2>
          <div className="bm-overview-tabs">
            <button
              className={`bm-overview-tab ${activeOverviewTab === 'document' ? 'active' : ''}`}
              onClick={() => setActiveOverviewTab('document')}
            >
              <HiOutlineDocumentText /> Document ({documentServices.reduce((s, d) => s + d.todayCount, 0)} today)
            </button>
            <button
              className={`bm-overview-tab ${activeOverviewTab === 'digital' ? 'active' : ''}`}
              onClick={() => setActiveOverviewTab('digital')}
            >
              <HiOutlineFingerPrint /> Digital ({digitalServices.reduce((s, d) => s + d.todayCount, 0)} today)
            </button>
          </div>
        </div>
        <div className="bm-overview-table">
          <div className="bm-overview-table-header">
            <span></span>
            <span>Service</span>
            <span>Today</span>
            <span>All Time</span>
          </div>
          {currentActiveOverview.map((item, idx) => (
            <div key={idx} className="bm-overview-table-row">
              <span className="bm-overview-dot" style={{ background: getStatusDot(item.status) }}></span>
              <span className="bm-overview-name">{item.name}</span>
              <span className={`bm-overview-count ${item.todayCount > 0 ? 'bm-overview-count--active' : ''}`}>
                {item.todayCount > 0 ? item.todayCount : '—'}
              </span>
              <span className="bm-overview-count">{item.allTimeCount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Payment / Business Overview ────────────────────── */}
      <section className="bm-card">
        <div className="bm-card-header">
          <h2 className="bm-card-title">Business Overview (Payments)</h2>
          <button className="bm-link-btn" onClick={() => navigate('/finance')}>Finance <HiOutlineArrowSmRight /></button>
        </div>
        <div className="bm-payment-overview">
          {paymentOverview.map((payment) => (
            <div key={payment.id} className="bm-payment-card" style={{ borderLeftColor: payment.color }}>
              <div className="bm-payment-icon-wrap" style={{ background: `${payment.color}15`, color: payment.color }}>
                {payment.icon === 'fees' && <HiOutlineCreditCard />}
                {payment.icon === 'online' && <HiOutlineCash />}
                {payment.icon === 'transfer' && <HiOutlineReceiptRefund />}
                {payment.icon === 'stamp' && <HiOutlineBadgeCheck />}
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

      {/* ─── Grievance Tracker + Citizen Satisfaction Row ─────── */}
      <div className="bm-overview-row">
        {/* Grievance Tracker */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Grievance Tracker</h2>
            <div className="bm-grievance-summary-badge">
              <span className="bm-grievance-resolved">{resolvedGrievances} resolved</span>
              <span className="bm-grievance-total">/ {totalGrievances} total</span>
            </div>
          </div>
          <div className="bm-grievance-overview">
            <div className="bm-grievance-donut">
              <div className="bm-donut-center">
                <span className="bm-donut-value">{((resolvedGrievances / totalGrievances) * 100).toFixed(0)}%</span>
                <span className="bm-donut-label">Resolved</span>
              </div>
              <svg viewBox="0 0 100 100" className="bm-donut-svg">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border-light)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="8"
                  strokeDasharray={`${(resolvedGrievances / totalGrievances) * 251.2} 251.2`}
                  strokeLinecap="round" transform="rotate(-90 50 50)" />
              </svg>
            </div>
            <div className="bm-grievance-categories">
              {grievances.map((g, idx) => (
                <div key={idx} className="bm-grievance-category">
                  <div className="bm-grievance-cat-header">
                    <span className="bm-grievance-cat-dot" style={{ background: g.color }}></span>
                    <span className="bm-grievance-cat-name">{g.category}</span>
                    <span className="bm-grievance-cat-count">{g.pending} pending</span>
                  </div>
                  <div className="bm-grievance-bar-wrap">
                    <div className="bm-grievance-bar" style={{ width: `${(g.resolved / g.total) * 100}%`, background: g.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Citizen Satisfaction */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Citizen Satisfaction</h2>
            <div className="bm-satisfaction-score">
              <HiOutlineStar className="bm-satisfaction-star" />
              <span>{citizenSatisfaction.avg.toFixed(1)}/5</span>
            </div>
          </div>
          <div className="bm-satisfaction-overview">
            <div className="bm-satisfaction-bars">
              <div className="bm-satisfaction-bar-item">
                <span className="bm-satisfaction-bar-label positive">Positive</span>
                <div className="bm-satisfaction-bar-wrap">
                  <div className="bm-satisfaction-bar" style={{ width: `${(citizenSatisfaction.positive / citizenFeedback.length) * 100}%`, background: '#22c55e' }}></div>
                </div>
                <span className="bm-satisfaction-bar-count">{citizenSatisfaction.positive}</span>
              </div>
              <div className="bm-satisfaction-bar-item">
                <span className="bm-satisfaction-bar-label neutral">Neutral</span>
                <div className="bm-satisfaction-bar-wrap">
                  <div className="bm-satisfaction-bar" style={{ width: `${(citizenSatisfaction.neutral / citizenFeedback.length) * 100}%`, background: '#f59e0b' }}></div>
                </div>
                <span className="bm-satisfaction-bar-count">{citizenSatisfaction.neutral}</span>
              </div>
              <div className="bm-satisfaction-bar-item">
                <span className="bm-satisfaction-bar-label negative">Negative</span>
                <div className="bm-satisfaction-bar-wrap">
                  <div className="bm-satisfaction-bar" style={{ width: `${(citizenSatisfaction.negative / citizenFeedback.length) * 100}%`, background: '#ef4444' }}></div>
                </div>
                <span className="bm-satisfaction-bar-count">{citizenSatisfaction.negative}</span>
              </div>
            </div>
          </div>
          <div className="bm-feedback-list">
            {citizenFeedback.slice(0, 4).map((fb) => (
              <div key={fb.id} className="bm-feedback-item">
                <div className="bm-feedback-avatar" style={{ background: getSentimentColor(fb.sentiment) }}>
                  {fb.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="bm-feedback-content">
                  <div className="bm-feedback-header">
                    <span className="bm-feedback-name">{fb.name}</span>
                    <span className="bm-feedback-service">{fb.service}</span>
                  </div>
                  <p className="bm-feedback-comment">{fb.comment}</p>
                  <div className="bm-feedback-meta">
                    <span className="bm-feedback-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <HiOutlineStar key={i} className={i < fb.rating ? 'filled' : ''} />
                      ))}
                    </span>
                    <span className="bm-feedback-date">{fb.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── Pending Approvals + Upcoming Events Row ─────────── */}
      <div className="bm-overview-row">
        {/* Pending Approvals */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Pending Approvals</h2>
            <span className="bm-badge-count">{pendingApprovals.length}</span>
          </div>
          <div className="bm-approvals-list">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="bm-approval-item">
                <div className="bm-approval-left">
                  <div className={`bm-approval-urgency bm-approval-urgency--${item.urgency}`}>
                    <HiOutlineExclamationCircle />
                  </div>
                  <div className="bm-approval-info">
                    <span className="bm-approval-title">{item.title}</span>
                    <span className="bm-approval-meta">
                      <span>{item.applicant}</span>
                      <span className="bm-approval-type">{item.type}</span>
                    </span>
                  </div>
                </div>
                <div className="bm-approval-right">
                  {item.amount && <span className="bm-approval-amount">{item.amount}</span>}
                  <span className="bm-approval-date">{item.submittedDate}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bm-card-footer">
            <button className="bm-link-btn" onClick={() => navigate('/applications')}>View all pending <HiOutlineArrowSmRight /></button>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Upcoming Events</h2>
            <button className="bm-link-btn" onClick={() => navigate('/calendar')}>Calendar <HiOutlineArrowSmRight /></button>
          </div>
          <div className="bm-events-list">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bm-event-item">
                <div className="bm-event-date-badge" style={{ background: `${getEventColor(event.type)}12`, color: getEventColor(event.type) }}>
                  <span className="bm-event-day">{event.date.split(' ')[0]}</span>
                  <span className="bm-event-month">{event.date.split(' ')[1]}</span>
                </div>
                <div className="bm-event-info">
                  <span className="bm-event-title">{event.title}</span>
                  <span className="bm-event-meta">
                    <HiOutlineClock />
                    <span>{event.time}</span>
                    <span className={`bm-event-priority bm-event-priority--${event.priority}`}>{event.priority}</span>
                  </span>
                </div>
                <div className="bm-event-type-dot" style={{ background: getEventColor(event.type) }}></div>
              </div>
            ))}
          </div>
        </section>
      </div>

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
                  <action.icon className="bm-action-icon" style={{ color: action.color, background: `${action.color}12` }} />
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
              <button className="bm-link-btn" onClick={() => navigate('/support')}>Open <HiOutlineArrowSmRight /></button>
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
              <div className="bm-support-quick-stats">
                <div className="bm-support-quick-stat">
                  <span className="bm-support-quick-value">234</span>
                  <span className="bm-support-quick-label">Open Tickets</span>
                </div>
                <div className="bm-support-quick-stat">
                  <span className="bm-support-quick-value">45 min</span>
                  <span className="bm-support-quick-label">Avg Response</span>
                </div>
                <div className="bm-support-quick-stat">
                  <span className="bm-support-quick-value">96%</span>
                  <span className="bm-support-quick-label">Resolution</span>
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

      {/* ─── Staff Leaderboard + Recent Documents Row ─────────── */}
      <div className="bm-overview-row">
        {/* Staff Performance Leaderboard */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Staff Performance Leaderboard</h2>
            <button className="bm-link-btn" onClick={() => navigate('/staff')}>View all <HiOutlineArrowSmRight /></button>
          </div>
          <div className="bm-leaderboard">
            {staffLeaderboard.map((staff, idx) => (
              <div key={staff.id} className="bm-leaderboard-item">
                <div className="bm-leaderboard-rank">
                  {idx < 3 ? (
                    <span className={`bm-leaderboard-medal bm-leaderboard-medal--${idx + 1}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span className="bm-leaderboard-num">#{idx + 1}</span>
                  )}
                </div>
                <div className="bm-leaderboard-avatar">
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="bm-leaderboard-info">
                  <span className="bm-leaderboard-name">
                    {staff.name}
                    <span className={`bm-staff-status-dot bm-staff-status-dot--${staff.status}`}></span>
                  </span>
                  <span className="bm-leaderboard-role">{staff.role} · {staff.department}</span>
                </div>
                <div className="bm-leaderboard-stats">
                  <div className="bm-leaderboard-stat">
                    <span className="bm-leaderboard-stat-value">{staff.applicationsHandled.toLocaleString('en-IN')}</span>
                    <span className="bm-leaderboard-stat-label">Handled</span>
                  </div>
                  <div className="bm-leaderboard-stat">
                    <span className="bm-leaderboard-stat-value">{staff.avgProcessingTime}</span>
                    <span className="bm-leaderboard-stat-label">Avg Time</span>
                  </div>
                  <div className="bm-leaderboard-stat">
                    <span className="bm-leaderboard-stat-value bm-leaderboard-rating">
                      <HiOutlineStar /> {staff.rating}
                    </span>
                    <span className="bm-leaderboard-stat-label">Rating</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Documents */}
        <section className="bm-card">
          <div className="bm-card-header">
            <h2 className="bm-card-title">Recent Documents</h2>
            <button className="bm-link-btn" onClick={() => navigate('/documents')}>View all <HiOutlineArrowSmRight /></button>
          </div>
          <div className="bm-recent-docs">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="bm-doc-item">
                <div className="bm-doc-icon" style={{ color: getDocColor(doc.type), background: `${getDocColor(doc.type)}12` }}>
                  {getDocIcon(doc.type)}
                </div>
                <div className="bm-doc-info">
                  <span className="bm-doc-name">{doc.name}</span>
                  <span className="bm-doc-meta">{doc.uploadedBy} · {doc.date}</span>
                </div>
                <span className="bm-doc-size">{doc.size}</span>
              </div>
            ))}
          </div>
          <div className="bm-card-footer">
            <button className="bm-link-btn" onClick={() => navigate('/documents')}>
              <HiOutlineCloudUpload /> Upload document
            </button>
          </div>
        </section>
      </div>

      {/* ─── Top Districts ────────────────────────────────────── */}
      <section className="bm-card">
        <div className="bm-card-header">
          <h2 className="bm-card-title">Top Performing Districts</h2>
          <button className="bm-link-btn" onClick={() => navigate('/geography')}>
            <HiOutlineMap /> View Geography <HiOutlineArrowSmRight />
          </button>
        </div>
        <div className="bm-districts-grid">
          {topDistricts.map((district) => (
            <div key={district.name} className="bm-district-card">
              <div className="bm-district-rank-badge">#{district.rank}</div>
              <div className="bm-district-header">
                <div className="bm-district-icon">
                  <HiOutlineOfficeBuilding />
                </div>
                <div>
                  <span className="bm-district-name">{district.name}</span>
                  <span className="bm-district-state">{district.state}</span>
                </div>
              </div>
              <div className="bm-district-stats">
                <div className="bm-district-stat">
                  <span className="bm-district-stat-label">Applications</span>
                  <span className="bm-district-stat-value">{district.applications.toLocaleString('en-IN')}</span>
                </div>
                <div className="bm-district-stat">
                  <span className="bm-district-stat-label">Revenue</span>
                  <span className="bm-district-stat-value">{formatCurrency(district.revenue)}</span>
                </div>
              </div>
              <div className="bm-district-growth">
                <HiOutlineTrendingUp />
                <span>+{district.growth}% growth</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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
          <div className="bm-system-health-status">
            <span className="bm-health-pulse"></span>
            <span>All Systems Operational</span>
          </div>
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
            <HiOutlineDatabase className="bm-health-icon bm-health-icon--success" />
            <div className="bm-health-info">
              <span className="bm-health-label">DB Connections</span>
              <span className="bm-health-value">42/100</span>
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
            <HiOutlineServer className="bm-health-icon bm-health-icon--success" />
            <div className="bm-health-info">
              <span className="bm-health-label">Server Load</span>
              <span className="bm-health-value">32%</span>
            </div>
          </div>
          <div className="bm-health-item">
            <HiOutlineWifi className="bm-health-icon bm-health-icon--success" />
            <div className="bm-health-info">
              <span className="bm-health-label">Bandwidth</span>
              <span className="bm-health-value">4.2 Gbps</span>
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
            <HiOutlinePaperAirplane className="bm-health-icon bm-health-icon--success" />
            <div className="bm-health-info">
              <span className="bm-health-label">SMS/Email Queue</span>
              <span className="bm-health-value">128 pending</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
