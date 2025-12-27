import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineCube,
  HiOutlineStar,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineFolder,
  HiOutlineLightningBolt,
  HiOutlineChevronDown
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { Service, CategoryWithServices } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import './ServiceList.scss';

const SERVICES_PER_CATEGORY = 8;

const ServiceList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [groupedCategories, setGroupedCategories] = useState<CategoryWithServices[]>([]);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteService, setDeleteService] = useState<Service | null>(null);

  // Expanded categories state (for "Load More" functionality)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    setSearchParams(params, { replace: true });
  }, [searchQuery, setSearchParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await servicesApi.getServicesGrouped();

      if (response.success && response.data) {
        setGroupedCategories(response.data.categories || []);
        setTotalServices(response.data.total_services || 0);
      } else {
        setError(response.message || 'Failed to load services');
        setGroupedCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Unable to connect to the server. Please try again.');
      setGroupedCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter categories and services based on search
  const filteredCategories = groupedCategories
    .map(category => {
      if (!searchQuery) return category;

      const query = searchQuery.toLowerCase();
      const filteredServices = category.services.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.department?.toLowerCase().includes(query)
      );

      return { ...category, services: filteredServices };
    })
    .filter(category => category.services.length > 0);

  const handleDeleteClick = (service: Service) => {
    setDeleteService(service);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteService) return;

    setDeleteLoading(true);
    try {
      const response = await servicesApi.deleteService(deleteService.id);
      if (response.success) {
        fetchData();
      } else {
        setError(response.message || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete service. Please try again.');
    } finally {
      setDeleteLoading(false);
      setDeleteService(null);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
    }
  };

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getVisibleServices = (category: CategoryWithServices) => {
    if (expandedCategories.has(category.id)) {
      return category.services;
    }
    return category.services.slice(0, SERVICES_PER_CATEGORY);
  };

  const categoryCount = filteredCategories.length;
  const filteredServiceCount = filteredCategories.reduce((sum, cat) => sum + cat.services.length, 0);

  return (
    <div className="svl">
      <PageHeader
        icon={<HiOutlineCube />}
        title="Services"
        description={`${totalServices} services across ${groupedCategories.length} categories`}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={fetchData} disabled={loading}>
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => navigate('/services/new')}>
              <HiOutlinePlus />
              <span>Add Service</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="svl-alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="svl-bar">
        <div className="svl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search services..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="svl-stats">
          <span className="svl-stat">
            <HiOutlineFolder /> {categoryCount} Categories
          </span>
          <span className="svl-stat">
            <HiOutlineCube /> {filteredServiceCount} Services
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="svl-content">
        {loading ? (
          <div className="svl-loading">
            <div className="svl-spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="svl-groups">
            {filteredCategories.map((category) => {
              const visibleServices = getVisibleServices(category);
              const hasMore = category.services.length > SERVICES_PER_CATEGORY;
              const isExpanded = expandedCategories.has(category.id);
              const remainingCount = category.services.length - SERVICES_PER_CATEGORY;

              return (
                <div key={category.id} className="svl-group">
                  {/* Category Header */}
                  <div className="svl-group__header">
                    <div className="svl-group__icon">
                      {category.icon_url ? (
                        <img src={category.icon_url} alt={category.name} />
                      ) : (
                        <HiOutlineFolder />
                      )}
                    </div>
                    <div className="svl-group__info">
                      <h3 className="svl-group__title">{category.name}</h3>
                      <span className="svl-group__count">{category.services.length} services</span>
                    </div>
                  </div>

                  {/* Services Grid */}
                  <div className="svl-grid">
                    {visibleServices.map((service) => (
                      <div
                        key={service.id}
                        className={`svl-card ${service.is_featured ? 'svl-card--featured' : ''} ${service.is_popular ? 'svl-card--popular' : ''}`}
                      >
                        <button
                          className="svl-card__view-icon"
                          onClick={() => navigate(`/services/${service.id}`)}
                          title="View Details"
                        >
                          <HiOutlineArrowRight />
                        </button>
                        <div className="svl-card__head">
                          <div className="svl-card__badges">
                            <span className={`svl-card__tag ${service.is_active ? 'tag-active' : 'tag-inactive'}`}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {service.is_popular && (
                              <span className="svl-card__tag tag-popular">
                                <HiOutlineStar /> Popular
                              </span>
                            )}
                            {service.is_featured && (
                              <span className="svl-card__tag tag-featured">
                                <HiOutlineLightningBolt /> Featured
                              </span>
                            )}
                          </div>
                          <h4 className="svl-card__name">{service.name}</h4>
                        </div>
                        <div className="svl-card__nums">
                          <div className="svl-card__num">
                            <strong>{service.is_free_service ? 'Free' : `₹${service.total_fee || 0}`}</strong>
                            <span>Fee</span>
                          </div>
                          <div className="svl-card__num">
                            <strong>{service.processing_time || '—'}</strong>
                            <span>Time</span>
                          </div>
                        </div>
                        <div className="svl-card__foot">
                          <div className="svl-card__btns">
                            <button className="view-btn" onClick={() => navigate(`/services/${service.id}`)} title="View">
                              <HiOutlineEye />
                              <span className="btn-text">View</span>
                            </button>
                            <button className="edit-btn" onClick={() => navigate(`/services/${service.id}/edit`)} title="Edit">
                              <HiOutlinePencil />
                              <span className="btn-text">Edit</span>
                            </button>
                            <button className="del" onClick={() => handleDeleteClick(service)} title="Delete">
                              <HiOutlineTrash />
                              <span className="btn-text">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="svl-group__more">
                      <button
                        className="svl-group__more-btn"
                        onClick={() => toggleCategoryExpand(category.id)}
                      >
                        {isExpanded ? (
                          <>Show Less</>
                        ) : (
                          <>
                            <HiOutlineChevronDown />
                            Load More ({remainingCount} more)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="svl-empty">
            <HiOutlineCube />
            <h4>No services found</h4>
            <p>{searchQuery ? 'Try adjusting your search' : 'Create your first service'}</p>
            {!searchQuery && (
              <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => navigate('/services/new')}>
                <HiOutlinePlus /> Add Service
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteService}
        onClose={() => setDeleteService(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message="Are you sure you want to delete this service?"
        itemName={deleteService?.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ServiceList;
