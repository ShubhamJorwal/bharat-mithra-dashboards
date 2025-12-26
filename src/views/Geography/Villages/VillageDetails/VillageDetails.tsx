import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineHome,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineOfficeBuilding,
  HiOutlineMap,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUsers,
  HiOutlineGlobeAlt,
  HiOutlineInformationCircle,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineHashtag,
  HiOutlineIdentification,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { Village } from '../../../../types/api.types';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import '../../_details-shared.scss';
import './VillageDetails.scss';

const VillageDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVillage(id);
    }
  }, [id]);

  const fetchVillage = async (villageId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getVillageById(villageId);
      if (response.success && response.data) {
        setVillage(response.data);
      } else {
        setError('Failed to load village details');
      }
    } catch (err) {
      console.error('Failed to fetch village:', err);
      setError('Unable to load village details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!village) return;
    setDeleteLoading(true);
    try {
      await geographyApi.deleteVillage(village.id);
      setDeleteModalOpen(false);
      navigate('/geography/villages');
    } catch (err) {
      console.error('Failed to delete village:', err);
      setError('Failed to delete village. Please try again.');
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
      <div className="village-details">
        <div className="details-loading">
          <div className="details-loading__spinner"></div>
          <span className="details-loading__text">Loading village details...</span>
        </div>
      </div>
    );
  }

  if (error || !village) {
    return (
      <div className="village-details">
        <div className="details-error">
          <div className="details-error__icon">
            <HiOutlineExclamationCircle />
          </div>
          <h3 className="details-error__title">Unable to Load Village</h3>
          <p className="details-error__message">{error || 'Village not found'}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/villages')}>
              <HiOutlineArrowLeft />
              <span>Go Back</span>
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchVillage(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const amenities = [
    { key: 'has_primary_school', label: 'Primary School', value: village.has_primary_school },
    { key: 'has_middle_school', label: 'Middle School', value: village.has_middle_school },
    { key: 'has_high_school', label: 'High School', value: village.has_high_school },
    { key: 'has_primary_health_center', label: 'Health Center', value: village.has_primary_health_center },
    { key: 'has_post_office', label: 'Post Office', value: village.has_post_office },
    { key: 'has_bank', label: 'Bank', value: village.has_bank },
    { key: 'has_atm', label: 'ATM', value: village.has_atm },
    { key: 'has_bus_stop', label: 'Bus Stop', value: village.has_bus_stop },
    { key: 'has_railway_station', label: 'Railway Station', value: village.has_railway_station },
    { key: 'has_electricity', label: 'Electricity', value: village.has_electricity },
    { key: 'has_tap_water', label: 'Tap Water', value: village.has_tap_water },
    { key: 'has_internet', label: 'Internet', value: village.has_internet },
  ];

  return (
    <div className="village-details">
      {/* Breadcrumb */}
      <div className="details-breadcrumb">
        <span className="details-breadcrumb__item" onClick={() => navigate('/geography/states')}>
          <HiOutlineMap /> States
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/states/${village.state_id}`)}>
          {village.state_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/districts/${village.district_id}`)}>
          {village.district_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/taluks/${village.taluk_id}`)}>
          {village.taluk_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item" onClick={() => navigate(`/geography/gram-panchayats/${village.gram_panchayat_id}`)}>
          {village.gram_panchayat_name}
        </span>
        <HiOutlineArrowRight className="details-breadcrumb__separator" />
        <span className="details-breadcrumb__item details-breadcrumb__item--current">
          {village.name}
        </span>
      </div>

      {/* Hero Section */}
      <div className="details-hero">
        <div className="details-hero__content">
          <div className="details-hero__main">
            <div className="details-hero__badges">
              <span className="details-hero__code">{village.code}</span>
              <span className="details-hero__type">
                <HiOutlineHome /> Village
              </span>
              <span className={`details-hero__status details-hero__status--${village.is_active ? 'active' : 'inactive'}`}>
                {village.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="details-hero__title">{village.name}</h1>
            <p className="details-hero__subtitle">
              {village.name_hindi ? `${village.name_hindi} • ` : ''}{village.gram_panchayat_name}, {village.taluk_name}
            </p>
          </div>
          <div className="details-hero__actions">
            <button className="details-hero__btn details-hero__btn--back" onClick={() => navigate('/geography/villages')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="details-hero__btn details-hero__btn--edit" onClick={() => navigate(`/geography/villages/${id}/edit`)}>
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
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--population">
            <HiOutlineUsers />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(village.population)}</span>
            <span className="details-stat__label">Population</span>
          </div>
        </div>
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--gps">
            <HiOutlineHome />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{formatNumber(village.households)}</span>
            <span className="details-stat__label">Households</span>
          </div>
        </div>
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--area">
            <HiOutlineGlobeAlt />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{village.area_sq_km ? village.area_sq_km.toLocaleString('en-IN') : '—'}</span>
            <span className="details-stat__label">Area (sq km)</span>
          </div>
        </div>
        <div className="details-stat">
          <div className="details-stat__icon details-stat__icon--villages">
            <HiOutlineLocationMarker />
          </div>
          <div className="details-stat__content">
            <span className="details-stat__value">{village.pin_code || '—'}</span>
            <span className="details-stat__label">PIN Code</span>
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
                <span className="details-info-item__label">Village Code</span>
                <span className="details-info-item__code">{village.code}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Census Code</span>
                <span className="details-info-item__value">{village.census_code || <span className="details-info-item__value--empty">Not specified</span>}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">LGD Code</span>
                <span className="details-info-item__value">{village.lgd_code || <span className="details-info-item__value--empty">Not specified</span>}</span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">State</span>
                <span
                  className="details-info-item__badge details-info-item__badge--orange"
                  onClick={() => navigate(`/geography/states/${village.state_id}`)}
                >
                  <HiOutlineMap /> {village.state_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">District</span>
                <span
                  className="details-info-item__badge details-info-item__badge--blue"
                  onClick={() => navigate(`/geography/districts/${village.district_id}`)}
                >
                  <HiOutlineOfficeBuilding /> {village.district_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Taluk</span>
                <span
                  className="details-info-item__badge details-info-item__badge--pink"
                  onClick={() => navigate(`/geography/taluks/${village.taluk_id}`)}
                >
                  <HiOutlineLocationMarker /> {village.taluk_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Gram Panchayat</span>
                <span
                  className="details-info-item__badge details-info-item__badge--purple"
                  onClick={() => navigate(`/geography/gram-panchayats/${village.gram_panchayat_id}`)}
                >
                  <HiOutlineUserGroup /> {village.gram_panchayat_name}
                </span>
              </div>
              <div className="details-info-item">
                <span className="details-info-item__label">Status</span>
                <span className={`details-info-item__status details-info-item__status--${village.is_active ? 'active' : 'inactive'}`}>
                  {village.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Village Head Details */}
        <div className="details-card details-card--span-6 details-animate">
          <div className="details-card__header">
            <h3 className="details-card__title">
              <HiOutlineIdentification /> Village Head Details
            </h3>
          </div>
          <div className="details-card__body">
            <div className="village-head">
              <div className="village-head__item">
                <div className="village-head__icon">
                  <HiOutlineUser />
                </div>
                <div className="village-head__content">
                  <span className="village-head__label">Village Head Name</span>
                  <span className="village-head__value">{village.village_head_name || '—'}</span>
                </div>
              </div>
              <div className="village-head__item">
                <div className="village-head__icon">
                  <HiOutlinePhone />
                </div>
                <div className="village-head__content">
                  <span className="village-head__label">Contact Number</span>
                  <span className="village-head__value">{village.village_head_mobile || '—'}</span>
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
                <span className="details-demographic__value">{formatNumber(village.population)}</span>
                <span className="details-demographic__label">Total Population</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineUser />
                </div>
                <span className="details-demographic__value">{formatNumber(village.male_population)}</span>
                <span className="details-demographic__label">Male Population</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineUser />
                </div>
                <span className="details-demographic__value">{formatNumber(village.female_population)}</span>
                <span className="details-demographic__label">Female Population</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineHome />
                </div>
                <span className="details-demographic__value">{formatNumber(village.households)}</span>
                <span className="details-demographic__label">Households</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineGlobeAlt />
                </div>
                <span className="details-demographic__value">{village.area_sq_km ? village.area_sq_km.toLocaleString('en-IN') : '—'}</span>
                <span className="details-demographic__label">Area (sq km)</span>
              </div>
              <div className="details-demographic">
                <div className="details-demographic__icon">
                  <HiOutlineGlobeAlt />
                </div>
                <span className="details-demographic__value">{village.area_hectares ? village.area_hectares.toLocaleString('en-IN') : '—'}</span>
                <span className="details-demographic__label">Area (hectares)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="details-card details-card--span-12 details-animate">
          <div className="details-card__header">
            <h3 className="details-card__title">
              <HiOutlineLightningBolt /> Amenities & Facilities
            </h3>
          </div>
          <div className="details-card__body">
            <div className="village-amenities">
              {amenities.map((amenity) => (
                <div key={amenity.key} className={`village-amenity ${amenity.value ? 'village-amenity--available' : 'village-amenity--unavailable'}`}>
                  {amenity.value ? (
                    <HiOutlineCheckCircle className="village-amenity__icon village-amenity__icon--yes" />
                  ) : (
                    <HiOutlineXCircle className="village-amenity__icon village-amenity__icon--no" />
                  )}
                  <span className="village-amenity__label">{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coordinates */}
        {village.latitude && village.longitude && (
          <div className="details-card details-card--span-12 details-animate">
            <div className="details-card__header">
              <h3 className="details-card__title">
                <HiOutlineLocationMarker /> Location Coordinates
              </h3>
            </div>
            <div className="details-card__body--compact">
              <div className="village-coords">
                <div className="village-coords__item">
                  <span className="village-coords__label">Latitude</span>
                  <span className="village-coords__value">{village.latitude.toFixed(6)}°</span>
                </div>
                <div className="village-coords__item">
                  <span className="village-coords__label">Longitude</span>
                  <span className="village-coords__value">{village.longitude.toFixed(6)}°</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="details-card details-card--span-12 details-animate">
          <div className="details-card__body--compact">
            <div className="details-meta">
              <div className="details-meta__item">
                <HiOutlineHashtag />
                <span>ID: <strong>{village.id}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Created: <strong>{formatDate(village.created_at)}</strong></span>
              </div>
              <div className="details-meta__item">
                <HiOutlineCalendar />
                <span>Updated: <strong>{formatDate(village.updated_at)}</strong></span>
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
        title="Delete Village"
        message="Are you sure you want to delete this village? This action cannot be undone."
        itemName={village.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default VillageDetails;
