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
  HiOutlineMap,
  HiOutlineUsers,
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineInformationCircle,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineHashtag
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { District } from '../../../../types/api.types';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import '../../_details-shared.scss';
import './DistrictDetails.scss';

const DistrictDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [district, setDistrict] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!district) return;
    setDeleteLoading(true);
    try {
      await geographyApi.deleteDistrict(district.id);
      setDeleteModalOpen(false);
      navigate('/geography/districts');
    } catch (err) {
      console.error('Failed to delete district:', err);
      setError('Failed to delete district. Please try again.');
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
      <div className="district-details">
        <div className="details-loading">
          <div className="details-loading__spinner"></div>
          <span className="details-loading__text">Loading district details...</span>
        </div>
      </div>
    );
  }

  if (error || !district) {
    return (
      <div className="district-details">
        <div className="details-error">
          <div className="details-error__icon">
            <HiOutlineExclamationCircle />
          </div>
          <h3 className="details-error__title">Unable to Load District</h3>
          <p className="details-error__message">{error || 'District not found'}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/districts')}>
              <HiOutlineArrowLeft />
              <span>Go Back</span>
            </button>
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
    <div className="district-details">
      {/* Breadcrumb */}
      <div className="details-breadcrumb">
        <span className="details-breadcrumb__item" onClick={() => navigate('/geography/states')}>
          <HiOutlineMap /> States
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/districts?state_id=${district.state_id}`)}>
          <HiOutlineOfficeBuilding /> {district.state_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item details-breadcrumb__item--current">
          {district.name}
        </span>
      </div>

      {/* Hero Section */}
      <div className="details-hero">
        <div className="details-hero__content">
          <div className="details-hero__main">
            <div className="details-hero__badges">
              <span className="details-hero__code">{district.code}</span>
              <span className="details-hero__type">
                <HiOutlineOfficeBuilding /> District
              </span>
              <span className={`details-hero__status details-hero__status--${district.is_active ? 'active' : 'inactive'}`}>
                {district.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="details-hero__title">{district.name}</h1>
            <p className="details-hero__subtitle">
              {district.name_hindi ? `${district.name_hindi} • ` : ''}{district.state_name}, India
            </p>
          </div>
          <div className="details-hero__actions">
            <button className="details-hero__btn details-hero__btn--back" onClick={() => navigate('/geography/districts')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="details-hero__btn details-hero__btn--edit" onClick={() => navigate(`/geography/districts/${id}/edit`)}>
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
        <div className="details-stat" onClick={() => navigate(`/geography/taluks?district_id=${district.id}`)}>
          <div className="details-stat__icon details-stat__icon--taluks">
            <HiOutlineLocationMarker />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{district.total_taluks || 0}</span>
            <span className="details-stat__label">Taluks</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat" onClick={() => navigate(`/geography/gram-panchayats?district_id=${district.id}`)}>
          <div className="details-stat__icon details-stat__icon--gps">
            <HiOutlineUserGroup />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(district.total_gram_panchayats)}</span>
            <span className="details-stat__label">Gram Panchayats</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat" onClick={() => navigate(`/geography/villages?district_id=${district.id}`)}>
          <div className="details-stat__icon details-stat__icon--villages">
            <HiOutlineHome />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(district.total_villages)}</span>
            <span className="details-stat__label">Villages</span>
          </div>
          <HiOutlineArrowRight className="details-stat__arrow" />
        </div>
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--population">
            <HiOutlineUsers />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(district.population)}</span>
            <span className="details-stat__label">Population</span>
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
                <span className="details-info-item__label">District Code</span>
                <span className="details-info-item__code">{district.code}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">LGD Code</span>
                <span className="details-info-item__value">{district.lgd_code || <span className="details-info-item__value--empty">Not specified</span>}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">State</span>
                <span
                  className="details-info-item__badge details-info-item__badge--orange"
                  onClick={() => navigate(`/geography/states/${district.state_id}`)}
                >
                  <HiOutlineMap /> {district.state_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Headquarters</span>
                <span className="details-info-item__value">
                  {district.headquarters || <span className="details-info-item__value--empty">Not specified</span>}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Hindi Name</span>
                <span className="details-info-item__value">
                  {district.name_hindi || <span className="details-info-item__value--empty">Not specified</span>}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Status</span>
                <span className={`details-info-item__status details-info-item__status--${district.is_active ? 'active' : 'inactive'}`}>
                  {district.is_active ? 'Active' : 'Inactive'}
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
                <span className="details-demographic__value">{formatNumber(district.population)}</span>
                <span className="details-demographic__label">Population</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineGlobeAlt />
                </div>
                <span className="details-demographic__value">
                  {district.area_sq_km ? `${district.area_sq_km.toLocaleString('en-IN')}` : '—'}
                </span>
                <span className="details-demographic__label">Area (sq km)</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineAcademicCap />
                </div>
                <span className="details-demographic__value">
                  {district.literacy_rate ? `${district.literacy_rate}%` : '—'}
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
              <div className="details-link" onClick={() => navigate(`/geography/taluks?district_id=${district.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineLocationMarker />
                </div>
                <span className="details-link__label">Taluks</span>
                <span className="details-link__count">{district.total_taluks || 0}</span>
              </div>
              <div className="details-link" onClick={() => navigate(`/geography/gram-panchayats?district_id=${district.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineUserGroup />
                </div>
                <span className="details-link__label">Gram Panchayats</span>
                <span className="details-link__count">{formatNumber(district.total_gram_panchayats)}</span>
              </div>
              <div className="details-link" onClick={() => navigate(`/geography/villages?district_id=${district.id}`)}>
                <div className="details-link__icon">
                  <HiOutlineHome />
                </div>
                <span className="details-link__label">Villages</span>
                <span className="details-link__count">{formatNumber(district.total_villages)}</span>
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
                <span>ID: <strong>{district.id}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Created: <strong>{formatDate(district.created_at)}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Updated: <strong>{formatDate(district.updated_at)}</strong></span>
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
        title="Delete District"
        message="Are you sure you want to delete this district? This action cannot be undone and will affect all related taluks, gram panchayats, and villages."
        itemName={district.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default DistrictDetails;
