import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  HiOutlineLocationMarker
} from 'react-icons/hi';
import { PageHeader } from '../../components/common/PageHeader';
import './StaffList.scss';

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

interface StaffStats {
  total: number;
  active: number;
  onLeave: number;
  admins: number;
  supervisors: number;
  officers: number;
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    full_name: 'Rajesh Kumar Singh',
    full_name_hindi: 'राजेश कुमार सिंह',
    email: 'rajesh.singh@bharatmithra.gov.in',
    mobile: '9876543210',
    role: 'supervisor',
    department: 'Revenue',
    state_code: 'MH',
    district: 'Mumbai',
    status: 'active',
    cases_handled: 1245,
    cases_pending: 23,
    avg_processing_time: 2.4,
    success_rate: 96.5,
    joined_at: '2023-06-15T00:00:00Z',
    last_active: '2 hours ago'
  },
  {
    id: '2',
    full_name: 'Priya Sharma',
    full_name_hindi: 'प्रिया शर्मा',
    email: 'priya.sharma@bharatmithra.gov.in',
    mobile: '9876543211',
    role: 'officer',
    department: 'Civil Services',
    state_code: 'KA',
    district: 'Bangalore',
    status: 'active',
    cases_handled: 856,
    cases_pending: 12,
    avg_processing_time: 1.8,
    success_rate: 98.2,
    joined_at: '2024-01-10T00:00:00Z',
    last_active: '30 minutes ago'
  },
  {
    id: '3',
    full_name: 'Amit Patel',
    full_name_hindi: 'अमित पटेल',
    email: 'amit.patel@bharatmithra.gov.in',
    mobile: '9876543212',
    role: 'admin',
    department: 'Administration',
    state_code: 'GJ',
    district: 'Ahmedabad',
    status: 'active',
    cases_handled: 2341,
    cases_pending: 0,
    avg_processing_time: 1.2,
    success_rate: 99.1,
    joined_at: '2022-03-20T00:00:00Z',
    last_active: '5 minutes ago'
  },
  {
    id: '4',
    full_name: 'Sneha Reddy',
    full_name_hindi: 'स्नेहा रेड्डी',
    email: 'sneha.reddy@bharatmithra.gov.in',
    mobile: '9876543213',
    role: 'verifier',
    department: 'Document Verification',
    state_code: 'TN',
    district: 'Chennai',
    status: 'on_leave',
    cases_handled: 567,
    cases_pending: 45,
    avg_processing_time: 2.1,
    success_rate: 94.8,
    joined_at: '2024-04-05T00:00:00Z',
    last_active: '2 days ago'
  },
  {
    id: '5',
    full_name: 'Vikram Singh Chauhan',
    full_name_hindi: 'विक्रम सिंह चौहान',
    email: 'vikram.chauhan@bharatmithra.gov.in',
    mobile: '9876543214',
    role: 'clerk',
    department: 'Records',
    state_code: 'UP',
    district: 'Lucknow',
    status: 'active',
    cases_handled: 432,
    cases_pending: 8,
    avg_processing_time: 3.2,
    success_rate: 91.5,
    joined_at: '2024-06-12T00:00:00Z',
    last_active: '1 hour ago'
  },
  {
    id: '6',
    full_name: 'Meera Joshi',
    full_name_hindi: 'मीरा जोशी',
    email: 'meera.joshi@bharatmithra.gov.in',
    mobile: '9876543215',
    role: 'officer',
    department: 'Land Revenue',
    state_code: 'RJ',
    district: 'Jaipur',
    status: 'active',
    cases_handled: 789,
    cases_pending: 15,
    avg_processing_time: 2.0,
    success_rate: 95.7,
    joined_at: '2023-11-08T00:00:00Z',
    last_active: '45 minutes ago'
  }
];

const StaffList = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<StaffStats>({ total: 0, active: 0, onLeave: 0, admins: 0, supervisors: 0, officers: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setStaff(mockStaff);
        setStats({
          total: mockStaff.length,
          active: mockStaff.filter(s => s.status === 'active').length,
          onLeave: mockStaff.filter(s => s.status === 'on_leave').length,
          admins: mockStaff.filter(s => s.role === 'admin').length,
          supervisors: mockStaff.filter(s => s.role === 'supervisor').length,
          officers: mockStaff.filter(s => s.role === 'officer').length
        });
      } catch (error) {
        console.error('Failed to fetch staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleView = (member: StaffMember) => {
    navigate(`/staff/${member.id}`);
  };

  const handleEdit = (member: StaffMember) => {
    navigate(`/staff/${member.id}/edit`);
  };

  const handleDelete = async (member: StaffMember) => {
    if (window.confirm(`Are you sure you want to remove ${member.full_name}?`)) {
      setStaff(staff.filter(s => s.id !== member.id));
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="bm-staff">
        <div className="bm-loading">
          <div className="bm-loading-spinner"></div>
          <span>Loading staff members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-staff">
      <PageHeader
        icon={<HiOutlineUserGroup />}
        title="Staff Management"
        description="Manage staff members, roles, and performance across all regions"
        actions={
          <button className="bm-btn bm-btn-primary" onClick={() => navigate('/staff/new')}>
            <HiOutlinePlus />
            <span>Add Staff Member</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="bm-staff-stats">
        <div className="bm-staff-stat">
          <div className="bm-staff-stat-icon bm-staff-stat-icon--primary">
            <HiOutlineUserGroup />
          </div>
          <div className="bm-staff-stat-content">
            <span className="bm-staff-stat-value">{stats.total}</span>
            <span className="bm-staff-stat-label">Total Staff</span>
          </div>
        </div>
        <div className="bm-staff-stat">
          <div className="bm-staff-stat-icon bm-staff-stat-icon--success">
            <HiOutlineBadgeCheck />
          </div>
          <div className="bm-staff-stat-content">
            <span className="bm-staff-stat-value">{stats.active}</span>
            <span className="bm-staff-stat-label">Active</span>
          </div>
        </div>
        <div className="bm-staff-stat">
          <div className="bm-staff-stat-icon bm-staff-stat-icon--warning">
            <HiOutlineClock />
          </div>
          <div className="bm-staff-stat-content">
            <span className="bm-staff-stat-value">{stats.onLeave}</span>
            <span className="bm-staff-stat-label">On Leave</span>
          </div>
        </div>
        <div className="bm-staff-stat">
          <div className="bm-staff-stat-icon bm-staff-stat-icon--info">
            <HiOutlineClipboardList />
          </div>
          <div className="bm-staff-stat-content">
            <span className="bm-staff-stat-value">{formatNumber(staff.reduce((a, b) => a + b.cases_handled, 0))}</span>
            <span className="bm-staff-stat-label">Cases Handled</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bm-staff-toolbar">
        <div className="bm-search-box">
          <HiOutlineSearch className="bm-search-icon" />
          <input
            type="text"
            placeholder="Search staff members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bm-search-input"
          />
        </div>
        <div className="bm-toolbar-actions">
          <div className="bm-filter-group">
            <HiOutlineFilter className="bm-filter-icon" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bm-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="officer">Officer</option>
              <option value="verifier">Verifier</option>
              <option value="clerk">Clerk</option>
            </select>
          </div>
          <div className="bm-filter-group">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bm-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div className="bm-view-toggle">
            <button
              className={`bm-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`bm-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Staff Cards View */}
      {viewMode === 'cards' && (
        <div className="bm-staff-grid">
          {filteredStaff.map((member) => (
            <div key={member.id} className="bm-staff-card" onClick={() => handleView(member)}>
              <div className="bm-staff-card-header">
                <div className="bm-staff-avatar">
                  {member.profile_photo_url ? (
                    <img src={member.profile_photo_url} alt={member.full_name} />
                  ) : (
                    getInitials(member.full_name)
                  )}
                  <span className={`bm-staff-status-dot bm-staff-status-dot--${getStatusColor(member.status)}`}></span>
                </div>
                <div className="bm-staff-actions-menu">
                  <button
                    className="bm-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === member.id ? null : member.id);
                    }}
                  >
                    <HiOutlineDotsVertical />
                  </button>
                  {activeDropdown === member.id && (
                    <div className="bm-dropdown-menu">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(member); }} className="bm-dropdown-item">
                        <HiOutlinePencil />
                        <span>Edit</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(member); }} className="bm-dropdown-item bm-danger">
                        <HiOutlineTrash />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bm-staff-card-body">
                <h3 className="bm-staff-name">{member.full_name}</h3>
                {member.full_name_hindi && (
                  <span className="bm-staff-name-hindi">{member.full_name_hindi}</span>
                )}
                <div className="bm-staff-role-badge-wrapper">
                  <span className={`bm-role-badge bm-role-badge--${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                  <span className={`bm-status-badge bm-status-badge--${getStatusColor(member.status)}`}>
                    {member.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="bm-staff-details">
                  <div className="bm-staff-detail">
                    <HiOutlineOfficeBuilding />
                    <span>{member.department}</span>
                  </div>
                  <div className="bm-staff-detail">
                    <HiOutlineLocationMarker />
                    <span>{member.district}, {member.state_code}</span>
                  </div>
                  <div className="bm-staff-detail">
                    <HiOutlineMail />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>

              <div className="bm-staff-card-footer">
                <div className="bm-staff-metric">
                  <span className="bm-staff-metric-value">{formatNumber(member.cases_handled)}</span>
                  <span className="bm-staff-metric-label">Cases</span>
                </div>
                <div className="bm-staff-metric">
                  <span className="bm-staff-metric-value">{member.cases_pending}</span>
                  <span className="bm-staff-metric-label">Pending</span>
                </div>
                <div className="bm-staff-metric">
                  <span className="bm-staff-metric-value bm-text-success">{member.success_rate}%</span>
                  <span className="bm-staff-metric-label">Success</span>
                </div>
                <div className="bm-staff-metric">
                  <span className="bm-staff-metric-value">{member.avg_processing_time}d</span>
                  <span className="bm-staff-metric-label">Avg Time</span>
                </div>
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
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="bm-user-cell">
                        <div className="bm-user-avatar">
                          {member.profile_photo_url ? (
                            <img src={member.profile_photo_url} alt={member.full_name} />
                          ) : (
                            getInitials(member.full_name)
                          )}
                        </div>
                        <div className="bm-user-info">
                          <span className="bm-user-name">{member.full_name}</span>
                          <span className="bm-user-email">{member.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`bm-role-badge bm-role-badge--${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td>{member.department}</td>
                    <td>{member.district}, {member.state_code}</td>
                    <td>{formatNumber(member.cases_handled)}</td>
                    <td>
                      <span className="bm-success-rate">{member.success_rate}%</span>
                    </td>
                    <td>
                      <span className={`bm-status-badge bm-status-badge--${getStatusColor(member.status)}`}>
                        {member.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="bm-actions-cell">
                        <button className="bm-icon-btn" onClick={() => handleView(member)} title="View">
                          <HiOutlineEye />
                        </button>
                        <button className="bm-icon-btn" onClick={() => handleEdit(member)} title="Edit">
                          <HiOutlinePencil />
                        </button>
                        <button className="bm-icon-btn bm-danger" onClick={() => handleDelete(member)} title="Delete">
                          <HiOutlineTrash />
                        </button>
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
    </div>
  );
};

export default StaffList;
