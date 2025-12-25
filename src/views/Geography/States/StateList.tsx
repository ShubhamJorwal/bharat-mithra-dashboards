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
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineExclamationCircle,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineSwitchVertical
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { State } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './StateList.scss';

const StateList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Filter state - synced with URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedZone, setSelectedZone] = useState<string>(searchParams.get('zone') || 'all');
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'all');

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
  const [sortOrder, setSortOrder] = useState<number>(Number(searchParams.get('sort_order')) || 1); // 1 = ASC, 0 = DESC

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

  // Fetch states from API
  const fetchStates = useCallback(async () => {
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
      if (selectedZone !== 'all') params.zone = selectedZone;
      if (selectedType !== 'all') params.state_type = selectedType;

      const response = await geographyApi.getStates(params);

      if (response.success && response.data) {
        setStates(response.data);
        setTotalItems(response.meta?.total || response.data.length);
        setTotalPages(response.meta?.total_pages || Math.ceil((response.meta?.total || response.data.length) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to load states');
        setStates([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to fetch states:', err);
      setError('Unable to connect to the server. Please try again.');
      setStates([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedZone, selectedType, sortBy, sortOrder]);

  // Fetch on filter/pagination change
  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedZone !== 'all') params.set('zone', selectedZone);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (itemsPerPage !== 12) params.set('per_page', String(itemsPerPage));
    if (sortBy !== 'name') params.set('sort_by', sortBy);
    if (sortOrder !== 1) params.set('sort_order', String(sortOrder));

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedZone, selectedType, currentPage, itemsPerPage, sortBy, sortOrder, setSearchParams]);

  // Reset to page 1 when filters change
  const handleFilterChange = (type: 'zone' | 'type', value: string) => {
    if (type === 'zone') {
      setSelectedZone(value);
    } else {
      setSelectedType(value);
    }
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDelete = async (e: React.MouseEvent, state: State) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${state.name}"?`)) return;

    setDeleteLoading(state.id);
    try {
      await geographyApi.deleteState(state.id);
      // Refresh the list after delete
      fetchStates();
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete state. Please try again.');
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
      // Toggle order if same field
      setSortOrder(sortOrder === 1 ? 0 : 1);
    } else {
      // New field, default to ascending
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

  const statesCount = states.filter(s => s.state_type === 'state').length;
  const utsCount = states.filter(s => s.state_type === 'union_territory').length;

  // Calculate display range
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="sl">
      <PageHeader
        icon={<HiOutlineMap />}
        title="States & Union Territories"
        description={`${statesCount} States, ${utsCount} Union Territories`}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={fetchStates} disabled={loading}>
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/states/new')}>
              <HiOutlinePlus />
              <span>Add State/UT</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="sl-alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter Bar - Fixed */}
      <div className="sl-bar">
        <div className="sl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search states..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="sl-filters">
          <HiOutlineFilter className="sl-filter-icon" />
          <select value={selectedType} onChange={(e) => handleFilterChange('type', e.target.value)}>
            <option value="all">All Types</option>
            <option value="state">States</option>
            <option value="union_territory">UTs</option>
          </select>
          <select value={selectedZone} onChange={(e) => handleFilterChange('zone', e.target.value)}>
            <option value="all">All Zones</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="central">Central</option>
            <option value="northeast">Northeast</option>
          </select>
          <div className="sl-toggle">
            <button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')}><HiOutlineViewGrid /></button>
            <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')}><HiOutlineViewList /></button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="sl-content">
        {loading ? (
          <div className="sl-loading">
            <div className="sl-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : states.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="sl-grid">
              {states.map((state) => (
                <div
                  key={state.id}
                  className={`sl-card ${state.state_type === 'state' ? 'sl-card--state' : 'sl-card--ut'}`}
                  onClick={() => navigate(`/geography/states/${state.id}`)}
                >
                  <div className="sl-card__head">
                    <div className="sl-card__info">
                      <span className="sl-card__code">{state.code}</span>
                      <h4 className="sl-card__name">{state.name}</h4>
                    </div>
                    <span className="sl-card__tag">
                      {state.state_type === 'state' ? 'State' : 'UT'}
                    </span>
                  </div>
                  <div className="sl-card__row">
                    <span className="sl-card__label">Capital</span>
                    <span className="sl-card__value">{state.capital || '—'}</span>
                  </div>
                  <div className="sl-card__row">
                    <span className="sl-card__label">Zone</span>
                    <span className="sl-card__value capitalize">{state.zone}</span>
                  </div>
                  <div className="sl-card__nums">
                    <div className="sl-card__num">
                      <strong>{state.total_districts || 0}</strong>
                      <span>Districts</span>
                    </div>
                    <div className="sl-card__num">
                      <strong>{formatNumber(state.total_taluks || 0)}</strong>
                      <span>Taluks</span>
                    </div>
                    <div className="sl-card__num">
                      <strong>{state.population ? formatNumber(state.population) : '—'}</strong>
                      <span>Population</span>
                    </div>
                  </div>
                  <div className="sl-card__foot">
                    <div className="sl-card__btns">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/geography/districts?state_id=${state.id}`); }} title="Districts">
                        <HiOutlineOfficeBuilding />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/geography/states/${state.id}/edit`); }} title="Edit">
                        <HiOutlinePencil />
                      </button>
                      <button className="del" onClick={(e) => handleDelete(e, state)} disabled={deleteLoading === state.id} title="Delete">
                        <HiOutlineTrash />
                      </button>
                    </div>
                    <span className="sl-card__go"><HiOutlineChevronRight /></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sl-table-wrap">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      <span>Name</span>
                      {getSortIcon('name')}
                    </th>
                    <th className="sortable" onClick={() => handleSort('capital')}>
                      <span>Capital</span>
                      {getSortIcon('capital')}
                    </th>
                    <th>Zone</th>
                    <th className="sortable num" onClick={() => handleSort('total_districts')}>
                      <span>Districts</span>
                      {getSortIcon('total_districts')}
                    </th>
                    <th className="sortable num" onClick={() => handleSort('total_taluks')}>
                      <span>Taluks</span>
                      {getSortIcon('total_taluks')}
                    </th>
                    <th className="sortable num" onClick={() => handleSort('population')}>
                      <span>Population</span>
                      {getSortIcon('population')}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((state) => (
                    <tr key={state.id} onClick={() => navigate(`/geography/states/${state.id}`)}>
                      <td>
                        <div className="sl-table__main">
                          <span className={`sl-table__tag ${state.state_type === 'state' ? 'st' : 'ut'}`}>
                            {state.code}
                          </span>
                          <div className="sl-table__txt">
                            <strong>{state.name}</strong>
                            <small>{state.state_type === 'state' ? 'State' : 'Union Territory'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{state.capital || '—'}</td>
                      <td><span className="sl-table__zone capitalize">{state.zone}</span></td>
                      <td className="num">{state.total_districts || 0}</td>
                      <td className="num">{formatNumber(state.total_taluks || 0)}</td>
                      <td className="num">{state.population ? formatNumber(state.population) : '—'}</td>
                      <td>
                        <div className="sl-table__acts" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/geography/states/${state.id}`)}><HiOutlineEye /></button>
                          <button onClick={() => navigate(`/geography/districts?state_id=${state.id}`)}><HiOutlineOfficeBuilding /></button>
                          <button onClick={() => navigate(`/geography/states/${state.id}/edit`)}><HiOutlinePencil /></button>
                          <button className="del" onClick={() => handleDelete({ stopPropagation: () => {} } as React.MouseEvent, state)} disabled={deleteLoading === state.id}><HiOutlineTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="sl-empty">
            <HiOutlineMap />
            <h4>No states found</h4>
            <p>{searchQuery || selectedZone !== 'all' || selectedType !== 'all' ? 'Try adjusting your filters' : 'Add your first state'}</p>
            {!searchQuery && selectedZone === 'all' && selectedType === 'all' && (
              <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => navigate('/geography/states/new')}>
                <HiOutlinePlus /> Add State/UT
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Bar - Fixed */}
      {!loading && states.length > 0 && (
        <div className="sl-footer">
          <div className="sl-footer__info">
            <span>Showing {startIndex + 1}-{endIndex} of {totalItems}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="sl-footer__perpage"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={36}>36 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="sl-pagination">
            <button
              className="sl-pagination__btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <HiOutlineChevronDoubleLeft />
            </button>
            <button
              className="sl-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous"
            >
              <HiOutlineChevronLeft />
            </button>
            <div className="sl-pagination__input">
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
              className="sl-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Next"
            >
              <HiOutlineChevronRight />
            </button>
            <button
              className="sl-pagination__btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              title="Last Page"
            >
              <HiOutlineChevronDoubleRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateList;
