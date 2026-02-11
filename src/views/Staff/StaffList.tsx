import { useState, useMemo, useCallback } from 'react';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDotsVertical,
  HiOutlineUserGroup,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineBadgeCheck,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineX,
  HiOutlinePhone,
} from 'react-icons/hi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PageHeader } from '../../components/common/PageHeader';
import './StaffList.scss';

// ============================================
// TYPES
// ============================================
interface StaffMember {
  id: string;
  full_name: string;
  full_name_hindi?: string;
  email: string;
  mobile: string;
  role: 'admin' | 'supervisor' | 'officer' | 'clerk' | 'verifier';
  department: string;
  state_code: string;
  district?: string;
  status: 'active' | 'inactive' | 'on_leave';
  profile_photo_url?: string;
  cases_handled: number;
  cases_pending: number;
  avg_processing_time: number;
  success_rate: number;
  joined_at: string;
  last_active?: string;
}

const ROLES: { value: StaffMember['role']; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'officer', label: 'Officer' },
  { value: 'verifier', label: 'Verifier' },
  { value: 'clerk', label: 'Clerk' },
];

const DEPARTMENTS = [
  'Administration', 'Revenue', 'Civil Services', 'Document Verification',
  'Land Revenue', 'Records', 'Finance', 'IT', 'Public Relations', 'Legal',
];

const STATES = [
  { code: 'MH', name: 'Maharashtra' }, { code: 'KA', name: 'Karnataka' },
  { code: 'GJ', name: 'Gujarat' }, { code: 'TN', name: 'Tamil Nadu' },
  { code: 'UP', name: 'Uttar Pradesh' }, { code: 'RJ', name: 'Rajasthan' },
  { code: 'DL', name: 'Delhi' }, { code: 'WB', name: 'West Bengal' },
  { code: 'AP', name: 'Andhra Pradesh' }, { code: 'MP', name: 'Madhya Pradesh' },
];

// ============================================
// INITIAL DATA
// ============================================
const initialStaff: StaffMember[] = [
  { id: '1', full_name: 'Rajesh Kumar Singh', full_name_hindi: 'राजेश कुमार सिंह', email: 'rajesh.singh@bharatmithra.gov.in', mobile: '9876543210', role: 'supervisor', department: 'Revenue', state_code: 'MH', district: 'Mumbai', status: 'active', cases_handled: 1245, cases_pending: 23, avg_processing_time: 2.4, success_rate: 96.5, joined_at: '2023-06-15T00:00:00Z', last_active: '2 hours ago' },
  { id: '2', full_name: 'Priya Sharma', full_name_hindi: 'प्रिया शर्मा', email: 'priya.sharma@bharatmithra.gov.in', mobile: '9876543211', role: 'officer', department: 'Civil Services', state_code: 'KA', district: 'Bangalore', status: 'active', cases_handled: 856, cases_pending: 12, avg_processing_time: 1.8, success_rate: 98.2, joined_at: '2024-01-10T00:00:00Z', last_active: '30 minutes ago' },
  { id: '3', full_name: 'Amit Patel', full_name_hindi: 'अमित पटेल', email: 'amit.patel@bharatmithra.gov.in', mobile: '9876543212', role: 'admin', department: 'Administration', state_code: 'GJ', district: 'Ahmedabad', status: 'active', cases_handled: 2341, cases_pending: 0, avg_processing_time: 1.2, success_rate: 99.1, joined_at: '2022-03-20T00:00:00Z', last_active: '5 minutes ago' },
  { id: '4', full_name: 'Sneha Reddy', full_name_hindi: 'स्नेहा रेड्डी', email: 'sneha.reddy@bharatmithra.gov.in', mobile: '9876543213', role: 'verifier', department: 'Document Verification', state_code: 'TN', district: 'Chennai', status: 'on_leave', cases_handled: 567, cases_pending: 45, avg_processing_time: 2.1, success_rate: 94.8, joined_at: '2024-04-05T00:00:00Z', last_active: '2 days ago' },
  { id: '5', full_name: 'Vikram Singh Chauhan', full_name_hindi: 'विक्रम सिंह चौहान', email: 'vikram.chauhan@bharatmithra.gov.in', mobile: '9876543214', role: 'clerk', department: 'Records', state_code: 'UP', district: 'Lucknow', status: 'active', cases_handled: 432, cases_pending: 8, avg_processing_time: 3.2, success_rate: 91.5, joined_at: '2024-06-12T00:00:00Z', last_active: '1 hour ago' },
  { id: '6', full_name: 'Meera Joshi', full_name_hindi: 'मीरा जोशी', email: 'meera.joshi@bharatmithra.gov.in', mobile: '9876543215', role: 'officer', department: 'Land Revenue', state_code: 'RJ', district: 'Jaipur', status: 'active', cases_handled: 789, cases_pending: 15, avg_processing_time: 2.0, success_rate: 95.7, joined_at: '2023-11-08T00:00:00Z', last_active: '45 minutes ago' },
];

// ============================================
// COMPONENT
// ============================================
const StaffList = () => {
  const [staff, setStaff] = useLocalStorage<StaffMember[]>('bm-staff-members', initialStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [viewingMember, setViewingMember] = useState<StaffMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    full_name: '', full_name_hindi: '', email: '', mobile: '', role: 'officer' as StaffMember['role'],
    department: 'Administration', state_code: 'MH', district: '', status: 'active' as StaffMember['status'],
  });

  // Stats
  const stats = useMemo(() => ({
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    onLeave: staff.filter(s => s.status === 'on_leave').length,
    casesHandled: staff.reduce((a, b) => a + b.cases_handled, 0),
  }), [staff]);

  // Filtering
  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || member.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, searchQuery, selectedRole, selectedStatus]);

  // CRUD
  const resetForm = useCallback(() => {
    setFormData({ full_name: '', full_name_hindi: '', email: '', mobile: '', role: 'officer', department: 'Administration', state_code: 'MH', district: '', status: 'active' });
    setEditingMember(null);
  }, []);

  const openCreate = () => { resetForm(); setShowFormModal(true); };

  const openEdit = (member: StaffMember) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name, full_name_hindi: member.full_name_hindi || '', email: member.email,
      mobile: member.mobile, role: member.role, department: member.department, state_code: member.state_code,
      district: member.district || '', status: member.status,
    });
    setShowFormModal(true);
    setActiveDropdown(null);
  };

  const openView = (member: StaffMember) => { setViewingMember(member); setShowViewModal(true); };

  const handleSave = () => {
    if (!formData.full_name.trim() || !formData.email.trim()) return;
    if (editingMember) {
      setStaff(staff.map(s => s.id === editingMember.id ? {
        ...s, full_name: formData.full_name, full_name_hindi: formData.full_name_hindi || undefined,
        email: formData.email, mobile: formData.mobile, role: formData.role, department: formData.department,
        state_code: formData.state_code, district: formData.district || undefined, status: formData.status,
      } : s));
    } else {
      const newMember: StaffMember = {
        id: Date.now().toString(),
        full_name: formData.full_name,
        full_name_hindi: formData.full_name_hindi || undefined,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        department: formData.department,
        state_code: formData.state_code,
        district: formData.district || undefined,
        status: formData.status,
        cases_handled: 0,
        cases_pending: 0,
        avg_processing_time: 0,
        success_rate: 0,
        joined_at: new Date().toISOString(),
        last_active: 'Just now',
      };
      setStaff([newMember, ...staff]);
    }
    setShowFormModal(false);
    resetForm();
  };

  const confirmDelete = (member: StaffMember) => {
    setDeletingMember(member);
    setShowDeleteConfirm(true);
    setActiveDropdown(null);
  };

  const handleDelete = () => {
    if (!deletingMember) return;
    setStaff(staff.filter(s => s.id !== deletingMember.id));
    setShowDeleteConfirm(false);
    setDeletingMember(null);
  };

  // Helpers
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'supervisor': return 'warning';
      case 'officer': return 'primary';
      case 'verifier': return 'info';
      case 'clerk': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'on_leave': return 'warning';
      default: return 'secondary';
    }
  };

  const formatNumber = (num: number) => num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bm-staff">
      <PageHeader
        icon={<HiOutlineUserGroup />}
        title="Staff Management"
        description="Manage staff members, roles, and performance across all regions"
        actions={
          <button className="bm-btn bm-btn-primary" onClick={openCreate}>
            <HiOutlinePlus />
            <span>Add Staff Member</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="bm-staff-stats">
        <div className="bm-staff-stat">
          <div className="bm-staff-stat-icon bm-staff-stat-icon--primary"><HiOutlineUserGroup /></div>
          <div className="bm-staff-stat-content">
            <span className="bm-staff-stat-value">{stats.total}</span>
            <span className="bm-staff-stat-label">Total Staff</span>
          </div>
        </div>
        <div className="bm-staff-stat">
          <div className="bm-staff-stat-icon bm-staff-stat-icon--success"><HiOutlineBadgeCheck /></div>
          <div className="bm-staff-stat-content">
            <span className="bm-staff-stat-value">{stats.active}</span>
            <span className="bm-staff-stat-label">Active</span>
          </div>
        </div>
        <div className="bm-staff-stat">
          <div className="bm-staff-stat-icon bm-staff-stat-icon--warning"><HiOutlineClock /></div>
          <div className="bm-staff-stat-content">
            <span className="bm-staff-stat-value">{stats.onLeave}</span>
            <span className="bm-staff-stat-label">On Leave</span>
          </div>
        </div>
        <div className="bm-staff-stat">
          <div className="bm-staff-stat-icon bm-staff-stat-icon--info"><HiOutlineClipboardList /></div>
          <div className="bm-staff-stat-content">
            <span className="bm-staff-stat-value">{formatNumber(stats.casesHandled)}</span>
            <span className="bm-staff-stat-label">Cases Handled</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bm-staff-toolbar">
        <div className="bm-search-box">
          <HiOutlineSearch className="bm-search-icon" />
          <input type="text" placeholder="Search staff members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bm-search-input" />
        </div>
        <div className="bm-toolbar-actions">
          <div className="bm-filter-group">
            <HiOutlineFilter className="bm-filter-icon" />
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="bm-select">
              <option value="all">All Roles</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="bm-filter-group">
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="bm-select">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div className="bm-view-toggle">
            <button className={`bm-view-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')} title="Card View">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button className={`bm-view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="Table View">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Staff Cards View */}
      {viewMode === 'cards' && (
        <div className="bm-staff-grid">
          {filteredStaff.map(member => (
            <div key={member.id} className="bm-staff-card" onClick={() => openView(member)}>
              <div className="bm-staff-card-header">
                <div className="bm-staff-avatar">
                  {member.profile_photo_url ? <img src={member.profile_photo_url} alt={member.full_name} /> : getInitials(member.full_name)}
                  <span className={`bm-staff-status-dot bm-staff-status-dot--${getStatusColor(member.status)}`}></span>
                </div>
                <div className="bm-staff-actions-menu">
                  <button className="bm-icon-btn" onClick={e => { e.stopPropagation(); setActiveDropdown(activeDropdown === member.id ? null : member.id); }}>
                    <HiOutlineDotsVertical />
                  </button>
                  {activeDropdown === member.id && (
                    <div className="bm-dropdown-menu">
                      <button onClick={e => { e.stopPropagation(); openEdit(member); }} className="bm-dropdown-item"><HiOutlinePencil /><span>Edit</span></button>
                      <button onClick={e => { e.stopPropagation(); confirmDelete(member); }} className="bm-dropdown-item bm-danger"><HiOutlineTrash /><span>Remove</span></button>
                    </div>
                  )}
                </div>
              </div>
              <div className="bm-staff-card-body">
                <h3 className="bm-staff-name">{member.full_name}</h3>
                {member.full_name_hindi && <span className="bm-staff-name-hindi">{member.full_name_hindi}</span>}
                <div className="bm-staff-role-badge-wrapper">
                  <span className={`bm-role-badge bm-role-badge--${getRoleColor(member.role)}`}>{member.role}</span>
                  <span className={`bm-status-badge bm-status-badge--${getStatusColor(member.status)}`}>{member.status.replace('_', ' ')}</span>
                </div>
                <div className="bm-staff-details">
                  <div className="bm-staff-detail"><HiOutlineOfficeBuilding /><span>{member.department}</span></div>
                  <div className="bm-staff-detail"><HiOutlineLocationMarker /><span>{member.district}, {member.state_code}</span></div>
                  <div className="bm-staff-detail"><HiOutlineMail /><span>{member.email}</span></div>
                </div>
              </div>
              <div className="bm-staff-card-footer">
                <div className="bm-staff-metric"><span className="bm-staff-metric-value">{formatNumber(member.cases_handled)}</span><span className="bm-staff-metric-label">Cases</span></div>
                <div className="bm-staff-metric"><span className="bm-staff-metric-value">{member.cases_pending}</span><span className="bm-staff-metric-label">Pending</span></div>
                <div className="bm-staff-metric"><span className="bm-staff-metric-value bm-text-success">{member.success_rate}%</span><span className="bm-staff-metric-label">Success</span></div>
                <div className="bm-staff-metric"><span className="bm-staff-metric-value">{member.avg_processing_time}d</span><span className="bm-staff-metric-label">Avg Time</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Table View */}
      {viewMode === 'table' && (
        <div className="bm-card">
          <div className="bm-table-container">
            <table className="bm-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Cases Handled</th>
                  <th>Success Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className="bm-user-cell">
                        <div className="bm-user-avatar">{member.profile_photo_url ? <img src={member.profile_photo_url} alt={member.full_name} /> : getInitials(member.full_name)}</div>
                        <div className="bm-user-info"><span className="bm-user-name">{member.full_name}</span><span className="bm-user-email">{member.email}</span></div>
                      </div>
                    </td>
                    <td><span className={`bm-role-badge bm-role-badge--${getRoleColor(member.role)}`}>{member.role}</span></td>
                    <td>{member.department}</td>
                    <td>{member.district}, {member.state_code}</td>
                    <td>{formatNumber(member.cases_handled)}</td>
                    <td><span className="bm-success-rate">{member.success_rate}%</span></td>
                    <td><span className={`bm-status-badge bm-status-badge--${getStatusColor(member.status)}`}>{member.status.replace('_', ' ')}</span></td>
                    <td>
                      <div className="bm-actions-cell">
                        <button className="bm-icon-btn" onClick={() => openView(member)} title="View"><HiOutlineEye /></button>
                        <button className="bm-icon-btn" onClick={() => openEdit(member)} title="Edit"><HiOutlinePencil /></button>
                        <button className="bm-icon-btn bm-danger" onClick={() => confirmDelete(member)} title="Delete"><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredStaff.length === 0 && (
        <div className="bm-empty-state">
          <HiOutlineUserGroup className="bm-empty-icon" />
          <h3>No staff members found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showFormModal && (
        <div className="bm-staff-modal-overlay" onClick={() => { setShowFormModal(false); resetForm(); }}>
          <div className="bm-staff-modal" onClick={e => e.stopPropagation()}>
            <div className="bm-staff-modal__header">
              <h2>{editingMember ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button className="bm-staff-modal__close" onClick={() => { setShowFormModal(false); resetForm(); }}><HiOutlineX /></button>
            </div>
            <div className="bm-staff-modal__body">
              <div className="bm-staff-form">
                <div className="bm-staff-form__field bm-staff-form__field--full">
                  <label>Full Name *</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g. Rajesh Kumar Singh" />
                </div>
                <div className="bm-staff-form__field bm-staff-form__field--full">
                  <label>Full Name (Hindi)</label>
                  <input type="text" value={formData.full_name_hindi} onChange={e => setFormData({ ...formData, full_name_hindi: e.target.value })} placeholder="e.g. राजेश कुमार सिंह" />
                </div>
                <div className="bm-staff-form__field">
                  <label>Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="name@bharatmithra.gov.in" />
                </div>
                <div className="bm-staff-form__field">
                  <label>Mobile</label>
                  <input type="text" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} placeholder="10-digit mobile number" />
                </div>
                <div className="bm-staff-form__field">
                  <label>Role</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as StaffMember['role'] })}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="bm-staff-form__field">
                  <label>Department</label>
                  <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="bm-staff-form__field">
                  <label>State</label>
                  <select value={formData.state_code} onChange={e => setFormData({ ...formData, state_code: e.target.value })}>
                    {STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                </div>
                <div className="bm-staff-form__field">
                  <label>District</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} placeholder="e.g. Mumbai" />
                </div>
                <div className="bm-staff-form__field">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as StaffMember['status'] })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bm-staff-modal__footer">
              <button className="bm-btn bm-btn-outline" onClick={() => { setShowFormModal(false); resetForm(); }}>Cancel</button>
              <button className="bm-btn bm-btn-primary" onClick={handleSave}>{editingMember ? 'Save Changes' : 'Add Member'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingMember && (
        <div className="bm-staff-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="bm-staff-modal" onClick={e => e.stopPropagation()}>
            <div className="bm-staff-modal__header">
              <h2>Staff Details</h2>
              <button className="bm-staff-modal__close" onClick={() => setShowViewModal(false)}><HiOutlineX /></button>
            </div>
            <div className="bm-staff-modal__body">
              <div className="bm-staff-view">
                <div className="bm-staff-view__header">
                  <div className="bm-staff-avatar bm-staff-avatar--lg">
                    {getInitials(viewingMember.full_name)}
                    <span className={`bm-staff-status-dot bm-staff-status-dot--${getStatusColor(viewingMember.status)}`}></span>
                  </div>
                  <div>
                    <h3>{viewingMember.full_name}</h3>
                    {viewingMember.full_name_hindi && <span className="bm-staff-name-hindi">{viewingMember.full_name_hindi}</span>}
                    <div className="bm-staff-role-badge-wrapper" style={{ marginTop: 8 }}>
                      <span className={`bm-role-badge bm-role-badge--${getRoleColor(viewingMember.role)}`}>{viewingMember.role}</span>
                      <span className={`bm-status-badge bm-status-badge--${getStatusColor(viewingMember.status)}`}>{viewingMember.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="bm-staff-view__grid">
                  <div className="bm-staff-view__item"><HiOutlineMail /><div><span className="bm-staff-view__label">Email</span><span className="bm-staff-view__value">{viewingMember.email}</span></div></div>
                  <div className="bm-staff-view__item"><HiOutlinePhone /><div><span className="bm-staff-view__label">Mobile</span><span className="bm-staff-view__value">{viewingMember.mobile}</span></div></div>
                  <div className="bm-staff-view__item"><HiOutlineOfficeBuilding /><div><span className="bm-staff-view__label">Department</span><span className="bm-staff-view__value">{viewingMember.department}</span></div></div>
                  <div className="bm-staff-view__item"><HiOutlineLocationMarker /><div><span className="bm-staff-view__label">Location</span><span className="bm-staff-view__value">{viewingMember.district}, {viewingMember.state_code}</span></div></div>
                </div>

                <div className="bm-staff-view__metrics">
                  <div className="bm-staff-view__metric"><span className="bm-staff-view__metric-value">{formatNumber(viewingMember.cases_handled)}</span><span className="bm-staff-view__metric-label">Cases Handled</span></div>
                  <div className="bm-staff-view__metric"><span className="bm-staff-view__metric-value">{viewingMember.cases_pending}</span><span className="bm-staff-view__metric-label">Pending</span></div>
                  <div className="bm-staff-view__metric"><span className="bm-staff-view__metric-value bm-text-success">{viewingMember.success_rate}%</span><span className="bm-staff-view__metric-label">Success Rate</span></div>
                  <div className="bm-staff-view__metric"><span className="bm-staff-view__metric-value">{viewingMember.avg_processing_time}d</span><span className="bm-staff-view__metric-label">Avg Processing</span></div>
                </div>

                <div className="bm-staff-view__footer-info">
                  <span>Joined: {formatDate(viewingMember.joined_at)}</span>
                  {viewingMember.last_active && <span>Last active: {viewingMember.last_active}</span>}
                </div>
              </div>
            </div>
            <div className="bm-staff-modal__footer">
              <button className="bm-btn bm-btn-outline" onClick={() => { setShowViewModal(false); openEdit(viewingMember); }}>
                <HiOutlinePencil /> Edit
              </button>
              <button className="bm-btn bm-btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && deletingMember && (
        <div className="bm-staff-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bm-staff-modal bm-staff-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="bm-staff-modal__body">
              <div className="bm-staff-confirm">
                <div className="bm-staff-confirm__icon"><HiOutlineTrash /></div>
                <h3>Remove Staff Member?</h3>
                <p>Are you sure you want to remove <strong>{deletingMember.full_name}</strong>? This action cannot be undone.</p>
                <div className="bm-staff-confirm__actions">
                  <button className="bm-btn bm-btn-outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  <button className="bm-btn bm-btn-danger" onClick={handleDelete}>Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
