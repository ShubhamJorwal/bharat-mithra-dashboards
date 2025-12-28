import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineClipboardList,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineIdentification,
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
  HiOutlineCheck,
  HiOutlineExclamationCircle,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUpload,
  HiOutlinePhotograph,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineExclamation
} from 'react-icons/hi';
import servicesApi from '../../services/api/services.api';
import applicationsApi from '../../services/api/applications.api';
import type { Service, ServiceCategory, CreateApplicationRequest, ServiceDocument, ServicePricing, CreateApplicationV2Request, ApplicationDocumentInput } from '../../types/api.types';
import './ApplicationCreate.scss';

// Document upload type for form submission
interface DocumentUpload {
  document_type: string;
  document_name: string;
  file_url: string;
  file?: File;
  document_number?: string;
  preview_url?: string;
}

const ApplicationCreate = () => {
  const navigate = useNavigate();

  // Form steps - Now 5 steps with documents
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Service selection filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const perPage = 10;

  // Required documents for selected service
  const [requiredDocuments, setRequiredDocuments] = useState<ServiceDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Document uploads
  const [documentUploads, setDocumentUploads] = useState<Record<string, DocumentUpload>>({});

  // State-specific pricing
  const [servicePricing, setServicePricing] = useState<ServicePricing | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<CreateApplicationRequest>>({
    service_id: '',
    applicant_name: '',
    applicant_mobile: '',
    applicant_email: '',
    applicant_father_name: '',
    applicant_mother_name: '',
    applicant_dob: '',
    applicant_gender: '',
    applicant_religion: '',
    applicant_caste_category: '',
    applicant_occupation: '',
    applicant_annual_income: undefined,
    applicant_marital_status: '',
    applicant_aadhaar_last4: '',
    applicant_pan_number: '',
    doc_address_line1: '',
    doc_address_line2: '',
    doc_address_landmark: '',
    doc_address_village: '',
    doc_address_taluk: '',
    doc_address_district: '',
    doc_address_state_code: '',
    doc_address_pincode: '',
    is_address_same_as_document: true,
    is_urgent: false
  });

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Selected service details
  const selectedService = services.find(s => s.id === formData.service_id);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await servicesApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch services with search and filter
  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    setError(null);
    try {
      let response;

      if (searchQuery.trim()) {
        // Use search endpoint
        response = await servicesApi.searchServices(searchQuery, currentPage, perPage);
      } else if (selectedCategory) {
        // Use category filter endpoint
        const categoryResponse = await servicesApi.getServicesByCategory(selectedCategory);
        if (categoryResponse.success && categoryResponse.data) {
          setServices(categoryResponse.data);
          setTotalServices(categoryResponse.data.length);
          setTotalPages(1);
        } else {
          setServices([]);
          setTotalServices(0);
        }
        setLoadingServices(false);
        return;
      } else {
        // Get all services with pagination
        response = await servicesApi.getServices({ page: currentPage, per_page: perPage });
      }

      if (response.success && response.data) {
        setServices(response.data);
        if (response.meta) {
          setTotalPages(response.meta.total_pages || 1);
          setTotalServices(response.meta.total || response.data.length);
        } else {
          setTotalPages(1);
          setTotalServices(response.data.length);
        }
      } else {
        setServices([]);
        setTotalServices(0);
        setError(response.message || 'Failed to fetch services');
      }
    } catch (err: unknown) {
      console.error('Failed to fetch services:', err);
      setServices([]);
      setTotalServices(0);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services. Please try again.';
      setError(errorMessage);
    } finally {
      setLoadingServices(false);
    }
  }, [searchQuery, selectedCategory, currentPage, perPage]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchServices();
      }
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory]);

  // Fetch required documents when service is selected
  useEffect(() => {
    const fetchServiceDocuments = async () => {
      if (!formData.service_id) {
        setRequiredDocuments([]);
        setDocumentUploads({});
        return;
      }

      setLoadingDocuments(true);
      try {
        const response = await servicesApi.getServiceDocuments(formData.service_id);
        if (response.success && response.data) {
          setRequiredDocuments(response.data);
          // Initialize document uploads state
          const initialUploads: Record<string, DocumentUpload> = {};
          response.data.forEach(doc => {
            initialUploads[doc.id] = {
              document_type: doc.document_type,
              document_name: doc.document_name,
              file_url: '',
              document_number: ''
            };
          });
          setDocumentUploads(initialUploads);
        }
      } catch (err) {
        console.error('Failed to fetch service documents:', err);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchServiceDocuments();
  }, [formData.service_id]);

  // Fetch pricing when state is selected
  useEffect(() => {
    const fetchPricing = async () => {
      if (!formData.service_id || !formData.doc_address_state_code) {
        setServicePricing(null);
        return;
      }

      setLoadingPricing(true);
      try {
        const response = await servicesApi.getServicePricing(formData.service_id, {
          state_code: formData.doc_address_state_code
        });
        if (response.success && response.data) {
          setServicePricing(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch service pricing:', err);
        // Fall back to default service pricing
        setServicePricing(null);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, [formData.service_id, formData.doc_address_state_code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setFormData(prev => ({ ...prev, service_id: serviceId }));
  };

  // Handle document file upload
  const handleDocumentUpload = (docId: string, file: File) => {
    // Create a preview URL for the file
    const previewUrl = URL.createObjectURL(file);

    setDocumentUploads(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        file,
        file_url: previewUrl, // This will be replaced with actual URL after upload
        preview_url: previewUrl
      }
    }));
  };

  // Handle document number input
  const handleDocumentNumberChange = (docId: string, documentNumber: string) => {
    setDocumentUploads(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        document_number: documentNumber
      }
    }));
  };

  // Remove uploaded document
  const handleRemoveDocument = (docId: string) => {
    const upload = documentUploads[docId];
    if (upload?.preview_url) {
      URL.revokeObjectURL(upload.preview_url);
    }

    setDocumentUploads(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        file: undefined,
        file_url: '',
        preview_url: undefined
      }
    }));
  };

  // Get pricing display - use state-specific or fallback to service default
  const getPricingDisplay = () => {
    if (servicePricing) {
      return {
        serviceFee: servicePricing.service_fee,
        platformFee: servicePricing.platform_fee,
        governmentFee: servicePricing.government_fee || 0,
        gstAmount: servicePricing.gst_amount || 0,
        totalFee: servicePricing.total_fee || (servicePricing.service_fee + servicePricing.platform_fee),
        processingTime: servicePricing.processing_time || selectedService?.processing_time,
        expressAvailable: servicePricing.express_available,
        expressFee: servicePricing.express_fee
      };
    }

    // Fallback to service default pricing
    if (selectedService) {
      return {
        serviceFee: selectedService.service_fee || 0,
        platformFee: selectedService.platform_fee || 0,
        governmentFee: 0,
        gstAmount: 0,
        totalFee: (selectedService.service_fee || 0) + (selectedService.platform_fee || 0),
        processingTime: selectedService.processing_time,
        expressAvailable: false,
        expressFee: null
      };
    }

    return null;
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    switch (step) {
      case 1:
        if (!formData.service_id) {
          setError('Please select a service');
          return false;
        }
        return true;

      case 2:
        // Validate mandatory documents are uploaded
        const mandatoryDocs = requiredDocuments.filter(d => d.is_mandatory);
        for (const doc of mandatoryDocs) {
          const upload = documentUploads[doc.id];
          if (!upload?.file_url || !upload?.file) {
            setError(`Please upload required document: ${doc.document_name}`);
            return false;
          }
        }
        return true;

      case 3:
        if (!formData.applicant_name?.trim()) {
          setError('Applicant name is required');
          return false;
        }
        if (!formData.applicant_mobile?.trim() || formData.applicant_mobile.length < 10) {
          setError('Valid mobile number is required');
          return false;
        }
        if (!formData.applicant_father_name?.trim()) {
          setError('Father\'s name is required');
          return false;
        }
        if (!formData.applicant_dob) {
          setError('Date of birth is required');
          return false;
        }
        if (!formData.applicant_gender) {
          setError('Gender is required');
          return false;
        }
        return true;

      case 4:
        if (!formData.doc_address_line1?.trim()) {
          setError('Address line 1 is required');
          return false;
        }
        if (!formData.doc_address_district?.trim()) {
          setError('District is required');
          return false;
        }
        if (!formData.doc_address_state_code) {
          setError('State is required');
          return false;
        }
        if (!formData.doc_address_pincode?.trim() || formData.doc_address_pincode.length !== 6) {
          setError('Valid 6-digit pincode is required');
          return false;
        }
        return true;

      case 5:
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    setError(null);

    try {
      // Prepare documents array for API
      const documentsForApi: ApplicationDocumentInput[] = [];

      for (const [, upload] of Object.entries(documentUploads)) {
        if (upload.file_url && upload.file) {
          // In a real implementation, you would first upload the file to storage
          // and get a proper URL. For now, we'll use the preview URL as placeholder
          // The actual file upload would happen before this
          documentsForApi.push({
            document_type: upload.document_type,
            document_name: upload.document_name,
            file_url: upload.file_url, // This should be the actual uploaded URL
            document_number: upload.document_number || undefined
          });
        }
      }

      // Use V2 API with all fields at root level (as per new API structure)
      const v2Request: CreateApplicationV2Request = {
        // Required
        service_id: formData.service_id!,

        // Applicant Personal Info (at root level)
        applicant_name: formData.applicant_name || '',
        applicant_mobile: formData.applicant_mobile || '',
        applicant_email: formData.applicant_email || undefined,
        applicant_father_name: formData.applicant_father_name || undefined,
        applicant_mother_name: formData.applicant_mother_name || undefined,
        applicant_dob: formData.applicant_dob || undefined,
        applicant_gender: formData.applicant_gender || undefined,
        applicant_religion: formData.applicant_religion || undefined,
        applicant_caste_category: formData.applicant_caste_category || undefined,
        applicant_marital_status: formData.applicant_marital_status || undefined,
        applicant_occupation: formData.applicant_occupation || undefined,
        applicant_annual_income: formData.applicant_annual_income,

        // Identity Documents
        applicant_aadhaar_last4: formData.applicant_aadhaar_last4 || undefined,
        applicant_pan_number: formData.applicant_pan_number || undefined,

        // Document Address (at root level)
        doc_address_line1: formData.doc_address_line1 || undefined,
        doc_address_line2: formData.doc_address_line2 || undefined,
        doc_address_landmark: formData.doc_address_landmark || undefined,
        doc_address_village: formData.doc_address_village || undefined,
        doc_address_taluk: formData.doc_address_taluk || undefined,
        doc_address_district: formData.doc_address_district || undefined,
        doc_address_state_code: formData.doc_address_state_code || undefined,
        doc_address_pincode: formData.doc_address_pincode || undefined,

        // Address same as document flag
        is_address_same_as_document: formData.is_address_same_as_document,

        // Priority
        is_urgent: formData.is_urgent,

        // Source & Device
        source: 'web',
        device_type: 'desktop',

        // Documents
        documents: documentsForApi.length > 0 ? documentsForApi : undefined,

        // Auto Submit
        auto_submit: false
      };

      const response = await applicationsApi.createApplicationV2(v2Request);
      if (response.success && response.data) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/applications/${response.data.application.id}`);
        }, 2000);
      } else {
        setError(response.message || 'Failed to create application');
      }
    } catch (err: unknown) {
      console.error('Failed to create application:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create application. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="apc-steps">
      {[1, 2, 3, 4, 5].map(step => (
        <div
          key={step}
          className={`apc-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
        >
          <div className="apc-step-num">
            {currentStep > step ? <HiOutlineCheck /> : step}
          </div>
          <span className="apc-step-label">
            {step === 1 && 'Service'}
            {step === 2 && 'Documents'}
            {step === 3 && 'Personal'}
            {step === 4 && 'Address'}
            {step === 5 && 'Review'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="apc-section apc-section--services">
      <h2><HiOutlineDocumentText /> Select Service</h2>
      <p className="apc-section-desc">Choose the service you want to apply for</p>

      {/* Search and Filter Bar */}
      <div className="apc-services-toolbar">
        <div className="apc-search-box">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="apc-search-clear" onClick={() => setSearchQuery('')}>
              <HiOutlineX />
            </button>
          )}
        </div>

        <div className="apc-filter-box">
          <HiOutlineFilter />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={loadingCategories}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services List */}
      {loadingServices ? (
        <div className="apc-loading">
          <div className="apc-loading-spinner"></div>
          <span>Loading services...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="apc-empty">
          <HiOutlineDocumentText />
          <h4>No Services Found</h4>
          <p>
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : 'No services are currently available'}
          </p>
        </div>
      ) : (
        <>
          <div className="apc-services-count">
            Showing {services.length} of {totalServices} services
          </div>

          <div className="apc-services-list">
            {services.map(service => (
              <div
                key={service.id}
                className={`apc-service-item ${formData.service_id === service.id ? 'selected' : ''}`}
                onClick={() => handleServiceSelect(service.id)}
              >
                <div className="apc-service-item-check">
                  {formData.service_id === service.id && <HiOutlineCheck />}
                </div>
                <div className="apc-service-item-content">
                  <div className="apc-service-item-header">
                    <h4>{service.name}</h4>
                    {service.is_popular && <span className="apc-badge popular">Popular</span>}
                    {service.is_featured && <span className="apc-badge featured">Featured</span>}
                  </div>
                  {service.name_hindi && (
                    <span className="apc-service-item-hindi">{service.name_hindi}</span>
                  )}
                  {service.description && (
                    <p className="apc-service-item-desc">{service.description}</p>
                  )}
                  <div className="apc-service-item-meta">
                    <span className="apc-service-item-fee">
                      <HiOutlineCurrencyRupee />
                      {service.is_free_service
                        ? 'Free'
                        : `₹${(service.service_fee || 0) + (service.platform_fee || 0)}`
                      }
                    </span>
                    {service.processing_time && (
                      <span className="apc-service-item-time">
                        <HiOutlineClock />
                        {service.processing_time}
                      </span>
                    )}
                    {service.department && (
                      <span className="apc-service-item-category">
                        {service.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="apc-pagination">
              <button
                className="apc-pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <HiOutlineChevronLeft /> Previous
              </button>
              <span className="apc-pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="apc-pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <HiOutlineChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Step 2: Document Upload
  const renderStep2 = () => {
    const pricing = getPricingDisplay();
    const uploadedCount = Object.values(documentUploads).filter(d => d.file_url).length;
    const mandatoryCount = requiredDocuments.filter(d => d.is_mandatory).length;
    const mandatoryUploaded = requiredDocuments.filter(d => d.is_mandatory && documentUploads[d.id]?.file_url).length;

    return (
      <div className="apc-section apc-section--documents">
        <h2><HiOutlineDocumentText /> Required Documents</h2>
        <p className="apc-section-desc">
          Upload the required documents for your application
          {mandatoryCount > 0 && ` (${mandatoryUploaded}/${mandatoryCount} mandatory uploaded)`}
        </p>

        {/* Pricing Info */}
        {pricing && (
          <div className="apc-pricing-card">
            <div className="apc-pricing-header">
              <HiOutlineCurrencyRupee />
              <span>Service Fees</span>
              {loadingPricing && <span className="apc-pricing-loading">Updating...</span>}
            </div>
            <div className="apc-pricing-details">
              <div className="apc-pricing-row">
                <span>Service Fee</span>
                <span>₹{pricing.serviceFee}</span>
              </div>
              <div className="apc-pricing-row">
                <span>Platform Fee</span>
                <span>₹{pricing.platformFee}</span>
              </div>
              {pricing.governmentFee > 0 && (
                <div className="apc-pricing-row">
                  <span>Government Fee</span>
                  <span>₹{pricing.governmentFee}</span>
                </div>
              )}
              {pricing.gstAmount > 0 && (
                <div className="apc-pricing-row">
                  <span>GST</span>
                  <span>₹{pricing.gstAmount}</span>
                </div>
              )}
              <div className="apc-pricing-row apc-pricing-row--total">
                <span>Total</span>
                <span>₹{pricing.totalFee}</span>
              </div>
              {pricing.processingTime && (
                <div className="apc-pricing-time">
                  <HiOutlineClock /> Processing: {pricing.processingTime}
                </div>
              )}
              {pricing.expressAvailable && pricing.expressFee && (
                <div className="apc-pricing-express">
                  <HiOutlineExclamation /> Express available: +₹{pricing.expressFee}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents List */}
        {loadingDocuments ? (
          <div className="apc-loading">
            <div className="apc-loading-spinner"></div>
            <span>Loading required documents...</span>
          </div>
        ) : requiredDocuments.length === 0 ? (
          <div className="apc-docs-empty">
            <HiOutlineCheckCircle />
            <h4>No Documents Required</h4>
            <p>This service does not require any document uploads. You can proceed to the next step.</p>
          </div>
        ) : (
          <div className="apc-docs-list">
            <div className="apc-docs-summary">
              {uploadedCount} of {requiredDocuments.length} documents uploaded
            </div>

            {requiredDocuments.map((doc) => {
              const upload = documentUploads[doc.id];
              const hasFile = upload?.file_url;

              return (
                <div key={doc.id} className={`apc-doc-item ${hasFile ? 'uploaded' : ''} ${doc.is_mandatory ? 'mandatory' : ''}`}>
                  <div className="apc-doc-item-header">
                    <div className="apc-doc-item-info">
                      <h4>
                        {doc.document_name}
                        {doc.is_mandatory && <span className="apc-doc-required">*Required</span>}
                      </h4>
                      {doc.document_name_hindi && (
                        <span className="apc-doc-hindi">{doc.document_name_hindi}</span>
                      )}
                      {doc.description && (
                        <p className="apc-doc-desc">{doc.description}</p>
                      )}
                    </div>
                    <div className="apc-doc-item-status">
                      {hasFile ? (
                        <span className="apc-doc-status uploaded">
                          <HiOutlineCheckCircle /> Uploaded
                        </span>
                      ) : (
                        <span className="apc-doc-status pending">
                          <HiOutlineUpload /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div className="apc-doc-upload-area">
                    {hasFile && upload?.preview_url ? (
                      <div className="apc-doc-preview">
                        {upload.file?.type?.startsWith('image/') ? (
                          <img src={upload.preview_url} alt={doc.document_name} />
                        ) : (
                          <div className="apc-doc-file-icon">
                            <HiOutlineDocumentText />
                            <span>{upload.file?.name}</span>
                          </div>
                        )}
                        <button
                          className="apc-doc-remove"
                          onClick={() => handleRemoveDocument(doc.id)}
                          type="button"
                        >
                          <HiOutlineTrash /> Remove
                        </button>
                      </div>
                    ) : (
                      <label className="apc-doc-dropzone">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleDocumentUpload(doc.id, file);
                            }
                          }}
                        />
                        <HiOutlinePhotograph />
                        <span>Click to upload or drag & drop</span>
                        <span className="apc-doc-formats">JPG, PNG, PDF (Max 5MB)</span>
                      </label>
                    )}
                  </div>

                  {/* Document Number Field (if applicable) */}
                  {doc.document_type && ['aadhaar', 'pan', 'voter_id', 'passport', 'driving_license'].includes(doc.document_type) && (
                    <div className="apc-doc-number">
                      <label>Document Number</label>
                      <input
                        type="text"
                        placeholder={`Enter ${doc.document_name} number`}
                        value={upload?.document_number || ''}
                        onChange={(e) => handleDocumentNumberChange(doc.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Step 3: Personal Information
  const renderStep3 = () => (
    <div className="apc-section">
      <h2><HiOutlineUser /> Personal Information</h2>
      <p className="apc-section-desc">Enter the applicant's details</p>

      <div className="apc-form-grid">
        <div className="apc-field apc-field--full">
          <label>Full Name *</label>
          <input
            type="text"
            name="applicant_name"
            value={formData.applicant_name || ''}
            onChange={handleInputChange}
            placeholder="Enter full name as per documents"
          />
        </div>

        <div className="apc-field">
          <label>Mobile Number *</label>
          <div className="apc-input-group">
            <span className="apc-input-prefix">+91</span>
            <input
              type="tel"
              name="applicant_mobile"
              value={formData.applicant_mobile || ''}
              onChange={handleInputChange}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
          </div>
        </div>

        <div className="apc-field">
          <label>Email</label>
          <input
            type="email"
            name="applicant_email"
            value={formData.applicant_email || ''}
            onChange={handleInputChange}
            placeholder="email@example.com"
          />
        </div>

        <div className="apc-field">
          <label>Father's Name *</label>
          <input
            type="text"
            name="applicant_father_name"
            value={formData.applicant_father_name || ''}
            onChange={handleInputChange}
            placeholder="Father's full name"
          />
        </div>

        <div className="apc-field">
          <label>Mother's Name</label>
          <input
            type="text"
            name="applicant_mother_name"
            value={formData.applicant_mother_name || ''}
            onChange={handleInputChange}
            placeholder="Mother's full name"
          />
        </div>

        <div className="apc-field">
          <label>Date of Birth *</label>
          <input
            type="date"
            name="applicant_dob"
            value={formData.applicant_dob || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="apc-field">
          <label>Gender *</label>
          <select
            name="applicant_gender"
            value={formData.applicant_gender || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="apc-field">
          <label>Religion</label>
          <select
            name="applicant_religion"
            value={formData.applicant_religion || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Religion</option>
            <option value="Hindu">Hindu</option>
            <option value="Muslim">Muslim</option>
            <option value="Christian">Christian</option>
            <option value="Sikh">Sikh</option>
            <option value="Buddhist">Buddhist</option>
            <option value="Jain">Jain</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="apc-field">
          <label>Caste Category</label>
          <select
            name="applicant_caste_category"
            value={formData.applicant_caste_category || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Category</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>

        <div className="apc-field">
          <label>Marital Status</label>
          <select
            name="applicant_marital_status"
            value={formData.applicant_marital_status || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        <div className="apc-field">
          <label>Occupation</label>
          <input
            type="text"
            name="applicant_occupation"
            value={formData.applicant_occupation || ''}
            onChange={handleInputChange}
            placeholder="Current occupation"
          />
        </div>

        <div className="apc-field">
          <label>Annual Income</label>
          <input
            type="number"
            name="applicant_annual_income"
            value={formData.applicant_annual_income || ''}
            onChange={handleInputChange}
            placeholder="Annual income in INR"
          />
        </div>
      </div>

      <h3 className="apc-subsection-title"><HiOutlineIdentification /> Identity Documents</h3>
      <div className="apc-form-grid">
        <div className="apc-field">
          <label>Aadhaar (Last 4 digits)</label>
          <input
            type="text"
            name="applicant_aadhaar_last4"
            value={formData.applicant_aadhaar_last4 || ''}
            onChange={handleInputChange}
            placeholder="Last 4 digits"
            maxLength={4}
          />
        </div>

        <div className="apc-field">
          <label>PAN Number</label>
          <input
            type="text"
            name="applicant_pan_number"
            value={formData.applicant_pan_number || ''}
            onChange={handleInputChange}
            placeholder="ABCDE1234F"
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
          />
        </div>
      </div>
    </div>
  );

  // Step 4: Address Information
  const renderStep4 = () => (
    <div className="apc-section">
      <h2><HiOutlineLocationMarker /> Address Information</h2>
      <p className="apc-section-desc">Enter the address for the document</p>

      <div className="apc-form-grid">
        <div className="apc-field apc-field--full">
          <label>Address Line 1 *</label>
          <input
            type="text"
            name="doc_address_line1"
            value={formData.doc_address_line1 || ''}
            onChange={handleInputChange}
            placeholder="House/Building No., Street Name"
          />
        </div>

        <div className="apc-field apc-field--full">
          <label>Address Line 2</label>
          <input
            type="text"
            name="doc_address_line2"
            value={formData.doc_address_line2 || ''}
            onChange={handleInputChange}
            placeholder="Area, Locality"
          />
        </div>

        <div className="apc-field">
          <label>Landmark</label>
          <input
            type="text"
            name="doc_address_landmark"
            value={formData.doc_address_landmark || ''}
            onChange={handleInputChange}
            placeholder="Near landmark"
          />
        </div>

        <div className="apc-field">
          <label>Village/Town</label>
          <input
            type="text"
            name="doc_address_village"
            value={formData.doc_address_village || ''}
            onChange={handleInputChange}
            placeholder="Village or Town name"
          />
        </div>

        <div className="apc-field">
          <label>Taluk/Tehsil</label>
          <input
            type="text"
            name="doc_address_taluk"
            value={formData.doc_address_taluk || ''}
            onChange={handleInputChange}
            placeholder="Taluk name"
          />
        </div>

        <div className="apc-field">
          <label>District *</label>
          <input
            type="text"
            name="doc_address_district"
            value={formData.doc_address_district || ''}
            onChange={handleInputChange}
            placeholder="District name"
          />
        </div>

        <div className="apc-field">
          <label>State *</label>
          <select
            name="doc_address_state_code"
            value={formData.doc_address_state_code || ''}
            onChange={handleInputChange}
          >
            <option value="">Select State</option>
            <option value="AP">Andhra Pradesh</option>
            <option value="AR">Arunachal Pradesh</option>
            <option value="AS">Assam</option>
            <option value="BR">Bihar</option>
            <option value="CT">Chhattisgarh</option>
            <option value="GA">Goa</option>
            <option value="GJ">Gujarat</option>
            <option value="HR">Haryana</option>
            <option value="HP">Himachal Pradesh</option>
            <option value="JH">Jharkhand</option>
            <option value="KA">Karnataka</option>
            <option value="KL">Kerala</option>
            <option value="MP">Madhya Pradesh</option>
            <option value="MH">Maharashtra</option>
            <option value="MN">Manipur</option>
            <option value="ML">Meghalaya</option>
            <option value="MZ">Mizoram</option>
            <option value="NL">Nagaland</option>
            <option value="OR">Odisha</option>
            <option value="PB">Punjab</option>
            <option value="RJ">Rajasthan</option>
            <option value="SK">Sikkim</option>
            <option value="TN">Tamil Nadu</option>
            <option value="TG">Telangana</option>
            <option value="TR">Tripura</option>
            <option value="UP">Uttar Pradesh</option>
            <option value="UK">Uttarakhand</option>
            <option value="WB">West Bengal</option>
            <option value="DL">Delhi</option>
          </select>
        </div>

        <div className="apc-field">
          <label>Pincode *</label>
          <input
            type="text"
            name="doc_address_pincode"
            value={formData.doc_address_pincode || ''}
            onChange={handleInputChange}
            placeholder="6-digit pincode"
            maxLength={6}
          />
        </div>
      </div>

      <div className="apc-checkbox-field">
        <label>
          <input
            type="checkbox"
            name="is_address_same_as_document"
            checked={formData.is_address_same_as_document}
            onChange={handleInputChange}
          />
          <span>Current address is same as document address</span>
        </label>
      </div>
    </div>
  );

  // Step 5: Review Application
  const renderStep5 = () => {
    const pricing = getPricingDisplay();
    const uploadedDocs = Object.entries(documentUploads).filter(([, upload]) => upload.file_url);

    return (
    <div className="apc-section">
      <h2><HiOutlineClipboardList /> Review Application</h2>
      <p className="apc-section-desc">Please review your application before submitting</p>

      {selectedService && (
        <div className="apc-review-card">
          <h3>Selected Service</h3>
          <div className="apc-review-row">
            <span>Service</span>
            <strong>{selectedService.name}</strong>
          </div>
          <div className="apc-review-row">
            <span>Processing Time</span>
            <strong>{pricing?.processingTime || selectedService.processing_time || 'N/A'}</strong>
          </div>
          {formData.doc_address_state_code && (
            <div className="apc-review-row">
              <span>State</span>
              <strong>{formData.doc_address_state_code}</strong>
            </div>
          )}
        </div>
      )}

      <div className="apc-review-card">
        <h3>Personal Information</h3>
        <div className="apc-review-grid">
          <div className="apc-review-row">
            <span>Name</span>
            <strong>{formData.applicant_name}</strong>
          </div>
          <div className="apc-review-row">
            <span>Mobile</span>
            <strong>+91 {formData.applicant_mobile}</strong>
          </div>
          <div className="apc-review-row">
            <span>Email</span>
            <strong>{formData.applicant_email || '-'}</strong>
          </div>
          <div className="apc-review-row">
            <span>Father's Name</span>
            <strong>{formData.applicant_father_name}</strong>
          </div>
          <div className="apc-review-row">
            <span>Date of Birth</span>
            <strong>{formData.applicant_dob}</strong>
          </div>
          <div className="apc-review-row">
            <span>Gender</span>
            <strong>{formData.applicant_gender}</strong>
          </div>
        </div>
      </div>

      <div className="apc-review-card">
        <h3>Address</h3>
        <p className="apc-review-address">
          {formData.doc_address_line1}
          {formData.doc_address_line2 && `, ${formData.doc_address_line2}`}
          {formData.doc_address_landmark && `, Near ${formData.doc_address_landmark}`}
          <br />
          {formData.doc_address_village && `${formData.doc_address_village}, `}
          {formData.doc_address_taluk && `${formData.doc_address_taluk}, `}
          {formData.doc_address_district}, {formData.doc_address_state_code} - {formData.doc_address_pincode}
        </p>
      </div>

      {/* Documents Summary */}
      {uploadedDocs.length > 0 && (
        <div className="apc-review-card">
          <h3>Uploaded Documents</h3>
          <div className="apc-review-docs">
            {uploadedDocs.map(([docId, upload]) => {
              const doc = requiredDocuments.find(d => d.id === docId);
              return (
                <div key={docId} className="apc-review-doc-item">
                  <HiOutlineCheckCircle />
                  <span>{doc?.document_name || upload.document_name}</span>
                  {upload.document_number && (
                    <span className="apc-review-doc-number">{upload.document_number}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      {pricing && (
        <div className="apc-review-card">
          <h3>Payment Summary</h3>
          <div className="apc-review-row">
            <span>Service Fee</span>
            <strong>₹{pricing.serviceFee}</strong>
          </div>
          <div className="apc-review-row">
            <span>Platform Fee</span>
            <strong>₹{pricing.platformFee}</strong>
          </div>
          {pricing.governmentFee > 0 && (
            <div className="apc-review-row">
              <span>Government Fee</span>
              <strong>₹{pricing.governmentFee}</strong>
            </div>
          )}
          {pricing.gstAmount > 0 && (
            <div className="apc-review-row">
              <span>GST</span>
              <strong>₹{pricing.gstAmount}</strong>
            </div>
          )}
          <div className="apc-review-row apc-review-row--highlight">
            <span>Total Amount</span>
            <strong>₹{pricing.totalFee}</strong>
          </div>
        </div>
      )}

      <div className="apc-checkbox-field apc-urgent-field">
        <label>
          <input
            type="checkbox"
            name="is_urgent"
            checked={formData.is_urgent}
            onChange={handleInputChange}
          />
          <span>Mark as Urgent (Additional charges may apply)</span>
        </label>
      </div>
    </div>
    );
  };

  if (success) {
    return (
      <div className="apc">
        <div className="apc-success">
          <div className="apc-success-icon">
            <HiOutlineCheck />
          </div>
          <h2>Application Created Successfully!</h2>
          <p>Your application has been submitted. Redirecting to application details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apc">
      {/* Header */}
      <div className="apc-header">
        <button className="apc-back" onClick={() => navigate('/applications')}>
          <HiOutlineArrowLeft />
        </button>
        <div className="apc-header-content">
          <h1>New Application</h1>
          <p>Fill out the form to create a new application</p>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Error Message */}
      {error && (
        <div className="apc-error">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Form Content */}
      <div className="apc-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      {/* Footer Actions */}
      <div className="apc-footer">
        <button
          className="apc-btn apc-btn--secondary"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            className="apc-btn apc-btn--primary"
            onClick={handleNext}
          >
            Next
          </button>
        ) : (
          <button
            className="apc-btn apc-btn--primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplicationCreate;
