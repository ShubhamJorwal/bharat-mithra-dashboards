import { useState, useEffect, useCallback } from 'react';
import { HiOutlineTemplate, HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';
import platformApi from '../../../services/api/platform.api';
import type { ServiceFieldTemplate } from '../../../types/api.types';
import './FieldTemplates.scss';

const CATEGORIES = ['personal', 'address', 'identity', 'banking', 'education', 'employment', 'property', 'vehicle', 'nominee', 'business'];

const FieldTemplates = () => {
  const [templates, setTemplates] = useState<ServiceFieldTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceFieldTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await platformApi.getFieldTemplates(selectedCategory || undefined);
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const response = await platformApi.deleteFieldTemplate(id);
      if (response.success) {
        fetchTemplates();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByCategory = filteredTemplates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, ServiceFieldTemplate[]>);

  return (
    <div className="bm-field-templates">
      <div className="bm-page-header">
        <div className="bm-page-header-left">
          <HiOutlineTemplate className="bm-page-icon" />
          <div>
            <h1 className="bm-page-title">Field Templates</h1>
            <p className="bm-page-subtitle">Reusable dynamic field templates for service forms</p>
          </div>
        </div>
        <button className="bm-btn bm-btn-primary" onClick={() => setShowCreateModal(true)}>
          <HiOutlinePlus /> Create Template
        </button>
      </div>

      <div className="bm-filters-bar">
        <div className="bm-search-box">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="bm-filter-chips">
          <button
            className={`bm-chip ${selectedCategory === '' ? 'bm-chip--active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >All</button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`bm-chip ${selectedCategory === cat ? 'bm-chip--active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className="bm-stats-row">
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{templates.length}</span>
          <span className="bm-stat-mini-label">Total Templates</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{templates.filter(t => t.is_system).length}</span>
          <span className="bm-stat-mini-label">System Templates</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{Object.keys(groupedByCategory).length}</span>
          <span className="bm-stat-mini-label">Categories</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{templates.reduce((s, t) => s + t.usage_count, 0)}</span>
          <span className="bm-stat-mini-label">Total Usages</span>
        </div>
      </div>

      {loading ? (
        <div className="bm-loading-state">Loading templates...</div>
      ) : (
        <div className="bm-template-groups">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} className="bm-template-group">
              <h3 className="bm-group-title">
                <span className={`bm-cat-dot bm-cat-dot--${category}`} />
                {category.charAt(0).toUpperCase() + category.slice(1)} Templates
                <span className="bm-group-count">{items.length}</span>
              </h3>
              <div className="bm-template-grid">
                {items.map(template => (
                  <div key={template.id} className="bm-template-card">
                    <div className="bm-template-card-header">
                      <h4>{template.template_name}</h4>
                      {template.is_system && <span className="bm-badge bm-badge--system">System</span>}
                    </div>
                    <p className="bm-template-desc">{template.description || 'No description'}</p>
                    <div className="bm-template-meta">
                      <span className="bm-template-slug">{template.template_slug}</span>
                      <span className="bm-template-usage">{template.usage_count} uses</span>
                    </div>
                    <div className="bm-template-fields-preview">
                      {Array.isArray(template.field_schema) && template.field_schema.slice(0, 4).map((field: Record<string, unknown>, i: number) => (
                        <span key={i} className="bm-field-tag">{String(field.label || field.name || 'field')}</span>
                      ))}
                      {Array.isArray(template.field_schema) && template.field_schema.length > 4 && (
                        <span className="bm-field-tag bm-field-tag--more">+{template.field_schema.length - 4} more</span>
                      )}
                    </div>
                    <div className="bm-template-actions">
                      <button className="bm-btn-icon" onClick={() => { setSelectedTemplate(template); setShowPreview(true); }} title="Preview">
                        <HiOutlineEye />
                      </button>
                      <button className="bm-btn-icon" title="Edit">
                        <HiOutlinePencil />
                      </button>
                      {!template.is_system && (
                        <button className="bm-btn-icon bm-btn-icon--danger" onClick={() => handleDelete(template.id)} title="Delete">
                          <HiOutlineTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedByCategory).length === 0 && (
            <div className="bm-empty-state">No field templates found. Create your first template to get started.</div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="bm-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="bm-modal bm-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="bm-modal-header">
              <h2>Template: {selectedTemplate.template_name}</h2>
              <button className="bm-modal-close" onClick={() => setShowPreview(false)}>&times;</button>
            </div>
            <div className="bm-modal-body">
              <div className="bm-preview-info">
                <p><strong>Category:</strong> {selectedTemplate.category}</p>
                <p><strong>Slug:</strong> {selectedTemplate.template_slug}</p>
                <p><strong>System:</strong> {selectedTemplate.is_system ? 'Yes' : 'No'}</p>
                <p><strong>Used by:</strong> {selectedTemplate.usage_count} services</p>
              </div>
              <h3>Fields ({Array.isArray(selectedTemplate.field_schema) ? selectedTemplate.field_schema.length : 0})</h3>
              <div className="bm-fields-table">
                <table>
                  <thead>
                    <tr><th>Field Name</th><th>Label</th><th>Type</th><th>Required</th></tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedTemplate.field_schema) && selectedTemplate.field_schema.map((field: Record<string, unknown>, i: number) => (
                      <tr key={i}>
                        <td><code>{String(field.name || '')}</code></td>
                        <td>{String(field.label || '')}</td>
                        <td><span className="bm-type-badge">{String(field.type || 'text')}</span></td>
                        <td>{field.required ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="bm-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="bm-modal" onClick={e => e.stopPropagation()}>
            <div className="bm-modal-header">
              <h2>Create Field Template</h2>
              <button className="bm-modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="bm-modal-body">
              <p className="bm-info-text">Template creation form will be implemented here. Use the API to create templates with field schema definitions.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldTemplates;
