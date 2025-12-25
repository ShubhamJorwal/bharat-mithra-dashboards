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
  HiOutlineExclamationCircle,
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
  HiOutlineFlag
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { NationalSummary } from '../../../types/api.types';
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
      return (num / 100000).toFixed(2) + ' L';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="bm-national">
        <div className="bm-loading-screen">
          <div className="bm-loading-content">
            <div className="bm-india-loader">
              <div className="bm-loader-ring"></div>
              <div className="bm-loader-ring"></div>
              <div className="bm-loader-ring"></div>
              <HiOutlineFlag className="bm-loader-icon" />
            </div>
            <h3>Loading India Overview</h3>
            <p>Fetching national statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bm-national">
        <div className="bm-error-screen">
          <div className="bm-error-content">
            <div className="bm-error-icon-wrapper">
              <HiOutlineExclamationCircle />
            </div>
            <h2>Unable to Load Data</h2>
            <p>{error || 'No data available at the moment'}</p>
            <button className="bm-retry-btn" onClick={fetchData}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-national">
      {/* Hero Section */}
      <section className="bm-hero">
        <div className="bm-hero-bg">
          <div className="bm-hero-pattern"></div>
          <div className="bm-hero-gradient"></div>
        </div>

        <div className="bm-hero-content">
          <div className="bm-india-emblem">
            <div className="bm-flag-wrapper">
              <div className="bm-flag">
                <span className="bm-saffron"></span>
                <span className="bm-white">
                  <span className="bm-chakra"></span>
                </span>
                <span className="bm-green"></span>
              </div>
            </div>
            <div className="bm-emblem-glow"></div>
          </div>

          <div className="bm-hero-text">
            <div className="bm-title-badge">
              <HiOutlineSparkles />
              <span>National Overview</span>
            </div>
            <h1>
              {data.country}
              <span className="bm-hindi">{data.country_hindi}</span>
            </h1>
            <p className="bm-subtitle">
              <HiOutlineLocationMarker />
              <span>Capital: <strong>{data.capital}</strong></span>
            </p>
          </div>

          <button
            className="bm-refresh-btn"
            onClick={fetchData}
            title="Refresh Data"
          >
            <HiOutlineRefresh />
          </button>
        </div>
      </section>

      {/* Main Statistics Grid */}
      <section className="bm-stats-section">
        <div className="bm-section-header">
          <h2>
            <HiOutlineTrendingUp />
            Administrative Overview
          </h2>
          <p>Complete geographical hierarchy of India</p>
        </div>

        <div className="bm-stats-grid">
          {/* States Card */}
          <div
            className="bm-stat-card bm-stat-states"
            onClick={() => navigate('/geography/states')}
          >
            <div className="bm-stat-visual">
              <div className="bm-stat-icon">
                <HiOutlineMap />
              </div>
              <div className="bm-stat-pattern"></div>
            </div>
            <div className="bm-stat-info">
              <span className="bm-stat-value">{data.total_states}</span>
              <span className="bm-stat-label">States</span>
            </div>
            <div className="bm-stat-hover">
              <span>View All</span>
              <HiOutlineChevronRight />
            </div>
          </div>

          {/* Union Territories Card */}
          <div
            className="bm-stat-card bm-stat-uts"
            onClick={() => navigate('/geography/states?type=union_territory')}
          >
            <div className="bm-stat-visual">
              <div className="bm-stat-icon">
                <HiOutlineFlag />
              </div>
              <div className="bm-stat-pattern"></div>
            </div>
            <div className="bm-stat-info">
              <span className="bm-stat-value">{data.total_union_territories}</span>
              <span className="bm-stat-label">Union Territories</span>
            </div>
            <div className="bm-stat-hover">
              <span>View All</span>
              <HiOutlineChevronRight />
            </div>
          </div>

          {/* Districts Card */}
          <div
            className="bm-stat-card bm-stat-districts"
            onClick={() => navigate('/geography/districts')}
          >
            <div className="bm-stat-visual">
              <div className="bm-stat-icon">
                <HiOutlineOfficeBuilding />
              </div>
              <div className="bm-stat-pattern"></div>
            </div>
            <div className="bm-stat-info">
              <span className="bm-stat-value">{data.total_districts}</span>
              <span className="bm-stat-label">Districts</span>
            </div>
            <div className="bm-stat-hover">
              <span>View All</span>
              <HiOutlineChevronRight />
            </div>
          </div>

          {/* Taluks Card */}
          <div
            className="bm-stat-card bm-stat-taluks"
            onClick={() => navigate('/geography/taluks')}
          >
            <div className="bm-stat-visual">
              <div className="bm-stat-icon">
                <HiOutlineLocationMarker />
              </div>
              <div className="bm-stat-pattern"></div>
            </div>
            <div className="bm-stat-info">
              <span className="bm-stat-value">{formatNumber(data.total_taluks)}</span>
              <span className="bm-stat-label">Taluks / Tehsils</span>
            </div>
            <div className="bm-stat-hover">
              <span>View All</span>
              <HiOutlineChevronRight />
            </div>
          </div>

          {/* Gram Panchayats Card */}
          <div
            className="bm-stat-card bm-stat-gps"
            onClick={() => navigate('/geography/gram-panchayats')}
          >
            <div className="bm-stat-visual">
              <div className="bm-stat-icon">
                <HiOutlineUserGroup />
              </div>
              <div className="bm-stat-pattern"></div>
            </div>
            <div className="bm-stat-info">
              <span className="bm-stat-value">{formatNumber(data.total_gram_panchayats)}</span>
              <span className="bm-stat-label">Gram Panchayats</span>
            </div>
            <div className="bm-stat-hover">
              <span>View All</span>
              <HiOutlineChevronRight />
            </div>
          </div>

          {/* Villages Card */}
          <div
            className="bm-stat-card bm-stat-villages"
            onClick={() => navigate('/geography/villages')}
          >
            <div className="bm-stat-visual">
              <div className="bm-stat-icon">
                <HiOutlineHome />
              </div>
              <div className="bm-stat-pattern"></div>
            </div>
            <div className="bm-stat-info">
              <span className="bm-stat-value">{formatNumber(data.total_villages)}</span>
              <span className="bm-stat-label">Villages</span>
            </div>
            <div className="bm-stat-hover">
              <span>View All</span>
              <HiOutlineChevronRight />
            </div>
          </div>
        </div>
      </section>

      {/* Administrative Hierarchy */}
      <section className="bm-hierarchy-section">
        <div className="bm-section-header">
          <h2>
            <HiOutlineGlobeAlt />
            Administrative Hierarchy
          </h2>
          <p>From nation to village - the governance structure</p>
        </div>

        <div className="bm-hierarchy-flow">
          <div className="bm-hierarchy-item bm-level-nation">
            <div className="bm-h-icon">
              <span className="bm-h-emoji">&#127470;&#127475;</span>
            </div>
            <div className="bm-h-content">
              <span className="bm-h-title">India</span>
              <span className="bm-h-count">1 Nation</span>
            </div>
          </div>

          <div className="bm-hierarchy-arrow">
            <HiOutlineArrowRight />
          </div>

          <div className="bm-hierarchy-item bm-level-state">
            <div className="bm-h-icon">
              <HiOutlineMap />
            </div>
            <div className="bm-h-content">
              <span className="bm-h-title">States & UTs</span>
              <span className="bm-h-count">{(data.total_states || 0) + (data.total_union_territories || 0)} Entities</span>
            </div>
          </div>

          <div className="bm-hierarchy-arrow">
            <HiOutlineArrowRight />
          </div>

          <div className="bm-hierarchy-item bm-level-district">
            <div className="bm-h-icon">
              <HiOutlineOfficeBuilding />
            </div>
            <div className="bm-h-content">
              <span className="bm-h-title">Districts</span>
              <span className="bm-h-count">{data.total_districts}+ Districts</span>
            </div>
          </div>

          <div className="bm-hierarchy-arrow">
            <HiOutlineArrowRight />
          </div>

          <div className="bm-hierarchy-item bm-level-taluk">
            <div className="bm-h-icon">
              <HiOutlineLocationMarker />
            </div>
            <div className="bm-h-content">
              <span className="bm-h-title">Taluks</span>
              <span className="bm-h-count">{formatNumber(data.total_taluks)} Taluks</span>
            </div>
          </div>

          <div className="bm-hierarchy-arrow">
            <HiOutlineArrowRight />
          </div>

          <div className="bm-hierarchy-item bm-level-gp">
            <div className="bm-h-icon">
              <HiOutlineUserGroup />
            </div>
            <div className="bm-h-content">
              <span className="bm-h-title">Gram Panchayats</span>
              <span className="bm-h-count">{formatNumber(data.total_gram_panchayats)} GPs</span>
            </div>
          </div>

          <div className="bm-hierarchy-arrow">
            <HiOutlineArrowRight />
          </div>

          <div className="bm-hierarchy-item bm-level-village">
            <div className="bm-h-icon">
              <HiOutlineHome />
            </div>
            <div className="bm-h-content">
              <span className="bm-h-title">Villages</span>
              <span className="bm-h-count">{formatNumber(data.total_villages)} Villages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Zones */}
      {data.zones && (
        <section className="bm-zones-section">
          <div className="bm-section-header">
            <h2>
              <HiOutlineGlobeAlt />
              Regional Zones
            </h2>
            <p>Explore states by geographical regions</p>
          </div>

          <div className="bm-zones-grid">
            <div
              className="bm-zone-card bm-zone-north"
              onClick={() => navigate('/geography/states?zone=north')}
            >
              <div className="bm-zone-bg"></div>
              <div className="bm-zone-content">
                <span className="bm-zone-value">{data.zones.north}</span>
                <span className="bm-zone-name">North India</span>
                <span className="bm-zone-direction">N</span>
              </div>
            </div>

            <div
              className="bm-zone-card bm-zone-south"
              onClick={() => navigate('/geography/states?zone=south')}
            >
              <div className="bm-zone-bg"></div>
              <div className="bm-zone-content">
                <span className="bm-zone-value">{data.zones.south}</span>
                <span className="bm-zone-name">South India</span>
                <span className="bm-zone-direction">S</span>
              </div>
            </div>

            <div
              className="bm-zone-card bm-zone-east"
              onClick={() => navigate('/geography/states?zone=east')}
            >
              <div className="bm-zone-bg"></div>
              <div className="bm-zone-content">
                <span className="bm-zone-value">{data.zones.east}</span>
                <span className="bm-zone-name">East India</span>
                <span className="bm-zone-direction">E</span>
              </div>
            </div>

            <div
              className="bm-zone-card bm-zone-west"
              onClick={() => navigate('/geography/states?zone=west')}
            >
              <div className="bm-zone-bg"></div>
              <div className="bm-zone-content">
                <span className="bm-zone-value">{data.zones.west}</span>
                <span className="bm-zone-name">West India</span>
                <span className="bm-zone-direction">W</span>
              </div>
            </div>

            <div
              className="bm-zone-card bm-zone-central"
              onClick={() => navigate('/geography/states?zone=central')}
            >
              <div className="bm-zone-bg"></div>
              <div className="bm-zone-content">
                <span className="bm-zone-value">{data.zones.central}</span>
                <span className="bm-zone-name">Central India</span>
                <span className="bm-zone-direction">C</span>
              </div>
            </div>

            <div
              className="bm-zone-card bm-zone-northeast"
              onClick={() => navigate('/geography/states?zone=northeast')}
            >
              <div className="bm-zone-bg"></div>
              <div className="bm-zone-content">
                <span className="bm-zone-value">{data.zones.northeast}</span>
                <span className="bm-zone-name">Northeast India</span>
                <span className="bm-zone-direction">NE</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="bm-actions-section">
        <div className="bm-section-header">
          <h2>
            <HiOutlinePlusCircle />
            Quick Actions
          </h2>
          <p>Add new geographical entities</p>
        </div>

        <div className="bm-actions-grid">
          <button
            className="bm-action-card"
            onClick={() => navigate('/geography/states/new')}
          >
            <div className="bm-action-icon bm-action-state">
              <HiOutlineMap />
            </div>
            <span className="bm-action-label">Add State/UT</span>
            <HiOutlineChevronRight className="bm-action-arrow" />
          </button>

          <button
            className="bm-action-card"
            onClick={() => navigate('/geography/districts/new')}
          >
            <div className="bm-action-icon bm-action-district">
              <HiOutlineOfficeBuilding />
            </div>
            <span className="bm-action-label">Add District</span>
            <HiOutlineChevronRight className="bm-action-arrow" />
          </button>

          <button
            className="bm-action-card"
            onClick={() => navigate('/geography/taluks/new')}
          >
            <div className="bm-action-icon bm-action-taluk">
              <HiOutlineLocationMarker />
            </div>
            <span className="bm-action-label">Add Taluk</span>
            <HiOutlineChevronRight className="bm-action-arrow" />
          </button>

          <button
            className="bm-action-card"
            onClick={() => navigate('/geography/gram-panchayats/new')}
          >
            <div className="bm-action-icon bm-action-gp">
              <HiOutlineUserGroup />
            </div>
            <span className="bm-action-label">Add Gram Panchayat</span>
            <HiOutlineChevronRight className="bm-action-arrow" />
          </button>

          <button
            className="bm-action-card"
            onClick={() => navigate('/geography/villages/new')}
          >
            <div className="bm-action-icon bm-action-village">
              <HiOutlineHome />
            </div>
            <span className="bm-action-label">Add Village</span>
            <HiOutlineChevronRight className="bm-action-arrow" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default NationalDashboard;
