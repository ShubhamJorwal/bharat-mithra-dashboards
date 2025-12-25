import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineMap,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { State } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './StateDetails.scss';

const StateDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchState(id);
    }
  }, [id]);

  const fetchState = async (stateId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getStateById(stateId);
      if (response.success && response.data) {
        setState(response.data);
      } else {
        setError('Failed to load state details');
      }
    } catch (err) {
      console.error('Failed to fetch state:', err);
      setError('Unable to load state details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!state) return;
    if (window.confirm(`Are you sure you want to delete ${state.name}? This action cannot be undone.`)) {
      try {
        await geographyApi.deleteState(state.id);
        navigate('/geography/states');
      } catch (err) {
        console.error('Failed to delete state:', err);
        alert('Failed to delete state. Please try again.');
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

  const getZoneColor = (zone: string): string => {
    const colors: Record<string, string> = {
      north: '#f59e0b',
      south: '#10b981',
      east: '#3b82f6',
      west: '#ec4899',
      central: '#8b5cf6',
      northeast: '#f97316'
    };
    return colors[zone] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="bm-state-details">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading state details...</p>
        </div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="bm-state-details">
        <PageHeader
          icon={<HiOutlineMap />}
          title="State Details"
          description="View state information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/states')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load State</h3>
            <p>{error || 'State not found'}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchState(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-state-details">
      <PageHeader
        icon={<HiOutlineMap />}
        title={state.name}
        description={state.name_hindi || state.state_type === 'state' ? 'State' : 'Union Territory'}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/states')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate(`/geography/states/${id}/edit`)}>
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
              <span className="bm-info-label">State Code</span>
              <span className="bm-info-value bm-code-badge" style={{ background: getZoneColor(state.zone) }}>
                {state.code}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Type</span>
              <span className={`bm-info-value bm-type-badge bm-type-badge--${state.state_type}`}>
                {state.state_type === 'state' ? 'State' : 'Union Territory'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Capital</span>
              <span className="bm-info-value">{state.capital || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Zone</span>
              <span className="bm-info-value bm-zone-badge" style={{ background: `${getZoneColor(state.zone)}20`, color: getZoneColor(state.zone) }}>
                {state.zone.charAt(0).toUpperCase() + state.zone.slice(1)}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Official Language</span>
              <span className="bm-info-value">{state.official_language || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">LGD Code</span>
              <span className="bm-info-value">{state.lgd_code || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Status</span>
              <span className={`bm-info-value bm-status-badge bm-status-badge--${state.is_active ? 'active' : 'inactive'}`}>
                {state.is_active ? 'Active' : 'Inactive'}
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
            <div className="bm-stat-item" onClick={() => navigate(`/geography/districts?state_id=${state.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--districts">
                <HiOutlineOfficeBuilding />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{state.total_districts}</span>
                <span className="bm-stat-label">Districts</span>
              </div>
            </div>
            <div className="bm-stat-item" onClick={() => navigate(`/geography/taluks?state_id=${state.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--taluks">
                <HiOutlineLocationMarker />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{formatNumber(state.total_taluks)}</span>
                <span className="bm-stat-label">Taluks</span>
              </div>
            </div>
            <div className="bm-stat-item" onClick={() => navigate(`/geography/gram-panchayats?state_id=${state.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--gps">
                <HiOutlineUserGroup />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{formatNumber(state.total_gram_panchayats)}</span>
                <span className="bm-stat-label">Gram Panchayats</span>
              </div>
            </div>
            <div className="bm-stat-item" onClick={() => navigate(`/geography/villages?state_id=${state.id}`)}>
              <div className="bm-stat-icon bm-stat-icon--villages">
                <HiOutlineHome />
              </div>
              <div className="bm-stat-content">
                <span className="bm-stat-value">{formatNumber(state.total_villages)}</span>
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
              <span className="bm-demographic-value">{formatNumber(state.population)}</span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Area</span>
              <span className="bm-demographic-value">
                {state.area_sq_km ? `${state.area_sq_km.toLocaleString('en-IN')} sq km` : '-'}
              </span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Literacy Rate</span>
              <span className="bm-demographic-value">
                {state.literacy_rate ? `${state.literacy_rate}%` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateDetails;
