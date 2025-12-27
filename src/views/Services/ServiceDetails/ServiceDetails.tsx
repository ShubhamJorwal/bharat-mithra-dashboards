import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineClipboardList,
  HiOutlineCube,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineFolder,
  HiOutlineStar,
  HiOutlineFire,
  HiOutlineExclamation,
  HiOutlineExternalLink,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineGlobe,
  HiOutlineQuestionMarkCircle,
  HiOutlineLightningBolt,
  HiOutlineInformationCircle,
  HiOutlineChevronRight,
  HiOutlineMail,
  HiOutlineSupport
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import geographyApi from '../../../services/api/geography.api';
import type {
  Service,
  ServiceCategory,
  ServicePricing,
  ServiceCaseworkerInfo,
  ServiceChecklist,
  ServiceOfficeLocation,
  ServiceFAQ,
  State
} from '../../../types/api.types';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import './ServiceDetails.scss';

type TabType = 'overview' | 'pricing' | 'process' | 'offices' | 'faqs';

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Core data
  const [service, setService] = useState<Service | null>(null);
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [states, setStates] = useState<State[]>([]);

  // Extended data
  const [pricingList, setPricingList] = useState<ServicePricing[]>([]);
  const [caseworkerInfo, setCaseworkerInfo] = useState<ServiceCaseworkerInfo | null>(null);
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([]);
  const [offices, setOffices] = useState<ServiceOfficeLocation[]>([]);
  const [faqs, setFaqs] = useState<ServiceFAQ[]>([]);

  // Selected state for filtering
  const [selectedState, setSelectedState] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch states for dropdown
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await geographyApi.getStates();
        if (response.success && response.data) {
          setStates(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch states:', err);
      }
    };
    fetchStates();
  }, []);

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await servicesApi.getServiceById(id);
        if (response.success && response.data) {
          setService(response.data);
          // Fetch category if we have category_id
          if (response.data.category_id) {
            try {
              const catRes = await servicesApi.getCategoryById(response.data.category_id);
              if (catRes.success && catRes.data) {
                setCategory(catRes.data);
              }
            } catch (e) {
              console.error('Failed to fetch category:', e);
            }
          }
          // Fetch FAQs
          try {
            const faqRes = await servicesApi.getServiceFAQs(id);
            if (faqRes.success && faqRes.data) {
              setFaqs(faqRes.data);
            }
          } catch (e) {
            console.error('Failed to fetch FAQs:', e);
          }
          // Fetch all pricing
          try {
            const pricingRes = await servicesApi.getAllServicePricing(id);
            if (pricingRes.success && pricingRes.data) {
              setPricingList(pricingRes.data);
            }
          } catch (e) {
            console.error('Failed to fetch pricing:', e);
          }
        } else {
          setError(response.message || 'Service not found');
        }
      } catch (err) {
        console.error('Failed to fetch service:', err);
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Fetch state-specific data when state changes
  const fetchStateData = useCallback(async () => {
    if (!id || !selectedState) return;

    try {
      // Fetch caseworker info for selected state
      const cwRes = await servicesApi.getCaseworkerInfo(id, { state_code: selectedState });
      if (cwRes.success && cwRes.data) {
        setCaseworkerInfo(cwRes.data);
      } else {
        setCaseworkerInfo(null);
      }
    } catch (e) {
      console.error('Failed to fetch caseworker info:', e);
      setCaseworkerInfo(null);
    }

    try {
      // Fetch checklists for selected state
      const checkRes = await servicesApi.getServiceChecklists(id, { state_code: selectedState });
      if (checkRes.success && checkRes.data) {
        setChecklists(checkRes.data);
      } else {
        setChecklists([]);
      }
    } catch (e) {
      console.error('Failed to fetch checklists:', e);
      setChecklists([]);
    }

    try {
      // Fetch offices for selected state
      const officeRes = await servicesApi.getServiceOffices(id, { state_code: selectedState });
      if (officeRes.success && officeRes.data) {
        setOffices(officeRes.data);
      } else {
        setOffices([]);
      }
    } catch (e) {
      console.error('Failed to fetch offices:', e);
      setOffices([]);
    }
  }, [id, selectedState]);

  useEffect(() => {
    if (selectedState) {
      fetchStateData();
    }
  }, [selectedState, fetchStateData]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      const response = await servicesApi.deleteService(id);
      if (response.success) {
        navigate('/services');
      } else {
        setError(response.message || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Failed to delete service:', err);
      setError('Failed to delete service');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get pricing for selected state
  const selectedStatePricing = pricingList.find(p => p.state_code === selectedState);

  if (loading) {
    return (
      <div className="svcd">
        <div className="svcd-loading">
          <div className="svcd-loading-spinner"></div>
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="svcd">
        <div className="svcd-error">
          <div className="svcd-error-icon">
            <HiOutlineExclamation />
          </div>
          <h3>Service Not Found</h3>
          <p>{error || 'The requested service could not be found.'}</p>
          <button className="svcd-btn svcd-btn--primary" onClick={() => navigate('/services')}>
            <HiOutlineArrowLeft />
            <span>Back to Services</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="svcd">
      {/* Hero Section */}
      <div className="svcd-hero">
        <button className="svcd-back" onClick={() => navigate('/services')}>
          <HiOutlineArrowLeft />
        </button>

        <div className="svcd-hero-content">
          <div className="svcd-hero-icon">
            <HiOutlineCube />
          </div>
          <div className="svcd-hero-text">
            <div className="svcd-hero-badges">
              {service.is_popular && (
                <span className="svcd-badge svcd-badge--popular">
                  <HiOutlineStar /> Popular
                </span>
              )}
              {service.is_featured && (
                <span className="svcd-badge svcd-badge--featured">
                  <HiOutlineFire /> Featured
                </span>
              )}
              <span className={`svcd-badge svcd-badge--status ${service.is_active ? 'active' : 'inactive'}`}>
                {service.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1>{service.name}</h1>
            {service.name_hindi && <p className="svcd-hero-hindi">{service.name_hindi}</p>}
          </div>
        </div>

        <div className="svcd-hero-actions">
          <select
            className="svcd-state-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state.id} value={state.code}>{state.name}</option>
            ))}
          </select>
          <button
            className="svcd-btn svcd-btn--secondary"
            onClick={() => navigate(`/services/${id}/edit`)}
          >
            <HiOutlinePencil />
            <span>Edit</span>
          </button>
          <button
            className="svcd-btn svcd-btn--danger"
            onClick={() => setDeleteOpen(true)}
          >
            <HiOutlineTrash />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="svcd-stats">
        <div className="svcd-stat">
          <div className="svcd-stat-icon">
            <HiOutlineFolder />
          </div>
          <div className="svcd-stat-content">
            <span className="svcd-stat-value">{category?.name || 'Uncategorized'}</span>
            <span className="svcd-stat-label">Category</span>
          </div>
        </div>
        <div className="svcd-stat">
          <div className="svcd-stat-icon">
            <HiOutlineClock />
          </div>
          <div className="svcd-stat-content">
            <span className="svcd-stat-value">{service.processing_time || '-'}</span>
            <span className="svcd-stat-label">Processing Time</span>
          </div>
        </div>
        <div className="svcd-stat">
          <div className="svcd-stat-icon">
            <HiOutlineCurrencyRupee />
          </div>
          <div className="svcd-stat-content">
            <span className="svcd-stat-value">
              {service.is_free_service ? 'Free' : formatCurrency(selectedStatePricing?.total_fee || service.total_fee)}
            </span>
            <span className="svcd-stat-label">{selectedState ? 'State Fee' : 'Base Fee'}</span>
          </div>
        </div>
        <div className="svcd-stat">
          <div className="svcd-stat-icon">
            <HiOutlineTag />
          </div>
          <div className="svcd-stat-content">
            <span className="svcd-stat-value">#{service.sort_order || 0}</span>
            <span className="svcd-stat-label">Sort Order</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="svcd-tabs">
        <button
          className={`svcd-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <HiOutlineInformationCircle />
          Overview
        </button>
        <button
          className={`svcd-tab ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          <HiOutlineCurrencyRupee />
          Pricing ({pricingList.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'process' ? 'active' : ''}`}
          onClick={() => setActiveTab('process')}
          disabled={!selectedState}
          title={!selectedState ? 'Select a state first' : ''}
        >
          <HiOutlineClipboardList />
          Process
        </button>
        <button
          className={`svcd-tab ${activeTab === 'offices' ? 'active' : ''}`}
          onClick={() => setActiveTab('offices')}
          disabled={!selectedState}
          title={!selectedState ? 'Select a state first' : ''}
        >
          <HiOutlineOfficeBuilding />
          Offices ({offices.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'faqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('faqs')}
        >
          <HiOutlineQuestionMarkCircle />
          FAQs ({faqs.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="svcd-tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="svcd-content">
            <div className="svcd-main">
              {/* Description */}
              <div className="svcd-section">
                <h2 className="svcd-section-title">Description</h2>
                <p className="svcd-section-text">
                  {service.description || 'No description provided.'}
                </p>
                {service.description_hindi && (
                  <p className="svcd-section-text svcd-section-text--hindi">
                    {service.description_hindi}
                  </p>
                )}
              </div>

              {/* Eligibility Criteria */}
              {service.eligibility_criteria && (
                <div className="svcd-section">
                  <h2 className="svcd-section-title">Eligibility Criteria</h2>
                  <div className="svcd-criteria">
                    {service.eligibility_criteria.split('\n').filter(Boolean).map((item, idx) => (
                      <div key={idx} className="svcd-criteria-item">
                        <HiOutlineCheck />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents */}
              {service.required_documents && service.required_documents.length > 0 && (
                <div className="svcd-section">
                  <h2 className="svcd-section-title">Required Documents</h2>
                  <div className="svcd-documents">
                    {service.required_documents.map((doc, idx) => (
                      <div key={idx} className="svcd-document">
                        <HiOutlineDocumentText />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklists */}
              {checklists.length > 0 && (
                <div className="svcd-section">
                  <h2 className="svcd-section-title">Checklists</h2>
                  {checklists.map((checklist) => (
                    <div key={checklist.id} className="svcd-checklist">
                      <h4 className="svcd-checklist-title">{checklist.title}</h4>
                      <div className="svcd-checklist-items">
                        {checklist.items.map((item, idx) => (
                          <div key={idx} className="svcd-checklist-item">
                            <span className="svcd-checklist-number">{item.item_number}</span>
                            <span className="svcd-checklist-text">
                              {item.text}
                              {item.is_mandatory && <span className="svcd-mandatory">*</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="svcd-sidebar">
              {/* Service Info Card */}
              <div className="svcd-card">
                <h3 className="svcd-card-title">
                  <HiOutlineClipboardList />
                  Service Information
                </h3>
                <div className="svcd-card-content">
                  <div className="svcd-info-row">
                    <span className="svcd-info-label">Slug</span>
                    <span className="svcd-info-value svcd-info-value--mono">{service.slug}</span>
                  </div>
                  {service.department && (
                    <div className="svcd-info-row">
                      <span className="svcd-info-label">Department</span>
                      <span className="svcd-info-value">{service.department}</span>
                    </div>
                  )}
                  {service.ministry && (
                    <div className="svcd-info-row">
                      <span className="svcd-info-label">Ministry</span>
                      <span className="svcd-info-value">{service.ministry}</span>
                    </div>
                  )}
                  {!service.is_free_service && (
                    <>
                      <div className="svcd-info-row">
                        <span className="svcd-info-label">Service Fee</span>
                        <span className="svcd-info-value">{formatCurrency(service.service_fee)}</span>
                      </div>
                      <div className="svcd-info-row">
                        <span className="svcd-info-label">Platform Fee</span>
                        <span className="svcd-info-value">{formatCurrency(service.platform_fee)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Links Card */}
              {service.official_url && (
                <div className="svcd-card">
                  <h3 className="svcd-card-title">
                    <HiOutlineExternalLink />
                    External Links
                  </h3>
                  <div className="svcd-card-content">
                    <a href={service.official_url} target="_blank" rel="noopener noreferrer" className="svcd-link">
                      Official Website
                    </a>
                  </div>
                </div>
              )}

              {/* Helpdesk Card - If caseworker info available */}
              {caseworkerInfo?.helpdesk && (
                <div className="svcd-card">
                  <h3 className="svcd-card-title">
                    <HiOutlineSupport />
                    Helpdesk
                  </h3>
                  <div className="svcd-card-content">
                    {caseworkerInfo.helpdesk.toll_free_number && (
                      <div className="svcd-info-row">
                        <span className="svcd-info-label">Toll Free</span>
                        <span className="svcd-info-value">{caseworkerInfo.helpdesk.toll_free_number}</span>
                      </div>
                    )}
                    {caseworkerInfo.helpdesk.email && (
                      <div className="svcd-info-row">
                        <span className="svcd-info-label">Email</span>
                        <span className="svcd-info-value">{caseworkerInfo.helpdesk.email}</span>
                      </div>
                    )}
                    {caseworkerInfo.helpdesk.working_hours && (
                      <div className="svcd-info-row">
                        <span className="svcd-info-label">Hours</span>
                        <span className="svcd-info-value">{caseworkerInfo.helpdesk.working_hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates Card */}
              <div className="svcd-card">
                <h3 className="svcd-card-title">
                  <HiOutlineCalendar />
                  Timeline
                </h3>
                <div className="svcd-card-content">
                  <div className="svcd-info-row">
                    <span className="svcd-info-label">Created</span>
                    <span className="svcd-info-value">{formatDate(service.created_at)}</span>
                  </div>
                  <div className="svcd-info-row">
                    <span className="svcd-info-label">Last Updated</span>
                    <span className="svcd-info-value">{formatDate(service.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="svcd-pricing-tab">
            {pricingList.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineCurrencyRupee />
                <p>No state-wise pricing available. Using default service fee.</p>
              </div>
            ) : (
              <div className="svcd-pricing-grid">
                {pricingList.map((pricing) => (
                  <div key={pricing.id} className={`svcd-pricing-card ${pricing.state_code === selectedState ? 'selected' : ''}`}>
                    <div className="svcd-pricing-header">
                      <div className="svcd-pricing-state">
                        <HiOutlineGlobe />
                        <span>{pricing.state_name || pricing.state_code}</span>
                      </div>
                      {pricing.express_available && (
                        <span className="svcd-pricing-express">
                          <HiOutlineLightningBolt /> Express
                        </span>
                      )}
                    </div>
                    <div className="svcd-pricing-body">
                      <div className="svcd-pricing-total">
                        {formatCurrency(pricing.total_fee)}
                      </div>
                      <div className="svcd-pricing-breakdown">
                        <div className="svcd-pricing-row">
                          <span>Service Fee</span>
                          <span>{formatCurrency(pricing.service_fee)}</span>
                        </div>
                        <div className="svcd-pricing-row">
                          <span>Government Fee</span>
                          <span>{formatCurrency(pricing.government_fee)}</span>
                        </div>
                        <div className="svcd-pricing-row">
                          <span>Platform Fee</span>
                          <span>{formatCurrency(pricing.platform_fee)}</span>
                        </div>
                        {pricing.gst_amount > 0 && (
                          <div className="svcd-pricing-row">
                            <span>GST ({pricing.gst_percentage}%)</span>
                            <span>{formatCurrency(pricing.gst_amount)}</span>
                          </div>
                        )}
                        {pricing.express_available && pricing.express_fee && (
                          <div className="svcd-pricing-row svcd-pricing-row--express">
                            <span>Express Fee</span>
                            <span>+{formatCurrency(pricing.express_fee)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Process Tab */}
        {activeTab === 'process' && (
          <div className="svcd-process-tab">
            {!selectedState ? (
              <div className="svcd-empty">
                <HiOutlineGlobe />
                <p>Please select a state to view the application process.</p>
              </div>
            ) : !caseworkerInfo ? (
              <div className="svcd-empty">
                <HiOutlineClipboardList />
                <p>No process information available for the selected state.</p>
              </div>
            ) : (
              <>
                {/* Portals */}
                {caseworkerInfo.portals && caseworkerInfo.portals.length > 0 && (
                  <div className="svcd-section">
                    <h2 className="svcd-section-title">Official Portals</h2>
                    <div className="svcd-portals">
                      {caseworkerInfo.portals.map((portal, idx) => (
                        <a
                          key={idx}
                          href={portal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="svcd-portal"
                        >
                          <HiOutlineGlobe />
                          <div>
                            <span className="svcd-portal-name">{portal.name}</span>
                            {portal.description && (
                              <span className="svcd-portal-desc">{portal.description}</span>
                            )}
                          </div>
                          <HiOutlineChevronRight />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step by Step Process */}
                {caseworkerInfo.step_by_step_process && caseworkerInfo.step_by_step_process.length > 0 && (
                  <div className="svcd-section">
                    <h2 className="svcd-section-title">Step by Step Process</h2>
                    <div className="svcd-steps">
                      {caseworkerInfo.step_by_step_process.map((step, idx) => (
                        <div key={idx} className="svcd-step">
                          <div className="svcd-step-number">{step.step_number}</div>
                          <div className="svcd-step-content">
                            <h4>{step.title}</h4>
                            <p>{step.description}</p>
                            {step.documents_needed && step.documents_needed.length > 0 && (
                              <div className="svcd-step-docs">
                                <span>Documents:</span>
                                {step.documents_needed.map((doc, dIdx) => (
                                  <span key={dIdx} className="svcd-step-doc">{doc}</span>
                                ))}
                              </div>
                            )}
                            {step.estimated_time && (
                              <span className="svcd-step-time">
                                <HiOutlineClock /> {step.estimated_time}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Submission Info */}
                {caseworkerInfo.form_submission && (
                  <div className="svcd-section">
                    <h2 className="svcd-section-title">Form Submission</h2>
                    <div className="svcd-form-info">
                      <div className="svcd-form-options">
                        <div className={`svcd-form-option ${caseworkerInfo.form_submission.online_available ? 'available' : 'unavailable'}`}>
                          <HiOutlineGlobe />
                          <span>Online</span>
                          <span className="svcd-form-status">
                            {caseworkerInfo.form_submission.online_available ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        <div className={`svcd-form-option ${caseworkerInfo.form_submission.offline_available ? 'available' : 'unavailable'}`}>
                          <HiOutlineOfficeBuilding />
                          <span>Offline</span>
                          <span className="svcd-form-status">
                            {caseworkerInfo.form_submission.offline_available ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </div>
                      {caseworkerInfo.form_submission.online_portal && (
                        <a href={caseworkerInfo.form_submission.online_portal} target="_blank" rel="noopener noreferrer" className="svcd-link">
                          <HiOutlineExternalLink /> Apply Online
                        </a>
                      )}
                      {caseworkerInfo.form_submission.form_download_url && (
                        <a href={caseworkerInfo.form_submission.form_download_url} target="_blank" rel="noopener noreferrer" className="svcd-link">
                          <HiOutlineDocumentText /> Download Form
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {caseworkerInfo.tips && caseworkerInfo.tips.length > 0 && (
                  <div className="svcd-section">
                    <h2 className="svcd-section-title">Tips for Applicants</h2>
                    <div className="svcd-tips">
                      {caseworkerInfo.tips.map((tip, idx) => (
                        <div key={idx} className="svcd-tip">
                          <HiOutlineLightningBolt />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Mistakes */}
                {caseworkerInfo.common_mistakes && caseworkerInfo.common_mistakes.length > 0 && (
                  <div className="svcd-section">
                    <h2 className="svcd-section-title">Common Mistakes to Avoid</h2>
                    <div className="svcd-mistakes">
                      {caseworkerInfo.common_mistakes.map((mistake, idx) => (
                        <div key={idx} className="svcd-mistake">
                          <HiOutlineExclamation />
                          <span>{mistake}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Offices Tab */}
        {activeTab === 'offices' && (
          <div className="svcd-offices-tab">
            {!selectedState ? (
              <div className="svcd-empty">
                <HiOutlineGlobe />
                <p>Please select a state to view office locations.</p>
              </div>
            ) : offices.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineOfficeBuilding />
                <p>No office locations available for the selected state.</p>
              </div>
            ) : (
              <div className="svcd-offices-grid">
                {offices.map((office) => (
                  <div key={office.id} className="svcd-office-card">
                    <div className="svcd-office-header">
                      <span className="svcd-office-type">{office.office_type.replace(/_/g, ' ')}</span>
                    </div>
                    <h4 className="svcd-office-name">{office.office_name}</h4>
                    <div className="svcd-office-address">
                      <HiOutlineLocationMarker />
                      <div>
                        <p>{office.address_line1}</p>
                        {office.address_line2 && <p>{office.address_line2}</p>}
                        <p>{office.city} - {office.pincode}</p>
                      </div>
                    </div>
                    {office.phone && (
                      <div className="svcd-office-contact">
                        <HiOutlinePhone />
                        <span>{office.phone}</span>
                      </div>
                    )}
                    {office.email && (
                      <div className="svcd-office-contact">
                        <HiOutlineMail />
                        <span>{office.email}</span>
                      </div>
                    )}
                    {office.working_hours && (
                      <div className="svcd-office-hours">
                        <HiOutlineClock />
                        <span>{office.working_hours}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="svcd-faqs-tab">
            {faqs.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineQuestionMarkCircle />
                <p>No FAQs available for this service.</p>
              </div>
            ) : (
              <div className="svcd-faqs">
                {faqs.map((faq) => (
                  <div key={faq.id} className="svcd-faq">
                    <div className="svcd-faq-question">
                      <HiOutlineQuestionMarkCircle />
                      <span>{faq.question}</span>
                    </div>
                    <div className="svcd-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service?"
        itemName={service.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ServiceDetails;
