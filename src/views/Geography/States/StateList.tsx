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
  HiOutlineChevronRight
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

      <div className="sl-box">
        <div className="sl-bar">
          <div className="sl-search">
            <HiOutlineSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sl-filters">
            <HiOutlineFilter className="sl-filter-icon" />
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="state">States</option>
              <option value="union_territory">UTs</option>
            </select>
            <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
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

        {loading ? (
          <div className="sl-loading">
            <div className="sl-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : filteredStates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="sl-grid">
              {filteredStates.map((state) => (
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
    </div>
  );
};

export default StateList;
