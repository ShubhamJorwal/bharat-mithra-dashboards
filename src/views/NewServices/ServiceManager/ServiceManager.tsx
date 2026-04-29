import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { Service, ServiceCategory as ApiCategory } from '../../../types/api.types';
import './ServiceManager.scss';

type ViewMode = 'table' | 'grid';

const ServiceManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    name_hindi: '',
    description: '',
    category_id: '',
    service_fee: 0,
    platform_fee: 0,
    is_free_service: false,
    is_popular: false,
    is_featured: false,
    service_type: '' as 'certificate' | 'license' | 'registration' | 'application' | 'payment' | '',
    service_mode: '' as 'online' | 'offline' | 'both' | '',
    processing_time: '',
    official_url: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await servicesApi.getAllCategories(true);
      if (res.success && res.data) setCategories(res.data);
    } catch {
      /* categories fetch failed silently */
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: perPage };
      if (filterCategory) params.category_id = filterCategory;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = searchQuery.trim()
        ? await servicesApi.searchServices(searchQuery.trim(), page, perPage)
        : await servicesApi.getServices(params);

      if (res.success || res.data) {
        setServices(Array.isArray(res.data) ? res.data : []);
        if (res.meta) {
          setTotalPages(res.meta.total_pages);
          setTotal(res.meta.total);
        }
      }
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterCategory, searchQuery]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchServices(); }, [fetchServices]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [filterCategory, searchQuery]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  const resetForm = () => {
    setFormData({
      name: '', name_hindi: '', description: '', category_id: '',
      service_fee: 0, platform_fee: 0, is_free_service: false,
      is_popular: false, is_featured: false, service_type: '',
      service_mode: '', processing_time: '', official_url: '',
    });
  };

  const openCreate = () => {
    resetForm();
    setEditingService(null);
    setShowCreateModal(true);
  };

  const openEdit = (service: Service) => {
    setFormData({
      name: service.name,
      name_hindi: service.name_hindi || '',
      description: service.description || '',
      category_id: service.category_id,
      service_fee: service.service_fee,
      platform_fee: service.platform_fee,
      is_free_service: service.is_free_service,
      is_popular: service.is_popular,
      is_featured: service.is_featured,
      service_type: service.service_type || '',
      service_mode: service.service_mode || '',
      processing_time: service.processing_time || '',
      official_url: service.official_url || '',
    });
    setEditingService(service);
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category_id) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        total_fee: formData.service_fee + formData.platform_fee,
        service_type: (formData.service_type || undefined) as 'certificate' | 'license' | 'registration' | 'application' | 'payment' | undefined,
        service_mode: (formData.service_mode || undefined) as 'online' | 'offline' | 'both' | undefined,
      };

      if (editingService) {
        await servicesApi.updateService(editingService.id, payload as Parameters<typeof servicesApi.updateService>[1]);
      } else {
        await servicesApi.createService(payload as Parameters<typeof servicesApi.createService>[0]);
      }

      setShowCreateModal(false);
      resetForm();
      fetchServices();
    } catch (err) {
      console.error('Failed to save service:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    setSaving(true);
    try {
      await servicesApi.deleteService(deletingService.id);
      setDeletingService(null);
      fetchServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const stats = useMemo(() => ({
    total,
    active: services.filter(s => s.is_active !== false).length,
    popular: services.filter(s => s.is_popular).length,
    featured: services.filter(s => s.is_featured).length,
  }), [services, total]);

  return (
    <div className="svc-manager">
      <div className="svc-page-header">
        <div className="svc-page-header-left">
          <HiOutlineCog className="svc-page-icon" />
          <div>
            <h1 className="svc-page-title">Manage Services</h1>
            <p className="svc-page-subtitle">Create, edit, and manage all platform services</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/services" className="svc-btn svc-btn-secondary" style={{ textDecoration: 'none' }}>
            Catalog
          </Link>
          <button className="svc-btn svc-btn-primary" onClick={openCreate}>
            <HiOutlinePlus /> Add Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="svc-stats-row">
        <div className="svc-stat-card">
          <span className="svc-stat-value">{stats.total}</span>
          <span className="svc-stat-label">Total Services</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{stats.active}</span>
          <span className="svc-stat-label">Active (page)</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{stats.popular}</span>
          <span className="svc-stat-label">Popular (page)</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{categories.length}</span>
          <span className="svc-stat-label">Categories</span>
        </div>
      </div>

      {/* Filters */}
      <div className="svc-filters-bar">
        <div className="svc-filters-row">
          <div className="svc-search-box">
            <HiOutlineSearch />
            <input
              placeholder="Search services by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="svc-form-select"
            style={{ maxWidth: 220 }}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="svc-view-toggle">
            <button className={`svc-view-btn ${viewMode === 'table' ? 'svc-view-btn--active' : ''}`} onClick={() => setViewMode('table')}>
              <HiOutlineViewList />
            </button>
            <button className={`svc-view-btn ${viewMode === 'grid' ? 'svc-view-btn--active' : ''}`} onClick={() => setViewMode('grid')}>
              <HiOutlineViewGrid />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="svc-loading-state">Loading services...</div>
      ) : viewMode === 'table' ? (
        <>
          <div className="svc-table-wrapper">
            <table className="svc-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(svc => (
                  <tr key={svc.id}>
                    <td>
                      <div className="svc-service-row-name">
                        <span className="svc-service-name-text">{svc.name}</span>
                      </div>
                      <span className="svc-service-row-name">
                        <span className="svc-service-slug">{svc.slug}</span>
                      </span>
                    </td>
                    <td className="svc-service-row-category">{categoryMap[svc.category_id] || '—'}</td>
                    <td className="svc-service-row-fee">
                      {svc.is_free_service ? 'Free' : `₹${svc.total_fee}`}
                    </td>
                    <td>
                      <span className={`svc-status-dot svc-status-dot--${svc.is_active !== false ? 'active' : 'inactive'}`} />
                      {svc.is_active !== false ? 'Active' : 'Inactive'}
                    </td>
                    <td>
                      <div className="svc-service-row-badges">
                        {svc.is_popular && <span className="svc-badge svc-badge--popular">Popular</span>}
                        {svc.is_featured && <span className="svc-badge svc-badge--featured">Featured</span>}
                      </div>
                    </td>
                    <td>
                      <div className="svc-td-actions">
                        <button className="svc-btn-icon" title="Edit" onClick={() => openEdit(svc)}>
                          <HiOutlinePencil />
                        </button>
                        <button className="svc-btn-icon svc-btn-icon--danger" title="Delete" onClick={() => setDeletingService(svc)}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-secondary)' }}>
                      No services found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="svc-pagination">
              <span className="svc-pagination-info">Page {page} of {totalPages} ({total} total)</span>
              <div className="svc-pagination-controls">
                <button className="svc-pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <HiOutlineChevronLeft />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      className={`svc-pagination-btn ${p === page ? 'svc-pagination-btn--active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button className="svc-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <HiOutlineChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="svc-manager-grid">
          {services.map(svc => (
            <div key={svc.id} className="svc-manager-card">
              <div className="svc-manager-card-header">
                <div className="svc-manager-card-info">
                  <h4>{svc.name}</h4>
                  <span className="svc-manager-card-slug">{svc.slug}</span>
                </div>
                <div className="svc-manager-card-actions">
                  <button className="svc-btn-icon" title="Edit" onClick={() => openEdit(svc)}>
                    <HiOutlinePencil />
                  </button>
                  <button className="svc-btn-icon svc-btn-icon--danger" title="Delete" onClick={() => setDeletingService(svc)}>
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
              <div className="svc-manager-card-meta">
                <span className={`svc-status-dot svc-status-dot--${svc.is_active !== false ? 'active' : 'inactive'}`} />
                {svc.is_popular && <span className="svc-badge svc-badge--popular">Popular</span>}
                {svc.is_featured && <span className="svc-badge svc-badge--featured">Featured</span>}
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {categoryMap[svc.category_id] || '—'}
                </span>
              </div>
              <div className="svc-manager-card-footer">
                <span style={{ fontWeight: 600 }}>
                  {svc.is_free_service ? 'Free' : `₹${svc.total_fee}`}
                </span>
                {svc.processing_time && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {svc.processing_time}
                  </span>
                )}
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="svc-empty-state">No services found.</div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="svc-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="svc-modal svc-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="svc-modal-header">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="svc-modal-close" onClick={() => setShowCreateModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Service Name *</label>
                  <input className="svc-form-input" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. PAN Card Application" />
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Name (Hindi)</label>
                  <input className="svc-form-input" value={formData.name_hindi} onChange={e => updateField('name_hindi', e.target.value)} placeholder="हिंदी नाम" />
                </div>
              </div>

              <div className="svc-form-group">
                <label className="svc-form-label">Description</label>
                <textarea className="svc-form-textarea" value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Service description..." />
              </div>

              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Category *</label>
                  <select className="svc-form-select" value={formData.category_id} onChange={e => updateField('category_id', e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Processing Time</label>
                  <input className="svc-form-input" value={formData.processing_time} onChange={e => updateField('processing_time', e.target.value)} placeholder="e.g. 2-3 days" />
                </div>
              </div>

              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Service Fee (₹)</label>
                  <input className="svc-form-input" type="number" min="0" value={formData.service_fee} onChange={e => updateField('service_fee', Number(e.target.value))} />
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Platform Fee (₹)</label>
                  <input className="svc-form-input" type="number" min="0" value={formData.platform_fee} onChange={e => updateField('platform_fee', Number(e.target.value))} />
                </div>
              </div>

              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Service Type</label>
                  <select className="svc-form-select" value={formData.service_type} onChange={e => updateField('service_type', e.target.value)}>
                    <option value="">Select type</option>
                    <option value="certificate">Certificate</option>
                    <option value="license">License</option>
                    <option value="registration">Registration</option>
                    <option value="application">Application</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Service Mode</label>
                  <select className="svc-form-select" value={formData.service_mode} onChange={e => updateField('service_mode', e.target.value)}>
                    <option value="">Select mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="svc-form-group">
                <label className="svc-form-label">Official URL</label>
                <input className="svc-form-input" value={formData.official_url} onChange={e => updateField('official_url', e.target.value)} placeholder="https://..." />
              </div>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>
                <label className="svc-form-checkbox">
                  <input type="checkbox" checked={formData.is_free_service} onChange={e => updateField('is_free_service', e.target.checked)} />
                  Free Service
                </label>
                <label className="svc-form-checkbox">
                  <input type="checkbox" checked={formData.is_popular} onChange={e => updateField('is_popular', e.target.checked)} />
                  Popular
                </label>
                <label className="svc-form-checkbox">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => updateField('is_featured', e.target.checked)} />
                  Featured
                </label>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn svc-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="svc-btn svc-btn-primary" onClick={handleSave} disabled={saving || !formData.name.trim() || !formData.category_id}>
                {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingService && (
        <div className="svc-modal-overlay" onClick={() => setDeletingService(null)}>
          <div className="svc-modal svc-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="svc-modal-header">
              <h2>Delete Service</h2>
              <button className="svc-modal-close" onClick={() => setDeletingService(null)}>
                <HiOutlineX />
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-delete-confirm">
                <p>Are you sure you want to delete <strong>{deletingService.name}</strong>?</p>
                <div className="svc-delete-warning">This action cannot be undone.</div>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn svc-btn-secondary" onClick={() => setDeletingService(null)}>Cancel</button>
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

export default ServiceManager;
