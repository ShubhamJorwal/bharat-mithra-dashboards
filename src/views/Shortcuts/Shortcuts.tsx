import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineLightningBolt,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineGlobe,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFolder,
} from 'react-icons/hi';
import { PageHeader } from '../../components/common/PageHeader';
import './Shortcuts.scss';

interface ShortcutItem {
  label: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  // Navigation
  { label: 'Dashboard', description: 'Go to main dashboard', path: '/', icon: <HiOutlineHome />, color: '#3b82f6', category: 'Navigation' },
  { label: 'Services Portal', description: 'Browse all services', path: '/services/portal', icon: <HiOutlineCollection />, color: '#8b5cf6', category: 'Navigation' },
  { label: 'Applications', description: 'View all applications', path: '/applications', icon: <HiOutlineClipboardList />, color: '#f59e0b', category: 'Navigation' },
  { label: 'Documents', description: 'Manage documents', path: '/documents', icon: <HiOutlineDocumentText />, color: '#06b6d4', category: 'Navigation' },
  { label: 'Calendar', description: 'View calendar events', path: '/calendar', icon: <HiOutlineCalendar />, color: '#10b981', category: 'Navigation' },
  { label: 'Reports', description: 'Generate and view reports', path: '/reports', icon: <HiOutlineChartBar />, color: '#ec4899', category: 'Navigation' },
  { label: 'Geography', description: 'India geography data', path: '/geography', icon: <HiOutlineGlobe />, color: '#14b8a6', category: 'Navigation' },
  { label: 'Staff Members', description: 'Manage staff', path: '/staff', icon: <HiOutlineUserGroup />, color: '#6366f1', category: 'Navigation' },

  // Quick Actions
  { label: 'New Application', description: 'Create new application', path: '/applications/new', icon: <HiOutlinePlus />, color: '#22c55e', category: 'Quick Actions' },
  { label: 'Upload Document', description: 'Upload a new document', path: '/documents', icon: <HiOutlineFolder />, color: '#0ea5e9', category: 'Quick Actions' },
  { label: 'Wallet Statements', description: 'View wallet transactions', path: '/statements/wallet', icon: <HiOutlineCash />, color: '#f97316', category: 'Quick Actions' },
  { label: 'Payment Gateways', description: 'Manage payment methods', path: '/payment-gateways', icon: <HiOutlineCreditCard />, color: '#a855f7', category: 'Quick Actions' },

  // Admin
  { label: 'User Management', description: 'Manage users', path: '/users', icon: <HiOutlineUserGroup />, color: '#ef4444', category: 'Administration' },
  { label: 'Settings', description: 'App settings', path: '/settings', icon: <HiOutlineCog />, color: '#64748b', category: 'Administration' },
  { label: 'All Services', description: 'Manage service catalog', path: '/services', icon: <HiOutlineCollection />, color: '#d946ef', category: 'Administration' },
  { label: 'Service Categories', description: 'Manage categories', path: '/services/categories', icon: <HiOutlineCollection />, color: '#0891b2', category: 'Administration' },
];

const keyboardShortcuts = [
  { keys: ['Ctrl', '/'], description: 'Open search' },
  { keys: ['Ctrl', 'N'], description: 'New application' },
  { keys: ['Ctrl', 'D'], description: 'Go to dashboard' },
  { keys: ['Ctrl', 'S'], description: 'Go to services' },
  { keys: ['Ctrl', ','], description: 'Open settings' },
  { keys: ['Esc'], description: 'Close modal/popup' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
];

const Shortcuts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [...new Set(shortcuts.map(s => s.category))];

  const filteredShortcuts = shortcuts.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sc-page">
      <PageHeader
        icon={<HiOutlineLightningBolt />}
        title="Shortcuts"
        description="Quick access to all modules and keyboard shortcuts"
      />

      {/* Search */}
      <div className="sc-search">
        <HiOutlineSearch />
        <input type="text" placeholder="Search shortcuts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {/* Quick Access Grid */}
      {categories.map(category => {
        const items = filteredShortcuts.filter(s => s.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="sc-section">
            <h2 className="sc-section__title">{category}</h2>
            <div className="sc-grid">
              {items.map(item => (
                <button key={item.path + item.label} className="sc-item" onClick={() => navigate(item.path)}>
                  <div className="sc-item__icon" style={{ color: item.color, background: `${item.color}15` }}>
                    {item.icon}
                  </div>
                  <div className="sc-item__info">
                    <span className="sc-item__label">{item.label}</span>
                    <span className="sc-item__desc">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Keyboard Shortcuts */}
      <div className="sc-section">
        <h2 className="sc-section__title">Keyboard Shortcuts</h2>
        <div className="sc-keyboard-card">
          {keyboardShortcuts.map((ks, i) => (
            <div key={i} className="sc-keyboard-row">
              <div className="sc-keys">
                {ks.keys.map((key, j) => (
                  <span key={j}>
                    <kbd className="sc-kbd">{key}</kbd>
                    {j < ks.keys.length - 1 && <span className="sc-kbd-plus">+</span>}
                  </span>
                ))}
              </div>
              <span className="sc-keyboard-desc">{ks.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shortcuts;
