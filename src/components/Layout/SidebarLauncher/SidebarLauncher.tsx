import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineX,
  HiOutlineCalendar, HiOutlineBookOpen,
  HiOutlineCog, HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';
import './SidebarLauncher.scss';

interface PopupItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PLANNER_ITEMS: PopupItem[] = [
  {
    path: '/calendar',
    label: 'Calendar',
    description: 'Tasks, events, deadlines & shared notes',
    icon: <HiOutlineCalendar />,
  },
  {
    path: '/notebook',
    label: 'Notebook',
    description: 'Personal & shared notes, sticky notes, playbooks',
    icon: <HiOutlineBookOpen />,
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

  const go = (path: string) => {
    setOpenPanel(null);
    navigate(path);
  };

  return (
    <div className="bm-sl" ref={wrapRef}>
      <div className={`bm-sl-row ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Planner — opens popup with Calendar + Notebook */}
        <button
          className={`bm-sl-btn ${openPanel === 'planner' ? 'open' : ''}`}
          onClick={() => setOpenPanel(p => p === 'planner' ? null : 'planner')}
          aria-label="Open planner"
        >
          {openPanel === 'planner' ? <HiOutlineX /> : <HiOutlineSparkles />}
          <span className="bm-sl-tooltip">Planner</span>
        </button>

        {/* Shortcuts */}
        <button className="bm-sl-btn" onClick={() => go('/shortcuts')} aria-label="Shortcuts">
          <HiOutlineLightningBolt />
          <span className="bm-sl-tooltip">Shortcuts</span>
        </button>

        {/* Settings */}
        <button className="bm-sl-btn" onClick={() => go('/settings')} aria-label="Settings">
          <HiOutlineCog />
          <span className="bm-sl-tooltip">Settings</span>
        </button>

        {/* Help */}
        <button className="bm-sl-btn" onClick={() => go('/help')} aria-label="Help">
          <HiOutlineQuestionMarkCircle />
          <span className="bm-sl-tooltip">Help</span>
        </button>
      </div>

      {/* Planner popup — Calendar + Notebook */}
      <div className={`bm-sl-panel ${openPanel === 'planner' ? 'open' : ''}`}>
        <div className="bm-sl-panel-head">
          <div className="bm-sl-panel-title">Planner</div>
          <button className="bm-sl-panel-close" onClick={() => setOpenPanel(null)} aria-label="Close">
            <HiOutlineX />
          </button>
        </div>
        <div className="bm-sl-panel-grid">
          {PLANNER_ITEMS.map(it => (
            <button
              key={it.path}
              className="bm-sl-panel-item"
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
