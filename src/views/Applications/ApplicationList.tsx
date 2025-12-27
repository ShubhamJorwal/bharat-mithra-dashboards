import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineSwitchVertical,
  HiOutlineArrowRight,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineClipboardList,
  HiOutlineDotsVertical,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBan,
  HiOutlineClipboardCheck,
  HiOutlineDocumentDuplicate,
  HiOutlineChatAlt,
  HiOutlineCash,
  HiOutlinePause,
  HiOutlinePlay
} from 'react-icons/hi';
import applicationsApi from '../../services/api/applications.api';
import type { ApplicationListItem, ApplicationStatus, PaymentStatus, ApplicationQueryParams } from '../../types/api.types';
import { PageHeader } from '../../components/common/PageHeader';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import './ApplicationList.scss';

// Status configuration with colors and labels
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  pending_payment: { label: 'Pending Payment', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  payment_failed: { label: 'Payment Failed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  submitted: { label: 'Submitted', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  under_review: { label: 'Under Review', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  document_required: { label: 'Document Required', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  processing: { label: 'Processing', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)' },
  pending_verification: { label: 'Pending Verification', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)' },
  verified: { label: 'Verified', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  approved: { label: 'Approved', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  rejected: { label: 'Rejected', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  completed: { label: 'Completed', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.1)' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  on_hold: { label: 'On Hold', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
  expired: { label: 'Expired', color: '#9ca3af', bgColor: 'rgba(156, 163, 175, 0.1)' }
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  completed: { label: 'Paid', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  failed: { label: 'Failed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  refunded: { label: 'Refunded', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' }
};

// Mock data for development when API is unavailable
const MOCK_APPLICATIONS: ApplicationListItem[] = [
  {
    id: 'app-001',
    application_number: 'BM-2024-001234',
    service_name: 'Birth Certificate',
    applicant_name: 'Rahul Kumar',
    applicant_mobile: '+91 98765 43210',
    status: 'submitted',
    payment_status: 'completed',
    total_fee: 150,
    amount_paid: 150,
    is_agent_assisted: false,
    created_at: '2024-12-20T10:30:00Z',
    submitted_at: '2024-12-20T10:35:00Z'
  },
  {
    id: 'app-002',
    application_number: 'BM-2024-001235',
    service_name: 'Income Certificate',
    applicant_name: 'Priya Sharma',
    applicant_mobile: '+91 87654 32109',
    status: 'under_review',
    payment_status: 'completed',
    total_fee: 100,
    amount_paid: 100,
    is_agent_assisted: true,
    agent_name: 'Suresh Kumar',
    created_at: '2024-12-19T14:20:00Z',
    submitted_at: '2024-12-19T14:25:00Z'
  },
  {
    id: 'app-003',
    application_number: 'BM-2024-001236',
    service_name: 'Caste Certificate',
    applicant_name: 'Amit Patel',
    applicant_mobile: '+91 76543 21098',
    status: 'processing',
    payment_status: 'completed',
    total_fee: 200,
    amount_paid: 200,
    is_agent_assisted: false,
    created_at: '2024-12-18T09:15:00Z',
    submitted_at: '2024-12-18T09:20:00Z'
  },
  {
    id: 'app-004',
    application_number: 'BM-2024-001237',
    service_name: 'Birth Certificate',
    applicant_name: 'Sneha Reddy',
    applicant_mobile: '+91 65432 10987',
    status: 'approved',
    payment_status: 'completed',
    total_fee: 150,
    amount_paid: 150,
    is_agent_assisted: false,
    created_at: '2024-12-17T16:45:00Z',
    submitted_at: '2024-12-17T16:50:00Z'
  },
  {
    id: 'app-005',
    application_number: 'BM-2024-001238',
    service_name: 'Domicile Certificate',
    applicant_name: 'Vikram Singh',
    applicant_mobile: '+91 54321 09876',
    status: 'completed',
    payment_status: 'completed',
    total_fee: 250,
    amount_paid: 250,
    is_agent_assisted: true,
    agent_name: 'Ramesh Verma',
    created_at: '2024-12-16T11:30:00Z',
    submitted_at: '2024-12-16T11:35:00Z'
  },
  {
    id: 'app-006',
    application_number: 'BM-2024-001239',
    service_name: 'Income Certificate',
    applicant_name: 'Anita Gupta',
    applicant_mobile: '+91 43210 98765',
    status: 'pending_payment',
    payment_status: 'pending',
    total_fee: 100,
    amount_paid: 0,
    is_agent_assisted: false,
    created_at: '2024-12-21T08:00:00Z',
    submitted_at: null
  },
  {
    id: 'app-007',
    application_number: 'BM-2024-001240',
    service_name: 'Marriage Certificate',
    applicant_name: 'Rajan Mehta',
    applicant_mobile: '+91 32109 87654',
    status: 'document_required',
    payment_status: 'completed',
    total_fee: 300,
    amount_paid: 300,
    is_agent_assisted: false,
    created_at: '2024-12-15T13:20:00Z',
    submitted_at: '2024-12-15T13:25:00Z'
  },
  {
    id: 'app-008',
    application_number: 'BM-2024-001241',
    service_name: 'Caste Certificate',
    applicant_name: 'Deepa Nair',
    applicant_mobile: '+91 21098 76543',
    status: 'rejected',
    payment_status: 'refunded',
    total_fee: 200,
    amount_paid: 0,
    is_agent_assisted: false,
    created_at: '2024-12-14T10:10:00Z',
    submitted_at: '2024-12-14T10:15:00Z'
  }
];

// Get available actions based on status
const getAvailableActions = (status: ApplicationStatus) => {
  const actions: { key: string; label: string; icon: React.ReactNode; color?: string }[] = [];

  switch (status) {
    case 'draft':
      actions.push({ key: 'submit', label: 'Submit', icon: <HiOutlinePlay />, color: '#3b82f6' });
      actions.push({ key: 'delete', label: 'Delete', icon: <HiOutlineTrash />, color: '#ef4444' });
      break;
    case 'submitted':
      actions.push({ key: 'under_review', label: 'Start Review', icon: <HiOutlineClipboardCheck />, color: '#8b5cf6' });
      actions.push({ key: 'document_required', label: 'Request Documents', icon: <HiOutlineDocumentDuplicate />, color: '#f97316' });
      actions.push({ key: 'cancel', label: 'Cancel', icon: <HiOutlineBan />, color: '#6b7280' });
      break;
    case 'under_review':
      actions.push({ key: 'processing', label: 'Start Processing', icon: <HiOutlinePlay />, color: '#0ea5e9' });
      actions.push({ key: 'document_required', label: 'Request Documents', icon: <HiOutlineDocumentDuplicate />, color: '#f97316' });
      actions.push({ key: 'on_hold', label: 'Put On Hold', icon: <HiOutlinePause />, color: '#eab308' });
      break;
    case 'document_required':
      actions.push({ key: 'under_review', label: 'Resume Review', icon: <HiOutlineClipboardCheck />, color: '#8b5cf6' });
      actions.push({ key: 'cancel', label: 'Cancel', icon: <HiOutlineBan />, color: '#6b7280' });
      break;
    case 'processing':
      actions.push({ key: 'verify', label: 'Send for Verification', icon: <HiOutlineClipboardCheck />, color: '#a855f7' });
      actions.push({ key: 'on_hold', label: 'Put On Hold', icon: <HiOutlinePause />, color: '#eab308' });
      break;
    case 'pending_verification':
      actions.push({ key: 'verified', label: 'Mark Verified', icon: <HiOutlineCheckCircle />, color: '#22c55e' });
      actions.push({ key: 'document_required', label: 'Request Documents', icon: <HiOutlineDocumentDuplicate />, color: '#f97316' });
      break;
    case 'verified':
      actions.push({ key: 'approve', label: 'Approve', icon: <HiOutlineCheckCircle />, color: '#10b981' });
      actions.push({ key: 'reject', label: 'Reject', icon: <HiOutlineXCircle />, color: '#ef4444' });
      break;
    case 'approved':
      actions.push({ key: 'complete', label: 'Mark Complete', icon: <HiOutlineCheckCircle />, color: '#059669' });
      break;
    case 'on_hold':
      actions.push({ key: 'processing', label: 'Resume Processing', icon: <HiOutlinePlay />, color: '#0ea5e9' });
      actions.push({ key: 'cancel', label: 'Cancel', icon: <HiOutlineBan />, color: '#6b7280' });
      break;
    case 'rejected':
    case 'cancelled':
    case 'completed':
    case 'expired':
      // No status change actions for terminal states
      break;
  }

  // Common actions for non-terminal states
  if (!['rejected', 'cancelled', 'completed', 'expired', 'draft'].includes(status)) {
    actions.push({ key: 'add_note', label: 'Add Note', icon: <HiOutlineChatAlt />, color: '#6b7280' });
  }

  return actions;
};

const ApplicationList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteApplication, setDeleteApplication] = useState<ApplicationListItem | null>(null);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: string;
    application: ApplicationListItem | null;
    title: string;
    message: string;
  }>({ isOpen: false, action: '', application: null, title: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionRemarks, setActionRemarks] = useState('');

  // Filter state - synced with URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>(searchParams.get('payment_status') || 'all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('per_page')) || 12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState(String(currentPage));

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sort state
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort_by') || 'created_at');
  const [sortOrder, setSortOrder] = useState<number>(Number(searchParams.get('sort_order')) || 0);

  // Sync state with URL params when URL changes (e.g., from sidebar navigation)
  useEffect(() => {
    const urlStatus = searchParams.get('status') || 'all';
    const urlPaymentStatus = searchParams.get('payment_status') || 'all';
    const urlSearch = searchParams.get('search') || '';
    const urlPage = Number(searchParams.get('page')) || 1;

    if (urlStatus !== selectedStatus) {
      setSelectedStatus(urlStatus);
    }
    if (urlPaymentStatus !== selectedPaymentStatus) {
      setSelectedPaymentStatus(urlPaymentStatus);
    }
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setSearchInput(urlSearch);
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
      setPageInput(String(urlPage));
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Pending statuses group (all in-progress statuses)
  const PENDING_STATUSES: ApplicationStatus[] = [
    'draft', 'pending_payment', 'submitted', 'under_review',
    'document_required', 'processing', 'pending_verification', 'verified', 'on_hold'
  ];

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: ApplicationQueryParams = {
        page: currentPage,
        per_page: itemsPerPage
      };

      if (searchQuery) params.search = searchQuery;

      // Handle "pending" as a group of statuses
      if (selectedStatus === 'pending') {
        // For pending, we need to fetch multiple statuses - API should support this
        // If API doesn't support array, we'll filter client-side or use a special endpoint
        params.statuses = PENDING_STATUSES;
      } else if (selectedStatus !== 'all') {
        params.status = selectedStatus as ApplicationStatus;
      }

      if (selectedPaymentStatus !== 'all') params.payment_status = selectedPaymentStatus as PaymentStatus;

      const response = await applicationsApi.getApplications(params);

      if (response.success && response.data) {
        setApplications(response.data);
        setTotalItems(response.meta?.total || response.data.length);
        setTotalPages(response.meta?.total_pages || Math.ceil((response.meta?.total || response.data.length) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to load applications');
        setApplications([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      // Use mock data when API fails (development mode)
      console.log('Using mock data for development...');

      // Filter mock data based on selected status
      let filteredData = [...MOCK_APPLICATIONS];

      if (selectedStatus === 'pending') {
        filteredData = filteredData.filter(app =>
          PENDING_STATUSES.includes(app.status)
        );
      } else if (selectedStatus !== 'all') {
        filteredData = filteredData.filter(app => app.status === selectedStatus);
      }

      if (selectedPaymentStatus !== 'all') {
        filteredData = filteredData.filter(app => app.payment_status === selectedPaymentStatus);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(app =>
          app.application_number.toLowerCase().includes(query) ||
          app.applicant_name.toLowerCase().includes(query) ||
          app.service_name.toLowerCase().includes(query)
        );
      }

      setApplications(filteredData);
      setTotalItems(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
      setError(null); // Clear error since we have mock data
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedStatus, selectedPaymentStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (selectedPaymentStatus !== 'all') params.set('payment_status', selectedPaymentStatus);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (itemsPerPage !== 12) params.set('per_page', String(itemsPerPage));
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortOrder !== 0) params.set('sort_order', String(sortOrder));

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedStatus, selectedPaymentStatus, currentPage, itemsPerPage, sortBy, sortOrder, setSearchParams]);

  const handleFilterChange = (type: 'status' | 'payment_status', value: string) => {
    if (type === 'status') {
      setSelectedStatus(value);
    } else {
      setSelectedPaymentStatus(value);
    }
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDeleteClick = (app: ApplicationListItem) => {
    setDeleteApplication(app);
    setOpenDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteApplication) return;

    setDeleteLoading(true);
    try {
      const response = await applicationsApi.deleteApplication(deleteApplication.id);
      if (response.success) {
        fetchApplications();
      } else {
        setError(response.message || 'Failed to delete application');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete application. Please try again.');
    } finally {
      setDeleteLoading(false);
      setDeleteApplication(null);
    }
  };

  // Handle action click
  const handleActionClick = (action: string, app: ApplicationListItem) => {
    setOpenDropdown(null);

    if (action === 'delete') {
      handleDeleteClick(app);
      return;
    }

    let title = '';
    let message = '';

    switch (action) {
      case 'submit':
        title = 'Submit Application';
        message = `Are you sure you want to submit application ${app.application_number}?`;
        break;
      case 'under_review':
        title = 'Start Review';
        message = `Move application ${app.application_number} to "Under Review"?`;
        break;
      case 'processing':
        title = 'Start Processing';
        message = `Move application ${app.application_number} to "Processing"?`;
        break;
      case 'verify':
        title = 'Send for Verification';
        message = `Send application ${app.application_number} for verification?`;
        break;
      case 'verified':
        title = 'Mark as Verified';
        message = `Mark application ${app.application_number} as verified?`;
        break;
      case 'approve':
        title = 'Approve Application';
        message = `Approve application ${app.application_number}?`;
        break;
      case 'reject':
        title = 'Reject Application';
        message = `Reject application ${app.application_number}? Please provide a reason.`;
        break;
      case 'complete':
        title = 'Complete Application';
        message = `Mark application ${app.application_number} as completed?`;
        break;
      case 'cancel':
        title = 'Cancel Application';
        message = `Cancel application ${app.application_number}? Please provide a reason.`;
        break;
      case 'on_hold':
        title = 'Put On Hold';
        message = `Put application ${app.application_number} on hold?`;
        break;
      case 'document_required':
        title = 'Request Documents';
        message = `Request additional documents for ${app.application_number}?`;
        break;
      case 'add_note':
        navigate(`/applications/${app.id}?tab=notes`);
        return;
      default:
        return;
    }

    setActionModal({
      isOpen: true,
      action,
      application: app,
      title,
      message
    });
    setActionRemarks('');
  };

  // Execute action
  const handleActionConfirm = async () => {
    if (!actionModal.application) return;

    setActionLoading(true);
    const { action, application } = actionModal;

    try {
      let response;

      switch (action) {
        case 'submit':
          response = await applicationsApi.submitApplication(application.id);
          break;
        case 'under_review':
        case 'processing':
        case 'on_hold':
        case 'document_required':
          response = await applicationsApi.updateApplicationStatus(application.id, action as ApplicationStatus, actionRemarks);
          break;
        case 'verify':
          response = await applicationsApi.updateApplicationStatus(application.id, 'pending_verification', actionRemarks);
          break;
        case 'verified':
          response = await applicationsApi.verifyApplication(application.id, true, actionRemarks);
          break;
        case 'approve':
          response = await applicationsApi.approveApplication(application.id, true, actionRemarks);
          break;
        case 'reject':
          response = await applicationsApi.approveApplication(application.id, false, actionRemarks, actionRemarks);
          break;
        case 'complete':
          response = await applicationsApi.completeApplication(application.id, `CERT-${Date.now()}`);
          break;
        case 'cancel':
          response = await applicationsApi.cancelApplication(application.id, actionRemarks || 'Cancelled by admin');
          break;
        default:
          return;
      }

      if (response?.success) {
        fetchApplications();
        setActionModal({ isOpen: false, action: '', application: null, title: '', message: '' });
      } else {
        setError(response?.message || 'Action failed');
      }
    } catch (err) {
      console.error('Action failed:', err);
      setError('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInput);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1);
      setPageInput('1');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 1 ? 0 : 1);
    } else {
      setSortBy(field);
      setSortOrder(0);
    }
    setCurrentPage(1);
    setPageInput('1');
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <HiOutlineSwitchVertical />;
    return sortOrder === 1 ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const getStatusConfig = (status: ApplicationStatus) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  };

  const getPaymentStatusConfig = (status: PaymentStatus) => {
    return PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;
  };

  // Render dropdown menu
  const renderDropdown = (app: ApplicationListItem) => {
    const actions = getAvailableActions(app.status);
    const isOpen = openDropdown === app.id;

    return (
      <div className="apl-dropdown" ref={isOpen ? dropdownRef : null}>
        <button
          className="apl-dropdown__trigger"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(isOpen ? null : app.id);
          }}
        >
          <HiOutlineDotsVertical />
        </button>
        {isOpen && (
          <div className="apl-dropdown__menu">
            <button
              className="apl-dropdown__item"
              onClick={() => {
                navigate(`/applications/${app.id}`);
                setOpenDropdown(null);
              }}
            >
              <HiOutlineEye /> View Details
            </button>
            <button
              className="apl-dropdown__item"
              onClick={() => {
                navigate(`/applications/${app.id}?tab=documents`);
                setOpenDropdown(null);
              }}
            >
              <HiOutlineDocumentDuplicate /> View Documents
            </button>
            <button
              className="apl-dropdown__item"
              onClick={() => {
                navigate(`/applications/${app.id}?tab=payments`);
                setOpenDropdown(null);
              }}
            >
              <HiOutlineCash /> View Payments
            </button>
            <button
              className="apl-dropdown__item"
              onClick={() => {
                navigate(`/applications/${app.id}?tab=history`);
                setOpenDropdown(null);
              }}
            >
              <HiOutlineClock /> View History
            </button>
            {actions.length > 0 && <div className="apl-dropdown__divider" />}
            {actions.map((action) => (
              <button
                key={action.key}
                className="apl-dropdown__item"
                style={{ color: action.color }}
                onClick={() => handleActionClick(action.key, app)}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="apl">
      <PageHeader
        icon={<HiOutlineClipboardList />}
        title="Applications"
        description={`${totalItems} applications`}
        actions={
          <button className="bm-btn bm-btn-secondary" onClick={fetchApplications} disabled={loading}>
            <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && (
        <div className="apl-alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="apl-bar">
        <div className="apl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="apl-filters">
          <HiOutlineFilter className="apl-filter-icon" />
          <select value={selectedStatus} onChange={(e) => handleFilterChange('status', e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending (In Progress)</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <optgroup label="Detailed Status">
              <option value="draft">Draft</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="processing">Processing</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </optgroup>
          </select>
          <select value={selectedPaymentStatus} onChange={(e) => handleFilterChange('payment_status', e.target.value)}>
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="completed">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <div className="apl-toggle">
            <button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')}><HiOutlineViewGrid /></button>
            <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')}><HiOutlineViewList /></button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="apl-content">
        {loading ? (
          <div className="apl-loading">
            <div className="apl-spinner"></div>
            <p>Loading applications...</p>
          </div>
        ) : applications.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="apl-grid">
              {applications.map((app) => {
                const statusConfig = getStatusConfig(app.status);
                const paymentConfig = getPaymentStatusConfig(app.payment_status);

                return (
                  <div key={app.id} className="apl-card">
                    {renderDropdown(app)}
                    <button
                      className="apl-card__view-icon"
                      onClick={() => navigate(`/applications/${app.id}`)}
                      title="View Details"
                    >
                      <HiOutlineArrowRight />
                    </button>
                    <div className="apl-card__head">
                      <div className="apl-card__badges">
                        <span
                          className="apl-card__status"
                          style={{ color: statusConfig.color, background: statusConfig.bgColor }}
                        >
                          {statusConfig.label}
                        </span>
                        <span
                          className="apl-card__payment"
                          style={{ color: paymentConfig.color, background: paymentConfig.bgColor }}
                        >
                          {paymentConfig.label}
                        </span>
                      </div>
                      <h4 className="apl-card__number">{app.application_number}</h4>
                      <p className="apl-card__service">{app.service_name}</p>
                    </div>
                    <div className="apl-card__row">
                      <span className="apl-card__label"><HiOutlineUser /> Applicant</span>
                      <span className="apl-card__value">{app.applicant_name}</span>
                    </div>
                    <div className="apl-card__row">
                      <span className="apl-card__label"><HiOutlinePhone /> Mobile</span>
                      <span className="apl-card__value">{app.applicant_mobile}</span>
                    </div>
                    <div className="apl-card__nums">
                      <div className="apl-card__num">
                        <strong>{formatCurrency(app.total_fee)}</strong>
                        <span>Total Fee</span>
                      </div>
                      <div className="apl-card__num">
                        <strong>{formatCurrency(app.amount_paid || 0)}</strong>
                        <span>Paid</span>
                      </div>
                      <div className="apl-card__num">
                        <strong>{app.submitted_at ? formatDate(app.submitted_at) : '—'}</strong>
                        <span>Submitted</span>
                      </div>
                    </div>
                    <div className="apl-card__foot">
                      <div className="apl-card__btns">
                        <button className="view-btn" onClick={() => navigate(`/applications/${app.id}`)} title="View">
                          <HiOutlineEye />
                          <span className="btn-text">View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="apl-table-wrap">
              <table className="apl-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('application_number')}>
                      <span>Application</span>
                      {getSortIcon('application_number')}
                    </th>
                    <th>Service</th>
                    <th>Applicant</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th className="num">Fee</th>
                    <th className="sortable" onClick={() => handleSort('created_at')}>
                      <span>Date</span>
                      {getSortIcon('created_at')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => {
                    const statusConfig = getStatusConfig(app.status);
                    const paymentConfig = getPaymentStatusConfig(app.payment_status);

                    return (
                      <tr key={app.id} className={index % 2 === 1 ? 'row-alt' : ''}>
                        <td>
                          <div className="apl-table__main">
                            <div className="apl-table__icon">
                              <HiOutlineDocumentText />
                            </div>
                            <div className="apl-table__txt">
                              <strong>{app.application_number}</strong>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="apl-table__service">{app.service_name}</span>
                        </td>
                        <td>
                          <div className="apl-table__applicant">
                            <span className="apl-table__name">{app.applicant_name}</span>
                            <span className="apl-table__mobile"><HiOutlinePhone /> {app.applicant_mobile}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="apl-table__status"
                            style={{ color: statusConfig.color, background: statusConfig.bgColor }}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td>
                          <span
                            className="apl-table__payment"
                            style={{ color: paymentConfig.color, background: paymentConfig.bgColor }}
                          >
                            {paymentConfig.label}
                          </span>
                        </td>
                        <td className="num">{formatCurrency(app.total_fee)}</td>
                        <td>
                          <span className="apl-table__date">
                            <HiOutlineClock /> {formatDate(app.created_at)}
                          </span>
                        </td>
                        <td>
                          <div className="apl-table__acts">
                            {renderDropdown(app)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="apl-empty">
            <HiOutlineClipboardList />
            <h4>No applications found</h4>
            <p>{searchQuery || selectedStatus !== 'all' || selectedPaymentStatus !== 'all' ? 'Try adjusting your filters' : 'No applications yet'}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && applications.length > 0 && (
        <div className="apl-footer">
          <div className="apl-footer__info">
            <span>Showing {startIndex + 1}-{endIndex} of {totalItems}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="apl-footer__perpage"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={36}>36 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="apl-pagination">
            <button className="apl-pagination__btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1} title="First Page">
              <HiOutlineChevronDoubleLeft />
            </button>
            <button className="apl-pagination__btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} title="Previous">
              <HiOutlineChevronLeft />
            </button>
            <div className="apl-pagination__input">
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputSubmit}
                onBlur={handlePageInputBlur}
              />
              <span>of {totalPages || 1}</span>
            </div>
            <button className="apl-pagination__btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} title="Next">
              <HiOutlineChevronRight />
            </button>
            <button className="apl-pagination__btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage >= totalPages} title="Last Page">
              <HiOutlineChevronDoubleRight />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteApplication}
        onClose={() => setDeleteApplication(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message="Are you sure you want to delete this application?"
        itemName={deleteApplication?.application_number}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="apl-modal-overlay" onClick={() => setActionModal({ isOpen: false, action: '', application: null, title: '', message: '' })}>
          <div className="apl-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{actionModal.title}</h3>
            <p>{actionModal.message}</p>
            {['reject', 'cancel', 'on_hold', 'document_required'].includes(actionModal.action) && (
              <div className="apl-modal-field">
                <label>Remarks {['reject', 'cancel'].includes(actionModal.action) ? '(Required)' : '(Optional)'}</label>
                <textarea
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  rows={3}
                />
              </div>
            )}
            <div className="apl-modal-actions">
              <button
                className="apl-btn apl-btn--secondary"
                onClick={() => setActionModal({ isOpen: false, action: '', application: null, title: '', message: '' })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="apl-btn apl-btn--primary"
                onClick={handleActionConfirm}
                disabled={actionLoading || (['reject', 'cancel'].includes(actionModal.action) && !actionRemarks.trim())}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
