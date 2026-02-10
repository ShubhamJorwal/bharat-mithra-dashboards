import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineCollection,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineCube,
} from 'react-icons/hi';
import servicesData, {
  getActiveCategories,
  getTotalServicesCount,
  getNewServices,
  getPopularServices,
  type ServiceCategory,
  type ServiceItem,
} from '../../../data/servicesData';
import './ServicePortal.scss';

const ServicePortal = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategories = useMemo(() => getActiveCategories(), []);
  const totalServices = useMemo(() => getTotalServicesCount(), []);
  const newServices = useMemo(() => getNewServices(), []);
  const popularServices = useMemo(() => getPopularServices(), []);

  // Filter categories/services by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return activeCategories;
    const q = searchQuery.toLowerCase();
    return activeCategories
      .map(cat => {
        const matchedServices = cat.services.filter(s =>
          s.name.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q)
        );
        if (cat.name.toLowerCase().includes(q)) return cat;
        if (matchedServices.length > 0) return { ...cat, services: matchedServices };
        return null;
      })
      .filter(Boolean) as ServiceCategory[];
  }, [searchQuery, activeCategories]);

  // Search results for individual services
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { service: ServiceItem; categoryName: string; categorySlug: string }[] = [];
    servicesData.forEach(cat => {
      cat.services.forEach(s => {
        if (s.name.toLowerCase().includes(q)) {
          results.push({ service: s, categoryName: cat.name, categorySlug: cat.slug });
        }
      });
    });
    return results;
  }, [searchQuery]);

  return (
    <div className="spt">
      {/* Header */}
      <div className="spt-header">
        <div className="spt-header__left">
          <h1 className="spt-header__title">
            <HiOutlineCollection />
            Services
          </h1>
          <p className="spt-header__subtitle">
            {activeCategories.length} Categories &bull; {totalServices} Services Available
          </p>
        </div>
        <div className="spt-header__right">
          <div className="spt-search">
            <HiOutlineSearch />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="spt-stats">
        <div className="spt-stat spt-stat--categories">
          <div className="spt-stat__icon">
            <HiOutlineCollection />
          </div>
          <div className="spt-stat__info">
            <span className="spt-stat__value">{activeCategories.length}</span>
            <span className="spt-stat__label">Categories</span>
          </div>
        </div>
        <div className="spt-stat spt-stat--services">
          <div className="spt-stat__icon">
            <HiOutlineCube />
          </div>
          <div className="spt-stat__info">
            <span className="spt-stat__value">{totalServices}</span>
            <span className="spt-stat__label">Total Services</span>
          </div>
        </div>
        <div className="spt-stat spt-stat--popular">
          <div className="spt-stat__icon">
            <HiOutlineStar />
          </div>
          <div className="spt-stat__info">
            <span className="spt-stat__value">{popularServices.length}</span>
            <span className="spt-stat__label">Popular</span>
          </div>
        </div>
        <div className="spt-stat spt-stat--new">
          <div className="spt-stat__icon">
            <HiOutlineSparkles />
          </div>
          <div className="spt-stat__info">
            <span className="spt-stat__value">{newServices.length}</span>
            <span className="spt-stat__label">New Services</span>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && searchResults.length > 0 && (
        <div className="spt-search-results">
          <h3 className="spt-section-title">
            <HiOutlineSearch /> Search Results ({searchResults.length})
          </h3>
          <div className="spt-services-grid">
            {searchResults.map(({ service, categoryName, categorySlug }) => (
              <div
                key={service.id}
                className="spt-service-card"
                onClick={() => navigate(`/services/portal/${categorySlug}`)}
              >
                <div className="spt-service-card__icon" style={{ background: `linear-gradient(135deg, ${service.color}22, ${service.color}08)` }}>
                  <span>{service.icon}</span>
                </div>
                <div className="spt-service-card__info">
                  <h4>{service.name}</h4>
                  <span className="spt-service-card__category">{categoryName}</span>
                </div>
                {service.isNew && <span className="spt-badge spt-badge--new">NEW</span>}
                {service.isPopular && <span className="spt-badge spt-badge--popular"><HiOutlineStar /></span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Services Section */}
      {!searchQuery.trim() && newServices.length > 0 && (
        <div className="spt-section">
          <h3 className="spt-section-title">
            <HiOutlineSparkles /> New Services
          </h3>
          <div className="spt-services-grid">
            {newServices.map(({ service, categoryName }) => (
              <div
                key={service.id}
                className="spt-service-card spt-service-card--new"
              >
                <div className="spt-service-card__icon" style={{ background: `linear-gradient(135deg, ${service.color}22, ${service.color}08)` }}>
                  <span>{service.icon}</span>
                </div>
                <div className="spt-service-card__info">
                  <h4>{service.name}</h4>
                  <span className="spt-service-card__category">{categoryName}</span>
                </div>
                <span className="spt-badge spt-badge--new">NEW</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="spt-section">
        <h3 className="spt-section-title">
          <HiOutlineCollection /> {searchQuery.trim() ? 'Matching Categories' : 'All Categories'}
        </h3>
        <div className="spt-categories-grid">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="spt-category-card"
              onClick={() => navigate(`/services/portal/${category.slug}`)}
            >
              <div className="spt-category-card__header" style={{ background: category.gradient }}>
                <span className="spt-category-card__emoji">{category.icon}</span>
                <div className="spt-category-card__arrow">
                  <HiOutlineArrowRight />
                </div>
              </div>
              <div className="spt-category-card__body">
                <h3 className="spt-category-card__name">{category.name}</h3>
                {category.nameHindi && (
                  <span className="spt-category-card__hindi">{category.nameHindi}</span>
                )}
                <p className="spt-category-card__desc">{category.description}</p>
                <div className="spt-category-card__footer">
                  <span className="spt-category-card__count">
                    {category.services.filter(s => s.isActive).length} Services
                  </span>
                  {category.services.some(s => s.isNew) && (
                    <span className="spt-badge spt-badge--new">NEW</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {searchQuery.trim() && filteredCategories.length === 0 && searchResults.length === 0 && (
        <div className="spt-empty">
          <HiOutlineSearch />
          <h4>No services found</h4>
          <p>Try adjusting your search query</p>
        </div>
      )}

      {/* Popular Services */}
      {!searchQuery.trim() && popularServices.length > 0 && (
        <div className="spt-section">
          <h3 className="spt-section-title">
            <HiOutlineStar /> Popular Services
          </h3>
          <div className="spt-services-grid spt-services-grid--popular">
            {popularServices.slice(0, 12).map(({ service, categoryName }) => (
              <div
                key={service.id}
                className="spt-service-card"
              >
                <div className="spt-service-card__icon" style={{ background: `linear-gradient(135deg, ${service.color}22, ${service.color}08)` }}>
                  <span>{service.icon}</span>
                </div>
                <div className="spt-service-card__info">
                  <h4>{service.name}</h4>
                  <span className="spt-service-card__category">{categoryName}</span>
                </div>
                <span className="spt-badge spt-badge--popular"><HiOutlineStar /></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePortal;
