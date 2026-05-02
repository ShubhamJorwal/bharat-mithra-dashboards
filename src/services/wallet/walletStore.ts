/**
 * Wallet store — single source of truth for the agent wallet.
 *
 * Persists to localStorage now. When the backend wallet endpoints land,
 * swap the body of `loadWallet`, `loadTransactions`, and the mutation
 * helpers to call the API. The shape stays the same so the UI doesn't
 * need to change.
 */

export type TxnType = 'credit' | 'debit' | 'request';

export type TxnCategory =
  | 'top_up'           // wallet load (credit, completed)
  | 'top_up_request'   // wallet load awaiting approval (pending)
  | 'service_fee'      // agent paid for an API call (debit)
  | 'commission'       // agent earned commission (credit)
  | 'refund'           // failed call refund (credit)
  | 'withdrawal'       // wallet → bank (debit)
  | 'adjustment'       // admin manual entry (+/-)
  | 'reversal';        // chargeback / claw-back (debit)

export type TxnStatus =
  | 'pending'    // awaiting approval (manual top-ups)
  | 'processing' // gateway in-flight
  | 'success'    // money moved
  | 'failed'     // attempt failed, no money moved
  | 'reversed'   // money returned
  | 'hold';      // admin hold (under review)

export type PaymentMethodKind = 'upi' | 'card' | 'netbanking' | 'imps' | 'cash';

export interface WalletTransaction {
  id: string;
  agentId: string;
  agentName: string;
  agentCode: string;

  type: TxnType;
  category: TxnCategory;
  amount: number;
  balanceAfter?: number;

  status: TxnStatus;
  description: string;
  reference: string;          // our internal ref
  gatewayRef?: string;        // Cashfree order ID etc.
  utr?: string;               // UTR for IMPS/NEFT
  paymentMethod?: PaymentMethodKind;
  paymentMethodLabel?: string;

  serviceCode?: string;       // for service_fee txns — links to the action used
  serviceName?: string;
  actionKind?: string;

  remarks?: string;
  screenshotDataUrl?: string;

  createdAt: string;
  updatedAt: string;
}

export interface WalletSnapshot {
  agentId: string;
  balance: number;
  pendingCredits: number;     // sum of pending top-ups
  pendingDebits: number;      // sum of in-flight service fees
  todayCredits: number;
  todayDebits: number;
  monthCredits: number;
  monthDebits: number;
  lastUpdatedAt: string;
}

const TXN_KEY = 'bm_wallet_transactions';
const PROFILE_KEY = 'bm_wallet_profile';

interface WalletProfile {
  agentId: string;
  agentName: string;
  agentCode: string;
}

const defaultProfile = (): WalletProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const p: WalletProfile = {
    agentId: 'AG_SELF',
    agentName: 'Thimma Shetty',
    agentCode: 'thimma.shetty',
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  return p;
};

const ensureSeeded = (): WalletTransaction[] => {
  const raw = localStorage.getItem(TXN_KEY);
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    } catch { /* fall through */ }
  }
  // First-run: seed a small history so dashboards aren't empty.
  const seed = generateSeedTransactions();
  localStorage.setItem(TXN_KEY, JSON.stringify(seed));
  return seed;
};

const generateSeedTransactions = (): WalletTransaction[] => {
  const profile = defaultProfile();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const mk = (
    offsetMs: number,
    type: TxnType,
    category: TxnCategory,
    amount: number,
    status: TxnStatus,
    description: string,
    extras: Partial<WalletTransaction> = {}
  ): WalletTransaction => ({
    id: `TXN${(now - offsetMs).toString(36).toUpperCase().slice(-8)}`,
    agentId: profile.agentId,
    agentName: profile.agentName,
    agentCode: profile.agentCode,
    type,
    category,
    amount,
    status,
    description,
    reference: `REF${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
    paymentMethod: 'upi',
    paymentMethodLabel: 'UPI',
    createdAt: new Date(now - offsetMs).toISOString(),
    updatedAt: new Date(now - offsetMs).toISOString(),
    ...extras,
  });

  return [
    mk(2 * 60 * 60 * 1000, 'credit', 'top_up', 5000, 'success', 'Wallet top-up via UPI', { gatewayRef: 'CF_ORD_8842', paymentMethodLabel: 'PhonePe UPI' }),
    mk(5 * 60 * 60 * 1000, 'debit', 'service_fee', 5, 'success', 'PAN verify — citizen Ramesh K.', { serviceCode: 'pan-verify', serviceName: 'PAN Verify', actionKind: 'verify' }),
    mk(8 * 60 * 60 * 1000, 'debit', 'service_fee', 3, 'success', 'Bank account verify', { serviceCode: 'bank-account-verify', serviceName: 'Bank Account Verify', actionKind: 'verify' }),
    mk(1 * day, 'credit', 'commission', 250, 'success', 'Commission — term life policy issued', { paymentMethodLabel: 'Trail commission' }),
    mk(1 * day + 3 * 60 * 60 * 1000, 'debit', 'service_fee', 12, 'success', 'BBPS — electricity bill payment', { serviceCode: 'electricity-bill', serviceName: 'Electricity Bill', actionKind: 'pay' }),
    mk(2 * day, 'credit', 'top_up', 2000, 'success', 'Wallet top-up via Card', { gatewayRef: 'CF_ORD_8551', paymentMethod: 'card', paymentMethodLabel: 'HDFC Credit Card' }),
    mk(2 * day + 4 * 60 * 60 * 1000, 'debit', 'service_fee', 25, 'success', 'GST verify (comprehensive)', { serviceCode: 'gst-search', serviceName: 'GST Search', actionKind: 'verify' }),
    mk(3 * day, 'debit', 'service_fee', 5, 'failed', 'Aadhaar verify — failed (auto-refund)', { serviceCode: 'aadhaar-verify', serviceName: 'Aadhaar Verify', actionKind: 'verify' }),
    mk(3 * day, 'credit', 'refund', 5, 'success', 'Refund — Aadhaar verify failed', { serviceCode: 'aadhaar-verify' }),
    mk(4 * day, 'credit', 'top_up', 10000, 'success', 'Wallet top-up via NetBanking', { gatewayRef: 'CF_ORD_8221', paymentMethod: 'netbanking', paymentMethodLabel: 'SBI NetBanking' }),
    mk(5 * day, 'debit', 'withdrawal', 3000, 'success', 'Withdrawal to bank account ****4521', { paymentMethod: 'imps', paymentMethodLabel: 'IMPS Payout' }),
    mk(6 * day, 'request', 'top_up_request', 1500, 'pending', 'Manual top-up request (UTR pending review)', { utr: 'UTR202605010012345', paymentMethodLabel: 'IMPS Manual', paymentMethod: 'imps' }),
    mk(7 * day, 'credit', 'commission', 800, 'success', 'Commission — health policy issued' ),
    mk(8 * day, 'debit', 'service_fee', 15, 'success', 'Vehicle RC verify' , { serviceCode: 'rc-status', serviceName: 'Vehicle RC', actionKind: 'verify' }),
  ];
};

// ─── Public API ────────────────────────────────────────────────────────

export const loadTransactions = (): WalletTransaction[] => {
  return ensureSeeded().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const saveTransactions = (txns: WalletTransaction[]): void => {
  localStorage.setItem(TXN_KEY, JSON.stringify(txns));
  // Notify listeners (Topbar, Dashboard widgets)
  window.dispatchEvent(new CustomEvent('bm-wallet-changed'));
};

export const computeSnapshot = (txns: WalletTransaction[]): WalletSnapshot => {
  const profile = defaultProfile();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  let balance = 0;
  let pendingCredits = 0;
  let pendingDebits = 0;
  let todayCredits = 0;
  let todayDebits = 0;
  let monthCredits = 0;
  let monthDebits = 0;

  for (const t of txns) {
    const at = new Date(t.createdAt).getTime();
    const isSuccess = t.status === 'success';
    const isPending = t.status === 'pending' || t.status === 'processing';

    if (isSuccess) {
      if (t.type === 'credit') balance += t.amount;
      if (t.type === 'debit') balance -= t.amount;
    }
    if (isPending) {
      if (t.type === 'credit' || t.type === 'request') pendingCredits += t.amount;
      if (t.type === 'debit') pendingDebits += t.amount;
    }
    if (isSuccess && at >= todayStart.getTime()) {
      if (t.type === 'credit') todayCredits += t.amount;
      if (t.type === 'debit') todayDebits += t.amount;
    }
    if (isSuccess && at >= monthStart.getTime()) {
      if (t.type === 'credit') monthCredits += t.amount;
      if (t.type === 'debit') monthDebits += t.amount;
    }
  }

  return {
    agentId: profile.agentId,
    balance: Math.max(0, balance),
    pendingCredits,
    pendingDebits,
    todayCredits,
    todayDebits,
    monthCredits,
    monthDebits,
    lastUpdatedAt: new Date().toISOString(),
  };
};

export const loadSnapshot = (): WalletSnapshot => {
  return computeSnapshot(loadTransactions());
};

const newTxnId = () => `TXN${Date.now().toString(36).toUpperCase().slice(-8)}${Math.random().toString(36).toUpperCase().slice(2, 4)}`;
const newRef = () => `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).toUpperCase().slice(2, 6)}`;

// ─── Mutations ─────────────────────────────────────────────────────────

export interface InitiateTopUpInput {
  amount: number;
  paymentMethod: PaymentMethodKind;
  paymentMethodLabel: string;
  manualUTR?: string;
  screenshotDataUrl?: string;
  notes?: string;
}

/**
 * Start a top-up. For UPI/Card/NetBanking → creates a "processing" txn that
 * resolves to "success" after the simulated gateway callback. For manual
 * IMPS → creates a "pending" top_up_request that admin must approve.
 */
export const initiateTopUp = (input: InitiateTopUpInput): WalletTransaction => {
  const profile = defaultProfile();
  const all = loadTransactions();

  const isManual = input.paymentMethod === 'imps' || input.paymentMethod === 'cash';
  const txn: WalletTransaction = {
    id: newTxnId(),
    agentId: profile.agentId,
    agentName: profile.agentName,
    agentCode: profile.agentCode,
    type: isManual ? 'request' : 'credit',
    category: isManual ? 'top_up_request' : 'top_up',
    amount: input.amount,
    status: isManual ? 'pending' : 'processing',
    description: isManual
      ? `Manual top-up request via ${input.paymentMethodLabel}`
      : `Wallet top-up via ${input.paymentMethodLabel}`,
    reference: newRef(),
    gatewayRef: isManual ? undefined : `CF_ORD_${Math.floor(Math.random() * 90000) + 10000}`,
    utr: input.manualUTR,
    paymentMethod: input.paymentMethod,
    paymentMethodLabel: input.paymentMethodLabel,
    screenshotDataUrl: input.screenshotDataUrl,
    remarks: input.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveTransactions([txn, ...all]);
  return txn;
};

/**
 * Simulate a payment gateway callback resolving a processing top-up.
 * Real backend will call this when Cashfree webhook lands.
 */
export const completeTopUp = (txnId: string, success: boolean = true): void => {
  const all = loadTransactions();
  const updated = all.map(t => {
    if (t.id !== txnId) return t;
    return {
      ...t,
      status: success ? ('success' as TxnStatus) : ('failed' as TxnStatus),
      updatedAt: new Date().toISOString(),
    };
  });
  saveTransactions(updated);
};

/**
 * Approve a pending manual top-up request.
 */
export const approveTopUpRequest = (txnId: string, remarks?: string): void => {
  const all = loadTransactions();
  const updated = all.map(t => {
    if (t.id !== txnId) return t;
    return {
      ...t,
      type: 'credit' as TxnType,
      category: 'top_up' as TxnCategory,
      status: 'success' as TxnStatus,
      remarks: remarks || t.remarks,
      updatedAt: new Date().toISOString(),
    };
  });
  saveTransactions(updated);
};

/**
 * Reject a pending manual top-up request.
 */
export const rejectTopUpRequest = (txnId: string, remarks?: string): void => {
  const all = loadTransactions();
  const updated = all.map(t => {
    if (t.id !== txnId) return t;
    return {
      ...t,
      status: 'failed' as TxnStatus,
      remarks: remarks || t.remarks,
      updatedAt: new Date().toISOString(),
    };
  });
  saveTransactions(updated);
};

export interface ChargeServiceInput {
  amount: number;
  serviceCode: string;
  serviceName: string;
  actionKind?: string;
  description?: string;
}

/**
 * Charge the agent for a service. Returns the resulting txn or null if
 * insufficient balance.
 */
export const chargeService = (input: ChargeServiceInput): WalletTransaction | null => {
  const profile = defaultProfile();
  const all = loadTransactions();
  const snapshot = computeSnapshot(all);
  if (snapshot.balance < input.amount) return null;

  const txn: WalletTransaction = {
    id: newTxnId(),
    agentId: profile.agentId,
    agentName: profile.agentName,
    agentCode: profile.agentCode,
    type: 'debit',
    category: 'service_fee',
    amount: input.amount,
    status: 'success',
    description: input.description || `${input.serviceName} fee`,
    reference: newRef(),
    serviceCode: input.serviceCode,
    serviceName: input.serviceName,
    actionKind: input.actionKind,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveTransactions([txn, ...all]);
  return txn;
};

/**
 * Refund a previously charged service (failure path).
 */
export const refundService = (originalTxnId: string, reason?: string): WalletTransaction | null => {
  const all = loadTransactions();
  const original = all.find(t => t.id === originalTxnId);
  if (!original) return null;

  // Mark original failed and add a refund credit.
  const updated = all.map(t =>
    t.id === originalTxnId ? { ...t, status: 'reversed' as TxnStatus, updatedAt: new Date().toISOString() } : t
  );
  const refund: WalletTransaction = {
    ...original,
    id: newTxnId(),
    type: 'credit',
    category: 'refund',
    status: 'success',
    description: `Refund — ${original.description}${reason ? ` (${reason})` : ''}`,
    reference: newRef(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveTransactions([refund, ...updated]);
  return refund;
};

export interface InitiateWithdrawalInput {
  amount: number;
  bankAccount: string; // masked label like "HDFC ****4521"
}

export const initiateWithdrawal = (input: InitiateWithdrawalInput): WalletTransaction | null => {
  const profile = defaultProfile();
  const all = loadTransactions();
  const snapshot = computeSnapshot(all);
  if (snapshot.balance < input.amount) return null;

  const txn: WalletTransaction = {
    id: newTxnId(),
    agentId: profile.agentId,
    agentName: profile.agentName,
    agentCode: profile.agentCode,
    type: 'debit',
    category: 'withdrawal',
    amount: input.amount,
    status: 'processing',
    description: `Withdrawal to ${input.bankAccount}`,
    reference: newRef(),
    paymentMethod: 'imps',
    paymentMethodLabel: 'IMPS Payout',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveTransactions([txn, ...all]);
  return txn;
};

// Subscribe to wallet changes (used by Topbar to refresh balance)
export const subscribe = (cb: () => void): (() => void) => {
  const handler = () => cb();
  window.addEventListener('bm-wallet-changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('bm-wallet-changed', handler);
    window.removeEventListener('storage', handler);
  };
};

export const resetWalletData = (): void => {
  localStorage.removeItem(TXN_KEY);
  ensureSeeded();
  window.dispatchEvent(new CustomEvent('bm-wallet-changed'));
};
