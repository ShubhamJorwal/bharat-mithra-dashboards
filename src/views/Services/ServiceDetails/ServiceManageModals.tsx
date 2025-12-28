import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HiOutlineX,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineQuestionMarkCircle,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineTag
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type {
  ServiceDocument,
  ServiceWorkflow,
  ServiceFAQ,
  ServicePricing,
  ServiceChecklist,
  ServiceOfficeLocation,
  ServiceContactPerson,
  ServiceStateAvailability,
  ServiceEligibility,
  ServiceStatusMapping,
  State,
  CreateServiceDocumentRequest,
  CreateServiceWorkflowRequest,
  CreateFAQRequest,
  CreateServicePricingRequest,
  CreateServiceChecklistRequest,
  CreateServiceOfficeLocationRequest,
  CreateServiceContactPersonRequest,
  CreateServiceStateAvailabilityRequest,
  CreateServiceEligibilityRequest,
  CreateServiceStatusMappingRequest,
  ServiceDocumentType,
  WorkflowStepType,
  ServiceChecklistType,
  ServiceOfficeType,
  ServiceContactType,
  EligibilityRuleType,
  EligibilityRuleOperator
} from '../../../types/api.types';

// ==================== DOCUMENT MANAGEMENT MODAL ====================
interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  docItem: ServiceDocument | null;
  onSave: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  docItem,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceDocumentRequest>({
    service_id: serviceId,
    document_name: '',
    document_type: 'identity',
    is_mandatory: true,
    sort_order: 0
  });

  const documentTypes: ServiceDocumentType[] = [
    'identity', 'address', 'income', 'photo', 'certificate',
    'medical', 'financial', 'education', 'educational', 'business',
    'property', 'legal', 'supporting', 'other'
  ];

  useEffect(() => {
    if (docItem) {
      setFormData({
        service_id: serviceId,
        document_name: docItem.document_name,
        document_type: docItem.document_type,
        description: docItem.description,
        is_mandatory: docItem.is_mandatory,
        sort_order: docItem.sort_order,
        sample_url: docItem.sample_url,
        accepted_formats: docItem.accepted_formats,
        max_size_mb: docItem.max_size_mb,
        state_specific: docItem.state_specific
      });
    } else {
      setFormData({
        service_id: serviceId,
        document_name: '',
        document_type: 'identity',
        is_mandatory: true,
        sort_order: 0
      });
    }
  }, [docItem, serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (docItem) {
        await servicesApi.updateDocument(docItem.id, {
          document_name: formData.document_name,
          document_type: formData.document_type,
          description: formData.description,
          is_mandatory: formData.is_mandatory,
          sort_order: formData.sort_order,
          sample_url: formData.sample_url,
          accepted_formats: formData.accepted_formats,
          max_size_mb: formData.max_size_mb,
          state_specific: formData.state_specific
        });
      } else {
        await servicesApi.createDocument(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save document:', err);
      setError('Failed to save document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineDocumentText />
          <h3>{docItem ? 'Edit Document' : 'Add Document'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>Document Name *</label>
              <input
                type="text"
                value={formData.document_name}
                onChange={e => setFormData({ ...formData, document_name: e.target.value })}
                placeholder="e.g., Identity Card, Address Proof"
                required
              />
            </div>
            <div className="svc-form-group">
              <label>Document Type *</label>
              <select
                value={formData.document_type}
                onChange={e => setFormData({ ...formData, document_type: e.target.value as ServiceDocumentType })}
                required
              >
                {documentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="svc-form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this document..."
              rows={2}
            />
          </div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>Sort Order</label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="0"
              />
            </div>
            <div className="svc-form-group">
              <label>Max File Size (MB)</label>
              <input
                type="number"
                value={formData.max_size_mb || ''}
                onChange={e => setFormData({ ...formData, max_size_mb: parseInt(e.target.value) || undefined })}
                placeholder="5"
                min="1"
              />
            </div>
          </div>

          <div className="svc-form-group">
            <label>Sample Document URL</label>
            <input
              type="url"
              value={formData.sample_url || ''}
              onChange={e => setFormData({ ...formData, sample_url: e.target.value })}
              placeholder="https://example.com/sample.pdf"
            />
          </div>

          <div className="svc-form-group svc-form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={e => setFormData({ ...formData, is_mandatory: e.target.checked })}
              />
              <span>This document is mandatory</span>
            </label>
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : docItem ? 'Update Document' : 'Add Document'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    globalThis.document.body
  );
};

// ==================== WORKFLOW MANAGEMENT MODAL ====================
interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  step: ServiceWorkflow | null;
  onSave: () => void;
  nextStepNumber: number;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  step,
  onSave,
  nextStepNumber
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceWorkflowRequest>({
    service_id: serviceId,
    step_number: nextStepNumber,
    step_name: '',
    sort_order: nextStepNumber
  });

  const stepTypes: WorkflowStepType[] = ['submission', 'verification', 'approval', 'payment', 'dispatch', 'other'];

  useEffect(() => {
    if (step) {
      setFormData({
        service_id: serviceId,
        step_number: step.step_number,
        step_name: step.step_name,
        step_description: step.step_description,
        sort_order: step.sort_order,
        step_type: step.step_type,
        assigned_role: step.assigned_role,
        sla_hours: step.sla_hours,
        is_optional: step.is_optional,
        can_reject: step.can_reject,
        can_send_back: step.can_send_back,
        notify_applicant: step.notify_applicant,
        notify_email: step.notify_email,
        notify_sms: step.notify_sms
      });
    } else {
      setFormData({
        service_id: serviceId,
        step_number: nextStepNumber,
        step_name: '',
        sort_order: nextStepNumber
      });
    }
  }, [step, serviceId, nextStepNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (step) {
        await servicesApi.updateWorkflowStep(step.id, {
          step_number: formData.step_number,
          step_name: formData.step_name,
          step_description: formData.step_description,
          sort_order: formData.sort_order,
          step_type: formData.step_type,
          assigned_role: formData.assigned_role,
          sla_hours: formData.sla_hours,
          is_optional: formData.is_optional,
          can_reject: formData.can_reject,
          can_send_back: formData.can_send_back,
          notify_applicant: formData.notify_applicant,
          notify_email: formData.notify_email,
          notify_sms: formData.notify_sms
        });
      } else {
        await servicesApi.createWorkflowStep(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save workflow step:', err);
      setError('Failed to save workflow step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal svc-modal--large" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineClipboardList />
          <h3>{step ? 'Edit Workflow Step' : 'Add Workflow Step'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>Step Number *</label>
              <input
                type="number"
                value={formData.step_number}
                onChange={e => setFormData({ ...formData, step_number: parseInt(e.target.value) || 1 })}
                min="1"
                required
              />
            </div>
            <div className="svc-form-group">
              <label>Step Type</label>
              <select
                value={formData.step_type || ''}
                onChange={e => setFormData({ ...formData, step_type: e.target.value as WorkflowStepType || undefined })}
              >
                <option value="">Select Type</option>
                {stepTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>SLA Hours</label>
              <input
                type="number"
                value={formData.sla_hours || ''}
                onChange={e => setFormData({ ...formData, sla_hours: parseInt(e.target.value) || undefined })}
                placeholder="24"
                min="1"
              />
            </div>
          </div>

          <div className="svc-form-group">
            <label>Step Name *</label>
            <input
              type="text"
              value={formData.step_name}
              onChange={e => setFormData({ ...formData, step_name: e.target.value })}
              placeholder="e.g., Document Verification"
              required
            />
          </div>

          <div className="svc-form-group">
            <label>Description</label>
            <textarea
              value={formData.step_description || ''}
              onChange={e => setFormData({ ...formData, step_description: e.target.value })}
              placeholder="Describe what happens in this step..."
              rows={2}
            />
          </div>

          <div className="svc-form-group">
            <label>Assigned Role</label>
            <input
              type="text"
              value={formData.assigned_role || ''}
              onChange={e => setFormData({ ...formData, assigned_role: e.target.value })}
              placeholder="e.g., Verifier, Approver, Admin"
            />
          </div>

          <div className="svc-form-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={formData.is_optional || false}
                onChange={e => setFormData({ ...formData, is_optional: e.target.checked })}
              />
              <span>Optional Step</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.can_reject || false}
                onChange={e => setFormData({ ...formData, can_reject: e.target.checked })}
              />
              <span>Can Reject</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.can_send_back || false}
                onChange={e => setFormData({ ...formData, can_send_back: e.target.checked })}
              />
              <span>Can Send Back</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.notify_applicant || false}
                onChange={e => setFormData({ ...formData, notify_applicant: e.target.checked })}
              />
              <span>Notify Applicant</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.notify_email || false}
                onChange={e => setFormData({ ...formData, notify_email: e.target.checked })}
              />
              <span>Email Notification</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.notify_sms || false}
                onChange={e => setFormData({ ...formData, notify_sms: e.target.checked })}
              />
              <span>SMS Notification</span>
            </label>
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : step ? 'Update Step' : 'Add Step'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== FAQ MANAGEMENT MODAL ====================
interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  faq: ServiceFAQ | null;
  onSave: () => void;
  nextSortOrder: number;
}

export const FAQModal: React.FC<FAQModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  faq,
  onSave,
  nextSortOrder
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateFAQRequest>({
    service_id: serviceId,
    question: '',
    answer: '',
    sort_order: nextSortOrder
  });

  useEffect(() => {
    if (faq) {
      setFormData({
        service_id: serviceId,
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sort_order
      });
    } else {
      setFormData({
        service_id: serviceId,
        question: '',
        answer: '',
        sort_order: nextSortOrder
      });
    }
  }, [faq, serviceId, nextSortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (faq) {
        await servicesApi.updateFAQ(faq.id, {
          question: formData.question,
          answer: formData.answer,
          sort_order: formData.sort_order
        });
      } else {
        await servicesApi.createFAQ(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save FAQ:', err);
      setError('Failed to save FAQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal svc-modal--large" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineQuestionMarkCircle />
          <h3>{faq ? 'Edit FAQ' : 'Add FAQ'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-group">
            <label>Question *</label>
            <textarea
              value={formData.question}
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the frequently asked question..."
              rows={2}
              required
            />
          </div>

          <div className="svc-form-group">
            <label>Answer *</label>
            <textarea
              value={formData.answer}
              onChange={e => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter the answer..."
              rows={4}
              required
            />
          </div>

          <div className="svc-form-group" style={{ maxWidth: '200px' }}>
            <label>Sort Order</label>
            <input
              type="number"
              value={formData.sort_order || 0}
              onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : faq ? 'Update FAQ' : 'Add FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== PRICING MANAGEMENT MODAL ====================
interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  pricing: ServicePricing | null;
  onSave: () => void;
  states: State[];
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  pricing,
  onSave,
  states
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServicePricingRequest>({
    service_id: serviceId,
    service_fee: 0,
    platform_fee: 0,
    government_fee: 0,
    gst_percentage: 18
  });

  useEffect(() => {
    if (pricing) {
      setFormData({
        service_id: serviceId,
        state_code: pricing.state_code || undefined,
        district_code: pricing.district_code || undefined,
        service_fee: pricing.service_fee,
        platform_fee: pricing.platform_fee,
        government_fee: pricing.government_fee,
        convenience_fee: pricing.convenience_fee,
        gst_percentage: pricing.gst_percentage,
        processing_time: pricing.processing_time,
        express_available: pricing.express_available,
        express_fee: pricing.express_fee || undefined,
        express_processing_time: pricing.express_processing_time || undefined,
        valid_from: pricing.valid_from || undefined,
        valid_to: pricing.valid_to || undefined
      });
    } else {
      setFormData({
        service_id: serviceId,
        service_fee: 0,
        platform_fee: 0,
        government_fee: 0,
        gst_percentage: 18
      });
    }
  }, [pricing, serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (pricing) {
        await servicesApi.updatePricing(pricing.id, {
          state_code: formData.state_code,
          district_code: formData.district_code,
          service_fee: formData.service_fee,
          platform_fee: formData.platform_fee,
          government_fee: formData.government_fee,
          convenience_fee: formData.convenience_fee,
          gst_percentage: formData.gst_percentage,
          processing_time: formData.processing_time,
          express_available: formData.express_available,
          express_fee: formData.express_fee,
          express_processing_time: formData.express_processing_time,
          valid_from: formData.valid_from,
          valid_to: formData.valid_to
        });
      } else {
        await servicesApi.createPricing(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save pricing:', err);
      setError('Failed to save pricing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const base = (formData.service_fee || 0) + (formData.platform_fee || 0) + (formData.government_fee || 0) + (formData.convenience_fee || 0);
    const gst = base * ((formData.gst_percentage || 0) / 100);
    return base + gst;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal svc-modal--large" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineCurrencyRupee />
          <h3>{pricing ? 'Edit Pricing' : 'Add State Pricing'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>State *</label>
              <select
                value={formData.state_code || ''}
                onChange={e => setFormData({ ...formData, state_code: e.target.value || undefined })}
                required
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.id} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>Processing Time</label>
              <input
                type="text"
                value={formData.processing_time || ''}
                onChange={e => setFormData({ ...formData, processing_time: e.target.value })}
                placeholder="e.g., 7-10 days"
              />
            </div>
          </div>

          <div className="svc-form-row svc-form-row--4">
            <div className="svc-form-group">
              <label>Service Fee (₹) *</label>
              <input
                type="number"
                value={formData.service_fee}
                onChange={e => setFormData({ ...formData, service_fee: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="svc-form-group">
              <label>Platform Fee (₹) *</label>
              <input
                type="number"
                value={formData.platform_fee}
                onChange={e => setFormData({ ...formData, platform_fee: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="svc-form-group">
              <label>Government Fee (₹)</label>
              <input
                type="number"
                value={formData.government_fee || 0}
                onChange={e => setFormData({ ...formData, government_fee: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="svc-form-group">
              <label>Convenience Fee (₹)</label>
              <input
                type="number"
                value={formData.convenience_fee || 0}
                onChange={e => setFormData({ ...formData, convenience_fee: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>GST Percentage (%)</label>
              <input
                type="number"
                value={formData.gst_percentage || 0}
                onChange={e => setFormData({ ...formData, gst_percentage: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div className="svc-form-group">
              <label>Calculated Total</label>
              <div className="svc-price-display">₹{calculateTotal().toFixed(2)}</div>
            </div>
          </div>

          <div className="svc-form-section-title">Express Processing</div>

          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group svc-form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.express_available || false}
                  onChange={e => setFormData({ ...formData, express_available: e.target.checked })}
                />
                <span>Express Available</span>
              </label>
            </div>
            <div className="svc-form-group">
              <label>Express Fee (₹)</label>
              <input
                type="number"
                value={formData.express_fee || ''}
                onChange={e => setFormData({ ...formData, express_fee: parseFloat(e.target.value) || undefined })}
                min="0"
                step="0.01"
                disabled={!formData.express_available}
              />
            </div>
            <div className="svc-form-group">
              <label>Express Time</label>
              <input
                type="text"
                value={formData.express_processing_time || ''}
                onChange={e => setFormData({ ...formData, express_processing_time: e.target.value })}
                placeholder="e.g., 2-3 days"
                disabled={!formData.express_available}
              />
            </div>
          </div>

          <div className="svc-form-section-title">Validity Period</div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>Valid From</label>
              <input
                type="date"
                value={formData.valid_from || ''}
                onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>
            <div className="svc-form-group">
              <label>Valid To</label>
              <input
                type="date"
                value={formData.valid_to || ''}
                onChange={e => setFormData({ ...formData, valid_to: e.target.value })}
              />
            </div>
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : pricing ? 'Update Pricing' : 'Add Pricing'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== CHECKLIST MANAGEMENT MODAL ====================
interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  checklist: ServiceChecklist | null;
  onSave: () => void;
  states: State[];
  nextItemOrder: number;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  checklist,
  onSave,
  states,
  nextItemOrder
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceChecklistRequest>({
    service_id: serviceId,
    checklist_type: 'pre_application',
    item_order: nextItemOrder,
    item_text: ''
  });

  const checklistTypes: ServiceChecklistType[] = ['pre_application', 'during_application', 'post_application', 'documents', 'eligibility'];

  useEffect(() => {
    if (checklist) {
      setFormData({
        service_id: serviceId,
        state_code: checklist.state_code || undefined,
        checklist_type: checklist.checklist_type,
        item_order: checklist.item_order,
        item_text: checklist.item_text,
        item_description: checklist.item_description,
        is_mandatory: checklist.is_mandatory
      });
    } else {
      setFormData({
        service_id: serviceId,
        checklist_type: 'pre_application',
        item_order: nextItemOrder,
        item_text: ''
      });
    }
  }, [checklist, serviceId, nextItemOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (checklist) {
        await servicesApi.updateChecklist(checklist.id, {
          state_code: formData.state_code,
          checklist_type: formData.checklist_type,
          item_order: formData.item_order,
          item_text: formData.item_text,
          item_description: formData.item_description,
          is_mandatory: formData.is_mandatory
        });
      } else {
        await servicesApi.createChecklist(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save checklist:', err);
      setError('Failed to save checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineCheckCircle />
          <h3>{checklist ? 'Edit Checklist Item' : 'Add Checklist Item'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>Checklist Type *</label>
              <select
                value={formData.checklist_type}
                onChange={e => setFormData({ ...formData, checklist_type: e.target.value as ServiceChecklistType })}
                required
              >
                {checklistTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>Item Order *</label>
              <input
                type="number"
                value={formData.item_order}
                onChange={e => setFormData({ ...formData, item_order: parseInt(e.target.value) || 1 })}
                min="1"
                required
              />
            </div>
            <div className="svc-form-group">
              <label>State (Optional)</label>
              <select
                value={formData.state_code || ''}
                onChange={e => setFormData({ ...formData, state_code: e.target.value || undefined })}
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state.id} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="svc-form-group">
            <label>Item Text *</label>
            <textarea
              value={formData.item_text}
              onChange={e => setFormData({ ...formData, item_text: e.target.value })}
              placeholder="Enter the checklist item..."
              rows={2}
              required
            />
          </div>

          <div className="svc-form-group">
            <label>Description</label>
            <textarea
              value={formData.item_description || ''}
              onChange={e => setFormData({ ...formData, item_description: e.target.value })}
              placeholder="Additional details about this item..."
              rows={2}
            />
          </div>

          <div className="svc-form-group svc-form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.is_mandatory !== false}
                onChange={e => setFormData({ ...formData, is_mandatory: e.target.checked })}
              />
              <span>This is a mandatory item</span>
            </label>
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : checklist ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== OFFICE LOCATION MANAGEMENT MODAL ====================
interface OfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  office: ServiceOfficeLocation | null;
  onSave: () => void;
  states: State[];
}

export const OfficeModal: React.FC<OfficeModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  office,
  onSave,
  states
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceOfficeLocationRequest>({
    service_id: serviceId,
    office_type: 'district_office',
    office_name: '',
    address_line1: '',
    city: '',
    pincode: ''
  });

  const officeTypes: ServiceOfficeType[] = ['head_office', 'regional_office', 'district_office', 'taluk_office', 'service_center', 'common_service_center'];

  useEffect(() => {
    if (office) {
      setFormData({
        service_id: serviceId,
        state_code: office.state_code,
        district_code: office.district_code || undefined,
        office_type: office.office_type,
        office_name: office.office_name,
        address_line1: office.address_line1,
        address_line2: office.address_line2 || undefined,
        city: office.city,
        pincode: office.pincode,
        landmark: office.landmark,
        phone: office.phone || undefined,
        alternate_phone: office.alternate_phone,
        email: office.email || undefined,
        working_hours: office.working_hours || undefined,
        working_days: office.working_days || undefined,
        lunch_break: office.lunch_break,
        latitude: office.latitude || undefined,
        longitude: office.longitude || undefined,
        google_maps_link: office.google_maps_link,
        contact_person: office.contact_person,
        contact_designation: office.contact_designation,
        token_system: office.token_system,
        appointment_required: office.appointment_required,
        appointment_portal_url: office.appointment_portal_url
      });
    } else {
      setFormData({
        service_id: serviceId,
        office_type: 'district_office',
        office_name: '',
        address_line1: '',
        city: '',
        pincode: ''
      });
    }
  }, [office, serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (office) {
        await servicesApi.updateOffice(office.id, formData);
      } else {
        await servicesApi.createOffice(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save office:', err);
      setError('Failed to save office. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal svc-modal--xlarge" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineOfficeBuilding />
          <h3>{office ? 'Edit Office Location' : 'Add Office Location'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form svc-modal-form--scrollable">
          <div className="svc-form-section-title">Basic Information</div>

          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>State *</label>
              <select
                value={formData.state_code || ''}
                onChange={e => setFormData({ ...formData, state_code: e.target.value || undefined })}
                required
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.id} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>Office Type *</label>
              <select
                value={formData.office_type}
                onChange={e => setFormData({ ...formData, office_type: e.target.value as ServiceOfficeType })}
                required
              >
                {officeTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>Pincode *</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="560001"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="svc-form-group">
            <label>Office Name *</label>
            <input
              type="text"
              value={formData.office_name}
              onChange={e => setFormData({ ...formData, office_name: e.target.value })}
              placeholder="e.g., District Collector Office"
              required
            />
          </div>

          <div className="svc-form-section-title">Address</div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>Address Line 1 *</label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="Building name, street"
                required
              />
            </div>
            <div className="svc-form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                value={formData.address_line2 || ''}
                onChange={e => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="Area, locality"
              />
            </div>
          </div>

          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="City name"
                required
              />
            </div>
            <div className="svc-form-group">
              <label>Landmark</label>
              <input
                type="text"
                value={formData.landmark || ''}
                onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Near..."
              />
            </div>
            <div className="svc-form-group">
              <label>Google Maps Link</label>
              <input
                type="url"
                value={formData.google_maps_link || ''}
                onChange={e => setFormData({ ...formData, google_maps_link: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          <div className="svc-form-section-title">Contact Details</div>

          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="080-12345678"
              />
            </div>
            <div className="svc-form-group">
              <label>Alternate Phone</label>
              <input
                type="tel"
                value={formData.alternate_phone || ''}
                onChange={e => setFormData({ ...formData, alternate_phone: e.target.value })}
                placeholder="080-87654321"
              />
            </div>
            <div className="svc-form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="office@example.gov.in"
              />
            </div>
          </div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>Contact Person</label>
              <input
                type="text"
                value={formData.contact_person || ''}
                onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Name of contact person"
              />
            </div>
            <div className="svc-form-group">
              <label>Designation</label>
              <input
                type="text"
                value={formData.contact_designation || ''}
                onChange={e => setFormData({ ...formData, contact_designation: e.target.value })}
                placeholder="e.g., Assistant Director"
              />
            </div>
          </div>

          <div className="svc-form-section-title">Working Hours</div>

          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>Working Hours</label>
              <input
                type="text"
                value={formData.working_hours || ''}
                onChange={e => setFormData({ ...formData, working_hours: e.target.value })}
                placeholder="10:00 AM - 5:00 PM"
              />
            </div>
            <div className="svc-form-group">
              <label>Working Days</label>
              <input
                type="text"
                value={formData.working_days || ''}
                onChange={e => setFormData({ ...formData, working_days: e.target.value })}
                placeholder="Mon - Fri"
              />
            </div>
            <div className="svc-form-group">
              <label>Lunch Break</label>
              <input
                type="text"
                value={formData.lunch_break || ''}
                onChange={e => setFormData({ ...formData, lunch_break: e.target.value })}
                placeholder="1:00 PM - 2:00 PM"
              />
            </div>
          </div>

          <div className="svc-form-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={formData.token_system || false}
                onChange={e => setFormData({ ...formData, token_system: e.target.checked })}
              />
              <span>Token System Available</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.appointment_required || false}
                onChange={e => setFormData({ ...formData, appointment_required: e.target.checked })}
              />
              <span>Appointment Required</span>
            </label>
          </div>

          {formData.appointment_required && (
            <div className="svc-form-group">
              <label>Appointment Portal URL</label>
              <input
                type="url"
                value={formData.appointment_portal_url || ''}
                onChange={e => setFormData({ ...formData, appointment_portal_url: e.target.value })}
                placeholder="https://appointment.example.gov.in"
              />
            </div>
          )}

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : office ? 'Update Office' : 'Add Office'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== CONTACT PERSON MANAGEMENT MODAL ====================
interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  contact: ServiceContactPerson | null;
  onSave: () => void;
  states: State[];
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  contact,
  onSave,
  states
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceContactPersonRequest>({
    service_id: serviceId,
    contact_type: 'nodal_officer',
    name: ''
  });

  const contactTypes: ServiceContactType[] = ['nodal_officer', 'helpdesk', 'grievance', 'technical', 'other'];

  useEffect(() => {
    if (contact) {
      setFormData({
        service_id: serviceId,
        state_code: contact.state_code,
        district_code: contact.district_code,
        contact_type: contact.contact_type,
        name: contact.name,
        designation: contact.designation,
        department: contact.department,
        phone: contact.phone,
        alternate_phone: contact.alternate_phone,
        email: contact.email,
        office_address: contact.office_address,
        availability_hours: contact.availability_hours,
        response_time: contact.response_time,
        is_primary: contact.is_primary
      });
    } else {
      setFormData({
        service_id: serviceId,
        contact_type: 'nodal_officer',
        name: ''
      });
    }
  }, [contact, serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (contact) {
        await servicesApi.updateContact(contact.id, formData);
      } else {
        await servicesApi.createContact(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save contact:', err);
      setError('Failed to save contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal svc-modal--large" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineUserGroup />
          <h3>{contact ? 'Edit Contact Person' : 'Add Contact Person'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>Contact Type *</label>
              <select
                value={formData.contact_type}
                onChange={e => setFormData({ ...formData, contact_type: e.target.value as ServiceContactType })}
                required
              >
                {contactTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>State (Optional)</label>
              <select
                value={formData.state_code || ''}
                onChange={e => setFormData({ ...formData, state_code: e.target.value || undefined })}
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state.id} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
            <div className="svc-form-group svc-form-checkbox" style={{ alignSelf: 'flex-end', paddingBottom: '8px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_primary || false}
                  onChange={e => setFormData({ ...formData, is_primary: e.target.checked })}
                />
                <span>Primary Contact</span>
              </label>
            </div>
          </div>

          <div className="svc-form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>Designation</label>
              <input
                type="text"
                value={formData.designation || ''}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Deputy Director"
              />
            </div>
            <div className="svc-form-group">
              <label>Department</label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Revenue Department"
              />
            </div>
          </div>

          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="080-12345678"
              />
            </div>
            <div className="svc-form-group">
              <label>Alternate Phone</label>
              <input
                type="tel"
                value={formData.alternate_phone || ''}
                onChange={e => setFormData({ ...formData, alternate_phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
            <div className="svc-form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.gov.in"
              />
            </div>
          </div>

          <div className="svc-form-group">
            <label>Office Address</label>
            <textarea
              value={formData.office_address || ''}
              onChange={e => setFormData({ ...formData, office_address: e.target.value })}
              placeholder="Complete office address..."
              rows={2}
            />
          </div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>Availability Hours</label>
              <input
                type="text"
                value={formData.availability_hours || ''}
                onChange={e => setFormData({ ...formData, availability_hours: e.target.value })}
                placeholder="10:00 AM - 5:00 PM, Mon-Fri"
              />
            </div>
            <div className="svc-form-group">
              <label>Response Time</label>
              <input
                type="text"
                value={formData.response_time || ''}
                onChange={e => setFormData({ ...formData, response_time: e.target.value })}
                placeholder="e.g., Within 24 hours"
              />
            </div>
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== STATE AVAILABILITY MANAGEMENT MODAL ====================
interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  availability: ServiceStateAvailability | null;
  onSave: () => void;
  states: State[];
}

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  availability,
  onSave,
  states
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceStateAvailabilityRequest>({
    service_id: serviceId,
    state_code: '',
    is_available: true,
    availability_status: 'available'
  });

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'coming_soon', label: 'Coming Soon' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'discontinued', label: 'Discontinued' }
  ];

  useEffect(() => {
    if (availability) {
      setFormData({
        service_id: serviceId,
        state_code: availability.state_code,
        is_available: availability.is_available,
        availability_status: availability.availability_status,
        launch_date: availability.launch_date || undefined,
        suspension_reason: availability.suspension_reason || undefined,
        alternative_service_id: availability.alternative_service_id || undefined,
        local_service_name: availability.local_service_name,
        local_department: availability.local_department,
        state_portal_url: availability.state_portal_url,
        state_helpline: availability.state_helpline
      });
    } else {
      setFormData({
        service_id: serviceId,
        state_code: '',
        is_available: true,
        availability_status: 'available'
      });
    }
  }, [availability, serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (availability) {
        await servicesApi.updateAvailability(availability.id, formData);
      } else {
        await servicesApi.createAvailability(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save availability:', err);
      setError('Failed to save availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal svc-modal--large" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineGlobe />
          <h3>{availability ? 'Edit State Availability' : 'Add State Availability'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>State *</label>
              <select
                value={formData.state_code}
                onChange={e => setFormData({ ...formData, state_code: e.target.value })}
                required
                disabled={!!availability}
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.id} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>Status *</label>
              <select
                value={formData.availability_status || 'available'}
                onChange={e => setFormData({
                  ...formData,
                  availability_status: e.target.value as 'available' | 'coming_soon' | 'suspended' | 'discontinued',
                  is_available: e.target.value === 'available'
                })}
                required
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>Launch Date</label>
              <input
                type="date"
                value={formData.launch_date || ''}
                onChange={e => setFormData({ ...formData, launch_date: e.target.value })}
              />
            </div>
          </div>

          {(formData.availability_status === 'suspended' || formData.availability_status === 'discontinued') && (
            <div className="svc-form-group">
              <label>Reason for {formData.availability_status === 'suspended' ? 'Suspension' : 'Discontinuation'}</label>
              <textarea
                value={formData.suspension_reason || ''}
                onChange={e => setFormData({ ...formData, suspension_reason: e.target.value })}
                placeholder="Explain why this service is not available..."
                rows={2}
              />
            </div>
          )}

          <div className="svc-form-section-title">Local Service Details</div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>Local Service Name</label>
              <input
                type="text"
                value={formData.local_service_name || ''}
                onChange={e => setFormData({ ...formData, local_service_name: e.target.value })}
                placeholder="State-specific service name"
              />
            </div>
            <div className="svc-form-group">
              <label>Local Department</label>
              <input
                type="text"
                value={formData.local_department || ''}
                onChange={e => setFormData({ ...formData, local_department: e.target.value })}
                placeholder="State department handling this service"
              />
            </div>
          </div>

          <div className="svc-form-row">
            <div className="svc-form-group">
              <label>State Portal URL</label>
              <input
                type="url"
                value={formData.state_portal_url || ''}
                onChange={e => setFormData({ ...formData, state_portal_url: e.target.value })}
                placeholder="https://state-portal.gov.in"
              />
            </div>
            <div className="svc-form-group">
              <label>State Helpline</label>
              <input
                type="text"
                value={formData.state_helpline || ''}
                onChange={e => setFormData({ ...formData, state_helpline: e.target.value })}
                placeholder="1800-xxx-xxxx"
              />
            </div>
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : availability ? 'Update Availability' : 'Add Availability'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== ELIGIBILITY RULE MANAGEMENT MODAL ====================
interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  eligibility: ServiceEligibility | null;
  onSave: () => void;
  nextSortOrder: number;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  eligibility,
  onSave,
  nextSortOrder
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceEligibilityRequest>({
    service_id: serviceId,
    rule_type: 'age',
    rule_operator: 'greater_than_or_equals',
    rule_value: '',
    sort_order: nextSortOrder
  });

  const ruleTypes: EligibilityRuleType[] = ['age', 'income', 'gender', 'caste', 'state', 'occupation', 'education', 'other'];
  const ruleOperators: EligibilityRuleOperator[] = ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equals', 'less_than_or_equals', 'in', 'not_in', 'between'];

  useEffect(() => {
    if (eligibility) {
      setFormData({
        service_id: serviceId,
        rule_type: eligibility.rule_type,
        rule_operator: eligibility.rule_operator,
        rule_value: eligibility.rule_value,
        error_message: eligibility.error_message,
        sort_order: eligibility.sort_order
      });
    } else {
      setFormData({
        service_id: serviceId,
        rule_type: 'age',
        rule_operator: 'greater_than_or_equals',
        rule_value: '',
        sort_order: nextSortOrder
      });
    }
  }, [eligibility, serviceId, nextSortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (eligibility) {
        await servicesApi.updateEligibility(eligibility.id, formData);
      } else {
        await servicesApi.createEligibility(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save eligibility:', err);
      setError('Failed to save eligibility rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineShieldCheck />
          <h3>{eligibility ? 'Edit Eligibility Rule' : 'Add Eligibility Rule'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>Rule Type *</label>
              <select
                value={formData.rule_type}
                onChange={e => setFormData({ ...formData, rule_type: e.target.value as EligibilityRuleType })}
                required
              >
                {ruleTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>Operator *</label>
              <select
                value={formData.rule_operator}
                onChange={e => setFormData({ ...formData, rule_operator: e.target.value as EligibilityRuleOperator })}
                required
              >
                {ruleOperators.map(op => (
                  <option key={op} value={op}>
                    {op.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="svc-form-group">
              <label>Sort Order</label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <div className="svc-form-group">
            <label>Value *</label>
            <input
              type="text"
              value={formData.rule_value}
              onChange={e => setFormData({ ...formData, rule_value: e.target.value })}
              placeholder={formData.rule_type === 'age' ? 'e.g., 18' : formData.rule_type === 'income' ? 'e.g., 250000' : 'Enter value'}
              required
            />
            <small className="svc-form-hint">
              {formData.rule_operator === 'in' || formData.rule_operator === 'not_in'
                ? 'Comma-separated values (e.g., sc,st,obc)'
                : formData.rule_operator === 'between'
                  ? 'Format: min,max (e.g., 18,60)'
                  : 'Single value'}
            </small>
          </div>

          <div className="svc-form-group">
            <label>Error Message</label>
            <input
              type="text"
              value={formData.error_message || ''}
              onChange={e => setFormData({ ...formData, error_message: e.target.value })}
              placeholder="Message shown when eligibility check fails"
            />
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : eligibility ? 'Update Rule' : 'Add Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== STATUS MAPPING MANAGEMENT MODAL ====================
interface StatusMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  statusMapping: ServiceStatusMapping | null;
  onSave: () => void;
  nextSortOrder: number;
}

export const StatusMappingModal: React.FC<StatusMappingModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  statusMapping,
  onSave,
  nextSortOrder
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceStatusMappingRequest>({
    service_id: serviceId,
    status_code: '',
    status_name: '',
    sort_order: nextSortOrder
  });

  const colorOptions = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#6b7280', label: 'Gray' }
  ];

  useEffect(() => {
    if (statusMapping) {
      setFormData({
        service_id: serviceId,
        status_code: statusMapping.status_code,
        status_name: statusMapping.status_name,
        status_description: statusMapping.status_description,
        status_color: statusMapping.status_color,
        status_icon: statusMapping.status_icon,
        sort_order: statusMapping.sort_order,
        is_final: statusMapping.is_final,
        is_success: statusMapping.is_success,
        notify_applicant: statusMapping.notify_applicant
      });
    } else {
      setFormData({
        service_id: serviceId,
        status_code: '',
        status_name: '',
        sort_order: nextSortOrder
      });
    }
  }, [statusMapping, serviceId, nextSortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (statusMapping) {
        await servicesApi.updateStatus(statusMapping.id, formData);
      } else {
        await servicesApi.createStatus(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save status mapping:', err);
      setError('Failed to save status mapping. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header">
          <HiOutlineTag />
          <h3>{statusMapping ? 'Edit Status Mapping' : 'Add Status Mapping'}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {error && (
          <div className="svc-modal-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="svc-modal-form">
          <div className="svc-form-row svc-form-row--3">
            <div className="svc-form-group">
              <label>Status Code *</label>
              <input
                type="text"
                value={formData.status_code}
                onChange={e => setFormData({ ...formData, status_code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                placeholder="e.g., PENDING_VERIFICATION"
                required
              />
            </div>
            <div className="svc-form-group">
              <label>Sort Order</label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="svc-form-group">
              <label>Color</label>
              <select
                value={formData.status_color || ''}
                onChange={e => setFormData({ ...formData, status_color: e.target.value })}
              >
                <option value="">Select Color</option>
                {colorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="svc-form-group">
            <label>Status Name *</label>
            <input
              type="text"
              value={formData.status_name}
              onChange={e => setFormData({ ...formData, status_name: e.target.value })}
              placeholder="e.g., Pending Verification"
              required
            />
          </div>

          <div className="svc-form-group">
            <label>Description</label>
            <textarea
              value={formData.status_description || ''}
              onChange={e => setFormData({ ...formData, status_description: e.target.value })}
              placeholder="What this status means..."
              rows={2}
            />
          </div>

          <div className="svc-form-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={formData.is_final || false}
                onChange={e => setFormData({ ...formData, is_final: e.target.checked })}
              />
              <span>Final Status</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.is_success || false}
                onChange={e => setFormData({ ...formData, is_success: e.target.checked })}
              />
              <span>Success Status</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.notify_applicant || false}
                onChange={e => setFormData({ ...formData, notify_applicant: e.target.checked })}
              />
              <span>Notify Applicant</span>
            </label>
          </div>

          <div className="svc-modal-actions">
            <button type="button" className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="svc-btn svc-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : statusMapping ? 'Update Status' : 'Add Status'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ==================== DELETE CONFIRMATION MODAL ====================
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  loading: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  loading
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal svc-modal--small" onClick={e => e.stopPropagation()}>
        <div className="svc-modal-header svc-modal-header--danger">
          <HiOutlineTrash />
          <h3>{title}</h3>
          <button className="svc-modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        <div className="svc-modal-body">
          <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
          <p className="svc-modal-warning">This action cannot be undone.</p>
        </div>

        <div className="svc-modal-actions">
          <button className="svc-btn svc-btn--secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="svc-btn svc-btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
