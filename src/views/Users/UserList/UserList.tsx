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
  HiOutlineShieldCheck,
  HiOutlineUsers,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import usersApi from '../../../services/api/users.api';
import type { User } from '../../../types/api.types';
import './UserList.scss';

// Mock data for development/demo when API is not available
const mockUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    mobile: '9876543210',
    full_name: 'Rajesh Kumar',
    full_name_hindi: 'राजेश कुमार',
    email: 'rajesh.kumar@example.com',
    gender: 'male',
    state_code: 'MH',
    current_city: 'Mumbai',
    current_district: 'Mumbai',
    status: 'active',
    kyc_status: 'verified',
    aadhaar_verified: true,
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    mobile: '9876543211',
    full_name: 'Priya Sharma',
    full_name_hindi: 'प्रिया शर्मा',
    email: 'priya.sharma@example.com',
    gender: 'female',
    state_code: 'DL',
    current_city: 'New Delhi',
    current_district: 'Central Delhi',
    status: 'active',
    kyc_status: 'pending',
    aadhaar_verified: false,
    created_at: '2025-02-20T14:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    mobile: '9876543212',
    full_name: 'Amit Patel',
    full_name_hindi: 'अमित पटेल',
    email: 'amit.patel@example.com',
    gender: 'male',
    state_code: 'GJ',
    current_city: 'Ahmedabad',
    current_district: 'Ahmedabad',
    status: 'active',
    kyc_status: 'verified',
    aadhaar_verified: true,
    created_at: '2025-03-10T09:15:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    mobile: '9876543213',
    full_name: 'Sneha Reddy',
    full_name_hindi: 'स्नेहा रेड्डी',
    email: 'sneha.reddy@example.com',
    gender: 'female',
    state_code: 'KA',
    current_city: 'Bangalore',
    current_district: 'Bangalore Urban',
    status: 'inactive',
    kyc_status: 'partial',
    aadhaar_verified: false,
    created_at: '2025-04-05T16:45:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    mobile: '9876543214',
    full_name: 'Vikram Singh',
    full_name_hindi: 'विक्रम सिंह',
    email: 'vikram.singh@example.com',
    gender: 'male',
    state_code: 'UP',
    current_city: 'Lucknow',
    current_district: 'Lucknow',
    status: 'suspended',
    kyc_status: 'rejected',
    aadhaar_verified: false,
    created_at: '2025-05-12T11:20:00Z'
  }
];

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await usersApi.getUsers({
          page: pagination.page,
          per_page: 20,
          status: selectedStatus !== 'all' ? selectedStatus as 'active' | 'inactive' | 'suspended' : undefined
        });

        if (response.success && response.data) {
          setUsers(response.data);
          setPagination({
            page: response.meta?.page || 1,
            total: response.meta?.total || response.data.length,
            totalPages: response.meta?.total_pages || 1
          });
        } else {
          // Use mock data if API fails
          setUsers(mockUsers);
          setPagination({ page: 1, total: mockUsers.length, totalPages: 1 });
        }
      } catch (error) {
        console.error('Failed to fetch users, using mock data:', error);
        // Use mock data on error
        setUsers(mockUsers);
        setPagination({ page: 1, total: mockUsers.length, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [pagination.page, selectedStatus]);

  // Safe filter with null check
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         user.mobile.includes(searchQuery);
    return matchesSearch;
  });

  const handleView = (user: User) => {
    navigate(`/users/${user.id}?state_code=${user.state_code}`);
  };

  const handleEdit = (user: User) => {
    navigate(`/users/${user.id}/edit?state_code=${user.state_code}`);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.full_name}?`)) {
      try {
        await usersApi.deleteUser(user.id, user.state_code, 'Admin requested deletion');
        setUsers((users || []).filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Failed to delete user:', error);
        // Still remove from UI for demo purposes
        setUsers((users || []).filter(u => u.id !== user.id));
      }
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getKycColor = (kycStatus: string) => {
    switch (kycStatus) {
      case 'verified': return 'success';
      case 'rejected': return 'danger';
      case 'partial': return 'warning';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'suspended': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="bm-users">
        <div className="bm-loading">Loading users...</div>
      </div>
    );
  }

  // Calculate active users count (with null safety)
  const activeUsersCount = (users || []).filter(u => u.status === 'active').length;

  return (
    <div className="bm-users">
      <header className="bm-page-header">
        <div className="bm-page-header-left">
          <div className="bm-page-icon">
            <HiOutlineUsers />
          </div>
          <div className="bm-page-header-content">
            <div className="bm-page-title-row">
              <h1 className="bm-page-title">Users</h1>
              <div className="bm-page-tags">
                <span className="bm-tag bm-tag-success">
                  <HiOutlineCheckCircle /> {activeUsersCount} Active
                </span>
                <span className="bm-tag bm-tag-info">{pagination.total} Total</span>
              </div>
            </div>
            <p className="bm-page-desc">Manage all registered users and their access permissions</p>
          </div>
        </div>
        <div className="bm-page-header-right">
          <button className="bm-btn bm-btn-primary" onClick={() => navigate('/users/new')}>
            <HiOutlinePlus />
            <span>Add User</span>
          </button>
        </div>
      </header>

      <div className="bm-card">
        <div className="bm-table-toolbar">
          <div className="bm-search-box">
            <HiOutlineSearch className="bm-search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bm-search-input"
            />
          </div>
          <div className="bm-toolbar-actions">
            <div className="bm-filter-group">
              <HiOutlineFilter className="bm-filter-icon" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bm-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bm-table-container">
          <table className="bm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Mobile</th>
                <th>State</th>
                <th>KYC Status</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="bm-user-cell">
                      <div className="bm-user-avatar">
                        {user.profile_photo_url ? (
                          <img src={user.profile_photo_url} alt={user.full_name} />
                        ) : (
                          getInitials(user.full_name)
                        )}
                      </div>
                      <div className="bm-user-info">
                        <span className="bm-user-name">
                          {user.full_name}
                          {user.aadhaar_verified && <HiOutlineShieldCheck className="bm-verified-icon" title="Aadhaar Verified" />}
                        </span>
                        <span className="bm-user-email">{user.email || 'No email'}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.mobile}</td>
                  <td><span className="bm-state-badge">{user.state_code}</span></td>
                  <td>
                    <span className={`bm-badge bm-badge--${getKycColor(user.kyc_status)}`}>
                      {user.kyc_status}
                    </span>
                  </td>
                  <td>
                    <span className={`bm-status-dot bm-status-dot--${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="bm-actions-cell">
                      <button
                        className="bm-icon-btn"
                        onClick={() => handleView(user)}
                        title="View"
                      >
                        <HiOutlineEye />
                      </button>
                      <button
                        className="bm-icon-btn"
                        onClick={() => handleEdit(user)}
                        title="Edit"
                      >
                        <HiOutlinePencil />
                      </button>
                      <div className="bm-dropdown-wrapper">
                        <button
                          className="bm-icon-btn"
                          onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        >
                          <HiOutlineDotsVertical />
                        </button>
                        {activeDropdown === user.id && (
                          <div className="bm-dropdown-menu">
                            <button onClick={() => handleDelete(user)} className="bm-dropdown-item bm-danger">
                              <HiOutlineTrash />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="bm-empty-state">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
