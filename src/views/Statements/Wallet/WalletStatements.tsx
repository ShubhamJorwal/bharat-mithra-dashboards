import { useState, useEffect, useMemo } from 'react';
import {
  HiOutlineSearch,
  HiOutlineCash,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineSortDescending,
  HiOutlineSortAscending,
  HiOutlinePause,
} from 'react-icons/hi';
import './WalletStatements.scss';

// Types
interface WalletTransaction {
  id: string;
  agentId: string;
  agentName: string;
  agentCode: string;
  type: 'credit' | 'debit' | 'request';
  category: 'top_up' | 'service_fee' | 'commission' | 'refund' | 'withdrawal' | 'wallet_request';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'hold';
  description: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  remarks?: string;
  paymentMethod?: string;
}

interface WalletStats {
  totalBalance: number;
  pendingRequests: number;
  todayCredits: number;
  todayDebits: number;
}

// LocalStorage key
const STORAGE_KEY = 'bm_wallet_transactions';

// Generate mock data
const generateMockData = (): WalletTransaction[] => {
  const agents = [
    { id: 'AG001', name: 'Rajesh Kumar', code: 'RK001' },
    { id: 'AG002', name: 'Priya Sharma', code: 'PS002' },
    { id: 'AG003', name: 'Amit Patel', code: 'AP003' },
    { id: 'AG004', name: 'Sunita Devi', code: 'SD004' },
    { id: 'AG005', name: 'Vikram Singh', code: 'VS005' },
    { id: 'AG006', name: 'Meena Kumari', code: 'MK006' },
    { id: 'AG007', name: 'Ravi Teja', code: 'RT007' },
    { id: 'AG008', name: 'Anita Rao', code: 'AR008' },
  ];

  const categories: WalletTransaction['category'][] = ['top_up', 'service_fee', 'commission', 'refund', 'withdrawal', 'wallet_request'];
  const statuses: WalletTransaction['status'][] = ['pending', 'approved', 'rejected', 'completed', 'failed'];
  const paymentMethods = ['UPI', 'Bank Transfer', 'Cash', 'Debit Card', 'Net Banking'];

  const descriptions: Record<string, string[]> = {
    top_up: ['Wallet recharge request', 'Balance top-up request', 'Fund addition request'],
    service_fee: ['PAN card service fee', 'Aadhaar update fee', 'GST registration fee', 'Income certificate fee'],
    commission: ['Commission earned - PAN service', 'Commission - Certificate service', 'Monthly commission payout'],
    refund: ['Refund for failed transaction', 'Service fee refund', 'Duplicate payment refund'],
    withdrawal: ['Wallet withdrawal request', 'Balance withdrawal to bank'],
    wallet_request: ['Wallet recharge - UPI', 'Wallet recharge - Bank Transfer', 'Wallet recharge - Cash deposit'],
  };

  const transactions: WalletTransaction[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const descs = descriptions[category];
    const description = descs[Math.floor(Math.random() * descs.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);

    let type: WalletTransaction['type'] = 'credit';
    if (category === 'service_fee' || category === 'withdrawal') type = 'debit';
    else if (category === 'wallet_request' || category === 'top_up') type = 'request';

    let status: WalletTransaction['status'];
    if (category === 'wallet_request' || category === 'top_up') {
      // Make some pending for the admin to act on
      status = i < 8 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)];
    } else {
      status = statuses.filter(s => s !== 'pending')[Math.floor(Math.random() * 4)];
    }

    transactions.push({
      id: `TXN${String(i + 1).padStart(5, '0')}`,
      agentId: agent.id,
      agentName: agent.name,
      agentCode: agent.code,
      type,
      category,
      amount: Math.round((Math.random() * 5000 + 100) * 100) / 100,
      status,
      description,
      reference: `REF${Date.now().toString(36).toUpperCase()}${String(i).padStart(3, '0')}`,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    });
  }

  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Load from localStorage or generate mock
const loadTransactions = (): WalletTransaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch { /* ignore */ }
  const data = generateMockData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

const saveTransactions = (data: WalletTransaction[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const categoryLabels: Record<string, string> = {
  top_up: 'Top Up',
  service_fee: 'Service Fee',
  commission: 'Commission',
  refund: 'Refund',
  withdrawal: 'Withdrawal',
  wallet_request: 'Wallet Request',
};

const WalletStatements = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'createdAt' | 'amount' | 'agentName'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedTxn, setSelectedTxn] = useState<WalletTransaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionRemarks, setActionRemarks] = useState('');

  // New transaction form
  const [newTxn, setNewTxn] = useState({
    agentName: '',
    agentCode: '',
    amount: '',
    category: 'wallet_request',
    description: '',
    paymentMethod: 'UPI',
  });

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  // Calculate stats
  const stats = useMemo((): WalletStats => {
    const today = new Date().toDateString();
    const pendingRequests = transactions.filter(t => t.status === 'pending').length;
    const todayTxns = transactions.filter(t => new Date(t.createdAt).toDateString() === today);
    const todayCredits = todayTxns.filter(t => t.type === 'credit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const todayDebits = todayTxns.filter(t => t.type === 'debit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = transactions.filter(t => t.status === 'completed' || t.status === 'approved')
      .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : t.type === 'debit' ? -t.amount : 0), 0);

    return { totalBalance: Math.abs(totalBalance), pendingRequests, todayCredits, todayDebits };
  }, [transactions]);

  // Filtered & sorted data
  const filteredData = useMemo(() => {
    let data = [...transactions];

    // Tab filter
    if (activeTab === 'pending') {
      data = data.filter(t => t.status === 'pending' || t.status === 'hold');
    }

    // Status filter
    if (statusFilter !== 'all' && activeTab === 'all') {
      data = data.filter(t => t.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      data = data.filter(t => t.category === categoryFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(t =>
        t.agentName.toLowerCase().includes(q) ||
        t.agentCode.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'agentName') cmp = a.agentName.localeCompare(b.agentName);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return data;
  }, [transactions, activeTab, statusFilter, categoryFilter, searchQuery, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => { setCurrentPage(1); }, [activeTab, statusFilter, categoryFilter, searchQuery, perPage]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleApprove = (txn: WalletTransaction) => {
    const updated = transactions.map(t =>
      t.id === txn.id ? { ...t, status: 'approved' as const, updatedAt: new Date().toISOString(), remarks: actionRemarks || 'Approved by admin' } : t
    );
    setTransactions(updated);
    saveTransactions(updated);
    setSelectedTxn(null);
    setActionRemarks('');
  };

  const handleReject = (txn: WalletTransaction) => {
    const updated = transactions.map(t =>
      t.id === txn.id ? { ...t, status: 'rejected' as const, updatedAt: new Date().toISOString(), remarks: actionRemarks || 'Rejected by admin' } : t
    );
    setTransactions(updated);
    saveTransactions(updated);
    setSelectedTxn(null);
    setActionRemarks('');
  };

  const handleHold = (txn: WalletTransaction) => {
    if (!actionRemarks) return; // Remarks required for hold
    const updated = transactions.map(t =>
      t.id === txn.id ? { ...t, status: 'hold' as const, updatedAt: new Date().toISOString(), remarks: actionRemarks } : t
    );
    setTransactions(updated);
    saveTransactions(updated);
    setSelectedTxn(null);
    setActionRemarks('');
  };

  const handleDelete = (txnId: string) => {
    const updated = transactions.filter(t => t.id !== txnId);
    setTransactions(updated);
    saveTransactions(updated);
    setSelectedTxn(null);
  };

  const handleAddTransaction = () => {
    if (!newTxn.agentName || !newTxn.amount) return;

    const txn: WalletTransaction = {
      id: `TXN${String(transactions.length + 1).padStart(5, '0')}`,
      agentId: `AG${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
      agentName: newTxn.agentName,
      agentCode: newTxn.agentCode || 'N/A',
      type: 'request',
      category: newTxn.category as WalletTransaction['category'],
      amount: parseFloat(newTxn.amount),
      status: 'pending',
      description: newTxn.description || `${categoryLabels[newTxn.category]} - ${newTxn.agentName}`,
      reference: `REF${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentMethod: newTxn.paymentMethod,
    };

    const updated = [txn, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
    setShowAddModal(false);
    setNewTxn({ agentName: '', agentCode: '', amount: '', category: 'wallet_request', description: '', paymentMethod: 'UPI' });
  };

  const handleResetData = () => {
    const data = generateMockData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTransactions(data);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { className: string; icon: React.ReactNode }> = {
      pending: { className: 'wst-status--pending', icon: <HiOutlineClock /> },
      approved: { className: 'wst-status--approved', icon: <HiOutlineCheck /> },
      rejected: { className: 'wst-status--rejected', icon: <HiOutlineX /> },
      completed: { className: 'wst-status--completed', icon: <HiOutlineCheck /> },
      failed: { className: 'wst-status--failed', icon: <HiOutlineExclamationCircle /> },
      hold: { className: 'wst-status--hold', icon: <HiOutlinePause /> },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`wst-status ${s.className}`}>
        {s.icon}
        {status}
      </span>
    );
  };

  const getAmountDisplay = (txn: WalletTransaction) => {
    const isCredit = txn.type === 'credit' || txn.category === 'commission' || txn.category === 'refund';
    const isRequest = txn.type === 'request';
    return (
      <span className={`wst-amount ${isCredit ? 'wst-amount--credit' : isRequest ? 'wst-amount--request' : 'wst-amount--debit'}`}>
        {isCredit ? <HiOutlineArrowDown /> : isRequest ? <HiOutlineClock /> : <HiOutlineArrowUp />}
        {formatCurrency(txn.amount)}
      </span>
    );
  };

  return (
    <div className="wst">
      {/* Stats Cards */}
      <div className="wst-stats">
        <div className="wst-stat wst-stat--balance">
          <div className="wst-stat__icon"><HiOutlineCash /></div>
          <div className="wst-stat__info">
            <span className="wst-stat__label">Total Balance</span>
            <strong className="wst-stat__value">{formatCurrency(stats.totalBalance)}</strong>
          </div>
        </div>
        <div className="wst-stat wst-stat--pending">
          <div className="wst-stat__icon"><HiOutlineClock /></div>
          <div className="wst-stat__info">
            <span className="wst-stat__label">Pending Requests</span>
            <strong className="wst-stat__value">{stats.pendingRequests}</strong>
          </div>
        </div>
        <div className="wst-stat wst-stat--credit">
          <div className="wst-stat__icon"><HiOutlineArrowDown /></div>
          <div className="wst-stat__info">
            <span className="wst-stat__label">Today's Credits</span>
            <strong className="wst-stat__value">{formatCurrency(stats.todayCredits)}</strong>
          </div>
        </div>
        <div className="wst-stat wst-stat--debit">
          <div className="wst-stat__icon"><HiOutlineArrowUp /></div>
          <div className="wst-stat__info">
            <span className="wst-stat__label">Today's Debits</span>
            <strong className="wst-stat__value">{formatCurrency(stats.todayDebits)}</strong>
          </div>
        </div>
      </div>

      {/* Tabs & Toolbar */}
      <div className="wst-toolbar">
        <div className="wst-tabs">
          <button className={`wst-tab ${activeTab === 'pending' ? 'wst-tab--active' : ''}`} onClick={() => setActiveTab('pending')}>
            <HiOutlineClock />
            Pending Requests
            {stats.pendingRequests > 0 && <span className="wst-tab__count">{stats.pendingRequests}</span>}
          </button>
          <button className={`wst-tab ${activeTab === 'all' ? 'wst-tab--active' : ''}`} onClick={() => setActiveTab('all')}>
            <HiOutlineCash />
            All Transactions
          </button>
        </div>

        <div className="wst-toolbar__actions">
          <div className="wst-search">
            <HiOutlineSearch />
            <input
              type="text"
              placeholder="Search by agent, ID, reference..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === 'all' && (
            <div className="wst-filters">
              <HiOutlineFilter className="wst-filter-icon" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="hold">On Hold</option>
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="wallet_request">Wallet Request</option>
                <option value="top_up">Top Up</option>
                <option value="service_fee">Service Fee</option>
                <option value="commission">Commission</option>
                <option value="refund">Refund</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
          )}

          <button className="wst-btn wst-btn--add" onClick={() => setShowAddModal(true)}>
            <HiOutlinePlus />
            <span>Add Transaction</span>
          </button>
          <button className="wst-btn wst-btn--refresh" onClick={handleResetData} title="Reset mock data">
            <HiOutlineRefresh />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="wst-content">
        <div className="wst-table-wrap">
          <table className="wst-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th className="sortable" onClick={() => handleSort('agentName')}>
                  <span>Agent</span>
                  {sortField === 'agentName' && (sortDir === 'desc' ? <HiOutlineSortDescending /> : <HiOutlineSortAscending />)}
                </th>
                <th>Category</th>
                <th className="sortable" onClick={() => handleSort('amount')}>
                  <span>Amount</span>
                  {sortField === 'amount' && (sortDir === 'desc' ? <HiOutlineSortDescending /> : <HiOutlineSortAscending />)}
                </th>
                <th>Payment</th>
                <th>Status</th>
                <th className="sortable" onClick={() => handleSort('createdAt')}>
                  <span>Date</span>
                  {sortField === 'createdAt' && (sortDir === 'desc' ? <HiOutlineSortDescending /> : <HiOutlineSortAscending />)}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="wst-table__empty">
                    <HiOutlineCash />
                    <p>{activeTab === 'pending' ? 'No pending requests' : 'No transactions found'}</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((txn, idx) => (
                  <tr key={txn.id} className={idx % 2 === 1 ? 'row-alt' : ''}>
                    <td>
                      <span className="wst-txn-id">{txn.id}</span>
                    </td>
                    <td>
                      <div className="wst-agent">
                        <strong>{txn.agentName}</strong>
                        <small>{txn.agentCode}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`wst-category wst-category--${txn.category}`}>
                        {categoryLabels[txn.category]}
                      </span>
                    </td>
                    <td>{getAmountDisplay(txn)}</td>
                    <td><span className="wst-payment">{txn.paymentMethod}</span></td>
                    <td>{getStatusBadge(txn.status)}</td>
                    <td>
                      <div className="wst-date">
                        <span>{formatDate(txn.createdAt)}</span>
                        <small>{formatTime(txn.createdAt)}</small>
                      </div>
                    </td>
                    <td>
                      <div className="wst-table__acts">
                        <button className="view-btn" title="View details" onClick={() => setSelectedTxn(txn)}>
                          <HiOutlineEye />
                        </button>
                        {(txn.status === 'pending' || txn.status === 'hold') && (
                          <>
                            <button className="nav-btn" title="Approve" onClick={() => handleApprove(txn)}>
                              <HiOutlineCheck />
                            </button>
                            <button className="del" title="Reject" onClick={() => handleReject(txn)}>
                              <HiOutlineX />
                            </button>
                          </>
                        )}
                        {txn.status === 'pending' && (
                          <button className="edit-btn" title="Hold" onClick={() => setSelectedTxn(txn)}>
                            <HiOutlinePause />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="wst-footer">
        <div className="wst-footer__info">
          <span>Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filteredData.length)} of {filteredData.length}</span>
          <select className="wst-footer__perpage" value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="wst-pagination">
          <button className="wst-pagination__btn" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
            <HiOutlineChevronLeft />
          </button>
          <div className="wst-pagination__input">
            <input
              type="number"
              value={currentPage}
              min={1}
              max={totalPages}
              onChange={e => {
                const v = parseInt(e.target.value);
                if (v >= 1 && v <= totalPages) setCurrentPage(v);
              }}
            />
            <span>of {totalPages}</span>
          </div>
          <button className="wst-pagination__btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <HiOutlineChevronRight />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTxn && (
        <>
          <div className="wst-backdrop" onClick={() => { setSelectedTxn(null); setActionRemarks(''); }} />
          <div className="wst-modal">
            <div className="wst-modal__header">
              <h3>Transaction Details</h3>
              <button onClick={() => { setSelectedTxn(null); setActionRemarks(''); }}><HiOutlineX /></button>
            </div>
            <div className="wst-modal__body">
              <div className="wst-modal__row">
                <span className="wst-modal__label">Transaction ID</span>
                <span className="wst-modal__value">{selectedTxn.id}</span>
              </div>
              <div className="wst-modal__row">
                <span className="wst-modal__label">Reference</span>
                <span className="wst-modal__value">{selectedTxn.reference}</span>
              </div>
              <div className="wst-modal__row">
                <span className="wst-modal__label">Agent</span>
                <span className="wst-modal__value">{selectedTxn.agentName} ({selectedTxn.agentCode})</span>
              </div>
              <div className="wst-modal__row">
                <span className="wst-modal__label">Category</span>
                <span className="wst-modal__value">{categoryLabels[selectedTxn.category]}</span>
              </div>
              <div className="wst-modal__row">
                <span className="wst-modal__label">Amount</span>
                <span className="wst-modal__value">{getAmountDisplay(selectedTxn)}</span>
              </div>
              <div className="wst-modal__row">
                <span className="wst-modal__label">Payment Method</span>
                <span className="wst-modal__value">{selectedTxn.paymentMethod || 'N/A'}</span>
              </div>
              <div className="wst-modal__row">
                <span className="wst-modal__label">Status</span>
                <span className="wst-modal__value">{getStatusBadge(selectedTxn.status)}</span>
              </div>
              <div className="wst-modal__row">
                <span className="wst-modal__label">Description</span>
                <span className="wst-modal__value">{selectedTxn.description}</span>
              </div>
              <div className="wst-modal__row">
                <span className="wst-modal__label">Created</span>
                <span className="wst-modal__value">
                  <HiOutlineCalendar /> {formatDate(selectedTxn.createdAt)} {formatTime(selectedTxn.createdAt)}
                </span>
              </div>
              {selectedTxn.remarks && (
                <div className="wst-modal__row">
                  <span className="wst-modal__label">Remarks</span>
                  <span className="wst-modal__value">{selectedTxn.remarks}</span>
                </div>
              )}

              {(selectedTxn.status === 'pending' || selectedTxn.status === 'hold') && (
                <div className="wst-modal__action-section">
                  <textarea
                    placeholder={selectedTxn.status === 'pending' ? 'Add remarks (required for hold)...' : 'Add remarks (optional)...'}
                    value={actionRemarks}
                    onChange={e => setActionRemarks(e.target.value)}
                    rows={2}
                  />
                  <div className="wst-modal__action-btns">
                    <button className="wst-btn wst-btn--approve" onClick={() => handleApprove(selectedTxn)}>
                      <HiOutlineCheck /> Approve
                    </button>
                    <button className="wst-btn wst-btn--reject" onClick={() => handleReject(selectedTxn)}>
                      <HiOutlineX /> Reject
                    </button>
                    {selectedTxn.status === 'pending' && (
                      <button className="wst-btn wst-btn--hold" onClick={() => handleHold(selectedTxn)} disabled={!actionRemarks}>
                        <HiOutlinePause /> Hold
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="wst-modal__footer-actions">
                <button className="wst-btn wst-btn--delete" onClick={() => handleDelete(selectedTxn.id)}>
                  <HiOutlineTrash /> Delete Transaction
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <>
          <div className="wst-backdrop" onClick={() => setShowAddModal(false)} />
          <div className="wst-modal">
            <div className="wst-modal__header">
              <h3>Add Transaction</h3>
              <button onClick={() => setShowAddModal(false)}><HiOutlineX /></button>
            </div>
            <div className="wst-modal__body">
              <div className="wst-form-group">
                <label>Agent Name *</label>
                <input type="text" value={newTxn.agentName} onChange={e => setNewTxn(p => ({ ...p, agentName: e.target.value }))} placeholder="Enter agent name" />
              </div>
              <div className="wst-form-group">
                <label>Agent Code</label>
                <input type="text" value={newTxn.agentCode} onChange={e => setNewTxn(p => ({ ...p, agentCode: e.target.value }))} placeholder="e.g. RK001" />
              </div>
              <div className="wst-form-group">
                <label>Amount (INR) *</label>
                <input type="number" value={newTxn.amount} onChange={e => setNewTxn(p => ({ ...p, amount: e.target.value }))} placeholder="Enter amount" min="1" />
              </div>
              <div className="wst-form-group">
                <label>Category</label>
                <select value={newTxn.category} onChange={e => setNewTxn(p => ({ ...p, category: e.target.value }))}>
                  <option value="wallet_request">Wallet Request</option>
                  <option value="top_up">Top Up</option>
                  <option value="service_fee">Service Fee</option>
                  <option value="commission">Commission</option>
                  <option value="refund">Refund</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
              </div>
              <div className="wst-form-group">
                <label>Payment Method</label>
                <select value={newTxn.paymentMethod} onChange={e => setNewTxn(p => ({ ...p, paymentMethod: e.target.value }))}>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
              <div className="wst-form-group">
                <label>Description</label>
                <input type="text" value={newTxn.description} onChange={e => setNewTxn(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
              </div>
              <div className="wst-modal__action-btns">
                <button className="wst-btn wst-btn--approve" onClick={handleAddTransaction}>
                  <HiOutlinePlus /> Add Transaction
                </button>
                <button className="wst-btn wst-btn--cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletStatements;
