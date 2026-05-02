import { useEffect, useState } from 'react';
import { HiOutlineX, HiOutlineLightningBolt } from 'react-icons/hi';
import './ShortcutsHelp.scss';

interface Shortcut {
  keys: string[];
  label: string;
}

interface ShortcutGroup {
  title: string;
  items: Shortcut[];
}

const GROUPS: ShortcutGroup[] = [
  {
    title: 'Global',
    items: [
      { keys: ['Ctrl', 'K'],   label: 'Open command palette / search'   },
      { keys: ['Ctrl', '?'],   label: 'Open this shortcuts cheatsheet'  },
      { keys: ['Esc'],         label: 'Close any open dialog or popup'  },
      { keys: ['Ctrl', 'B'],   label: 'Toggle sidebar collapse'         },
    ],
  },
  {
    title: 'Navigate',
    items: [
      { keys: ['G', 'D'], label: 'Go to Dashboard'    },
      { keys: ['G', 'S'], label: 'Go to Services'     },
      { keys: ['G', 'A'], label: 'Go to Applications' },
      { keys: ['G', 'U'], label: 'Go to Users'        },
      { keys: ['G', 'W'], label: 'Go to Wallet'       },
      { keys: ['G', 'R'], label: 'Go to Reports'      },
    ],
  },
  {
    title: 'Create',
    items: [
      { keys: ['N', 'A'], label: 'New application' },
      { keys: ['N', 'S'], label: 'New service'     },
      { keys: ['N', 'U'], label: 'New citizen'     },
      { keys: ['N', 'T'], label: 'New task / event in Calendar' },
    ],
  },
];

interface ShortcutsHelpProps {
  hotkey?: string; // default '?'
}

const ShortcutsHelp = ({ hotkey = '?' }: ShortcutsHelpProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Open: Ctrl-? (Shift-Slash)
      if ((e.ctrlKey || e.metaKey) && e.key === hotkey) {
        e.preventDefault();
        setOpen(o => !o);
      }
      // Close on Esc
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hotkey]);

  if (!open) return null;

  return (
    <>
      <div className="bm-sk-backdrop" onClick={() => setOpen(false)} />
      <div className="bm-sk" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <div className="bm-sk-head">
          <div className="bm-sk-title">
            <HiOutlineLightningBolt />
            <span>Keyboard shortcuts</span>
          </div>
          <button className="bm-sk-close" onClick={() => setOpen(false)} aria-label="Close">
            <HiOutlineX />
          </button>
        </div>
        <div className="bm-sk-body">
          {GROUPS.map(g => (
            <div key={g.title} className="bm-sk-group">
              <div className="bm-sk-group-title">{g.title}</div>
              {g.items.map((s, i) => (
                <div key={i} className="bm-sk-row">
                  <div className="bm-sk-row-keys">
                    {s.keys.map((k, ki) => (
                      <kbd key={ki}>{k}</kbd>
                    ))}
                  </div>
                  <div className="bm-sk-row-label">{s.label}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="bm-sk-foot">
          Press <kbd>Esc</kbd> or click outside to close
        </div>
      </div>
    </>
  );
};

export default ShortcutsHelp;
