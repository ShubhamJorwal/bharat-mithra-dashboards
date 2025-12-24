import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import './ServiceCreate.scss';

interface ServiceFormData {
  name: string;
  category: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  processingTime: string;
  fee: string;
  requirements: string[];
  documents: string[];
}

const ServiceCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    category: '',
    description: '',
    status: 'draft',
    processingTime: '',
    fee: '',
    requirements: [''],
    documents: ['']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: 'requirements' | 'documents', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'requirements' | 'documents') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'requirements' | 'documents', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty values
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim()),
        documents: formData.documents.filter(d => d.trim())
      };

      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating service:', cleanedData);
      navigate('/services');
    } catch (error) {
      console.error('Failed to create service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-service-create">
      <header className="bm-page-header">
        <div className="bm-header-left">
          <button className="bm-back-btn" onClick={() => navigate('/services')}>
            <HiOutlineArrowLeft />
          </button>
          <div>
            <h1 className="bm-page-title">Create Service</h1>
            <p className="bm-page-desc">Add a new government service</p>
          </div>
        </div>
      </header>

      <div className="bm-card">
        <form onSubmit={handleSubmit} className="bm-form">
          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Basic Information</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="name">Service Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter service name"
                  required
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="bm-select"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Identity">Identity</option>
                  <option value="Tax">Tax</option>
                  <option value="Transport">Transport</option>
                  <option value="Civil">Civil</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                </select>
              </div>
              <div className="bm-form-group bm-form-group--full">
                <label className="bm-label" htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="bm-textarea"
                  placeholder="Enter service description"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Service Details</h3>
            <div className="bm-form-grid">
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
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="processingTime">Processing Time</label>
                <input
                  type="text"
                  id="processingTime"
                  name="processingTime"
                  value={formData.processingTime}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., 7-10 days"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="fee">Fee</label>
                <input
                  type="text"
                  id="fee"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., ₹500 - ₹1000"
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Requirements</h3>
            <div className="bm-array-field">
              {formData.requirements.map((req, index) => (
                <div key={index} className="bm-array-item">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    className="bm-input"
                    placeholder="Enter requirement"
                  />
                  <button
                    type="button"
                    className="bm-remove-btn"
                    onClick={() => removeArrayItem('requirements', index)}
                    disabled={formData.requirements.length === 1}
                  >
                    <HiOutlineX />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bm-add-btn"
                onClick={() => addArrayItem('requirements')}
              >
                <HiOutlinePlus />
                <span>Add Requirement</span>
              </button>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Required Documents</h3>
            <div className="bm-array-field">
              {formData.documents.map((doc, index) => (
                <div key={index} className="bm-array-item">
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => handleArrayChange('documents', index, e.target.value)}
                    className="bm-input"
                    placeholder="Enter document name"
                  />
                  <button
                    type="button"
                    className="bm-remove-btn"
                    onClick={() => removeArrayItem('documents', index)}
                    disabled={formData.documents.length === 1}
                  >
                    <HiOutlineX />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bm-add-btn"
                onClick={() => addArrayItem('documents')}
              >
                <HiOutlinePlus />
                <span>Add Document</span>
              </button>
            </div>
          </div>

          <div className="bm-form-actions">
            <button
              type="button"
              className="bm-btn bm-btn-secondary"
              onClick={() => navigate('/services')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceCreate;
