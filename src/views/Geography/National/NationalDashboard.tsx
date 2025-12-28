import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineGlobe,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineLibrary,
  HiOutlineShieldCheck,
  HiOutlineCurrencyRupee,
  HiOutlineAcademicCap,
  HiOutlineHeart
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { NationalSummary } from '../../../types/api.types';
import './NationalDashboard.scss';

// Carousel items for showcasing government and private services
const carouselItems = [
  {
    id: 1,
    title: 'Digital India',
    subtitle: 'Government Services Portal',
    description: 'Access 1000+ government services online',
    icon: HiOutlineGlobe,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    title: 'Aadhaar Services',
    subtitle: 'Identity & Authentication',
    description: 'Universal ID for 1.4 billion citizens',
    icon: HiOutlineShieldCheck,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    title: 'Jan Dhan Yojana',
    subtitle: 'Financial Inclusion',
    description: 'Banking services for every citizen',
    icon: HiOutlineCurrencyRupee,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    title: 'e-Governance',
    subtitle: 'Document Services',
    description: 'Birth certificates, licenses & more',
    icon: HiOutlineDocumentText,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 5,
    title: 'Skill India',
    subtitle: 'Education & Training',
    description: 'Empowering youth with skills',
    icon: HiOutlineAcademicCap,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 6,
    title: 'Ayushman Bharat',
    subtitle: 'Healthcare Services',
    description: 'Health coverage for 500M+ citizens',
    icon: HiOutlineHeart,
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 7,
    title: 'MSME Support',
    subtitle: 'Business Services',
    description: 'Supporting small businesses growth',
    icon: HiOutlineBriefcase,
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
  },
  {
    id: 8,
    title: 'Public Libraries',
    subtitle: 'Knowledge Resources',
    description: 'Digital & physical resources',
    icon: HiOutlineLibrary,
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
  }
];

const NationalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NationalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  }, []);

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
      {/* Redesigned Hero Section */}
      <header className="nd-hero">
        <div className="nd-hero__emblem">
          <div className="nd-hero__emblem-ring">
            <div className="nd-hero__emblem-inner">
              <HiOutlineGlobe className="nd-hero__emblem-icon" />
            </div>
          </div>
          <div className="nd-hero__emblem-decoration"></div>
        </div>

        <div className="nd-hero__text">
          <div className="nd-hero__badge">Bharat Mithra</div>
          <h1 className="nd-hero__title">{data.country}</h1>
          <p className="nd-hero__tagline">Unified Digital Governance Platform</p>
          <div className="nd-hero__stats">
            <div className="nd-hero__stat">
              <span className="nd-hero__stat-value">{totalEntities}</span>
              <span className="nd-hero__stat-label">States & UTs</span>
            </div>
            <div className="nd-hero__stat-divider"></div>
            <div className="nd-hero__stat">
              <span className="nd-hero__stat-value">{data.capital}</span>
              <span className="nd-hero__stat-label">Capital</span>
            </div>
          </div>
        </div>

        <button className="nd-hero__refresh" onClick={fetchData} title="Refresh">
          <HiOutlineRefresh />
        </button>
      </header>

      {/* Services Carousel */}
      <section className="nd-section">
        <h2 className="nd-section__title">Government & Public Services</h2>
        <div
          className="nd-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button className="nd-carousel__nav nd-carousel__nav--prev" onClick={prevSlide}>
            <HiOutlineChevronLeft />
          </button>

          <div className="nd-carousel__track">
            {carouselItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = index === currentSlide;
              const isPrev = index === (currentSlide - 1 + carouselItems.length) % carouselItems.length;
              const isNext = index === (currentSlide + 1) % carouselItems.length;

              return (
                <div
                  key={item.id}
                  className={`nd-carousel__slide ${isActive ? 'nd-carousel__slide--active' : ''} ${isPrev ? 'nd-carousel__slide--prev' : ''} ${isNext ? 'nd-carousel__slide--next' : ''}`}
                  style={{ '--slide-gradient': item.gradient } as React.CSSProperties}
                >
                  <div className="nd-carousel__slide-icon">
                    <IconComponent />
                  </div>
                  <div className="nd-carousel__slide-content">
                    <h3 className="nd-carousel__slide-title">{item.title}</h3>
                    <span className="nd-carousel__slide-subtitle">{item.subtitle}</span>
                    <p className="nd-carousel__slide-desc">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="nd-carousel__nav nd-carousel__nav--next" onClick={nextSlide}>
            <HiOutlineChevronRight />
          </button>

          <div className="nd-carousel__dots">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                className={`nd-carousel__dot ${index === currentSlide ? 'nd-carousel__dot--active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

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
