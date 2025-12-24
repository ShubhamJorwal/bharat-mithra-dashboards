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
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineHome,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { District, State } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './DistrictList.scss';

const DistrictList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stateIdFromUrl = searchParams.get('state_id');

  const [districts, setDistricts] = useState<District[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateId, setSelectedStateId] = useState<string>(stateIdFromUrl || 'all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [selectedStateId]);

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

  const fetchDistricts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: pagination.page, per_page: 50 };
      if (selectedStateId !== 'all') params.state_id = selectedStateId;

      const response = await geographyApi.getDistricts(params);
      if (response.success && response.data) {
        setDistricts(response.data);
        setPagination({
          page: response.meta?.page || 1,
          total: response.meta?.total || response.data.length,
          totalPages: response.meta?.total_pages || 1
        });
      } else {
        setError(response.message || 'Failed to load districts');
        setDistricts([]);
      }
    } catch (err) {
      console.error('Failed to fetch districts:', err);
      setError('Unable to connect to the server. Please try again later.');
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (district.name_hindi?.includes(searchQuery)) ||
      district.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleView = (district: District) => {
    navigate(`/geography/districts/${district.id}`);
  };

  const handleEdit = (district: District) => {
    navigate(`/geography/districts/${district.id}/edit`);
  };

  const handleDelete = async (district: District) => {
    if (window.confirm(`Are you sure you want to delete ${district.name}?`)) {
      try {
        await geographyApi.deleteDistrict(district.id);
        setDistricts(districts.filter(d => d.id !== district.id));
      } catch (err) {
        console.error('Failed to delete district:', err);
        alert('Failed to delete district. Please try again.');
      }
    }
  };

  const handleViewTaluks = (district: District) => {
    navigate(`/geography/taluks?district_id=${district.id}`);
  };

  const formatNumber = (num: number): string => {
    if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="bm-districts">
        <div className="bm-loading">Loading districts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bm-districts">
        <PageHeader
          icon={<HiOutlineOfficeBuilding />}
          title="Districts"
          description="Manage all districts of India"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={fetchDistricts}>
              <HiOutlineRefresh />
              <span>Retry</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Districts</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={fetchDistricts}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-districts">
      <PageHeader
        icon={<HiOutlineOfficeBuilding />}
        title="Districts"
        description={districts.length > 0 ? `${pagination.total} Districts in India` : 'Manage all districts'}
        actions={
          <>
            <button
              className="bm-btn bm-btn-secondary"
              onClick={fetchDistricts}
              disabled={loading}
            >
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              className="bm-btn bm-btn-primary"
              onClick={() => navigate('/geography/districts/new')}
            >
              <HiOutlinePlus />
              <span>Add District</span>
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
              placeholder="Search districts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bm-filters">
            <div className="bm-filter-group">
              <HiOutlineFilter className="bm-filter-icon" />
              <select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                className="bm-select"
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredDistricts.length > 0 ? (
          <div className="bm-table-container">
            <table className="bm-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>State</th>
                  <th>Headquarters</th>
                  <th>Taluks</th>
                  <th>Gram Panchayats</th>
                  <th>Villages</th>
                  <th>Population</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistricts.map((district) => (
                  <tr key={district.id}>
                    <td>
                      <div className="bm-district-info">
                        <div className="bm-district-code">{district.code}</div>
                        <div className="bm-district-names">
                          <span className="bm-district-name">{district.name}</span>
                          {district.name_hindi && (
                            <span className="bm-district-name-hindi">{district.name_hindi}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="bm-state-badge">{district.state_name}</span>
                    </td>
                    <td>{district.headquarters || '-'}</td>
                    <td>
                      <span
                        className="bm-clickable-stat"
                        onClick={() => handleViewTaluks(district)}
                      >
                        <HiOutlineLocationMarker />
                        {district.total_taluks}
                      </span>
                    </td>
                    <td>{formatNumber(district.total_gram_panchayats)}</td>
                    <td>
                      <span className="bm-village-count">
                        <HiOutlineHome />
                        {formatNumber(district.total_villages)}
                      </span>
                    </td>
                    <td>{district.population ? formatNumber(district.population) : '-'}</td>
                    <td>
                      <div className="bm-table-actions">
                        <button className="bm-action-btn" onClick={() => handleView(district)} title="View">
                          <HiOutlineEye />
                        </button>
                        <button className="bm-action-btn" onClick={() => handleEdit(district)} title="Edit">
                          <HiOutlinePencil />
                        </button>
                        <button className="bm-action-btn bm-action-btn--danger" onClick={() => handleDelete(district)} title="Delete">
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
            <HiOutlineOfficeBuilding className="bm-empty-icon" />
            <h3>No Districts Found</h3>
            <p>{searchQuery ? 'No districts match your search criteria' : 'No districts available. Add your first district to get started.'}</p>
            {!searchQuery && (
              <button className="bm-btn bm-btn-primary" onClick={() => navigate('/geography/districts/new')}>
                <HiOutlinePlus />
                <span>Add District</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DistrictList;
