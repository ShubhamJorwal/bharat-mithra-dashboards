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
  HiOutlineSupport,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle
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
  ServiceDocument,
  ServiceWorkflow,
  ServiceContactPerson,
  ServiceStateAvailability,
  ServiceEligibility,
  ServiceStatusMapping,
  State
} from '../../../types/api.types';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import {
  DocumentModal,
  WorkflowModal,
  FAQModal,
  PricingModal,
  ChecklistModal,
  OfficeModal,
  ContactModal,
  AvailabilityModal,
  EligibilityModal,
  StatusMappingModal,
  DeleteModal
} from './ServiceManageModals';
import './ServiceDetails.scss';
import './ServiceManageModals.scss';

type TabType = 'overview' | 'documents' | 'workflow' | 'pricing' | 'process' | 'offices' | 'faqs' | 'checklists' | 'contacts' | 'availability' | 'eligibility' | 'statuses';

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
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [workflow, setWorkflow] = useState<ServiceWorkflow[]>([]);
  const [contacts, setContacts] = useState<ServiceContactPerson[]>([]);
  const [availability, setAvailability] = useState<ServiceStateAvailability[]>([]);
  const [eligibility, setEligibility] = useState<ServiceEligibility[]>([]);
  const [statusMappings, setStatusMappings] = useState<ServiceStatusMapping[]>([]);

  // Selected state for filtering
  const [selectedState, setSelectedState] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Modal states
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ServiceDocument | null>(null);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ServiceWorkflow | null>(null);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ServiceFAQ | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<ServicePricing | null>(null);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ServiceChecklist | null>(null);
  const [officeModalOpen, setOfficeModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<ServiceOfficeLocation | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ServiceContactPerson | null>(null);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<ServiceStateAvailability | null>(null);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [editingEligibility, setEditingEligibility] = useState<ServiceEligibility | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<ServiceStatusMapping | null>(null);

  // Delete item modal
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<string>('');
  const [deleteItemId, setDeleteItemId] = useState<string>('');
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [deleteItemLoading, setDeleteItemLoading] = useState(false);

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
  const fetchServiceData = useCallback(async () => {
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
        // Fetch documents
        try {
          const docsRes = await servicesApi.getServiceDocuments(id);
          if (docsRes.success && docsRes.data) {
            setDocuments(docsRes.data);
          }
        } catch (e) {
          console.error('Failed to fetch documents:', e);
        }
        // Fetch workflow
        try {
          const workflowRes = await servicesApi.getServiceWorkflow(id);
          if (workflowRes.success && workflowRes.data) {
            setWorkflow(workflowRes.data);
          }
        } catch (e) {
          console.error('Failed to fetch workflow:', e);
        }
        // Fetch contacts
        try {
          const contactsRes = await servicesApi.getServiceContacts(id);
          if (contactsRes.success && contactsRes.data) {
            setContacts(contactsRes.data);
          }
        } catch (e) {
          console.error('Failed to fetch contacts:', e);
        }
        // Fetch availability
        try {
          const availRes = await servicesApi.getServiceAvailability(id);
          if (availRes.success && availRes.data) {
            setAvailability(availRes.data);
          }
        } catch (e) {
          console.error('Failed to fetch availability:', e);
        }
        // Fetch eligibility rules
        try {
          const eligRes = await servicesApi.getServiceEligibility(id);
          if (eligRes.success && eligRes.data) {
            setEligibility(eligRes.data);
          }
        } catch (e) {
          console.error('Failed to fetch eligibility:', e);
        }
        // Fetch status mappings
        try {
          const statusRes = await servicesApi.getServiceStatuses(id);
          if (statusRes.success && statusRes.data) {
            setStatusMappings(statusRes.data);
          }
        } catch (e) {
          console.error('Failed to fetch statuses:', e);
        }
        // Fetch all checklists
        try {
          const checkRes = await servicesApi.getServiceChecklists(id);
          if (checkRes.success && checkRes.data) {
            setChecklists(checkRes.data);
          }
        } catch (e) {
          console.error('Failed to fetch checklists:', e);
        }
        // Fetch all offices
        try {
          const officeRes = await servicesApi.getServiceOffices(id);
          if (officeRes.success && officeRes.data) {
            setOffices(officeRes.data);
          }
        } catch (e) {
          console.error('Failed to fetch offices:', e);
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
  }, [id]);

  useEffect(() => {
    fetchServiceData();
  }, [fetchServiceData]);

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
  }, [id, selectedState]);

  useEffect(() => {
    if (selectedState) {
      fetchStateData();
    }
  }, [selectedState, fetchStateData]);

  // Refresh functions for each data type
  const refreshDocuments = async () => {
    if (!id) return;
    try {
      const docsRes = await servicesApi.getServiceDocuments(id);
      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh documents:', e);
    }
  };

  const refreshWorkflow = async () => {
    if (!id) return;
    try {
      const workflowRes = await servicesApi.getServiceWorkflow(id);
      if (workflowRes.success && workflowRes.data) {
        setWorkflow(workflowRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh workflow:', e);
    }
  };

  const refreshFaqs = async () => {
    if (!id) return;
    try {
      const faqRes = await servicesApi.getServiceFAQs(id);
      if (faqRes.success && faqRes.data) {
        setFaqs(faqRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh FAQs:', e);
    }
  };

  const refreshPricing = async () => {
    if (!id) return;
    try {
      const pricingRes = await servicesApi.getAllServicePricing(id);
      if (pricingRes.success && pricingRes.data) {
        setPricingList(pricingRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh pricing:', e);
    }
  };

  const refreshChecklists = async () => {
    if (!id) return;
    try {
      const checkRes = await servicesApi.getServiceChecklists(id);
      if (checkRes.success && checkRes.data) {
        setChecklists(checkRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh checklists:', e);
    }
  };

  const refreshOffices = async () => {
    if (!id) return;
    try {
      const officeRes = await servicesApi.getServiceOffices(id);
      if (officeRes.success && officeRes.data) {
        setOffices(officeRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh offices:', e);
    }
  };

  const refreshContacts = async () => {
    if (!id) return;
    try {
      const contactsRes = await servicesApi.getServiceContacts(id);
      if (contactsRes.success && contactsRes.data) {
        setContacts(contactsRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh contacts:', e);
    }
  };

  const refreshAvailability = async () => {
    if (!id) return;
    try {
      const availRes = await servicesApi.getServiceAvailability(id);
      if (availRes.success && availRes.data) {
        setAvailability(availRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh availability:', e);
    }
  };

  const refreshEligibility = async () => {
    if (!id) return;
    try {
      const eligRes = await servicesApi.getServiceEligibility(id);
      if (eligRes.success && eligRes.data) {
        setEligibility(eligRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh eligibility:', e);
    }
  };

  const refreshStatuses = async () => {
    if (!id) return;
    try {
      const statusRes = await servicesApi.getServiceStatuses(id);
      if (statusRes.success && statusRes.data) {
        setStatusMappings(statusRes.data);
      }
    } catch (e) {
      console.error('Failed to refresh statuses:', e);
    }
  };

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

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!deleteItemId || !deleteItemType) return;
    setDeleteItemLoading(true);
    try {
      let response;
      switch (deleteItemType) {
        case 'document':
          response = await servicesApi.deleteDocument(deleteItemId);
          if (response.success) refreshDocuments();
          break;
        case 'workflow':
          response = await servicesApi.deleteWorkflowStep(deleteItemId);
          if (response.success) refreshWorkflow();
          break;
        case 'faq':
          response = await servicesApi.deleteFAQ(deleteItemId);
          if (response.success) refreshFaqs();
          break;
        case 'pricing':
          response = await servicesApi.deletePricing(deleteItemId);
          if (response.success) refreshPricing();
          break;
        case 'checklist':
          response = await servicesApi.deleteChecklist(deleteItemId);
          if (response.success) refreshChecklists();
          break;
        case 'office':
          response = await servicesApi.deleteOffice(deleteItemId);
          if (response.success) refreshOffices();
          break;
        case 'contact':
          response = await servicesApi.deleteContact(deleteItemId);
          if (response.success) refreshContacts();
          break;
        case 'availability':
          response = await servicesApi.deleteAvailability(deleteItemId);
          if (response.success) refreshAvailability();
          break;
        case 'eligibility':
          response = await servicesApi.deleteEligibility(deleteItemId);
          if (response.success) refreshEligibility();
          break;
        case 'status':
          response = await servicesApi.deleteStatus(deleteItemId);
          if (response.success) refreshStatuses();
          break;
      }
    } catch (err) {
      console.error(`Failed to delete ${deleteItemType}:`, err);
    } finally {
      setDeleteItemLoading(false);
      setDeleteItemOpen(false);
      setDeleteItemId('');
      setDeleteItemType('');
      setDeleteItemName('');
    }
  };

  const openDeleteItemModal = (type: string, itemId: string, name: string) => {
    setDeleteItemType(type);
    setDeleteItemId(itemId);
    setDeleteItemName(name);
    setDeleteItemOpen(true);
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

  // Filter data by selected state
  const filteredChecklists = selectedState
    ? checklists.filter(c => !c.state_code || c.state_code === selectedState)
    : checklists;

  const filteredOffices = selectedState
    ? offices.filter(o => o.state_code === selectedState)
    : offices;

  const filteredContacts = selectedState
    ? contacts.filter(c => !c.state_code || c.state_code === selectedState)
    : contacts;

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
          {/* <div className="svcd-hero-icon">
            <HiOutlineCube />
          </div> */}
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
          className={`svcd-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <HiOutlineDocumentText />
          Documents ({documents.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
        >
          <HiOutlineClipboardList />
          Workflow ({workflow.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          <HiOutlineCurrencyRupee />
          Pricing ({pricingList.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'checklists' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklists')}
        >
          <HiOutlineCheckCircle />
          Checklists ({checklists.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'offices' ? 'active' : ''}`}
          onClick={() => setActiveTab('offices')}
        >
          <HiOutlineOfficeBuilding />
          Offices ({offices.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <HiOutlineUserGroup />
          Contacts ({contacts.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          <HiOutlineGlobe />
          Availability ({availability.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'eligibility' ? 'active' : ''}`}
          onClick={() => setActiveTab('eligibility')}
        >
          <HiOutlineShieldCheck />
          Eligibility ({eligibility.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'statuses' ? 'active' : ''}`}
          onClick={() => setActiveTab('statuses')}
        >
          <HiOutlineTag />
          Statuses ({statusMappings.length})
        </button>
        <button
          className={`svcd-tab ${activeTab === 'faqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('faqs')}
        >
          <HiOutlineQuestionMarkCircle />
          FAQs ({faqs.length})
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

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="svcd-documents-tab">
            <div className="svc-tab-header">
              <h3>Required Documents</h3>
              <button className="svc-add-btn" onClick={() => { setEditingDocument(null); setDocumentModalOpen(true); }}>
                <HiOutlinePlus /> Add Document
              </button>
            </div>
            {documents.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineDocumentText />
                <p>No required documents defined for this service.</p>
              </div>
            ) : (
              <>
                <div className="svcd-documents-summary">
                  <div className="svcd-doc-stat">
                    <span className="svcd-doc-stat-value">{documents.filter(d => d.is_mandatory).length}</span>
                    <span className="svcd-doc-stat-label">Mandatory</span>
                  </div>
                  <div className="svcd-doc-stat">
                    <span className="svcd-doc-stat-value">{documents.filter(d => !d.is_mandatory).length}</span>
                    <span className="svcd-doc-stat-label">Optional</span>
                  </div>
                </div>
                <div className="svcd-documents-grid">
                  {documents.sort((a, b) => a.sort_order - b.sort_order).map((doc) => (
                    <div key={doc.id} className={`svcd-document-card svc-item-card ${doc.is_mandatory ? 'mandatory' : 'optional'}`}>
                      <div className="svc-item-actions">
                        <button onClick={() => { setEditingDocument(doc); setDocumentModalOpen(true); }}>
                          <HiOutlinePencil />
                        </button>
                        <button className="delete" onClick={() => openDeleteItemModal('document', doc.id, doc.document_name)}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                      <div className="svcd-document-header">
                        <div className="svcd-document-icon">
                          <HiOutlineDocumentText />
                        </div>
                        <div className="svcd-document-badges">
                          <span className={`svcd-document-type svcd-document-type--${doc.document_type}`}>
                            {doc.document_type.replace(/_/g, ' ')}
                          </span>
                          {doc.is_mandatory ? (
                            <span className="svcd-document-required">Required</span>
                          ) : (
                            <span className="svcd-document-optional">Optional</span>
                          )}
                        </div>
                      </div>
                      <h4 className="svcd-document-name">{doc.document_name}</h4>
                      {doc.description && (
                        <p className="svcd-document-desc">{doc.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="svcd-workflow-tab">
            <div className="svc-tab-header">
              <h3>Workflow Steps</h3>
              <button className="svc-add-btn" onClick={() => { setEditingWorkflow(null); setWorkflowModalOpen(true); }}>
                <HiOutlinePlus /> Add Step
              </button>
            </div>
            {workflow.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineClipboardList />
                <p>No workflow steps defined for this service.</p>
              </div>
            ) : (
              <div className="svcd-workflow-timeline">
                {workflow.sort((a, b) => a.step_number - b.step_number).map((step, index) => (
                  <div key={step.id} className="svcd-workflow-step svc-item-card">
                    <div className="svc-item-actions">
                      <button onClick={() => { setEditingWorkflow(step); setWorkflowModalOpen(true); }}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete" onClick={() => openDeleteItemModal('workflow', step.id, step.step_name)}>
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <div className="svcd-workflow-line">
                      <div className="svcd-workflow-circle">
                        <span>{step.step_number}</span>
                      </div>
                      {index < workflow.length - 1 && <div className="svcd-workflow-connector"></div>}
                    </div>
                    <div className="svcd-workflow-content">
                      <h4 className="svcd-workflow-title">{step.step_name}</h4>
                      {step.step_description && (
                        <p className="svcd-workflow-desc">{step.step_description}</p>
                      )}
                      {step.sla_hours && (
                        <span className="svcd-workflow-sla"><HiOutlineClock /> {step.sla_hours}h SLA</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="svcd-pricing-tab">
            <div className="svc-tab-header">
              <h3>State-wise Pricing</h3>
              <button className="svc-add-btn" onClick={() => { setEditingPricing(null); setPricingModalOpen(true); }}>
                <HiOutlinePlus /> Add Pricing
              </button>
            </div>
            {pricingList.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineCurrencyRupee />
                <p>No state-wise pricing available. Using default service fee.</p>
              </div>
            ) : (
              <div className="svcd-pricing-grid">
                {pricingList.map((pricing) => (
                  <div key={pricing.id} className={`svcd-pricing-card svc-item-card ${pricing.state_code === selectedState ? 'selected' : ''}`}>
                    <div className="svc-item-actions">
                      <button onClick={() => { setEditingPricing(pricing); setPricingModalOpen(true); }}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete" onClick={() => openDeleteItemModal('pricing', pricing.id, pricing.state_name || pricing.state_code || 'Pricing')}>
                        <HiOutlineTrash />
                      </button>
                    </div>
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
                        {formatCurrency(pricing.total_fee ?? (pricing.service_fee + pricing.platform_fee + pricing.government_fee))}
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
                        {pricing.gst_amount && pricing.gst_amount > 0 && (
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

        {/* Checklists Tab */}
        {activeTab === 'checklists' && (
          <div className="svcd-checklists-tab">
            <div className="svc-tab-header">
              <h3>Checklists {selectedState && `(${states.find(s => s.code === selectedState)?.name})`}</h3>
              <button className="svc-add-btn" onClick={() => { setEditingChecklist(null); setChecklistModalOpen(true); }}>
                <HiOutlinePlus /> Add Item
              </button>
            </div>
            {filteredChecklists.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineCheckCircle />
                <p>No checklists defined for this service.</p>
              </div>
            ) : (
              <>
                {/* Group checklists by type */}
                {(() => {
                  const groupedChecklists = filteredChecklists.reduce((acc, item) => {
                    const type = item.checklist_type || 'general';
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(item);
                    return acc;
                  }, {} as Record<string, typeof checklists>);

                  return Object.entries(groupedChecklists).map(([type, items]) => (
                    <div key={type} className="svcd-checklist">
                      <h4 className="svcd-checklist-title">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <div className="svcd-checklist-items">
                        {items.sort((a, b) => a.item_order - b.item_order).map((item) => (
                          <div key={item.id} className="svcd-checklist-item svc-item-card">
                            <div className="svc-item-actions">
                              <button onClick={() => { setEditingChecklist(item); setChecklistModalOpen(true); }}>
                                <HiOutlinePencil />
                              </button>
                              <button className="delete" onClick={() => openDeleteItemModal('checklist', item.id, item.item_text.substring(0, 30))}>
                                <HiOutlineTrash />
                              </button>
                            </div>
                            <span className="svcd-checklist-number">{item.item_order}</span>
                            <span className="svcd-checklist-text">
                              {item.item_text}
                              {item.is_mandatory && <span className="svcd-mandatory">*</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </>
            )}
          </div>
        )}

        {/* Offices Tab */}
        {activeTab === 'offices' && (
          <div className="svcd-offices-tab">
            <div className="svc-tab-header">
              <h3>Office Locations {selectedState && `(${states.find(s => s.code === selectedState)?.name})`}</h3>
              <button className="svc-add-btn" onClick={() => { setEditingOffice(null); setOfficeModalOpen(true); }}>
                <HiOutlinePlus /> Add Office
              </button>
            </div>
            {filteredOffices.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineOfficeBuilding />
                <p>{selectedState ? 'No office locations available for the selected state.' : 'No office locations defined. Select a state or add new offices.'}</p>
              </div>
            ) : (
              <div className="svcd-offices-grid">
                {filteredOffices.map((office) => (
                  <div key={office.id} className="svcd-office-card svc-item-card">
                    <div className="svc-item-actions">
                      <button onClick={() => { setEditingOffice(office); setOfficeModalOpen(true); }}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete" onClick={() => openDeleteItemModal('office', office.id, office.office_name)}>
                        <HiOutlineTrash />
                      </button>
                    </div>
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

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="svcd-contacts-tab">
            <div className="svc-tab-header">
              <h3>Contact Persons {selectedState && `(${states.find(s => s.code === selectedState)?.name})`}</h3>
              <button className="svc-add-btn" onClick={() => { setEditingContact(null); setContactModalOpen(true); }}>
                <HiOutlinePlus /> Add Contact
              </button>
            </div>
            {filteredContacts.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineUserGroup />
                <p>No contact persons defined for this service.</p>
              </div>
            ) : (
              <div className="svcd-contacts-grid">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="svcd-contact-card svc-item-card">
                    <div className="svc-item-actions">
                      <button onClick={() => { setEditingContact(contact); setContactModalOpen(true); }}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete" onClick={() => openDeleteItemModal('contact', contact.id, contact.name)}>
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <div className="svcd-contact-header">
                      <span className={`svcd-contact-type svcd-contact-type--${contact.contact_type}`}>
                        {contact.contact_type.replace(/_/g, ' ')}
                      </span>
                      {contact.is_primary && <span className="svcd-contact-primary">Primary</span>}
                    </div>
                    <h4 className="svcd-contact-name">{contact.name}</h4>
                    {contact.designation && <p className="svcd-contact-designation">{contact.designation}</p>}
                    {contact.department && <p className="svcd-contact-dept">{contact.department}</p>}
                    {contact.phone && (
                      <div className="svcd-contact-info">
                        <HiOutlinePhone />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="svcd-contact-info">
                        <HiOutlineMail />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="svcd-availability-tab">
            <div className="svc-tab-header">
              <h3>State Availability</h3>
              <button className="svc-add-btn" onClick={() => { setEditingAvailability(null); setAvailabilityModalOpen(true); }}>
                <HiOutlinePlus /> Add State
              </button>
            </div>
            {availability.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineGlobe />
                <p>No state availability configured. Service is available in all states by default.</p>
              </div>
            ) : (
              <div className="svcd-availability-grid">
                {availability.map((avail) => (
                  <div key={avail.id} className={`svcd-availability-card svc-item-card ${avail.is_available ? 'available' : 'unavailable'}`}>
                    <div className="svc-item-actions">
                      <button onClick={() => { setEditingAvailability(avail); setAvailabilityModalOpen(true); }}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete" onClick={() => openDeleteItemModal('availability', avail.id, states.find(s => s.code === avail.state_code)?.name || avail.state_code)}>
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <div className="svcd-availability-header">
                      <HiOutlineGlobe />
                      <span>{states.find(s => s.code === avail.state_code)?.name || avail.state_code}</span>
                    </div>
                    <div className={`svcd-availability-status svcd-availability-status--${avail.availability_status || 'available'}`}>
                      {(avail.availability_status || 'available').replace(/_/g, ' ')}
                    </div>
                    {avail.local_service_name && (
                      <p className="svcd-availability-local">Local: {avail.local_service_name}</p>
                    )}
                    {avail.launch_date && (
                      <p className="svcd-availability-date">Launch: {formatDate(avail.launch_date)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Eligibility Tab */}
        {activeTab === 'eligibility' && (
          <div className="svcd-eligibility-tab">
            <div className="svc-tab-header">
              <h3>Eligibility Rules</h3>
              <button className="svc-add-btn" onClick={() => { setEditingEligibility(null); setEligibilityModalOpen(true); }}>
                <HiOutlinePlus /> Add Rule
              </button>
            </div>
            {eligibility.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineShieldCheck />
                <p>No eligibility rules defined for this service.</p>
              </div>
            ) : (
              <div className="svcd-eligibility-list">
                {eligibility.sort((a, b) => a.sort_order - b.sort_order).map((rule) => (
                  <div key={rule.id} className="svcd-eligibility-card svc-item-card">
                    <div className="svc-item-actions">
                      <button onClick={() => { setEditingEligibility(rule); setEligibilityModalOpen(true); }}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete" onClick={() => openDeleteItemModal('eligibility', rule.id, `${rule.rule_type} rule`)}>
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <div className="svcd-eligibility-type">
                      <span className={`svcd-eligibility-badge svcd-eligibility-badge--${rule.rule_type}`}>
                        {rule.rule_type}
                      </span>
                    </div>
                    <div className="svcd-eligibility-rule">
                      <span className="svcd-eligibility-operator">{rule.rule_operator.replace(/_/g, ' ')}</span>
                      <span className="svcd-eligibility-value">{rule.rule_value}</span>
                    </div>
                    {rule.error_message && (
                      <p className="svcd-eligibility-error">{rule.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statuses Tab */}
        {activeTab === 'statuses' && (
          <div className="svcd-statuses-tab">
            <div className="svc-tab-header">
              <h3>Status Mappings</h3>
              <button className="svc-add-btn" onClick={() => { setEditingStatus(null); setStatusModalOpen(true); }}>
                <HiOutlinePlus /> Add Status
              </button>
            </div>
            {statusMappings.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineTag />
                <p>No status mappings defined for this service.</p>
              </div>
            ) : (
              <div className="svcd-statuses-list">
                {statusMappings.sort((a, b) => a.sort_order - b.sort_order).map((status) => (
                  <div key={status.id} className="svcd-status-card svc-item-card">
                    <div className="svc-item-actions">
                      <button onClick={() => { setEditingStatus(status); setStatusModalOpen(true); }}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete" onClick={() => openDeleteItemModal('status', status.id, status.status_name)}>
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <div className="svcd-status-header">
                      <span
                        className="svcd-status-badge"
                        style={{ backgroundColor: status.status_color || '#6b7280' }}
                      >
                        {status.status_name}
                      </span>
                      {status.is_final && <span className="svcd-status-final">Final</span>}
                      {status.is_success && <span className="svcd-status-success">Success</span>}
                    </div>
                    <code className="svcd-status-code">{status.status_code}</code>
                    {status.status_description && (
                      <p className="svcd-status-desc">{status.status_description}</p>
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
            <div className="svc-tab-header">
              <h3>Frequently Asked Questions</h3>
              <button className="svc-add-btn" onClick={() => { setEditingFaq(null); setFaqModalOpen(true); }}>
                <HiOutlinePlus /> Add FAQ
              </button>
            </div>
            {faqs.length === 0 ? (
              <div className="svcd-empty">
                <HiOutlineQuestionMarkCircle />
                <p>No FAQs available for this service.</p>
              </div>
            ) : (
              <div className="svcd-faqs">
                {faqs.map((faq) => (
                  <div key={faq.id} className="svcd-faq svc-item-card">
                    <div className="svc-item-actions">
                      <button onClick={() => { setEditingFaq(faq); setFaqModalOpen(true); }}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete" onClick={() => openDeleteItemModal('faq', faq.id, faq.question.substring(0, 30))}>
                        <HiOutlineTrash />
                      </button>
                    </div>
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
      </div>

      {/* Delete Service Confirmation */}
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

      {/* Delete Item Confirmation */}
      <DeleteModal
        isOpen={deleteItemOpen}
        onClose={() => {
          setDeleteItemOpen(false);
          setDeleteItemId('');
          setDeleteItemType('');
          setDeleteItemName('');
        }}
        onConfirm={handleDeleteItem}
        title={`Delete ${deleteItemType.charAt(0).toUpperCase() + deleteItemType.slice(1)}`}
        itemName={deleteItemName}
        loading={deleteItemLoading}
      />

      {/* Management Modals */}
      {id && (
        <>
          <DocumentModal
            isOpen={documentModalOpen}
            onClose={() => { setDocumentModalOpen(false); setEditingDocument(null); }}
            serviceId={id}
            docItem={editingDocument}
            onSave={refreshDocuments}
          />

          <WorkflowModal
            isOpen={workflowModalOpen}
            onClose={() => { setWorkflowModalOpen(false); setEditingWorkflow(null); }}
            serviceId={id}
            step={editingWorkflow}
            onSave={refreshWorkflow}
            nextStepNumber={workflow.length + 1}
          />

          <FAQModal
            isOpen={faqModalOpen}
            onClose={() => { setFaqModalOpen(false); setEditingFaq(null); }}
            serviceId={id}
            faq={editingFaq}
            onSave={refreshFaqs}
            nextSortOrder={faqs.length + 1}
          />

          <PricingModal
            isOpen={pricingModalOpen}
            onClose={() => { setPricingModalOpen(false); setEditingPricing(null); }}
            serviceId={id}
            pricing={editingPricing}
            onSave={refreshPricing}
            states={states}
          />

          <ChecklistModal
            isOpen={checklistModalOpen}
            onClose={() => { setChecklistModalOpen(false); setEditingChecklist(null); }}
            serviceId={id}
            checklist={editingChecklist}
            onSave={refreshChecklists}
            states={states}
            nextItemOrder={checklists.length + 1}
          />

          <OfficeModal
            isOpen={officeModalOpen}
            onClose={() => { setOfficeModalOpen(false); setEditingOffice(null); }}
            serviceId={id}
            office={editingOffice}
            onSave={refreshOffices}
            states={states}
          />

          <ContactModal
            isOpen={contactModalOpen}
            onClose={() => { setContactModalOpen(false); setEditingContact(null); }}
            serviceId={id}
            contact={editingContact}
            onSave={refreshContacts}
            states={states}
          />

          <AvailabilityModal
            isOpen={availabilityModalOpen}
            onClose={() => { setAvailabilityModalOpen(false); setEditingAvailability(null); }}
            serviceId={id}
            availability={editingAvailability}
            onSave={refreshAvailability}
            states={states}
          />

          <EligibilityModal
            isOpen={eligibilityModalOpen}
            onClose={() => { setEligibilityModalOpen(false); setEditingEligibility(null); }}
            serviceId={id}
            eligibility={editingEligibility}
            onSave={refreshEligibility}
            nextSortOrder={eligibility.length + 1}
          />

          <StatusMappingModal
            isOpen={statusModalOpen}
            onClose={() => { setStatusModalOpen(false); setEditingStatus(null); }}
            serviceId={id}
            statusMapping={editingStatus}
            onSave={refreshStatuses}
            nextSortOrder={statusMappings.length + 1}
          />
        </>
      )}
    </div>
  );
};

export default ServiceDetails;
