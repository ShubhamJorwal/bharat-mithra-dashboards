import { useState, useEffect, useCallback } from 'react';
import { HiOutlineCloud, HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineStatusOnline } from 'react-icons/hi';
import platformApi from '../../../services/api/platform.api';
import type { ServiceProvider } from '../../../types/api.types';
import '../FieldTemplates/FieldTemplates.scss';
import '../Commissions/Commissions.scss';
import './Providers.scss';

const PROVIDER_TYPES = ['payment_gateway', 'banking_api', 'insurance_api', 'utility_api', 'travel_api', 'identity_api', 'government_portal', 'recharge_api'];

const Providers = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await platformApi.getServiceProviders(filterType || undefined);
      if (response.success && response.data) {
        setProviders(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const providerTypeLabel = (type: string) => type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const providerTypeColors: Record<string, string> = {
    payment_gateway: '#2ed47a',
    banking_api: '#4a9eda',
    insurance_api: '#9b7ae0',
    utility_api: '#d4a010',
    travel_api: '#f09840',
    identity_api: '#e74c3c',
    government_portal: '#1a3c5e',
    recharge_api: '#00bcd4',
  };

  return (
    <div className="bm-providers">
      <div className="bm-page-header">
        <div className="bm-page-header-left">
          <HiOutlineCloud className="bm-page-icon" />
          <div>
            <h1 className="bm-page-title">Service Providers</h1>
            <p className="bm-page-subtitle">External API providers for AEPS, BBPS, recharge, insurance, etc.</p>
          </div>
        </div>
        <button className="bm-btn bm-btn-primary">
          <HiOutlinePlus /> Add Provider
        </button>
      </div>

      <div className="bm-filters-bar">
        <div className="bm-search-box">
          <HiOutlineSearch />
          <input placeholder="Search providers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="bm-filter-chips">
          <button className={`bm-chip ${filterType === '' ? 'bm-chip--active' : ''}`} onClick={() => setFilterType('')}>All</button>
          {PROVIDER_TYPES.map(type => (
            <button key={type} className={`bm-chip ${filterType === type ? 'bm-chip--active' : ''}`} onClick={() => setFilterType(type)}>
              {providerTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      <div className="bm-stats-row">
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{providers.length}</span>
          <span className="bm-stat-mini-label">Total Providers</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{providers.filter(p => p.is_active).length}</span>
          <span className="bm-stat-mini-label">Active</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{providers.filter(p => p.is_sandbox).length}</span>
          <span className="bm-stat-mini-label">Sandbox</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{providers.filter(p => !p.is_sandbox).length}</span>
          <span className="bm-stat-mini-label">Production</span>
        </div>
      </div>

      {loading ? (
        <div className="bm-loading-state">Loading providers...</div>
      ) : (
        <div className="bm-provider-grid">
          {filtered.map(provider => (
            <div key={provider.id} className="bm-provider-card">
              <div className="bm-provider-card-top">
                <div className="bm-provider-info">
                  <h4>{provider.name}</h4>
                  <span className="bm-template-slug">{provider.slug}</span>
                </div>
                <div className="bm-provider-status">
                  <span className={`bm-status-dot ${provider.is_active ? 'bm-status-dot--active' : 'bm-status-dot--inactive'}`} />
                  {provider.is_sandbox ? (
                    <span className="bm-env-badge bm-env-badge--sandbox">Sandbox</span>
                  ) : (
                    <span className="bm-env-badge bm-env-badge--prod">Production</span>
                  )}
                </div>
              </div>

              <div className="bm-provider-type">
                <span className="bm-type-pill" style={{ background: `${providerTypeColors[provider.provider_type] || '#666'}20`, color: providerTypeColors[provider.provider_type] || '#666' }}>
                  {providerTypeLabel(provider.provider_type)}
                </span>
                {provider.auth_type && (
                  <span className="bm-auth-badge">{provider.auth_type.toUpperCase()}</span>
                )}
              </div>

              <div className="bm-provider-details">
                {provider.api_base_url && <p className="bm-provider-url">{provider.api_base_url}</p>}
                {provider.api_version && <span className="bm-version-tag">v{provider.api_version}</span>}
                <span className="bm-priority-tag">Priority: {provider.priority}</span>
              </div>

              <div className="bm-provider-actions">
                <button className="bm-btn-icon" title="Health Check">
                  <HiOutlineStatusOnline />
                </button>
                <button className="bm-btn-icon" title="Edit">
                  <HiOutlinePencil />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bm-empty-state">No service providers found. Add your first provider to enable external integrations.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Providers;
