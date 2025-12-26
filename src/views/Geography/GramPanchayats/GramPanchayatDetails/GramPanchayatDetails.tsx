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
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineInformationCircle,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineHashtag,
  HiOutlineIdentification
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { GramPanchayat } from '../../../../types/api.types';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import '../../_details-shared.scss';
import './GramPanchayatDetails.scss';

const GramPanchayatDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [gramPanchayat, setGramPanchayat] = useState<GramPanchayat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gramPanchayat) return;
    setDeleteLoading(true);
    try {
      await geographyApi.deleteGramPanchayat(gramPanchayat.id);
      setDeleteModalOpen(false);
      navigate('/geography/gram-panchayats');
    } catch (err) {
      console.error('Failed to delete gram panchayat:', err);
      setError('Failed to delete gram panchayat. Please try again.');
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

  if (loading) {
    return (
      <div className="gp-details">
        <div className="details-loading">
          <div className="details-loading__spinner"></div>
          <span className="details-loading__text">Loading gram panchayat details...</span>
        </div>
      </div>
    );
  }

  if (error || !gramPanchayat) {
    return (
      <div className="gp-details">
        <div className="details-error">
          <div className="details-error__icon">
            <HiOutlineExclamationCircle />
          </div>
          <h3 className="details-error__title">Unable to Load Gram Panchayat</h3>
          <p className="details-error__message">{error || 'Gram Panchayat not found'}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/gram-panchayats')}>
              <HiOutlineArrowLeft />
              <span>Go Back</span>
            </button>
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
    <div className="gp-details">
      {/* Breadcrumb */}
      <div className="details-breadcrumb">
        <span className="details-breadcrumb__item" onClick={() => navigate('/geography/states')}>
          <HiOutlineMap /> States
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/districts?state_id=${gramPanchayat.state_id}`)}>
          <HiOutlineOfficeBuilding /> {gramPanchayat.state_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/districts/${gramPanchayat.district_id}`)}>
          {gramPanchayat.district_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/taluks/${gramPanchayat.taluk_id}`)}>
          {gramPanchayat.taluk_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item details-breadcrumb__item--current">
          {gramPanchayat.name}
        </span>
      </div>

      {/* Hero Section */}
      <div className="details-hero">
        <div className="details-hero__content">
          <div className="details-hero__main">
            <div className="details-hero__badges">
              <span className="details-hero__code">{gramPanchayat.code}</span>
              <span className="details-hero__type">
                <HiOutlineUserGroup /> Gram Panchayat
              </span>
              <span className={`details-hero__status details-hero__status--${gramPanchayat.is_active ? 'active' : 'inactive'}`}>
                {gramPanchayat.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="details-hero__title">{gramPanchayat.name}</h1>
            <p className="details-hero__subtitle">
              {gramPanchayat.name_hindi ? `${gramPanchayat.name_hindi} • ` : ''}{gramPanchayat.taluk_name}, {gramPanchayat.district_name}
            </p>
          </div>
          <div className="details-hero__actions">
            <button className="details-hero__btn details-hero__btn--back" onClick={() => navigate('/geography/gram-panchayats')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="details-hero__btn details-hero__btn--edit" onClick={() => navigate(`/geography/gram-panchayats/${id}/edit`)}>
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
        <div className="details-stat" onClick={() => navigate(`/geography/villages?gram_panchayat_id=${gramPanchayat.id}`)}>
          <div className="details-stat__icon details-stat__icon--villages">
            <HiOutlineHome />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{gramPanchayat.total_villages || 0}</span>
            <span className="details-stat__label">Villages</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--population">
            <HiOutlineUsers />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(gramPanchayat.population)}</span>
            <span className="details-stat__label">Population</span>
          </div>
        </div>
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--gps">
            <HiOutlineHome />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(gramPanchayat.households)}</span>
            <span className="details-stat__label">Households</span>
          </div>
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
                <span className="details-info-item__label">GP Code</span>
                <span className="details-info-item__code">{gramPanchayat.code}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">LGD Code</span>
                <span className="details-info-item__value">{gramPanchayat.lgd_code || <span className="details-info-item__value--empty">Not specified</span>}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">State</span>
                <span
                  className="details-info-item__badge details-info-item__badge--orange"
                  onClick={() => navigate(`/geography/states/${gramPanchayat.state_id}`)}
                >
                  <HiOutlineMap /> {gramPanchayat.state_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">District</span>
                <span
                  className="details-info-item__badge details-info-item__badge--blue"
                  onClick={() => navigate(`/geography/districts/${gramPanchayat.district_id}`)}
                >
                  <HiOutlineOfficeBuilding /> {gramPanchayat.district_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Taluk</span>
                <span
                  className="details-info-item__badge details-info-item__badge--pink"
                  onClick={() => navigate(`/geography/taluks/${gramPanchayat.taluk_id}`)}
                >
                  <HiOutlineLocationMarker /> {gramPanchayat.taluk_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">PIN Code</span>
                <span className="details-info-item__value">
                  {gramPanchayat.pin_code || <span className="details-info-item__value--empty">Not specified</span>}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Status</span>
                <span className={`details-info-item__status details-info-item__status--${gramPanchayat.is_active ? 'active' : 'inactive'}`}>
                  {gramPanchayat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sarpanch Details */}
        <div className="details-card details-card--span-6 details-animate">
          <div className="details-card__header">
            <h3 className="details-card__title">
              <HiOutlineIdentification /> Sarpanch Details
            </h3>
          </div>
          <div className="details-card__body">
            <div className="gp-sarpanch">
              <div className="gp-sarpanch__item">
                <div className="gp-sarpanch__icon">
                  <HiOutlineUser />
                </div>
                <div className="gp-sarpanch__content">
                  <span className="gp-sarpanch__label">Sarpanch Name</span>
                  <span className="gp-sarpanch__value">{gramPanchayat.sarpanch_name || '—'}</span>
                </div>
              </div>
              <div className="gp-sarpanch__item">
                <div className="gp-sarpanch__icon">
                  <HiOutlinePhone />
                </div>
                <div className="gp-sarpanch__content">
                  <span className="gp-sarpanch__label">Contact Number</span>
                  <span className="gp-sarpanch__value">{gramPanchayat.sarpanch_mobile || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="details-card details-card--span-12 details-animate">
          <div className="details-card__header">
            <h3 className="details-card__title">
              <HiOutlineChartBar /> Demographics
            </h3>
          </div>
          <div className="details-card__body">
            <div className="details-demographics">
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineUsers />
                </div>
                <span className="details-demographic__value">{formatNumber(gramPanchayat.population)}</span>
                <span className="details-demographic__label">Population</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineHome />
                </div>
                <span className="details-demographic__value">{formatNumber(gramPanchayat.households)}</span>
                <span className="details-demographic__label">Households</span>
              </div>
              {gramPanchayat.latitude && gramPanchayat.longitude && (
                <div className="details-demographic">
                  <div className="details-demographic__icon">
                    <HiOutlineLocationMarker />
                  </div>
                  <span className="details-demographic__value">
                    {gramPanchayat.latitude.toFixed(4)}°
                  </span>
                  <span className="details-demographic__label">Latitude</span>
                </div>
              )}
              {gramPanchayat.latitude && gramPanchayat.longitude && (
                <div className="details-demographic">
                  <div className="details-demographic__icon">
                    <HiOutlineLocationMarker />
                  </div>
                  <span className="details-demographic__value">
                    {gramPanchayat.longitude.toFixed(4)}°
                  </span>
                  <span className="details-demographic__label">Longitude</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="details-card details-card--span-12 details-animate">
          <div className="details-card__header">
            <h3 className="details-card__title">
              <HiOutlineLocationMarker /> Explore Villages
            </h3>
          </div>
          <div className="details-card__body--compact">
            <div className="details-links">
              <div className="details-link" onClick={() => navigate(`/geography/villages?gram_panchayat_id=${gramPanchayat.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineHome />
                </div>
                <span className="details-link__label">Villages</span>
                <span className="details-link__count">{gramPanchayat.total_villages || 0}</span>
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
                <span>ID: <strong>{gramPanchayat.id}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Created: <strong>{formatDate(gramPanchayat.created_at)}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Updated: <strong>{formatDate(gramPanchayat.updated_at)}</strong></span>
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
        title="Delete Gram Panchayat"
        message="Are you sure you want to delete this gram panchayat? This action cannot be undone and will affect all related villages."
        itemName={gramPanchayat.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default GramPanchayatDetails;
