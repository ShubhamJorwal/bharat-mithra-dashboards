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
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineExclamationCircle,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineSwitchVertical,
  HiOutlineArrowRight,
  HiOutlineGlobeAlt,
  HiOutlineUsers
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { District, State } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import ConfirmModal from '../../../components/common/ConfirmModal';
import './DistrictList.scss';

const DistrictList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [districts, setDistricts] = useState<District[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<District | null>(null);

  // Filter state - synced with URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedStateId, setSelectedStateId] = useState<string>(searchParams.get('state_id') || 'all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('per_page')) || 12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState(String(currentPage));

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sort state
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort_by') || 'name');
  const [sortOrder, setSortOrder] = useState<number>(Number(searchParams.get('sort_order')) || 1);

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

  // Fetch states for filter dropdown
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await geographyApi.getStates({ per_page: 100 });
        if (response.success && response.data) {
          setStates(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch states:', err);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts from API
  const fetchDistricts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        per_page: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedStateId !== 'all') params.state_id = selectedStateId;

      const response = await geographyApi.getDistricts(params);

      if (response.success && response.data) {
        setDistricts(response.data);
        setTotalItems(response.meta?.total || response.data.length);
        setTotalPages(response.meta?.total_pages || Math.ceil((response.meta?.total || response.data.length) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to load districts');
        setDistricts([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to fetch districts:', err);
      setError('Unable to connect to the server. Please try again.');
      setDistricts([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedStateId, sortBy, sortOrder]);

  // Fetch on filter/pagination change
  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStateId !== 'all') params.set('state_id', selectedStateId);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (itemsPerPage !== 12) params.set('per_page', String(itemsPerPage));
    if (sortBy !== 'name') params.set('sort_by', sortBy);
    if (sortOrder !== 1) params.set('sort_order', String(sortOrder));

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedStateId, currentPage, itemsPerPage, sortBy, sortOrder, setSearchParams]);

  // Reset to page 1 when filter changes
  const handleStateChange = (value: string) => {
    setSelectedStateId(value);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDeleteClick = (e: React.MouseEvent, district: District) => {
    e.stopPropagation();
    setDistrictToDelete(district);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!districtToDelete) return;

    setDeleteLoading(districtToDelete.id);
    try {
      await geographyApi.deleteDistrict(districtToDelete.id);
      setDeleteModalOpen(false);
      setDistrictToDelete(null);
      fetchDistricts();
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete district. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDistrictToDelete(null);
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
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

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1);
      setPageInput('1');
    }
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 1 ? 0 : 1);
    } else {
      setSortBy(field);
      setSortOrder(1);
    }
    setCurrentPage(1);
    setPageInput('1');
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <HiOutlineSwitchVertical />;
    return sortOrder === 1 ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />;
  };

  // Calculate display range
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="dl">
      <PageHeader
        icon={<HiOutlineOfficeBuilding />}
        title="Districts"
        description={`${totalItems} Districts across India`}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={fetchDistricts} disabled={loading}>
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/districts/new')}>
              <HiOutlinePlus />
              <span>Add District</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="dl-alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter Bar - Fixed */}
      <div className="dl-bar">
        <div className="dl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search districts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="dl-filters">
          <HiOutlineFilter className="dl-filter-icon" />
          <select value={selectedStateId} onChange={(e) => handleStateChange(e.target.value)}>
            <option value="all">All States</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
          <div className="dl-toggle">
            <button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')}><HiOutlineViewGrid /></button>
            <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')}><HiOutlineViewList /></button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="dl-content">
        {loading ? (
          <div className="dl-loading">
            <div className="dl-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : districts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="dl-grid">
              {districts.map((district) => (
                <div
                  key={district.id}
                  className="dl-card"
                >
                  <button className="dl-card__view-icon" onClick={() => navigate(`/geography/districts/${district.id}`)} title="View Details">
                    <HiOutlineArrowRight />
                  </button>
                  <div className="dl-card__head">
                    <div className="dl-card__badges">
                      <span className="dl-card__code">{district.code}</span>
                      <span className="dl-card__state">{district.state_name}</span>
                    </div>
                    <h4 className="dl-card__name">{district.name}</h4>
                    {/* {district.name_hindi && <span className="dl-card__hindi">{district.name_hindi}</span>} */}
                  </div>
                  <div className="dl-card__row">
                    <span className="dl-card__label"><HiOutlineLocationMarker /> State</span>
                    <span className="dl-card__value">{district?.state?.name || '—'}</span>
                  </div>
                  <div className="dl-card__row">
                    <span className="dl-card__label"><HiOutlineLocationMarker /> Headquarters</span>
                    <span className="dl-card__value">{district.headquarters || '—'}</span>
                  </div>
                  <div className="dl-card__nums">
                    <div className="dl-card__num">
                      <strong>{district.total_taluks || 0}</strong>
                      <span>Taluks</span>
                    </div>
                    <div className="dl-card__num">
                      <strong>{formatNumber(district.total_gram_panchayats || 0)}</strong>
                      <span>GPs</span>
                    </div>
                    <div className="dl-card__num">
                      <strong>{district.population ? formatNumber(district.population) : '—'}</strong>
                      <span>Population</span>
                    </div>
                  </div>
                  <div className="dl-card__foot">
                    <div className="dl-card__btns">
                      <button className="nav-btn" onClick={() => navigate(`/geography/taluks?district_id=${district.id}`)} title="View Taluks">
                        <HiOutlineLocationMarker />
                        <span className="btn-text">Taluks</span>
                      </button>
                      <button className="edit-btn" onClick={() => navigate(`/geography/districts/${district.id}/edit`)} title="Edit">
                        <HiOutlinePencil />
                        <span className="btn-text">Edit</span>
                      </button>
                      <button className="del" onClick={(e) => handleDeleteClick(e, district)} disabled={deleteLoading === district.id} title="Delete">
                        <HiOutlineTrash />
                        <span className="btn-text">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dl-table-wrap">
              <table className="dl-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      <span>District</span>
                      {getSortIcon('name')}
                    </th>
                    <th>State</th>
                    <th className="sortable" onClick={() => handleSort('headquarters')}>
                      <span>Headquarters</span>
                      {getSortIcon('headquarters')}
                    </th>
                    <th className="sortable num" onClick={() => handleSort('total_taluks')}>
                      <span>Taluks</span>
                      {getSortIcon('total_taluks')}
                    </th>
                    <th className="num">GPs</th>
                    <th className="num">Villages</th>
                    <th className="sortable num" onClick={() => handleSort('population')}>
                      <span>Population</span>
                      {getSortIcon('population')}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((district, index) => (
                    <tr key={district.id} className={index % 2 === 1 ? 'row-alt' : ''}>
                      <td>
                        <div className="dl-table__main">
                          <div className="dl-table__badges">
                            <span className="dl-table__code">{district.code}</span>
                          </div>
                          <div className="dl-table__txt">
                            <strong>{district.name}</strong>
                            {district.name_hindi && <small>{district.name_hindi}</small>}
                          </div>
                        </div>
                      </td>
                      <td><span className="dl-table__state"><HiOutlineOfficeBuilding /> {district.state_name}</span></td>
                      <td><span className="dl-table__hq"><HiOutlineLocationMarker /> {district.headquarters || '—'}</span></td>
                      <td className="num">{district.total_taluks || 0}</td>
                      <td className="num">{formatNumber(district.total_gram_panchayats || 0)}</td>
                      <td className="num">{formatNumber(district.total_villages || 0)}</td>
                      <td className="num">{district.population ? formatNumber(district.population) : '—'}</td>
                      <td>
                        <div className="dl-table__acts">
                          <button className="view-btn" onClick={() => navigate(`/geography/districts/${district.id}`)} title="View Details"><HiOutlineEye /></button>
                          <button className="nav-btn" onClick={() => navigate(`/geography/taluks?district_id=${district.id}`)} title="View Taluks"><HiOutlineLocationMarker /></button>
                          <button className="edit-btn" onClick={() => navigate(`/geography/districts/${district.id}/edit`)} title="Edit"><HiOutlinePencil /></button>
                          <button className="del" onClick={(e) => handleDeleteClick(e, district)} disabled={deleteLoading === district.id} title="Delete"><HiOutlineTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="dl-empty">
            <HiOutlineOfficeBuilding />
            <h4>No districts found</h4>
            <p>{searchQuery || selectedStateId !== 'all' ? 'Try adjusting your filters' : 'Add your first district'}</p>
            {!searchQuery && selectedStateId === 'all' && (
              <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => navigate('/geography/districts/new')}>
                <HiOutlinePlus /> Add District
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Bar - Fixed */}
      {!loading && districts.length > 0 && (
        <div className="dl-footer">
          <div className="dl-footer__info">
            <span>Showing {startIndex + 1}-{endIndex} of {totalItems}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="dl-footer__perpage"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={36}>36 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="dl-pagination">
            <button
              className="dl-pagination__btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <HiOutlineChevronDoubleLeft />
            </button>
            <button
              className="dl-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous"
            >
              <HiOutlineChevronLeft />
            </button>
            <div className="dl-pagination__input">
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
              className="dl-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Next"
            >
              <HiOutlineChevronRight />
            </button>
            <button
              className="dl-pagination__btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              title="Last Page"
            >
              <HiOutlineChevronDoubleRight />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete District"
        message="Are you sure you want to delete this district?"
        itemName={districtToDelete?.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading === districtToDelete?.id}
      />
    </div>
  );
};

export default DistrictList;
