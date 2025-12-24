import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineFolderAdd
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { ServiceCategory, CreateCategoryRequest } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './CategoryCreate.scss';

interface CategoryFormData {
  name: string;
  name_hindi: string;
  slug: string;
  description: string;
  icon_url: string;
  parent_id: string;
  sort_order: number;
}

const CategoryCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<ServiceCategory[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    name_hindi: '',
    slug: '',
    description: '',
    icon_url: '',
    parent_id: '',
    sort_order: 0
  });

  useEffect(() => {
    const fetchParentCategories = async () => {
      setLoadingParents(true);
      try {
        const response = await servicesApi.getCategories();
        if (response.success && response.data) {
          // Only show parent categories (those without parent_id)
          setParentCategories(response.data.filter(c => !c.parent_id));
        } else {
          setParentCategories([]);
        }
      } catch (err) {
        console.error('Failed to fetch parent categories:', err);
        setParentCategories([]);
      } finally {
        setLoadingParents(false);
      }
    };

    fetchParentCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Auto-generate slug from name
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // For now, we'll use the base64 string as the icon_url
        // In production, you'd upload to a server and get a URL back
        setFormData(prev => ({ ...prev, icon_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, icon_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const createData: CreateCategoryRequest = {
        name: formData.name,
        name_hindi: formData.name_hindi || undefined,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        icon_url: formData.icon_url || undefined,
        parent_id: formData.parent_id || null,
        sort_order: formData.sort_order
      };

      const response = await servicesApi.createCategory(createData);

      if (response.success) {
        navigate('/services/categories');
      } else {
        setError(response.message || 'Failed to create category');
      }
    } catch (err: unknown) {
      console.error('Failed to create category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-category-create">
      <PageHeader
        icon={<HiOutlineFolderAdd />}
        title="Create Category"
        description="Add a new service category"
        actions={
          <button
            className="bm-btn bm-btn-secondary"
            onClick={() => navigate('/services/categories')}
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

      <div className="bm-card">
        <form onSubmit={handleSubmit} className="bm-form">
          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Category Icon</h3>
            <div className="bm-image-upload">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="bm-file-input"
                id="icon-upload"
              />
              {imagePreview ? (
                <div className="bm-image-preview">
                  <img src={imagePreview} alt="Category icon preview" />
                  <button
                    type="button"
                    className="bm-remove-image"
                    onClick={handleRemoveImage}
                  >
                    <HiOutlineX />
                  </button>
                </div>
              ) : (
                <label htmlFor="icon-upload" className="bm-upload-placeholder">
                  <HiOutlinePhotograph />
                  <span>Click to upload icon</span>
                  <small>PNG, JPG up to 2MB</small>
                </label>
              )}
            </div>
            <div className="bm-form-group" style={{ marginTop: '16px' }}>
              <label className="bm-label" htmlFor="icon_url">Or enter icon URL directly</label>
              <input
                type="url"
                id="icon_url"
                name="icon_url"
                value={formData.icon_url}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, icon_url: e.target.value }));
                  setImagePreview(e.target.value || null);
                }}
                className="bm-input"
                placeholder="https://example.com/icon.png"
              />
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Basic Information</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="name">Category Name (English) *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="name_hindi">Category Name (Hindi)</label>
                <input
                  type="text"
                  id="name_hindi"
                  name="name_hindi"
                  value={formData.name_hindi}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="श्रेणी का नाम दर्ज करें"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="slug">Slug</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="category-slug"
                />
                <small className="bm-hint">Auto-generated from name if left empty</small>
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="parent_id">Parent Category</label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="bm-select"
                  disabled={loadingParents}
                >
                  <option value="">
                    {loadingParents ? 'Loading...' : 'None (Top-level category)'}
                  </option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bm-form-group bm-form-group--full">
                <label className="bm-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="bm-textarea"
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="sort_order">Sort Order</label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="0"
                  min="0"
                />
                <small className="bm-hint">Lower numbers appear first</small>
              </div>
            </div>
          </div>

          <div className="bm-form-actions">
            <button
              type="button"
              className="bm-btn bm-btn-secondary"
              onClick={() => navigate('/services/categories')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryCreate;
