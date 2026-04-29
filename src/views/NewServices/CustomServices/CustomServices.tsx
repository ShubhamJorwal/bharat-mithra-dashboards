import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineSparkles,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { Service, ServiceCategory } from '../../../types/api.types';
import './CustomServices.scss';

interface FormField {
  label: string;
  type: string;
  required: boolean;
}

const FIELD_TYPES = ['text', 'email', 'tel', 'number', 'select', 'textarea', 'file', 'date'];

const CustomServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    name_hindi: '',
    description: '',
    category_id: '',
    service_fee: 0,
    platform_fee: 0,
    is_free_service: false,
    processing_time: '',
  });
  const [formFields, setFormFields] = useState<FormField[]>([
    { label: 'Customer Name', type: 'text', required: true },
    { label: 'Mobile Number', type: 'tel', required: true },
  ]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await servicesApi.getAllCategories(true);
      if (res.success && res.data) setCategories(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all services and filter to those marked with service_type = custom or use a convention
      const res = await servicesApi.getServices({ per_page: 200 });
      if (res.data) {
        // Custom services: service_type is not one of the standard types, or has form_fields
        const custom = (Array.isArray(res.data) ? res.data : []).filter(
          s => s.service_type === 'application' || s.form_fields
        );
        setServices(custom);
      }
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchServices(); }, [fetchServices]);

  const filtered = services.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setFormData({
      name: '', name_hindi: '', description: '', category_id: '',
      service_fee: 0, platform_fee: 0, is_free_service: false, processing_time: '',
    });
    setFormFields([
      { label: 'Customer Name', type: 'text', required: true },
      { label: 'Mobile Number', type: 'tel', required: true },
    ]);
  };

  const openCreate = () => {
    resetForm();
    setEditingService(null);
    setShowModal(true);
  };

  const openEdit = (svc: Service) => {
    setFormData({
      name: svc.name,
      name_hindi: svc.name_hindi || '',
      description: svc.description || '',
      category_id: svc.category_id,
      service_fee: svc.service_fee,
      platform_fee: svc.platform_fee,
      is_free_service: svc.is_free_service,
      processing_time: svc.processing_time || '',
    });
    // Parse existing form_fields
    if (svc.form_fields) {
      try {
        const parsed = typeof svc.form_fields === 'string' ? JSON.parse(svc.form_fields) : svc.form_fields;
        if (Array.isArray(parsed)) {
          setFormFields(parsed.map((f: Record<string, unknown>) => ({
            label: String(f.label || f.name || ''),
            type: String(f.type || 'text'),
            required: Boolean(f.required),
          })));
        }
      } catch {
        setFormFields([]);
      }
    } else {
      setFormFields([]);
    }
    setEditingService(svc);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category_id) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        total_fee: formData.service_fee + formData.platform_fee,
        service_type: 'application' as const,
        service_mode: 'online' as const,
        form_fields: JSON.stringify(formFields),
      };

      if (editingService) {
        await servicesApi.updateService(editingService.id, payload);
      } else {
        await servicesApi.createService(payload);
      }

      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (err) {
      console.error('Failed to save custom service:', err);
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

  const addFormField = () => {
    setFormFields(prev => [...prev, { label: '', type: 'text', required: false }]);
  };

  const updateFormField = (idx: number, key: keyof FormField, value: string | boolean) => {
    setFormFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };

  const removeFormField = (idx: number) => {
    setFormFields(prev => prev.filter((_, i) => i !== idx));
  };

  const parseFormFields = (svc: Service): FormField[] => {
    if (!svc.form_fields) return [];
    try {
      const parsed = typeof svc.form_fields === 'string' ? JSON.parse(svc.form_fields) : svc.form_fields;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const categoryMap: Record<string, string> = {};
  categories.forEach(c => { categoryMap[c.id] = c.name; });

  return (
    <div className="svc-custom">
      <div className="svc-page-header">
        <div className="svc-page-header-left">
          <HiOutlineSparkles className="svc-page-icon" />
          <div>
            <h1 className="svc-page-title">Custom Services</h1>
            <p className="svc-page-subtitle">Create and manage custom services with dynamic form fields</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/services" className="svc-btn svc-btn-secondary" style={{ textDecoration: 'none' }}>
            Catalog
          </Link>
          <button className="svc-btn svc-btn-primary" onClick={openCreate}>
            <HiOutlinePlus /> Create Custom Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="svc-stats-row">
        <div className="svc-stat-card">
          <span className="svc-stat-value">{services.length}</span>
          <span className="svc-stat-label">Custom Services</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{services.filter(s => s.is_active !== false).length}</span>
          <span className="svc-stat-label">Active</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{services.filter(s => s.is_free_service).length}</span>
          <span className="svc-stat-label">Free Services</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{services.filter(s => !s.is_free_service).length}</span>
          <span className="svc-stat-label">Paid Services</span>
        </div>
      </div>

      {/* Search */}
      <div className="svc-filters-bar">
        <div className="svc-search-box">
          <HiOutlineSearch />
          <input
            placeholder="Search custom services..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="svc-loading-state">Loading custom services...</div>
      ) : (
        <div className="svc-custom-grid">
          {filtered.map(svc => {
            const fields = parseFormFields(svc);
            return (
              <div key={svc.id} className="svc-custom-card">
                <div className="svc-custom-card-header">
                  <div className="svc-custom-card-info">
                    <h4>{svc.name}</h4>
                  </div>
                  <div className="svc-custom-card-actions">
                    <button className="svc-btn-icon" title="Edit" onClick={() => openEdit(svc)}>
                      <HiOutlinePencil />
                    </button>
                    <button className="svc-btn-icon svc-btn-icon--danger" title="Delete" onClick={() => setDeletingService(svc)}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>

                {svc.description && <p className="svc-custom-desc">{svc.description}</p>}

                <div className="svc-custom-card-meta">
                  <span className={`svc-status-dot svc-status-dot--${svc.is_active !== false ? 'active' : 'inactive'}`} />
                  <span className="svc-badge svc-badge--custom">Custom</span>
                  {categoryMap[svc.category_id] && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {categoryMap[svc.category_id]}
                    </span>
                  )}
                </div>

                {fields.length > 0 && (
                  <div className="svc-custom-fields-preview">
                    {fields.slice(0, 6).map((f, i) => (
                      <span key={i} className={`svc-custom-field-tag ${f.required ? 'svc-custom-field-tag--required' : ''}`}>
                        {f.label || f.type}{f.required ? '*' : ''}
                      </span>
                    ))}
                    {fields.length > 6 && (
                      <span className="svc-custom-field-tag" style={{ fontWeight: 600 }}>+{fields.length - 6} more</span>
                    )}
                  </div>
                )}

                <div className="svc-custom-fee-row">
                  <span className="svc-custom-fee">
                    {svc.is_free_service ? 'Free' : `₹${svc.total_fee}`}
                  </span>
                  {svc.processing_time && (
                    <span className="svc-custom-commission">{svc.processing_time}</span>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="svc-empty-state">
              No custom services found. Create your first custom service to get started.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="svc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="svc-modal svc-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="svc-modal-header">
              <h2>{editingService ? 'Edit Custom Service' : 'Create Custom Service'}</h2>
              <button className="svc-modal-close" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-form-row">
                <div className="svc-form-group">
                  <label className="svc-form-label">Service Name *</label>
                  <input className="svc-form-input" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Custom Form Service" />
                </div>
                <div className="svc-form-group">
                  <label className="svc-form-label">Name (Hindi)</label>
                  <input className="svc-form-input" value={formData.name_hindi} onChange={e => updateField('name_hindi', e.target.value)} placeholder="हिंदी नाम" />
                </div>
              </div>

              <div className="svc-form-group">
                <label className="svc-form-label">Description</label>
                <textarea className="svc-form-textarea" value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Describe what this custom service does..." />
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
                  <input className="svc-form-input" value={formData.processing_time} onChange={e => updateField('processing_time', e.target.value)} placeholder="e.g. Instant / 1-2 days" />
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

              <label className="svc-form-checkbox" style={{ marginBottom: 16 }}>
                <input type="checkbox" checked={formData.is_free_service} onChange={e => updateField('is_free_service', e.target.checked)} />
                Free Service (no fees)
              </label>

              {/* Form Fields Builder */}
              <div className="svc-fields-builder">
                <div className="svc-fields-builder-title">
                  <span>Form Fields ({formFields.length})</span>
                </div>
                {formFields.map((field, idx) => (
                  <div key={idx} className="svc-field-item">
                    <div className="svc-field-item-inputs">
                      <input
                        placeholder="Field label"
                        value={field.label}
                        onChange={e => updateFormField(idx, 'label', e.target.value)}
                      />
                      <select value={field.type} onChange={e => updateFormField(idx, 'type', e.target.value)}>
                        {FIELD_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <label className="svc-field-required-toggle">
                        <input type="checkbox" checked={field.required} onChange={e => updateFormField(idx, 'required', e.target.checked)} />
                        Req
                      </label>
                      <button className="svc-field-remove-btn" onClick={() => removeFormField(idx)} title="Remove">
                        <HiOutlineX />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="svc-add-field-btn" onClick={addFormField}>
                  <HiOutlinePlus /> Add Field
                </button>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn svc-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="svc-btn svc-btn-primary" onClick={handleSave} disabled={saving || !formData.name.trim() || !formData.category_id}>
                {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deletingService && (
        <div className="svc-modal-overlay" onClick={() => setDeletingService(null)}>
          <div className="svc-modal svc-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="svc-modal-header">
              <h2>Delete Custom Service</h2>
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

export default CustomServices;
