import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineUserGroup,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { State, District, Taluk, CreateGramPanchayatRequest, UpdateGramPanchayatRequest } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './GramPanchayatForm.scss';

interface GPFormData {
  name: string;
  name_hindi: string;
  code: string;
  state_id: string;
  district_id: string;
  taluk_id: string;
  sarpanch_name: string;
  sarpanch_mobile: string;
  population: string;
  households: string;
  pin_code: string;
  lgd_code: string;
  is_active: boolean;
}

const GramPanchayatForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [formData, setFormData] = useState<GPFormData>({
    name: '',
    name_hindi: '',
    code: '',
    state_id: '',
    district_id: '',
    taluk_id: '',
    sarpanch_name: '',
    sarpanch_mobile: '',
    population: '',
    households: '',
    pin_code: '',
    lgd_code: '',
    is_active: true
  });

  useEffect(() => {
    fetchStates();
    if (isEditMode && id) {
      fetchGramPanchayat(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (formData.state_id) {
      fetchDistricts(formData.state_id);
    } else {
      setDistricts([]);
      setTaluks([]);
    }
  }, [formData.state_id]);

  useEffect(() => {
    if (formData.district_id) {
      fetchTaluks(formData.district_id);
    } else {
      setTaluks([]);
    }
  }, [formData.district_id]);

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

  const fetchTaluks = async (districtId: string) => {
    try {
      const response = await geographyApi.getTaluks({ district_id: districtId, per_page: 100 });
      if (response.success && response.data) setTaluks(response.data);
    } catch (err) {
      console.error('Failed to fetch taluks:', err);
    }
  };

  const fetchGramPanchayat = async (gpId: string) => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getGramPanchayatById(gpId);
      if (response.success && response.data) {
        const gp = response.data;
        setFormData({
          name: gp.name || '',
          name_hindi: gp.name_hindi || '',
          code: gp.code || '',
          state_id: gp.state_id || '',
          district_id: gp.district_id || '',
          taluk_id: gp.taluk_id || '',
          sarpanch_name: gp.sarpanch_name || '',
          sarpanch_mobile: gp.sarpanch_mobile || '',
          population: gp.population?.toString() || '',
          households: gp.households?.toString() || '',
          pin_code: gp.pin_code || '',
          lgd_code: gp.lgd_code || '',
          is_active: gp.is_active ?? true
        });
      } else {
        setError('Failed to load gram panchayat details');
      }
    } catch (err) {
      console.error('Failed to fetch gram panchayat:', err);
      setError('Unable to load gram panchayat details. Please try again.');
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
        setFormData(prev => ({ ...prev, district_id: '', taluk_id: '' }));
      }
      if (name === 'district_id') {
        setFormData(prev => ({ ...prev, taluk_id: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: CreateGramPanchayatRequest | UpdateGramPanchayatRequest = {
        name: formData.name,
        name_hindi: formData.name_hindi || undefined,
        code: formData.code,
        state_id: formData.state_id,
        district_id: formData.district_id,
        taluk_id: formData.taluk_id,
        sarpanch_name: formData.sarpanch_name || undefined,
        sarpanch_mobile: formData.sarpanch_mobile || undefined,
        population: formData.population ? parseInt(formData.population) : undefined,
        households: formData.households ? parseInt(formData.households) : undefined,
        pin_code: formData.pin_code || undefined,
        lgd_code: formData.lgd_code || undefined,
        is_active: formData.is_active
      };

      if (isEditMode && id) {
        await geographyApi.updateGramPanchayat(id, payload);
      } else {
        await geographyApi.createGramPanchayat(payload as CreateGramPanchayatRequest);
      }
      navigate('/geography/gram-panchayats');
    } catch (err) {
      console.error('Failed to save gram panchayat:', err);
      setError('Failed to save gram panchayat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bm-gp-form">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading gram panchayat details...</p>
        </div>
      </div>
    );
  }

  if (error && isEditMode && !formData.name) {
    return (
      <div className="bm-gp-form">
        <PageHeader
          icon={<HiOutlineUserGroup />}
          title="Edit Gram Panchayat"
          description="Update gram panchayat information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/gram-panchayats')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Gram Panchayat</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchGramPanchayat(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-gp-form">
      <PageHeader
        icon={<HiOutlineUserGroup />}
        title={isEditMode ? 'Edit Gram Panchayat' : 'Add Gram Panchayat'}
        description={isEditMode ? 'Update gram panchayat information' : 'Add a new gram panchayat'}
        actions={
          <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/gram-panchayats')}>
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
                  placeholder="e.g., Jigani"
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
                  placeholder="e.g., जिगनी"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="code">GP Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., JGN001"
                  required
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="pin_code">PIN Code</label>
                <input
                  type="text"
                  id="pin_code"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., 560105"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Location Hierarchy</h3>
            <div className="bm-form-grid">
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
                <label className="bm-label" htmlFor="taluk_id">Taluk *</label>
                <select
                  id="taluk_id"
                  name="taluk_id"
                  value={formData.taluk_id}
                  onChange={handleChange}
                  className="bm-select"
                  required
                  disabled={!formData.district_id}
                >
                  <option value="">Select Taluk</option>
                  {taluks.map(taluk => (
                    <option key={taluk.id} value={taluk.id}>{taluk.name}</option>
                  ))}
                </select>
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
            <h3 className="bm-form-section-title">Sarpanch Details</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="sarpanch_name">Sarpanch Name</label>
                <input
                  type="text"
                  id="sarpanch_name"
                  name="sarpanch_name"
                  value={formData.sarpanch_name}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Name of Sarpanch"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="sarpanch_mobile">Sarpanch Mobile</label>
                <input
                  type="tel"
                  id="sarpanch_mobile"
                  name="sarpanch_mobile"
                  value={formData.sarpanch_mobile}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="bm-form-section">
            <h3 className="bm-form-section-title">Demographics</h3>
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
                  placeholder="e.g., 5000"
                  min="0"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="households">Households</label>
                <input
                  type="number"
                  id="households"
                  name="households"
                  value={formData.households}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., 1200"
                  min="0"
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
              onClick={() => navigate('/geography/gram-panchayats')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update GP' : 'Create GP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GramPanchayatForm;
