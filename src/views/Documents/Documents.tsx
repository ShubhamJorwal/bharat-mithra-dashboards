import { useState, useMemo, useCallback } from 'react';
import {
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineX,
  HiOutlineCloudUpload,
  HiOutlineFolder,
  HiOutlineFolderOpen,
  HiOutlineDocumentDuplicate,
  HiOutlinePhotograph,
  HiOutlineTable,
  HiOutlineCheck,
} from 'react-icons/hi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PageHeader } from '../../components/common/PageHeader';
import './Documents.scss';

// ============================================
// TYPES
// ============================================
interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'spreadsheet' | 'document' | 'other';
  category: string;
  size: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  status: 'active' | 'archived' | 'draft';
}

type ViewMode = 'grid' | 'list';

const CATEGORIES = [
  'Certificates', 'Applications', 'Invoices', 'Reports', 'Policies', 'Notices', 'Letters', 'Forms', 'Other'
];

const FILE_TYPES: { value: Document['type']; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'document', label: 'Document' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'image', label: 'Image' },
  { value: 'other', label: 'Other' },
];

const typeIcons: Record<Document['type'], React.ReactNode> = {
  pdf: <HiOutlineDocumentText />,
  document: <HiOutlineDocumentDuplicate />,
  spreadsheet: <HiOutlineTable />,
  image: <HiOutlinePhotograph />,
  other: <HiOutlineFolder />,
};

const typeColors: Record<Document['type'], string> = {
  pdf: '#ef4444',
  document: '#3b82f6',
  spreadsheet: '#22c55e',
  image: '#a855f7',
  other: '#6b7280',
};

// ============================================
// INITIAL DATA
// ============================================
const initialDocuments: Document[] = [
  { id: '1', name: 'Income Certificate Template', type: 'pdf', category: 'Certificates', size: '245 KB', description: 'Standard income certificate template for district officers', uploadedBy: 'Admin', uploadedAt: '2025-12-15', tags: ['template', 'certificate', 'income'], status: 'active' },
  { id: '2', name: 'Land Revenue Policy 2025', type: 'pdf', category: 'Policies', size: '1.2 MB', description: 'Updated land revenue collection policy for all states', uploadedBy: 'Rajesh Kumar', uploadedAt: '2025-11-20', tags: ['policy', 'revenue', 'land'], status: 'active' },
  { id: '3', name: 'Monthly Performance Report', type: 'spreadsheet', category: 'Reports', size: '890 KB', description: 'Staff performance metrics spreadsheet for December', uploadedBy: 'Priya Sharma', uploadedAt: '2026-01-05', tags: ['report', 'performance', 'monthly'], status: 'active' },
  { id: '4', name: 'Application Form - Caste Certificate', type: 'document', category: 'Forms', size: '156 KB', description: 'Official application form for caste certificate issuance', uploadedBy: 'Admin', uploadedAt: '2025-10-12', tags: ['form', 'caste', 'certificate'], status: 'active' },
  { id: '5', name: 'Office Renovation Invoice', type: 'pdf', category: 'Invoices', size: '320 KB', description: 'Invoice for Mumbai district office renovation', uploadedBy: 'Amit Patel', uploadedAt: '2025-09-28', tags: ['invoice', 'renovation'], status: 'archived' },
  { id: '6', name: 'Staff ID Card Photos', type: 'image', category: 'Other', size: '4.5 MB', description: 'Batch upload of staff ID card photographs', uploadedBy: 'Vikram Chauhan', uploadedAt: '2026-01-15', tags: ['photo', 'id', 'staff'], status: 'active' },
  { id: '7', name: 'Public Holiday Notice 2026', type: 'document', category: 'Notices', size: '78 KB', description: 'Official public holiday calendar notice', uploadedBy: 'Admin', uploadedAt: '2026-01-01', tags: ['notice', 'holiday'], status: 'active' },
  { id: '8', name: 'Domicile Certificate Template', type: 'pdf', category: 'Certificates', size: '210 KB', description: 'Standard domicile certificate template', uploadedBy: 'Admin', uploadedAt: '2025-08-20', tags: ['template', 'certificate', 'domicile'], status: 'draft' },
  { id: '9', name: 'Budget Allocation Sheet', type: 'spreadsheet', category: 'Reports', size: '1.8 MB', description: 'Annual budget allocation breakdown by department', uploadedBy: 'Sneha Reddy', uploadedAt: '2026-02-01', tags: ['budget', 'finance', 'annual'], status: 'active' },
  { id: '10', name: 'Cover Letter Template', type: 'document', category: 'Letters', size: '92 KB', description: 'Standard government cover letter template', uploadedBy: 'Meera Joshi', uploadedAt: '2025-07-14', tags: ['template', 'letter'], status: 'active' },
];

// ============================================
// COMPONENT
// ============================================
const Documents = () => {
  const [documents, setDocuments] = useLocalStorage<Document[]>('bm-documents', initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    name: '', type: 'pdf' as Document['type'], category: 'Certificates', size: '', description: '', uploadedBy: '', tags: '', status: 'active' as Document['status'],
  });

  // Stats
  const stats = useMemo(() => ({
    total: documents.length,
    active: documents.filter(d => d.status === 'active').length,
    archived: documents.filter(d => d.status === 'archived').length,
    drafts: documents.filter(d => d.status === 'draft').length,
  }), [documents]);

  // Filtering
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = filterCategory === 'all' || doc.category === filterCategory;
      const matchType = filterType === 'all' || doc.type === filterType;
      const matchStatus = filterStatus === 'all' || doc.status === filterStatus;
      return matchSearch && matchCategory && matchType && matchStatus;
    });
  }, [documents, searchQuery, filterCategory, filterType, filterStatus]);

  // CRUD
  const resetForm = useCallback(() => {
    setFormData({ name: '', type: 'pdf', category: 'Certificates', size: '', description: '', uploadedBy: '', tags: '', status: 'active' });
    setEditingDoc(null);
  }, []);

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({ name: doc.name, type: doc.type, category: doc.category, size: doc.size, description: doc.description, uploadedBy: doc.uploadedBy, tags: doc.tags.join(', '), status: doc.status });
    setShowModal(true);
  };

  const openView = (doc: Document) => { setViewingDoc(doc); setShowViewModal(true); };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (editingDoc) {
      setDocuments(documents.map(d => d.id === editingDoc.id ? { ...d, name: formData.name, type: formData.type, category: formData.category, size: formData.size || d.size, description: formData.description, uploadedBy: formData.uploadedBy || d.uploadedBy, tags: tagsArr, status: formData.status } : d));
    } else {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        category: formData.category,
        size: formData.size || '0 KB',
        description: formData.description,
        uploadedBy: formData.uploadedBy || 'Admin',
        uploadedAt: new Date().toISOString().split('T')[0],
        tags: tagsArr,
        status: formData.status,
      };
      setDocuments([newDoc, ...documents]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingDoc) return;
    setDocuments(documents.filter(d => d.id !== deletingDoc.id));
    setShowDeleteConfirm(false);
    setDeletingDoc(null);
  };

  const confirmDelete = (doc: Document) => { setDeletingDoc(doc); setShowDeleteConfirm(true); };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'doc-status--active';
      case 'archived': return 'doc-status--archived';
      case 'draft': return 'doc-status--draft';
      default: return '';
    }
  };

  return (
    <div className="doc-page">
      <PageHeader
        icon={<HiOutlineDocumentText />}
        title="Documents"
        description="Upload, manage, and organize your documents"
        actions={
          <button className="doc-btn doc-btn--primary" onClick={openCreate}>
            <HiOutlinePlus /> <span>Upload Document</span>
          </button>
        }
      />

      {/* Stats */}
      <div className="doc-stats">
        <div className="doc-stat">
          <div className="doc-stat__icon doc-stat__icon--primary"><HiOutlineFolder /></div>
          <div className="doc-stat__info"><span className="doc-stat__value">{stats.total}</span><span className="doc-stat__label">Total Documents</span></div>
        </div>
        <div className="doc-stat">
          <div className="doc-stat__icon doc-stat__icon--success"><HiOutlineCheck /></div>
          <div className="doc-stat__info"><span className="doc-stat__value">{stats.active}</span><span className="doc-stat__label">Active</span></div>
        </div>
        <div className="doc-stat">
          <div className="doc-stat__icon doc-stat__icon--warning"><HiOutlineFolderOpen /></div>
          <div className="doc-stat__info"><span className="doc-stat__value">{stats.archived}</span><span className="doc-stat__label">Archived</span></div>
        </div>
        <div className="doc-stat">
          <div className="doc-stat__icon doc-stat__icon--info"><HiOutlineDocumentDuplicate /></div>
          <div className="doc-stat__info"><span className="doc-stat__value">{stats.drafts}</span><span className="doc-stat__label">Drafts</span></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="doc-toolbar">
        <div className="doc-search">
          <HiOutlineSearch />
          <input type="text" placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="doc-filters">
          <div className="doc-filter-group">
            <HiOutlineFilter />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="doc-select">
            <option value="all">All Types</option>
            {FILE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="doc-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>
          <div className="doc-view-toggle">
            <button className={`doc-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button className={`doc-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="doc-grid">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="doc-card" onClick={() => openView(doc)}>
              <div className="doc-card__icon" style={{ color: typeColors[doc.type], background: `${typeColors[doc.type]}15` }}>
                {typeIcons[doc.type]}
              </div>
              <div className="doc-card__body">
                <h3 className="doc-card__name">{doc.name}</h3>
                <p className="doc-card__desc">{doc.description}</p>
                <div className="doc-card__meta">
                  <span className="doc-card__category">{doc.category}</span>
                  <span className="doc-card__size">{doc.size}</span>
                </div>
                <div className="doc-card__tags">
                  {doc.tags.slice(0, 3).map(tag => <span key={tag} className="doc-tag">{tag}</span>)}
                </div>
              </div>
              <div className="doc-card__footer">
                <div className="doc-card__date">{formatDate(doc.uploadedAt)}</div>
                <span className={`doc-status ${getStatusClass(doc.status)}`}>{doc.status}</span>
              </div>
              <div className="doc-card__actions" onClick={e => e.stopPropagation()}>
                <button className="doc-icon-btn" onClick={() => openView(doc)} title="View"><HiOutlineEye /></button>
                <button className="doc-icon-btn" onClick={() => openEdit(doc)} title="Edit"><HiOutlinePencil /></button>
                <button className="doc-icon-btn doc-icon-btn--danger" onClick={() => confirmDelete(doc)} title="Delete"><HiOutlineTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="doc-list-card">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className="doc-table__name-cell">
                      <span className="doc-table__icon" style={{ color: typeColors[doc.type] }}>{typeIcons[doc.type]}</span>
                      <div>
                        <span className="doc-table__name">{doc.name}</span>
                        <span className="doc-table__desc">{doc.description.slice(0, 60)}...</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="doc-card__category">{doc.category}</span></td>
                  <td className="doc-table__type">{doc.type.toUpperCase()}</td>
                  <td>{doc.size}</td>
                  <td>{doc.uploadedBy}</td>
                  <td>{formatDate(doc.uploadedAt)}</td>
                  <td><span className={`doc-status ${getStatusClass(doc.status)}`}>{doc.status}</span></td>
                  <td>
                    <div className="doc-table__actions">
                      <button className="doc-icon-btn" onClick={() => openView(doc)} title="View"><HiOutlineEye /></button>
                      <button className="doc-icon-btn" onClick={() => openEdit(doc)} title="Edit"><HiOutlinePencil /></button>
                      <button className="doc-icon-btn doc-icon-btn--danger" onClick={() => confirmDelete(doc)} title="Delete"><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredDocs.length === 0 && (
        <div className="doc-empty">
          <HiOutlineDocumentText />
          <h3>No documents found</h3>
          <p>Try adjusting your search or filters, or upload a new document</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="doc-modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="doc-modal" onClick={e => e.stopPropagation()}>
            <div className="doc-modal__header">
              <h2>{editingDoc ? 'Edit Document' : 'Upload Document'}</h2>
              <button className="doc-modal__close" onClick={() => { setShowModal(false); resetForm(); }}><HiOutlineX /></button>
            </div>
            <div className="doc-modal__body">
              {!editingDoc && (
                <div className="doc-upload-zone">
                  <HiOutlineCloudUpload />
                  <p>Drag & drop files here or click to browse</p>
                  <span>Supports PDF, DOC, XLS, JPG, PNG (max 10MB)</span>
                </div>
              )}
              <div className="doc-form">
                <div className="doc-form__field doc-form__field--full">
                  <label>Document Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter document name" />
                </div>
                <div className="doc-form__field">
                  <label>File Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as Document['type'] })}>
                    {FILE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="doc-form__field">
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="doc-form__field">
                  <label>File Size</label>
                  <input type="text" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} placeholder="e.g. 245 KB" />
                </div>
                <div className="doc-form__field">
                  <label>Uploaded By</label>
                  <input type="text" value={formData.uploadedBy} onChange={e => setFormData({ ...formData, uploadedBy: e.target.value })} placeholder="Your name" />
                </div>
                <div className="doc-form__field doc-form__field--full">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the document" rows={3} />
                </div>
                <div className="doc-form__field doc-form__field--full">
                  <label>Tags (comma separated)</label>
                  <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. template, certificate, income" />
                </div>
                <div className="doc-form__field">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as Document['status'] })}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="doc-modal__footer">
              <button className="doc-btn doc-btn--outline" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              <button className="doc-btn doc-btn--primary" onClick={handleSave}>{editingDoc ? 'Save Changes' : 'Upload'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingDoc && (
        <div className="doc-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="doc-modal" onClick={e => e.stopPropagation()}>
            <div className="doc-modal__header">
              <h2>Document Details</h2>
              <button className="doc-modal__close" onClick={() => setShowViewModal(false)}><HiOutlineX /></button>
            </div>
            <div className="doc-modal__body">
              <div className="doc-detail">
                <div className="doc-detail__header">
                  <div className="doc-detail__icon" style={{ color: typeColors[viewingDoc.type], background: `${typeColors[viewingDoc.type]}15` }}>
                    {typeIcons[viewingDoc.type]}
                  </div>
                  <div>
                    <h3>{viewingDoc.name}</h3>
                    <span className={`doc-status ${getStatusClass(viewingDoc.status)}`}>{viewingDoc.status}</span>
                  </div>
                </div>
                <p className="doc-detail__desc">{viewingDoc.description}</p>
                <div className="doc-detail__grid">
                  <div className="doc-detail__item"><span className="doc-detail__label">Category</span><span className="doc-detail__value">{viewingDoc.category}</span></div>
                  <div className="doc-detail__item"><span className="doc-detail__label">Type</span><span className="doc-detail__value">{viewingDoc.type.toUpperCase()}</span></div>
                  <div className="doc-detail__item"><span className="doc-detail__label">Size</span><span className="doc-detail__value">{viewingDoc.size}</span></div>
                  <div className="doc-detail__item"><span className="doc-detail__label">Uploaded By</span><span className="doc-detail__value">{viewingDoc.uploadedBy}</span></div>
                  <div className="doc-detail__item"><span className="doc-detail__label">Date</span><span className="doc-detail__value">{formatDate(viewingDoc.uploadedAt)}</span></div>
                </div>
                {viewingDoc.tags.length > 0 && (
                  <div className="doc-detail__tags">
                    <span className="doc-detail__label">Tags</span>
                    <div className="doc-card__tags">{viewingDoc.tags.map(tag => <span key={tag} className="doc-tag">{tag}</span>)}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="doc-modal__footer">
              <button className="doc-btn doc-btn--outline" onClick={() => { setShowViewModal(false); openEdit(viewingDoc); }}>
                <HiOutlinePencil /> Edit
              </button>
              <button className="doc-btn doc-btn--primary">
                <HiOutlineDownload /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && deletingDoc && (
        <div className="doc-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="doc-modal doc-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="doc-modal__body">
              <div className="doc-confirm">
                <div className="doc-confirm__icon"><HiOutlineTrash /></div>
                <h3>Delete Document?</h3>
                <p>Are you sure you want to delete "<strong>{deletingDoc.name}</strong>"? This action cannot be undone.</p>
                <div className="doc-confirm__actions">
                  <button className="doc-btn doc-btn--outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  <button className="doc-btn doc-btn--danger" onClick={handleDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
