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
  HiOutlineExclamationCircle,
  HiOutlineUsers,
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineInformationCircle,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineHashtag,
  HiOutlineFlag
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { State } from '../../../../types/api.types';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import '../../_details-shared.scss';
import './StateDetails.scss';

const StateDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!state) return;
    setDeleteLoading(true);
    try {
      await geographyApi.deleteState(state.id);
      setDeleteModalOpen(false);
      navigate('/geography/states');
    } catch (err) {
      console.error('Failed to delete state:', err);
      setError('Failed to delete state. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '—';
    if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(2) + ' Lakh';
    if (num >= 1000) return num.toLocaleString('en-IN');
    return num.toString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
      <div className="state-details">
        <div className="details-loading">
          <div className="details-loading__spinner"></div>
          <span className="details-loading__text">Loading state details...</span>
        </div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="state-details">
        <div className="details-error">
          <div className="details-error__icon">
            <HiOutlineExclamationCircle />
          </div>
          <h3 className="details-error__title">Unable to Load State</h3>
          <p className="details-error__message">{error || 'State not found'}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/states')}>
              <HiOutlineArrowLeft />
              <span>Go Back</span>
            </button>
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
    <div className="state-details">
      {/* Breadcrumb */}
      <div className="details-breadcrumb">
        <span className="details-breadcrumb__item" onClick={() => navigate('/geography/national')}>
          <HiOutlineFlag /> India
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item details-breadcrumb__item--current">
          {state.name}
        </span>
      </div>

      {/* Hero Section */}
      <div className="details-hero">
        <div className="details-hero__content">
          <div className="details-hero__main">
            <div className="details-hero__badges">
              <span className="details-hero__code">{state.code}</span>
              <span className="details-hero__type">
                <HiOutlineMap /> {state.state_type === 'state' ? 'State' : 'Union Territory'}
              </span>
              <span className="state-zone-badge" style={{ background: `${getZoneColor(state.zone)}30`, color: getZoneColor(state.zone) }}>
                {state.zone.charAt(0).toUpperCase() + state.zone.slice(1)} Zone
              </span>
              <span className={`details-hero__status details-hero__status--${state.is_active ? 'active' : 'inactive'}`}>
                {state.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="details-hero__title">{state.name}</h1>
            <p className="details-hero__subtitle">
              {state.name_hindi ? `${state.name_hindi} • ` : ''}Capital: {state.capital || 'N/A'}
            </p>
          </div>
          <div className="details-hero__actions">
            <button className="details-hero__btn details-hero__btn--back" onClick={() => navigate('/geography/states')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="details-hero__btn details-hero__btn--edit" onClick={() => navigate(`/geography/states/${id}/edit`)}>
              <HiOutlinePencil />
              <span>Edit</span>
            </button>
            <button className="details-hero__btn details-hero__btn--delete" onClick={handleDeleteClick}>
              <HiOutlineTrash />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="details-stats">
        <div className="details-stat" onClick={() => navigate(`/geography/districts?state_id=${state.id}`)}>
          <div className="details-stat__icon details-stat__icon--districts">
            <HiOutlineOfficeBuilding />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{state.total_districts || 0}</span>
            <span className="details-stat__label">Districts</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat" onClick={() => navigate(`/geography/taluks?state_id=${state.id}`)}>
          <div className="details-stat__icon details-stat__icon--taluks">
            <HiOutlineLocationMarker />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(state.total_taluks)}</span>
            <span className="details-stat__label">Taluks</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat" onClick={() => navigate(`/geography/gram-panchayats?state_id=${state.id}`)}>
          <div className="details-stat__icon details-stat__icon--gps">
            <HiOutlineUserGroup />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(state.total_gram_panchayats)}</span>
            <span className="details-stat__label">Gram Panchayats</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat" onClick={() => navigate(`/geography/villages?state_id=${state.id}`)}>
          <div className="details-stat__icon details-stat__icon--villages">
            <HiOutlineHome />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(state.total_villages)}</span>
            <span className="details-stat__label">Villages</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
      </div>

      {/* Content Grid */}
      <div className="details-grid">
        {/* Basic Information */}
        <div className="details-card details-card--span-6 details-animate">
          <div className="details-card__header">
            <h3 className="details-card__title">
              <HiOutlineInformationCircle /> Basic Information
            </h3>
          </div>
          <div className="details-card__body">
            <div className="details-info">
              <div className="details-info-item">
                <span className="details-info-item__label">State Code</span>
                <span className="details-info-item__code">{state.code}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">LGD Code</span>
                <span className="details-info-item__value">{state.lgd_code || <span className="details-info-item__value--empty">Not specified</span>}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Type</span>
                <span className={`state-type-badge state-type-badge--${state.state_type}`}>
                  {state.state_type === 'state' ? 'State' : 'Union Territory'}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Zone</span>
                <span className="state-zone-inline" style={{ background: `${getZoneColor(state.zone)}15`, color: getZoneColor(state.zone), borderColor: `${getZoneColor(state.zone)}30` }}>
                  {state.zone.charAt(0).toUpperCase() + state.zone.slice(1)}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Capital</span>
                <span className="details-info-item__value">
                  {state.capital || <span className="details-info-item__value--empty">Not specified</span>}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Official Language</span>
                <span className="details-info-item__value">
                  {state.official_language || <span className="details-info-item__value--empty">Not specified</span>}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Hindi Name</span>
                <span className="details-info-item__value">
                  {state.name_hindi || <span className="details-info-item__value--empty">Not specified</span>}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Status</span>
                <span className={`details-info-item__status details-info-item__status--${state.is_active ? 'active' : 'inactive'}`}>
                  {state.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="details-card details-card--span-6 details-animate">
          <div className="details-card__header">
            <h3 className="details-card__title">
              <HiOutlineChartBar /> Demographics & Geography
            </h3>
          </div>
          <div className="details-card__body">
            <div className="details-demographics">
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineUsers />
                </div>
                <span className="details-demographic__value">{formatNumber(state.population)}</span>
                <span className="details-demographic__label">Population</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineGlobeAlt />
                </div>
                <span className="details-demographic__value">
                  {state.area_sq_km ? state.area_sq_km.toLocaleString('en-IN') : '—'}
                </span>
                <span className="details-demographic__label">Area (sq km)</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineAcademicCap />
                </div>
                <span className="details-demographic__value">
                  {state.literacy_rate ? `${state.literacy_rate}%` : '—'}
                </span>
                <span className="details-demographic__label">Literacy Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="details-card details-card--span-12 details-animate">
          <div className="details-card__header">
            <h3 className="details-card__title">
              <HiOutlineLocationMarker /> Explore Sub-Divisions
            </h3>
          </div>
          <div className="details-card__body--compact">
            <div className="details-links">
              <div className="details-link" onClick={() => navigate(`/geography/districts?state_id=${state.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineOfficeBuilding />
                </div>
                <span className="details-link__label">Districts</span>
                <span className="details-link__count">{state.total_districts || 0}</span>
              </div>
              <div className="details-link" onClick={() => navigate(`/geography/taluks?state_id=${state.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineLocationMarker />
                </div>
                <span className="details-link__label">Taluks</span>
                <span className="details-link__count">{formatNumber(state.total_taluks)}</span>
              </div>
              <div className="details-link" onClick={() => navigate(`/geography/gram-panchayats?state_id=${state.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineUserGroup />
                </div>
                <span className="details-link__label">Gram Panchayats</span>
                <span className="details-link__count">{formatNumber(state.total_gram_panchayats)}</span>
              </div>
              <div className="details-link" onClick={() => navigate(`/geography/villages?state_id=${state.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineHome />
                </div>
                <span className="details-link__label">Villages</span>
                <span className="details-link__count">{formatNumber(state.total_villages)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="details-card details-card--span-12 details-animate">
          <div className="details-card__body--compact">
            <div className="details-meta">
              <div className="details-meta__item">
                <HiOutlineHashtag />
                <span>ID: <strong>{state.id}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Created: <strong>{formatDate(state.created_at)}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Updated: <strong>{formatDate(state.updated_at)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete State"
        message="Are you sure you want to delete this state? This action cannot be undone and will affect all related districts, taluks, gram panchayats, and villages."
        itemName={state.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default StateDetails;
