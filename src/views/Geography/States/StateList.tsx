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
  HiOutlineLocationMarker,
  HiOutlineArrowRight
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

  const handleDelete = async (e: React.MouseEvent, state: State) => {
    e.stopPropagation();
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
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const statesCount = filteredStates.filter(s => s.state_type === 'state').length;
  const utsCount = filteredStates.filter(s => s.state_type === 'union_territory').length;

  return (
    <div className="states-page">
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
        <div className="states-alert states-alert--error">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="states-container">
        <div className="states-toolbar">
          <div className="states-search">
            <HiOutlineSearch />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="states-filters">
            <div className="states-filter">
              <HiOutlineFilter />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="state">States</option>
                <option value="union_territory">Union Territories</option>
              </select>
            </div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="states-zone-select"
            >
              <option value="all">All Zones</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="central">Central</option>
              <option value="northeast">Northeast</option>
            </select>
            <div className="states-view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <HiOutlineViewGrid />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <HiOutlineViewList />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="states-loading">
            <div className="states-loading__spinner"></div>
            <p>Loading states...</p>
          </div>
        ) : filteredStates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="states-grid">
              {filteredStates.map((state) => (
                <article
                  key={state.id}
                  className="state-card"
                  onClick={() => navigate(`/geography/states/${state.id}`)}
                >
                  <div className="state-card__top">
                    <div className="state-card__title">
                      <h3>{state.name}</h3>
                      <span className="state-card__code">{state.code}</span>
                    </div>
                    <span className={`state-card__type ${state.state_type === 'state' ? 'state-card__type--state' : 'state-card__type--ut'}`}>
                      {state.state_type === 'state' ? 'State' : 'UT'}
                    </span>
                  </div>

                  <div className="state-card__meta">
                    <div className="state-card__meta-item">
                      <HiOutlineLocationMarker />
                      <span>{state.capital || 'N/A'}</span>
                    </div>
                    <div className="state-card__meta-item">
                      <HiOutlineMap />
                      <span className="capitalize">{state.zone}</span>
                    </div>
                  </div>

                  <div className="state-card__stats">
                    <div className="state-card__stat">
                      <span className="state-card__stat-val">{state.total_districts || 0}</span>
                      <span className="state-card__stat-lbl">Districts</span>
                    </div>
                    <div className="state-card__stat">
                      <span className="state-card__stat-val">{formatNumber(state.total_taluks || 0)}</span>
                      <span className="state-card__stat-lbl">Taluks</span>
                    </div>
                    <div className="state-card__stat">
                      <span className="state-card__stat-val">{state.population ? formatNumber(state.population) : '—'}</span>
                      <span className="state-card__stat-lbl">Population</span>
                    </div>
                  </div>

                  <div className="state-card__actions">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/geography/districts?state_id=${state.id}`); }}
                      title="Districts"
                    >
                      <HiOutlineOfficeBuilding />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/geography/states/${state.id}/edit`); }}
                      title="Edit"
                    >
                      <HiOutlinePencil />
                    </button>
                    <button
                      className="danger"
                      onClick={(e) => handleDelete(e, state)}
                      disabled={deleteLoading === state.id}
                      title="Delete"
                    >
                      <HiOutlineTrash />
                    </button>
                    <span className="state-card__arrow">
                      <HiOutlineArrowRight />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="states-table-wrap">
              <table className="states-table">
                <thead>
                  <tr>
                    <th>Name</th>
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
                        <div className="states-table__name">
                          <span className="states-table__title">{state.name}</span>
                          <span className="states-table__sub">{state.code} · {state.state_type === 'state' ? 'State' : 'UT'}</span>
                        </div>
                      </td>
                      <td>{state.capital || '—'}</td>
                      <td><span className="states-table__zone capitalize">{state.zone}</span></td>
                      <td className="num">{state.total_districts || 0}</td>
                      <td className="num">{formatNumber(state.total_taluks || 0)}</td>
                      <td className="num">{state.population ? formatNumber(state.population) : '—'}</td>
                      <td>
                        <div className="states-table__actions" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/geography/states/${state.id}`)}><HiOutlineEye /></button>
                          <button onClick={() => navigate(`/geography/districts?state_id=${state.id}`)}><HiOutlineOfficeBuilding /></button>
                          <button onClick={() => navigate(`/geography/states/${state.id}/edit`)}><HiOutlinePencil /></button>
                          <button className="danger" onClick={() => handleDelete({ stopPropagation: () => {} } as React.MouseEvent, state)} disabled={deleteLoading === state.id}><HiOutlineTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="states-empty">
            <div className="states-empty__icon"><HiOutlineMap /></div>
            <h3>No states found</h3>
            <p>
              {searchQuery || selectedZone !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first state or union territory'}
            </p>
            {!searchQuery && selectedZone === 'all' && selectedType === 'all' && (
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
