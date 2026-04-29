import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineChevronRight,
  HiOutlineViewGrid,
  HiOutlineStar,
  HiOutlineSparkles,
} from 'react-icons/hi';
import servicesData, { getActiveCategories, getPopularServices, getNewServices, getTotalServicesCount, getActiveServicesCount } from '../../../data/servicesData';
import './ServiceCatalog.scss';

const ServiceCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategories = useMemo(() => getActiveCategories(), []);
  const popularServices = useMemo(() => getPopularServices(), []);
  const newServices = useMemo(() => getNewServices(), []);
  const totalCount = useMemo(() => getTotalServicesCount(), []);
  const activeCount = useMemo(() => getActiveServicesCount(), []);

  // Search across all services in all categories
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { serviceName: string; categoryName: string; categorySlug: string; icon: string; color: string; fee: number | undefined }[] = [];
    servicesData.forEach(cat => {
      cat.services.forEach(svc => {
        if (
          svc.name.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q) ||
          (svc.nameHindi && svc.nameHindi.includes(q))
        ) {
          results.push({
            serviceName: svc.name,
            categoryName: cat.name,
            categorySlug: cat.slug,
            icon: svc.icon,
            color: svc.color,
            fee: svc.fee,
          });
        }
      });
    });
    return results;
  }, [searchQuery]);

  return (
    <div className="svc-catalog">
      <div className="svc-page-header">
        <div className="svc-page-header-left">
          <HiOutlineViewGrid className="svc-page-icon" />
          <div>
            <h1 className="svc-page-title">Services</h1>
            <p className="svc-page-subtitle">Browse and manage all available services</p>
          </div>
        </div>
        <Link to="/services/manage" className="svc-btn svc-btn-primary" style={{ textDecoration: 'none' }}>
          Manage Services
        </Link>
      </div>

      {/* Stats */}
      <div className="svc-stats-row">
        <div className="svc-stat-card">
          <span className="svc-stat-value">{activeCategories.length}</span>
          <span className="svc-stat-label">Categories</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{totalCount}</span>
          <span className="svc-stat-label">Total Services</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{activeCount}</span>
          <span className="svc-stat-label">Active Services</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{popularServices.length}</span>
          <span className="svc-stat-label">Popular</span>
        </div>
      </div>

      {/* Search */}
      <div className="svc-filters-bar">
        <div className="svc-search-box" style={{ maxWidth: '100%' }}>
          <HiOutlineSearch />
          <input
            placeholder="Search services across all categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="svc-section">
          <div className="svc-section-header">
            <h2>
              Search Results
              <span className="svc-section-count">{searchResults.length}</span>
            </h2>
          </div>
          {searchResults.length > 0 ? (
            <div className="svc-highlight-grid">
              {searchResults.slice(0, 20).map((item, idx) => (
                <Link
                  key={idx}
                  to={`/services/category/${item.categorySlug}`}
                  className="svc-highlight-item"
                >
                  <div className="svc-highlight-icon" style={{ background: item.color }}>
                    {item.icon}
                  </div>
                  <div className="svc-highlight-text">
                    <span className="svc-highlight-name">{item.serviceName}</span>
                    <span className="svc-highlight-category">{item.categoryName}</span>
                  </div>
                  {item.fee != null && (
                    <span className="svc-highlight-fee">
                      {item.fee === 0 ? 'Free' : `₹${item.fee}`}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="svc-empty-state">No services match your search.</div>
          )}
        </div>
      )}

      {/* Popular Services */}
      {!searchQuery.trim() && (
        <>
          <div className="svc-section">
            <div className="svc-section-header">
              <h2>
                <HiOutlineStar style={{ color: '#f59e0b' }} />
                Popular Services
                <span className="svc-section-count">{popularServices.length}</span>
              </h2>
            </div>
            <div className="svc-highlight-grid">
              {popularServices.slice(0, 12).map(({ service, categoryName }) => {
                const cat = servicesData.find(c => c.name === categoryName);
                return (
                  <Link
                    key={service.id}
                    to={`/services/category/${cat?.slug || ''}`}
                    className="svc-highlight-item"
                  >
                    <div className="svc-highlight-icon" style={{ background: service.color }}>
                      {service.icon}
                    </div>
                    <div className="svc-highlight-text">
                      <span className="svc-highlight-name">{service.name}</span>
                      <span className="svc-highlight-category">{categoryName}</span>
                    </div>
                    {service.fee != null && (
                      <span className="svc-highlight-fee">
                        {service.fee === 0 ? 'Free' : `₹${service.fee}`}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* New Services */}
          {newServices.length > 0 && (
            <div className="svc-section">
              <div className="svc-section-header">
                <h2>
                  <HiOutlineSparkles style={{ color: '#6366f1' }} />
                  New Services
                  <span className="svc-section-count">{newServices.length}</span>
                </h2>
              </div>
              <div className="svc-highlight-grid">
                {newServices.map(({ service, categoryName }) => {
                  const cat = servicesData.find(c => c.name === categoryName);
                  return (
                    <Link
                      key={service.id}
                      to={`/services/category/${cat?.slug || ''}`}
                      className="svc-highlight-item"
                    >
                      <div className="svc-highlight-icon" style={{ background: service.color }}>
                        {service.icon}
                      </div>
                      <div className="svc-highlight-text">
                        <span className="svc-highlight-name">{service.name}</span>
                        <span className="svc-highlight-category">{categoryName}</span>
                      </div>
                      <span className="svc-badge svc-badge--new">New</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Categories */}
          <div className="svc-section">
            <div className="svc-section-header">
              <h2>
                All Categories
                <span className="svc-section-count">{activeCategories.length}</span>
              </h2>
            </div>
            <div className="svc-category-grid">
              {activeCategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/services/category/${cat.slug}`}
                  className="svc-category-card"
                >
                  <div className="svc-category-header">
                    <div className="svc-category-icon" style={{ background: cat.gradient }}>
                      {cat.icon}
                    </div>
                    <div className="svc-category-info">
                      <h3>{cat.name}</h3>
                      <p>{cat.description}</p>
                    </div>
                  </div>
                  <div className="svc-category-footer">
                    <span className="svc-service-count">
                      {cat.services.filter(s => s.isActive).length} services
                    </span>
                    <HiOutlineChevronRight className="svc-category-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceCatalog;
