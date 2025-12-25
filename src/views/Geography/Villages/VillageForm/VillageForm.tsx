import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineHome,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import geographyApi from '../../../../services/api/geography.api';
import type { State, District, Taluk, GramPanchayat, CreateVillageRequest, UpdateVillageRequest } from '../../../../types/api.types';
import { PageHeader } from '../../../../components/common/PageHeader';
import './VillageForm.scss';

interface VillageFormData {
  name: string;
  name_hindi: string;
  code: string;
  state_id: string;
  district_id: string;
  taluk_id: string;
  gram_panchayat_id: string;
  village_head_name: string;
  village_head_mobile: string;
  population: string;
  households: string;
  area_hectares: string;
  pin_code: string;
  lgd_code: string;
  is_active: boolean;
}

const VillageForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [formData, setFormData] = useState<VillageFormData>({
    name: '',
    name_hindi: '',
    code: '',
    state_id: '',
    district_id: '',
    taluk_id: '',
    gram_panchayat_id: '',
    village_head_name: '',
    village_head_mobile: '',
    population: '',
    households: '',
    area_hectares: '',
    pin_code: '',
    lgd_code: '',
    is_active: true
  });

  useEffect(() => {
    fetchStates();
    if (isEditMode && id) {
      fetchVillage(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (formData.state_id) {
      fetchDistricts(formData.state_id);
    } else {
      setDistricts([]);
      setTaluks([]);
      setGramPanchayats([]);
    }
  }, [formData.state_id]);

  useEffect(() => {
    if (formData.district_id) {
      fetchTaluks(formData.district_id);
    } else {
      setTaluks([]);
      setGramPanchayats([]);
    }
  }, [formData.district_id]);

  useEffect(() => {
    if (formData.taluk_id) {
      fetchGramPanchayats(formData.taluk_id);
    } else {
      setGramPanchayats([]);
    }
  }, [formData.taluk_id]);

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

  const fetchGramPanchayats = async (talukId: string) => {
    try {
      const response = await geographyApi.getGramPanchayats({ taluk_id: talukId, per_page: 100 });
      if (response.success && response.data) setGramPanchayats(response.data);
    } catch (err) {
      console.error('Failed to fetch gram panchayats:', err);
    }
  };

  const fetchVillage = async (villageId: string) => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getVillageById(villageId);
      if (response.success && response.data) {
        const village = response.data;
        setFormData({
          name: village.name || '',
          name_hindi: village.name_hindi || '',
          code: village.code || '',
          state_id: village.state_id || '',
          district_id: village.district_id || '',
          taluk_id: village.taluk_id || '',
          gram_panchayat_id: village.gram_panchayat_id || '',
          village_head_name: village.village_head_name || '',
          village_head_mobile: village.village_head_mobile || '',
          population: village.population?.toString() || '',
          households: village.households?.toString() || '',
          area_hectares: village.area_hectares?.toString() || '',
          pin_code: village.pin_code || '',
          lgd_code: village.lgd_code || '',
          is_active: village.is_active ?? true
        });
      } else {
        setError('Failed to load village details');
      }
    } catch (err) {
      console.error('Failed to fetch village:', err);
      setError('Unable to load village details. Please try again.');
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
        setFormData(prev => ({ ...prev, district_id: '', taluk_id: '', gram_panchayat_id: '' }));
      }
      if (name === 'district_id') {
        setFormData(prev => ({ ...prev, taluk_id: '', gram_panchayat_id: '' }));
      }
      if (name === 'taluk_id') {
        setFormData(prev => ({ ...prev, gram_panchayat_id: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: CreateVillageRequest | UpdateVillageRequest = {
        name: formData.name,
        name_hindi: formData.name_hindi || undefined,
        code: formData.code,
        state_id: formData.state_id,
        district_id: formData.district_id,
        taluk_id: formData.taluk_id,
        gram_panchayat_id: formData.gram_panchayat_id,
        village_head_name: formData.village_head_name || undefined,
        village_head_mobile: formData.village_head_mobile || undefined,
        population: formData.population ? parseInt(formData.population) : undefined,
        households: formData.households ? parseInt(formData.households) : undefined,
        area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : undefined,
        pin_code: formData.pin_code || undefined,
        lgd_code: formData.lgd_code || undefined,
        is_active: formData.is_active
      };

      if (isEditMode && id) {
        await geographyApi.updateVillage(id, payload);
      } else {
        await geographyApi.createVillage(payload as CreateVillageRequest);
      }
      navigate('/geography/villages');
    } catch (err) {
      console.error('Failed to save village:', err);
      setError('Failed to save village. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bm-village-form">
        <div className="bm-loading-state">
          <div className="bm-loading-spinner"></div>
          <p>Loading village details...</p>
        </div>
      </div>
    );
  }

  if (error && isEditMode && !formData.name) {
    return (
      <div className="bm-village-form">
        <PageHeader
          icon={<HiOutlineHome />}
          title="Edit Village"
          description="Update village information"
          actions={
            <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/villages')}>
              <HiOutlineArrowLeft />
              <span>Back</span>
            </button>
          }
        />
        <div className="bm-card">
          <div className="bm-error-state">
            <HiOutlineExclamationCircle className="bm-error-icon" />
            <h3>Unable to Load Village</h3>
            <p>{error}</p>
            <button className="bm-btn bm-btn-primary" onClick={() => id && fetchVillage(id)}>
              <HiOutlineRefresh />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-village-form">
      <PageHeader
        icon={<HiOutlineHome />}
        title={isEditMode ? 'Edit Village' : 'Add Village'}
        description={isEditMode ? 'Update village information' : 'Add a new village'}
        actions={
          <button className="bm-btn bm-btn-secondary" onClick={() => navigate('/geography/villages')}>
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
                  placeholder="e.g., Bommasandra"
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
                  placeholder="e.g., बोम्मसंद्र"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="code">Village Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., BMS001"
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
                  placeholder="e.g., 560099"
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
                <label className="bm-label" htmlFor="gram_panchayat_id">Gram Panchayat *</label>
                <select
                  id="gram_panchayat_id"
                  name="gram_panchayat_id"
                  value={formData.gram_panchayat_id}
                  onChange={handleChange}
                  className="bm-select"
                  required
                  disabled={!formData.taluk_id}
                >
                  <option value="">Select Gram Panchayat</option>
                  {gramPanchayats.map(gp => (
                    <option key={gp.id} value={gp.id}>{gp.name}</option>
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
            <h3 className="bm-form-section-title">Village Head Details</h3>
            <div className="bm-form-grid">
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="village_head_name">Village Head Name</label>
                <input
                  type="text"
                  id="village_head_name"
                  name="village_head_name"
                  value={formData.village_head_name}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="Name of Village Head"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="village_head_mobile">Village Head Mobile</label>
                <input
                  type="tel"
                  id="village_head_mobile"
                  name="village_head_mobile"
                  value={formData.village_head_mobile}
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
                  placeholder="e.g., 2500"
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
                  placeholder="e.g., 500"
                  min="0"
                />
              </div>
              <div className="bm-form-group">
                <label className="bm-label" htmlFor="area_hectares">Area (Hectares)</label>
                <input
                  type="number"
                  id="area_hectares"
                  name="area_hectares"
                  value={formData.area_hectares}
                  onChange={handleChange}
                  className="bm-input"
                  placeholder="e.g., 150"
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
              onClick={() => navigate('/geography/villages')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bm-btn bm-btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Village' : 'Create Village'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VillageForm;
