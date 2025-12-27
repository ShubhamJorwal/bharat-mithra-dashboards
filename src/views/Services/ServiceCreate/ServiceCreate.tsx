import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineExclamationCircle,
  HiOutlineCube
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { ServiceCategory, CreateServiceRequest } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './ServiceCreate.scss';

interface ServiceFormData {
  name: string;
  name_hindi: string;
  category_id: string;
  description: string;
  description_hindi: string;
  department: string;
  department_hindi: string;
  ministry: string;
  eligibility_criteria: string;
  processing_time: string;
  service_fee: number;
  platform_fee: number;
  is_free_service: boolean;
  is_popular: boolean;
  is_featured: boolean;
  required_documents: string[];
  official_url: string;
}

const ServiceCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    name_hindi: '',
    category_id: '',
    description: '',
    description_hindi: '',
    department: '',
    department_hindi: '',
    ministry: '',
    eligibility_criteria: '',
    processing_time: '',
    service_fee: 0,
    platform_fee: 0,
    is_free_service: false,
    is_popular: false,
    is_featured: false,
    required_documents: [''],
    official_url: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoriesError(null);
      try {
        const response = await servicesApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          setCategories([]);
          setCategoriesError(response.message || 'Failed to load categories');
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
        setCategoriesError('Unable to load categories. Please check your connection.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDocumentChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      required_documents: prev.required_documents.map((doc, i) => i === index ? value : doc)
    }));
  };

  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      required_documents: [...prev.required_documents, '']
    }));
  };

  const removeDocument = (index: number) => {
    if (formData.required_documents.length > 1) {
      setFormData(prev => ({
        ...prev,
        required_documents: prev.required_documents.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const createData: CreateServiceRequest = {
        category_id: formData.category_id,
        name: formData.name,
        name_hindi: formData.name_hindi || undefined,
        description: formData.description,
        description_hindi: formData.description_hindi || undefined,
        department: formData.department || undefined,  // Optional - defaults on backend
        department_hindi: formData.department_hindi || undefined,
        ministry: formData.ministry || undefined,
        eligibility_criteria: formData.eligibility_criteria || undefined,
        processing_time: formData.processing_time || undefined,
        service_fee: formData.service_fee,
        platform_fee: formData.platform_fee,
        is_free_service: formData.is_free_service,
        is_popular: formData.is_popular,
        is_featured: formData.is_featured,
        required_documents: formData.required_documents.filter(d => d.trim()),
        official_url: formData.official_url || undefined
      };

      const response = await servicesApi.createService(createData);

      if (response.success) {
        navigate('/services');
      } else {
        setError(response.message || 'Failed to create service');
      }
    } catch (err: unknown) {
      console.error('Failed to create service:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-service-create">
      <PageHeader
        icon={<HiOutlineCube />}
        title="Create Service"
        description="Add a new government service"
        actions={
          <button
            className="bm-btn bm-btn-secondary"
            onClick={() => navigate('/services')}
          >
            <HiOutlineArrowLeft />
            <span>Back</span>
          </button>
        }
      />

      {error && (
        <div className="bm-alert bm-alert-error">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button className="bm-alert-close" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {categoriesError && (
        <div className="bm-alert bm-alert-warning">
          <HiOutlineExclamationCircle />
          <span>{categoriesError}</span>
        </div>
      )}

      <div className="bm-card">
        <form onSubmit={handleSubmit} className="bm-form">
          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Basic Information</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="name">Service Name (English) *</label>
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
                <label className="bm-label" htmlFor="name_hindi">Service Name (Hindi)</label>
                <input
                  type="text"
                  id="name_hindi"
                  name="name_hindi"
                  value={formData.name_hindi}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter service name in Hindi"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="category_id">Category *</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="bm-select"
                  required
                  disabled={loadingCategories || categories.length === 0}
                >
                  <option value="">
                    {loadingCategories
                      ? 'Loading categories...'
                      : categories.length === 0
                        ? 'No categories available'
                        : 'Select category'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                  placeholder="Enter department name (optional)"
                />
              </div>
              <div className="bm-form-group bm-form-group--full">
                <label className="bm-label" htmlFor="description">Description (English) *</label>
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
              <div className="bm-form-group bm-form-group--full">
                <label className="bm-label" htmlFor="description_hindi">Description (Hindi)</label>
                <textarea
                  id="description_hindi"
                  name="description_hindi"
                  value={formData.description_hindi}
                  onChange={handleChange}
                  className="bm-textarea"
                  placeholder="Enter description in Hindi"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Service Details</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="department_hindi">Department (Hindi)</label>
                <input
                  type="text"
                  id="department_hindi"
                  name="department_hindi"
                  value={formData.department_hindi}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter department name in Hindi"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="ministry">Ministry</label>
                <input
                  type="text"
                  id="ministry"
                  name="ministry"
                  value={formData.ministry}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter ministry name"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="processing_time">Processing Time</label>
                <input
                  type="text"
                  id="processing_time"
                  name="processing_time"
                  value={formData.processing_time}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., 7-10 days"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="official_url">Official URL</label>
                <input
                  type="url"
                  id="official_url"
                  name="official_url"
                  value={formData.official_url}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="https://..."
                />
              </div>
              <div className="bm-form-group bm-form-group--full">
                <label className="bm-label" htmlFor="eligibility_criteria">Eligibility Criteria</label>
                <textarea
                  id="eligibility_criteria"
                  name="eligibility_criteria"
                  value={formData.eligibility_criteria}
                  onChange={handleChange}
                  className="bm-textarea"
                  placeholder="Enter eligibility criteria"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Fees</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="service_fee">Service Fee (₹)</label>
                <input
                  type="number"
                  id="service_fee"
                  name="service_fee"
                  value={formData.service_fee}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="platform_fee">Platform Fee (₹)</label>
                <input
                  type="number"
                  id="platform_fee"
                  name="platform_fee"
                  value={formData.platform_fee}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label">Total Fee</label>
                <div className="bm-fee-display">₹{formData.service_fee + formData.platform_fee}</div>
              </div>
              <div className="bm-form-group bm-checkbox-group">
                <label className="bm-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_free_service"
                    checked={formData.is_free_service}
                    onChange={handleChange}
                    className="bm-checkbox"
                  />
                  <span>Free Service</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Visibility</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group bm-checkbox-group">
                <label className="bm-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_popular"
                    checked={formData.is_popular}
                    onChange={handleChange}
                    className="bm-checkbox"
                  />
                  <span>Mark as Popular</span>
                </label>
              </div>
              <div className="bm-form-group bm-checkbox-group">
                <label className="bm-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="bm-checkbox"
                  />
                  <span>Mark as Featured</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Required Documents</h3>
            <div className="bm-array-field">
              {formData.required_documents.map((doc, index) => (
                <div key={index} className="bm-array-item">
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => handleDocumentChange(index, e.target.value)}
                    className="bm-input"
                    placeholder="Enter document name"
                  />
                  <button
                    type="button"
                    className="bm-remove-btn"
                    onClick={() => removeDocument(index)}
                    disabled={formData.required_documents.length === 1}
                  >
                    <HiOutlineX />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bm-add-btn"
                onClick={addDocument}
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
              disabled={loading || categories.length === 0}
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
