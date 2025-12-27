import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineFolder,
  HiOutlineFolderOpen,
  HiOutlineCollection,
  HiOutlineArrowRight,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { ServiceCategory } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import './CategoryList.scss';

const CategoryList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() =>
    (searchParams.get('view') as 'grid' | 'list') || 'grid'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showSubcategories, setShowSubcategories] = useState<'all' | 'parents' | 'subcategories'>(
    (searchParams.get('filter') as 'all' | 'parents' | 'subcategories') || 'all'
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(() =>
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    parseInt(searchParams.get('limit') || '12', 10)
  );
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setCurrentPage(1);
        setPageInput('1');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (itemsPerPage !== 12) params.set('limit', itemsPerPage.toString());
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (showSubcategories !== 'all') params.set('filter', showSubcategories);
    setSearchParams(params, { replace: true });
  }, [searchQuery, currentPage, itemsPerPage, viewMode, showSubcategories, setSearchParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getAllCategories(true);
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setCategories([]);
        if (response.message) setError(response.message);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
      setError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    let result = categories;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(cat =>
        cat.name.toLowerCase().includes(query) ||
        cat.name_hindi?.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query) ||
        cat.slug?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (showSubcategories === 'parents') {
      result = result.filter(cat => !cat.parent_id);
    } else if (showSubcategories === 'subcategories') {
      result = result.filter(cat => cat.parent_id);
    }

    return result;
  }, [categories, searchQuery, showSubcategories]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const totalItems = filteredCategories.length;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  // Get parent category name
  const getParentName = useCallback((parentId: string | null | undefined) => {
    if (!parentId) return null;
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || null;
  }, [categories]);

  // Get subcategory count
  const getSubcategoryCount = useCallback((categoryId: string) => {
    return categories.filter(c => c.parent_id === categoryId).length;
  }, [categories]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const response = await servicesApi.deleteCategory(deleteTarget.id);
      if (response.success) {
        setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        setError(response.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Failed to delete category. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Page navigation
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
      const page = parseInt(pageInput, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput, 10);
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

  const handleFilterChange = (value: string) => {
    setShowSubcategories(value as 'all' | 'parents' | 'subcategories');
    setCurrentPage(1);
    setPageInput('1');
  };

  // Stats
  const parentCount = categories.filter(c => !c.parent_id).length;
  const subcategoryCount = categories.filter(c => c.parent_id).length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="cl">
      <PageHeader
        icon={<HiOutlineCollection />}
        title="Service Categories"
        description={`${parentCount} Parent Categories, ${subcategoryCount} Subcategories`}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={fetchData} disabled={loading}>
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => navigate('/services/categories/new')}>
              <HiOutlinePlus />
              <span>Add Category</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="cl-alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="cl-bar">
        <div className="cl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="cl-filters">
          <HiOutlineFilter className="cl-filter-icon" />
          <select value={showSubcategories} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="parents">Parents Only</option>
            <option value="subcategories">Subcategories Only</option>
          </select>
          <div className="cl-toggle">
            <button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')} title="Grid View">
              <HiOutlineViewGrid />
            </button>
            <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')} title="List View">
              <HiOutlineViewList />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="cl-content">
        {loading ? (
          <div className="cl-loading">
            <div className="cl-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : paginatedCategories.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="cl-grid">
              {paginatedCategories.map((category) => {
                const parentName = getParentName(category.parent_id);
                const subCount = getSubcategoryCount(category.id);

                return (
                  <div
                    key={category.id}
                    className={`cl-card ${category.parent_id ? 'cl-card--sub' : 'cl-card--parent'}`}
                  >
                    <button
                      className="cl-card__view-icon"
                      onClick={() => navigate(`/services/categories/${category.id}/edit`)}
                      title="Edit Category"
                    >
                      <HiOutlineArrowRight />
                    </button>
                    <div className="cl-card__image">
                      {category.icon_url ? (
                        <img src={category.icon_url} alt={category.name} />
                      ) : category.parent_id ? (
                        <HiOutlineFolderOpen />
                      ) : (
                        <HiOutlineFolder />
                      )}
                    </div>
                    <div className="cl-card__head">
                      <div className="cl-card__badges">
                        <span className={`cl-card__tag ${category.is_active ? 'tag-active' : 'tag-inactive'}`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {category.parent_id ? (
                          <span className="cl-card__tag tag-sub">Subcategory</span>
                        ) : (
                          <span className="cl-card__tag tag-parent">Parent</span>
                        )}
                      </div>
                      <h4 className="cl-card__name">{category.name}</h4>
                      {category.name_hindi && (
                        <span className="cl-card__hindi">{category.name_hindi}</span>
                      )}
                    </div>
                    {category.description && (
                      <p className="cl-card__desc">{category.description}</p>
                    )}
                    <div className="cl-card__row">
                      <span className="cl-card__label">
                        <HiOutlineFolder /> {parentName ? 'Parent' : 'Slug'}
                      </span>
                      <span className="cl-card__value">{parentName || category.slug}</span>
                    </div>
                    <div className="cl-card__nums">
                      <div className="cl-card__num">
                        <strong>{subCount}</strong>
                        <span>Subcategories</span>
                      </div>
                      <div className="cl-card__num">
                        <strong>#{category.sort_order}</strong>
                        <span>Order</span>
                      </div>
                    </div>
                    <div className="cl-card__foot">
                      <div className="cl-card__btns">
                        <button className="edit-btn" onClick={() => navigate(`/services/categories/${category.id}/edit`)} title="Edit">
                          <HiOutlinePencil />
                          <span className="btn-text">Edit</span>
                        </button>
                        <button className="del" onClick={() => setDeleteTarget(category)} title="Delete">
                          <HiOutlineTrash />
                          <span className="btn-text">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cl-table-wrap">
              <table className="cl-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Hindi Name</th>
                    <th>Parent</th>
                    <th className="num">Order</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category, index) => {
                    const parentName = getParentName(category.parent_id);

                    return (
                      <tr key={category.id} className={index % 2 === 1 ? 'row-alt' : ''}>
                        <td>
                          <div className="cl-table__main">
                            <div className="cl-table__icon">
                              {category.icon_url ? (
                                <img src={category.icon_url} alt={category.name} />
                              ) : category.parent_id ? (
                                <HiOutlineFolderOpen />
                              ) : (
                                <HiOutlineFolder />
                              )}
                            </div>
                            <div className="cl-table__txt">
                              <strong>{category.name}</strong>
                              <span className="slug">{category.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="cl-table__hindi">{category.name_hindi || '—'}</span>
                        </td>
                        <td>
                          {parentName ? (
                            <span className="cl-table__parent">{parentName}</span>
                          ) : (
                            <span className="cl-table__root">Root</span>
                          )}
                        </td>
                        <td className="num">
                          <span>{category.sort_order}</span>
                        </td>
                        <td>
                          <span className={`cl-table__status ${category.is_active ? 'status-active' : 'status-inactive'}`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="cl-table__acts">
                            <button className="edit-btn" onClick={() => navigate(`/services/categories/${category.id}/edit`)} title="Edit">
                              <HiOutlinePencil />
                            </button>
                            <button className="del" onClick={() => setDeleteTarget(category)} title="Delete">
                              <HiOutlineTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="cl-empty">
            <HiOutlineFolder />
            <h4>No categories found</h4>
            <p>{searchQuery || showSubcategories !== 'all' ? 'Try adjusting your filters' : 'Create your first category'}</p>
            {!searchQuery && showSubcategories === 'all' && (
              <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => navigate('/services/categories/new')}>
                <HiOutlinePlus /> Add Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Bar */}
      {!loading && paginatedCategories.length > 0 && (
        <div className="cl-footer">
          <div className="cl-footer__info">
            <span>Showing {startIndex + 1}-{endIndex} of {totalItems}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="cl-footer__perpage"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={36}>36 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="cl-pagination">
            <button
              className="cl-pagination__btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <HiOutlineChevronDoubleLeft />
            </button>
            <button
              className="cl-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous"
            >
              <HiOutlineChevronLeft />
            </button>
            <div className="cl-pagination__input">
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputSubmit}
                onBlur={handlePageInputBlur}
              />
              <span>of {totalPages}</span>
            </div>
            <button
              className="cl-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Next"
            >
              <HiOutlineChevronRight />
            </button>
            <button
              className="cl-pagination__btn"
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
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        itemName={deleteTarget?.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default CategoryList;
