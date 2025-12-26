import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineChevronRight,
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineHome
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
    return num.toLocaleString('en-IN');
  };

  const formatCompact = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="nd">
        <div className="nd-loading">
          <div className="nd-loading__spinner"></div>
          <span className="nd-loading__text">Loading</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="nd">
        <div className="nd-error">
          <HiOutlineExclamationCircle className="nd-error__icon" />
          <h2 className="nd-error__title">Unable to Load</h2>
          <p className="nd-error__text">{error || 'No data available'}</p>
          <button className="nd-error__btn" onClick={fetchData}>
            <HiOutlineRefresh />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hierarchyItems = [
    { label: 'States', value: data.total_states, path: '/geography/states', icon: HiOutlineMap },
    { label: 'Union Territories', value: data.total_union_territories, path: '/geography/states?type=union_territory', icon: HiOutlineMap },
    { label: 'Districts', value: data.total_districts, path: '/geography/districts', icon: HiOutlineOfficeBuilding },
    { label: 'Taluks', value: data.total_taluks, path: '/geography/taluks', icon: HiOutlineLocationMarker },
    { label: 'Gram Panchayats', value: data.total_gram_panchayats, path: '/geography/gram-panchayats', icon: HiOutlineUserGroup },
    { label: 'Villages', value: data.total_villages, path: '/geography/villages', icon: HiOutlineHome }
  ];

  const zones = data.zones ? [
    { name: 'North', count: data.zones.north, code: 'N' },
    { name: 'South', count: data.zones.south, code: 'S' },
    { name: 'East', count: data.zones.east, code: 'E' },
    { name: 'West', count: data.zones.west, code: 'W' },
    { name: 'Central', count: data.zones.central, code: 'C' },
    { name: 'Northeast', count: data.zones.northeast, code: 'NE' }
  ] : [];

  const totalEntities = (data.total_states || 0) + (data.total_union_territories || 0);

  return (
    <div className="nd">
      {/* Hero Section with Flag */}
      <header className="nd-hero">
        <div className="nd-hero__content">
          <div className="nd-hero__info">
            <div className="nd-hero__badge">National Database</div>
            <h1 className="nd-hero__title">{data.country}</h1>
            <span className="nd-hero__subtitle">{data.country_hindi}</span>
            <div className="nd-hero__meta">
              <span>Capital: <strong>{data.capital}</strong></span>
              <span className="nd-hero__divider">|</span>
              <span>Entities: <strong>{totalEntities}</strong></span>
            </div>
          </div>

          {/* Indian Flag */}
          <div className="nd-flag">
            <div className="nd-flag__container">
              <div className="nd-flag__stripe nd-flag__stripe--saffron"></div>
              <div className="nd-flag__stripe nd-flag__stripe--white">
                <div className="nd-flag__chakra">
                  <div className="nd-flag__chakra-center"></div>
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="nd-flag__spoke" style={{ transform: `rotate(${i * 15}deg)` }}></div>
                  ))}
                </div>
              </div>
              <div className="nd-flag__stripe nd-flag__stripe--green"></div>
            </div>
            <div className="nd-flag__pole"></div>
          </div>
        </div>

        <button className="nd-hero__refresh" onClick={fetchData} title="Refresh">
          <HiOutlineRefresh />
        </button>
      </header>

      {/* Main Stats Grid */}
      <section className="nd-section">
        <h2 className="nd-section__title">Administrative Overview</h2>
        <div className="nd-grid">
          {hierarchyItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <article
                key={item.label}
                className="nd-card"
                onClick={() => navigate(item.path)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="nd-card__icon">
                  <IconComponent />
                </div>
                <div className="nd-card__content">
                  <div className="nd-card__number">{formatNumber(item.value)}</div>
                  <div className="nd-card__label">{item.label}</div>
                </div>
                <HiOutlineArrowRight className="nd-card__arrow" />
              </article>
            );
          })}
        </div>
      </section>

      {/* Hierarchy Flow */}
      <section className="nd-section">
        <h2 className="nd-section__title">Governance Hierarchy</h2>
        <div className="nd-flow">
          <div className="nd-flow__item nd-flow__item--nation">
            <span className="nd-flow__emoji">🇮🇳</span>
            <span className="nd-flow__name">India</span>
            <span className="nd-flow__count">Nation</span>
          </div>
          <div className="nd-flow__connector"><HiOutlineArrowRight /></div>
          <div className="nd-flow__item">
            <HiOutlineMap className="nd-flow__icon" />
            <span className="nd-flow__name">States & UTs</span>
            <span className="nd-flow__count">{totalEntities}</span>
          </div>
          <div className="nd-flow__connector"><HiOutlineArrowRight /></div>
          <div className="nd-flow__item">
            <HiOutlineOfficeBuilding className="nd-flow__icon" />
            <span className="nd-flow__name">Districts</span>
            <span className="nd-flow__count">{formatCompact(data.total_districts)}</span>
          </div>
          <div className="nd-flow__connector"><HiOutlineArrowRight /></div>
          <div className="nd-flow__item">
            <HiOutlineLocationMarker className="nd-flow__icon" />
            <span className="nd-flow__name">Taluks</span>
            <span className="nd-flow__count">{formatCompact(data.total_taluks)}</span>
          </div>
          <div className="nd-flow__connector"><HiOutlineArrowRight /></div>
          <div className="nd-flow__item">
            <HiOutlineUserGroup className="nd-flow__icon" />
            <span className="nd-flow__name">Gram Panchayats</span>
            <span className="nd-flow__count">{formatCompact(data.total_gram_panchayats)}</span>
          </div>
          <div className="nd-flow__connector"><HiOutlineArrowRight /></div>
          <div className="nd-flow__item">
            <HiOutlineHome className="nd-flow__icon" />
            <span className="nd-flow__name">Villages</span>
            <span className="nd-flow__count">{formatCompact(data.total_villages)}</span>
          </div>
        </div>
      </section>

      {/* Zones Section */}
      {zones.length > 0 && (
        <section className="nd-section">
          <h2 className="nd-section__title">Regional Distribution</h2>
          <div className="nd-zones">
            {zones.map((zone) => (
              <div
                key={zone.name}
                className="nd-zone"
                onClick={() => navigate(`/geography/states?zone=${zone.name.toLowerCase()}`)}
              >
                <span className="nd-zone__code">{zone.code}</span>
                <div className="nd-zone__info">
                  <span className="nd-zone__name">{zone.name}</span>
                  <span className="nd-zone__count">{zone.count} States/UTs</span>
                </div>
                <HiOutlineChevronRight className="nd-zone__arrow" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="nd-section">
        <h2 className="nd-section__title">Quick Actions</h2>
        <div className="nd-actions">
          <button className="nd-action" onClick={() => navigate('/geography/states/new')}>
            <HiOutlineMap />
            <span>Add State</span>
          </button>
          <button className="nd-action" onClick={() => navigate('/geography/districts/new')}>
            <HiOutlineOfficeBuilding />
            <span>Add District</span>
          </button>
          <button className="nd-action" onClick={() => navigate('/geography/taluks/new')}>
            <HiOutlineLocationMarker />
            <span>Add Taluk</span>
          </button>
          <button className="nd-action" onClick={() => navigate('/geography/gram-panchayats/new')}>
            <HiOutlineUserGroup />
            <span>Add GP</span>
          </button>
          <button className="nd-action" onClick={() => navigate('/geography/villages/new')}>
            <HiOutlineHome />
            <span>Add Village</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default NationalDashboard;
