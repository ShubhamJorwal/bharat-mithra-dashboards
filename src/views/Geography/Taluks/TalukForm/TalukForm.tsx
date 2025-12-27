import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { State, District, CreateTalukRequest, UpdateTalukRequest } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './TalukForm.scss';

interface TalukFormData {
  name: string;
  name_hindi: string;
  code: string;
  state_id: string;
  district_id: string;
  headquarters: string;
  population: string;
  area_sq_km: string;
  lgd_code: string;
  is_active: boolean;
}

const TalukForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [formData, setFormData] = useState<TalukFormData>({
    name: '',
    name_hindi: '',
    code: '',
    state_id: '',
    district_id: '',
    headquarters: '',
    population: '',
    area_sq_km: '',
    lgd_code: '',
    is_active: true
  });

  useEffect(() => {
    fetchStates();
    if (isEditMode && id) {
      fetchTaluk(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (formData.state_id) {
      fetchDistricts(formData.state_id);
    } else {
      setDistricts([]);
    }
  }, [formData.state_id]);

  const fetchStates = async () => {
    try {
      const response = await geographyApi.getStates({ per_page: 100 });
      if (response.success && response.data) setStates(response.data);
    } catch (err) {
      console.error('Failed to fetch states:', err);
    }
  };

  const fetchDistricts = async (stateId: string) => {
    try {
      const response = await geographyApi.getDistricts({ state_id: stateId, per_page: 100 });
      if (response.success && response.data) setDistricts(response.data);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    }
  };

  const fetchTaluk = async (talukId: string) => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getTalukById(talukId);
      if (response.success && response.data) {
        const taluk = response.data;
        setFormData({
          name: taluk.name || '',
          name_hindi: taluk.name_hindi || '',
          code: taluk.code || '',
          state_id: taluk.state_id || '',
          district_id: taluk.district_id || '',
          headquarters: taluk.headquarters || '',
          population: taluk.population?.toString() || '',
          area_sq_km: taluk.area_sq_km?.toString() || '',
          lgd_code: taluk.lgd_code || '',
          is_active: taluk.is_active ?? true
        });
      } else {
        setError('Failed to load taluk details');
      }
    } catch (err) {
      console.error('Failed to fetch taluk:', err);
      setError('Unable to load taluk details. Please try again.');
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
      if (name === 'state_id') {
        setFormData(prev => ({ ...prev, district_id: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: CreateTalukRequest | UpdateTalukRequest = {
        name: formData.name,
        name_hindi: formData.name_hindi || undefined,
        code: formData.code,
        state_id: formData.state_id,
        district_id: formData.district_id,
        headquarters: formData.headquarters || undefined,
        population: formData.population ? parseInt(formData.population) : undefined,
        area_sq_km: formData.area_sq_km ? parseFloat(formData.area_sq_km) : undefined,
        lgd_code: formData.lgd_code || undefined,
        is_active: formData.is_active
      };

      if (isEditMode && id) {
        await geographyApi.updateTaluk(id, payload);
      } else {
        await geographyApi.createTaluk(payload as CreateTalukRequest);
      }
      navigate('/geography/taluks');
    } catch (err) {
      console.error('Failed to save taluk:', err);
      setError('Failed to save taluk. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bm-taluk-form">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading taluk details...</p>
        </div>
      </div>
    );
  }

  if (error && isEditMode && !formData.name) {
    return (
      <div className="bm-taluk-form">
        <PageHeader
          icon={<HiOutlineLocationMarker />}
          title="Edit Taluk"
          description="Update taluk information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/taluks')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Taluk</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchTaluk(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-taluk-form">
      <PageHeader
        icon={<HiOutlineLocationMarker />}
        title={isEditMode ? 'Edit Taluk' : 'Add Taluk'}
        description={isEditMode ? 'Update taluk information' : 'Add a new taluk / tehsil / mandal'}
        actions={
          <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/taluks')}>
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
                  placeholder="e.g., Anekal"
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
                <label className="bm-label" htmlFor="code">Taluk Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., ANK"
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
                <label className="bm-label" htmlFor="district_id">District *</label>
                <select
                  id="district_id"
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  className="bm-select"
                  required
                  disabled={!formData.state_id}
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
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
                  placeholder="Taluk headquarters"
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Statistics & Status</h3>
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
                  placeholder="e.g., 250000"
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
                  placeholder="e.g., 650"
                  min="0"
                  step="0.01"
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
              onClick={() => navigate('/geography/taluks')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Taluk' : 'Create Taluk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TalukForm;
