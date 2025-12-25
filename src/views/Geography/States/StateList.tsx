import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineExclamationCircle,
  HiOutlineUsers,
  HiOutlineLocationMarker,
  HiOutlineGlobe
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { State } from '../../../types/api.types';
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
      setError('Unable to connect to the server');
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

  const handleDelete = async (state: State) => {
    if (window.confirm(`Delete ${state.name}?`)) {
      try {
        await geographyApi.deleteState(state.id);
        setStates(states.filter(s => s.id !== state.id));
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const zoneColors: Record<string, string> = {
    north: '#eab308',
    south: '#22c55e',
    east: '#3b82f6',
    west: '#ec4899',
    central: '#8b5cf6',
    northeast: '#f97316'
  };

  const statesCount = filteredStates.filter(s => s.state_type === 'state').length;
  const utsCount = filteredStates.filter(s => s.state_type === 'union_territory').length;
  const totalDistricts = filteredStates.reduce((sum, s) => sum + (s.total_districts || 0), 0);

  if (loading) {
    return (
      <div className="sl">
        <div className="sl-loading">
          <div className="sl-loader"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sl">
        <div className="sl-error">
          <HiOutlineExclamationCircle />
          <p>{error}</p>
          <button onClick={fetchStates}><HiOutlineRefresh /> Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sl">
      {/* Compact Header */}
      <header className="sl-header">
        <div className="sl-title">
          <HiOutlineGlobe />
          <div>
            <h1>States & Union Territories</h1>
            <p>{statesCount} States, {utsCount} UTs</p>
          </div>
        </div>
        <div className="sl-actions">
          <button className="sl-btn sl-btn--ghost" onClick={fetchStates}>
            <HiOutlineRefresh />
          </button>
          <button className="sl-btn sl-btn--primary" onClick={() => navigate('/geography/states/new')}>
            <HiOutlinePlus />
            <span>Add</span>
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="sl-stats">
        <div className="sl-stat">
          <HiOutlineMap />
          <span className="sl-stat-val">{statesCount}</span>
          <span className="sl-stat-lbl">States</span>
        </div>
        <div className="sl-stat">
          <HiOutlineLocationMarker />
          <span className="sl-stat-val">{utsCount}</span>
          <span className="sl-stat-lbl">UTs</span>
        </div>
        <div className="sl-stat">
          <HiOutlineOfficeBuilding />
          <span className="sl-stat-val">{totalDistricts}</span>
          <span className="sl-stat-lbl">Districts</span>
        </div>
        <div className="sl-stat">
          <HiOutlineUsers />
          <span className="sl-stat-val">{formatNumber(filteredStates.reduce((s, st) => s + (st.population || 0), 0))}</span>
          <span className="sl-stat-lbl">Population</span>
        </div>
      </div>

      {/* Filters */}
      <div className="sl-filters">
        <div className="sl-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="sl-filter-group">
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
        </div>
      </div>

      {/* Table */}
      {filteredStates.length > 0 ? (
        <div className="sl-table-wrap">
          <table className="sl-table">
            <thead>
              <tr>
                <th>State/UT</th>
                <th>Capital</th>
                <th>Zone</th>
                <th>Districts</th>
                <th>Taluks</th>
                <th>Villages</th>
                <th>Population</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredStates.map((state) => (
                <tr key={state.id} onClick={() => navigate(`/geography/states/${state.id}`)}>
                  <td>
                    <div className="sl-cell-main">
                      <span className="sl-code" style={{ background: zoneColors[state.zone] || '#6b7280' }}>
                        {state.code}
                      </span>
                      <div className="sl-name-wrap">
                        <span className="sl-name">{state.name}</span>
                        <span className="sl-type">{state.state_type === 'state' ? 'State' : 'UT'}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="sl-capital">{state.capital || '—'}</span></td>
                  <td>
                    <span className="sl-zone" style={{ color: zoneColors[state.zone], background: `${zoneColors[state.zone]}15` }}>
                      {state.zone}
                    </span>
                  </td>
                  <td><span className="sl-num">{state.total_districts || 0}</span></td>
                  <td><span className="sl-num">{formatNumber(state.total_taluks || 0)}</span></td>
                  <td><span className="sl-num">{formatNumber(state.total_villages || 0)}</span></td>
                  <td><span className="sl-num sl-pop">{state.population ? formatNumber(state.population) : '—'}</span></td>
                  <td>
                    <div className="sl-row-actions" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/geography/states/${state.id}`)} title="View">
                        <HiOutlineEye />
                      </button>
                      <button onClick={() => navigate(`/geography/districts?state_id=${state.id}`)} title="Districts">
                        <HiOutlineOfficeBuilding />
                      </button>
                      <button onClick={() => navigate(`/geography/states/${state.id}/edit`)} title="Edit">
                        <HiOutlinePencil />
                      </button>
                      <button className="sl-del" onClick={() => handleDelete(state)} title="Delete">
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
        <div className="sl-empty">
          <HiOutlineMap />
          <h3>No States Found</h3>
          <p>{searchQuery ? 'No results match your search' : 'Add your first state to get started'}</p>
          {!searchQuery && (
            <button onClick={() => navigate('/geography/states/new')}>
              <HiOutlinePlus /> Add State
            </button>
          )}
        </div>
      )}

      {/* Zone Legend */}
      <div className="sl-legend">
        {Object.entries(zoneColors).map(([zone, color]) => (
          <button
            key={zone}
            className={`sl-legend-item ${selectedZone === zone ? 'active' : ''}`}
            onClick={() => setSelectedZone(selectedZone === zone ? 'all' : zone)}
          >
            <span className="sl-dot" style={{ background: color }}></span>
            <span>{zone}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StateList;
