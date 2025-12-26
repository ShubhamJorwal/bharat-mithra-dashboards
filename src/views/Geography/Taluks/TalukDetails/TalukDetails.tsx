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
  HiOutlineMap,
  HiOutlineUsers,
  HiOutlineGlobeAlt,
  HiOutlineInformationCircle,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineHashtag
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { Taluk } from '../../../../types/api.types';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import '../../_details-shared.scss';
import './TalukDetails.scss';

const TalukDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [taluk, setTaluk] = useState<Taluk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taluk) return;
    setDeleteLoading(true);
    try {
      await geographyApi.deleteTaluk(taluk.id);
      setDeleteModalOpen(false);
      navigate('/geography/taluks');
    } catch (err) {
      console.error('Failed to delete taluk:', err);
      setError('Failed to delete taluk. Please try again.');
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
      <div className="taluk-details">
        <div className="details-loading">
          <div className="details-loading__spinner"></div>
          <span className="details-loading__text">Loading taluk details...</span>
        </div>
      </div>
    );
  }

  if (error || !taluk) {
    return (
      <div className="taluk-details">
        <div className="details-error">
          <div className="details-error__icon">
            <HiOutlineExclamationCircle />
          </div>
          <h3 className="details-error__title">Unable to Load Taluk</h3>
          <p className="details-error__message">{error || 'Taluk not found'}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/taluks')}>
              <HiOutlineArrowLeft />
              <span>Go Back</span>
            </button>
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
    <div className="taluk-details">
      {/* Breadcrumb */}
      <div className="details-breadcrumb">
        <span className="details-breadcrumb__item" onClick={() => navigate('/geography/states')}>
          <HiOutlineMap /> States
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/districts?state_id=${taluk.state_id}`)}>
          <HiOutlineOfficeBuilding /> {taluk.state_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/districts/${taluk.district_id}`)}>
          <HiOutlineOfficeBuilding /> {taluk.district_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item details-breadcrumb__item--current">
          {taluk.name}
        </span>
      </div>

      {/* Hero Section */}
      <div className="details-hero">
        <div className="details-hero__content">
          <div className="details-hero__main">
            <div className="details-hero__badges">
              <span className="details-hero__code">{taluk.code}</span>
              <span className="details-hero__type">
                <HiOutlineLocationMarker /> Taluk
              </span>
              <span className={`details-hero__status details-hero__status--${taluk.is_active ? 'active' : 'inactive'}`}>
                {taluk.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="details-hero__title">{taluk.name}</h1>
            <p className="details-hero__subtitle">
              {taluk.name_hindi ? `${taluk.name_hindi} • ` : ''}{taluk.district_name}, {taluk.state_name}
            </p>
          </div>
          <div className="details-hero__actions">
            <button className="details-hero__btn details-hero__btn--back" onClick={() => navigate('/geography/taluks')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="details-hero__btn details-hero__btn--edit" onClick={() => navigate(`/geography/taluks/${id}/edit`)}>
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
        <div className="details-stat" onClick={() => navigate(`/geography/gram-panchayats?taluk_id=${taluk.id}`)}>
          <div className="details-stat__icon details-stat__icon--gps">
            <HiOutlineUserGroup />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(taluk.total_gram_panchayats)}</span>
            <span className="details-stat__label">Gram Panchayats</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat" onClick={() => navigate(`/geography/villages?taluk_id=${taluk.id}`)}>
          <div className="details-stat__icon details-stat__icon--villages">
            <HiOutlineHome />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(taluk.total_villages)}</span>
            <span className="details-stat__label">Villages</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--population">
            <HiOutlineUsers />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(taluk.population)}</span>
            <span className="details-stat__label">Population</span>
          </div>
        </div>
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--area">
            <HiOutlineGlobeAlt />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">
              {taluk.area_sq_km ? taluk.area_sq_km.toLocaleString('en-IN') : '—'}
            </span>
            <span className="details-stat__label">Area (sq km)</span>
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
                <span className="details-info-item__label">Taluk Code</span>
                <span className="details-info-item__code">{taluk.code}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">LGD Code</span>
                <span className="details-info-item__value">{taluk.lgd_code || <span className="details-info-item__value--empty">Not specified</span>}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">State</span>
                <span
                  className="details-info-item__badge details-info-item__badge--orange"
                  onClick={() => navigate(`/geography/states/${taluk.state_id}`)}
                >
                  <HiOutlineMap /> {taluk.state_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">District</span>
                <span
                  className="details-info-item__badge details-info-item__badge--blue"
                  onClick={() => navigate(`/geography/districts/${taluk.district_id}`)}
                >
                  <HiOutlineOfficeBuilding /> {taluk.district_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Headquarters</span>
                <span className="details-info-item__value">
                  {taluk.headquarters || <span className="details-info-item__value--empty">Not specified</span>}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Status</span>
                <span className={`details-info-item__status details-info-item__status--${taluk.is_active ? 'active' : 'inactive'}`}>
                  {taluk.is_active ? 'Active' : 'Inactive'}
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
                <span className="details-demographic__value">{formatNumber(taluk.population)}</span>
                <span className="details-demographic__label">Population</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineGlobeAlt />
                </div>
                <span className="details-demographic__value">
                  {taluk.area_sq_km ? `${taluk.area_sq_km.toLocaleString('en-IN')}` : '—'}
                </span>
                <span className="details-demographic__label">Area (sq km)</span>
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
              <div className="details-link" onClick={() => navigate(`/geography/gram-panchayats?taluk_id=${taluk.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineUserGroup />
                </div>
                <span className="details-link__label">Gram Panchayats</span>
                <span className="details-link__count">{formatNumber(taluk.total_gram_panchayats)}</span>
              </div>
              <div className="details-link" onClick={() => navigate(`/geography/villages?taluk_id=${taluk.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineHome />
                </div>
                <span className="details-link__label">Villages</span>
                <span className="details-link__count">{formatNumber(taluk.total_villages)}</span>
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
                <span>ID: <strong>{taluk.id}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Created: <strong>{formatDate(taluk.created_at)}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Updated: <strong>{formatDate(taluk.updated_at)}</strong></span>
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
        title="Delete Taluk"
        message="Are you sure you want to delete this taluk? This action cannot be undone and will affect all related gram panchayats and villages."
        itemName={taluk.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default TalukDetails;
