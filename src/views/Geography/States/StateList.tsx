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
  HiOutlineMap,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { State } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './StateList.scss';

const StateList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>(searchParams.get('zone') || 'all');
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchStates();
  }, [selectedZone, selectedType]);

  const fetchStates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: pagination.page, per_page: 50 };
      if (selectedZone !== 'all') params.zone = selectedZone;
      if (selectedType !== 'all') params.state_type = selectedType;

      const response = await geographyApi.getStates(params);
      if (response.success && response.data) {
        setStates(response.data);
        setPagination({
          page: response.meta?.page || 1,
          total: response.meta?.total || response.data.length,
          totalPages: response.meta?.total_pages || 1
        });
      } else {
        setError(response.message || 'Failed to load states');
        setStates([]);
      }
    } catch (err) {
      console.error('Failed to fetch states:', err);
      setError('Unable to connect to the server. Please try again later.');
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStates = states.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (state.name_hindi?.includes(searchQuery)) ||
      state.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleView = (state: State) => {
    navigate(`/geography/states/${state.id}`);
  };

  const handleEdit = (state: State) => {
    navigate(`/geography/states/${state.id}/edit`);
  };

  const handleDelete = async (state: State) => {
    if (window.confirm(`Are you sure you want to delete ${state.name}?`)) {
      try {
        await geographyApi.deleteState(state.id);
        setStates(states.filter(s => s.id !== state.id));
      } catch (err) {
        console.error('Failed to delete state:', err);
        alert('Failed to delete state. Please try again.');
      }
    }
  };

  const handleViewDistricts = (state: State) => {
    navigate(`/geography/districts?state_id=${state.id}`);
  };

  const formatNumber = (num: number): string => {
    if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('en-IN');
  };

  const getZoneColor = (zone: string): string => {
    const colors: Record<string, string> = {
      north: '#f59e0b',
      south: '#10b981',
      east: '#3b82f6',
      west: '#ec4899',
      central: '#8b5cf6',
      northeast: '#f97316'
    };
    return colors[zone] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="bm-states">
        <div className="bm-loading">Loading states...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bm-states">
        <PageHeader
          icon={<HiOutlineMap />}
          title="States & Union Territories"
          description="Manage all states and union territories of India"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={fetchStates}>
              <HiOutlineRefresh />
              <span>Retry</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load States</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={fetchStates}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statesCount = filteredStates.filter(s => s.state_type === 'state').length;
  const utsCount = filteredStates.filter(s => s.state_type === 'union_territory').length;

  return (
    <div className="bm-states">
      <PageHeader
        icon={<HiOutlineMap />}
        title="States & Union Territories"
        description={states.length > 0 ? `${statesCount} States, ${utsCount} Union Territories` : 'Manage all states and union territories'}
        actions={
          <>
            <button
              className="bm-btn bm-btn-secondary"
              onClick={fetchStates}
              disabled={loading}
            >
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              className="bm-btn bm-btn-primary"
              onClick={() => navigate('/geography/states/new')}
            >
              <HiOutlinePlus />
              <span>Add State/UT</span>
            </button>
          </>
        }
      />

      <div className="bm-card">
        <div className="bm-table-toolbar">
          <div className="bm-search-box">
            <HiOutlineSearch className="bm-search-icon" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bm-filters">
            <div className="bm-filter-group">
              <HiOutlineFilter className="bm-filter-icon" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bm-select"
              >
                <option value="all">All Types</option>
                <option value="state">States Only</option>
                <option value="union_territory">UTs Only</option>
              </select>
            </div>
            <div className="bm-filter-group">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bm-select"
              >
                <option value="all">All Zones</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="central">Central</option>
                <option value="northeast">Northeast</option>
              </select>
            </div>
          </div>
        </div>

        {filteredStates.length > 0 ? (
          <div className="bm-states-grid">
            {filteredStates.map((state) => (
              <div key={state.id} className="bm-state-card">
                <div className="bm-state-header">
                  <div className="bm-state-info">
                    <div className="bm-state-code" style={{ background: getZoneColor(state.zone) }}>
                      {state.code}
                    </div>
                    <div className="bm-state-names">
                      <h3 className="bm-state-name">{state.name}</h3>
                      {state.name_hindi && (
                        <span className="bm-state-name-hindi">{state.name_hindi}</span>
                      )}
                    </div>
                  </div>
                  <div className="bm-state-badges">
                    <span className={`bm-badge bm-badge--${state.state_type === 'state' ? 'primary' : 'warning'}`}>
                      {state.state_type === 'state' ? 'State' : 'UT'}
                    </span>
                    <span className="bm-badge bm-badge--zone" style={{ background: `${getZoneColor(state.zone)}20`, color: getZoneColor(state.zone) }}>
                      {state.zone.charAt(0).toUpperCase() + state.zone.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="bm-state-details">
                  <div className="bm-detail-row">
                    <span className="bm-detail-label">Capital:</span>
                    <span className="bm-detail-value">{state.capital || '-'}</span>
                  </div>
                  {state.population && (
                    <div className="bm-detail-row">
                      <span className="bm-detail-label">Population:</span>
                      <span className="bm-detail-value">{formatNumber(state.population)}</span>
                    </div>
                  )}
                </div>

                <div className="bm-state-stats">
                  <div className="bm-stat" onClick={() => handleViewDistricts(state)}>
                    <HiOutlineOfficeBuilding />
                    <span className="bm-stat-value">{state.total_districts}</span>
                    <span className="bm-stat-label">Districts</span>
                  </div>
                  <div className="bm-stat">
                    <HiOutlineLocationMarker />
                    <span className="bm-stat-value">{formatNumber(state.total_taluks)}</span>
                    <span className="bm-stat-label">Taluks</span>
                  </div>
                  <div className="bm-stat">
                    <span className="bm-stat-value">{formatNumber(state.total_villages)}</span>
                    <span className="bm-stat-label">Villages</span>
                  </div>
                </div>

                <div className="bm-state-actions">
                  <button className="bm-action-btn" onClick={() => handleView(state)} title="View Details">
                    <HiOutlineEye />
                  </button>
                  <button className="bm-action-btn" onClick={() => handleViewDistricts(state)} title="View Districts">
                    <HiOutlineOfficeBuilding />
                  </button>
                  <button className="bm-action-btn" onClick={() => handleEdit(state)} title="Edit">
                    <HiOutlinePencil />
                  </button>
                  <button className="bm-action-btn bm-action-btn--danger" onClick={() => handleDelete(state)} title="Delete">
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bm-empty-state">
            <HiOutlineMap className="bm-empty-icon" />
            <h3>No States Found</h3>
            <p>{searchQuery ? 'No states match your search criteria' : 'No states available. Add your first state to get started.'}</p>
            {!searchQuery && (
              <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/states/new')}>
                <HiOutlinePlus />
                <span>Add State/UT</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StateList;
