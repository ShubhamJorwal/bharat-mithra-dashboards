import { useState, useEffect } from 'react';
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
  HiOutlinePhone,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { Village, State, District, Taluk, GramPanchayat } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './VillageList.scss';

const VillageList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gpIdFromUrl = searchParams.get('gram_panchayat_id');

  const [villages, setVillages] = useState<Village[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateId, setSelectedStateId] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('all');
  const [selectedTalukId, setSelectedTalukId] = useState<string>('all');
  const [selectedGpId, setSelectedGpId] = useState<string>(gpIdFromUrl || 'all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => { fetchStates(); }, []);

  useEffect(() => {
    if (selectedStateId !== 'all') fetchDistricts();
    else { setDistricts([]); setSelectedDistrictId('all'); }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedDistrictId !== 'all') fetchTaluks();
    else { setTaluks([]); setSelectedTalukId('all'); }
  }, [selectedDistrictId]);

  useEffect(() => {
    if (selectedTalukId !== 'all') fetchGramPanchayats();
    else { setGramPanchayats([]); setSelectedGpId('all'); }
  }, [selectedTalukId]);

  useEffect(() => { fetchVillages(); }, [selectedStateId, selectedDistrictId, selectedTalukId, selectedGpId]);

  const fetchStates = async () => {
    try {
      const response = await geographyApi.getStates({ per_page: 100 });
      if (response.success && response.data) setStates(response.data);
    } catch (err) { console.error('Failed to fetch states:', err); }
  };

  const fetchDistricts = async () => {
    try {
      const response = await geographyApi.getDistricts({ state_id: selectedStateId, per_page: 100 });
      if (response.success && response.data) setDistricts(response.data);
    } catch (err) { console.error('Failed to fetch districts:', err); }
  };

  const fetchTaluks = async () => {
    try {
      const response = await geographyApi.getTaluks({ district_id: selectedDistrictId, per_page: 100 });
      if (response.success && response.data) setTaluks(response.data);
    } catch (err) { console.error('Failed to fetch taluks:', err); }
  };

  const fetchGramPanchayats = async () => {
    try {
      const response = await geographyApi.getGramPanchayats({ taluk_id: selectedTalukId, per_page: 100 });
      if (response.success && response.data) setGramPanchayats(response.data);
    } catch (err) { console.error('Failed to fetch gram panchayats:', err); }
  };

  const fetchVillages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: pagination.page, per_page: 50 };
      if (selectedStateId !== 'all') params.state_id = selectedStateId;
      if (selectedDistrictId !== 'all') params.district_id = selectedDistrictId;
      if (selectedTalukId !== 'all') params.taluk_id = selectedTalukId;
      if (selectedGpId !== 'all') params.gram_panchayat_id = selectedGpId;

      const response = await geographyApi.getVillages(params);
      if (response.success && response.data) {
        setVillages(response.data);
        setPagination({ page: response.meta?.page || 1, total: response.meta?.total || response.data.length, totalPages: response.meta?.total_pages || 1 });
      } else {
        setError(response.message || 'Failed to load villages');
        setVillages([]);
      }
    } catch (err) {
      console.error('Failed to fetch villages:', err);
      setError('Unable to connect to the server. Please try again later.');
      setVillages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVillages = villages.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.name_hindi?.includes(searchQuery)) ||
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.village_head_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (village: Village) => {
    if (window.confirm(`Are you sure you want to delete ${village.name}?`)) {
      try {
        await geographyApi.deleteVillage(village.id);
        setVillages(villages.filter(v => v.id !== village.id));
      } catch (err) {
        console.error('Failed to delete:', err);
        alert('Failed to delete village. Please try again.');
      }
    }
  };

  const formatNumber = (num?: number): string => {
    if (!num) return '-';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (<div className="bm-villages"><div className="bm-loading">Loading villages...</div></div>);
  }

  if (error) {
    return (
      <div className="bm-villages">
        <PageHeader
          icon={<HiOutlineHome />}
          title="Villages"
          description="Smallest Administrative Unit"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={fetchVillages}>
              <HiOutlineRefresh />
              <span>Retry</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Villages</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={fetchVillages}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-villages">
      <PageHeader
        icon={<HiOutlineHome />}
        title="Villages"
        description={villages.length > 0 ? `${pagination.total} Villages - Smallest Administrative Unit` : 'Manage villages'}
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

      <div className="bm-card">
        <div className="bm-table-toolbar">
          <div className="bm-search-box">
            <HiOutlineSearch className="bm-search-icon" />
            <input type="text" placeholder="Search villages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="bm-filters">
            <div className="bm-filter-group">
              <HiOutlineFilter className="bm-filter-icon" />
              <select value={selectedStateId} onChange={(e) => setSelectedStateId(e.target.value)} className="bm-select">
                <option value="all">All States</option>
                {states.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            {selectedStateId !== 'all' && (
              <select value={selectedDistrictId} onChange={(e) => setSelectedDistrictId(e.target.value)} className="bm-select">
                <option value="all">All Districts</option>
                {districts.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            )}
            {selectedDistrictId !== 'all' && (
              <select value={selectedTalukId} onChange={(e) => setSelectedTalukId(e.target.value)} className="bm-select">
                <option value="all">All Taluks</option>
                {taluks.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
            )}
            {selectedTalukId !== 'all' && (
              <select value={selectedGpId} onChange={(e) => setSelectedGpId(e.target.value)} className="bm-select">
                <option value="all">All GPs</option>
                {gramPanchayats.map(gp => (<option key={gp.id} value={gp.id}>{gp.name}</option>))}
              </select>
            )}
          </div>
        </div>

        {filteredVillages.length > 0 ? (
          <div className="bm-village-grid">
            {filteredVillages.map((village) => (
              <div key={village.id} className="bm-village-card">
                <div className="bm-village-header">
                  <div className="bm-village-icon">
                    <HiOutlineHome />
                  </div>
                  <div className="bm-village-names">
                    <h3 className="bm-village-name">{village.name}</h3>
                    {village.name_hindi && <span className="bm-village-name-hindi">{village.name_hindi}</span>}
                  </div>
                  <div className="bm-village-code">{village.code}</div>
                </div>

                <div className="bm-village-breadcrumb">
                  <HiOutlineLocationMarker />
                  <span>{village.gram_panchayat_name}</span>
                  <span className="bm-separator">→</span>
                  <span>{village.taluk_name}</span>
                  <span className="bm-separator">→</span>
                  <span>{village.district_name}</span>
                  <span className="bm-separator">→</span>
                  <span className="bm-state">{village.state_code}</span>
                </div>

                {village.village_head_name && (
                  <div className="bm-village-head">
                    <HiOutlineUserGroup />
                    <span className="bm-head-name">{village.village_head_name}</span>
                    {village.village_head_mobile && (
                      <>
                        <HiOutlinePhone />
                        <span>{village.village_head_mobile}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="bm-village-stats">
                  <div className="bm-village-stat">
                    <span className="bm-stat-value">{formatNumber(village.population)}</span>
                    <span className="bm-stat-label">Population</span>
                  </div>
                  <div className="bm-village-stat">
                    <span className="bm-stat-value">{formatNumber(village.households)}</span>
                    <span className="bm-stat-label">Households</span>
                  </div>
                  <div className="bm-village-stat">
                    <span className="bm-stat-value">{village.area_hectares || village.area_sq_km || '-'}</span>
                    <span className="bm-stat-label">Area</span>
                  </div>
                </div>

                <div className="bm-village-footer">
                  <div className="bm-village-meta">
                    {village.pin_code && <span className="bm-pin">PIN: {village.pin_code}</span>}
                    {village.lgd_code && <span className="bm-lgd">LGD: {village.lgd_code}</span>}
                  </div>
                  <div className="bm-village-actions">
                    <button className="bm-action-btn" onClick={() => navigate(`/geography/villages/${village.id}`)}><HiOutlineEye /></button>
                    <button className="bm-action-btn" onClick={() => navigate(`/geography/villages/${village.id}/edit`)}><HiOutlinePencil /></button>
                    <button className="bm-action-btn bm-action-btn--danger" onClick={() => handleDelete(village)}><HiOutlineTrash /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bm-empty-state">
            <HiOutlineHome className="bm-empty-icon" />
            <h3>No Villages Found</h3>
            <p>{searchQuery ? 'No villages match your search criteria' : 'No villages available. Add your first village to get started.'}</p>
            {!searchQuery && (
              <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/villages/new')}>
                <HiOutlinePlus />
                <span>Add Village</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VillageList;
