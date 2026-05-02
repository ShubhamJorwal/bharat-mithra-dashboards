import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCash, HiOutlinePlus, HiOutlineArrowDown, HiOutlineArrowUp,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationCircle,
  HiOutlineCreditCard, HiOutlineTrendingUp,
  HiOutlineLightningBolt, HiOutlineRefresh, HiOutlineShieldCheck,
  HiOutlineDocumentText, HiOutlineX, HiOutlineCheck,
  HiOutlineExternalLink, HiOutlineDownload,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import {
  loadTransactions, computeSnapshot, initiateTopUp, completeTopUp,
  initiateWithdrawal, subscribe, resetWalletData,
  type WalletTransaction, type WalletSnapshot, type PaymentMethodKind,
} from '@/services/wallet/walletStore';
import './Wallet.scss';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

const fmtDate = (s: string) => {
  const d = new Date(s);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

const PAYMENT_METHODS: { kind: PaymentMethodKind; label: string; sublabel: string; icon: string; instant: boolean }[] = [
  { kind: 'upi',         label: 'UPI',          sublabel: 'PhonePe / GPay / Paytm — instant',          icon: '📱', instant: true  },
  { kind: 'card',        label: 'Card',         sublabel: 'Credit / Debit / RuPay — instant',          icon: '💳', instant: true  },
  { kind: 'netbanking',  label: 'NetBanking',   sublabel: '50+ banks — instant',                         icon: '🏦', instant: true  },
  { kind: 'imps',        label: 'IMPS / NEFT',  sublabel: 'Manual transfer — verified by admin',         icon: '⏳', instant: false },
];

const Wallet = () => {
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [snap, setSnap] = useState<WalletSnapshot | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const refresh = () => {
    const t = loadTransactions();
    setTxns(t);
    setSnap(computeSnapshot(t));
  };

  useEffect(() => {
    refresh();
    const unsub = subscribe(refresh);
    return unsub;
  }, []);

  const recentTxns = useMemo(() => txns.slice(0, 10), [txns]);

  // Spending by category (last 30 days)
  const breakdown = useMemo(() => {
    const cutoff = Date.now() - 30 * 86_400_000;
    const recent = txns.filter(t => new Date(t.createdAt).getTime() >= cutoff && t.status === 'success');
    const categories: Record<string, { count: number; total: number; label: string }> = {
      service_fee:  { count: 0, total: 0, label: 'Service fees'  },
      commission:   { count: 0, total: 0, label: 'Commissions'   },
      top_up:       { count: 0, total: 0, label: 'Top-ups'        },
      withdrawal:   { count: 0, total: 0, label: 'Withdrawals'    },
      refund:       { count: 0, total: 0, label: 'Refunds'        },
    };
    for (const t of recent) {
      const k = t.category as string;
      if (categories[k]) {
        categories[k].count += 1;
        categories[k].total += t.amount;
      }
    }
    return categories;
  }, [txns]);

  return (
    <div className="bm-wallet-page">
      <PageHeader
        icon={<HiOutlineCash />}
        title="Wallet"
        description={`Balance, top-ups, payouts and statements. ${snap ? `Last updated ${fmtDate(snap.lastUpdatedAt)}` : ''}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bm-btn" onClick={refresh} title="Refresh">
              <HiOutlineRefresh />
            </button>
            <Link to="/statements/wallet" className="bm-btn">
              <HiOutlineDocumentText /> Statements
            </Link>
            <button className="bm-btn" onClick={() => setShowWithdraw(true)} disabled={!snap || snap.balance <= 0}>
              <HiOutlineArrowUp /> Withdraw
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => setShowTopUp(true)}>
              <HiOutlinePlus /> Add money
            </button>
          </div>
        }
      />

      {/* Balance hero */}
      <div className="bm-wallet-hero">
        <div className="bm-wallet-balance-card">
          <div className="bm-wallet-balance-row">
            <span className="bm-wallet-balance-label">
              <HiOutlineShieldCheck /> Available balance
            </span>
            {snap && snap.pendingCredits > 0 && (
              <span className="bm-wallet-pending-pill">
                <HiOutlineClock /> {formatINR(snap.pendingCredits)} pending
              </span>
            )}
          </div>
          <div className="bm-wallet-balance-amount">
            {snap ? formatINR(snap.balance) : '—'}
          </div>
          <div className="bm-wallet-balance-actions">
            <button className="bm-wallet-action" onClick={() => setShowTopUp(true)}>
              <HiOutlinePlus /> Add money
            </button>
            <button
              className="bm-wallet-action ghost"
              onClick={() => setShowWithdraw(true)}
              disabled={!snap || snap.balance <= 0}
            >
              <HiOutlineArrowUp /> Withdraw
            </button>
            <Link className="bm-wallet-action ghost" to="/statements/wallet">
              <HiOutlineDocumentText /> Full statement
            </Link>
          </div>
        </div>

        <div className="bm-wallet-quickstats">
          <div className="bm-wallet-quickstat credit">
            <div className="bm-wallet-quickstat-icon"><HiOutlineArrowDown /></div>
            <div>
              <div className="bm-wallet-quickstat-label">Credits today</div>
              <div className="bm-wallet-quickstat-value">{snap ? formatINR(snap.todayCredits) : '—'}</div>
            </div>
          </div>
          <div className="bm-wallet-quickstat debit">
            <div className="bm-wallet-quickstat-icon"><HiOutlineArrowUp /></div>
            <div>
              <div className="bm-wallet-quickstat-label">Debits today</div>
              <div className="bm-wallet-quickstat-value">{snap ? formatINR(snap.todayDebits) : '—'}</div>
            </div>
          </div>
          <div className="bm-wallet-quickstat credit">
            <div className="bm-wallet-quickstat-icon"><HiOutlineTrendingUp /></div>
            <div>
              <div className="bm-wallet-quickstat-label">Credits this month</div>
              <div className="bm-wallet-quickstat-value">{snap ? formatINR(snap.monthCredits) : '—'}</div>
            </div>
          </div>
          <div className="bm-wallet-quickstat debit">
            <div className="bm-wallet-quickstat-icon"><HiOutlineLightningBolt /></div>
            <div>
              <div className="bm-wallet-quickstat-label">Spent this month</div>
              <div className="bm-wallet-quickstat-value">{snap ? formatINR(snap.monthDebits) : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two column: recent + breakdown */}
      <div className="bm-wallet-grid">
        <section className="bm-wallet-card">
          <div className="bm-wallet-card-head">
            <h3>Recent activity</h3>
            <Link to="/statements/wallet" className="bm-wallet-card-link">
              View all <HiOutlineExternalLink />
            </Link>
          </div>
          {recentTxns.length === 0 ? (
            <div className="bm-wallet-empty">
              No transactions yet. Add money to your wallet to get started.
            </div>
          ) : (
            <ul className="bm-wallet-recent-list">
              {recentTxns.map(t => (
                <li key={t.id} className={`bm-wallet-recent-item type-${t.type} status-${t.status}`}>
                  <div className="bm-wallet-recent-icon">
                    {t.type === 'credit' && <HiOutlineArrowDown />}
                    {t.type === 'debit' && <HiOutlineArrowUp />}
                    {t.type === 'request' && <HiOutlineClock />}
                  </div>
                  <div className="bm-wallet-recent-body">
                    <div className="bm-wallet-recent-line1">
                      <span className="bm-wallet-recent-desc">{t.description}</span>
                      <span className={`bm-wallet-recent-amount type-${t.type}`}>
                        {t.type === 'debit' ? '−' : t.type === 'credit' ? '+' : ''} {formatINR(t.amount)}
                      </span>
                    </div>
                    <div className="bm-wallet-recent-line2">
                      <span className="bm-wallet-recent-meta">
                        {t.paymentMethodLabel || categoryToLabel(t.category)}
                      </span>
                      <span className={`bm-wallet-status-pill status-${t.status}`}>
                        {statusIcon(t.status)} {t.status}
                      </span>
                      <span className="bm-wallet-recent-time">{fmtDate(t.createdAt)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bm-wallet-card">
          <div className="bm-wallet-card-head">
            <h3>30-day breakdown</h3>
            <button className="bm-wallet-card-link" onClick={() => { resetWalletData(); refresh(); }} title="Reset demo data">
              Reset data
            </button>
          </div>
          <ul className="bm-wallet-breakdown">
            {Object.entries(breakdown).map(([key, v]) => (
              <li key={key} className={`bm-wallet-breakdown-row cat-${key}`}>
                <div>
                  <div className="bm-wallet-breakdown-label">{v.label}</div>
                  <div className="bm-wallet-breakdown-count">{v.count} transactions</div>
                </div>
                <div className="bm-wallet-breakdown-amount">{formatINR(v.total)}</div>
              </li>
            ))}
          </ul>

          <div className="bm-wallet-info-box">
            <HiOutlineCreditCard />
            <div>
              <strong>Why a wallet?</strong>
              <p>Every API service (verify, fetch, pay) deducts from your wallet on success. If a call fails, the amount is auto-refunded within seconds. Top up once, transact all day.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Top-up modal */}
      {showTopUp && (
        <TopUpModal
          balance={snap?.balance || 0}
          onClose={() => setShowTopUp(false)}
          onDone={() => { setShowTopUp(false); refresh(); }}
        />
      )}

      {/* Withdraw modal */}
      {showWithdraw && (
        <WithdrawModal
          balance={snap?.balance || 0}
          onClose={() => setShowWithdraw(false)}
          onDone={() => { setShowWithdraw(false); refresh(); }}
        />
      )}
    </div>
  );
};

const categoryToLabel = (c: string) => {
  const map: Record<string, string> = {
    service_fee: 'Service fee',
    commission: 'Commission',
    top_up: 'Wallet top-up',
    top_up_request: 'Manual top-up',
    refund: 'Refund',
    withdrawal: 'Withdrawal',
    adjustment: 'Adjustment',
    reversal: 'Reversal',
  };
  return map[c] || c;
};

const statusIcon = (s: string) => {
  if (s === 'success') return <HiOutlineCheckCircle />;
  if (s === 'pending' || s === 'processing') return <HiOutlineClock />;
  if (s === 'failed' || s === 'reversed') return <HiOutlineExclamationCircle />;
  return <HiOutlineCheckCircle />;
};

// ─── Top-up modal ──────────────────────────────────────────────────────

interface TopUpModalProps {
  balance: number;
  onClose: () => void;
  onDone: () => void;
}

const TopUpModal = ({ onClose, onDone }: TopUpModalProps) => {
  const [step, setStep] = useState<'amount' | 'method' | 'manual' | 'gateway' | 'done'>('amount');
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<typeof PAYMENT_METHODS[number] | null>(null);
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTxn, setCreatedTxn] = useState<WalletTransaction | null>(null);

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmitGateway = () => {
    if (!method || amount < 1) return;
    setSubmitting(true);
    const txn = initiateTopUp({
      amount,
      paymentMethod: method.kind,
      paymentMethodLabel: method.label,
    });
    setCreatedTxn(txn);
    // Simulate Cashfree gateway redirect + webhook callback
    setTimeout(() => {
      completeTopUp(txn.id, true);
      setSubmitting(false);
      setStep('done');
    }, 1800);
  };

  const handleSubmitManual = () => {
    if (!method || amount < 1 || !utr || !screenshot) return;
    setSubmitting(true);
    const txn = initiateTopUp({
      amount,
      paymentMethod: method.kind,
      paymentMethodLabel: method.label,
      manualUTR: utr,
      screenshotDataUrl: screenshot,
    });
    setCreatedTxn(txn);
    setTimeout(() => {
      setSubmitting(false);
      setStep('done');
    }, 600);
  };

  return (
    <>
      <div className="bm-modal-backdrop" onClick={onClose} />
      <div className="bm-wallet-modal">
        <div className="bm-wallet-modal-head">
          <h3>{step === 'done' ? 'Top-up submitted' : 'Add money to wallet'}</h3>
          <button className="bm-wallet-modal-close" onClick={onClose}><HiOutlineX /></button>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="bm-wallet-steps">
            <div className={`bm-wallet-step ${step === 'amount' ? 'active' : ['method','manual','gateway'].includes(step) ? 'done' : ''}`}>
              <span>1</span> Amount
            </div>
            <div className="bm-wallet-step-line" />
            <div className={`bm-wallet-step ${step === 'method' ? 'active' : ['manual','gateway'].includes(step) ? 'done' : ''}`}>
              <span>2</span> Method
            </div>
            <div className="bm-wallet-step-line" />
            <div className={`bm-wallet-step ${['manual','gateway'].includes(step) ? 'active' : ''}`}>
              <span>3</span> Pay
            </div>
          </div>
        )}

        <div className="bm-wallet-modal-body">

          {/* AMOUNT STEP */}
          {step === 'amount' && (
            <>
              <label className="bm-wallet-modal-label">Enter amount</label>
              <div className="bm-wallet-amount-input">
                <span>₹</span>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={e => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min={1}
                  max={200000}
                  autoFocus
                />
              </div>
              <div className="bm-wallet-quick-amounts">
                {QUICK_AMOUNTS.map(a => (
                  <button
                    key={a}
                    className={`bm-wallet-quick-amount ${amount === a ? 'active' : ''}`}
                    onClick={() => setAmount(a)}
                  >
                    ₹{a.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <p className="bm-wallet-modal-hint">
                Min ₹1 · Max ₹2,00,000 per top-up · No charges on add money
              </p>
              <div className="bm-wallet-modal-actions">
                <button className="bm-btn" onClick={onClose}>Cancel</button>
                <button
                  className="bm-btn bm-btn-primary"
                  disabled={amount < 1}
                  onClick={() => setStep('method')}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* METHOD STEP */}
          {step === 'method' && (
            <>
              <label className="bm-wallet-modal-label">Choose how to pay</label>
              <div className="bm-wallet-amount-summary">
                Adding <strong>{formatINR(amount)}</strong> to wallet
              </div>
              <div className="bm-wallet-methods">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.kind}
                    className={`bm-wallet-method ${method?.kind === m.kind ? 'selected' : ''}`}
                    onClick={() => setMethod(m)}
                  >
                    <div className="bm-wallet-method-icon">{m.icon}</div>
                    <div className="bm-wallet-method-body">
                      <div className="bm-wallet-method-label">
                        {m.label}
                        {m.instant && <span className="bm-wallet-method-tag">Instant</span>}
                      </div>
                      <div className="bm-wallet-method-sublabel">{m.sublabel}</div>
                    </div>
                    {method?.kind === m.kind && <HiOutlineCheck className="bm-wallet-method-check" />}
                  </button>
                ))}
              </div>
              <div className="bm-wallet-secure-note">
                <HiOutlineShieldCheck /> Powered by Cashfree · 256-bit encrypted · PCI-DSS Level 1
              </div>
              <div className="bm-wallet-modal-actions">
                <button className="bm-btn" onClick={() => setStep('amount')}>Back</button>
                <button
                  className="bm-btn bm-btn-primary"
                  disabled={!method}
                  onClick={() => setStep(method?.instant ? 'gateway' : 'manual')}
                >
                  {method?.instant ? `Pay ${formatINR(amount)}` : 'Continue'}
                </button>
              </div>
            </>
          )}

          {/* GATEWAY STEP — instant flow */}
          {step === 'gateway' && method && (
            <>
              <div className="bm-wallet-gateway">
                <div className="bm-wallet-gateway-icon">{method.icon}</div>
                <h4>Redirecting to {method.label}…</h4>
                <p>Pay {formatINR(amount)} via {method.label}. You'll be back here once payment completes.</p>
                {!submitting && !createdTxn && (
                  <div className="bm-wallet-modal-actions" style={{ justifyContent: 'center' }}>
                    <button className="bm-btn" onClick={() => setStep('method')}>Back</button>
                    <button className="bm-btn bm-btn-primary" onClick={handleSubmitGateway}>
                      Proceed to {method.label}
                    </button>
                  </div>
                )}
                {submitting && (
                  <div className="bm-wallet-gateway-loading">
                    <div className="bm-wallet-spinner" />
                    <span>Processing payment with Cashfree…</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* MANUAL STEP — IMPS / NEFT */}
          {step === 'manual' && method && (
            <>
              <div className="bm-wallet-bank-details">
                <h4>Transfer {formatINR(amount)} to:</h4>
                <div className="bm-wallet-bank-row">
                  <span>Account holder</span><strong>BharatMithra Tech Pvt Ltd</strong>
                </div>
                <div className="bm-wallet-bank-row">
                  <span>Account number</span><strong>50100 1234 5678 90</strong>
                </div>
                <div className="bm-wallet-bank-row">
                  <span>IFSC</span><strong>HDFC0001234</strong>
                </div>
                <div className="bm-wallet-bank-row">
                  <span>Bank</span><strong>HDFC Bank, Bengaluru</strong>
                </div>
              </div>

              <label className="bm-wallet-modal-label">UTR / Reference number *</label>
              <input
                className="bm-wallet-text-input"
                type="text"
                placeholder="UTR202605010012345"
                value={utr}
                onChange={e => setUtr(e.target.value)}
              />

              <label className="bm-wallet-modal-label">Payment screenshot *</label>
              <div className="bm-wallet-upload-box">
                {screenshot ? (
                  <div className="bm-wallet-upload-preview">
                    <img src={screenshot} alt="screenshot" />
                    <button onClick={() => setScreenshot('')}><HiOutlineX /></button>
                  </div>
                ) : (
                  <label className="bm-wallet-upload-empty">
                    <HiOutlineDownload />
                    <span>Click to upload</span>
                    <small>PNG/JPG up to 5 MB</small>
                    <input type="file" accept="image/*" onChange={handleScreenshot} hidden />
                  </label>
                )}
              </div>

              <p className="bm-wallet-modal-hint">
                Manual top-ups are credited within 30 minutes after admin verifies your UTR.
              </p>

              <div className="bm-wallet-modal-actions">
                <button className="bm-btn" onClick={() => setStep('method')}>Back</button>
                <button
                  className="bm-btn bm-btn-primary"
                  disabled={!utr || !screenshot || submitting}
                  onClick={handleSubmitManual}
                >
                  {submitting ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            </>
          )}

          {/* DONE */}
          {step === 'done' && createdTxn && (
            <div className="bm-wallet-done">
              <div className={`bm-wallet-done-icon ${createdTxn.status === 'success' ? 'success' : 'pending'}`}>
                {createdTxn.status === 'success' ? <HiOutlineCheckCircle /> : <HiOutlineClock />}
              </div>
              <h4>
                {createdTxn.status === 'success'
                  ? `${formatINR(amount)} added to wallet`
                  : 'Top-up request submitted'}
              </h4>
              <p>
                {createdTxn.status === 'success'
                  ? 'Your wallet balance has been updated and is ready to use.'
                  : 'Your request is pending admin verification. You will see it credited within 30 minutes.'}
              </p>
              <div className="bm-wallet-done-info">
                <div><span>Reference</span><strong>{createdTxn.reference}</strong></div>
                {createdTxn.gatewayRef && <div><span>Gateway ref</span><strong>{createdTxn.gatewayRef}</strong></div>}
                {createdTxn.utr && <div><span>UTR</span><strong>{createdTxn.utr}</strong></div>}
                <div><span>Method</span><strong>{createdTxn.paymentMethodLabel}</strong></div>
              </div>
              <div className="bm-wallet-modal-actions">
                <button className="bm-btn bm-btn-primary" onClick={onDone}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Withdraw modal ────────────────────────────────────────────────────

interface WithdrawModalProps {
  balance: number;
  onClose: () => void;
  onDone: () => void;
}

const WithdrawModal = ({ balance, onClose, onDone }: WithdrawModalProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [bankAccount, setBankAccount] = useState('HDFC ****4521');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (amount <= 0 || amount > balance) return;
    setSubmitting(true);
    const txn = initiateWithdrawal({ amount, bankAccount });
    if (!txn) {
      setSubmitting(false);
      return;
    }
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 600);
  };

  return (
    <>
      <div className="bm-modal-backdrop" onClick={onClose} />
      <div className="bm-wallet-modal">
        <div className="bm-wallet-modal-head">
          <h3>{done ? 'Withdrawal initiated' : 'Withdraw to bank'}</h3>
          <button className="bm-wallet-modal-close" onClick={onClose}><HiOutlineX /></button>
        </div>
        <div className="bm-wallet-modal-body">
          {!done ? (
            <>
              <div className="bm-wallet-amount-summary">
                Available: <strong>{formatINR(balance)}</strong>
              </div>

              <label className="bm-wallet-modal-label">Withdrawal amount</label>
              <div className="bm-wallet-amount-input">
                <span>₹</span>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={e => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min={100}
                  max={balance}
                  autoFocus
                />
              </div>
              <div className="bm-wallet-quick-amounts">
                <button className="bm-wallet-quick-amount" onClick={() => setAmount(Math.floor(balance / 4))}>25%</button>
                <button className="bm-wallet-quick-amount" onClick={() => setAmount(Math.floor(balance / 2))}>50%</button>
                <button className="bm-wallet-quick-amount" onClick={() => setAmount(Math.floor(balance * 0.75))}>75%</button>
                <button className="bm-wallet-quick-amount" onClick={() => setAmount(Math.floor(balance))}>All</button>
              </div>

              <label className="bm-wallet-modal-label" style={{ marginTop: 16 }}>Withdraw to</label>
              <select
                className="bm-wallet-text-input"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
              >
                <option value="HDFC ****4521">HDFC ****4521 (default)</option>
                <option value="SBI ****8821">SBI ****8821</option>
                <option value="Add new account">+ Add new bank account</option>
              </select>

              <p className="bm-wallet-modal-hint">
                Min ₹100 · IMPS payout, credited within 30 minutes · ₹2 transaction fee deducted
              </p>

              <div className="bm-wallet-modal-actions">
                <button className="bm-btn" onClick={onClose}>Cancel</button>
                <button
                  className="bm-btn bm-btn-primary"
                  onClick={handleSubmit}
                  disabled={amount < 100 || amount > balance || submitting}
                >
                  {submitting ? 'Initiating…' : `Withdraw ${formatINR(amount)}`}
                </button>
              </div>
            </>
          ) : (
            <div className="bm-wallet-done">
              <div className="bm-wallet-done-icon pending">
                <HiOutlineClock />
              </div>
              <h4>Withdrawal of {formatINR(amount)} initiated</h4>
              <p>Money will be credited to {bankAccount} within 30 minutes via IMPS.</p>
              <div className="bm-wallet-modal-actions">
                <button className="bm-btn bm-btn-primary" onClick={onDone}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wallet;
