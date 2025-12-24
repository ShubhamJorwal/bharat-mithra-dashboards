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
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { Taluk, State, District } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './TalukList.scss';

const TalukList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const districtIdFromUrl = searchParams.get('district_id');
  const stateIdFromUrl = searchParams.get('state_id');

  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateId, setSelectedStateId] = useState<string>(stateIdFromUrl || 'all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(districtIdFromUrl || 'all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedStateId !== 'all') {
      fetchDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrictId('all');
    }
  }, [selectedStateId]);

  useEffect(() => {
    fetchTaluks();
  }, [selectedStateId, selectedDistrictId]);

  const fetchStates = async () => {
    try {
      const response = await geographyApi.getStates({ per_page: 100 });
      if (response.success && response.data) setStates(response.data);
    } catch (err) {
      console.error('Failed to fetch states:', err);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await geographyApi.getDistricts({ state_id: selectedStateId, per_page: 100 });
      if (response.success && response.data) setDistricts(response.data);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    }
  };

  const fetchTaluks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: pagination.page, per_page: 50 };
      if (selectedStateId !== 'all') params.state_id = selectedStateId;
      if (selectedDistrictId !== 'all') params.district_id = selectedDistrictId;

      const response = await geographyApi.getTaluks(params);
      if (response.success && response.data) {
        setTaluks(response.data);
        setPagination({ page: response.meta?.page || 1, total: response.meta?.total || response.data.length, totalPages: response.meta?.total_pages || 1 });
      } else {
        setError(response.message || 'Failed to load taluks');
        setTaluks([]);
      }
    } catch (err) {
      console.error('Failed to fetch taluks:', err);
      setError('Unable to connect to the server. Please try again later.');
      setTaluks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTaluks = taluks.filter(taluk =>
    taluk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (taluk.name_hindi?.includes(searchQuery)) ||
    taluk.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (taluk: Taluk) => {
    if (window.confirm(`Are you sure you want to delete ${taluk.name}?`)) {
      try {
        await geographyApi.deleteTaluk(taluk.id);
        setTaluks(taluks.filter(t => t.id !== taluk.id));
      } catch (err) {
        console.error('Failed to delete taluk:', err);
        alert('Failed to delete taluk. Please try again.');
      }
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="bm-taluks">
        <div className="bm-loading">Loading taluks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bm-taluks">
        <PageHeader
          icon={<HiOutlineLocationMarker />}
          title="Taluks / Tehsils / Mandals"
          description="Manage all taluks across India"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={fetchTaluks}>
              <HiOutlineRefresh />
              <span>Retry</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Taluks</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={fetchTaluks}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-taluks">
      <PageHeader
        icon={<HiOutlineLocationMarker />}
        title="Taluks / Tehsils / Mandals"
        description={taluks.length > 0 ? `${pagination.total} Taluks across India` : 'Manage all taluks'}
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

      <div className="bm-card">
        <div className="bm-table-toolbar">
          <div className="bm-search-box">
            <HiOutlineSearch className="bm-search-icon" />
            <input type="text" placeholder="Search taluks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="bm-filters">
            <div className="bm-filter-group">
              <HiOutlineFilter className="bm-filter-icon" />
              <select value={selectedStateId} onChange={(e) => setSelectedStateId(e.target.value)} className="bm-select">
                <option value="all">All States</option>
                {states.map(state => (<option key={state.id} value={state.id}>{state.name}</option>))}
              </select>
            </div>
            {selectedStateId !== 'all' && (
              <select value={selectedDistrictId} onChange={(e) => setSelectedDistrictId(e.target.value)} className="bm-select">
                <option value="all">All Districts</option>
                {districts.map(district => (<option key={district.id} value={district.id}>{district.name}</option>))}
              </select>
            )}
          </div>
        </div>

        {filteredTaluks.length > 0 ? (
          <div className="bm-table-container">
            <table className="bm-table">
              <thead>
                <tr>
                  <th>Taluk</th>
                  <th>District</th>
                  <th>State</th>
                  <th>Headquarters</th>
                  <th>Gram Panchayats</th>
                  <th>Villages</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTaluks.map((taluk) => (
                  <tr key={taluk.id}>
                    <td>
                      <div className="bm-taluk-info">
                        <div className="bm-taluk-code">{taluk.code}</div>
                        <div className="bm-taluk-names">
                          <span className="bm-taluk-name">{taluk.name}</span>
                          {taluk.name_hindi && <span className="bm-taluk-name-hindi">{taluk.name_hindi}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{taluk.district_name}</td>
                    <td><span className="bm-state-badge">{taluk.state_name}</span></td>
                    <td>{taluk.headquarters || '-'}</td>
                    <td>
                      <span className="bm-stat-badge bm-stat-badge--gp">
                        <HiOutlineUserGroup /> {formatNumber(taluk.total_gram_panchayats)}
                      </span>
                    </td>
                    <td>
                      <span className="bm-stat-badge bm-stat-badge--village">
                        <HiOutlineHome /> {formatNumber(taluk.total_villages)}
                      </span>
                    </td>
                    <td>
                      <div className="bm-table-actions">
                        <button className="bm-action-btn" onClick={() => navigate(`/geography/taluks/${taluk.id}`)} title="View">
                          <HiOutlineEye />
                        </button>
                        <button className="bm-action-btn" onClick={() => navigate(`/geography/taluks/${taluk.id}/edit`)} title="Edit">
                          <HiOutlinePencil />
                        </button>
                        <button className="bm-action-btn bm-action-btn--danger" onClick={() => handleDelete(taluk)} title="Delete">
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bm-empty-state">
            <HiOutlineLocationMarker className="bm-empty-icon" />
            <h3>No Taluks Found</h3>
            <p>{searchQuery ? 'No taluks match your search criteria' : 'No taluks available. Add your first taluk to get started.'}</p>
            {!searchQuery && (
              <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/taluks/new')}>
                <HiOutlinePlus />
                <span>Add Taluk</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalukList;
