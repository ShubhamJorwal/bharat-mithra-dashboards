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
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlineUser,
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
import type { GramPanchayat, State, District, Taluk } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './GramPanchayatList.scss';

const GramPanchayatList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Filter state - synced with URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedStateId, setSelectedStateId] = useState<string>(searchParams.get('state_id') || 'all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(searchParams.get('district_id') || 'all');
  const [selectedTalukId, setSelectedTalukId] = useState<string>(searchParams.get('taluk_id') || 'all');

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

  // Fetch taluks when district changes
  useEffect(() => {
    const fetchTaluks = async () => {
      if (selectedDistrictId === 'all') {
        setTaluks([]);
        return;
      }
      try {
        const response = await geographyApi.getTaluks({ district_id: selectedDistrictId, per_page: 100 });
        if (response.success && response.data) {
          setTaluks(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch taluks:', err);
      }
    };
    fetchTaluks();
  }, [selectedDistrictId]);

  // Fetch gram panchayats from API
  const fetchGramPanchayats = useCallback(async () => {
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
      if (selectedTalukId !== 'all') params.taluk_id = selectedTalukId;

      const response = await geographyApi.getGramPanchayats(params);

      if (response.success && response.data) {
        setGramPanchayats(response.data);
        setTotalItems(response.meta?.total || response.data.length);
        setTotalPages(response.meta?.total_pages || Math.ceil((response.meta?.total || response.data.length) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to load gram panchayats');
        setGramPanchayats([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to fetch gram panchayats:', err);
      setError('Unable to connect to the server. Please try again.');
      setGramPanchayats([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedStateId, selectedDistrictId, selectedTalukId, sortBy, sortOrder]);

  // Fetch on filter/pagination change
  useEffect(() => {
    fetchGramPanchayats();
  }, [fetchGramPanchayats]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStateId !== 'all') params.set('state_id', selectedStateId);
    if (selectedDistrictId !== 'all') params.set('district_id', selectedDistrictId);
    if (selectedTalukId !== 'all') params.set('taluk_id', selectedTalukId);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (itemsPerPage !== 12) params.set('per_page', String(itemsPerPage));
    if (sortBy !== 'name') params.set('sort_by', sortBy);
    if (sortOrder !== 1) params.set('sort_order', String(sortOrder));

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedStateId, selectedDistrictId, selectedTalukId, currentPage, itemsPerPage, sortBy, sortOrder, setSearchParams]);

  // Reset filters
  const handleStateChange = (value: string) => {
    setSelectedStateId(value);
    setSelectedDistrictId('all');
    setSelectedTalukId('all');
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictId(value);
    setSelectedTalukId('all');
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleTalukChange = (value: string) => {
    setSelectedTalukId(value);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDelete = async (e: React.MouseEvent, gp: GramPanchayat) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${gp.name}"?`)) return;

    setDeleteLoading(gp.id);
    try {
      await geographyApi.deleteGramPanchayat(gp.id);
      fetchGramPanchayats();
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete gram panchayat. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatNumber = (num?: number): string => {
    if (!num) return '—';
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
    <div className="gpl">
      <PageHeader
        icon={<HiOutlineUserGroup />}
        title="Gram Panchayats"
        description={`${totalItems} Gram Panchayats across India`}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={fetchGramPanchayats} disabled={loading}>
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/gram-panchayats/new')}>
              <HiOutlinePlus />
              <span>Add GP</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="gpl-alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="gpl-bar">
        <div className="gpl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search gram panchayats..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="gpl-filters">
          <HiOutlineFilter className="gpl-filter-icon" />
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
          {selectedDistrictId !== 'all' && (
            <select value={selectedTalukId} onChange={(e) => handleTalukChange(e.target.value)}>
              <option value="all">All Taluks</option>
              {taluks.map(taluk => (
                <option key={taluk.id} value={taluk.id}>{taluk.name}</option>
              ))}
            </select>
          )}
          <div className="gpl-toggle">
            <button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')}><HiOutlineViewGrid /></button>
            <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')}><HiOutlineViewList /></button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="gpl-content">
        {loading ? (
          <div className="gpl-loading">
            <div className="gpl-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : gramPanchayats.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="gpl-grid">
              {gramPanchayats.map((gp) => (
                <div
                  key={gp.id}
                  className="gpl-card"
                  onClick={() => navigate(`/geography/gram-panchayats/${gp.id}`)}
                >
                  <div className="gpl-card__head">
                    <span className="gpl-card__code">{gp.code}</span>
                    <h4 className="gpl-card__name">{gp.name}</h4>
                    {gp.name_hindi && <span className="gpl-card__hindi">{gp.name_hindi}</span>}
                  </div>
                  <div className="gpl-card__location">
                    <span>{gp.taluk_name}</span>
                    <span className="sep">•</span>
                    <span>{gp.district_name}</span>
                    <span className="sep">•</span>
                    <span className="state">{gp.state_name}</span>
                  </div>
                  {gp.sarpanch_name && (
                    <div className="gpl-card__sarpanch">
                      <HiOutlineUser />
                      <span>{gp.sarpanch_name}</span>
                      {gp.sarpanch_mobile && (
                        <>
                          <HiOutlinePhone />
                          <span>{gp.sarpanch_mobile}</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="gpl-card__nums">
                    <div className="gpl-card__num">
                      <HiOutlineHome />
                      <strong>{gp.total_villages || 0}</strong>
                      <span>Villages</span>
                    </div>
                    <div className="gpl-card__num">
                      <strong>{formatNumber(gp.population)}</strong>
                      <span>Population</span>
                    </div>
                    <div className="gpl-card__num">
                      <strong>{formatNumber(gp.households)}</strong>
                      <span>Households</span>
                    </div>
                  </div>
                  <div className="gpl-card__foot">
                    {gp.pin_code && <span className="gpl-card__pin">PIN: {gp.pin_code}</span>}
                    <div className="gpl-card__btns">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/geography/villages?gram_panchayat_id=${gp.id}`); }} title="Villages">
                        <HiOutlineHome />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/geography/gram-panchayats/${gp.id}/edit`); }} title="Edit">
                        <HiOutlinePencil />
                      </button>
                      <button className="del" onClick={(e) => handleDelete(e, gp)} disabled={deleteLoading === gp.id} title="Delete">
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gpl-table-wrap">
              <table className="gpl-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      <span>Gram Panchayat</span>
                      {getSortIcon('name')}
                    </th>
                    <th>Taluk</th>
                    <th>District</th>
                    <th>Sarpanch</th>
                    <th className="sortable num" onClick={() => handleSort('total_villages')}>
                      <span>Villages</span>
                      {getSortIcon('total_villages')}
                    </th>
                    <th className="sortable num" onClick={() => handleSort('population')}>
                      <span>Population</span>
                      {getSortIcon('population')}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gramPanchayats.map((gp) => (
                    <tr key={gp.id} onClick={() => navigate(`/geography/gram-panchayats/${gp.id}`)}>
                      <td>
                        <div className="gpl-table__main">
                          <span className="gpl-table__code">{gp.code}</span>
                          <div className="gpl-table__txt">
                            <strong>{gp.name}</strong>
                            {gp.name_hindi && <small>{gp.name_hindi}</small>}
                          </div>
                        </div>
                      </td>
                      <td>{gp.taluk_name}</td>
                      <td>{gp.district_name}</td>
                      <td>
                        {gp.sarpanch_name ? (
                          <div className="gpl-table__sarpanch">
                            <HiOutlineUser />
                            <span>{gp.sarpanch_name}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="num">{gp.total_villages || 0}</td>
                      <td className="num">{formatNumber(gp.population)}</td>
                      <td>
                        <div className="gpl-table__acts" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/geography/gram-panchayats/${gp.id}`)}><HiOutlineEye /></button>
                          <button onClick={() => navigate(`/geography/villages?gram_panchayat_id=${gp.id}`)}><HiOutlineHome /></button>
                          <button onClick={() => navigate(`/geography/gram-panchayats/${gp.id}/edit`)}><HiOutlinePencil /></button>
                          <button className="del" onClick={(e) => handleDelete(e, gp)} disabled={deleteLoading === gp.id}><HiOutlineTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="gpl-empty">
            <HiOutlineUserGroup />
            <h4>No gram panchayats found</h4>
            <p>{searchQuery || selectedStateId !== 'all' ? 'Try adjusting your filters' : 'Add your first gram panchayat'}</p>
            {!searchQuery && selectedStateId === 'all' && (
              <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => navigate('/geography/gram-panchayats/new')}>
                <HiOutlinePlus /> Add Gram Panchayat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && gramPanchayats.length > 0 && (
        <div className="gpl-footer">
          <div className="gpl-footer__info">
            <span>Showing {startIndex + 1}-{endIndex} of {totalItems}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="gpl-footer__perpage"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={36}>36 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="gpl-pagination">
            <button className="gpl-pagination__btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><HiOutlineChevronDoubleLeft /></button>
            <button className="gpl-pagination__btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><HiOutlineChevronLeft /></button>
            <div className="gpl-pagination__input">
              <input type="text" value={pageInput} onChange={handlePageInputChange} onKeyDown={handlePageInputSubmit} onBlur={handlePageInputBlur} />
              <span>of {totalPages || 1}</span>
            </div>
            <button className="gpl-pagination__btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}><HiOutlineChevronRight /></button>
            <button className="gpl-pagination__btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage >= totalPages}><HiOutlineChevronDoubleRight /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GramPanchayatList;
