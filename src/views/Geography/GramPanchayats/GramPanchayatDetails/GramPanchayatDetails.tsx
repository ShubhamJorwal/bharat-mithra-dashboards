import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineUserGroup,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineHome,
  HiOutlineExclamationCircle,
  HiOutlineOfficeBuilding,
  HiOutlineMap,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineUser
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { GramPanchayat } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './GramPanchayatDetails.scss';

const GramPanchayatDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [gramPanchayat, setGramPanchayat] = useState<GramPanchayat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGramPanchayat(id);
    }
  }, [id]);

  const fetchGramPanchayat = async (gpId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getGramPanchayatById(gpId);
      if (response.success && response.data) {
        setGramPanchayat(response.data);
      } else {
        setError('Failed to load gram panchayat details');
      }
    } catch (err) {
      console.error('Failed to fetch gram panchayat:', err);
      setError('Unable to load gram panchayat details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!gramPanchayat) return;
    if (window.confirm(`Are you sure you want to delete ${gramPanchayat.name}? This action cannot be undone.`)) {
      try {
        await geographyApi.deleteGramPanchayat(gramPanchayat.id);
        navigate('/geography/gram-panchayats');
      } catch (err) {
        console.error('Failed to delete gram panchayat:', err);
        alert('Failed to delete gram panchayat. Please try again.');
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
      <div className="bm-gp-details">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading gram panchayat details...</p>
        </div>
      </div>
    );
  }

  if (error || !gramPanchayat) {
    return (
      <div className="bm-gp-details">
        <PageHeader
          icon={<HiOutlineUserGroup />}
          title="Gram Panchayat Details"
          description="View gram panchayat information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/gram-panchayats')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Gram Panchayat</h3>
            <p>{error || 'Gram Panchayat not found'}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchGramPanchayat(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-gp-details">
      <PageHeader
        icon={<HiOutlineUserGroup />}
        title={gramPanchayat.name}
        description={gramPanchayat.name_hindi || 'Gram Panchayat'}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/gram-panchayats')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate(`/geography/gram-panchayats/${id}/edit`)}>
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
              <span className="bm-info-label">GP Code</span>
              <span className="bm-info-value bm-code-badge">
                {gramPanchayat.code}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">State</span>
              <span className="bm-info-value bm-state-badge" onClick={() => navigate(`/geography/states/${gramPanchayat.state_id}`)}>
                <HiOutlineMap />
                {gramPanchayat.state_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">District</span>
              <span className="bm-info-value bm-district-badge" onClick={() => navigate(`/geography/districts/${gramPanchayat.district_id}`)}>
                <HiOutlineOfficeBuilding />
                {gramPanchayat.district_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Taluk</span>
              <span className="bm-info-value bm-taluk-badge" onClick={() => navigate(`/geography/taluks/${gramPanchayat.taluk_id}`)}>
                <HiOutlineLocationMarker />
                {gramPanchayat.taluk_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">PIN Code</span>
              <span className="bm-info-value">{gramPanchayat.pin_code || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">LGD Code</span>
              <span className="bm-info-value">{gramPanchayat.lgd_code || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Status</span>
              <span className={`bm-info-value bm-status-badge bm-status-badge--${gramPanchayat.is_active ? 'active' : 'inactive'}`}>
                {gramPanchayat.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Sarpanch Info Card */}
        <div className="bm-card bm-sarpanch-card">
          <div className="bm-card-header">
            <h3>Sarpanch Details</h3>
          </div>
          <div className="bm-sarpanch-grid">
            <div className="bm-sarpanch-item">
              <div className="bm-sarpanch-icon">
                <HiOutlineUser />
              </div>
              <div className="bm-sarpanch-content">
                <span className="bm-sarpanch-label">Sarpanch Name</span>
                <span className="bm-sarpanch-value">{gramPanchayat.sarpanch_name || '-'}</span>
              </div>
            </div>
            <div className="bm-sarpanch-item">
              <div className="bm-sarpanch-icon">
                <HiOutlinePhone />
              </div>
              <div className="bm-sarpanch-content">
                <span className="bm-sarpanch-label">Contact Number</span>
                <span className="bm-sarpanch-value">{gramPanchayat.sarpanch_mobile || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bm-card bm-stats-card">
          <div className="bm-card-header">
            <h3>Statistics</h3>
          </div>
          <div className="bm-stats-grid">
            <div className="bm-stat-item" onClick={() => navigate(`/geography/villages?gram_panchayat_id=${gramPanchayat.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--villages">
                <HiOutlineHome />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{gramPanchayat.total_villages}</span>
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
              <span className="bm-demographic-value">{formatNumber(gramPanchayat.population)}</span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Households</span>
              <span className="bm-demographic-value">{formatNumber(gramPanchayat.households)}</span>
            </div>
            {gramPanchayat.latitude && gramPanchayat.longitude && (
              <div className="bm-demographic-item">
                <span className="bm-demographic-label">Coordinates</span>
                <span className="bm-demographic-value bm-coords">
                  {gramPanchayat.latitude.toFixed(4)}, {gramPanchayat.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GramPanchayatDetails;
