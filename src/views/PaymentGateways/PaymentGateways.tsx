import { useState, useEffect, useRef } from 'react';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhotograph,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlineBan,
  HiOutlineRefresh,
  HiOutlineClipboardCopy,
} from 'react-icons/hi';
import './PaymentGateways.scss';

// Types
interface BankDetail {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: 'savings' | 'current';
  isActive: boolean;
  screenshot: string; // base64 or URL
  createdAt: string;
}

interface UpiDetail {
  id: string;
  upiId: string;
  providerName: string; // GPay, PhonePe, Paytm, etc.
  holderName: string;
  isActive: boolean;
  screenshot: string;
  createdAt: string;
}

// LocalStorage keys
const BANKS_KEY = 'bm_payment_banks';
const UPI_KEY = 'bm_payment_upi';

// Generate mock banks
const generateMockBanks = (): BankDetail[] => [
  {
    id: 'BNK001',
    bankName: 'State Bank of India',
    accountHolder: 'Bharat Mithra Services Pvt Ltd',
    accountNumber: '3256 1478 9630',
    ifscCode: 'SBIN0001234',
    branchName: 'MG Road, Bangalore',
    accountType: 'current',
    isActive: true,
    screenshot: '',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'BNK002',
    bankName: 'HDFC Bank',
    accountHolder: 'Bharat Mithra Services',
    accountNumber: '5012 3698 7452',
    ifscCode: 'HDFC0005678',
    branchName: 'Koramangala, Bangalore',
    accountType: 'current',
    isActive: true,
    screenshot: '',
    createdAt: '2025-02-15T10:00:00Z',
  },
  {
    id: 'BNK003',
    bankName: 'ICICI Bank',
    accountHolder: 'Bharat Mithra',
    accountNumber: '1234 5678 9012',
    ifscCode: 'ICIC0009876',
    branchName: 'Indiranagar, Bangalore',
    accountType: 'savings',
    isActive: false,
    screenshot: '',
    createdAt: '2025-03-20T10:00:00Z',
  },
];

// Generate mock UPIs
const generateMockUpi = (): UpiDetail[] => [
  {
    id: 'UPI001',
    upiId: 'bharatmithra@ybl',
    providerName: 'PhonePe',
    holderName: 'Bharat Mithra Services',
    isActive: true,
    screenshot: '',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'UPI002',
    upiId: 'bharatmithra@okaxis',
    providerName: 'Google Pay',
    holderName: 'Bharat Mithra Services',
    isActive: true,
    screenshot: '',
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'UPI003',
    upiId: 'bharatmithra@paytm',
    providerName: 'Paytm',
    holderName: 'Bharat Mithra',
    isActive: false,
    screenshot: '',
    createdAt: '2025-03-05T10:00:00Z',
  },
];

const loadData = <T,>(key: string, generator: () => T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  const data = generator();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
};

const saveData = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const PaymentGateways = () => {
  const [activeTab, setActiveTab] = useState<'bank' | 'upi'>('bank');
  const [banks, setBanks] = useState<BankDetail[]>([]);
  const [upis, setUpis] = useState<UpiDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showBankModal, setShowBankModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankDetail | null>(null);
  const [editingUpi, setEditingUpi] = useState<UpiDetail | null>(null);
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

  // Bank form
  const [bankForm, setBankForm] = useState({
    bankName: '', accountHolder: '', accountNumber: '', ifscCode: '', branchName: '', accountType: 'current' as 'current' | 'savings',
  });
  const [bankScreenshot, setBankScreenshot] = useState<string>('');
  const bankFileRef = useRef<HTMLInputElement>(null);

  // UPI form
  const [upiForm, setUpiForm] = useState({
    upiId: '', providerName: 'Google Pay', holderName: '',
  });
  const [upiScreenshot, setUpiScreenshot] = useState<string>('');
  const upiFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBanks(loadData(BANKS_KEY, generateMockBanks));
    setUpis(loadData(UPI_KEY, generateMockUpi));
  }, []);

  // Bank CRUD
  const handleSaveBank = () => {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) return;

    if (editingBank) {
      const updated = banks.map(b =>
        b.id === editingBank.id
          ? { ...b, ...bankForm, screenshot: bankScreenshot || b.screenshot }
          : b
      );
      setBanks(updated);
      saveData(BANKS_KEY, updated);
    } else {
      const newBank: BankDetail = {
        id: `BNK${String(banks.length + 1).padStart(3, '0')}`,
        ...bankForm,
        isActive: true,
        screenshot: bankScreenshot,
        createdAt: new Date().toISOString(),
      };
      const updated = [...banks, newBank];
      setBanks(updated);
      saveData(BANKS_KEY, updated);
    }
    closeBankModal();
  };

  const handleDeleteBank = (id: string) => {
    const updated = banks.filter(b => b.id !== id);
    setBanks(updated);
    saveData(BANKS_KEY, updated);
  };

  const handleToggleBank = (id: string) => {
    const updated = banks.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    setBanks(updated);
    saveData(BANKS_KEY, updated);
  };

  const openEditBank = (bank: BankDetail) => {
    setEditingBank(bank);
    setBankForm({
      bankName: bank.bankName, accountHolder: bank.accountHolder, accountNumber: bank.accountNumber,
      ifscCode: bank.ifscCode, branchName: bank.branchName, accountType: bank.accountType,
    });
    setBankScreenshot(bank.screenshot);
    setShowBankModal(true);
  };

  const closeBankModal = () => {
    setShowBankModal(false);
    setEditingBank(null);
    setBankForm({ bankName: '', accountHolder: '', accountNumber: '', ifscCode: '', branchName: '', accountType: 'current' });
    setBankScreenshot('');
  };

  // UPI CRUD
  const handleSaveUpi = () => {
    if (!upiForm.upiId || !upiForm.holderName) return;

    if (editingUpi) {
      const updated = upis.map(u =>
        u.id === editingUpi.id
          ? { ...u, ...upiForm, screenshot: upiScreenshot || u.screenshot }
          : u
      );
      setUpis(updated);
      saveData(UPI_KEY, updated);
    } else {
      const newUpi: UpiDetail = {
        id: `UPI${String(upis.length + 1).padStart(3, '0')}`,
        ...upiForm,
        isActive: true,
        screenshot: upiScreenshot,
        createdAt: new Date().toISOString(),
      };
      const updated = [...upis, newUpi];
      setUpis(updated);
      saveData(UPI_KEY, updated);
    }
    closeUpiModal();
  };

  const handleDeleteUpi = (id: string) => {
    const updated = upis.filter(u => u.id !== id);
    setUpis(updated);
    saveData(UPI_KEY, updated);
  };

  const handleToggleUpi = (id: string) => {
    const updated = upis.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    setUpis(updated);
    saveData(UPI_KEY, updated);
  };

  const openEditUpi = (upi: UpiDetail) => {
    setEditingUpi(upi);
    setUpiForm({ upiId: upi.upiId, providerName: upi.providerName, holderName: upi.holderName });
    setUpiScreenshot(upi.screenshot);
    setShowUpiModal(true);
  };

  const closeUpiModal = () => {
    setShowUpiModal(false);
    setEditingUpi(null);
    setUpiForm({ upiId: '', providerName: 'Google Pay', holderName: '' });
    setUpiScreenshot('');
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit

    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleResetData = () => {
    const bankData = generateMockBanks();
    const upiData = generateMockUpi();
    localStorage.setItem(BANKS_KEY, JSON.stringify(bankData));
    localStorage.setItem(UPI_KEY, JSON.stringify(upiData));
    setBanks(bankData);
    setUpis(upiData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Filtered data
  const filteredBanks = searchQuery
    ? banks.filter(b => b.bankName.toLowerCase().includes(searchQuery.toLowerCase()) || b.accountNumber.includes(searchQuery) || b.ifscCode.toLowerCase().includes(searchQuery.toLowerCase()))
    : banks;

  const filteredUpis = searchQuery
    ? upis.filter(u => u.upiId.toLowerCase().includes(searchQuery.toLowerCase()) || u.providerName.toLowerCase().includes(searchQuery.toLowerCase()) || u.holderName.toLowerCase().includes(searchQuery.toLowerCase()))
    : upis;

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="pgw">
      {/* Header */}
      <div className="pgw-header">
        <div className="pgw-header__left">
          <h2>Payment Gateways</h2>
          <p>Manage bank accounts and UPI payment methods</p>
        </div>
        <div className="pgw-header__right">
          <button className="pgw-btn pgw-btn--refresh" onClick={handleResetData} title="Reset mock data">
            <HiOutlineRefresh />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="pgw-stats">
        <div className="pgw-stat-card">
          <div className="pgw-stat-card__icon pgw-stat-card__icon--bank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>
          </div>
          <div className="pgw-stat-card__info">
            <span>Total Banks</span>
            <strong>{banks.length}</strong>
          </div>
        </div>
        <div className="pgw-stat-card">
          <div className="pgw-stat-card__icon pgw-stat-card__icon--active">
            <HiOutlineCheck />
          </div>
          <div className="pgw-stat-card__info">
            <span>Active Banks</span>
            <strong>{banks.filter(b => b.isActive).length}</strong>
          </div>
        </div>
        <div className="pgw-stat-card">
          <div className="pgw-stat-card__icon pgw-stat-card__icon--upi">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
          </div>
          <div className="pgw-stat-card__info">
            <span>Total UPI</span>
            <strong>{upis.length}</strong>
          </div>
        </div>
        <div className="pgw-stat-card">
          <div className="pgw-stat-card__icon pgw-stat-card__icon--active-upi">
            <HiOutlineCheck />
          </div>
          <div className="pgw-stat-card__info">
            <span>Active UPI</span>
            <strong>{upis.filter(u => u.isActive).length}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="pgw-toolbar">
        <div className="pgw-tabs">
          <button className={`pgw-tab ${activeTab === 'bank' ? 'pgw-tab--active' : ''}`} onClick={() => setActiveTab('bank')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>
            Bank Accounts
            <span className="pgw-tab__count">{banks.length}</span>
          </button>
          <button className={`pgw-tab ${activeTab === 'upi' ? 'pgw-tab--active' : ''}`} onClick={() => setActiveTab('upi')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
            UPI Details
            <span className="pgw-tab__count">{upis.length}</span>
          </button>
        </div>

        <div className="pgw-toolbar__actions">
          <div className="pgw-search">
            <HiOutlineSearch />
            <input
              type="text"
              placeholder={activeTab === 'bank' ? 'Search banks...' : 'Search UPI...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="pgw-btn pgw-btn--add"
            onClick={() => activeTab === 'bank' ? setShowBankModal(true) : setShowUpiModal(true)}
          >
            <HiOutlinePlus />
            <span>Add {activeTab === 'bank' ? 'Bank' : 'UPI'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pgw-content">
        {activeTab === 'bank' ? (
          <div className="pgw-cards">
            {filteredBanks.length === 0 ? (
              <div className="pgw-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>
                <h4>No bank accounts</h4>
                <p>Add your first bank account to get started</p>
              </div>
            ) : (
              filteredBanks.map(bank => (
                <div key={bank.id} className={`pgw-card ${!bank.isActive ? 'pgw-card--inactive' : ''}`}>
                  <div className="pgw-card__header">
                    <div className="pgw-card__bank-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>
                    </div>
                    <div className="pgw-card__title">
                      <h4>{bank.bankName}</h4>
                      <span className="pgw-card__type">{bank.accountType}</span>
                    </div>
                    <span className={`pgw-card__status ${bank.isActive ? 'pgw-card__status--active' : 'pgw-card__status--inactive'}`}>
                      {bank.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="pgw-card__body">
                    <div className="pgw-card__field">
                      <span className="pgw-card__label">Account Holder</span>
                      <span className="pgw-card__value">{bank.accountHolder}</span>
                    </div>
                    <div className="pgw-card__field">
                      <span className="pgw-card__label">Account Number</span>
                      <span className="pgw-card__value pgw-card__value--mono">
                        {bank.accountNumber}
                        <button className="pgw-copy-btn" onClick={() => copyToClipboard(bank.accountNumber)} title="Copy">
                          <HiOutlineClipboardCopy />
                        </button>
                      </span>
                    </div>
                    <div className="pgw-card__field">
                      <span className="pgw-card__label">IFSC Code</span>
                      <span className="pgw-card__value pgw-card__value--mono">
                        {bank.ifscCode}
                        <button className="pgw-copy-btn" onClick={() => copyToClipboard(bank.ifscCode)} title="Copy">
                          <HiOutlineClipboardCopy />
                        </button>
                      </span>
                    </div>
                    <div className="pgw-card__field">
                      <span className="pgw-card__label">Branch</span>
                      <span className="pgw-card__value">{bank.branchName}</span>
                    </div>
                    <div className="pgw-card__field">
                      <span className="pgw-card__label">Added On</span>
                      <span className="pgw-card__value">{formatDate(bank.createdAt)}</span>
                    </div>
                  </div>

                  {bank.screenshot && (
                    <div className="pgw-card__screenshot" onClick={() => setViewScreenshot(bank.screenshot)}>
                      <img src={bank.screenshot} alt="Bank screenshot" />
                      <div className="pgw-card__screenshot-overlay">
                        <HiOutlineEye /> View
                      </div>
                    </div>
                  )}

                  <div className="pgw-card__actions">
                    <button className="pgw-card__btn pgw-card__btn--toggle" onClick={() => handleToggleBank(bank.id)} title={bank.isActive ? 'Deactivate' : 'Activate'}>
                      {bank.isActive ? <HiOutlineBan /> : <HiOutlineCheck />}
                      <span>{bank.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    <button className="pgw-card__btn pgw-card__btn--edit" onClick={() => openEditBank(bank)}>
                      <HiOutlinePencil />
                      <span>Edit</span>
                    </button>
                    <button className="pgw-card__btn pgw-card__btn--delete" onClick={() => handleDeleteBank(bank.id)}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="pgw-cards">
            {filteredUpis.length === 0 ? (
              <div className="pgw-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                <h4>No UPI details</h4>
                <p>Add your first UPI to get started</p>
              </div>
            ) : (
              filteredUpis.map(upi => (
                <div key={upi.id} className={`pgw-card pgw-card--upi ${!upi.isActive ? 'pgw-card--inactive' : ''}`}>
                  <div className="pgw-card__header">
                    <div className="pgw-card__upi-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                    </div>
                    <div className="pgw-card__title">
                      <h4>{upi.providerName}</h4>
                      <span className="pgw-card__upi-id">{upi.upiId}</span>
                    </div>
                    <span className={`pgw-card__status ${upi.isActive ? 'pgw-card__status--active' : 'pgw-card__status--inactive'}`}>
                      {upi.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="pgw-card__body">
                    <div className="pgw-card__field">
                      <span className="pgw-card__label">UPI ID</span>
                      <span className="pgw-card__value pgw-card__value--mono">
                        {upi.upiId}
                        <button className="pgw-copy-btn" onClick={() => copyToClipboard(upi.upiId)} title="Copy">
                          <HiOutlineClipboardCopy />
                        </button>
                      </span>
                    </div>
                    <div className="pgw-card__field">
                      <span className="pgw-card__label">Holder Name</span>
                      <span className="pgw-card__value">{upi.holderName}</span>
                    </div>
                    <div className="pgw-card__field">
                      <span className="pgw-card__label">Added On</span>
                      <span className="pgw-card__value">{formatDate(upi.createdAt)}</span>
                    </div>
                  </div>

                  {upi.screenshot && (
                    <div className="pgw-card__screenshot" onClick={() => setViewScreenshot(upi.screenshot)}>
                      <img src={upi.screenshot} alt="UPI screenshot" />
                      <div className="pgw-card__screenshot-overlay">
                        <HiOutlineEye /> View
                      </div>
                    </div>
                  )}

                  <div className="pgw-card__actions">
                    <button className="pgw-card__btn pgw-card__btn--toggle" onClick={() => handleToggleUpi(upi.id)} title={upi.isActive ? 'Deactivate' : 'Activate'}>
                      {upi.isActive ? <HiOutlineBan /> : <HiOutlineCheck />}
                      <span>{upi.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    <button className="pgw-card__btn pgw-card__btn--edit" onClick={() => openEditUpi(upi)}>
                      <HiOutlinePencil />
                      <span>Edit</span>
                    </button>
                    <button className="pgw-card__btn pgw-card__btn--delete" onClick={() => handleDeleteUpi(upi.id)}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bank Modal */}
      {showBankModal && (
        <>
          <div className="pgw-backdrop" onClick={closeBankModal} />
          <div className="pgw-modal">
            <div className="pgw-modal__header">
              <h3>{editingBank ? 'Edit Bank Account' : 'Add Bank Account'}</h3>
              <button onClick={closeBankModal}><HiOutlineX /></button>
            </div>
            <div className="pgw-modal__body">
              <div className="pgw-form-row">
                <div className="pgw-form-group">
                  <label>Bank Name *</label>
                  <input type="text" value={bankForm.bankName} onChange={e => setBankForm(p => ({ ...p, bankName: e.target.value }))} placeholder="e.g. State Bank of India" />
                </div>
                <div className="pgw-form-group">
                  <label>Account Type</label>
                  <select value={bankForm.accountType} onChange={e => setBankForm(p => ({ ...p, accountType: e.target.value as 'savings' | 'current' }))}>
                    <option value="current">Current</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </div>
              <div className="pgw-form-group">
                <label>Account Holder Name *</label>
                <input type="text" value={bankForm.accountHolder} onChange={e => setBankForm(p => ({ ...p, accountHolder: e.target.value }))} placeholder="Full name as per bank" />
              </div>
              <div className="pgw-form-row">
                <div className="pgw-form-group">
                  <label>Account Number *</label>
                  <input type="text" value={bankForm.accountNumber} onChange={e => setBankForm(p => ({ ...p, accountNumber: e.target.value }))} placeholder="Enter account number" />
                </div>
                <div className="pgw-form-group">
                  <label>IFSC Code *</label>
                  <input type="text" value={bankForm.ifscCode} onChange={e => setBankForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }))} placeholder="e.g. SBIN0001234" />
                </div>
              </div>
              <div className="pgw-form-group">
                <label>Branch Name</label>
                <input type="text" value={bankForm.branchName} onChange={e => setBankForm(p => ({ ...p, branchName: e.target.value }))} placeholder="Branch location" />
              </div>

              <div className="pgw-form-group">
                <label>Screenshot (Bank Passbook / Cheque)</label>
                <div className="pgw-upload-area" onClick={() => bankFileRef.current?.click()}>
                  {bankScreenshot ? (
                    <div className="pgw-upload-preview">
                      <img src={bankScreenshot} alt="Preview" />
                      <button className="pgw-upload-remove" onClick={e => { e.stopPropagation(); setBankScreenshot(''); }}>
                        <HiOutlineX />
                      </button>
                    </div>
                  ) : (
                    <div className="pgw-upload-placeholder">
                      <HiOutlinePhotograph />
                      <span>Click to upload screenshot</span>
                      <small>PNG, JPG up to 5MB</small>
                    </div>
                  )}
                  <input ref={bankFileRef} type="file" accept="image/*" onChange={e => handleFileUpload(e, setBankScreenshot)} hidden />
                </div>
              </div>

              <div className="pgw-modal__footer">
                <button className="pgw-btn pgw-btn--cancel" onClick={closeBankModal}>Cancel</button>
                <button className="pgw-btn pgw-btn--save" onClick={handleSaveBank}>
                  <HiOutlineCheck /> {editingBank ? 'Update' : 'Add'} Bank
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* UPI Modal */}
      {showUpiModal && (
        <>
          <div className="pgw-backdrop" onClick={closeUpiModal} />
          <div className="pgw-modal">
            <div className="pgw-modal__header">
              <h3>{editingUpi ? 'Edit UPI Details' : 'Add UPI Details'}</h3>
              <button onClick={closeUpiModal}><HiOutlineX /></button>
            </div>
            <div className="pgw-modal__body">
              <div className="pgw-form-row">
                <div className="pgw-form-group">
                  <label>UPI ID *</label>
                  <input type="text" value={upiForm.upiId} onChange={e => setUpiForm(p => ({ ...p, upiId: e.target.value }))} placeholder="e.g. name@ybl" />
                </div>
                <div className="pgw-form-group">
                  <label>Provider</label>
                  <select value={upiForm.providerName} onChange={e => setUpiForm(p => ({ ...p, providerName: e.target.value }))}>
                    <option value="Google Pay">Google Pay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm</option>
                    <option value="BHIM">BHIM</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="pgw-form-group">
                <label>Holder Name *</label>
                <input type="text" value={upiForm.holderName} onChange={e => setUpiForm(p => ({ ...p, holderName: e.target.value }))} placeholder="Name linked to UPI" />
              </div>

              <div className="pgw-form-group">
                <label>Screenshot (QR Code / UPI App)</label>
                <div className="pgw-upload-area" onClick={() => upiFileRef.current?.click()}>
                  {upiScreenshot ? (
                    <div className="pgw-upload-preview">
                      <img src={upiScreenshot} alt="Preview" />
                      <button className="pgw-upload-remove" onClick={e => { e.stopPropagation(); setUpiScreenshot(''); }}>
                        <HiOutlineX />
                      </button>
                    </div>
                  ) : (
                    <div className="pgw-upload-placeholder">
                      <HiOutlinePhotograph />
                      <span>Click to upload screenshot</span>
                      <small>PNG, JPG up to 5MB</small>
                    </div>
                  )}
                  <input ref={upiFileRef} type="file" accept="image/*" onChange={e => handleFileUpload(e, setUpiScreenshot)} hidden />
                </div>
              </div>

              <div className="pgw-modal__footer">
                <button className="pgw-btn pgw-btn--cancel" onClick={closeUpiModal}>Cancel</button>
                <button className="pgw-btn pgw-btn--save" onClick={handleSaveUpi}>
                  <HiOutlineCheck /> {editingUpi ? 'Update' : 'Add'} UPI
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Screenshot Viewer */}
      {viewScreenshot && (
        <>
          <div className="pgw-backdrop" onClick={() => setViewScreenshot(null)} />
          <div className="pgw-viewer">
            <button className="pgw-viewer__close" onClick={() => setViewScreenshot(null)}>
              <HiOutlineX />
            </button>
            <img src={viewScreenshot} alt="Screenshot" />
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentGateways;
