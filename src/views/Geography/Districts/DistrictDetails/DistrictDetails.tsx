import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineExclamationCircle,
  HiOutlineMap
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { District } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './DistrictDetails.scss';

const DistrictDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [district, setDistrict] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDistrict(id);
    }
  }, [id]);

  const fetchDistrict = async (districtId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getDistrictById(districtId);
      if (response.success && response.data) {
        setDistrict(response.data);
      } else {
        setError('Failed to load district details');
      }
    } catch (err) {
      console.error('Failed to fetch district:', err);
      setError('Unable to load district details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!district) return;
    if (window.confirm(`Are you sure you want to delete ${district.name}? This action cannot be undone.`)) {
      try {
        await geographyApi.deleteDistrict(district.id);
        navigate('/geography/districts');
      } catch (err) {
        console.error('Failed to delete district:', err);
        alert('Failed to delete district. Please try again.');
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
      <div className="bm-district-details">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading district details...</p>
        </div>
      </div>
    );
  }

  if (error || !district) {
    return (
      <div className="bm-district-details">
        <PageHeader
          icon={<HiOutlineOfficeBuilding />}
          title="District Details"
          description="View district information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/districts')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load District</h3>
            <p>{error || 'District not found'}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchDistrict(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-district-details">
      <PageHeader
        icon={<HiOutlineOfficeBuilding />}
        title={district.name}
        description={district.name_hindi || 'District'}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/districts')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate(`/geography/districts/${id}/edit`)}>
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
              <span className="bm-info-label">District Code</span>
              <span className="bm-info-value bm-code-badge">
                {district.code}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">State</span>
              <span className="bm-info-value bm-state-badge" onClick={() => navigate(`/geography/states?state_id=${district.state_id}`)}>
                <HiOutlineMap />
                {district.state_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Headquarters</span>
              <span className="bm-info-value">{district.headquarters || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">LGD Code</span>
              <span className="bm-info-value">{district.lgd_code || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Status</span>
              <span className={`bm-info-value bm-status-badge bm-status-badge--${district.is_active ? 'active' : 'inactive'}`}>
                {district.is_active ? 'Active' : 'Inactive'}
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
            <div className="bm-stat-item" onClick={() => navigate(`/geography/taluks?district_id=${district.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--taluks">
                <HiOutlineLocationMarker />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{district.total_taluks}</span>
                <span className="bm-stat-label">Taluks</span>
              </div>
            </div>
            <div className="bm-stat-item" onClick={() => navigate(`/geography/gram-panchayats?district_id=${district.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--gps">
                <HiOutlineUserGroup />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{formatNumber(district.total_gram_panchayats)}</span>
                <span className="bm-stat-label">Gram Panchayats</span>
              </div>
            </div>
            <div className="bm-stat-item" onClick={() => navigate(`/geography/villages?district_id=${district.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--villages">
                <HiOutlineHome />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{formatNumber(district.total_villages)}</span>
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
              <span className="bm-demographic-value">{formatNumber(district.population)}</span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Area</span>
              <span className="bm-demographic-value">
                {district.area_sq_km ? `${district.area_sq_km.toLocaleString('en-IN')} sq km` : '-'}
              </span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Literacy Rate</span>
              <span className="bm-demographic-value">
                {district.literacy_rate ? `${district.literacy_rate}%` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictDetails;
