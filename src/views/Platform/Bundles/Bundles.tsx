import { useState, useEffect, useCallback } from 'react';
import { HiOutlineCollection, HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineStar } from 'react-icons/hi';
import platformApi from '../../../services/api/platform.api';
import type { ServiceBundle } from '../../../types/api.types';
import '../FieldTemplates/FieldTemplates.scss';
import './Bundles.scss';

const Bundles = () => {
  const [bundles, setBundles] = useState<ServiceBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await platformApi.getServiceBundles();
      if (response.success && response.data) {
        setBundles(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch bundles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const filtered = bundles.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const audienceColors: Record<string, string> = {
    individual: '#4a9eda',
    business: '#1a3c5e',
    farmer: '#2ed47a',
    student: '#9b7ae0',
    all: '#d4a010',
  };

  return (
    <div className="bm-bundles">
      <div className="bm-page-header">
        <div className="bm-page-header-left">
          <HiOutlineCollection className="bm-page-icon" />
          <div>
            <h1 className="bm-page-title">Service Bundles</h1>
            <p className="bm-page-subtitle">Combo packages with discounted pricing for multiple services</p>
          </div>
        </div>
        <button className="bm-btn bm-btn-primary">
          <HiOutlinePlus /> Create Bundle
        </button>
      </div>

      <div className="bm-filters-bar">
        <div className="bm-search-box">
          <HiOutlineSearch />
          <input placeholder="Search bundles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="bm-stats-row">
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{bundles.length}</span>
          <span className="bm-stat-mini-label">Total Bundles</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{bundles.filter(b => b.is_featured).length}</span>
          <span className="bm-stat-mini-label">Featured</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{bundles.filter(b => b.is_active).length}</span>
          <span className="bm-stat-mini-label">Active</span>
        </div>
        <div className="bm-stat-mini">
          <span className="bm-stat-mini-value">{bundles.reduce((s, b) => s + b.service_ids.length, 0)}</span>
          <span className="bm-stat-mini-label">Services Included</span>
        </div>
      </div>

      {loading ? (
        <div className="bm-loading-state">Loading bundles...</div>
      ) : (
        <div className="bm-bundle-grid">
          {filtered.map(bundle => (
            <div key={bundle.id} className="bm-bundle-card">
              {bundle.is_featured && (
                <div className="bm-bundle-featured">
                  <HiOutlineStar /> Featured
                </div>
              )}
              <div className="bm-bundle-card-header">
                <h4>{bundle.name}</h4>
                {bundle.name_hindi && <span className="bm-bundle-hindi">{bundle.name_hindi}</span>}
              </div>
              <p className="bm-bundle-desc">{bundle.description || 'No description'}</p>

              <div className="bm-bundle-pricing">
                <div className="bm-bundle-price-original">{formatCurrency(bundle.original_price)}</div>
                <div className="bm-bundle-price-current">{formatCurrency(bundle.bundle_price)}</div>
                {bundle.discount_percent && (
                  <span className="bm-bundle-discount">{bundle.discount_percent}% OFF</span>
                )}
              </div>

              <div className="bm-bundle-meta">
                <span className="bm-bundle-services-count">{bundle.service_ids.length} services</span>
                {bundle.target_audience && (
                  <span className="bm-type-pill" style={{ background: `${audienceColors[bundle.target_audience] || '#666'}20`, color: audienceColors[bundle.target_audience] || '#666' }}>
                    {bundle.target_audience}
                  </span>
                )}
                <span className={`bm-status-dot ${bundle.is_active ? 'bm-status-dot--active' : 'bm-status-dot--inactive'}`} />
              </div>

              <div className="bm-bundle-actions">
                <button className="bm-btn-icon" title="Edit">
                  <HiOutlinePencil />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bm-empty-state">No service bundles found. Create your first bundle to offer discounted packages.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bundles;
