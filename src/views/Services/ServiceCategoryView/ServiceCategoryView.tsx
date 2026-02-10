import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineArrowLeft,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineCube,
  HiOutlineChevronRight,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineUpload,
  HiOutlinePhotograph,
  HiOutlineCreditCard,
  HiOutlineExclamation,
} from 'react-icons/hi';
import { getCategoryBySlug, type ServiceItem, type FormField } from '../../../data/servicesData';
import './ServiceCategoryView.scss';

const ServiceCategoryView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formFiles, setFormFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showActivation, setShowActivation] = useState(false);

  const category = useMemo(() => getCategoryBySlug(slug || ''), [slug]);

  if (!category) {
    return (
      <div className="scv">
        <div className="scv-not-found">
          <HiOutlineCube />
          <h3>Category Not Found</h3>
          <p>The service category you're looking for doesn't exist.</p>
          <button className="scv-back-btn" onClick={() => navigate('/services/portal')}>
            <HiOutlineArrowLeft /> Back to Services
          </button>
        </div>
      </div>
    );
  }

  const activeServices = category.services.filter(s => s.isActive);
  const newServices = activeServices.filter(s => s.isNew);
  const popularServices = activeServices.filter(s => s.isPopular);

  // Filter by search
  const allFiltered = useMemo(() => {
    if (!searchQuery.trim()) return activeServices;
    const q = searchQuery.toLowerCase();
    return activeServices.filter(s => s.name.toLowerCase().includes(q));
  }, [activeServices, searchQuery]);

  const totalActive = activeServices.length;
  const totalFilteredCount = allFiltered.length;

  // Form handlers
  const openServiceForm = (service: ServiceItem) => {
    setSelectedService(service);
    setFormData({});
    setFormFiles({});
    setSubmitted(false);
  };

  const closeServiceForm = () => {
    setSelectedService(null);
    setFormData({});
    setFormFiles({});
    setSubmitted(false);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormFiles(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = () => {
    if (!selectedService) return;
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const isFormValid = () => {
    if (!selectedService?.formFields) return false;
    return selectedService.formFields
      .filter(f => f.required)
      .every(f => {
        if (f.type === 'file') return !!formFiles[f.name];
        return !!formData[f.name]?.trim();
      });
  };

  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <div key={field.name} className="scv-form__field">
            <label className="scv-form__label">
              {field.label}
              {field.required && <span className="scv-form__required">*</span>}
            </label>
            <input
              type={field.type}
              className="scv-form__input"
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="scv-form__field">
            <label className="scv-form__label">
              {field.label}
              {field.required && <span className="scv-form__required">*</span>}
            </label>
            <input
              type="date"
              className="scv-form__input"
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="scv-form__field">
            <label className="scv-form__label">
              {field.label}
              {field.required && <span className="scv-form__required">*</span>}
            </label>
            <select
              className="scv-form__select"
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="scv-form__field scv-form__field--full">
            <label className="scv-form__label">
              {field.label}
              {field.required && <span className="scv-form__required">*</span>}
            </label>
            <textarea
              className="scv-form__textarea"
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              rows={3}
            />
          </div>
        );

      case 'file':
        return (
          <div key={field.name} className="scv-form__field">
            <label className="scv-form__label">
              {field.label}
              {field.required && <span className="scv-form__required">*</span>}
            </label>
            <div className="scv-form__upload">
              {formFiles[field.name] ? (
                <div className="scv-form__file-preview">
                  <HiOutlinePhotograph />
                  <span>{formFiles[field.name]!.name}</span>
                  <button onClick={() => handleFileChange(field.name, null)}>
                    <HiOutlineX />
                  </button>
                </div>
              ) : (
                <label className="scv-form__upload-btn">
                  <HiOutlineUpload />
                  <span>Choose File</span>
                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(field.name, e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="scv">
      {/* Breadcrumb */}
      <div className="scv-breadcrumb">
        <button onClick={() => navigate('/services/portal')}>Services</button>
        <HiOutlineChevronRight />
        <span>{category.name}</span>
      </div>

      {/* Header */}
      <div className="scv-header">
        <div className="scv-header__left">
          <button className="scv-header__back" onClick={() => navigate('/services/portal')}>
            <HiOutlineArrowLeft />
          </button>
          <div className="scv-header__icon" style={{ background: category.gradient }}>
            <span>{category.icon}</span>
          </div>
          <div className="scv-header__info">
            <h1 className="scv-header__title">{category.name}</h1>
            {category.nameHindi && (
              <span className="scv-header__hindi">{category.nameHindi}</span>
            )}
            <p className="scv-header__desc">{category.description}</p>
          </div>
        </div>
        <div className="scv-header__right">
          <div className="scv-search">
            <HiOutlineSearch />
            <input
              type="text"
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="scv-stats">
        <div className="scv-stat">
          <HiOutlineCube />
          <span><strong>{totalActive}</strong> Total Services</span>
        </div>
        <div className="scv-stat">
          <HiOutlineStar />
          <span><strong>{popularServices.length}</strong> Popular</span>
        </div>
        <div className="scv-stat">
          <HiOutlineSparkles />
          <span><strong>{newServices.length}</strong> New</span>
        </div>
        {searchQuery.trim() && (
          <div className="scv-stat scv-stat--search">
            <HiOutlineSearch />
            <span><strong>{totalFilteredCount}</strong> Results</span>
          </div>
        )}
      </div>

      {/* Activation Pending Banner */}
      {category.requiresActivation && (
        <div className="scv-activation-banner">
          <div className="scv-activation-banner__icon">
            <HiOutlineExclamation />
          </div>
          <div className="scv-activation-banner__text">
            <strong>Activation Pending</strong>
            <span>Please activate this service to access {category.name}</span>
          </div>
          <button className="scv-activation-banner__btn" onClick={() => setShowActivation(true)}>
            Activate Now - ₹{category.activationFee}/-
          </button>
        </div>
      )}

      {/* Content */}
      <div className="scv-content">
        <div className="scv-content-card">
          <div className="scv-grid">
            {allFiltered.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                color={category.color}
                isNew={service.isNew}
                isPopular={service.isPopular}
                onClick={() => openServiceForm(service)}
              />
            ))}
          </div>

          {/* Empty search */}
          {searchQuery.trim() && totalFilteredCount === 0 && (
            <div className="scv-empty">
              <HiOutlineSearch />
              <h4>No services found</h4>
              <p>Try adjusting your search in {category.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Service Form Modal */}
      {selectedService && (
        <div className="scv-modal-overlay" onClick={closeServiceForm}>
          <div className="scv-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="scv-modal__header" style={{ background: category.gradient }}>
              <div className="scv-modal__header-left">
                <span className="scv-modal__emoji">{selectedService.icon}</span>
                <div>
                  <h2 className="scv-modal__title">{selectedService.name}</h2>
                  <span className="scv-modal__category">{category.name}</span>
                </div>
              </div>
              <div className="scv-modal__header-right">
                <div className="scv-modal__meta-badges">
                  {selectedService.fee !== undefined && (
                    <span className="scv-modal__fee-badge">
                      Fee: {selectedService.fee === 0 ? 'Free' : `₹${selectedService.fee}`}
                    </span>
                  )}
                  {selectedService.commission !== undefined && selectedService.commission > 0 && (
                    <span className="scv-modal__comm-badge">
                      Commission: ₹{selectedService.commission}
                    </span>
                  )}
                  {selectedService.isOnline && (
                    <span className="scv-modal__online-badge">ONLINE</span>
                  )}
                </div>
                <button className="scv-modal__close" onClick={closeServiceForm}>
                  <HiOutlineX />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="scv-modal__body">
              {submitted ? (
                <div className="scv-modal__success">
                  <div className="scv-modal__success-icon">
                    <HiOutlineCheck />
                  </div>
                  <h3>Application Submitted!</h3>
                  <p>Your application for <strong>{selectedService.name}</strong> has been submitted successfully. You will receive a confirmation shortly.</p>
                  <div className="scv-modal__success-actions">
                    <button className="scv-modal__btn scv-modal__btn--outline" onClick={closeServiceForm}>
                      Close
                    </button>
                    <button className="scv-modal__btn scv-modal__btn--primary" onClick={() => {
                      setSubmitted(false);
                      setFormData({});
                      setFormFiles({});
                    }}>
                      New Application
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="scv-form__grid">
                    {selectedService.formFields?.map(field => renderFormField(field))}
                  </div>

                  {!selectedService.formFields?.length && (
                    <div className="scv-form__no-fields">
                      <HiOutlineCube />
                      <p>This service form is being set up. Please contact support for assistance.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!submitted && selectedService.formFields && selectedService.formFields.length > 0 && (
              <div className="scv-modal__footer">
                <button className="scv-modal__btn scv-modal__btn--outline" onClick={closeServiceForm}>
                  Cancel
                </button>
                <button
                  className="scv-modal__btn scv-modal__btn--primary"
                  onClick={handleSubmit}
                  disabled={submitting || !isFormValid()}
                >
                  {submitting ? (
                    <>
                      <span className="scv-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheck />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activation Modal */}
      {showActivation && category.requiresActivation && (
        <div className="scv-modal-overlay" onClick={() => setShowActivation(false)}>
          <div className="scv-modal scv-modal--activation" onClick={(e) => e.stopPropagation()}>
            <div className="scv-modal__header" style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
              <div className="scv-modal__header-left">
                <span className="scv-modal__emoji">🖥️</span>
                <div>
                  <h2 className="scv-modal__title">Activation Pending</h2>
                  <span className="scv-modal__category">{category.name}</span>
                </div>
              </div>
              <div className="scv-modal__header-right">
                <button className="scv-modal__close" onClick={() => setShowActivation(false)}>
                  <HiOutlineX />
                </button>
              </div>
            </div>
            <div className="scv-modal__body">
              <div className="scv-activation">
                <h3 className="scv-activation__heading">
                  Activate {category.name}
                </h3>
                <p className="scv-activation__subtext">
                  <span className="scv-activation__highlight">1,000+</span> State & Central Govt. Services
                </p>
                <p className="scv-activation__subtext">only for :</p>
                <div className="scv-activation__price">
                  ₹ {category.activationFee} /-
                </div>
                <div className="scv-activation__features-title">Top Features</div>
                <ul className="scv-activation__features">
                  {category.activationFeatures?.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="scv-modal__footer">
              <button className="scv-modal__btn scv-modal__btn--outline" onClick={() => setShowActivation(false)}>
                Cancel
              </button>
              <button className="scv-modal__btn scv-modal__btn--primary scv-modal__btn--pay">
                <HiOutlineCreditCard />
                Pay with Razor Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Service Card Component
interface ServiceCardProps {
  service: ServiceItem;
  color: string;
  isNew?: boolean;
  isPopular?: boolean;
  onClick?: () => void;
}

const ServiceCard = ({ service, isNew, onClick }: ServiceCardProps) => {
  return (
    <div className="scv-card" onClick={onClick}>
      <div className="scv-card__circle" style={{ background: `linear-gradient(145deg, ${service.color}, ${service.color}cc)` }}>
        <span className="scv-card__emoji">{service.icon}</span>
      </div>
      <div className="scv-card__label">
        <span className="scv-card__name">{service.name}</span>
        <div className="scv-card__badges">
          {isNew && <span className="scv-badge scv-badge--new">NEW</span>}
          {service.isOnline && <span className="scv-badge scv-badge--online">ONLINE</span>}
          {service.fee !== undefined && service.fee > 0 && (
            <span className="scv-card__price">₹{service.fee}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCategoryView;
