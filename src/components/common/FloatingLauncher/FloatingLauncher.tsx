import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineCalendar, HiOutlineBookOpen, HiOutlineCash, HiOutlineX,
  HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineCreditCard,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import './FloatingLauncher.scss';

interface LaunchItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const ITEMS: LaunchItem[] = [
  {
    path: '/calendar',
    label: 'Calendar',
    description: 'Tasks, events, deadlines & notes for the team',
    icon: <HiOutlineCalendar />,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    path: '/notebook',
    label: 'Notebook',
    description: 'Personal & shared notes, sticky notes, playbooks',
    icon: <HiOutlineBookOpen />,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    path: '/wallet',
    label: 'Wallet',
    description: 'Balance, top-ups, payouts & service charges',
    icon: <HiOutlineCash />,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    path: '/transactions',
    label: 'Transactions',
    description: 'All wallet activity with filters & export',
    icon: <HiOutlineCreditCard />,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    path: '/documents',
    label: 'Documents',
    description: 'Files, certificates, agent uploads',
    icon: <HiOutlineDocumentText />,
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  },
];

const FloatingLauncher = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="bm-fl" ref={wrapRef}>
      {/* Popup panel */}
      <div className={`bm-fl-panel ${open ? 'open' : ''}`}>
        <div className="bm-fl-panel-head">
          <div>
            <div className="bm-fl-greeting">{greeting} ✨</div>
            <div className="bm-fl-subtitle">Quick access to your tools</div>
          </div>
          <button className="bm-fl-close" onClick={() => setOpen(false)} aria-label="Close">
            <HiOutlineX />
          </button>
        </div>

        <div className="bm-fl-grid">
          {ITEMS.map((it, idx) => (
            <button
              key={it.path}
              className="bm-fl-item"
              style={{
                background: it.gradient,
                animationDelay: `${idx * 50}ms`,
              }}
              onClick={() => { navigate(it.path); setOpen(false); }}
            >
              <div className="bm-fl-item-icon">{it.icon}</div>
              <div className="bm-fl-item-body">
                <div className="bm-fl-item-label">{it.label}</div>
                <div className="bm-fl-item-desc">{it.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="bm-fl-panel-foot">
          <span><HiOutlineLightningBolt /> Tip: hit Esc to close</span>
        </div>
      </div>

      {/* Floating button */}
      <button
        className={`bm-fl-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close quick access' : 'Open quick access'}
      >
        <span className="bm-fl-btn-rays" />
        <span className="bm-fl-btn-glow" />
        <span className="bm-fl-btn-icon">
          {open ? <HiOutlineX /> : <HiOutlineSparkles />}
        </span>
      </button>
    </div>
  );
};

export default FloatingLauncher;
