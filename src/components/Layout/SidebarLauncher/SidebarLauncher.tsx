import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineX,
  HiOutlineCalendar, HiOutlineBookOpen,
} from 'react-icons/hi';
import './SidebarLauncher.scss';

interface PopupItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const PLANNER_ITEMS: PopupItem[] = [
  {
    path: '/calendar',
    label: 'Calendar',
    description: 'Tasks, events, deadlines & shared notes',
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
];

interface SidebarLauncherProps {
  isCollapsed: boolean;
}

const SidebarLauncher = ({ isCollapsed }: SidebarLauncherProps) => {
  const [openPanel, setOpenPanel] = useState<'planner' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!openPanel) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPanel]);

  // Close on route change + Esc
  useEffect(() => { setOpenPanel(null); }, [location.pathname]);
  useEffect(() => {
    if (!openPanel) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenPanel(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openPanel]);

  const handleShortcuts = () => {
    setOpenPanel(null);
    navigate('/shortcuts');
  };

  return (
    <div className="bm-sl" ref={wrapRef}>
      {/* Planner button — opens popup with Calendar + Notebook */}
      <button
        className={`bm-sl-btn bm-sl-btn-planner ${openPanel === 'planner' ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        onClick={() => setOpenPanel(p => p === 'planner' ? null : 'planner')}
        title={isCollapsed ? 'Planner' : undefined}
        aria-label="Open planner"
      >
        <span className="bm-sl-btn-rays" />
        <span className="bm-sl-btn-glow" />
        <span className="bm-sl-btn-icon">
          {openPanel === 'planner' ? <HiOutlineX /> : <HiOutlineSparkles />}
        </span>
        {!isCollapsed && <span className="bm-sl-btn-label">Planner</span>}
      </button>

      {/* Shortcuts button — navigates to /shortcuts */}
      <button
        className={`bm-sl-btn bm-sl-btn-shortcuts ${isCollapsed ? 'collapsed' : ''}`}
        onClick={handleShortcuts}
        title={isCollapsed ? 'Shortcuts' : undefined}
        aria-label="Shortcuts"
      >
        <span className="bm-sl-btn-rays" />
        <span className="bm-sl-btn-glow" />
        <span className="bm-sl-btn-icon">
          <HiOutlineLightningBolt />
        </span>
        {!isCollapsed && <span className="bm-sl-btn-label">Shortcuts</span>}
      </button>

      {/* Planner popup — Calendar + Notebook */}
      <div className={`bm-sl-panel ${openPanel === 'planner' ? 'open' : ''} ${isCollapsed ? 'anchor-collapsed' : ''}`}>
        <div className="bm-sl-panel-head">
          <div>
            <div className="bm-sl-panel-title">Planner ✨</div>
            <div className="bm-sl-panel-subtitle">Pick your workspace</div>
          </div>
          <button className="bm-sl-panel-close" onClick={() => setOpenPanel(null)} aria-label="Close">
            <HiOutlineX />
          </button>
        </div>
        <div className="bm-sl-panel-grid">
          {PLANNER_ITEMS.map((it, idx) => (
            <button
              key={it.path}
              className="bm-sl-panel-item"
              style={{ background: it.gradient, animationDelay: `${idx * 60}ms` }}
              onClick={() => { navigate(it.path); setOpenPanel(null); }}
            >
              <div className="bm-sl-panel-item-icon">{it.icon}</div>
              <div className="bm-sl-panel-item-body">
                <div className="bm-sl-panel-item-label">{it.label}</div>
                <div className="bm-sl-panel-item-desc">{it.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarLauncher;
