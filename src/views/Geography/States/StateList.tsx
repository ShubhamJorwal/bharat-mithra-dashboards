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
  HiOutlineOfficeBuilding,
  HiOutlineExclamationCircle,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineLocationMarker
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStates();
  }, [selectedZone, selectedType]);

  const fetchStates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: 1, per_page: 50 };
      if (selectedZone !== 'all') params.zone = selectedZone;
      if (selectedType !== 'all') params.state_type = selectedType;

      const response = await geographyApi.getStates(params);
      if (response.success && response.data) {
        setStates(response.data);
      } else {
        setError(response.message || 'Failed to load states');
        setStates([]);
      }
    } catch (err) {
      console.error('Failed to fetch states:', err);
      setError('Unable to connect to the server. Please try again.');
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStates = states.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = async (state: State) => {
    if (!window.confirm(`Are you sure you want to delete "${state.name}"?`)) return;

    setDeleteLoading(state.id);
    try {
      await geographyApi.deleteState(state.id);
      setStates(states.filter(s => s.id !== state.id));
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete state. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const statesCount = filteredStates.filter(s => s.state_type === 'state').length;
  const utsCount = filteredStates.filter(s => s.state_type === 'union_territory').length;

  return (
    <div className="bm-states">
      <PageHeader
        icon={<HiOutlineMap />}
        title="States & Union Territories"
        description={`${statesCount} States, ${utsCount} Union Territories`}
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

      {error && (
        <div className="bm-alert bm-alert-error">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button className="bm-alert-close" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="bm-card">
        <div className="bm-table-toolbar">
          <div className="bm-search-box">
            <HiOutlineSearch className="bm-search-icon" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bm-search-input"
            />
          </div>
          <div className="bm-toolbar-actions">
            <div className="bm-filter-group">
              <HiOutlineFilter className="bm-filter-icon" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bm-select"
              >
                <option value="all">All Types</option>
                <option value="state">States</option>
                <option value="union_territory">Union Territories</option>
              </select>
            </div>
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
            <div className="bm-view-toggle">
              <button
                className={`bm-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <HiOutlineViewGrid />
              </button>
              <button
                className={`bm-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <HiOutlineViewList />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bm-loading-state">
            <div className="bm-loading-spinner"></div>
            <p>Loading states...</p>
          </div>
        ) : filteredStates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="bm-states-grid">
              {filteredStates.map((state) => (
                <div
                  key={state.id}
                  className="bm-state-card"
                  onClick={() => navigate(`/geography/states/${state.id}`)}
                >
                  <div className="bm-state-header">
                    <div className="bm-state-icon">
                      <HiOutlineMap />
                    </div>
                    <span className={`bm-state-type ${state.state_type === 'state' ? 'is-state' : 'is-ut'}`}>
                      {state.state_type === 'state' ? 'State' : 'UT'}
                    </span>
                  </div>
                  <div className="bm-state-body">
                    <div className="bm-state-code">{state.code}</div>
                    <h3 className="bm-state-name">{state.name}</h3>
                    <div className="bm-state-details">
                      <div className="bm-state-detail">
                        <HiOutlineLocationMarker />
                        <span>{state.capital || 'N/A'}</span>
                      </div>
                      <div className="bm-state-detail">
                        <HiOutlineMap />
                        <span className="capitalize">{state.zone} Zone</span>
                      </div>
                    </div>
                  </div>
                  <div className="bm-state-stats">
                    <div className="bm-stat">
                      <span className="bm-stat-value">{state.total_districts || 0}</span>
                      <span className="bm-stat-label">Districts</span>
                    </div>
                    <div className="bm-stat">
                      <span className="bm-stat-value">{formatNumber(state.total_taluks || 0)}</span>
                      <span className="bm-stat-label">Taluks</span>
                    </div>
                    <div className="bm-stat">
                      <span className="bm-stat-value">{state.population ? formatNumber(state.population) : '—'}</span>
                      <span className="bm-stat-label">Population</span>
                    </div>
                  </div>
                  <div className="bm-state-actions">
                    <button
                      className="bm-btn bm-btn-ghost"
                      onClick={(e) => { e.stopPropagation(); navigate(`/geography/districts?state_id=${state.id}`); }}
                    >
                      <HiOutlineOfficeBuilding />
                      <span>Districts</span>
                    </button>
                    <button
                      className="bm-btn bm-btn-ghost"
                      onClick={(e) => { e.stopPropagation(); navigate(`/geography/states/${state.id}/edit`); }}
                    >
                      <HiOutlinePencil />
                      <span>Edit</span>
                    </button>
                    <button
                      className="bm-btn bm-btn-ghost bm-btn-danger"
                      onClick={(e) => { e.stopPropagation(); handleDelete(state); }}
                      disabled={deleteLoading === state.id}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bm-table-container">
              <table className="bm-table">
                <thead>
                  <tr>
                    <th>State/UT</th>
                    <th>Capital</th>
                    <th>Zone</th>
                    <th>Districts</th>
                    <th>Taluks</th>
                    <th>Population</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStates.map((state) => (
                    <tr
                      key={state.id}
                      onClick={() => navigate(`/geography/states/${state.id}`)}
                    >
                      <td>
                        <div className="bm-cell-main">
                          <div className="bm-cell-icon">
                            <HiOutlineMap />
                          </div>
                          <div className="bm-cell-info">
                            <span className="bm-cell-name">{state.name}</span>
                            <span className="bm-cell-code">{state.code} · {state.state_type === 'state' ? 'State' : 'Union Territory'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{state.capital || '—'}</td>
                      <td><span className="bm-cell-zone capitalize">{state.zone}</span></td>
                      <td><span className="bm-cell-num">{state.total_districts || 0}</span></td>
                      <td><span className="bm-cell-num">{formatNumber(state.total_taluks || 0)}</span></td>
                      <td><span className="bm-cell-num">{state.population ? formatNumber(state.population) : '—'}</span></td>
                      <td>
                        <div className="bm-cell-actions" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/geography/states/${state.id}`)} title="View">
                            <HiOutlineEye />
                          </button>
                          <button onClick={() => navigate(`/geography/districts?state_id=${state.id}`)} title="Districts">
                            <HiOutlineOfficeBuilding />
                          </button>
                          <button onClick={() => navigate(`/geography/states/${state.id}/edit`)} title="Edit">
                            <HiOutlinePencil />
                          </button>
                          <button
                            className="is-danger"
                            onClick={() => handleDelete(state)}
                            disabled={deleteLoading === state.id}
                            title="Delete"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="bm-empty-state">
            <div className="bm-empty-icon">
              <HiOutlineMap />
            </div>
            <h3>No states found</h3>
            <p>
              {searchQuery || selectedZone !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first state or union territory'}
            </p>
            {!searchQuery && selectedZone === 'all' && selectedType === 'all' && (
              <button
                className="bm-btn bm-btn-primary"
                onClick={() => navigate('/geography/states/new')}
              >
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
