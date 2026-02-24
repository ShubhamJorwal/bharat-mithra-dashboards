import { useState, useEffect, useCallback } from 'react';
import { HiOutlineCurrencyRupee, HiOutlineSearch, HiOutlinePlus, HiOutlineChartBar } from 'react-icons/hi';
import platformApi from '../../../services/api/platform.api';
import type { CommissionSlab, CommissionTransaction, CommissionSummary } from '../../../types/api.types';
import '../FieldTemplates/FieldTemplates.scss';
import './Commissions.scss';

const Commissions = () => {
  const [activeTab, setActiveTab] = useState<'slabs' | 'transactions' | 'summary'>('slabs');
  const [slabs, setSlabs] = useState<CommissionSlab[]>([]);
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSlabs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await platformApi.getCommissionSlabs();
      if (response.success && response.data) {
        setSlabs(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch slabs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await platformApi.getCommissionTransactions({ page: 1, per_page: 50 });
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await platformApi.getCommissionSummary('');
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch commission summary:', err);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    if (activeTab === 'slabs') fetchSlabs();
    else if (activeTab === 'transactions') fetchTransactions();
  }, [activeTab, fetchSlabs, fetchTransactions, fetchSummary]);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const slabTypeColors: Record<string, string> = {
    flat: '#2ed47a',
    percentage: '#4a9eda',
    tiered: '#d4a010',
  };

  const statusColors: Record<string, string> = {
    pending: '#d4a010',
    approved: '#2ed47a',
    paid: '#4a9eda',
    rejected: '#e74c3c',
    reversed: '#9b7ae0',
  };

  return (
    <div className="bm-commissions">
      <div className="bm-page-header">
        <div className="bm-page-header-left">
          <HiOutlineCurrencyRupee className="bm-page-icon" />
          <div>
            <h1 className="bm-page-title">Commission Management</h1>
            <p className="bm-page-subtitle">Configure commission slabs and track agent earnings</p>
          </div>
        </div>
        <button className="bm-btn bm-btn-primary">
          <HiOutlinePlus /> Create Slab
        </button>
      </div>

      <div className="bm-tabs">
        <button className={`bm-tab ${activeTab === 'slabs' ? 'bm-tab--active' : ''}`} onClick={() => setActiveTab('slabs')}>
          <HiOutlineCurrencyRupee /> Commission Slabs
        </button>
        <button className={`bm-tab ${activeTab === 'transactions' ? 'bm-tab--active' : ''}`} onClick={() => setActiveTab('transactions')}>
          <HiOutlineChartBar /> Transactions
        </button>
      </div>

      {loading ? (
        <div className="bm-loading-state">Loading...</div>
      ) : activeTab === 'slabs' ? (
        <div className="bm-slabs-section">
          <div className="bm-search-box" style={{ marginBottom: 16 }}>
            <HiOutlineSearch />
            <input placeholder="Search slabs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          <div className="bm-slabs-table-wrapper">
            <table className="bm-data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Service/Category</th>
                  <th>Commission</th>
                  <th>Agent Type</th>
                  <th>Valid From</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {slabs.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(slab => (
                  <tr key={slab.id}>
                    <td className="bm-td-name">{slab.name}</td>
                    <td>
                      <span className="bm-type-pill" style={{ background: `${slabTypeColors[slab.slab_type]}20`, color: slabTypeColors[slab.slab_type] }}>
                        {slab.slab_type}
                      </span>
                    </td>
                    <td>{slab.service_name || slab.category_name || 'All'}</td>
                    <td className="bm-td-amount">
                      {slab.slab_type === 'flat' ? formatCurrency(slab.commission_amount) :
                       slab.slab_type === 'percentage' ? `${slab.commission_percent}%` :
                       'Tiered'}
                    </td>
                    <td>{slab.agent_type || 'All'}</td>
                    <td>{slab.valid_from}</td>
                    <td>
                      <span className={`bm-status-dot ${slab.is_active ? 'bm-status-dot--active' : 'bm-status-dot--inactive'}`} />
                      {slab.is_active ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))}
                {slabs.length === 0 && (
                  <tr><td colSpan={7} className="bm-td-empty">No commission slabs configured yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bm-txns-section">
          {summary && (
            <div className="bm-stats-row">
              <div className="bm-stat-mini"><span className="bm-stat-mini-value">{formatCurrency(summary.total_earned)}</span><span className="bm-stat-mini-label">Total Earned</span></div>
              <div className="bm-stat-mini"><span className="bm-stat-mini-value">{formatCurrency(summary.total_pending)}</span><span className="bm-stat-mini-label">Pending</span></div>
              <div className="bm-stat-mini"><span className="bm-stat-mini-value">{formatCurrency(summary.total_paid)}</span><span className="bm-stat-mini-label">Paid Out</span></div>
              <div className="bm-stat-mini"><span className="bm-stat-mini-value">{summary.total_transactions}</span><span className="bm-stat-mini-label">Transactions</span></div>
            </div>
          )}

          <div className="bm-slabs-table-wrapper">
            <table className="bm-data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Service</th>
                  <th>Transaction Amt</th>
                  <th>Commission</th>
                  <th>TDS</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id}>
                    <td><code>{txn.application_number || '—'}</code></td>
                    <td>{txn.service_name || '—'}</td>
                    <td>{formatCurrency(txn.transaction_amount)}</td>
                    <td className="bm-td-amount">{formatCurrency(txn.commission_amount)}</td>
                    <td>{formatCurrency(txn.tds_amount)}</td>
                    <td className="bm-td-amount">{formatCurrency(txn.net_amount)}</td>
                    <td>
                      <span className="bm-type-pill" style={{ background: `${statusColors[txn.status] || '#666'}20`, color: statusColors[txn.status] || '#666' }}>
                        {txn.status}
                      </span>
                    </td>
                    <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={8} className="bm-td-empty">No commission transactions yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commissions;
