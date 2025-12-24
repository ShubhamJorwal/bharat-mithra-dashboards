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
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { GramPanchayat, State, District, Taluk } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './GramPanchayatList.scss';

const GramPanchayatList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const talukIdFromUrl = searchParams.get('taluk_id');

  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateId, setSelectedStateId] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('all');
  const [selectedTalukId, setSelectedTalukId] = useState<string>(talukIdFromUrl || 'all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => { fetchStates(); }, []);
  useEffect(() => { if (selectedStateId !== 'all') fetchDistricts(); else { setDistricts([]); setSelectedDistrictId('all'); } }, [selectedStateId]);
  useEffect(() => { if (selectedDistrictId !== 'all') fetchTaluks(); else { setTaluks([]); setSelectedTalukId('all'); } }, [selectedDistrictId]);
  useEffect(() => { fetchGramPanchayats(); }, [selectedStateId, selectedDistrictId, selectedTalukId]);

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
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: pagination.page, per_page: 50 };
      if (selectedStateId !== 'all') params.state_id = selectedStateId;
      if (selectedDistrictId !== 'all') params.district_id = selectedDistrictId;
      if (selectedTalukId !== 'all') params.taluk_id = selectedTalukId;

      const response = await geographyApi.getGramPanchayats(params);
      if (response.success && response.data) {
        setGramPanchayats(response.data);
        setPagination({ page: response.meta?.page || 1, total: response.meta?.total || response.data.length, totalPages: response.meta?.total_pages || 1 });
      } else {
        setError(response.message || 'Failed to load gram panchayats');
        setGramPanchayats([]);
      }
    } catch (err) {
      console.error('Failed to fetch gram panchayats:', err);
      setError('Unable to connect to the server. Please try again later.');
      setGramPanchayats([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGPs = gramPanchayats.filter(gp =>
    gp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (gp.name_hindi?.includes(searchQuery)) ||
    gp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (gp.sarpanch_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (gp: GramPanchayat) => {
    if (window.confirm(`Are you sure you want to delete ${gp.name}?`)) {
      try {
        await geographyApi.deleteGramPanchayat(gp.id);
        setGramPanchayats(gramPanchayats.filter(g => g.id !== gp.id));
      } catch (err) {
        console.error('Failed to delete:', err);
        alert('Failed to delete gram panchayat. Please try again.');
      }
    }
  };

  const formatNumber = (num?: number): string => {
    if (!num) return '-';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (<div className="bm-gram-panchayats"><div className="bm-loading">Loading gram panchayats...</div></div>);
  }

  if (error) {
    return (
      <div className="bm-gram-panchayats">
        <PageHeader
          icon={<HiOutlineUserGroup />}
          title="Gram Panchayats"
          description="Local Self Government Units"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={fetchGramPanchayats}>
              <HiOutlineRefresh />
              <span>Retry</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Gram Panchayats</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={fetchGramPanchayats}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-gram-panchayats">
      <PageHeader
        icon={<HiOutlineUserGroup />}
        title="Gram Panchayats"
        description={gramPanchayats.length > 0 ? `${pagination.total} Gram Panchayats - Local Self Government` : 'Manage gram panchayats'}
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

      <div className="bm-card">
        <div className="bm-table-toolbar">
          <div className="bm-search-box">
            <HiOutlineSearch className="bm-search-icon" />
            <input type="text" placeholder="Search gram panchayats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
          </div>
        </div>

        {filteredGPs.length > 0 ? (
          <div className="bm-gp-grid">
            {filteredGPs.map((gp) => (
              <div key={gp.id} className="bm-gp-card">
                <div className="bm-gp-header">
                  <div className="bm-gp-code">{gp.code}</div>
                  <div className="bm-gp-names">
                    <h3 className="bm-gp-name">{gp.name}</h3>
                    {gp.name_hindi && <span className="bm-gp-name-hindi">{gp.name_hindi}</span>}
                  </div>
                </div>

                <div className="bm-gp-location">
                  <span>{gp.taluk_name}</span>
                  <span className="bm-separator">•</span>
                  <span>{gp.district_name}</span>
                  <span className="bm-separator">•</span>
                  <span className="bm-state">{gp.state_name}</span>
                </div>

                {gp.sarpanch_name && (
                  <div className="bm-gp-sarpanch">
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

                <div className="bm-gp-stats">
                  <div className="bm-gp-stat">
                    <HiOutlineHome />
                    <span className="bm-stat-value">{gp.total_villages}</span>
                    <span className="bm-stat-label">Villages</span>
                  </div>
                  <div className="bm-gp-stat">
                    <span className="bm-stat-value">{formatNumber(gp.population)}</span>
                    <span className="bm-stat-label">Population</span>
                  </div>
                  <div className="bm-gp-stat">
                    <span className="bm-stat-value">{formatNumber(gp.households)}</span>
                    <span className="bm-stat-label">Households</span>
                  </div>
                </div>

                <div className="bm-gp-footer">
                  {gp.pin_code && <span className="bm-gp-pin">PIN: {gp.pin_code}</span>}
                  <div className="bm-gp-actions">
                    <button className="bm-action-btn" onClick={() => navigate(`/geography/gram-panchayats/${gp.id}`)}><HiOutlineEye /></button>
                    <button className="bm-action-btn" onClick={() => navigate(`/geography/gram-panchayats/${gp.id}/edit`)}><HiOutlinePencil /></button>
                    <button className="bm-action-btn bm-action-btn--danger" onClick={() => handleDelete(gp)}><HiOutlineTrash /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bm-empty-state">
            <HiOutlineUserGroup className="bm-empty-icon" />
            <h3>No Gram Panchayats Found</h3>
            <p>{searchQuery ? 'No gram panchayats match your search criteria' : 'No gram panchayats available. Add your first gram panchayat to get started.'}</p>
            {!searchQuery && (
              <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/gram-panchayats/new')}>
                <HiOutlinePlus />
                <span>Add Gram Panchayat</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GramPanchayatList;
