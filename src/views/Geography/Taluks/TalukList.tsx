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
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineMap,
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
  HiOutlineArrowRight
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { Taluk, State, District } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './TalukList.scss';

const TalukList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Filter state - synced with URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedStateId, setSelectedStateId] = useState<string>(searchParams.get('state_id') || 'all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(searchParams.get('district_id') || 'all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('per_page')) || 12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState(String(currentPage));

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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

  // Fetch districts when state changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedStateId === 'all') {
        setDistricts([]);
        return;
      }
      try {
        const response = await geographyApi.getDistricts({ state_id: selectedStateId, per_page: 100 });
        if (response.success && response.data) {
          setDistricts(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      }
    };
    fetchDistricts();
  }, [selectedStateId]);

  // Fetch taluks from API
  const fetchTaluks = useCallback(async () => {
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
      if (selectedDistrictId !== 'all') params.district_id = selectedDistrictId;

      const response = await geographyApi.getTaluks(params);

      if (response.success && response.data) {
        setTaluks(response.data);
        setTotalItems(response.meta?.total || response.data.length);
        setTotalPages(response.meta?.total_pages || Math.ceil((response.meta?.total || response.data.length) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to load taluks');
        setTaluks([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to fetch taluks:', err);
      setError('Unable to connect to the server. Please try again.');
      setTaluks([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedStateId, selectedDistrictId, sortBy, sortOrder]);

  // Fetch on filter/pagination change
  useEffect(() => {
    fetchTaluks();
  }, [fetchTaluks]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStateId !== 'all') params.set('state_id', selectedStateId);
    if (selectedDistrictId !== 'all') params.set('district_id', selectedDistrictId);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (itemsPerPage !== 12) params.set('per_page', String(itemsPerPage));
    if (sortBy !== 'name') params.set('sort_by', sortBy);
    if (sortOrder !== 1) params.set('sort_order', String(sortOrder));

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedStateId, selectedDistrictId, currentPage, itemsPerPage, sortBy, sortOrder, setSearchParams]);

  // Reset filters
  const handleStateChange = (value: string) => {
    setSelectedStateId(value);
    setSelectedDistrictId('all');
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictId(value);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDelete = async (e: React.MouseEvent, taluk: Taluk) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${taluk.name}"?`)) return;

    setDeleteLoading(taluk.id);
    try {
      await geographyApi.deleteTaluk(taluk.id);
      fetchTaluks();
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete taluk. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setCurrentPage(1);
      setPageInput('1');
    }
  };

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

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <HiOutlineSwitchVertical />;
    return sortOrder === 1 ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="tl">
      <PageHeader
        icon={<HiOutlineLocationMarker />}
        title="Taluks / Tehsils"
        description={`${totalItems} Taluks across India`}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={fetchTaluks} disabled={loading}>
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/taluks/new')}>
              <HiOutlinePlus />
              <span>Add Taluk</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="tl-alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="tl-bar">
        <div className="tl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search taluks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="tl-filters">
          <HiOutlineFilter className="tl-filter-icon" />
          <select value={selectedStateId} onChange={(e) => handleStateChange(e.target.value)}>
            <option value="all">All States</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
          {selectedStateId !== 'all' && (
            <select value={selectedDistrictId} onChange={(e) => handleDistrictChange(e.target.value)}>
              <option value="all">All Districts</option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
          )}
          <div className="tl-toggle">
            <button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')}><HiOutlineViewGrid /></button>
            <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')}><HiOutlineViewList /></button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="tl-content">
        {loading ? (
          <div className="tl-loading">
            <div className="tl-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : taluks.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="tl-grid">
              {taluks.map((taluk) => (
                <div
                  key={taluk.id}
                  className="tl-card"
                >
                  <button className="tl-card__view-icon" onClick={() => navigate(`/geography/taluks/${taluk.id}`)} title="View Details">
                    <HiOutlineArrowRight />
                  </button>
                  <div className="tl-card__head">
                    <div className="tl-card__badges">
                      <span className="tl-card__code">{taluk.code}</span>
                      <span className="tl-card__district">{taluk.district_name}</span>
                    </div>
                    <h4 className="tl-card__name">{taluk.name}</h4>
                    {taluk.name_hindi && <span className="tl-card__hindi">{taluk.name_hindi}</span>}
                  </div>
                  <div className="tl-card__location">
                    <span className="state"><HiOutlineMap /> {taluk.state_name}</span>
                  </div>
                  <div className="tl-card__row">
                    <span className="tl-card__label"><HiOutlineLocationMarker /> Headquarters</span>
                    <span className="tl-card__value">{taluk.headquarters || '—'}</span>
                  </div>
                  <div className="tl-card__nums">
                    <div className="tl-card__num">
                      <HiOutlineUserGroup />
                      <strong>{formatNumber(taluk.total_gram_panchayats || 0)}</strong>
                      <span>GPs</span>
                    </div>
                    <div className="tl-card__num">
                      <HiOutlineHome />
                      <strong>{formatNumber(taluk.total_villages || 0)}</strong>
                      <span>Villages</span>
                    </div>
                  </div>
                  <div className="tl-card__foot">
                    <div className="tl-card__btns">
                      <button className="view-btn" onClick={() => navigate(`/geography/taluks/${taluk.id}`)} title="View Details">
                        <HiOutlineEye />
                        <span className="btn-text">View</span>
                      </button>
                      <button className="view-btn" onClick={() => navigate(`/geography/gram-panchayats?taluk_id=${taluk.id}`)} title="View Gram Panchayats">
                        <HiOutlineUserGroup />
                        <span className="btn-text">GPs</span>
                      </button>
                      <button className="edit-btn" onClick={() => navigate(`/geography/taluks/${taluk.id}/edit`)} title="Edit">
                        <HiOutlinePencil />
                        <span className="btn-text">Edit</span>
                      </button>
                      <button className="del" onClick={(e) => handleDelete(e, taluk)} disabled={deleteLoading === taluk.id} title="Delete">
                        <HiOutlineTrash />
                        <span className="btn-text">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tl-table-wrap">
              <table className="tl-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      <span>Taluk</span>
                      {getSortIcon('name')}
                    </th>
                    <th>District</th>
                    <th>State</th>
                    <th className="sortable" onClick={() => handleSort('headquarters')}>
                      <span>Headquarters</span>
                      {getSortIcon('headquarters')}
                    </th>
                    <th className="sortable num" onClick={() => handleSort('total_gram_panchayats')}>
                      <span>GPs</span>
                      {getSortIcon('total_gram_panchayats')}
                    </th>
                    <th className="sortable num" onClick={() => handleSort('total_villages')}>
                      <span>Villages</span>
                      {getSortIcon('total_villages')}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {taluks.map((taluk, index) => (
                    <tr key={taluk.id} className={index % 2 === 1 ? 'row-alt' : ''}>
                      <td>
                        <div className="tl-table__main">
                          <div className="tl-table__badges">
                            <span className="tl-table__code">{taluk.code}</span>
                          </div>
                          <div className="tl-table__txt">
                            <strong>{taluk.name}</strong>
                            {taluk.name_hindi && <small>{taluk.name_hindi}</small>}
                          </div>
                        </div>
                      </td>
                      <td><span className="tl-table__district"><HiOutlineOfficeBuilding /> {taluk.district_name}</span></td>
                      <td><span className="tl-table__state"><HiOutlineMap /> {taluk.state_name}</span></td>
                      <td><span className="tl-table__hq"><HiOutlineLocationMarker /> {taluk.headquarters || '—'}</span></td>
                      <td className="num">{formatNumber(taluk.total_gram_panchayats || 0)}</td>
                      <td className="num">{formatNumber(taluk.total_villages || 0)}</td>
                      <td>
                        <div className="tl-table__acts">
                          <button className="view-btn" onClick={() => navigate(`/geography/taluks/${taluk.id}`)} title="View Details"><HiOutlineEye /></button>
                          <button className="nav-btn" onClick={() => navigate(`/geography/gram-panchayats?taluk_id=${taluk.id}`)} title="View GPs"><HiOutlineUserGroup /></button>
                          <button className="edit-btn" onClick={() => navigate(`/geography/taluks/${taluk.id}/edit`)} title="Edit"><HiOutlinePencil /></button>
                          <button className="del" onClick={(e) => handleDelete(e, taluk)} disabled={deleteLoading === taluk.id} title="Delete"><HiOutlineTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="tl-empty">
            <HiOutlineLocationMarker />
            <h4>No taluks found</h4>
            <p>{searchQuery || selectedStateId !== 'all' ? 'Try adjusting your filters' : 'Add your first taluk'}</p>
            {!searchQuery && selectedStateId === 'all' && (
              <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => navigate('/geography/taluks/new')}>
                <HiOutlinePlus /> Add Taluk
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && taluks.length > 0 && (
        <div className="tl-footer">
          <div className="tl-footer__info">
            <span>Showing {startIndex + 1}-{endIndex} of {totalItems}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="tl-footer__perpage"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={36}>36 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="tl-pagination">
            <button className="tl-pagination__btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><HiOutlineChevronDoubleLeft /></button>
            <button className="tl-pagination__btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><HiOutlineChevronLeft /></button>
            <div className="tl-pagination__input">
              <input type="text" value={pageInput} onChange={handlePageInputChange} onKeyDown={handlePageInputSubmit} onBlur={handlePageInputBlur} />
              <span>of {totalPages || 1}</span>
            </div>
            <button className="tl-pagination__btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}><HiOutlineChevronRight /></button>
            <button className="tl-pagination__btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage >= totalPages}><HiOutlineChevronDoubleRight /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalukList;
