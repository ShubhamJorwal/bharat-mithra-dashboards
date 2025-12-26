import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineExclamationCircle,
  HiOutlineOfficeBuilding,
  HiOutlineMap
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { Taluk } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './TalukDetails.scss';

const TalukDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [taluk, setTaluk] = useState<Taluk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTaluk(id);
    }
  }, [id]);

  const fetchTaluk = async (talukId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getTalukById(talukId);
      if (response.success && response.data) {
        setTaluk(response.data);
      } else {
        setError('Failed to load taluk details');
      }
    } catch (err) {
      console.error('Failed to fetch taluk:', err);
      setError('Unable to load taluk details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taluk) return;
    if (window.confirm(`Are you sure you want to delete ${taluk.name}? This action cannot be undone.`)) {
      try {
        await geographyApi.deleteTaluk(taluk.id);
        navigate('/geography/taluks');
      } catch (err) {
        console.error('Failed to delete taluk:', err);
        alert('Failed to delete taluk. Please try again.');
      }
    }
  };

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '-';
    if (num >= 100000) {
      return (num / 100000).toFixed(2) + ' Lakh';
    } else if (num >= 1000) {
      return num.toLocaleString('en-IN');
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="bm-taluk-details">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading taluk details...</p>
        </div>
      </div>
    );
  }

  if (error || !taluk) {
    return (
      <div className="bm-taluk-details">
        <PageHeader
          icon={<HiOutlineLocationMarker />}
          title="Taluk Details"
          description="View taluk information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/taluks')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Taluk</h3>
            <p>{error || 'Taluk not found'}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchTaluk(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-taluk-details">
      <PageHeader
        icon={<HiOutlineLocationMarker />}
        title={taluk.name}
        description={taluk.name_hindi || 'Taluk'}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/taluks')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate(`/geography/taluks/${id}/edit`)}>
              <HiOutlinePencil />
              <span>Edit</span>
            </button>
            <button className="bm-btn bm-btn-danger" onClick={handleDelete}>
              <HiOutlineTrash />
              <span>Delete</span>
            </button>
          </>
        }
      />

      <div className="bm-details-grid">
        {/* Basic Info Card */}
        <div className="bm-card bm-info-card">
          <div className="bm-card-header">
            <h3>Basic Information</h3>
          </div>
          <div className="bm-info-grid">
            <div className="bm-info-item">
              <span className="bm-info-label">Taluk Code</span>
              <span className="bm-info-value bm-code-badge">
                {taluk.code}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">State</span>
              <span className="bm-info-value bm-state-badge" onClick={() => navigate(`/geography/states/${taluk.state_id}`)}>
                <HiOutlineMap />
                {taluk.state_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">District</span>
              <span className="bm-info-value bm-district-badge" onClick={() => navigate(`/geography/districts/${taluk.district_id}`)}>
                <HiOutlineOfficeBuilding />
                {taluk.district_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Headquarters</span>
              <span className="bm-info-value">{taluk.headquarters || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">LGD Code</span>
              <span className="bm-info-value">{taluk.lgd_code || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Status</span>
              <span className={`bm-info-value bm-status-badge bm-status-badge--${taluk.is_active ? 'active' : 'inactive'}`}>
                {taluk.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bm-card bm-stats-card">
          <div className="bm-card-header">
            <h3>Statistics</h3>
          </div>
          <div className="bm-stats-grid">
            <div className="bm-stat-item" onClick={() => navigate(`/geography/gram-panchayats?taluk_id=${taluk.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--gps">
                <HiOutlineUserGroup />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{formatNumber(taluk.total_gram_panchayats)}</span>
                <span className="bm-stat-label">Gram Panchayats</span>
              </div>
            </div>
            <div className="bm-stat-item" onClick={() => navigate(`/geography/villages?taluk_id=${taluk.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--villages">
                <HiOutlineHome />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{formatNumber(taluk.total_villages)}</span>
                <span className="bm-stat-label">Villages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics Card */}
        <div className="bm-card bm-demographics-card">
          <div className="bm-card-header">
            <h3>Demographics</h3>
          </div>
          <div className="bm-demographics-grid">
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Population</span>
              <span className="bm-demographic-value">{formatNumber(taluk.population)}</span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Area</span>
              <span className="bm-demographic-value">
                {taluk.area_sq_km ? `${taluk.area_sq_km.toLocaleString('en-IN')} sq km` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalukDetails;
