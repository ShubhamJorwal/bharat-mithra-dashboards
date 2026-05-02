import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCash, HiOutlineSearch, HiOutlineFilter, HiOutlineRefresh,
  HiOutlineDownload, HiOutlineX, HiOutlineCheck, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineExclamationCircle, HiOutlineArrowDown,
  HiOutlineArrowUp, HiOutlineEye,
  HiOutlineSortDescending, HiOutlineSortAscending, HiOutlineChevronLeft,
  HiOutlineChevronRight, HiOutlinePause,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import {
  loadTransactions, computeSnapshot, subscribe,
  approveTopUpRequest, rejectTopUpRequest,
  type WalletTransaction, type TxnStatus, type TxnCategory, type TxnType,
} from '@/services/wallet/walletStore';
import './Transactions.scss';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const fmtFullDate = (s: string) => new Date(s).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});
const fmtShort = (s: string) => new Date(s).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});
const fmtTime = (s: string) => new Date(s).toLocaleTimeString('en-IN', {
  hour: '2-digit', minute: '2-digit',
});

const STATUS_OPTIONS: { v: TxnStatus | 'all'; label: string }[] = [
  { v: 'all',        label: 'All status'  },
  { v: 'success',    label: 'Success'     },
  { v: 'pending',    label: 'Pending'     },
  { v: 'processing', label: 'Processing'  },
  { v: 'failed',     label: 'Failed'      },
  { v: 'reversed',   label: 'Reversed'    },
  { v: 'hold',       label: 'On hold'     },
];

const CATEGORY_OPTIONS: { v: TxnCategory | 'all'; label: string }[] = [
  { v: 'all',             label: 'All categories' },
  { v: 'top_up',          label: 'Top-up'          },
  { v: 'top_up_request',  label: 'Manual top-up'   },
  { v: 'service_fee',     label: 'Service fee'     },
  { v: 'commission',      label: 'Commission'      },
  { v: 'refund',          label: 'Refund'          },
  { v: 'withdrawal',      label: 'Withdrawal'      },
  { v: 'adjustment',      label: 'Adjustment'      },
  { v: 'reversal',        label: 'Reversal'        },
];

const TYPE_OPTIONS: { v: TxnType | 'all'; label: string }[] = [
  { v: 'all',     label: 'All types' },
  { v: 'credit',  label: 'Credits'   },
  { v: 'debit',   label: 'Debits'    },
  { v: 'request', label: 'Requests'  },
];

const DATE_PRESETS = [
  { v: 'all',     label: 'All time'  },
  { v: 'today',   label: 'Today'     },
  { v: '7d',      label: 'Last 7 days'  },
  { v: '30d',     label: 'Last 30 days' },
  { v: '90d',     label: 'Last 90 days' },
  { v: 'custom',  label: 'Custom range' },
];

type SortField = 'createdAt' | 'amount' | 'status';

const Transactions = () => {
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selected, setSelected] = useState<WalletTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const refresh = () => setTxns(loadTransactions());

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, []);

  const snap = useMemo(() => computeSnapshot(txns), [txns]);

  // Apply filters
  const filtered = useMemo(() => {
    let data = [...txns];

    // Status
    if (statusFilter !== 'all') data = data.filter(t => t.status === statusFilter);
    if (categoryFilter !== 'all') data = data.filter(t => t.category === categoryFilter);
    if (typeFilter !== 'all') data = data.filter(t => t.type === typeFilter);

    // Date preset
    if (datePreset !== 'all' && datePreset !== 'custom') {
      const now = Date.now();
      const day = 86_400_000;
      let cutoff = 0;
      if (datePreset === 'today') {
        const t = new Date(); t.setHours(0,0,0,0); cutoff = t.getTime();
      }
      else if (datePreset === '7d') cutoff = now - 7 * day;
      else if (datePreset === '30d') cutoff = now - 30 * day;
      else if (datePreset === '90d') cutoff = now - 90 * day;
      data = data.filter(t => new Date(t.createdAt).getTime() >= cutoff);
    }
    if (datePreset === 'custom') {
      if (dateFrom) {
        const f = new Date(dateFrom).getTime();
        data = data.filter(t => new Date(t.createdAt).getTime() >= f);
      }
      if (dateTo) {
        const ts = new Date(dateTo); ts.setHours(23,59,59,999);
        data = data.filter(t => new Date(t.createdAt).getTime() <= ts.getTime());
      }
    }

    // Amount range
    if (minAmount) {
      const m = parseFloat(minAmount);
      if (!Number.isNaN(m)) data = data.filter(t => t.amount >= m);
    }
    if (maxAmount) {
      const m = parseFloat(maxAmount);
      if (!Number.isNaN(m)) data = data.filter(t => t.amount <= m);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.gatewayRef?.toLowerCase().includes(q) ||
        t.utr?.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.serviceName?.toLowerCase().includes(q) ||
        t.serviceCode?.toLowerCase().includes(q) ||
        t.paymentMethodLabel?.toLowerCase().includes(q)
      );
    }

    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'createdAt')
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === 'amount')
        cmp = a.amount - b.amount;
      else if (sortField === 'status')
        cmp = a.status.localeCompare(b.status);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return data;
  }, [txns, statusFilter, categoryFilter, typeFilter, datePreset, dateFrom, dateTo, minAmount, maxAmount, search, sortField, sortDir]);

  // Aggregate stats for filtered set
  const filteredStats = useMemo(() => {
    let credits = 0, debits = 0;
    let creditsCount = 0, debitsCount = 0;
    for (const t of filtered) {
      if (t.status !== 'success') continue;
      if (t.type === 'credit') { credits += t.amount; creditsCount++; }
      if (t.type === 'debit') { debits += t.amount; debitsCount++; }
    }
    return { credits, debits, creditsCount, debitsCount, net: credits - debits };
  }, [filtered]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter, typeFilter, datePreset, dateFrom, dateTo, minAmount, maxAmount, perPage]);

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('desc'); }
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); setTypeFilter('all');
    setDatePreset('all'); setDateFrom(''); setDateTo('');
    setMinAmount(''); setMaxAmount('');
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (typeFilter !== 'all' ? 1 : 0) +
    (datePreset !== 'all' ? 1 : 0) +
    (minAmount ? 1 : 0) +
    (maxAmount ? 1 : 0);

  const handleExportCSV = () => {
    const rows = [
      ['Txn ID','Reference','Type','Category','Amount (INR)','Status','Description','Service','Method','Gateway Ref','UTR','Created at'],
      ...filtered.map(t => [
        t.id, t.reference, t.type, t.category, t.amount.toFixed(2), t.status,
        t.description.replace(/"/g, '""'),
        t.serviceName || '',
        t.paymentMethodLabel || '',
        t.gatewayRef || '',
        t.utr || '',
        t.createdAt,
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bm-wallet-transactions-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="bm-txns-page">
      <PageHeader
        icon={<HiOutlineCash />}
        title="Transactions"
        description={`${snap.balance > 0 ? `Balance ${formatINR(snap.balance)} · ` : ''}Complete wallet history with filters and export.`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bm-btn" onClick={refresh}>
              <HiOutlineRefresh /> Refresh
            </button>
            <button className="bm-btn" onClick={handleExportCSV} disabled={filtered.length === 0}>
              <HiOutlineDownload /> Export CSV
            </button>
            <Link to="/wallet" className="bm-btn bm-btn-primary">
              <HiOutlineCash /> Wallet
            </Link>
          </div>
        }
      />

      {/* Aggregate strip */}
      <div className="bm-txns-aggregate">
        <div className="bm-txns-agg-card">
          <span className="bm-txns-agg-label">Showing</span>
          <span className="bm-txns-agg-value">{filtered.length}</span>
          <span className="bm-txns-agg-sub">of {txns.length} txns</span>
        </div>
        <div className="bm-txns-agg-card credit">
          <span className="bm-txns-agg-label"><HiOutlineArrowDown /> Credits</span>
          <span className="bm-txns-agg-value">{formatINR(filteredStats.credits)}</span>
          <span className="bm-txns-agg-sub">{filteredStats.creditsCount} txns</span>
        </div>
        <div className="bm-txns-agg-card debit">
          <span className="bm-txns-agg-label"><HiOutlineArrowUp /> Debits</span>
          <span className="bm-txns-agg-value">{formatINR(filteredStats.debits)}</span>
          <span className="bm-txns-agg-sub">{filteredStats.debitsCount} txns</span>
        </div>
        <div className="bm-txns-agg-card net">
          <span className="bm-txns-agg-label">Net</span>
          <span className={`bm-txns-agg-value ${filteredStats.net >= 0 ? 'pos' : 'neg'}`}>
            {filteredStats.net >= 0 ? '+' : ''}{formatINR(filteredStats.net)}
          </span>
          <span className="bm-txns-agg-sub">credits − debits</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bm-txns-toolbar">
        <div className="bm-txns-search">
          <HiOutlineSearch />
          <input
            placeholder="Search by ID, reference, UTR, description, service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}><HiOutlineX /></button>
          )}
        </div>
        <button
          className={`bm-btn bm-txns-filter-toggle ${showFilters ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
          onClick={() => setShowFilters(s => !s)}
        >
          <HiOutlineFilter /> Filters
          {activeFilterCount > 0 && <span className="bm-txns-filter-count">{activeFilterCount}</span>}
        </button>
        {activeFilterCount > 0 && (
          <button className="bm-btn" onClick={clearFilters}>
            <HiOutlineX /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bm-txns-filters">
          <div className="bm-txns-filter">
            <label>Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {TYPE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
          <div className="bm-txns-filter">
            <label>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
          <div className="bm-txns-filter">
            <label>Category</label>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              {CATEGORY_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
          <div className="bm-txns-filter">
            <label>Date</label>
            <select value={datePreset} onChange={e => setDatePreset(e.target.value)}>
              {DATE_PRESETS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
          {datePreset === 'custom' && (
            <>
              <div className="bm-txns-filter">
                <label>From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="bm-txns-filter">
                <label>To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </>
          )}
          <div className="bm-txns-filter">
            <label>Min ₹</label>
            <input type="number" placeholder="0" value={minAmount} onChange={e => setMinAmount(e.target.value)} />
          </div>
          <div className="bm-txns-filter">
            <label>Max ₹</label>
            <input type="number" placeholder="∞" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bm-txns-table-wrap">
        <table className="bm-txns-table">
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Description</th>
              <th>Category</th>
              <th className="sortable" onClick={() => handleSort('amount')}>
                Amount {sortField === 'amount' && (sortDir === 'desc' ? <HiOutlineSortDescending /> : <HiOutlineSortAscending />)}
              </th>
              <th>Method</th>
              <th className="sortable" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDir === 'desc' ? <HiOutlineSortDescending /> : <HiOutlineSortAscending />)}
              </th>
              <th className="sortable" onClick={() => handleSort('createdAt')}>
                Date {sortField === 'createdAt' && (sortDir === 'desc' ? <HiOutlineSortDescending /> : <HiOutlineSortAscending />)}
              </th>
              <th>{/* actions */}</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="bm-txns-empty">
                  <HiOutlineCash />
                  <p>No transactions match your filters.</p>
                  {activeFilterCount > 0 && (
                    <button className="bm-btn" onClick={clearFilters}>Clear filters</button>
                  )}
                </td>
              </tr>
            ) : (
              paged.map(t => (
                <tr key={t.id} className={`type-${t.type} status-${t.status}`}>
                  <td>
                    <span className="bm-txns-id">{t.id}</span>
                    <small className="bm-txns-ref">{t.reference}</small>
                  </td>
                  <td>
                    <div className="bm-txns-desc">{t.description}</div>
                    {t.serviceCode && <small className="bm-txns-service">{t.serviceCode}</small>}
                  </td>
                  <td>
                    <span className={`bm-txns-cat cat-${t.category}`}>
                      {CATEGORY_OPTIONS.find(c => c.v === t.category)?.label || t.category}
                    </span>
                  </td>
                  <td>
                    <span className={`bm-txns-amount type-${t.type}`}>
                      {t.type === 'credit' && '+'}
                      {t.type === 'debit' && '−'}
                      {' '}{formatINR(t.amount)}
                    </span>
                  </td>
                  <td>
                    <span className="bm-txns-method">{t.paymentMethodLabel || '—'}</span>
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>
                    <div className="bm-txns-date">
                      <span>{fmtShort(t.createdAt)}</span>
                      <small>{fmtTime(t.createdAt)}</small>
                    </div>
                  </td>
                  <td>
                    <button className="bm-txns-action" onClick={() => setSelected(t)} title="View details">
                      <HiOutlineEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bm-txns-pagination">
        <div className="bm-txns-pagination-info">
          <span>
            {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–
            {Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
        <div className="bm-txns-pagination-nav">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <HiOutlineChevronLeft />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <HiOutlineChevronRight />
          </button>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <TxnDetailModal
          txn={selected}
          onClose={() => setSelected(null)}
          onAction={() => { setSelected(null); refresh(); }}
        />
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: TxnStatus }) => {
  const map: Record<TxnStatus, { icon: React.ReactNode; label: string }> = {
    success:    { icon: <HiOutlineCheckCircle />,       label: 'Success'    },
    pending:    { icon: <HiOutlineClock />,             label: 'Pending'    },
    processing: { icon: <HiOutlineClock />,             label: 'Processing' },
    failed:     { icon: <HiOutlineExclamationCircle />, label: 'Failed'     },
    reversed:   { icon: <HiOutlineExclamationCircle />, label: 'Reversed'   },
    hold:       { icon: <HiOutlinePause />,             label: 'Hold'       },
  };
  const s = map[status];
  return (
    <span className={`bm-txns-status status-${status}`}>
      {s.icon} {s.label}
    </span>
  );
};

interface TxnDetailModalProps {
  txn: WalletTransaction;
  onClose: () => void;
  onAction: () => void;
}

const TxnDetailModal = ({ txn, onClose, onAction }: TxnDetailModalProps) => {
  const [remarks, setRemarks] = useState('');
  const canApprove = txn.status === 'pending' && txn.category === 'top_up_request';

  const handleApprove = () => {
    approveTopUpRequest(txn.id, remarks);
    onAction();
  };
  const handleReject = () => {
    rejectTopUpRequest(txn.id, remarks);
    onAction();
  };

  return (
    <>
      <div className="bm-modal-backdrop" onClick={onClose} />
      <div className="bm-txns-modal">
        <div className="bm-txns-modal-head">
          <h3>Transaction details</h3>
          <button className="bm-txns-modal-close" onClick={onClose}><HiOutlineX /></button>
        </div>
        <div className="bm-txns-modal-body">
          <div className="bm-txns-modal-amount">
            <div className={`bm-txns-modal-icon type-${txn.type}`}>
              {txn.type === 'credit' && <HiOutlineArrowDown />}
              {txn.type === 'debit' && <HiOutlineArrowUp />}
              {txn.type === 'request' && <HiOutlineClock />}
            </div>
            <div className={`bm-txns-modal-amount-value type-${txn.type}`}>
              {txn.type === 'credit' && '+'}
              {txn.type === 'debit' && '−'}
              {' '}{formatINR(txn.amount)}
            </div>
            <div className="bm-txns-modal-amount-desc">{txn.description}</div>
            <StatusBadge status={txn.status} />
          </div>

          <div className="bm-txns-modal-grid">
            <div><label>Transaction ID</label><strong>{txn.id}</strong></div>
            <div><label>Reference</label><strong>{txn.reference}</strong></div>
            {txn.gatewayRef && <div><label>Gateway ref</label><strong>{txn.gatewayRef}</strong></div>}
            {txn.utr && <div><label>UTR</label><strong>{txn.utr}</strong></div>}
            <div><label>Category</label><strong>{CATEGORY_OPTIONS.find(c => c.v === txn.category)?.label}</strong></div>
            <div><label>Method</label><strong>{txn.paymentMethodLabel || '—'}</strong></div>
            {txn.serviceName && <div><label>Service</label><strong>{txn.serviceName}</strong></div>}
            {txn.actionKind && <div><label>Action</label><strong>{txn.actionKind}</strong></div>}
            <div><label>Created at</label><strong>{fmtFullDate(txn.createdAt)}</strong></div>
            <div><label>Updated at</label><strong>{fmtFullDate(txn.updatedAt)}</strong></div>
            {txn.balanceAfter !== undefined && (
              <div><label>Balance after</label><strong>{formatINR(txn.balanceAfter)}</strong></div>
            )}
          </div>

          {txn.remarks && (
            <div className="bm-txns-modal-section">
              <label>Remarks</label>
              <p>{txn.remarks}</p>
            </div>
          )}

          {txn.screenshotDataUrl && (
            <div className="bm-txns-modal-section">
              <label>Payment screenshot</label>
              <img src={txn.screenshotDataUrl} alt="screenshot" className="bm-txns-modal-screenshot" />
            </div>
          )}

          {canApprove && (
            <div className="bm-txns-modal-actions-section">
              <label>Admin remarks</label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Add remarks (optional for approve, recommended for reject)"
                rows={2}
              />
              <div className="bm-txns-modal-actions">
                <button className="bm-btn bm-btn-danger" onClick={handleReject}>
                  <HiOutlineX /> Reject
                </button>
                <button className="bm-btn bm-btn-primary" onClick={handleApprove}>
                  <HiOutlineCheck /> Approve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Transactions;
