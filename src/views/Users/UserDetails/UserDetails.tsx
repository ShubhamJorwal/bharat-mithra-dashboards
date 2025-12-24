import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineLocationMarker
} from 'react-icons/hi';
import './UserDetails.scss';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  avatar?: string;
  address?: string;
  department?: string;
  lastLogin?: string;
}

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setUser({
          id: id || '1',
          name: 'Rahul Kumar',
          email: 'rahul@example.com',
          phone: '+91 9876543210',
          role: 'admin',
          status: 'active',
          createdAt: '2024-01-15',
          address: 'Mumbai, Maharashtra, India',
          department: 'Administration',
          lastLogin: '2024-03-15 10:30 AM'
        });
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'moderator': return 'warning';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <div className="bm-user-details">
        <div className="bm-loading">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bm-user-details">
        <div className="bm-empty-state">User not found</div>
      </div>
    );
  }

  return (
    <div className="bm-user-details">
      <header className="bm-page-header">
        <div className="bm-header-left">
          <button className="bm-back-btn" onClick={() => navigate('/users')}>
            <HiOutlineArrowLeft />
          </button>
          <div>
            <h1 className="bm-page-title">User Details</h1>
            <p className="bm-page-desc">View and manage user information</p>
          </div>
        </div>
        <div className="bm-header-actions">
          <button className="bm-btn bm-btn-secondary" onClick={() => navigate(`/users/${id}/edit`)}>
            <HiOutlinePencil />
            <span>Edit</span>
          </button>
          <button className="bm-btn bm-btn-danger">
            <HiOutlineTrash />
            <span>Delete</span>
          </button>
        </div>
      </header>

      <div className="bm-details-grid">
        <div className="bm-card bm-profile-card">
          <div className="bm-profile-header">
            <div className="bm-profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="bm-profile-info">
              <h2 className="bm-profile-name">{user.name}</h2>
              <div className="bm-profile-meta">
                <span className={`bm-badge bm-badge--${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className={`bm-status-dot bm-status-dot--${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bm-profile-details">
            <div className="bm-detail-item">
              <HiOutlineMail className="bm-detail-icon" />
              <div className="bm-detail-content">
                <span className="bm-detail-label">Email</span>
                <span className="bm-detail-value">{user.email}</span>
              </div>
            </div>
            <div className="bm-detail-item">
              <HiOutlinePhone className="bm-detail-icon" />
              <div className="bm-detail-content">
                <span className="bm-detail-label">Phone</span>
                <span className="bm-detail-value">{user.phone}</span>
              </div>
            </div>
            <div className="bm-detail-item">
              <HiOutlineLocationMarker className="bm-detail-icon" />
              <div className="bm-detail-content">
                <span className="bm-detail-label">Address</span>
                <span className="bm-detail-value">{user.address || 'Not provided'}</span>
              </div>
            </div>
            <div className="bm-detail-item">
              <HiOutlineShieldCheck className="bm-detail-icon" />
              <div className="bm-detail-content">
                <span className="bm-detail-label">Department</span>
                <span className="bm-detail-value">{user.department || 'Not assigned'}</span>
              </div>
            </div>
            <div className="bm-detail-item">
              <HiOutlineCalendar className="bm-detail-icon" />
              <div className="bm-detail-content">
                <span className="bm-detail-label">Joined</span>
                <span className="bm-detail-value">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bm-card bm-activity-card">
          <div className="bm-card-header">
            <h3 className="bm-card-title">Activity</h3>
          </div>
          <div className="bm-activity-content">
            <div className="bm-activity-item">
              <span className="bm-activity-label">Last Login</span>
              <span className="bm-activity-value">{user.lastLogin || 'Never'}</span>
            </div>
            <div className="bm-activity-item">
              <span className="bm-activity-label">Account Created</span>
              <span className="bm-activity-value">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
