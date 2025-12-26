import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineGlobeAlt,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineRefresh,
  HiOutlineMap,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineFlag,
  HiOutlinePlus,
  HiOutlineChartPie,
  HiOutlineViewGrid,
  HiOutlineTrendingUp,
  HiOutlineCollection,
  HiOutlineDatabase
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
    if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-IN');
  };

  const formatLargeNumber = (num: number | undefined): string => {
    if (!num) return '0';
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="india-overview">
        <div className="io-loading">
          <div className="io-loading__visual">
            <div className="io-loading__map">
              <div className="io-loading__pulse"></div>
              <div className="io-loading__pulse io-loading__pulse--2"></div>
              <div className="io-loading__pulse io-loading__pulse--3"></div>
              <HiOutlineFlag className="io-loading__icon" />
            </div>
          </div>
          <h3 className="io-loading__title">Loading India Overview</h3>
          <p className="io-loading__text">Gathering administrative data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="india-overview">
        <div className="io-error">
          <div className="io-error__icon">
            <HiOutlineExclamationCircle />
          </div>
          <h2 className="io-error__title">Unable to Load Data</h2>
          <p className="io-error__message">{error || 'No data available at the moment'}</p>
          <button className="io-error__btn" onClick={fetchData}>
            <HiOutlineRefresh />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const totalEntities = (data.total_states || 0) + (data.total_union_territories || 0);

  return (
    <div className="india-overview">
      {/* Hero Section with India Map Silhouette */}
      <section className="io-hero">
        <div className="io-hero__bg">
          <div className="io-hero__gradient"></div>
          <div className="io-hero__pattern"></div>
          <div className="io-hero__glow"></div>
        </div>

        <div className="io-hero__content">
          <div className="io-hero__left">
            <div className="io-hero__badge">
              <HiOutlineDatabase />
              <span>National Database</span>
            </div>
            <h1 className="io-hero__title">
              {data.country}
              <span className="io-hero__hindi">{data.country_hindi}</span>
            </h1>
            <div className="io-hero__meta">
              <div className="io-hero__meta-item">
                <HiOutlineLocationMarker />
                <span>Capital: <strong>{data.capital}</strong></span>
              </div>
              <div className="io-hero__meta-item">
                <HiOutlineCollection />
                <span>Entities: <strong>{totalEntities}</strong></span>
              </div>
            </div>
          </div>

          <div className="io-hero__center">
            <div className="io-hero__flag">
              <div className="io-flag">
                <div className="io-flag__stripe io-flag__stripe--saffron"></div>
                <div className="io-flag__stripe io-flag__stripe--white">
                  <div className="io-ashoka">
                    <div className="io-ashoka__hub"></div>
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className="io-ashoka__spoke" style={{ transform: `rotate(${i * 15}deg)` }}></div>
                    ))}
                  </div>
                </div>
                <div className="io-flag__stripe io-flag__stripe--green"></div>
              </div>
              <div className="io-flag__shadow"></div>
            </div>
          </div>

          <div className="io-hero__right">
            <button className="io-hero__refresh" onClick={fetchData} title="Refresh Data">
              <HiOutlineRefresh />
            </button>
          </div>
        </div>
      </section>

      {/* Main Stats Cards */}
      <section className="io-stats">
        <div className="io-stats__header">
          <div className="io-stats__header-left">
            <HiOutlineChartPie className="io-stats__header-icon" />
            <div>
              <h2 className="io-stats__title">Administrative Overview</h2>
              <p className="io-stats__subtitle">Complete geographical hierarchy of India</p>
            </div>
          </div>
        </div>

        <div className="io-stats__grid">
          {/* States */}
          <div className="io-stat io-stat--states" onClick={() => navigate('/geography/states')}>
            <div className="io-stat__glow"></div>
            <div className="io-stat__content">
              <div className="io-stat__icon">
                <HiOutlineMap />
              </div>
              <div className="io-stat__data">
                <span className="io-stat__value">{data.total_states}</span>
                <span className="io-stat__label">States</span>
              </div>
            </div>
            <div className="io-stat__footer">
              <span>View all states</span>
              <HiOutlineArrowRight />
            </div>
          </div>

          {/* Union Territories */}
          <div className="io-stat io-stat--uts" onClick={() => navigate('/geography/states?type=union_territory')}>
            <div className="io-stat__glow"></div>
            <div className="io-stat__content">
              <div className="io-stat__icon">
                <HiOutlineFlag />
              </div>
              <div className="io-stat__data">
                <span className="io-stat__value">{data.total_union_territories}</span>
                <span className="io-stat__label">Union Territories</span>
              </div>
            </div>
            <div className="io-stat__footer">
              <span>View all UTs</span>
              <HiOutlineArrowRight />
            </div>
          </div>

          {/* Districts */}
          <div className="io-stat io-stat--districts" onClick={() => navigate('/geography/districts')}>
            <div className="io-stat__glow"></div>
            <div className="io-stat__content">
              <div className="io-stat__icon">
                <HiOutlineOfficeBuilding />
              </div>
              <div className="io-stat__data">
                <span className="io-stat__value">{data.total_districts}</span>
                <span className="io-stat__label">Districts</span>
              </div>
            </div>
            <div className="io-stat__footer">
              <span>View all districts</span>
              <HiOutlineArrowRight />
            </div>
          </div>

          {/* Taluks */}
          <div className="io-stat io-stat--taluks" onClick={() => navigate('/geography/taluks')}>
            <div className="io-stat__glow"></div>
            <div className="io-stat__content">
              <div className="io-stat__icon">
                <HiOutlineLocationMarker />
              </div>
              <div className="io-stat__data">
                <span className="io-stat__value">{formatNumber(data.total_taluks)}</span>
                <span className="io-stat__label">Taluks</span>
              </div>
            </div>
            <div className="io-stat__footer">
              <span>View all taluks</span>
              <HiOutlineArrowRight />
            </div>
          </div>

          {/* Gram Panchayats */}
          <div className="io-stat io-stat--gps" onClick={() => navigate('/geography/gram-panchayats')}>
            <div className="io-stat__glow"></div>
            <div className="io-stat__content">
              <div className="io-stat__icon">
                <HiOutlineUserGroup />
              </div>
              <div className="io-stat__data">
                <span className="io-stat__value">{formatNumber(data.total_gram_panchayats)}</span>
                <span className="io-stat__label">Gram Panchayats</span>
              </div>
            </div>
            <div className="io-stat__footer">
              <span>View all GPs</span>
              <HiOutlineArrowRight />
            </div>
          </div>

          {/* Villages */}
          <div className="io-stat io-stat--villages" onClick={() => navigate('/geography/villages')}>
            <div className="io-stat__glow"></div>
            <div className="io-stat__content">
              <div className="io-stat__icon">
                <HiOutlineHome />
              </div>
              <div className="io-stat__data">
                <span className="io-stat__value">{formatNumber(data.total_villages)}</span>
                <span className="io-stat__label">Villages</span>
              </div>
            </div>
            <div className="io-stat__footer">
              <span>View all villages</span>
              <HiOutlineArrowRight />
            </div>
          </div>
        </div>
      </section>

      {/* Hierarchy Flow Section */}
      <section className="io-hierarchy">
        <div className="io-hierarchy__header">
          <HiOutlineTrendingUp className="io-hierarchy__header-icon" />
          <div>
            <h2 className="io-hierarchy__title">Administrative Hierarchy</h2>
            <p className="io-hierarchy__subtitle">From nation to village - the governance structure</p>
          </div>
        </div>

        <div className="io-hierarchy__flow">
          <div className="io-hierarchy__track">
            <div className="io-level io-level--nation">
              <div className="io-level__badge">1</div>
              <div className="io-level__icon">
                <span>🇮🇳</span>
              </div>
              <div className="io-level__info">
                <span className="io-level__name">India</span>
                <span className="io-level__count">Nation</span>
              </div>
            </div>

            <div className="io-hierarchy__connector">
              <div className="io-hierarchy__line"></div>
              <HiOutlineArrowRight className="io-hierarchy__arrow" />
            </div>

            <div className="io-level io-level--states">
              <div className="io-level__badge">{totalEntities}</div>
              <div className="io-level__icon">
                <HiOutlineMap />
              </div>
              <div className="io-level__info">
                <span className="io-level__name">States & UTs</span>
                <span className="io-level__count">{totalEntities} Entities</span>
              </div>
            </div>

            <div className="io-hierarchy__connector">
              <div className="io-hierarchy__line"></div>
              <HiOutlineArrowRight className="io-hierarchy__arrow" />
            </div>

            <div className="io-level io-level--districts">
              <div className="io-level__badge">{data.total_districts}</div>
              <div className="io-level__icon">
                <HiOutlineOfficeBuilding />
              </div>
              <div className="io-level__info">
                <span className="io-level__name">Districts</span>
                <span className="io-level__count">{formatLargeNumber(data.total_districts)} Districts</span>
              </div>
            </div>

            <div className="io-hierarchy__connector">
              <div className="io-hierarchy__line"></div>
              <HiOutlineArrowRight className="io-hierarchy__arrow" />
            </div>

            <div className="io-level io-level--taluks">
              <div className="io-level__badge">{formatNumber(data.total_taluks)}</div>
              <div className="io-level__icon">
                <HiOutlineLocationMarker />
              </div>
              <div className="io-level__info">
                <span className="io-level__name">Taluks</span>
                <span className="io-level__count">{formatLargeNumber(data.total_taluks)} Taluks</span>
              </div>
            </div>

            <div className="io-hierarchy__connector">
              <div className="io-hierarchy__line"></div>
              <HiOutlineArrowRight className="io-hierarchy__arrow" />
            </div>

            <div className="io-level io-level--gps">
              <div className="io-level__badge">{formatNumber(data.total_gram_panchayats)}</div>
              <div className="io-level__icon">
                <HiOutlineUserGroup />
              </div>
              <div className="io-level__info">
                <span className="io-level__name">Gram Panchayats</span>
                <span className="io-level__count">{formatLargeNumber(data.total_gram_panchayats)} GPs</span>
              </div>
            </div>

            <div className="io-hierarchy__connector">
              <div className="io-hierarchy__line"></div>
              <HiOutlineArrowRight className="io-hierarchy__arrow" />
            </div>

            <div className="io-level io-level--villages">
              <div className="io-level__badge">{formatNumber(data.total_villages)}</div>
              <div className="io-level__icon">
                <HiOutlineHome />
              </div>
              <div className="io-level__info">
                <span className="io-level__name">Villages</span>
                <span className="io-level__count">{formatLargeNumber(data.total_villages)} Villages</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Zones */}
      {data.zones && (
        <section className="io-zones">
          <div className="io-zones__header">
            <HiOutlineGlobeAlt className="io-zones__header-icon" />
            <div>
              <h2 className="io-zones__title">Regional Distribution</h2>
              <p className="io-zones__subtitle">States & UTs by geographical zones</p>
            </div>
          </div>

          <div className="io-zones__grid">
            <div className="io-zone io-zone--north" onClick={() => navigate('/geography/states?zone=north')}>
              <div className="io-zone__bg"></div>
              <div className="io-zone__compass">N</div>
              <div className="io-zone__content">
                <span className="io-zone__value">{data.zones.north}</span>
                <span className="io-zone__name">North</span>
              </div>
              <HiOutlineArrowRight className="io-zone__arrow" />
            </div>

            <div className="io-zone io-zone--south" onClick={() => navigate('/geography/states?zone=south')}>
              <div className="io-zone__bg"></div>
              <div className="io-zone__compass">S</div>
              <div className="io-zone__content">
                <span className="io-zone__value">{data.zones.south}</span>
                <span className="io-zone__name">South</span>
              </div>
              <HiOutlineArrowRight className="io-zone__arrow" />
            </div>

            <div className="io-zone io-zone--east" onClick={() => navigate('/geography/states?zone=east')}>
              <div className="io-zone__bg"></div>
              <div className="io-zone__compass">E</div>
              <div className="io-zone__content">
                <span className="io-zone__value">{data.zones.east}</span>
                <span className="io-zone__name">East</span>
              </div>
              <HiOutlineArrowRight className="io-zone__arrow" />
            </div>

            <div className="io-zone io-zone--west" onClick={() => navigate('/geography/states?zone=west')}>
              <div className="io-zone__bg"></div>
              <div className="io-zone__compass">W</div>
              <div className="io-zone__content">
                <span className="io-zone__value">{data.zones.west}</span>
                <span className="io-zone__name">West</span>
              </div>
              <HiOutlineArrowRight className="io-zone__arrow" />
            </div>

            <div className="io-zone io-zone--central" onClick={() => navigate('/geography/states?zone=central')}>
              <div className="io-zone__bg"></div>
              <div className="io-zone__compass">C</div>
              <div className="io-zone__content">
                <span className="io-zone__value">{data.zones.central}</span>
                <span className="io-zone__name">Central</span>
              </div>
              <HiOutlineArrowRight className="io-zone__arrow" />
            </div>

            <div className="io-zone io-zone--northeast" onClick={() => navigate('/geography/states?zone=northeast')}>
              <div className="io-zone__bg"></div>
              <div className="io-zone__compass">NE</div>
              <div className="io-zone__content">
                <span className="io-zone__value">{data.zones.northeast}</span>
                <span className="io-zone__name">Northeast</span>
              </div>
              <HiOutlineArrowRight className="io-zone__arrow" />
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="io-actions">
        <div className="io-actions__header">
          <HiOutlineViewGrid className="io-actions__header-icon" />
          <div>
            <h2 className="io-actions__title">Quick Actions</h2>
            <p className="io-actions__subtitle">Add new geographical entities</p>
          </div>
        </div>

        <div className="io-actions__grid">
          <button className="io-action io-action--state" onClick={() => navigate('/geography/states/new')}>
            <div className="io-action__icon">
              <HiOutlinePlus />
            </div>
            <span className="io-action__label">Add State</span>
          </button>

          <button className="io-action io-action--district" onClick={() => navigate('/geography/districts/new')}>
            <div className="io-action__icon">
              <HiOutlinePlus />
            </div>
            <span className="io-action__label">Add District</span>
          </button>

          <button className="io-action io-action--taluk" onClick={() => navigate('/geography/taluks/new')}>
            <div className="io-action__icon">
              <HiOutlinePlus />
            </div>
            <span className="io-action__label">Add Taluk</span>
          </button>

          <button className="io-action io-action--gp" onClick={() => navigate('/geography/gram-panchayats/new')}>
            <div className="io-action__icon">
              <HiOutlinePlus />
            </div>
            <span className="io-action__label">Add GP</span>
          </button>

          <button className="io-action io-action--village" onClick={() => navigate('/geography/villages/new')}>
            <div className="io-action__icon">
              <HiOutlinePlus />
            </div>
            <span className="io-action__label">Add Village</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default NationalDashboard;
