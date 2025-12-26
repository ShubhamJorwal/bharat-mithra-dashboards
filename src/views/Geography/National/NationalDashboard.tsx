import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineChevronRight
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
    { label: 'States', value: data.total_states, path: '/geography/states' },
    { label: 'Union Territories', value: data.total_union_territories, path: '/geography/states?type=union_territory' },
    { label: 'Districts', value: data.total_districts, path: '/geography/districts' },
    { label: 'Taluks', value: data.total_taluks, path: '/geography/taluks' },
    { label: 'Gram Panchayats', value: data.total_gram_panchayats, path: '/geography/gram-panchayats' },
    { label: 'Villages', value: data.total_villages, path: '/geography/villages' }
  ];

  const zones = data.zones ? [
    { name: 'North', count: data.zones.north, code: 'N' },
    { name: 'South', count: data.zones.south, code: 'S' },
    { name: 'East', count: data.zones.east, code: 'E' },
    { name: 'West', count: data.zones.west, code: 'W' },
    { name: 'Central', count: data.zones.central, code: 'C' },
    { name: 'Northeast', count: data.zones.northeast, code: 'NE' }
  ] : [];

  return (
    <div className="nd">
      {/* Header */}
      <header className="nd-header">
        <div className="nd-header__info">
          <h1 className="nd-header__title">{data.country}</h1>
          <span className="nd-header__subtitle">{data.country_hindi}</span>
        </div>
        <div className="nd-header__meta">
          <span className="nd-header__capital">Capital: {data.capital}</span>
          <button className="nd-header__refresh" onClick={fetchData} title="Refresh">
            <HiOutlineRefresh />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="nd-grid">
        {hierarchyItems.map((item, index) => (
          <article
            key={item.label}
            className="nd-card"
            onClick={() => navigate(item.path)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="nd-card__number">{formatNumber(item.value)}</div>
            <div className="nd-card__label">{item.label}</div>
            <HiOutlineArrowRight className="nd-card__arrow" />
          </article>
        ))}
      </div>

      {/* Zones Section */}
      {zones.length > 0 && (
        <section className="nd-zones">
          <h2 className="nd-zones__title">Regional Distribution</h2>
          <div className="nd-zones__list">
            {zones.map((zone) => (
              <div
                key={zone.name}
                className="nd-zone"
                onClick={() => navigate(`/geography/states?zone=${zone.name.toLowerCase()}`)}
              >
                <span className="nd-zone__code">{zone.code}</span>
                <span className="nd-zone__name">{zone.name}</span>
                <span className="nd-zone__count">{zone.count}</span>
                <HiOutlineChevronRight className="nd-zone__arrow" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="nd-links">
        <h2 className="nd-links__title">Quick Actions</h2>
        <div className="nd-links__grid">
          <button className="nd-link" onClick={() => navigate('/geography/states/new')}>
            Add State
          </button>
          <button className="nd-link" onClick={() => navigate('/geography/districts/new')}>
            Add District
          </button>
          <button className="nd-link" onClick={() => navigate('/geography/taluks/new')}>
            Add Taluk
          </button>
          <button className="nd-link" onClick={() => navigate('/geography/gram-panchayats/new')}>
            Add Gram Panchayat
          </button>
          <button className="nd-link" onClick={() => navigate('/geography/villages/new')}>
            Add Village
          </button>
        </div>
      </section>
    </div>
  );
};

export default NationalDashboard;
