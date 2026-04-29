import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCollection,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { ServiceCategory } from '../../../types/api.types';
import './CategoryManager.scss';

const CATEGORY_TYPES = ['government', 'private', 'semi-government'] as const;

const CategoryManager = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ServiceCategory | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    name_hindi: '',
    slug: '',
    description: '',
    category_type: '' as 'government' | 'private' | 'semi-government' | '',
    department: '',
    ministry: '',
    color_code: '#1a3c5e',
    sort_order: 0,
    is_featured: false,
    priority_score: 0,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await servicesApi.getAllCategories(true);
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = categories.filter(c => {
    if (filterType && c.category_type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.slug && c.slug.toLowerCase().includes(q)) ||
        (c.department && c.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const resetForm = () => {
    setFormData({
      name: '', name_hindi: '', slug: '', description: '',
      category_type: '', department: '', ministry: '',
      color_code: '#1a3c5e', sort_order: 0, is_featured: false, priority_score: 0,
    });
  };

  const openCreate = () => {
    resetForm();
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEdit = (cat: ServiceCategory) => {
    setFormData({
      name: cat.name,
      name_hindi: cat.name_hindi || '',
      slug: cat.slug,
      description: cat.description || '',
      category_type: cat.category_type || '',
      department: cat.department || '',
      ministry: cat.ministry || '',
      color_code: cat.color_code || '#1a3c5e',
      sort_order: cat.sort_order || 0,
      is_featured: cat.is_featured || false,
      priority_score: cat.priority_score || 0,
    });
    setEditingCategory(cat);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        category_type: (formData.category_type || undefined) as 'government' | 'private' | 'semi-government' | undefined,
      };

      if (editingCategory) {
        await servicesApi.updateCategory(editingCategory.id, payload as Parameters<typeof servicesApi.updateCategory>[1]);
      } else {
        await servicesApi.createCategory(payload as Parameters<typeof servicesApi.createCategory>[0]);
      }

      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setSaving(true);
    try {
      await servicesApi.deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const typeLabel = (type?: string) => {
    if (!type) return '—';
    return type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="svc-cat-manager">
      <div className="svc-page-header">
        <div className="svc-page-header-left">
          <HiOutlineCollection className="svc-page-icon" />
          <div>
            <h1 className="svc-page-title">Manage Categories</h1>
            <p className="svc-page-subtitle">Organize services into meaningful categories</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/services" className="svc-btn svc-btn-secondary" style={{ textDecoration: 'none' }}>
            Catalog
          </Link>
          <button className="svc-btn svc-btn-primary" onClick={openCreate}>
            <HiOutlinePlus /> Add Category
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="svc-stats-row">
        <div className="svc-stat-card">
          <span className="svc-stat-value">{categories.length}</span>
          <span className="svc-stat-label">Total Categories</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{categories.filter(c => c.is_active).length}</span>
          <span className="svc-stat-label">Active</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{categories.filter(c => c.is_featured).length}</span>
          <span className="svc-stat-label">Featured</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{categories.filter(c => c.category_type === 'government').length}</span>
          <span className="svc-stat-label">Government</span>
        </div>
      </div>

      {/* Filters */}
      <div className="svc-filters-bar">
        <div className="svc-filters-row">
          <div className="svc-search-box">
            <HiOutlineSearch />
            <input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="svc-filter-chips">
            <button className={`svc-chip ${filterType === '' ? 'svc-chip--active' : ''}`} onClick={() => setFilterType('')}>
              All
            </button>
            {CATEGORY_TYPES.map(t => (
              <button key={t} className={`svc-chip ${filterType === t ? 'svc-chip--active' : ''}`} onClick={() => setFilterType(t)}>
                {typeLabel(t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="svc-loading-state">Loading categories...</div>
      ) : (
        <div className="svc-cat-mgr-grid">
          {filtered.map(cat => (
            <div key={cat.id} className="svc-cat-mgr-card">
              <div className="svc-cat-mgr-card-top">
                <div className="svc-cat-mgr-info">
                  <div className="svc-cat-mgr-icon" style={{ background: cat.color_code || '#1a3c5e' }}>
                    {cat.icon_url ? (
                      <img src={cat.icon_url} alt="" style={{ width: 20, height: 20 }} />
                    ) : (
                      <HiOutlineCollection style={{ color: '#fff', fontSize: 18 }} />
                    )}
                  </div>
                  <div>
                    <h4>{cat.name}</h4>
                    <span className="svc-cat-mgr-slug">{cat.slug}</span>
                  </div>
                </div>
                <div className="svc-cat-mgr-actions">
                  <button className="svc-btn-icon" title="Edit" onClick={() => openEdit(cat)}>
                    <HiOutlinePencil />
                  </button>
                  <button className="svc-btn-icon svc-btn-icon--danger" title="Delete" onClick={() => setDeletingCategory(cat)}>
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>

              {cat.description && <p className="svc-cat-mgr-desc">{cat.description}</p>}

              <div className="svc-cat-mgr-details">
                <span className={`svc-status-dot svc-status-dot--${cat.is_active ? 'active' : 'inactive'}`} />
                <span className="svc-cat-mgr-detail-item">{cat.is_active ? 'Active' : 'Inactive'}</span>
                {cat.category_type && <span className="svc-badge svc-badge--active">{typeLabel(cat.category_type)}</span>}
                {cat.is_featured && <span className="svc-badge svc-badge--featured">Featured</span>}
                {cat.service_count != null && (
                  <span className="svc-cat-mgr-detail-item">{cat.service_count} services</span>
                )}
                {cat.department && (
                  <span className="svc-cat-mgr-detail-item">{cat.department}</span>
                )}
                <span className="svc-cat-mgr-detail-item">Order: {cat.sort_order}</span>
                <span className="svc-color-preview" style={{ background: cat.color_code || '#1a3c5e' }} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="svc-empty-state">No categories found.</div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="svc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="svc-modal svc-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="svc-modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="svc-modal-close" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Category Name *</label>
                  <input className="svc-form-input" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Government Schemes" />
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Name (Hindi)</label>
                  <input className="svc-form-input" value={formData.name_hindi} onChange={e => updateField('name_hindi', e.target.value)} placeholder="हिंदी नाम" />
                </div>
              </div>

              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Slug</label>
                  <input className="svc-form-input" value={formData.slug} onChange={e => updateField('slug', e.target.value)} placeholder="auto-generated if empty" />
                  <span className="svc-form-hint">URL-friendly identifier. Leave blank to auto-generate.</span>
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Category Type</label>
                  <select className="svc-form-select" value={formData.category_type} onChange={e => updateField('category_type', e.target.value)}>
                    <option value="">Select type</option>
                    {CATEGORY_TYPES.map(t => (
                      <option key={t} value={t}>{typeLabel(t)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="svc-form-group">
                <label className="svc-form-label">Description</label>
                <textarea className="svc-form-textarea" value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Category description..." />
              </div>

              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Department</label>
                  <input className="svc-form-input" value={formData.department} onChange={e => updateField('department', e.target.value)} placeholder="e.g. Ministry of Finance" />
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Ministry</label>
                  <input className="svc-form-input" value={formData.ministry} onChange={e => updateField('ministry', e.target.value)} placeholder="e.g. Govt of India" />
                </div>
              </div>

              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Sort Order</label>
                  <input className="svc-form-input" type="number" min="0" value={formData.sort_order} onChange={e => updateField('sort_order', Number(e.target.value))} />
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Priority Score</label>
                  <input className="svc-form-input" type="number" min="0" value={formData.priority_score} onChange={e => updateField('priority_score', Number(e.target.value))} />
                </div>
              </div>

              <div className="svc-form-group">
                <label className="svc-form-label">Color</label>
                <div className="svc-color-picker-row">
                  <input type="color" value={formData.color_code} onChange={e => updateField('color_code', e.target.value)} />
                  <input className="svc-form-input" value={formData.color_code} onChange={e => updateField('color_code', e.target.value)} style={{ maxWidth: 120 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                <label className="svc-form-checkbox">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => updateField('is_featured', e.target.checked)} />
                  Featured Category
                </label>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn svc-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="svc-btn svc-btn-primary" onClick={handleSave} disabled={saving || !formData.name.trim()}>
                {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deletingCategory && (
        <div className="svc-modal-overlay" onClick={() => setDeletingCategory(null)}>
          <div className="svc-modal svc-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="svc-modal-header">
              <h2>Delete Category</h2>
              <button className="svc-modal-close" onClick={() => setDeletingCategory(null)}>
                <HiOutlineX />
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-delete-confirm">
                <p>Are you sure you want to delete <strong>{deletingCategory.name}</strong>?</p>
                <div className="svc-delete-warning">All services in this category will also be affected.</div>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn svc-btn-secondary" onClick={() => setDeletingCategory(null)}>Cancel</button>
              <button className="svc-btn svc-btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
