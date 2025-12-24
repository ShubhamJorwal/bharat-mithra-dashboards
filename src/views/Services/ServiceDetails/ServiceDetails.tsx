import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCollection,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineClipboardList
} from 'react-icons/hi';
import './ServiceDetails.scss';

interface ServiceDetails {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  requirements: string[];
  documents: string[];
  processingTime: string;
  fee: string;
}

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setService({
          id: id || '1',
          name: 'Passport Application',
          category: 'Identity',
          description: 'Apply for new passport or renewal of existing passport. This service handles both fresh passport applications and renewals for Indian citizens.',
          status: 'active',
          applicationsCount: 156,
          createdAt: '2024-01-10',
          updatedAt: '2024-03-01',
          requirements: [
            'Indian citizenship',
            'Valid address proof',
            'Age above 18 years',
            'No criminal record'
          ],
          documents: [
            'Aadhaar Card',
            'Birth Certificate',
            'Address Proof',
            'Passport Size Photos (2)'
          ],
          processingTime: '30-45 days',
          fee: '₹1,500 - ₹2,000'
        });
      } catch (error) {
        console.error('Failed to fetch service details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <div className="bm-service-details">
        <div className="bm-loading">Loading service details...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bm-service-details">
        <div className="bm-empty-state">Service not found</div>
      </div>
    );
  }

  return (
    <div className="bm-service-details">
      <header className="bm-page-header">
        <div className="bm-header-left">
          <button className="bm-back-btn" onClick={() => navigate('/services')}>
            <HiOutlineArrowLeft />
          </button>
          <div>
            <h1 className="bm-page-title">Service Details</h1>
            <p className="bm-page-desc">View and manage service information</p>
          </div>
        </div>
        <div className="bm-header-actions">
          <button className="bm-btn bm-btn-secondary" onClick={() => navigate(`/services/${id}/edit`)}>
            <HiOutlinePencil />
            <span>Edit</span>
          </button>
          <button className="bm-btn bm-btn-danger">
            <HiOutlineTrash />
            <span>Delete</span>
          </button>
        </div>
      </header>

      <div className="bm-details-grid">
        <div className="bm-card bm-main-card">
          <div className="bm-service-header">
            <div className="bm-service-icon">
              <HiOutlineCollection />
            </div>
            <div className="bm-service-info">
              <h2 className="bm-service-name">{service.name}</h2>
              <div className="bm-service-meta">
                <span className={`bm-status-badge bm-status-badge--${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
                <span className="bm-service-category">{service.category}</span>
              </div>
            </div>
          </div>

          <div className="bm-service-content">
            <div className="bm-content-section">
              <h3 className="bm-section-title">Description</h3>
              <p className="bm-section-text">{service.description}</p>
            </div>

            <div className="bm-content-section">
              <h3 className="bm-section-title">Requirements</h3>
              <ul className="bm-requirements-list">
                {service.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="bm-content-section">
              <h3 className="bm-section-title">Required Documents</h3>
              <div className="bm-documents-list">
                {service.documents.map((doc, index) => (
                  <div key={index} className="bm-document-item">
                    <HiOutlineDocumentText />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bm-side-cards">
          <div className="bm-card bm-info-card">
            <div className="bm-card-header">
              <h3 className="bm-card-title">Service Info</h3>
            </div>
            <div className="bm-info-list">
              <div className="bm-info-item">
                <HiOutlineClipboardList className="bm-info-icon" />
                <div className="bm-info-content">
                  <span className="bm-info-label">Applications</span>
                  <span className="bm-info-value">{service.applicationsCount}</span>
                </div>
              </div>
              <div className="bm-info-item">
                <HiOutlineCalendar className="bm-info-icon" />
                <div className="bm-info-content">
                  <span className="bm-info-label">Processing Time</span>
                  <span className="bm-info-value">{service.processingTime}</span>
                </div>
              </div>
              <div className="bm-info-item">
                <HiOutlineTag className="bm-info-icon" />
                <div className="bm-info-content">
                  <span className="bm-info-label">Fee</span>
                  <span className="bm-info-value">{service.fee}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bm-card bm-dates-card">
            <div className="bm-card-header">
              <h3 className="bm-card-title">Dates</h3>
            </div>
            <div className="bm-dates-list">
              <div className="bm-date-item">
                <span className="bm-date-label">Created</span>
                <span className="bm-date-value">{new Date(service.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="bm-date-item">
                <span className="bm-date-label">Last Updated</span>
                <span className="bm-date-value">{new Date(service.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
