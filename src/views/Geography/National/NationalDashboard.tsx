import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineGlobeAlt,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineRefresh,
  HiOutlineChevronRight,
  HiOutlineMap,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { NationalSummary } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './NationalDashboard.scss';

const NationalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NationalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getNationalSummary();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to load national data');
        setData(null);
      }
    } catch (err) {
      console.error('Failed to fetch national summary:', err);
      setError('Unable to connect to the server. Please try again later.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 100000) {
      return (num / 100000).toFixed(2) + ' Lakh';
    }
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="bm-national-dashboard">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading national data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bm-national-dashboard">
        <PageHeader
          icon={<HiOutlineGlobeAlt />}
          title="India - National Overview"
          description="Complete administrative hierarchy of India"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={fetchData}>
              <HiOutlineRefresh />
              <span>Retry</span>
            </button>
          }
        />
        <div className="bm-error-state">
          <HiOutlineExclamationCircle className="bm-error-icon" />
          <h3>Unable to Load Data</h3>
          <p>{error || 'No data available'}</p>
          <button className="bm-btn bm-btn-primary" onClick={fetchData}>
            <HiOutlineRefresh />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-national-dashboard">
      <PageHeader
        icon={<HiOutlineGlobeAlt />}
        title="India - National Overview"
        description="Complete administrative hierarchy of India"
        actions={
          <button
            className="bm-btn bm-btn-secondary"
            onClick={fetchData}
            disabled={loading}
          >
            <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* India Flag Header */}
      <div className="bm-india-header">
        <div className="bm-india-flag">
          <div className="bm-flag-saffron"></div>
          <div className="bm-flag-white">
            <div className="bm-ashoka-chakra"></div>
          </div>
          <div className="bm-flag-green"></div>
        </div>
        <div className="bm-india-info">
          <h2>{data.country} <span className="bm-hindi">{data.country_hindi}</span></h2>
          <p>Capital: {data.capital}</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="bm-stats-grid">
        <div className="bm-stat-card bm-stat-states" onClick={() => navigate('/geography/states')}>
          <div className="bm-stat-icon">
            <HiOutlineMap />
          </div>
          <div className="bm-stat-content">
            <div className="bm-stat-value">{data.total_states}</div>
            <div className="bm-stat-label">States</div>
          </div>
          <HiOutlineChevronRight className="bm-stat-arrow" />
        </div>

        <div className="bm-stat-card bm-stat-uts" onClick={() => navigate('/geography/states?type=union_territory')}>
          <div className="bm-stat-icon">
            <HiOutlineLocationMarker />
          </div>
          <div className="bm-stat-content">
            <div className="bm-stat-value">{data.total_union_territories}</div>
            <div className="bm-stat-label">Union Territories</div>
          </div>
          <HiOutlineChevronRight className="bm-stat-arrow" />
        </div>

        <div className="bm-stat-card bm-stat-districts" onClick={() => navigate('/geography/districts')}>
          <div className="bm-stat-icon">
            <HiOutlineOfficeBuilding />
          </div>
          <div className="bm-stat-content">
            <div className="bm-stat-value">{data.total_districts}</div>
            <div className="bm-stat-label">Districts</div>
          </div>
          <HiOutlineChevronRight className="bm-stat-arrow" />
        </div>

        <div className="bm-stat-card bm-stat-taluks" onClick={() => navigate('/geography/taluks')}>
          <div className="bm-stat-icon">
            <HiOutlineLocationMarker />
          </div>
          <div className="bm-stat-content">
            <div className="bm-stat-value">{formatNumber(data.total_taluks)}</div>
            <div className="bm-stat-label">Taluks / Tehsils</div>
          </div>
          <HiOutlineChevronRight className="bm-stat-arrow" />
        </div>

        <div className="bm-stat-card bm-stat-gps" onClick={() => navigate('/geography/gram-panchayats')}>
          <div className="bm-stat-icon">
            <HiOutlineUserGroup />
          </div>
          <div className="bm-stat-content">
            <div className="bm-stat-value">{formatNumber(data.total_gram_panchayats)}</div>
            <div className="bm-stat-label">Gram Panchayats</div>
          </div>
          <HiOutlineChevronRight className="bm-stat-arrow" />
        </div>

        <div className="bm-stat-card bm-stat-villages" onClick={() => navigate('/geography/villages')}>
          <div className="bm-stat-icon">
            <HiOutlineHome />
          </div>
          <div className="bm-stat-content">
            <div className="bm-stat-value">{formatNumber(data.total_villages)}</div>
            <div className="bm-stat-label">Villages</div>
          </div>
          <HiOutlineChevronRight className="bm-stat-arrow" />
        </div>
      </div>

      {/* Hierarchy Visualization */}
      <div className="bm-card bm-hierarchy-card">
        <h3 className="bm-card-title">Administrative Hierarchy</h3>
        <div className="bm-hierarchy">
          <div className="bm-hierarchy-item bm-level-1">
            <div className="bm-hierarchy-icon">🇮🇳</div>
            <div className="bm-hierarchy-label">India</div>
            <div className="bm-hierarchy-count">1 Nation</div>
          </div>
          <div className="bm-hierarchy-connector"></div>
          <div className="bm-hierarchy-item bm-level-2">
            <div className="bm-hierarchy-icon">🏛️</div>
            <div className="bm-hierarchy-label">States & UTs</div>
            <div className="bm-hierarchy-count">{(data.total_states || 0) + (data.total_union_territories || 0)} Total</div>
          </div>
          <div className="bm-hierarchy-connector"></div>
          <div className="bm-hierarchy-item bm-level-3">
            <div className="bm-hierarchy-icon">🏢</div>
            <div className="bm-hierarchy-label">Districts</div>
            <div className="bm-hierarchy-count">{data.total_districts}+</div>
          </div>
          <div className="bm-hierarchy-connector"></div>
          <div className="bm-hierarchy-item bm-level-4">
            <div className="bm-hierarchy-icon">🏘️</div>
            <div className="bm-hierarchy-label">Taluks / Tehsils</div>
            <div className="bm-hierarchy-count">{formatNumber(data.total_taluks)}</div>
          </div>
          <div className="bm-hierarchy-connector"></div>
          <div className="bm-hierarchy-item bm-level-5">
            <div className="bm-hierarchy-icon">🏡</div>
            <div className="bm-hierarchy-label">Gram Panchayats</div>
            <div className="bm-hierarchy-count">{formatNumber(data.total_gram_panchayats)}</div>
          </div>
          <div className="bm-hierarchy-connector"></div>
          <div className="bm-hierarchy-item bm-level-6">
            <div className="bm-hierarchy-icon">🏠</div>
            <div className="bm-hierarchy-label">Villages</div>
            <div className="bm-hierarchy-count">{formatNumber(data.total_villages)}</div>
          </div>
        </div>
      </div>

      {/* Zones Grid */}
      {data.zones && (
        <div className="bm-card bm-zones-card">
          <h3 className="bm-card-title">Regional Zones</h3>
          <div className="bm-zones-grid">
            <div className="bm-zone-item bm-zone-north" onClick={() => navigate('/geography/states?zone=north')}>
              <div className="bm-zone-count">{data.zones.north}</div>
              <div className="bm-zone-label">North</div>
            </div>
            <div className="bm-zone-item bm-zone-south" onClick={() => navigate('/geography/states?zone=south')}>
              <div className="bm-zone-count">{data.zones.south}</div>
              <div className="bm-zone-label">South</div>
            </div>
            <div className="bm-zone-item bm-zone-east" onClick={() => navigate('/geography/states?zone=east')}>
              <div className="bm-zone-count">{data.zones.east}</div>
              <div className="bm-zone-label">East</div>
            </div>
            <div className="bm-zone-item bm-zone-west" onClick={() => navigate('/geography/states?zone=west')}>
              <div className="bm-zone-count">{data.zones.west}</div>
              <div className="bm-zone-label">West</div>
            </div>
            <div className="bm-zone-item bm-zone-central" onClick={() => navigate('/geography/states?zone=central')}>
              <div className="bm-zone-count">{data.zones.central}</div>
              <div className="bm-zone-label">Central</div>
            </div>
            <div className="bm-zone-item bm-zone-northeast" onClick={() => navigate('/geography/states?zone=northeast')}>
              <div className="bm-zone-count">{data.zones.northeast}</div>
              <div className="bm-zone-label">Northeast</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bm-card bm-quick-actions-card">
        <h3 className="bm-card-title">Quick Actions</h3>
        <div className="bm-quick-actions">
          <button className="bm-action-btn" onClick={() => navigate('/geography/states/new')}>
            <HiOutlineMap />
            <span>Add State/UT</span>
          </button>
          <button className="bm-action-btn" onClick={() => navigate('/geography/districts/new')}>
            <HiOutlineOfficeBuilding />
            <span>Add District</span>
          </button>
          <button className="bm-action-btn" onClick={() => navigate('/geography/taluks/new')}>
            <HiOutlineLocationMarker />
            <span>Add Taluk</span>
          </button>
          <button className="bm-action-btn" onClick={() => navigate('/geography/gram-panchayats/new')}>
            <HiOutlineUserGroup />
            <span>Add Gram Panchayat</span>
          </button>
          <button className="bm-action-btn" onClick={() => navigate('/geography/villages/new')}>
            <HiOutlineHome />
            <span>Add Village</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NationalDashboard;
