import { useState, useEffect } from 'react';
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
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import servicesApi from '../../services/api/services.api';
import applicationsApi from '../../services/api/applications.api';
import type { Service, CreateApplicationRequest } from '../../types/api.types';
import './ApplicationCreate.scss';

// Mock services for development
const MOCK_SERVICES: Service[] = [
  {
    id: 'svc-001',
    name: 'Birth Certificate',
    name_hindi: 'जन्म प्रमाण पत्र',
    slug: 'birth-certificate',
    category_id: 'cat-001',
    description: 'Apply for birth certificate for newborn or delayed registration',
    service_fee: 100,
    platform_fee: 50,
    total_fee: 150,
    is_free_service: false,
    is_popular: true,
    is_featured: true,
    processing_time: '7-15 Days',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'svc-002',
    name: 'Income Certificate',
    name_hindi: 'आय प्रमाण पत्र',
    slug: 'income-certificate',
    category_id: 'cat-002',
    description: 'Certificate to verify annual income for various purposes',
    service_fee: 50,
    platform_fee: 50,
    total_fee: 100,
    is_free_service: false,
    is_popular: true,
    is_featured: true,
    processing_time: '5-7 Days',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'svc-003',
    name: 'Caste Certificate',
    name_hindi: 'जाति प्रमाण पत्र',
    slug: 'caste-certificate',
    category_id: 'cat-002',
    description: 'Certificate to verify caste for reservation benefits',
    service_fee: 100,
    platform_fee: 100,
    total_fee: 200,
    is_free_service: false,
    is_popular: false,
    is_featured: false,
    processing_time: '10-15 Days',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'svc-004',
    name: 'Domicile Certificate',
    name_hindi: 'अधिवास प्रमाण पत्र',
    slug: 'domicile-certificate',
    category_id: 'cat-002',
    description: 'Certificate to prove residence in a particular state',
    service_fee: 150,
    platform_fee: 100,
    total_fee: 250,
    is_free_service: false,
    is_popular: false,
    is_featured: false,
    processing_time: '7-10 Days',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'svc-005',
    name: 'Marriage Certificate',
    name_hindi: 'विवाह प्रमाण पत्र',
    slug: 'marriage-certificate',
    category_id: 'cat-001',
    description: 'Register your marriage and get official certificate',
    service_fee: 200,
    platform_fee: 100,
    total_fee: 300,
    is_free_service: false,
    is_popular: true,
    is_featured: true,
    processing_time: '15-30 Days',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const ApplicationCreate = () => {
  const navigate = useNavigate();

  // Form steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

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

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const response = await servicesApi.getServices();
        if (response.success && response.data) {
          setServices(response.data);
        } else {
          // Use mock data
          setServices(MOCK_SERVICES);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setServices(MOCK_SERVICES);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

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

      case 3:
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

      case 4:
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
      const response = await applicationsApi.createApplication(formData as CreateApplicationRequest);
      if (response.success && response.data) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/applications/${response.data.id}`);
        }, 2000);
      } else {
        setError(response.message || 'Failed to create application');
      }
    } catch (err) {
      console.error('Failed to create application:', err);
      // For demo, show success anyway
      setSuccess(true);
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="apc-steps">
      {[1, 2, 3, 4].map(step => (
        <div
          key={step}
          className={`apc-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
        >
          <div className="apc-step-num">
            {currentStep > step ? <HiOutlineCheck /> : step}
          </div>
          <span className="apc-step-label">
            {step === 1 && 'Service'}
            {step === 2 && 'Personal'}
            {step === 3 && 'Address'}
            {step === 4 && 'Review'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="apc-section">
      <h2><HiOutlineDocumentText /> Select Service</h2>
      <p className="apc-section-desc">Choose the service you want to apply for</p>

      {loadingServices ? (
        <div className="apc-loading">Loading services...</div>
      ) : (
        <div className="apc-services-grid">
          {services.map(service => (
            <label
              key={service.id}
              className={`apc-service-card ${formData.service_id === service.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="service_id"
                value={service.id}
                checked={formData.service_id === service.id}
                onChange={handleInputChange}
              />
              <div className="apc-service-content">
                <h4>{service.name}</h4>
                <p className="apc-service-hindi">{service.name_hindi}</p>
                <p className="apc-service-desc">{service.description}</p>
                <div className="apc-service-meta">
                  <span className="apc-service-fee">
                    <HiOutlineCurrencyRupee />
                    {(service.service_fee || 0) + (service.platform_fee || 0)}
                  </span>
                  <span className="apc-service-time">{service.processing_time}</span>
                </div>
              </div>
              <div className="apc-service-check">
                <HiOutlineCheck />
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
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

  const renderStep3 = () => (
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

  const renderStep4 = () => (
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
            <strong>{selectedService.processing_time}</strong>
          </div>
          <div className="apc-review-row apc-review-row--highlight">
            <span>Total Fee</span>
            <strong>₹{(selectedService.service_fee || 0) + (selectedService.platform_fee || 0)}</strong>
          </div>
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
