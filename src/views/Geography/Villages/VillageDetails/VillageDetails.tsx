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
  HiOutlineXCircle
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { Village } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './VillageDetails.scss';

const VillageDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!village) return;
    if (window.confirm(`Are you sure you want to delete ${village.name}? This action cannot be undone.`)) {
      try {
        await geographyApi.deleteVillage(village.id);
        navigate('/geography/villages');
      } catch (err) {
        console.error('Failed to delete village:', err);
        alert('Failed to delete village. Please try again.');
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
      <div className="bm-village-details">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading village details...</p>
        </div>
      </div>
    );
  }

  if (error || !village) {
    return (
      <div className="bm-village-details">
        <PageHeader
          icon={<HiOutlineHome />}
          title="Village Details"
          description="View village information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/villages')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Village</h3>
            <p>{error || 'Village not found'}</p>
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
    <div className="bm-village-details">
      <PageHeader
        icon={<HiOutlineHome />}
        title={village.name}
        description={village.name_hindi || 'Village'}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/villages')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate(`/geography/villages/${id}/edit`)}>
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
              <span className="bm-info-label">Village Code</span>
              <span className="bm-info-value bm-code-badge">
                {village.code}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">State</span>
              <span className="bm-info-value bm-state-badge" onClick={() => navigate(`/geography/states/${village.state_id}`)}>
                <HiOutlineMap />
                {village.state_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">District</span>
              <span className="bm-info-value bm-district-badge" onClick={() => navigate(`/geography/districts/${village.district_id}`)}>
                <HiOutlineOfficeBuilding />
                {village.district_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Taluk</span>
              <span className="bm-info-value bm-taluk-badge" onClick={() => navigate(`/geography/taluks/${village.taluk_id}`)}>
                <HiOutlineLocationMarker />
                {village.taluk_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Gram Panchayat</span>
              <span className="bm-info-value bm-gp-badge" onClick={() => navigate(`/geography/gram-panchayats/${village.gram_panchayat_id}`)}>
                <HiOutlineUserGroup />
                {village.gram_panchayat_name || '-'}
              </span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">PIN Code</span>
              <span className="bm-info-value">{village.pin_code || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Census Code</span>
              <span className="bm-info-value">{village.census_code || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">LGD Code</span>
              <span className="bm-info-value">{village.lgd_code || '-'}</span>
            </div>
            <div className="bm-info-item">
              <span className="bm-info-label">Status</span>
              <span className={`bm-info-value bm-status-badge bm-status-badge--${village.is_active ? 'active' : 'inactive'}`}>
                {village.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Village Head Card */}
        <div className="bm-card bm-head-card">
          <div className="bm-card-header">
            <h3>Village Head Details</h3>
          </div>
          <div className="bm-head-grid">
            <div className="bm-head-item">
              <div className="bm-head-icon">
                <HiOutlineUser />
              </div>
              <div className="bm-head-content">
                <span className="bm-head-label">Village Head Name</span>
                <span className="bm-head-value">{village.village_head_name || '-'}</span>
              </div>
            </div>
            <div className="bm-head-item">
              <div className="bm-head-icon">
                <HiOutlinePhone />
              </div>
              <div className="bm-head-content">
                <span className="bm-head-label">Contact Number</span>
                <span className="bm-head-value">{village.village_head_mobile || '-'}</span>
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
              <span className="bm-demographic-label">Total Population</span>
              <span className="bm-demographic-value">{formatNumber(village.population)}</span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Male Population</span>
              <span className="bm-demographic-value">{formatNumber(village.male_population)}</span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Female Population</span>
              <span className="bm-demographic-value">{formatNumber(village.female_population)}</span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Households</span>
              <span className="bm-demographic-value">{formatNumber(village.households)}</span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Area (sq km)</span>
              <span className="bm-demographic-value">
                {village.area_sq_km ? village.area_sq_km.toLocaleString('en-IN') : '-'}
              </span>
            </div>
            <div className="bm-demographic-item">
              <span className="bm-demographic-label">Area (hectares)</span>
              <span className="bm-demographic-value">
                {village.area_hectares ? village.area_hectares.toLocaleString('en-IN') : '-'}
              </span>
            </div>
            {village.latitude && village.longitude && (
              <div className="bm-demographic-item bm-demographic-item--wide">
                <span className="bm-demographic-label">Coordinates</span>
                <span className="bm-demographic-value bm-coords">
                  {village.latitude.toFixed(4)}, {village.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Amenities Card */}
        <div className="bm-card bm-amenities-card">
          <div className="bm-card-header">
            <h3>Amenities</h3>
          </div>
          <div className="bm-amenities-grid">
            {amenities.map((amenity) => (
              <div key={amenity.key} className={`bm-amenity-item ${amenity.value ? 'bm-amenity-item--available' : 'bm-amenity-item--unavailable'}`}>
                {amenity.value ? (
                  <HiOutlineCheckCircle className="bm-amenity-icon bm-amenity-icon--yes" />
                ) : (
                  <HiOutlineXCircle className="bm-amenity-icon bm-amenity-icon--no" />
                )}
                <span className="bm-amenity-label">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillageDetails;
