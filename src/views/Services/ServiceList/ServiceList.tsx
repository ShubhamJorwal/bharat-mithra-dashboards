import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineCube,
  HiOutlineStar,
  HiOutlineExclamationCircle,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineArrowRight,
  HiOutlineFolder,
  HiOutlineCurrencyRupee,
  HiOutlineTag,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { Service, ServiceCategory } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import './ServiceList.scss';

const ServiceList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteService, setDeleteService] = useState<Service | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('per_page')) || 12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState(String(currentPage));

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        servicesApi.getServices({
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery || undefined,
          category_id: selectedCategory !== 'all' ? selectedCategory : undefined
        }),
        servicesApi.getCategories()
      ]);

      if (servicesRes.success && servicesRes.data) {
        setServices(servicesRes.data);
        setTotalItems(servicesRes.meta?.total || servicesRes.data.length);
        setTotalPages(servicesRes.meta?.total_pages || Math.ceil((servicesRes.meta?.total || servicesRes.data.length) / itemsPerPage));
      } else {
        setError(servicesRes.message || 'Failed to load services');
        setServices([]);
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Unable to connect to the server. Please try again.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (itemsPerPage !== 12) params.set('per_page', String(itemsPerPage));
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, currentPage, itemsPerPage, setSearchParams]);

  const handleFilterChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    setPageInput('1');
  };

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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInput);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1);
      setPageInput('1');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const popularCount = services.filter(s => s.is_popular).length;
  const featuredCount = services.filter(s => s.is_featured).length;

  return (
    <div className="svl">
      <PageHeader
        icon={<HiOutlineCube />}
        title="Services"
        description={`${totalItems} services, ${popularCount} popular, ${featuredCount} featured`}
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
        <div className="svl-filters">
          <HiOutlineFilter className="svl-filter-icon" />
          <select value={selectedCategory} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="svl-toggle">
            <button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')} title="Grid View">
              <HiOutlineViewGrid />
            </button>
            <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')} title="List View">
              <HiOutlineViewList />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="svl-content">
        {loading ? (
          <div className="svl-loading">
            <div className="svl-spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : services.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="svl-grid">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`svl-card ${service.is_featured ? 'svl-card--featured' : ''} ${service.is_popular ? 'svl-card--popular' : ''}`}
                >
                  <button
                    className="svl-card__view-icon"
                    onClick={() => navigate(`/services/${service.slug}`)}
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
                    {service.name_hindi && (
                      <span className="svl-card__hindi">{service.name_hindi}</span>
                    )}
                  </div>
                  {service.description && (
                    <p className="svl-card__desc">{service.description}</p>
                  )}
                  <div className="svl-card__row">
                    <span className="svl-card__label"><HiOutlineFolder /> Category</span>
                    <span className="svl-card__value">{getCategoryName(service.category_id)}</span>
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
                      <button className="view-btn" onClick={() => navigate(`/services/${service.slug}`)} title="View">
                        <HiOutlineEye />
                        <span className="btn-text">View</span>
                      </button>
                      <button className="edit-btn" onClick={() => navigate(`/services/${service.slug}/edit`)} title="Edit">
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
          ) : (
            <div className="svl-table-wrap">
              <table className="svl-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th className="num">Fee</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={service.id} className={index % 2 === 1 ? 'row-alt' : ''}>
                      <td>
                        <div className="svl-table__main">
                          <div className="svl-table__icon">
                            <HiOutlineCube />
                          </div>
                          <div className="svl-table__txt">
                            <strong>{service.name}</strong>
                            {service.name_hindi && <span className="hindi">{service.name_hindi}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="svl-table__category">{getCategoryName(service.category_id)}</span>
                      </td>
                      <td>
                        <span className="svl-table__dept">{service.department || '—'}</span>
                      </td>
                      <td className="num">
                        <span className={service.is_free_service ? 'fee-free' : 'fee-paid'}>
                          {service.is_free_service ? 'Free' : `₹${service.total_fee || 0}`}
                        </span>
                      </td>
                      <td>
                        <span className={`svl-table__status ${service.is_active ? 'status-active' : 'status-inactive'}`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="svl-table__acts">
                          <button className="view-btn" onClick={() => navigate(`/services/${service.slug}`)} title="View">
                            <HiOutlineEye />
                          </button>
                          <button className="edit-btn" onClick={() => navigate(`/services/${service.slug}/edit`)} title="Edit">
                            <HiOutlinePencil />
                          </button>
                          <button className="del" onClick={() => handleDeleteClick(service)} title="Delete">
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="svl-empty">
            <HiOutlineCube />
            <h4>No services found</h4>
            <p>{searchQuery || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Create your first service'}</p>
            {!searchQuery && selectedCategory === 'all' && (
              <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => navigate('/services/new')}>
                <HiOutlinePlus /> Add Service
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Bar */}
      {!loading && services.length > 0 && (
        <div className="svl-footer">
          <div className="svl-footer__info">
            <span>Showing {startIndex + 1}-{endIndex} of {totalItems}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="svl-footer__perpage"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={36}>36 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="svl-pagination">
            <button
              className="svl-pagination__btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <HiOutlineChevronDoubleLeft />
            </button>
            <button
              className="svl-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous"
            >
              <HiOutlineChevronLeft />
            </button>
            <div className="svl-pagination__input">
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputSubmit}
                onBlur={handlePageInputBlur}
              />
              <span>of {totalPages || 1}</span>
            </div>
            <button
              className="svl-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Next"
            >
              <HiOutlineChevronRight />
            </button>
            <button
              className="svl-pagination__btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              title="Last Page"
            >
              <HiOutlineChevronDoubleRight />
            </button>
          </div>
        </div>
      )}

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
