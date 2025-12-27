import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineMap,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { CreateStateRequest, UpdateStateRequest } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './StateForm.scss';

type ZoneType = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';

interface StateFormData {
  name: string;
  name_hindi: string;
  code: string;
  state_type: 'state' | 'union_territory';
  capital: string;
  zone: ZoneType;
  population: string;
  area_sq_km: string;
  literacy_rate: string;
  official_language: string;
  lgd_code: string;
  is_active: boolean;
}

const StateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StateFormData>({
    name: '',
    name_hindi: '',
    code: '',
    state_type: 'state',
    capital: '',
    zone: 'north',
    population: '',
    area_sq_km: '',
    literacy_rate: '',
    official_language: '',
    lgd_code: '',
    is_active: true
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchState(id);
    }
  }, [id, isEditMode]);

  const fetchState = async (stateId: string) => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getStateById(stateId);
      if (response.success && response.data) {
        const state = response.data;
        setFormData({
          name: state.name || '',
          name_hindi: state.name_hindi || '',
          code: state.code || '',
          state_type: state.state_type || 'state',
          capital: state.capital || '',
          zone: (state.zone as ZoneType) || 'north',
          population: state.population?.toString() || '',
          area_sq_km: state.area_sq_km?.toString() || '',
          literacy_rate: state.literacy_rate?.toString() || '',
          official_language: state.official_language || '',
          lgd_code: state.lgd_code || '',
          is_active: state.is_active ?? true
        });
      } else {
        setError('Failed to load state details');
      }
    } catch (err) {
      console.error('Failed to fetch state:', err);
      setError('Unable to load state details. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: CreateStateRequest | UpdateStateRequest = {
        name: formData.name,
        name_hindi: formData.name_hindi || undefined,
        code: formData.code,
        state_type: formData.state_type,
        capital: formData.capital || undefined,
        zone: formData.zone,
        population: formData.population ? parseInt(formData.population) : undefined,
        area_sq_km: formData.area_sq_km ? parseFloat(formData.area_sq_km) : undefined,
        literacy_rate: formData.literacy_rate ? parseFloat(formData.literacy_rate) : undefined,
        official_language: formData.official_language || undefined,
        lgd_code: formData.lgd_code || undefined,
        is_active: formData.is_active
      };

      if (isEditMode && id) {
        await geographyApi.updateState(id, payload);
      } else {
        await geographyApi.createState(payload as CreateStateRequest);
      }
      navigate('/geography/states');
    } catch (err) {
      console.error('Failed to save state:', err);
      setError('Failed to save state. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bm-state-form">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading state details...</p>
        </div>
      </div>
    );
  }

  if (error && isEditMode && !formData.name) {
    return (
      <div className="bm-state-form">
        <PageHeader
          icon={<HiOutlineMap />}
          title="Edit State"
          description="Update state information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/states')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load State</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchState(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-state-form">
      <PageHeader
        icon={<HiOutlineMap />}
        title={isEditMode ? 'Edit State / UT' : 'Add State / UT'}
        description={isEditMode ? 'Update state or union territory information' : 'Add a new state or union territory'}
        actions={
          <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/states')}>
            <HiOutlineArrowLeft />
            <span>Back</span>
          </button>
        }
      />

      <div className="bm-card">
        {error && (
          <div className="bm-form-error">
            <HiOutlineExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bm-form">
          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Basic Information</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="name">Name (English) *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., Karnataka"
                  required
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="name_hindi">Name (Hindi)</label>
                <input
                  type="text"
                  id="name_hindi"
                  name="name_hindi"
                  value={formData.name_hindi}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Enter name in Hindi"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="code">State Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., KA"
                  maxLength={3}
                  required
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="state_type">Type *</label>
                <select
                  id="state_type"
                  name="state_type"
                  value={formData.state_type}
                  onChange={handleChange}
                  className="bm-select"
                  required
                >
                  <option value="state">State</option>
                  <option value="union_territory">Union Territory</option>
                </select>
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="capital">Capital</label>
                <input
                  type="text"
                  id="capital"
                  name="capital"
                  value={formData.capital}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., Bengaluru"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="zone">Zone *</label>
                <select
                  id="zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  className="bm-select"
                  required
                >
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

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Statistics</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="population">Population</label>
                <input
                  type="number"
                  id="population"
                  name="population"
                  value={formData.population}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., 61095297"
                  min="0"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="area_sq_km">Area (sq km)</label>
                <input
                  type="number"
                  id="area_sq_km"
                  name="area_sq_km"
                  value={formData.area_sq_km}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., 191791"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="literacy_rate">Literacy Rate (%)</label>
                <input
                  type="number"
                  id="literacy_rate"
                  name="literacy_rate"
                  value={formData.literacy_rate}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., 75.36"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="official_language">Official Language</label>
                <input
                  type="text"
                  id="official_language"
                  name="official_language"
                  value={formData.official_language}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., Kannada"
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Additional Details</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="lgd_code">LGD Code</label>
                <input
                  type="text"
                  id="lgd_code"
                  name="lgd_code"
                  value={formData.lgd_code}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Local Government Directory Code"
                />
              </div>
              <div className="bm-form-group bm-form-group--checkbox">
                <label className="bm-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="bm-checkbox"
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bm-form-actions">
            <button
              type="button"
              className="bm-btn bm-btn-secondary"
              onClick={() => navigate('/geography/states')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update State' : 'Create State'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StateForm;
