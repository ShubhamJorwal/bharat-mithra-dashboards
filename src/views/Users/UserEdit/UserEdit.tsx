import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import './UserEdit.scss';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  department: string;
  address: string;
}

const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'pending',
    department: '',
    address: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulating fetched data
        setFormData({
          name: 'Rahul Kumar',
          email: 'rahul@example.com',
          phone: '+91 9876543210',
          role: 'admin',
          status: 'active',
          department: 'Administration',
          address: 'Mumbai, Maharashtra, India'
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Updating user:', id, formData);
      navigate(`/users/${id}`);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bm-user-edit">
        <div className="bm-loading">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="bm-user-edit">
      <header className="bm-page-header">
        <div className="bm-header-left">
          <button className="bm-back-btn" onClick={() => navigate(`/users/${id}`)}>
            <HiOutlineArrowLeft />
          </button>
          <div>
            <h1 className="bm-page-title">Edit User</h1>
            <p className="bm-page-desc">Update user information</p>
          </div>
        </div>
      </header>

      <div className="bm-card">
        <form onSubmit={handleSubmit} className="bm-form">
          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Basic Information</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter department"
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Role & Status</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bm-select"
                  required
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="bm-select"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Additional Information</h3>
            <div className="bm-form-group bm-form-group--full">
              <label className="bm-label" htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="bm-textarea"
                placeholder="Enter full address"
                rows={3}
              />
            </div>
          </div>

          <div className="bm-form-actions">
            <button
              type="button"
              className="bm-btn bm-btn-secondary"
              onClick={() => navigate(`/users/${id}`)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
