import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { ServiceCategory, UpdateCategoryRequest } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './CategoryEdit.scss';

interface CategoryFormData {
  name: string;
  name_hindi: string;
  slug: string;
  description: string;
  icon_url: string;
  parent_id: string;
  sort_order: number;
  is_active: boolean;
}

const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parentCategories, setParentCategories] = useState<ServiceCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    name_hindi: '',
    slug: '',
    description: '',
    icon_url: '',
    parent_id: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        // Fetch parent categories
        const categoriesRes = await servicesApi.getCategories();
        if (categoriesRes.success && categoriesRes.data) {
          // Exclude current category from parent options
          setParentCategories(categoriesRes.data.filter(c => !c.parent_id && c.id !== id));
        }

        // Fetch category by ID
        if (id) {
          const categoryRes = await servicesApi.getCategoryById(id);
          if (categoryRes.success && categoryRes.data) {
            const category = categoryRes.data;
            setFormData({
              name: category.name || '',
              name_hindi: category.name_hindi || '',
              slug: category.slug || '',
              description: category.description || '',
              icon_url: category.icon_url || '',
              parent_id: category.parent_id || '',
              sort_order: category.sort_order || 0,
              is_active: category.is_active !== false
            });
            if (category.icon_url) {
              setImagePreview(category.icon_url);
            }
          } else {
            setNotFound(true);
            setError(`Category not found.`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Unable to load category. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSaveError('Image size must be less than 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setSaveError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
    setSaveError(null);

    if (!id) {
      setSaveError('Cannot save - category ID is missing.');
      return;
    }

    setSaving(true);

    try {
      const updateData: UpdateCategoryRequest = {
        name: formData.name,
        name_hindi: formData.name_hindi || undefined,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        icon_url: formData.icon_url || undefined,
        parent_id: formData.parent_id || null,
        sort_order: formData.sort_order,
        is_active: formData.is_active
      };

      const response = await servicesApi.updateCategory(id, updateData);
      if (response.success) {
        navigate('/services/categories');
      } else {
        setSaveError(response.message || 'Failed to update category');
      }
    } catch (err: unknown) {
      console.error('Failed to update category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category. Please try again.';
      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bm-category-edit">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading category...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bm-category-edit">
        <PageHeader
          icon={<HiOutlineExclamationCircle />}
          title="Category Not Found"
          description="The requested category could not be found"
          variant="minimal"
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

        <div className="bm-empty-state">
          <div className="bm-empty-icon">
            <HiOutlineExclamationCircle />
          </div>
          <h3>Category not found</h3>
          <p>The category does not exist or has been deleted.</p>
          <button
            className="bm-btn bm-btn-primary"
            onClick={() => navigate('/services/categories')}
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-category-edit">
      <PageHeader
        icon={<HiOutlinePencilAlt />}
        title="Edit Category"
        description="Update category information"
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

      {saveError && (
        <div className="bm-alert bm-alert-error">
          <HiOutlineExclamationCircle />
          <span>{saveError}</span>
          <button className="bm-alert-close" onClick={() => setSaveError(null)}>&times;</button>
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
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="parent_id">Parent Category</label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="bm-select"
                >
                  <option value="">None (Top-level category)</option>
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
              <div className="bm-form-group bm-checkbox-group">
                <label className="bm-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="bm-checkbox"
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bm-form-actions">
            <button
              type="button"
              className="bm-btn bm-btn-secondary"
              onClick={() => navigate('/services/categories')}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={saving || !id}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
