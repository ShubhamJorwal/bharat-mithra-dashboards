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
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
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
  HiOutlineSwitchVertical,
  HiOutlineArrowRight
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { Village, State, District, Taluk, GramPanchayat } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import ConfirmModal from '../../../components/common/ConfirmModal';
import './VillageList.scss';

const VillageList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [villages, setVillages] = useState<Village[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState<Village | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedStateId, setSelectedStateId] = useState<string>(searchParams.get('state_id') || 'all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(searchParams.get('district_id') || 'all');
  const [selectedTalukId, setSelectedTalukId] = useState<string>(searchParams.get('taluk_id') || 'all');
  const [selectedGPId, setSelectedGPId] = useState<string>(searchParams.get('gram_panchayat_id') || 'all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('per_page')) || 24);
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

  // Fetch states
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

  // Fetch gram panchayats when taluk changes
  useEffect(() => {
    const fetchGPs = async () => {
      if (selectedTalukId === 'all') {
        setGramPanchayats([]);
        return;
      }
      try {
        const response = await geographyApi.getGramPanchayats({ taluk_id: selectedTalukId, per_page: 100 });
        if (response.success && response.data) {
          setGramPanchayats(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch gram panchayats:', err);
      }
    };
    fetchGPs();
  }, [selectedTalukId]);

  // Fetch villages from API
  const fetchVillages = useCallback(async () => {
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
      if (selectedGPId !== 'all') params.gram_panchayat_id = selectedGPId;

      const response = await geographyApi.getVillages(params);

      if (response.success && response.data) {
        setVillages(response.data);
        setTotalItems(response.meta?.total || response.data.length);
        setTotalPages(response.meta?.total_pages || Math.ceil((response.meta?.total || response.data.length) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to load villages');
        setVillages([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Failed to fetch villages:', err);
      setError('Unable to connect to the server. Please try again.');
      setVillages([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedStateId, selectedDistrictId, selectedTalukId, selectedGPId, sortBy, sortOrder]);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStateId !== 'all') params.set('state_id', selectedStateId);
    if (selectedDistrictId !== 'all') params.set('district_id', selectedDistrictId);
    if (selectedTalukId !== 'all') params.set('taluk_id', selectedTalukId);
    if (selectedGPId !== 'all') params.set('gram_panchayat_id', selectedGPId);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (itemsPerPage !== 24) params.set('per_page', String(itemsPerPage));
    if (sortBy !== 'name') params.set('sort_by', sortBy);
    if (sortOrder !== 1) params.set('sort_order', String(sortOrder));

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedStateId, selectedDistrictId, selectedTalukId, selectedGPId, currentPage, itemsPerPage, sortBy, sortOrder, setSearchParams]);

  // Filter change handlers
  const handleStateChange = (value: string) => {
    setSelectedStateId(value);
    setSelectedDistrictId('all');
    setSelectedTalukId('all');
    setSelectedGPId('all');
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictId(value);
    setSelectedTalukId('all');
    setSelectedGPId('all');
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleTalukChange = (value: string) => {
    setSelectedTalukId(value);
    setSelectedGPId('all');
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleGPChange = (value: string) => {
    setSelectedGPId(value);
    setCurrentPage(1);
    setPageInput('1');
  };

  const handleDeleteClick = (e: React.MouseEvent, village: Village) => {
    e.stopPropagation();
    setVillageToDelete(village);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!villageToDelete) return;

    setDeleteLoading(villageToDelete.id);
    try {
      await geographyApi.deleteVillage(villageToDelete.id);
      setDeleteModalOpen(false);
      setVillageToDelete(null);
      fetchVillages();
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete village. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setVillageToDelete(null);
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
    <div className="vl">
      <PageHeader
        icon={<HiOutlineHome />}
        title="Villages"
        description={`${totalItems} Villages across India`}
        actions={
          <>
            <button className="bm-btn bm-btn-secondary" onClick={fetchVillages} disabled={loading}>
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/villages/new')}>
              <HiOutlinePlus />
              <span>Add Village</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="vl-alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="vl-bar">
        <div className="vl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search villages..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="vl-filters">
          <HiOutlineFilter className="vl-filter-icon" />
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
          {selectedTalukId !== 'all' && (
            <select value={selectedGPId} onChange={(e) => handleGPChange(e.target.value)}>
              <option value="all">All GPs</option>
              {gramPanchayats.map(gp => (
                <option key={gp.id} value={gp.id}>{gp.name}</option>
              ))}
            </select>
          )}
          <div className="vl-toggle">
            <button className={viewMode === 'grid' ? 'on' : ''} onClick={() => setViewMode('grid')}><HiOutlineViewGrid /></button>
            <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')}><HiOutlineViewList /></button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="vl-content">
        {loading ? (
          <div className="vl-loading">
            <div className="vl-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : villages.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="vl-grid">
              {villages.map((village) => (
                <div
                  key={village.id}
                  className="vl-card"
                >
                  <button className="vl-card__view-icon" onClick={() => navigate(`/geography/villages/${village.id}`)} title="View Details">
                    <HiOutlineArrowRight />
                  </button>
                  <div className="vl-card__head">
                    <div className="vl-card__badges">
                      <span className="vl-card__code">{village.code}</span>
                      <span className="vl-card__gp">{village.gram_panchayat_name}</span>
                    </div>
                    <h4 className="vl-card__name">{village.name}</h4>
                    {village.name_hindi && <span className="vl-card__hindi">{village.name_hindi}</span>}
                  </div>
                  
                  <div className="tl-card__row">
                    <span className="tl-card__label"><HiOutlineLocationMarker /> Gram Panchayat</span>
                    <span className="tl-card__value">{village?.gram_panchayat?.name || '—'}</span>
                  </div>
                  <div className="tl-card__row">
                    <span className="tl-card__label"><HiOutlineLocationMarker /> Taluk</span>
                    <span className="tl-card__value">{village?.taluk?.name || '—'}</span>
                  </div>
                  <div className="tl-card__row">
                    <span className="tl-card__label"><HiOutlineLocationMarker /> District</span>
                    <span className="tl-card__value">{village?.district?.name || '—'}</span>
                  </div>
                  <div className="tl-card__row">
                    <span className="tl-card__label"><HiOutlineLocationMarker /> State</span>
                    <span className="tl-card__value">{village?.state?.name || '—'}</span>
                  </div>
                  {/* <div className="vl-card__location">
                    <span className="taluk"><HiOutlineLocationMarker /> {village.taluk_name}</span>
                  </div> */}
                  <div className="vl-card__stats">
                    <div className="vl-card__stat">
                      <span>Population</span>
                      <strong>{formatNumber(village.population)}</strong>
                    </div>
                    <div className="vl-card__stat">
                      <span>Households</span>
                      <strong>{formatNumber(village.households)}</strong>
                    </div>
                    {village.pin_code && (
                      <div className="vl-card__stat">
                        <span>PIN</span>
                        <strong>{village.pin_code}</strong>
                      </div>
                    )}
                  </div>
                  <div className="vl-card__foot">
                    <div className="vl-card__btns">
                      <button className="edit-btn" onClick={() => navigate(`/geography/villages/${village.id}/edit`)} title="Edit">
                        <HiOutlinePencil />
                        <span className="btn-text">Edit</span>
                      </button>
                      <button className="del" onClick={(e) => handleDeleteClick(e, village)} disabled={deleteLoading === village.id} title="Delete">
                        <HiOutlineTrash />
                        <span className="btn-text">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="vl-table-wrap">
              <table className="vl-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      <span>Village</span>
                      {getSortIcon('name')}
                    </th>
                    <th>Gram Panchayat</th>
                    <th>Taluk</th>
                    <th>District</th>
                    <th className="sortable num" onClick={() => handleSort('population')}>
                      <span>Population</span>
                      {getSortIcon('population')}
                    </th>
                    <th className="num">Households</th>
                    <th>PIN</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {villages.map((village, index) => (
                    <tr key={village.id} className={index % 2 === 1 ? 'row-alt' : ''}>
                      <td>
                        <div className="vl-table__main">
                          <div className="vl-table__badges">
                            <span className="vl-table__code">{village.code}</span>
                          </div>
                          <div className="vl-table__txt">
                            <strong>{village.name}</strong>
                            {village.name_hindi && <small>{village.name_hindi}</small>}
                          </div>
                        </div>
                      </td>
                      <td><span className="vl-table__gp"><HiOutlineUserGroup /> {village.gram_panchayat_name}</span></td>
                      <td><span className="vl-table__taluk"><HiOutlineLocationMarker /> {village.taluk_name}</span></td>
                      <td><span className="vl-table__district"><HiOutlineOfficeBuilding /> {village.district_name}</span></td>
                      <td className="num">{formatNumber(village.population)}</td>
                      <td className="num">{formatNumber(village.households)}</td>
                      <td><span className="vl-table__pin">{village.pin_code || '—'}</span></td>
                      <td>
                        <div className="vl-table__acts">
                          <button className="view-btn" onClick={() => navigate(`/geography/villages/${village.id}`)} title="View Details"><HiOutlineEye /></button>
                          <button className="edit-btn" onClick={() => navigate(`/geography/villages/${village.id}/edit`)} title="Edit"><HiOutlinePencil /></button>
                          <button className="del" onClick={(e) => handleDeleteClick(e, village)} disabled={deleteLoading === village.id} title="Delete"><HiOutlineTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="vl-empty">
            <HiOutlineHome />
            <h4>No villages found</h4>
            <p>{searchQuery || selectedStateId !== 'all' ? 'Try adjusting your filters' : 'Add your first village'}</p>
            {!searchQuery && selectedStateId === 'all' && (
              <button className="bm-btn bm-btn-primary bm-btn-sm" onClick={() => navigate('/geography/villages/new')}>
                <HiOutlinePlus /> Add Village
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && villages.length > 0 && (
        <div className="vl-footer">
          <div className="vl-footer__info">
            <span>Showing {startIndex + 1}-{endIndex} of {totalItems}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="vl-footer__perpage"
            >
              <option value={24}>24 / page</option>
              <option value={48}>48 / page</option>
              <option value={72}>72 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
          <div className="vl-pagination">
            <button className="vl-pagination__btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><HiOutlineChevronDoubleLeft /></button>
            <button className="vl-pagination__btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><HiOutlineChevronLeft /></button>
            <div className="vl-pagination__input">
              <input type="text" value={pageInput} onChange={handlePageInputChange} onKeyDown={handlePageInputSubmit} onBlur={handlePageInputBlur} />
              <span>of {totalPages || 1}</span>
            </div>
            <button className="vl-pagination__btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}><HiOutlineChevronRight /></button>
            <button className="vl-pagination__btn" onClick={() => handlePageChange(totalPages)} disabled={currentPage >= totalPages}><HiOutlineChevronDoubleRight /></button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Village"
        message="Are you sure you want to delete this village?"
        itemName={villageToDelete?.name}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading === villageToDelete?.id}
      />
    </div>
  );
};

export default VillageList;
