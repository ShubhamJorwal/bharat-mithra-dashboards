import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { State, CreateDistrictRequest, UpdateDistrictRequest } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './DistrictForm.scss';

interface DistrictFormData {
  name: string;
  name_hindi: string;
  code: string;
  state_id: string;
  headquarters: string;
  population: string;
  area_sq_km: string;
  lgd_code: string;
  is_active: boolean;
}

const DistrictForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [formData, setFormData] = useState<DistrictFormData>({
    name: '',
    name_hindi: '',
    code: '',
    state_id: '',
    headquarters: '',
    population: '',
    area_sq_km: '',
    lgd_code: '',
    is_active: true
  });

  useEffect(() => {
    fetchStates();
    if (isEditMode && id) {
      fetchDistrict(id);
    }
  }, [id, isEditMode]);

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

  const fetchDistrict = async (districtId: string) => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getDistrictById(districtId);
      if (response.success && response.data) {
        const district = response.data;
        setFormData({
          name: district.name || '',
          name_hindi: district.name_hindi || '',
          code: district.code || '',
          state_id: district.state_id || '',
          headquarters: district.headquarters || '',
          population: district.population?.toString() || '',
          area_sq_km: district.area_sq_km?.toString() || '',
          lgd_code: district.lgd_code || '',
          is_active: district.is_active ?? true
        });
      } else {
        setError('Failed to load district details');
      }
    } catch (err) {
      console.error('Failed to fetch district:', err);
      setError('Unable to load district details. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const payload: CreateDistrictRequest | UpdateDistrictRequest = {
        name: formData.name,
        name_hindi: formData.name_hindi || undefined,
        code: formData.code,
        state_id: formData.state_id,
        headquarters: formData.headquarters || undefined,
        population: formData.population ? parseInt(formData.population) : undefined,
        area_sq_km: formData.area_sq_km ? parseFloat(formData.area_sq_km) : undefined,
        lgd_code: formData.lgd_code || undefined,
        is_active: formData.is_active
      };

      if (isEditMode && id) {
        await geographyApi.updateDistrict(id, payload);
      } else {
        await geographyApi.createDistrict(payload as CreateDistrictRequest);
      }
      navigate('/geography/districts');
    } catch (err) {
      console.error('Failed to save district:', err);
      setError('Failed to save district. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bm-district-form">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading district details...</p>
        </div>
      </div>
    );
  }

  if (error && isEditMode && !formData.name) {
    return (
      <div className="bm-district-form">
        <PageHeader
          icon={<HiOutlineOfficeBuilding />}
          title="Edit District"
          description="Update district information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/districts')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load District</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchDistrict(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-district-form">
      <PageHeader
        icon={<HiOutlineOfficeBuilding />}
        title={isEditMode ? 'Edit District' : 'Add District'}
        description={isEditMode ? 'Update district information' : 'Add a new district'}
        actions={
          <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/districts')}>
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
                  placeholder="e.g., Bengaluru Urban"
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
                  placeholder="e.g., बेंगलुरु अर्बन"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="code">District Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., BLR"
                  required
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="state_id">State / UT *</label>
                <select
                  id="state_id"
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleChange}
                  className="bm-select"
                  required
                >
                  <option value="">Select State / UT</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="headquarters">Headquarters</label>
                <input
                  type="text"
                  id="headquarters"
                  name="headquarters"
                  value={formData.headquarters}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., Bengaluru"
                />
              </div>
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
                  placeholder="e.g., 9621551"
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
                  placeholder="e.g., 2196"
                  min="0"
                  step="0.01"
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
              onClick={() => navigate('/geography/districts')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update District' : 'Create District'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DistrictForm;
