import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import { getCategoryBySlug, getActiveCategories } from '../../../data/servicesData';
import type { ServiceItem } from '../../../data/servicesData';
import './CategoryServices.scss';

const CategoryServices = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'popular' | 'new'>('all');

  const category = useMemo(() => slug ? getCategoryBySlug(slug) : undefined, [slug]);
  const categories = useMemo(() => getActiveCategories(), []);

  if (!category) {
    return (
      <div className="svc-category-view">
        <div className="svc-breadcrumb">
          <Link to="/services">Services</Link>
          <span className="svc-breadcrumb-sep"><HiOutlineChevronRight /></span>
          <span className="svc-breadcrumb-current">Not Found</span>
        </div>
        <div className="svc-empty-state">
          Category not found. <Link to="/services">Go back to services</Link>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    let list = category.services;

    if (filter === 'active') list = list.filter(s => s.isActive);
    else if (filter === 'popular') list = list.filter(s => s.isPopular);
    else if (filter === 'new') list = list.filter(s => s.isNew);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.nameHindi && s.nameHindi.includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [category.services, filter, searchQuery]);

  const stats = useMemo(() => ({
    total: category.services.length,
    active: category.services.filter(s => s.isActive).length,
    popular: category.services.filter(s => s.isPopular).length,
    newCount: category.services.filter(s => s.isNew).length,
  }), [category.services]);

  const toggleExpand = (id: string) => {
    setExpandedService(prev => prev === id ? null : id);
  };

  const renderServiceCard = (service: ServiceItem) => {
    const isExpanded = expandedService === service.id;

    return (
      <div key={service.id} className="svc-service-card">
        <div className="svc-service-card-top">
          <div className="svc-service-icon" style={{ background: service.color }}>
            {service.icon}
          </div>
          <div className="svc-service-meta">
            <h4>{service.name}</h4>
            {service.nameHindi && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {service.nameHindi}
              </span>
            )}
            <div className="svc-service-tags">
              {!service.isActive && <span className="svc-badge svc-badge--inactive">Inactive</span>}
              {service.isPopular && <span className="svc-badge svc-badge--popular">Popular</span>}
              {service.isNew && <span className="svc-badge svc-badge--new">New</span>}
              {service.isOnline && <span className="svc-badge svc-badge--active">Online</span>}
              {service.fee === 0 && <span className="svc-badge svc-badge--free">Free</span>}
            </div>
          </div>
        </div>

        <div className="svc-service-card-bottom">
          <div className="svc-service-fee">
            <span className="svc-fee-label">Fee:</span>
            {service.fee === 0 ? 'Free' : `₹${service.fee}`}
          </div>
          {service.commission != null && service.commission > 0 && (
            <span className="svc-service-commission">
              Commission: ₹{service.commission}
            </span>
          )}
          {service.formFields && service.formFields.length > 0 && (
            <button
              className="svc-btn-icon"
              style={{ width: 24, height: 24, fontSize: 14 }}
              onClick={() => toggleExpand(service.id)}
              title="View form fields"
            >
              {isExpanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
            </button>
          )}
        </div>

        {isExpanded && service.formFields && (
          <div className="svc-service-detail">
            <div className="svc-service-fields-label">Form Fields ({service.formFields.length})</div>
            <div className="svc-field-list">
              {service.formFields.map((field, idx) => (
                <span key={idx} className="svc-field-tag">
                  {field.label}
                  {field.required && <span style={{ color: '#e74c3c' }}>*</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Find next/prev category for navigation
  const currentIdx = categories.findIndex(c => c.slug === slug);
  const prevCat = currentIdx > 0 ? categories[currentIdx - 1] : null;
  const nextCat = currentIdx < categories.length - 1 ? categories[currentIdx + 1] : null;

  return (
    <div className="svc-category-view">
      {/* Breadcrumb */}
      <div className="svc-breadcrumb">
        <Link to="/services">Services</Link>
        <span className="svc-breadcrumb-sep"><HiOutlineChevronRight /></span>
        <span className="svc-breadcrumb-current">{category.name}</span>
      </div>

      {/* Category Banner */}
      <div className="svc-cat-banner" style={{ background: category.gradient }}>
        <div className="svc-cat-banner-icon">{category.icon}</div>
        <div className="svc-cat-banner-info">
          <h1>{category.name}</h1>
          <p>{category.description}</p>
          {category.nameHindi && <div className="svc-cat-hindi">{category.nameHindi}</div>}
        </div>
      </div>

      {/* Activation banner for paid categories */}
      {category.requiresActivation && (
        <div className="svc-activation-banner">
          <div className="svc-activation-title">Activation Required</div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0' }}>
            This category requires activation for agents
          </p>
          <div className="svc-activation-price">₹{category.activationFee}</div>
          {category.activationFeatures && (
            <ul className="svc-activation-features">
              {category.activationFeatures.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="svc-stats-row">
        <div className="svc-stat-card">
          <span className="svc-stat-value">{stats.total}</span>
          <span className="svc-stat-label">Total Services</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{stats.active}</span>
          <span className="svc-stat-label">Active</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{stats.popular}</span>
          <span className="svc-stat-label">Popular</span>
        </div>
        <div className="svc-stat-card">
          <span className="svc-stat-value">{stats.newCount}</span>
          <span className="svc-stat-label">New</span>
        </div>
      </div>

      {/* Filters */}
      <div className="svc-filters-bar">
        <div className="svc-filters-row">
          <div className="svc-search-box">
            <HiOutlineSearch />
            <input
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="svc-filter-chips">
            {(['all', 'active', 'popular', 'new'] as const).map(f => (
              <button
                key={f}
                className={`svc-chip ${filter === f ? 'svc-chip--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? `All (${stats.total})` :
                 f === 'active' ? `Active (${stats.active})` :
                 f === 'popular' ? `Popular (${stats.popular})` :
                 `New (${stats.newCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {filtered.length > 0 ? (
        <div className="svc-services-grid">
          {filtered.map(renderServiceCard)}
        </div>
      ) : (
        <div className="svc-empty-state">No services match the current filters.</div>
      )}

      {/* Prev / Next Category Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
        {prevCat ? (
          <Link to={`/services/category/${prevCat.slug}`} className="svc-btn svc-btn-secondary" style={{ textDecoration: 'none' }}>
            {prevCat.icon} {prevCat.name}
          </Link>
        ) : <div />}
        {nextCat && (
          <Link to={`/services/category/${nextCat.slug}`} className="svc-btn svc-btn-secondary" style={{ textDecoration: 'none' }}>
            {nextCat.name} {nextCat.icon}
          </Link>
        )}
      </div>
    </div>
  );
};

export default CategoryServices;
