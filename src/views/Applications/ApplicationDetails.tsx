import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineIdentification,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChatAlt,
  HiOutlineDocumentDuplicate,
  HiOutlineCash,
  HiOutlineFlag,
  HiOutlineDotsVertical,
  HiOutlineClipboardCheck,
  HiOutlineTrash,
  HiOutlineBan,
  HiOutlinePause,
  HiOutlinePlay
} from 'react-icons/hi';
import applicationsApi from '../../services/api/applications.api';
import type {
  Application,
  ApplicationDocument,
  ApplicationNote,
  ApplicationPayment,
  ApplicationStatusHistory,
  ApplicationStatus,
  PaymentStatus
} from '../../types/api.types';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import './ApplicationDetails.scss';

// Status configuration
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

// Get available actions based on status
const getAvailableActions = (status: ApplicationStatus) => {
  const actions: { key: string; label: string; icon: React.ReactNode; color?: string }[] = [];

  switch (status) {
    case 'draft':
      actions.push({ key: 'submit', label: 'Submit Application', icon: <HiOutlinePlay />, color: '#3b82f6' });
      actions.push({ key: 'delete', label: 'Delete Application', icon: <HiOutlineTrash />, color: '#ef4444' });
      break;
    case 'submitted':
      actions.push({ key: 'under_review', label: 'Start Review', icon: <HiOutlineClipboardCheck />, color: '#8b5cf6' });
      actions.push({ key: 'document_required', label: 'Request Documents', icon: <HiOutlineDocumentDuplicate />, color: '#f97316' });
      actions.push({ key: 'cancel', label: 'Cancel Application', icon: <HiOutlineBan />, color: '#6b7280' });
      break;
    case 'under_review':
      actions.push({ key: 'processing', label: 'Start Processing', icon: <HiOutlinePlay />, color: '#0ea5e9' });
      actions.push({ key: 'document_required', label: 'Request Documents', icon: <HiOutlineDocumentDuplicate />, color: '#f97316' });
      actions.push({ key: 'on_hold', label: 'Put On Hold', icon: <HiOutlinePause />, color: '#eab308' });
      break;
    case 'document_required':
      actions.push({ key: 'under_review', label: 'Resume Review', icon: <HiOutlineClipboardCheck />, color: '#8b5cf6' });
      actions.push({ key: 'cancel', label: 'Cancel Application', icon: <HiOutlineBan />, color: '#6b7280' });
      break;
    case 'processing':
      actions.push({ key: 'verify', label: 'Send for Verification', icon: <HiOutlineClipboardCheck />, color: '#a855f7' });
      actions.push({ key: 'on_hold', label: 'Put On Hold', icon: <HiOutlinePause />, color: '#eab308' });
      break;
    case 'pending_verification':
      actions.push({ key: 'verified', label: 'Mark as Verified', icon: <HiOutlineCheckCircle />, color: '#22c55e' });
      actions.push({ key: 'document_required', label: 'Request Documents', icon: <HiOutlineDocumentDuplicate />, color: '#f97316' });
      break;
    case 'verified':
      actions.push({ key: 'approve', label: 'Approve Application', icon: <HiOutlineCheckCircle />, color: '#10b981' });
      actions.push({ key: 'reject', label: 'Reject Application', icon: <HiOutlineXCircle />, color: '#ef4444' });
      break;
    case 'approved':
      actions.push({ key: 'complete', label: 'Mark as Complete', icon: <HiOutlineCheckCircle />, color: '#059669' });
      break;
    case 'on_hold':
      actions.push({ key: 'processing', label: 'Resume Processing', icon: <HiOutlinePlay />, color: '#0ea5e9' });
      actions.push({ key: 'cancel', label: 'Cancel Application', icon: <HiOutlineBan />, color: '#6b7280' });
      break;
  }

  return actions;
};

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data states
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [payments, setPayments] = useState<ApplicationPayment[]>([]);
  const [history, setHistory] = useState<ApplicationStatusHistory[]>([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'notes' | 'payments' | 'history'>('details');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: string;
    title: string;
    message: string;
  }>({ isOpen: false, action: '', title: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionRemarks, setActionRemarks] = useState('');

  // Status update modal (legacy - keeping for backwards compatibility)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await applicationsApi.getApplicationById(id);
        if (response.success && response.data) {
          setApplication(response.data);

          // Fetch related data in parallel
          const [docsRes, notesRes, paymentsRes, historyRes] = await Promise.allSettled([
            applicationsApi.getApplicationDocuments(id),
            applicationsApi.getApplicationNotes(id),
            applicationsApi.getApplicationPayments(id),
            applicationsApi.getApplicationHistory(id)
          ]);

          if (docsRes.status === 'fulfilled' && docsRes.value.success) {
            setDocuments(docsRes.value.data || []);
          }
          if (notesRes.status === 'fulfilled' && notesRes.value.success) {
            setNotes(notesRes.value.data || []);
          }
          if (paymentsRes.status === 'fulfilled' && paymentsRes.value.success) {
            setPayments(paymentsRes.value.data || []);
          }
          if (historyRes.status === 'fulfilled' && historyRes.value.success) {
            setHistory(historyRes.value.data || []);
          }
        } else {
          setError(response.message || 'Application not found');
        }
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      const response = await applicationsApi.deleteApplication(id);
      if (response.success) {
        navigate('/applications');
      } else {
        setError(response.message || 'Failed to delete application');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete application');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return;
    setStatusLoading(true);
    try {
      const response = await applicationsApi.updateApplicationStatus(id, newStatus, statusRemarks);
      if (response.success) {
        // Refresh data
        const appRes = await applicationsApi.getApplicationById(id);
        if (appRes.success && appRes.data) {
          setApplication(appRes.data);
        }
        const histRes = await applicationsApi.getApplicationHistory(id);
        if (histRes.success && histRes.data) {
          setHistory(histRes.data);
        }
        setStatusModalOpen(false);
        setNewStatus('');
        setStatusRemarks('');
      } else {
        setError(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle action click from dropdown
  const handleActionClick = (action: string) => {
    setDropdownOpen(false);

    if (action === 'delete') {
      setDeleteOpen(true);
      return;
    }

    let title = '';
    let message = '';

    switch (action) {
      case 'submit':
        title = 'Submit Application';
        message = `Are you sure you want to submit application ${application?.application_number}?`;
        break;
      case 'under_review':
        title = 'Start Review';
        message = `Move application ${application?.application_number} to "Under Review"?`;
        break;
      case 'processing':
        title = 'Start Processing';
        message = `Move application ${application?.application_number} to "Processing"?`;
        break;
      case 'verify':
        title = 'Send for Verification';
        message = `Send application ${application?.application_number} for verification?`;
        break;
      case 'verified':
        title = 'Mark as Verified';
        message = `Mark application ${application?.application_number} as verified?`;
        break;
      case 'approve':
        title = 'Approve Application';
        message = `Approve application ${application?.application_number}?`;
        break;
      case 'reject':
        title = 'Reject Application';
        message = `Reject application ${application?.application_number}? Please provide a reason.`;
        break;
      case 'complete':
        title = 'Complete Application';
        message = `Mark application ${application?.application_number} as completed?`;
        break;
      case 'cancel':
        title = 'Cancel Application';
        message = `Cancel application ${application?.application_number}? Please provide a reason.`;
        break;
      case 'on_hold':
        title = 'Put On Hold';
        message = `Put application ${application?.application_number} on hold?`;
        break;
      case 'document_required':
        title = 'Request Documents';
        message = `Request additional documents for ${application?.application_number}?`;
        break;
      default:
        return;
    }

    setActionModal({ isOpen: true, action, title, message });
    setActionRemarks('');
  };

  // Execute action
  const handleActionConfirm = async () => {
    if (!id || !application) return;

    setActionLoading(true);
    const { action } = actionModal;

    try {
      let response;

      switch (action) {
        case 'submit':
          response = await applicationsApi.submitApplication(id);
          break;
        case 'under_review':
        case 'processing':
        case 'on_hold':
        case 'document_required':
          response = await applicationsApi.updateApplicationStatus(id, action as ApplicationStatus, actionRemarks);
          break;
        case 'verify':
          response = await applicationsApi.updateApplicationStatus(id, 'pending_verification', actionRemarks);
          break;
        case 'verified':
          response = await applicationsApi.verifyApplication(id, true, actionRemarks);
          break;
        case 'approve':
          response = await applicationsApi.approveApplication(id, true, actionRemarks);
          break;
        case 'reject':
          response = await applicationsApi.approveApplication(id, false, actionRemarks, actionRemarks);
          break;
        case 'complete':
          response = await applicationsApi.completeApplication(id, `CERT-${Date.now()}`);
          break;
        case 'cancel':
          response = await applicationsApi.cancelApplication(id, actionRemarks || 'Cancelled by admin');
          break;
        default:
          return;
      }

      if (response?.success) {
        // Refresh application data
        const appRes = await applicationsApi.getApplicationById(id);
        if (appRes.success && appRes.data) {
          setApplication(appRes.data);
        }
        const histRes = await applicationsApi.getApplicationHistory(id);
        if (histRes.success && histRes.data) {
          setHistory(histRes.data);
        }
        setActionModal({ isOpen: false, action: '', title: '', message: '' });
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

  // Refresh application data
  const refreshData = async () => {
    if (!id) return;
    try {
      const appRes = await applicationsApi.getApplicationById(id);
      if (appRes.success && appRes.data) {
        setApplication(appRes.data);
      }
      const histRes = await applicationsApi.getApplicationHistory(id);
      if (histRes.success && histRes.data) {
        setHistory(histRes.data);
      }
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusConfig = (status: ApplicationStatus) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  };

  const getPaymentStatusConfig = (status: PaymentStatus) => {
    return PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;
  };

  if (loading) {
    return (
      <div className="apd">
        <div className="apd-loading">
          <div className="apd-loading-spinner"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="apd">
        <div className="apd-error">
          <div className="apd-error-icon">
            <HiOutlineExclamation />
          </div>
          <h3>Application Not Found</h3>
          <p>{error || 'The requested application could not be found.'}</p>
          <button className="apd-btn apd-btn--primary" onClick={() => navigate('/applications')}>
            <HiOutlineArrowLeft />
            <span>Back to Applications</span>
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(application.status);
  const paymentConfig = getPaymentStatusConfig(application.payment_status);

  return (
    <div className="apd">
      {/* Hero Section */}
      <div className="apd-hero">
        <button className="apd-back" onClick={() => navigate('/applications')}>
          <HiOutlineArrowLeft />
        </button>

        <div className="apd-hero-content">
          <div className="apd-hero-icon">
            <HiOutlineClipboardList />
          </div>
          <div className="apd-hero-text">
            <div className="apd-hero-badges">
              <span
                className="apd-badge"
                style={{ color: statusConfig.color, background: statusConfig.bgColor }}
              >
                {statusConfig.label}
              </span>
              <span
                className="apd-badge"
                style={{ color: paymentConfig.color, background: paymentConfig.bgColor }}
              >
                {paymentConfig.label}
              </span>
              {application.is_urgent && (
                <span className="apd-badge apd-badge--urgent">
                  <HiOutlineFlag /> Urgent
                </span>
              )}
            </div>
            <h1>{application.application_number}</h1>
            <p className="apd-hero-service">{application.service_name}</p>
          </div>
        </div>

        <div className="apd-hero-actions">
          {/* Actions Dropdown */}
          {getAvailableActions(application.status).length > 0 && (
            <div className="apd-dropdown" ref={dropdownRef}>
              <button
                className="apd-btn apd-btn--primary"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <HiOutlineDotsVertical />
                <span>Actions</span>
              </button>
              {dropdownOpen && (
                <div className="apd-dropdown__menu">
                  {getAvailableActions(application.status).map((action) => (
                    <button
                      key={action.key}
                      className="apd-dropdown__item"
                      style={{ color: action.color }}
                      onClick={() => handleActionClick(action.key)}
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            className="apd-btn apd-btn--secondary"
            onClick={() => setStatusModalOpen(true)}
          >
            <HiOutlineClipboardCheck />
            <span>Change Status</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="apd-stats">
        <div className="apd-stat">
          <div className="apd-stat-icon">
            <HiOutlineUser />
          </div>
          <div className="apd-stat-content">
            <span className="apd-stat-value">{application.applicant_name}</span>
            <span className="apd-stat-label">Applicant</span>
          </div>
        </div>
        <div className="apd-stat">
          <div className="apd-stat-icon">
            <HiOutlinePhone />
          </div>
          <div className="apd-stat-content">
            <span className="apd-stat-value">{application.applicant_mobile}</span>
            <span className="apd-stat-label">Mobile</span>
          </div>
        </div>
        <div className="apd-stat">
          <div className="apd-stat-icon">
            <HiOutlineCurrencyRupee />
          </div>
          <div className="apd-stat-content">
            <span className="apd-stat-value">{formatCurrency(application.total_fee)}</span>
            <span className="apd-stat-label">Total Fee</span>
          </div>
        </div>
        <div className="apd-stat">
          <div className="apd-stat-icon">
            <HiOutlineClock />
          </div>
          <div className="apd-stat-content">
            <span className="apd-stat-value">{application.service_processing_time || '-'}</span>
            <span className="apd-stat-label">Processing Time</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="apd-tabs">
        <button
          className={`apd-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <HiOutlineUser /> Details
        </button>
        <button
          className={`apd-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <HiOutlineDocumentDuplicate /> Documents ({documents.length})
        </button>
        <button
          className={`apd-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <HiOutlineChatAlt /> Notes ({notes.length})
        </button>
        <button
          className={`apd-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <HiOutlineCash /> Payments ({payments.length})
        </button>
        <button
          className={`apd-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <HiOutlineClock /> History ({history.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="apd-content">
        {activeTab === 'details' && (
          <div className="apd-details">
            {/* Applicant Information */}
            <div className="apd-section">
              <h2 className="apd-section-title">
                <HiOutlineUser /> Applicant Information
              </h2>
              <div className="apd-grid">
                <div className="apd-field">
                  <span className="apd-field-label">Full Name</span>
                  <span className="apd-field-value">{application.applicant_name}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Mobile</span>
                  <span className="apd-field-value">{application.applicant_mobile}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Email</span>
                  <span className="apd-field-value">{application.applicant_email || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Father's Name</span>
                  <span className="apd-field-value">{application.applicant_father_name || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Mother's Name</span>
                  <span className="apd-field-value">{application.applicant_mother_name || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Date of Birth</span>
                  <span className="apd-field-value">{application.applicant_dob || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Gender</span>
                  <span className="apd-field-value">{application.applicant_gender || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Religion</span>
                  <span className="apd-field-value">{application.applicant_religion || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Caste Category</span>
                  <span className="apd-field-value">{application.applicant_caste_category || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Occupation</span>
                  <span className="apd-field-value">{application.applicant_occupation || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Annual Income</span>
                  <span className="apd-field-value">{formatCurrency(application.applicant_annual_income)}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Marital Status</span>
                  <span className="apd-field-value">{application.applicant_marital_status || '-'}</span>
                </div>
              </div>
            </div>

            {/* Identity Documents */}
            <div className="apd-section">
              <h2 className="apd-section-title">
                <HiOutlineIdentification /> Identity Information
              </h2>
              <div className="apd-grid">
                <div className="apd-field">
                  <span className="apd-field-label">Aadhaar (Last 4)</span>
                  <span className="apd-field-value">{application.applicant_aadhaar_last4 ? `XXXX-XXXX-${application.applicant_aadhaar_last4}` : '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">PAN Number</span>
                  <span className="apd-field-value">{application.applicant_pan_number || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Voter ID</span>
                  <span className="apd-field-value">{application.applicant_voter_id || '-'}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Driving License</span>
                  <span className="apd-field-value">{application.applicant_driving_license || '-'}</span>
                </div>
              </div>
            </div>

            {/* Document Address */}
            <div className="apd-section">
              <h2 className="apd-section-title">
                <HiOutlineLocationMarker /> Document Address
              </h2>
              <div className="apd-grid">
                <div className="apd-field apd-field--full">
                  <span className="apd-field-label">Address</span>
                  <span className="apd-field-value">
                    {[
                      application.doc_address_line1,
                      application.doc_address_line2,
                      application.doc_address_landmark,
                      application.doc_address_village,
                      application.doc_address_taluk,
                      application.doc_address_district,
                      application.doc_address_state_name,
                      application.doc_address_pincode
                    ].filter(Boolean).join(', ') || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Address */}
            {!application.is_address_same_as_document && application.curr_address_line1 && (
              <div className="apd-section">
                <h2 className="apd-section-title">
                  <HiOutlineLocationMarker /> Current Address
                </h2>
                <div className="apd-grid">
                  <div className="apd-field apd-field--full">
                    <span className="apd-field-label">Address</span>
                    <span className="apd-field-value">
                      {[
                        application.curr_address_line1,
                        application.curr_address_line2,
                        application.curr_address_landmark,
                        application.curr_address_village,
                        application.curr_address_taluk,
                        application.curr_address_district,
                        application.curr_address_state_name,
                        application.curr_address_pincode
                      ].filter(Boolean).join(', ') || '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="apd-section">
              <h2 className="apd-section-title">
                <HiOutlineCurrencyRupee /> Payment Information
              </h2>
              <div className="apd-grid">
                <div className="apd-field">
                  <span className="apd-field-label">Service Fee</span>
                  <span className="apd-field-value">{formatCurrency(application.service_fee)}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Platform Fee</span>
                  <span className="apd-field-value">{formatCurrency(application.platform_fee)}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Total Fee</span>
                  <span className="apd-field-value apd-field-value--highlight">{formatCurrency(application.total_fee)}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Amount Paid</span>
                  <span className="apd-field-value">{formatCurrency(application.amount_paid)}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Payment Status</span>
                  <span
                    className="apd-field-badge"
                    style={{ color: paymentConfig.color, background: paymentConfig.bgColor }}
                  >
                    {paymentConfig.label}
                  </span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Payment Method</span>
                  <span className="apd-field-value">{application.payment_method || '-'}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="apd-section">
              <h2 className="apd-section-title">
                <HiOutlineCalendar /> Timeline
              </h2>
              <div className="apd-grid">
                <div className="apd-field">
                  <span className="apd-field-label">Created</span>
                  <span className="apd-field-value">{formatDate(application.created_at)}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Submitted</span>
                  <span className="apd-field-value">{formatDate(application.submitted_at)}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Last Updated</span>
                  <span className="apd-field-value">{formatDate(application.updated_at)}</span>
                </div>
                <div className="apd-field">
                  <span className="apd-field-label">Est. Completion</span>
                  <span className="apd-field-value">{formatDate(application.estimated_completion_date)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="apd-documents">
            {documents.length > 0 ? (
              <div className="apd-doc-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="apd-doc-item">
                    <div className="apd-doc-icon">
                      <HiOutlineDocumentText />
                    </div>
                    <div className="apd-doc-info">
                      <h4>{doc.document_name}</h4>
                      <p>{doc.document_type} {doc.document_number && `- ${doc.document_number}`}</p>
                    </div>
                    <div className={`apd-doc-status apd-doc-status--${doc.verification_status}`}>
                      {doc.verification_status === 'verified' && <HiOutlineCheckCircle />}
                      {doc.verification_status === 'rejected' && <HiOutlineXCircle />}
                      {doc.verification_status === 'pending' && <HiOutlineClock />}
                      {doc.verification_status}
                    </div>
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="apd-doc-view">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="apd-empty">
                <HiOutlineDocumentDuplicate />
                <p>No documents uploaded</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="apd-notes">
            {notes.length > 0 ? (
              <div className="apd-note-list">
                {notes.map((note) => (
                  <div key={note.id} className={`apd-note-item ${note.is_private ? 'private' : ''}`}>
                    <div className="apd-note-header">
                      <span className="apd-note-type">{note.note_type}</span>
                      <span className="apd-note-by">{note.created_by_name}</span>
                      <span className="apd-note-date">{formatDate(note.created_at)}</span>
                    </div>
                    <p className="apd-note-text">{note.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="apd-empty">
                <HiOutlineChatAlt />
                <p>No notes added</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="apd-payments">
            {payments.length > 0 ? (
              <div className="apd-payment-list">
                {payments.map((payment) => (
                  <div key={payment.id} className="apd-payment-item">
                    <div className="apd-payment-icon">
                      <HiOutlineCash />
                    </div>
                    <div className="apd-payment-info">
                      <h4>{formatCurrency(payment.amount)}</h4>
                      <p>{payment.payment_method} via {payment.payment_gateway}</p>
                    </div>
                    <div className={`apd-payment-status apd-payment-status--${payment.status}`}>
                      {payment.status}
                    </div>
                    <span className="apd-payment-date">{formatDate(payment.paid_at || payment.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="apd-empty">
                <HiOutlineCash />
                <p>No payments recorded</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="apd-history">
            {history.length > 0 ? (
              <div className="apd-history-list">
                {history.map((item, index) => (
                  <div key={item.id} className="apd-history-item">
                    <div className="apd-history-line">
                      <div className="apd-history-dot"></div>
                      {index < history.length - 1 && <div className="apd-history-connector"></div>}
                    </div>
                    <div className="apd-history-content">
                      <div className="apd-history-header">
                        <span className="apd-history-from">{item.from_status || 'New'}</span>
                        <span className="apd-history-arrow">→</span>
                        <span className="apd-history-to">{item.to_status}</span>
                      </div>
                      {item.remarks && <p className="apd-history-remarks">{item.remarks}</p>}
                      <div className="apd-history-meta">
                        <span>{item.changed_by_name || 'System'}</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="apd-empty">
                <HiOutlineClock />
                <p>No status history</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        message="Are you sure you want to delete this application?"
        itemName={application.application_number}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="apd-modal-overlay" onClick={() => setStatusModalOpen(false)}>
          <div className="apd-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update Application Status</h3>
            <div className="apd-modal-form">
              <div className="apd-modal-field">
                <label>New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                >
                  <option value="">Select Status</option>
                  <option value="under_review">Under Review</option>
                  <option value="processing">Processing</option>
                  <option value="pending_verification">Pending Verification</option>
                  <option value="verified">Verified</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="apd-modal-field">
                <label>Remarks</label>
                <textarea
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Enter remarks (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="apd-modal-actions">
              <button className="apd-btn apd-btn--secondary" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </button>
              <button
                className="apd-btn apd-btn--primary"
                onClick={handleStatusUpdate}
                disabled={!newStatus || statusLoading}
              >
                {statusLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="apd-modal-overlay" onClick={() => setActionModal({ isOpen: false, action: '', title: '', message: '' })}>
          <div className="apd-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{actionModal.title}</h3>
            <p className="apd-modal-message">{actionModal.message}</p>
            {['reject', 'cancel', 'on_hold', 'document_required'].includes(actionModal.action) && (
              <div className="apd-modal-field">
                <label>Remarks {['reject', 'cancel'].includes(actionModal.action) ? '(Required)' : '(Optional)'}</label>
                <textarea
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  rows={3}
                />
              </div>
            )}
            <div className="apd-modal-actions">
              <button
                className="apd-btn apd-btn--secondary"
                onClick={() => setActionModal({ isOpen: false, action: '', title: '', message: '' })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="apd-btn apd-btn--primary"
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

export default ApplicationDetails;
