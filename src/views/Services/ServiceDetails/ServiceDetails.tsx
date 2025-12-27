import { useState, useEffect } from 'react';
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
  HiOutlineExternalLink
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { Service, ServiceCategory } from '../../../types/api.types';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import './ServiceDetails.scss';

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
              {service.is_free_service ? 'Free' : `₹${service.total_fee || 0}`}
            </span>
            <span className="svcd-stat-label">Service Fee</span>
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

      {/* Main Content */}
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
                    <span className="svcd-info-value">₹{service.service_fee || 0}</span>
                  </div>
                  <div className="svcd-info-row">
                    <span className="svcd-info-label">Platform Fee</span>
                    <span className="svcd-info-value">₹{service.platform_fee || 0}</span>
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
