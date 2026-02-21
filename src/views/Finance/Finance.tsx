import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  HiOutlineCurrencyRupee,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineArrowSmRight,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineDocumentText,
  HiOutlineOfficeBuilding,
  HiOutlineBadgeCheck,
  HiOutlineClipboardCheck,
  HiOutlineSwitchHorizontal,
  HiOutlinePrinter,
  HiOutlineCalculator,
} from 'react-icons/hi';
import './Finance.scss';

// ─── Type Definitions ──────────────────────────────────────

type TabId = 'overview' | 'transactions' | 'accounts' | 'invoices' | 'budgets';

interface FinanceTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  reference: string;
  paymentMethod: string;
  counterparty: string;
  notes?: string;
}

interface FinanceAccount {
  id: string;
  name: string;
  type: 'savings' | 'current' | 'escrow' | 'operational' | 'reserve';
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  balance: number;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'frozen';
  monthlyInflow: number;
  monthlyOutflow: number;
}

interface FinanceInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customer: string;
  customerGST?: string;
  items: { description: string; qty: number; rate: number; amount: number }[];
  subtotal: number;
  gst: number;
  total: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'partially_paid' | 'cancelled';
  amountPaid: number;
  category: string;
}

interface BudgetItem {
  id: string;
  category: string;
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
  status: 'on_track' | 'at_risk' | 'over_budget' | 'under_utilized';
  lastUpdated: string;
}

interface RevenueMonth {
  month: string;
  revenue: number;
  expenses: number;
}

// ─── Mock Data ─────────────────────────────────────────────

const initialTransactions: FinanceTransaction[] = [
  { id: 'TXN001', date: '2026-02-10T09:15:00', description: 'Service Fee - Caste Certificate Batch', category: 'Service Revenue', type: 'credit', amount: 45000, status: 'completed', reference: 'REF-2026-00451', paymentMethod: 'UPI', counterparty: 'Citizens Portal', notes: '150 certificates @ ₹300 each' },
  { id: 'TXN002', date: '2026-02-10T08:30:00', description: 'Staff Salary - February 2026', category: 'Salaries', type: 'debit', amount: 285000, status: 'completed', reference: 'SAL-2026-02', paymentMethod: 'NEFT', counterparty: 'Payroll Account' },
  { id: 'TXN003', date: '2026-02-09T16:45:00', description: 'GST Registration Fee Collection', category: 'Service Revenue', type: 'credit', amount: 22500, status: 'completed', reference: 'REF-2026-00450', paymentMethod: 'Net Banking', counterparty: 'GST Portal' },
  { id: 'TXN004', date: '2026-02-09T14:20:00', description: 'Office Rent - February', category: 'Rent & Utilities', type: 'debit', amount: 65000, status: 'completed', reference: 'RENT-2026-02', paymentMethod: 'NEFT', counterparty: 'Property Management Ltd' },
  { id: 'TXN005', date: '2026-02-09T11:00:00', description: 'PAN Card Service Revenue', category: 'Service Revenue', type: 'credit', amount: 18750, status: 'pending', reference: 'REF-2026-00449', paymentMethod: 'UPI', counterparty: 'PAN Service Gateway' },
  { id: 'TXN006', date: '2026-02-08T15:30:00', description: 'IT Equipment Purchase', category: 'Capital Expenditure', type: 'debit', amount: 156000, status: 'completed', reference: 'PO-2026-00089', paymentMethod: 'Cheque', counterparty: 'TechSolutions India' },
  { id: 'TXN007', date: '2026-02-08T10:15:00', description: 'Payment Gateway Commission', category: 'Commission Income', type: 'credit', amount: 8420, status: 'completed', reference: 'COM-2026-02-08', paymentMethod: 'Auto Credit', counterparty: 'Razorpay' },
  { id: 'TXN008', date: '2026-02-07T17:00:00', description: 'Electricity Bill - Main Office', category: 'Rent & Utilities', type: 'debit', amount: 24500, status: 'completed', reference: 'ELEC-2026-02', paymentMethod: 'Net Banking', counterparty: 'BESCOM' },
  { id: 'TXN009', date: '2026-02-07T12:30:00', description: 'MSME Registration Fees', category: 'Service Revenue', type: 'credit', amount: 36000, status: 'completed', reference: 'REF-2026-00448', paymentMethod: 'UPI', counterparty: 'MSME Portal' },
  { id: 'TXN010', date: '2026-02-07T09:00:00', description: 'Internet & Cloud Services', category: 'Technology', type: 'debit', amount: 18900, status: 'completed', reference: 'TECH-2026-02', paymentMethod: 'Auto Debit', counterparty: 'AWS India' },
  { id: 'TXN011', date: '2026-02-06T16:00:00', description: 'Income Certificate Revenue', category: 'Service Revenue', type: 'credit', amount: 31200, status: 'completed', reference: 'REF-2026-00447', paymentMethod: 'UPI', counterparty: 'E-District Portal' },
  { id: 'TXN012', date: '2026-02-06T11:30:00', description: 'Stationery & Office Supplies', category: 'Administrative', type: 'debit', amount: 8750, status: 'completed', reference: 'ADM-2026-0034', paymentMethod: 'Petty Cash', counterparty: 'Rao Stationery' },
  { id: 'TXN013', date: '2026-02-05T14:45:00', description: 'Land Record Processing Fee', category: 'Service Revenue', type: 'credit', amount: 52800, status: 'completed', reference: 'REF-2026-00446', paymentMethod: 'Net Banking', counterparty: 'Revenue Dept' },
  { id: 'TXN014', date: '2026-02-05T10:00:00', description: 'Vehicle Fuel & Maintenance', category: 'Transportation', type: 'debit', amount: 12400, status: 'completed', reference: 'VEH-2026-02-05', paymentMethod: 'Fuel Card', counterparty: 'Indian Oil' },
  { id: 'TXN015', date: '2026-02-04T15:30:00', description: 'Domicile Certificate Revenue', category: 'Service Revenue', type: 'credit', amount: 19500, status: 'failed', reference: 'REF-2026-00445', paymentMethod: 'UPI', counterparty: 'UPI Gateway', notes: 'Payment gateway timeout' },
  { id: 'TXN016', date: '2026-02-04T09:15:00', description: 'Insurance Premium - Q4', category: 'Insurance', type: 'debit', amount: 42000, status: 'completed', reference: 'INS-2026-Q4', paymentMethod: 'NEFT', counterparty: 'LIC of India' },
  { id: 'TXN017', date: '2026-02-03T13:00:00', description: 'Passport Application Service', category: 'Service Revenue', type: 'credit', amount: 14200, status: 'completed', reference: 'REF-2026-00444', paymentMethod: 'UPI', counterparty: 'Passport Seva' },
  { id: 'TXN018', date: '2026-02-03T10:30:00', description: 'Legal & Compliance Fees', category: 'Professional Fees', type: 'debit', amount: 35000, status: 'pending', reference: 'LEG-2026-02', paymentMethod: 'NEFT', counterparty: 'Kumar & Associates' },
  { id: 'TXN019', date: '2026-02-02T16:15:00', description: 'Birth/Death Certificate Revenue', category: 'Service Revenue', type: 'credit', amount: 28600, status: 'completed', reference: 'REF-2026-00443', paymentMethod: 'Net Banking', counterparty: 'Municipal Corp' },
  { id: 'TXN020', date: '2026-02-02T08:00:00', description: 'Staff Training Program', category: 'Training', type: 'debit', amount: 48000, status: 'completed', reference: 'TRN-2026-002', paymentMethod: 'NEFT', counterparty: 'NISG Academy' },
];

const initialAccounts: FinanceAccount[] = [
  { id: 'ACC001', name: 'Main Operational Account', type: 'current', bankName: 'State Bank of India', accountNumber: 'XXXX XXXX 4521', ifscCode: 'SBIN0001234', balance: 2845600, lastUpdated: '2026-02-10', status: 'active', monthlyInflow: 856000, monthlyOutflow: 612000 },
  { id: 'ACC002', name: 'Service Revenue Account', type: 'savings', bankName: 'Bank of Baroda', accountNumber: 'XXXX XXXX 7832', ifscCode: 'BARB0VJBANG', balance: 1256800, lastUpdated: '2026-02-10', status: 'active', monthlyInflow: 425000, monthlyOutflow: 180000 },
  { id: 'ACC003', name: 'Escrow - Citizen Payments', type: 'escrow', bankName: 'HDFC Bank', accountNumber: 'XXXX XXXX 9145', ifscCode: 'HDFC0001234', balance: 567000, lastUpdated: '2026-02-10', status: 'active', monthlyInflow: 320000, monthlyOutflow: 298000 },
  { id: 'ACC004', name: 'Reserve Fund', type: 'reserve', bankName: 'Punjab National Bank', accountNumber: 'XXXX XXXX 3267', ifscCode: 'PUNB0123400', balance: 5200000, lastUpdated: '2026-02-01', status: 'active', monthlyInflow: 150000, monthlyOutflow: 0 },
  { id: 'ACC005', name: 'Salary Disbursement Account', type: 'operational', bankName: 'Canara Bank', accountNumber: 'XXXX XXXX 8456', ifscCode: 'CNRB0001234', balance: 425000, lastUpdated: '2026-02-10', status: 'active', monthlyInflow: 450000, monthlyOutflow: 445000 },
  { id: 'ACC006', name: 'GST Collection Account', type: 'current', bankName: 'Union Bank', accountNumber: 'XXXX XXXX 6789', ifscCode: 'UBIN0123456', balance: 312400, lastUpdated: '2026-02-09', status: 'active', monthlyInflow: 185000, monthlyOutflow: 172000 },
];

const initialInvoices: FinanceInvoice[] = [
  { id: 'INV001', invoiceNumber: 'BM-2026-0001', date: '2026-02-10', dueDate: '2026-03-10', customer: 'Maharashtra State Revenue Dept', customerGST: '27AAACR1234F1ZA', items: [{ description: 'Caste Certificate Processing (500 units)', qty: 500, rate: 300, amount: 150000 }, { description: 'Document Digitization Service', qty: 1, rate: 25000, amount: 25000 }], subtotal: 175000, gst: 31500, total: 206500, status: 'unpaid', amountPaid: 0, category: 'Government Services' },
  { id: 'INV002', invoiceNumber: 'BM-2026-0002', date: '2026-02-08', dueDate: '2026-03-08', customer: 'Karnataka E-Governance Dept', customerGST: '29AAACK5678G1ZB', items: [{ description: 'Income Certificate Batch Processing', qty: 350, rate: 250, amount: 87500 }], subtotal: 87500, gst: 15750, total: 103250, status: 'paid', amountPaid: 103250, category: 'Government Services' },
  { id: 'INV003', invoiceNumber: 'BM-2026-0003', date: '2026-02-05', dueDate: '2026-02-20', customer: 'Gujarat Municipal Corporation', customerGST: '24AAACG9012H1ZC', items: [{ description: 'Birth Certificate Processing', qty: 200, rate: 200, amount: 40000 }, { description: 'Death Certificate Processing', qty: 80, rate: 200, amount: 16000 }, { description: 'Data Entry & Verification', qty: 1, rate: 15000, amount: 15000 }], subtotal: 71000, gst: 12780, total: 83780, status: 'overdue', amountPaid: 0, category: 'Municipal Services' },
  { id: 'INV004', invoiceNumber: 'BM-2026-0004', date: '2026-02-03', dueDate: '2026-03-03', customer: 'Tamil Nadu Revenue Board', customerGST: '33AAACT3456I1ZD', items: [{ description: 'Land Record Digitization', qty: 1000, rate: 50, amount: 50000 }], subtotal: 50000, gst: 9000, total: 59000, status: 'partially_paid', amountPaid: 30000, category: 'Land Services' },
  { id: 'INV005', invoiceNumber: 'BM-2026-0005', date: '2026-01-28', dueDate: '2026-02-28', customer: 'Rajasthan IT Department', customerGST: '08AAACR7890J1ZE', items: [{ description: 'Digital Signature Setup & Training', qty: 50, rate: 500, amount: 25000 }, { description: 'Annual DSC Renewal', qty: 200, rate: 350, amount: 70000 }], subtotal: 95000, gst: 17100, total: 112100, status: 'paid', amountPaid: 112100, category: 'Digital Services' },
  { id: 'INV006', invoiceNumber: 'BM-2026-0006', date: '2026-01-25', dueDate: '2026-02-25', customer: 'UP District Administration', customerGST: '09AAACU1234K1ZF', items: [{ description: 'Domicile Certificate Processing (400 units)', qty: 400, rate: 275, amount: 110000 }], subtotal: 110000, gst: 19800, total: 129800, status: 'paid', amountPaid: 129800, category: 'Government Services' },
  { id: 'INV007', invoiceNumber: 'BM-2026-0007', date: '2026-01-20', dueDate: '2026-02-20', customer: 'Telangana MSME Board', customerGST: '36AAACT5678L1ZG', items: [{ description: 'MSME Registration Processing', qty: 120, rate: 1500, amount: 180000 }], subtotal: 180000, gst: 32400, total: 212400, status: 'overdue', amountPaid: 100000, category: 'Business Services' },
  { id: 'INV008', invoiceNumber: 'BM-2026-0008', date: '2026-01-15', dueDate: '2026-02-15', customer: 'Madhya Pradesh Revenue', items: [{ description: 'Marriage Certificate Batch', qty: 150, rate: 500, amount: 75000 }], subtotal: 75000, gst: 13500, total: 88500, status: 'cancelled', amountPaid: 0, category: 'Government Services' },
];

const initialBudgets: BudgetItem[] = [
  { id: 'BDG001', category: 'Staff Salaries & Benefits', department: 'Human Resources', allocated: 3500000, spent: 2280000, remaining: 1220000, period: 'FY 2025-26', status: 'on_track', lastUpdated: '2026-02-10' },
  { id: 'BDG002', category: 'Technology & Infrastructure', department: 'IT Department', allocated: 1200000, spent: 945000, remaining: 255000, period: 'FY 2025-26', status: 'at_risk', lastUpdated: '2026-02-09' },
  { id: 'BDG003', category: 'Office Rent & Utilities', department: 'Administration', allocated: 850000, spent: 612000, remaining: 238000, period: 'FY 2025-26', status: 'on_track', lastUpdated: '2026-02-08' },
  { id: 'BDG004', category: 'Marketing & Outreach', department: 'Communications', allocated: 400000, spent: 420000, remaining: -20000, period: 'FY 2025-26', status: 'over_budget', lastUpdated: '2026-02-07' },
  { id: 'BDG005', category: 'Training & Development', department: 'Human Resources', allocated: 300000, spent: 156000, remaining: 144000, period: 'FY 2025-26', status: 'under_utilized', lastUpdated: '2026-02-06' },
  { id: 'BDG006', category: 'Legal & Compliance', department: 'Legal', allocated: 500000, spent: 385000, remaining: 115000, period: 'FY 2025-26', status: 'on_track', lastUpdated: '2026-02-05' },
  { id: 'BDG007', category: 'Vehicle & Transportation', department: 'Logistics', allocated: 250000, spent: 198000, remaining: 52000, period: 'FY 2025-26', status: 'at_risk', lastUpdated: '2026-02-04' },
  { id: 'BDG008', category: 'Insurance & Contingency', department: 'Finance', allocated: 600000, spent: 210000, remaining: 390000, period: 'FY 2025-26', status: 'under_utilized', lastUpdated: '2026-02-03' },
  { id: 'BDG009', category: 'Capital Expenditure', department: 'Operations', allocated: 2000000, spent: 1560000, remaining: 440000, period: 'FY 2025-26', status: 'on_track', lastUpdated: '2026-02-02' },
  { id: 'BDG010', category: 'Miscellaneous & Petty Cash', department: 'Administration', allocated: 150000, spent: 87500, remaining: 62500, period: 'FY 2025-26', status: 'on_track', lastUpdated: '2026-02-01' },
];

const revenueExpenseData: RevenueMonth[] = [
  { month: 'Sep', revenue: 3250000, expenses: 2180000 },
  { month: 'Oct', revenue: 3780000, expenses: 2450000 },
  { month: 'Nov', revenue: 4120000, expenses: 2680000 },
  { month: 'Dec', revenue: 3560000, expenses: 2890000 },
  { month: 'Jan', revenue: 4580000, expenses: 2520000 },
  { month: 'Feb', revenue: 4280000, expenses: 2340000 },
];

// ─── Component ─────────────────────────────────────────────

const Finance = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [transactions, setTransactions] = useLocalStorage<FinanceTransaction[]>('bm-finance-transactions', initialTransactions);
  const [accounts] = useLocalStorage<FinanceAccount[]>('bm-finance-accounts', initialAccounts);
  const [invoices, setInvoices] = useLocalStorage<FinanceInvoice[]>('bm-finance-invoices', initialInvoices);
  const [budgets] = useLocalStorage<BudgetItem[]>('bm-finance-budgets', initialBudgets);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState<string>('all');
  const [txnStatusFilter, setTxnStatusFilter] = useState<string>('all');
  const [invStatusFilter, setInvStatusFilter] = useState<string>('all');
  const [budgetStatusFilter, setBudgetStatusFilter] = useState<string>('all');

  // Modals
  const [viewModal, setViewModal] = useState<{ type: 'transaction' | 'invoice' | 'account' | 'budget'; data: unknown } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  // ─── Formatters ────────────────────────────────────────

  const formatCurrency = (amount: number) => {
    if (Math.abs(amount) >= 10000000) return `${amount < 0 ? '-' : ''}₹${(Math.abs(amount) / 10000000).toFixed(2)} Cr`;
    if (Math.abs(amount) >= 100000) return `${amount < 0 ? '-' : ''}₹${(Math.abs(amount) / 100000).toFixed(2)} L`;
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ─── Computed Stats ────────────────────────────────────

  const overviewStats = useMemo(() => {
    const totalRevenue = transactions.filter(t => t.type === 'credit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const pendingPayments = invoices.filter(i => ['unpaid', 'overdue', 'partially_paid'].includes(i.status)).reduce((s, i) => s + (i.total - i.amountPaid), 0);
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
    const totalBudgetAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
    const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const budgetUtilization = totalBudgetAllocated > 0 ? ((totalBudgetSpent / totalBudgetAllocated) * 100).toFixed(1) : '0';

    return { totalRevenue, totalExpenses, totalBalance, pendingPayments, overdueInvoices, totalBudgetAllocated, totalBudgetSpent, budgetUtilization };
  }, [transactions, accounts, invoices, budgets]);

  // ─── Filtered Data ─────────────────────────────────────

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = searchQuery === '' || t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.reference.toLowerCase().includes(searchQuery.toLowerCase()) || t.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = txnTypeFilter === 'all' || t.type === txnTypeFilter;
      const matchesStatus = txnStatusFilter === 'all' || t.status === txnStatusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, searchQuery, txnTypeFilter, txnStatusFilter]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      const matchesSearch = searchQuery === '' || i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || i.customer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = invStatusFilter === 'all' || i.status === invStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, invStatusFilter]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const matchesSearch = searchQuery === '' || b.category.toLowerCase().includes(searchQuery.toLowerCase()) || b.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = budgetStatusFilter === 'all' || b.status === budgetStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [budgets, searchQuery, budgetStatusFilter]);

  // ─── Actions ───────────────────────────────────────────

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
  }, [setTransactions]);

  const handleDeleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    setDeleteConfirm(null);
  }, [setInvoices]);

  // ─── Status Helpers ────────────────────────────────────

  const getTxnStatusClass = (status: string) => {
    const map: Record<string, string> = { completed: 'success', pending: 'warning', failed: 'danger', cancelled: 'muted' };
    return map[status] || 'default';
  };

  const getInvStatusClass = (status: string) => {
    const map: Record<string, string> = { paid: 'success', unpaid: 'warning', overdue: 'danger', partially_paid: 'info', cancelled: 'muted' };
    return map[status] || 'default';
  };

  const getBudgetStatusClass = (status: string) => {
    const map: Record<string, string> = { on_track: 'success', at_risk: 'warning', over_budget: 'danger', under_utilized: 'info' };
    return map[status] || 'default';
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return <HiOutlineCash />;
      case 'current': return <HiOutlineCreditCard />;
      case 'escrow': return <HiOutlineClipboardCheck />;
      case 'operational': return <HiOutlineSwitchHorizontal />;
      case 'reserve': return <HiOutlineOfficeBuilding />;
      default: return <HiOutlineCurrencyRupee />;
    }
  };

  // ─── Tabs Config ───────────────────────────────────────

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <HiOutlineChartBar /> },
    { id: 'transactions', label: 'Transactions', icon: <HiOutlineSwitchHorizontal /> },
    { id: 'accounts', label: 'Accounts', icon: <HiOutlineOfficeBuilding /> },
    { id: 'invoices', label: 'Invoices', icon: <HiOutlineDocumentText /> },
    { id: 'budgets', label: 'Budgets', icon: <HiOutlineCalculator /> },
  ];

  const maxRevExpValue = Math.max(...revenueExpenseData.map(r => Math.max(r.revenue, r.expenses)));

  // ─── Category Breakdown ────────────────────────────────

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { credits: number; debits: number }>();
    transactions.filter(t => t.status === 'completed').forEach(t => {
      const existing = map.get(t.category) || { credits: 0, debits: 0 };
      if (t.type === 'credit') existing.credits += t.amount;
      else existing.debits += t.amount;
      map.set(t.category, existing);
    });
    return Array.from(map.entries()).map(([category, data]) => ({ category, ...data })).sort((a, b) => (b.credits + b.debits) - (a.credits + a.debits)).slice(0, 8);
  }, [transactions]);

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="fin-module">
      {/* Header */}
      <header className="fin-header">
        <div className="fin-header-left">
          <h1 className="fin-title">Finance</h1>
          <p className="fin-subtitle">Financial management & analytics</p>
        </div>
        <div className="fin-header-right">
          <button className="fin-btn fin-btn--secondary"><HiOutlineDownload /> Export</button>
          <button className="fin-btn fin-btn--secondary"><HiOutlinePrinter /> Print</button>
          <button className="fin-btn fin-btn--primary"><HiOutlinePlus /> New Entry</button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="fin-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`fin-tab ${activeTab === tab.id ? 'fin-tab--active' : ''}`} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}>
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ─── OVERVIEW TAB ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="fin-overview">
          {/* Stat Cards */}
          <div className="fin-stats-grid">
            <div className="fin-stat-card fin-stat-card--revenue">
              <div className="fin-stat-icon"><HiOutlineTrendingUp /></div>
              <div className="fin-stat-body">
                <span className="fin-stat-label">Total Revenue</span>
                <span className="fin-stat-value">{formatCurrency(overviewStats.totalRevenue)}</span>
                <span className="fin-stat-change positive"><HiOutlineTrendingUp /> +12.4% vs last month</span>
              </div>
            </div>
            <div className="fin-stat-card fin-stat-card--expenses">
              <div className="fin-stat-icon"><HiOutlineTrendingDown /></div>
              <div className="fin-stat-body">
                <span className="fin-stat-label">Total Expenses</span>
                <span className="fin-stat-value">{formatCurrency(overviewStats.totalExpenses)}</span>
                <span className="fin-stat-change negative"><HiOutlineTrendingUp /> +5.2% vs last month</span>
              </div>
            </div>
            <div className="fin-stat-card fin-stat-card--balance">
              <div className="fin-stat-icon"><HiOutlineCurrencyRupee /></div>
              <div className="fin-stat-body">
                <span className="fin-stat-label">Total Bank Balance</span>
                <span className="fin-stat-value">{formatCurrency(overviewStats.totalBalance)}</span>
                <span className="fin-stat-meta">{accounts.filter(a => a.status === 'active').length} active accounts</span>
              </div>
            </div>
            <div className="fin-stat-card fin-stat-card--pending">
              <div className="fin-stat-icon"><HiOutlineClock /></div>
              <div className="fin-stat-body">
                <span className="fin-stat-label">Pending Receivables</span>
                <span className="fin-stat-value">{formatCurrency(overviewStats.pendingPayments)}</span>
                <span className="fin-stat-change negative">{overviewStats.overdueInvoices} overdue invoices</span>
              </div>
            </div>
            <div className="fin-stat-card fin-stat-card--budget">
              <div className="fin-stat-icon"><HiOutlineChartBar /></div>
              <div className="fin-stat-body">
                <span className="fin-stat-label">Budget Utilization</span>
                <span className="fin-stat-value">{overviewStats.budgetUtilization}%</span>
                <div className="fin-stat-progress">
                  <div className="fin-stat-progress-bar" style={{ width: `${overviewStats.budgetUtilization}%` }}></div>
                </div>
              </div>
            </div>
            <div className="fin-stat-card fin-stat-card--net">
              <div className="fin-stat-icon"><HiOutlineBadgeCheck /></div>
              <div className="fin-stat-body">
                <span className="fin-stat-label">Net Profit</span>
                <span className="fin-stat-value">{formatCurrency(overviewStats.totalRevenue - overviewStats.totalExpenses)}</span>
                <span className="fin-stat-meta">Margin: {((1 - overviewStats.totalExpenses / overviewStats.totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Revenue vs Expenses Chart + Category Breakdown */}
          <div className="fin-overview-grid">
            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Revenue vs Expenses (6 Months)</h3>
                <div className="fin-chart-legend">
                  <span className="fin-legend-item"><span className="fin-legend-dot" style={{ background: '#22c55e' }}></span> Revenue</span>
                  <span className="fin-legend-item"><span className="fin-legend-dot" style={{ background: '#ef4444' }}></span> Expenses</span>
                </div>
              </div>
              <div className="fin-chart">
                <div className="fin-chart-y-axis">
                  <span>{formatCurrency(maxRevExpValue)}</span>
                  <span>{formatCurrency(maxRevExpValue * 0.66)}</span>
                  <span>{formatCurrency(maxRevExpValue * 0.33)}</span>
                  <span>₹0</span>
                </div>
                <div className="fin-chart-bars">
                  {revenueExpenseData.map((item, idx) => (
                    <div key={idx} className="fin-chart-bar-group">
                      <div className="fin-chart-bar-pair">
                        <div className="fin-chart-bar fin-chart-bar--revenue" style={{ height: `${(item.revenue / maxRevExpValue) * 100}%` }} title={formatCurrency(item.revenue)}>
                          <span className="fin-chart-bar-tip">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="fin-chart-bar fin-chart-bar--expense" style={{ height: `${(item.expenses / maxRevExpValue) * 100}%` }} title={formatCurrency(item.expenses)}>
                          <span className="fin-chart-bar-tip">{formatCurrency(item.expenses)}</span>
                        </div>
                      </div>
                      <span className="fin-chart-bar-label">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Category Breakdown</h3>
              </div>
              <div className="fin-category-list">
                {categoryBreakdown.map((cat, idx) => {
                  const total = cat.credits + cat.debits;
                  const maxTotal = categoryBreakdown[0].credits + categoryBreakdown[0].debits;
                  return (
                    <div key={idx} className="fin-category-item">
                      <div className="fin-category-info">
                        <span className="fin-category-name">{cat.category}</span>
                        <div className="fin-category-amounts">
                          {cat.credits > 0 && <span className="fin-category-credit">+{formatCurrency(cat.credits)}</span>}
                          {cat.debits > 0 && <span className="fin-category-debit">-{formatCurrency(cat.debits)}</span>}
                        </div>
                      </div>
                      <div className="fin-category-bar-wrapper">
                        <div className="fin-category-bar" style={{ width: `${(total / maxTotal) * 100}%` }}>
                          {cat.credits > 0 && <div className="fin-category-bar--credit" style={{ width: `${(cat.credits / total) * 100}%` }}></div>}
                          {cat.debits > 0 && <div className="fin-category-bar--debit" style={{ width: `${(cat.debits / total) * 100}%` }}></div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Transactions (mini) + Account Summary */}
          <div className="fin-overview-grid">
            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Recent Transactions</h3>
                <button className="fin-link-btn" onClick={() => setActiveTab('transactions')}>View all <HiOutlineArrowSmRight /></button>
              </div>
              <div className="fin-mini-txn-list">
                {transactions.slice(0, 6).map(txn => (
                  <div key={txn.id} className="fin-mini-txn" onClick={() => setViewModal({ type: 'transaction', data: txn })}>
                    <div className={`fin-mini-txn-icon fin-mini-txn-icon--${txn.type}`}>
                      {txn.type === 'credit' ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                    </div>
                    <div className="fin-mini-txn-info">
                      <span className="fin-mini-txn-desc">{txn.description}</span>
                      <span className="fin-mini-txn-meta">{formatDate(txn.date)} · {txn.counterparty}</span>
                    </div>
                    <span className={`fin-mini-txn-amount fin-mini-txn-amount--${txn.type}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Account Summary</h3>
                <button className="fin-link-btn" onClick={() => setActiveTab('accounts')}>View all <HiOutlineArrowSmRight /></button>
              </div>
              <div className="fin-account-summary">
                {accounts.slice(0, 4).map(acc => (
                  <div key={acc.id} className="fin-acc-mini" onClick={() => setViewModal({ type: 'account', data: acc })}>
                    <div className="fin-acc-mini-icon">{getAccountTypeIcon(acc.type)}</div>
                    <div className="fin-acc-mini-info">
                      <span className="fin-acc-mini-name">{acc.name}</span>
                      <span className="fin-acc-mini-bank">{acc.bankName}</span>
                    </div>
                    <span className="fin-acc-mini-balance">{formatCurrency(acc.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TRANSACTIONS TAB ─────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="fin-transactions">
          <div className="fin-toolbar">
            <div className="fin-search-box">
              <HiOutlineSearch />
              <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && <button className="fin-search-clear" onClick={() => setSearchQuery('')}><HiOutlineX /></button>}
            </div>
            <select className="fin-filter-select" value={txnTypeFilter} onChange={e => setTxnTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <select className="fin-filter-select" value={txnStatusFilter} onChange={e => setTxnStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="fin-result-count">{filteredTransactions.length} transactions</span>
          </div>

          <div className="fin-table-wrapper">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Reference</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(txn => (
                  <tr key={txn.id}>
                    <td className="fin-td-date">{formatDate(txn.date)}</td>
                    <td>
                      <div className="fin-td-desc">
                        <span className="fin-td-desc-title">{txn.description}</span>
                        <span className="fin-td-desc-sub">{txn.counterparty}</span>
                      </div>
                    </td>
                    <td><span className="fin-td-category">{txn.category}</span></td>
                    <td className="fin-td-ref">{txn.reference}</td>
                    <td className="fin-td-method">{txn.paymentMethod}</td>
                    <td>
                      <span className={`fin-td-amount fin-td-amount--${txn.type}`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </span>
                    </td>
                    <td><span className={`fin-badge fin-badge--${getTxnStatusClass(txn.status)}`}>{txn.status}</span></td>
                    <td>
                      <div className="fin-td-actions">
                        <button className="fin-icon-btn" title="View" onClick={() => setViewModal({ type: 'transaction', data: txn })}><HiOutlineEye /></button>
                        <button className="fin-icon-btn fin-icon-btn--danger" title="Delete" onClick={() => setDeleteConfirm({ type: 'transaction', id: txn.id, name: txn.description })}><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="fin-empty"><HiOutlineSearch /><p>No transactions found</p></div>
            )}
          </div>
        </div>
      )}

      {/* ─── ACCOUNTS TAB ─────────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div className="fin-accounts">
          <div className="fin-accounts-total">
            <div className="fin-accounts-total-label">Combined Balance Across All Accounts</div>
            <div className="fin-accounts-total-value">{formatCurrency(accounts.reduce((s, a) => s + a.balance, 0))}</div>
            <div className="fin-accounts-total-meta">{accounts.length} accounts · {accounts.filter(a => a.status === 'active').length} active</div>
          </div>

          <div className="fin-accounts-grid">
            {accounts.map(acc => (
              <div key={acc.id} className={`fin-account-card fin-account-card--${acc.type}`} onClick={() => setViewModal({ type: 'account', data: acc })}>
                <div className="fin-account-card-header">
                  <div className="fin-account-card-icon">{getAccountTypeIcon(acc.type)}</div>
                  <span className={`fin-badge fin-badge--${acc.status === 'active' ? 'success' : acc.status === 'frozen' ? 'danger' : 'muted'}`}>{acc.status}</span>
                </div>
                <h4 className="fin-account-card-name">{acc.name}</h4>
                <p className="fin-account-card-bank">{acc.bankName} · {acc.accountNumber}</p>
                <div className="fin-account-card-balance">{formatCurrency(acc.balance)}</div>
                <div className="fin-account-card-type">{acc.type.charAt(0).toUpperCase() + acc.type.slice(1)} Account</div>
                <div className="fin-account-card-flow">
                  <div className="fin-account-flow-item">
                    <HiOutlineTrendingUp className="fin-flow-in" />
                    <div>
                      <span className="fin-flow-label">Monthly Inflow</span>
                      <span className="fin-flow-value positive">{formatCurrency(acc.monthlyInflow)}</span>
                    </div>
                  </div>
                  <div className="fin-account-flow-item">
                    <HiOutlineTrendingDown className="fin-flow-out" />
                    <div>
                      <span className="fin-flow-label">Monthly Outflow</span>
                      <span className="fin-flow-value negative">{formatCurrency(acc.monthlyOutflow)}</span>
                    </div>
                  </div>
                </div>
                <div className="fin-account-card-footer">
                  <span>IFSC: {acc.ifscCode}</span>
                  <span>Updated: {formatDate(acc.lastUpdated)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── INVOICES TAB ─────────────────────────────────── */}
      {activeTab === 'invoices' && (
        <div className="fin-invoices">
          <div className="fin-toolbar">
            <div className="fin-search-box">
              <HiOutlineSearch />
              <input type="text" placeholder="Search invoices..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && <button className="fin-search-clear" onClick={() => setSearchQuery('')}><HiOutlineX /></button>}
            </div>
            <select className="fin-filter-select" value={invStatusFilter} onChange={e => setInvStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="fin-result-count">{filteredInvoices.length} invoices</span>
          </div>

          {/* Invoice Summary Cards */}
          <div className="fin-inv-summary">
            <div className="fin-inv-summary-card">
              <span className="fin-inv-summary-label">Total Invoiced</span>
              <span className="fin-inv-summary-value">{formatCurrency(invoices.reduce((s, i) => s + i.total, 0))}</span>
            </div>
            <div className="fin-inv-summary-card">
              <span className="fin-inv-summary-label">Collected</span>
              <span className="fin-inv-summary-value positive">{formatCurrency(invoices.reduce((s, i) => s + i.amountPaid, 0))}</span>
            </div>
            <div className="fin-inv-summary-card">
              <span className="fin-inv-summary-label">Outstanding</span>
              <span className="fin-inv-summary-value negative">{formatCurrency(invoices.reduce((s, i) => s + (i.total - i.amountPaid), 0))}</span>
            </div>
            <div className="fin-inv-summary-card">
              <span className="fin-inv-summary-label">Overdue</span>
              <span className="fin-inv-summary-value danger">{invoices.filter(i => i.status === 'overdue').length} invoices</span>
            </div>
          </div>

          <div className="fin-table-wrapper">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="fin-td-ref">{inv.invoiceNumber}</td>
                    <td className="fin-td-date">{formatDate(inv.date)}</td>
                    <td>
                      <div className="fin-td-desc">
                        <span className="fin-td-desc-title">{inv.customer}</span>
                        {inv.customerGST && <span className="fin-td-desc-sub">GST: {inv.customerGST}</span>}
                      </div>
                    </td>
                    <td><span className="fin-td-category">{inv.category}</span></td>
                    <td className="fin-td-amount--bold">{formatCurrency(inv.total)}</td>
                    <td><span className={inv.amountPaid > 0 ? 'positive' : ''}>{formatCurrency(inv.amountPaid)}</span></td>
                    <td className="fin-td-date">{formatDate(inv.dueDate)}</td>
                    <td><span className={`fin-badge fin-badge--${getInvStatusClass(inv.status)}`}>{inv.status.replace('_', ' ')}</span></td>
                    <td>
                      <div className="fin-td-actions">
                        <button className="fin-icon-btn" title="View" onClick={() => setViewModal({ type: 'invoice', data: inv })}><HiOutlineEye /></button>
                        <button className="fin-icon-btn fin-icon-btn--danger" title="Delete" onClick={() => setDeleteConfirm({ type: 'invoice', id: inv.id, name: inv.invoiceNumber })}><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
              <div className="fin-empty"><HiOutlineSearch /><p>No invoices found</p></div>
            )}
          </div>
        </div>
      )}

      {/* ─── BUDGETS TAB ──────────────────────────────────── */}
      {activeTab === 'budgets' && (
        <div className="fin-budgets">
          <div className="fin-toolbar">
            <div className="fin-search-box">
              <HiOutlineSearch />
              <input type="text" placeholder="Search budgets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && <button className="fin-search-clear" onClick={() => setSearchQuery('')}><HiOutlineX /></button>}
            </div>
            <select className="fin-filter-select" value={budgetStatusFilter} onChange={e => setBudgetStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="over_budget">Over Budget</option>
              <option value="under_utilized">Under Utilized</option>
            </select>
            <span className="fin-result-count">{filteredBudgets.length} budget items</span>
          </div>

          {/* Budget Overview Bar */}
          <div className="fin-budget-overview">
            <div className="fin-budget-overview-header">
              <div>
                <span className="fin-budget-overview-title">Total Budget Allocation (FY 2025-26)</span>
                <span className="fin-budget-overview-value">{formatCurrency(overviewStats.totalBudgetAllocated)}</span>
              </div>
              <div className="fin-budget-overview-stats">
                <div className="fin-budget-stat">
                  <span className="fin-budget-stat-label">Spent</span>
                  <span className="fin-budget-stat-value">{formatCurrency(overviewStats.totalBudgetSpent)}</span>
                </div>
                <div className="fin-budget-stat">
                  <span className="fin-budget-stat-label">Remaining</span>
                  <span className="fin-budget-stat-value positive">{formatCurrency(overviewStats.totalBudgetAllocated - overviewStats.totalBudgetSpent)}</span>
                </div>
                <div className="fin-budget-stat">
                  <span className="fin-budget-stat-label">Utilization</span>
                  <span className="fin-budget-stat-value">{overviewStats.budgetUtilization}%</span>
                </div>
              </div>
            </div>
            <div className="fin-budget-total-bar">
              <div className="fin-budget-total-bar-fill" style={{ width: `${overviewStats.budgetUtilization}%` }}></div>
            </div>
          </div>

          {/* Budget Cards */}
          <div className="fin-budget-grid">
            {filteredBudgets.map(budget => {
              const utilization = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
              return (
                <div key={budget.id} className="fin-budget-card" onClick={() => setViewModal({ type: 'budget', data: budget })}>
                  <div className="fin-budget-card-header">
                    <h4 className="fin-budget-card-name">{budget.category}</h4>
                    <span className={`fin-badge fin-badge--${getBudgetStatusClass(budget.status)}`}>{budget.status.replace('_', ' ')}</span>
                  </div>
                  <p className="fin-budget-card-dept">{budget.department} · {budget.period}</p>
                  <div className="fin-budget-card-amounts">
                    <div className="fin-budget-card-amount">
                      <span className="fin-budget-card-amount-label">Allocated</span>
                      <span className="fin-budget-card-amount-value">{formatCurrency(budget.allocated)}</span>
                    </div>
                    <div className="fin-budget-card-amount">
                      <span className="fin-budget-card-amount-label">Spent</span>
                      <span className="fin-budget-card-amount-value">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div className="fin-budget-card-amount">
                      <span className="fin-budget-card-amount-label">Remaining</span>
                      <span className={`fin-budget-card-amount-value ${budget.remaining < 0 ? 'negative' : 'positive'}`}>{formatCurrency(budget.remaining)}</span>
                    </div>
                  </div>
                  <div className="fin-budget-card-bar">
                    <div className={`fin-budget-card-bar-fill fin-budget-card-bar-fill--${getBudgetStatusClass(budget.status)}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
                  </div>
                  <div className="fin-budget-card-footer">
                    <span>{utilization.toFixed(1)}% utilized</span>
                    <span>Updated: {formatDate(budget.lastUpdated)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredBudgets.length === 0 && (
            <div className="fin-empty"><HiOutlineSearch /><p>No budget items found</p></div>
          )}
        </div>
      )}

      {/* ─── VIEW DETAIL MODAL ────────────────────────────── */}
      {viewModal && (
        <div className="fin-modal-overlay" onClick={() => setViewModal(null)}>
          <div className="fin-modal" onClick={e => e.stopPropagation()}>
            <div className="fin-modal-header">
              <h3 className="fin-modal-title">
                {viewModal.type === 'transaction' && 'Transaction Details'}
                {viewModal.type === 'invoice' && 'Invoice Details'}
                {viewModal.type === 'account' && 'Account Details'}
                {viewModal.type === 'budget' && 'Budget Details'}
              </h3>
              <button className="fin-modal-close" onClick={() => setViewModal(null)}><HiOutlineX /></button>
            </div>
            <div className="fin-modal-body">
              {viewModal.type === 'transaction' && (() => {
                const t = viewModal.data as FinanceTransaction;
                return (
                  <div className="fin-detail">
                    <div className={`fin-detail-amount fin-detail-amount--${t.type}`}>
                      {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <span className={`fin-badge fin-badge--${getTxnStatusClass(t.status)}`}>{t.status}</span>
                    <div className="fin-detail-grid">
                      <div className="fin-detail-row"><span className="fin-detail-label">Description</span><span className="fin-detail-value">{t.description}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Date & Time</span><span className="fin-detail-value">{formatDateTime(t.date)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Category</span><span className="fin-detail-value">{t.category}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Reference</span><span className="fin-detail-value">{t.reference}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Payment Method</span><span className="fin-detail-value">{t.paymentMethod}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Counterparty</span><span className="fin-detail-value">{t.counterparty}</span></div>
                      {t.notes && <div className="fin-detail-row"><span className="fin-detail-label">Notes</span><span className="fin-detail-value">{t.notes}</span></div>}
                    </div>
                  </div>
                );
              })()}
              {viewModal.type === 'invoice' && (() => {
                const inv = viewModal.data as FinanceInvoice;
                return (
                  <div className="fin-detail">
                    <div className="fin-detail-inv-header">
                      <div>
                        <span className="fin-detail-inv-number">{inv.invoiceNumber}</span>
                        <span className={`fin-badge fin-badge--${getInvStatusClass(inv.status)}`}>{inv.status.replace('_', ' ')}</span>
                      </div>
                      <span className="fin-detail-inv-total">{formatCurrency(inv.total)}</span>
                    </div>
                    <div className="fin-detail-grid">
                      <div className="fin-detail-row"><span className="fin-detail-label">Customer</span><span className="fin-detail-value">{inv.customer}</span></div>
                      {inv.customerGST && <div className="fin-detail-row"><span className="fin-detail-label">GST Number</span><span className="fin-detail-value">{inv.customerGST}</span></div>}
                      <div className="fin-detail-row"><span className="fin-detail-label">Invoice Date</span><span className="fin-detail-value">{formatDate(inv.date)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Due Date</span><span className="fin-detail-value">{formatDate(inv.dueDate)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Category</span><span className="fin-detail-value">{inv.category}</span></div>
                    </div>
                    <div className="fin-detail-items-table">
                      <table>
                        <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                        <tbody>
                          {inv.items.map((item, idx) => (
                            <tr key={idx}><td>{item.description}</td><td>{item.qty}</td><td>{formatCurrency(item.rate)}</td><td>{formatCurrency(item.amount)}</td></tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr><td colSpan={3}>Subtotal</td><td>{formatCurrency(inv.subtotal)}</td></tr>
                          <tr><td colSpan={3}>GST (18%)</td><td>{formatCurrency(inv.gst)}</td></tr>
                          <tr className="fin-detail-items-total"><td colSpan={3}>Total</td><td>{formatCurrency(inv.total)}</td></tr>
                          <tr><td colSpan={3}>Amount Paid</td><td className="positive">{formatCurrency(inv.amountPaid)}</td></tr>
                          <tr><td colSpan={3}>Balance Due</td><td className="negative">{formatCurrency(inv.total - inv.amountPaid)}</td></tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })()}
              {viewModal.type === 'account' && (() => {
                const acc = viewModal.data as FinanceAccount;
                return (
                  <div className="fin-detail">
                    <div className="fin-detail-acc-balance">{formatCurrency(acc.balance)}</div>
                    <span className={`fin-badge fin-badge--${acc.status === 'active' ? 'success' : 'muted'}`}>{acc.status}</span>
                    <div className="fin-detail-grid">
                      <div className="fin-detail-row"><span className="fin-detail-label">Account Name</span><span className="fin-detail-value">{acc.name}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Bank</span><span className="fin-detail-value">{acc.bankName}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Account Number</span><span className="fin-detail-value">{acc.accountNumber}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">IFSC Code</span><span className="fin-detail-value">{acc.ifscCode}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Type</span><span className="fin-detail-value">{acc.type.charAt(0).toUpperCase() + acc.type.slice(1)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Monthly Inflow</span><span className="fin-detail-value positive">{formatCurrency(acc.monthlyInflow)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Monthly Outflow</span><span className="fin-detail-value negative">{formatCurrency(acc.monthlyOutflow)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Last Updated</span><span className="fin-detail-value">{formatDate(acc.lastUpdated)}</span></div>
                    </div>
                  </div>
                );
              })()}
              {viewModal.type === 'budget' && (() => {
                const b = viewModal.data as BudgetItem;
                const util = b.allocated > 0 ? ((b.spent / b.allocated) * 100).toFixed(1) : '0';
                return (
                  <div className="fin-detail">
                    <div className="fin-detail-grid">
                      <div className="fin-detail-row"><span className="fin-detail-label">Category</span><span className="fin-detail-value">{b.category}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Department</span><span className="fin-detail-value">{b.department}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Period</span><span className="fin-detail-value">{b.period}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Allocated</span><span className="fin-detail-value">{formatCurrency(b.allocated)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Spent</span><span className="fin-detail-value">{formatCurrency(b.spent)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Remaining</span><span className={`fin-detail-value ${b.remaining < 0 ? 'negative' : 'positive'}`}>{formatCurrency(b.remaining)}</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Utilization</span><span className="fin-detail-value">{util}%</span></div>
                      <div className="fin-detail-row"><span className="fin-detail-label">Status</span><span className={`fin-badge fin-badge--${getBudgetStatusClass(b.status)}`}>{b.status.replace('_', ' ')}</span></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ─────────────────────── */}
      {deleteConfirm && (
        <div className="fin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="fin-modal fin-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="fin-confirm">
              <div className="fin-confirm-icon"><HiOutlineExclamationCircle /></div>
              <h3 className="fin-confirm-title">Confirm Delete</h3>
              <p className="fin-confirm-text">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
              <div className="fin-confirm-actions">
                <button className="fin-btn fin-btn--secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="fin-btn fin-btn--danger" onClick={() => {
                  if (deleteConfirm.type === 'transaction') handleDeleteTransaction(deleteConfirm.id);
                  else if (deleteConfirm.type === 'invoice') handleDeleteInvoice(deleteConfirm.id);
                }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
