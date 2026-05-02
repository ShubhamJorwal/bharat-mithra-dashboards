import { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineBookOpen, HiOutlinePlus, HiOutlineSearch, HiOutlineX,
  HiOutlineTrash, HiOutlinePencil, HiOutlineUserGroup, HiOutlineUser,
  HiOutlineRefresh, HiOutlineTag, HiOutlineDotsVertical, HiOutlineStar,
  HiOutlineCheck, HiOutlineSave, HiOutlineDocumentText,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import {
  loadNotebooks, loadPages, loadStickies, loadLabels,
  createNotebook, updateNotebook, deleteNotebook,
  createPage, updatePage, deletePage,
  createSticky, updateSticky, deleteSticky,
  subscribe, getViewer, setViewer, getStaff,
  STAFF_DIRECTORY, NOTEBOOK_COLORS, STICKY_COLORS, isVisibleTo,
  type Notebook, type NotebookPage, type StickyNote, type Label, type StaffLite,
} from '@/services/planner/plannerStore';
import './Notebook.scss';

type Scope = 'foryou' | 'shared' | 'all';

const Notebook = () => {
  const [viewer, setViewerState] = useState<StaffLite>(getViewer());
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [pages, setPages] = useState<NotebookPage[]>([]);
  const [stickies, setStickies] = useState<StickyNote[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [scope, setScope] = useState<Scope>('foryou');
  const [search, setSearch] = useState('');
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [showCreateNotebook, setShowCreateNotebook] = useState(false);
  const [showStickies, setShowStickies] = useState(true);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);

  const refresh = () => {
    setViewerState(getViewer());
    setNotebooks(loadNotebooks());
    setPages(loadPages());
    setStickies(loadStickies());
    setLabels(loadLabels());
  };

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, []);

  // Filter notebooks by scope + visibility
  const visibleNotebooks = useMemo(() => {
    let nbs = notebooks.filter(n => isVisibleTo(n, viewer.id) && !n.archived);
    if (scope === 'foryou') nbs = nbs.filter(n => n.createdBy === viewer.id);
    if (scope === 'shared') nbs = nbs.filter(n => n.createdBy !== viewer.id);
    return nbs.sort((a, b) => {
      // pinned first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notebooks, viewer, scope]);

  // Auto-select first notebook on load
  useEffect(() => {
    if (!activeNotebookId && visibleNotebooks.length > 0) {
      setActiveNotebookId(visibleNotebooks[0].id);
    }
  }, [visibleNotebooks, activeNotebookId]);

  const activeNotebook = notebooks.find(n => n.id === activeNotebookId) || null;

  const visiblePages = useMemo(() => {
    if (!activeNotebookId) return [];
    let pgs = pages.filter(p => p.notebookId === activeNotebookId && isVisibleTo(p, viewer.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      pgs = pgs.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    }
    return pgs.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [pages, activeNotebookId, viewer, search]);

  // Auto-select first page
  useEffect(() => {
    if (visiblePages.length > 0) {
      if (!activePageId || !visiblePages.find(p => p.id === activePageId)) {
        setActivePageId(visiblePages[0].id);
      }
    } else {
      setActivePageId(null);
    }
  }, [visiblePages, activePageId]);

  const activePage = pages.find(p => p.id === activePageId) || null;

  // Visible stickies for current viewer
  const myStickies = useMemo(() =>
    stickies.filter(s => s.createdBy === viewer.id).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }),
    [stickies, viewer.id]
  );

  // Stats
  const stats = useMemo(() => ({
    notebooks: visibleNotebooks.length,
    pages: pages.filter(p => isVisibleTo(p, viewer.id)).length,
    stickies: myStickies.length,
    pinned: visibleNotebooks.filter(n => n.pinned).length,
  }), [visibleNotebooks, pages, viewer, myStickies]);

  const handleCreatePage = () => {
    if (!activeNotebookId) return;
    const pg = createPage({
      notebookId: activeNotebookId,
      title: 'Untitled',
      content: '# Untitled\n\nStart writing…',
      labels: [],
      pinned: false,
      createdBy: viewer.id,
      sharedWith: [viewer.id],
      coverColor: NOTEBOOK_COLORS[Math.floor(Math.random() * NOTEBOOK_COLORS.length)],
    });
    setActivePageId(pg.id);
    refresh();
  };

  return (
    <div className="bm-nb-page">
      <PageHeader
        icon={<HiOutlineBookOpen />}
        title="Notebook"
        description="Capture ideas, build playbooks, share notes with the team."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bm-btn" onClick={refresh}><HiOutlineRefresh /></button>
            <button className="bm-btn" onClick={() => setShowStickies(s => !s)}>
              <HiOutlineLightningBolt /> Sticky notes
            </button>
            <button className="bm-btn bm-btn-primary" onClick={() => setShowCreateNotebook(true)}>
              <HiOutlinePlus /> New notebook
            </button>
          </div>
        }
      />

      {/* Stat strip */}
      <div className="bm-nb-stats">
        <StatCard label="Notebooks" value={stats.notebooks} tone="primary" />
        <StatCard label="Pages" value={stats.pages} tone="success" />
        <StatCard label="Sticky notes" value={stats.stickies} tone="warn" />
        <StatCard label="Pinned" value={stats.pinned} tone="danger" />
      </div>

      {/* Toolbar */}
      <div className="bm-nb-toolbar">
        <div className="bm-cal-viewer">
          <span className="bm-cal-viewer-label">Viewing as</span>
          <select
            value={viewer.id}
            onChange={e => { setViewer(e.target.value); refresh(); }}
            className="bm-cal-viewer-select"
            style={{ borderLeftColor: viewer.color }}
          >
            {STAFF_DIRECTORY.map(s => (
              <option key={s.id} value={s.id}>{s.initials} · {s.name} ({s.role})</option>
            ))}
          </select>
        </div>
        <div className="bm-cal-scope">
          <button className={`bm-cal-scope-tab ${scope === 'foryou' ? 'active' : ''}`} onClick={() => setScope('foryou')}>
            <HiOutlineUser /> For you
          </button>
          <button className={`bm-cal-scope-tab ${scope === 'shared' ? 'active' : ''}`} onClick={() => setScope('shared')}>
            <HiOutlineUserGroup /> Shared with me
          </button>
          <button className={`bm-cal-scope-tab ${scope === 'all' ? 'active' : ''}`} onClick={() => setScope('all')}>
            All
          </button>
        </div>
        <div className="bm-cal-search">
          <HiOutlineSearch />
          <input
            placeholder="Search pages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><HiOutlineX /></button>}
        </div>
      </div>

      {/* 3-column workspace: notebooks | pages | editor */}
      <div className={`bm-nb-workspace ${showStickies ? 'with-stickies' : ''}`}>

        {/* Notebooks list */}
        <aside className="bm-nb-notebooks">
          <div className="bm-nb-section-head">
            <span>Notebooks ({visibleNotebooks.length})</span>
          </div>
          <div className="bm-nb-notebook-list">
            {visibleNotebooks.length === 0 ? (
              <div className="bm-nb-empty">
                <p>No notebooks yet.</p>
                <button className="bm-btn bm-btn-primary" onClick={() => setShowCreateNotebook(true)}>
                  <HiOutlinePlus /> New
                </button>
              </div>
            ) : visibleNotebooks.map(nb => {
              const isActive = nb.id === activeNotebookId;
              const owner = getStaff(nb.createdBy);
              const pageCount = pages.filter(p => p.notebookId === nb.id && isVisibleTo(p, viewer.id)).length;
              return (
                <button
                  key={nb.id}
                  className={`bm-nb-notebook ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveNotebookId(nb.id)}
                  style={{ borderLeftColor: nb.color }}
                >
                  <div className="bm-nb-notebook-emoji">{nb.emoji || '📒'}</div>
                  <div className="bm-nb-notebook-body">
                    <div className="bm-nb-notebook-title">
                      {nb.pinned && <HiOutlineStar className="bm-nb-pinned-star" />}
                      {nb.title}
                    </div>
                    <div className="bm-nb-notebook-meta">
                      {pageCount} page{pageCount === 1 ? '' : 's'}
                      {nb.sharedWith.includes('*') && <span className="bm-nb-shared-tag">All staff</span>}
                      {owner && owner.id !== viewer.id && (
                        <span className="bm-nb-owner-tag" style={{ background: owner.color }}>
                          {owner.initials}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Pages list */}
        <aside className="bm-nb-pages">
          <div className="bm-nb-section-head">
            <span>{activeNotebook ? activeNotebook.title : 'Pages'}</span>
            {activeNotebook && (
              <div className="bm-nb-section-actions">
                <button
                  className="bm-nb-section-btn"
                  onClick={() => updateNotebook(activeNotebook.id, { pinned: !activeNotebook.pinned })}
                  title={activeNotebook.pinned ? 'Unpin' : 'Pin'}
                >
                  <HiOutlineStar style={activeNotebook.pinned ? { color: '#f59e0b', fill: '#f59e0b' } : {}} />
                </button>
                <button className="bm-nb-section-btn" onClick={() => setEditingNotebook(activeNotebook)} title="Settings">
                  <HiOutlinePencil />
                </button>
                <button
                  className="bm-nb-section-btn"
                  onClick={() => {
                    if (confirm(`Delete notebook "${activeNotebook.title}" and all its pages?`)) {
                      deleteNotebook(activeNotebook.id);
                      setActiveNotebookId(null);
                      refresh();
                    }
                  }}
                  title="Delete notebook"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            )}
          </div>
          {activeNotebook ? (
            <>
              <button className="bm-nb-add-page" onClick={handleCreatePage}>
                <HiOutlinePlus /> New page
              </button>
              <div className="bm-nb-page-list">
                {visiblePages.length === 0 ? (
                  <div className="bm-nb-empty">
                    <p>No pages yet.</p>
                  </div>
                ) : visiblePages.map(p => {
                  const isActive = p.id === activePageId;
                  const owner = getStaff(p.createdBy);
                  return (
                    <button
                      key={p.id}
                      className={`bm-nb-page-card ${isActive ? 'active' : ''}`}
                      onClick={() => setActivePageId(p.id)}
                      style={{ borderTopColor: p.coverColor || activeNotebook.color }}
                    >
                      <div className="bm-nb-page-card-head">
                        <span className="bm-nb-page-emoji">{p.emoji || '📄'}</span>
                        {p.pinned && <HiOutlineStar style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                        {owner && owner.id !== viewer.id && (
                          <span className="bm-nb-owner-tag" style={{ background: owner.color }}>
                            {owner.initials}
                          </span>
                        )}
                      </div>
                      <div className="bm-nb-page-title">{p.title}</div>
                      <div className="bm-nb-page-preview">
                        {p.content.replace(/[#*`\-\[\]]/g, '').trim().slice(0, 80) || 'Empty page'}
                      </div>
                      {p.labels.length > 0 && (
                        <div className="bm-nb-page-labels">
                          {p.labels.slice(0, 3).map(lid => {
                            const lbl = labels.find(l => l.id === lid);
                            if (!lbl) return null;
                            return (
                              <span key={lid} className="bm-nb-label-mini" style={{ background: lbl.color }}>
                                {lbl.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="bm-nb-page-time">
                        Edited {fmtRelative(p.updatedAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bm-nb-empty">
              <p>Select a notebook to see its pages.</p>
            </div>
          )}
        </aside>

        {/* Editor */}
        <main className="bm-nb-editor-pane">
          {activePage ? (
            <PageEditor
              page={activePage}
              labels={labels}
              viewer={viewer}
              onChange={(patch) => { updatePage(activePage.id, patch); refresh(); }}
              onDelete={() => {
                if (confirm(`Delete page "${activePage.title}"?`)) {
                  deletePage(activePage.id);
                  setActivePageId(null);
                  refresh();
                }
              }}
            />
          ) : activeNotebook ? (
            <div className="bm-nb-editor-empty">
              <HiOutlineDocumentText />
              <h3>No page selected</h3>
              <p>Pick a page from the list, or create a new one.</p>
              <button className="bm-btn bm-btn-primary" onClick={handleCreatePage}>
                <HiOutlinePlus /> New page
              </button>
            </div>
          ) : (
            <div className="bm-nb-editor-empty">
              <HiOutlineBookOpen />
              <h3>Pick a notebook</h3>
              <p>Or create a new one to start writing.</p>
            </div>
          )}
        </main>

        {/* Sticky notes pane */}
        {showStickies && (
          <aside className="bm-nb-stickies">
            <div className="bm-nb-section-head">
              <span><HiOutlineLightningBolt /> Sticky notes</span>
              <button className="bm-nb-section-btn" onClick={() => setShowStickies(false)} title="Hide">
                <HiOutlineX />
              </button>
            </div>
            <StickyComposer onAdd={(body, color) => { createSticky(body, color, viewer.id); refresh(); }} />
            <div className="bm-nb-sticky-list">
              {myStickies.length === 0 ? (
                <div className="bm-nb-empty"><p>No sticky notes yet.</p></div>
              ) : myStickies.map(s => (
                <StickyCard
                  key={s.id}
                  sticky={s}
                  onUpdate={(patch) => { updateSticky(s.id, patch); refresh(); }}
                  onDelete={() => { deleteSticky(s.id); refresh(); }}
                />
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Create / edit notebook modal */}
      {(showCreateNotebook || editingNotebook) && (
        <NotebookModal
          existing={editingNotebook}
          viewer={viewer}
          onClose={() => { setShowCreateNotebook(false); setEditingNotebook(null); }}
          onSave={(input) => {
            if (editingNotebook) {
              updateNotebook(editingNotebook.id, input);
            } else {
              const nb = createNotebook({
                ...input,
                createdBy: viewer.id,
                pinned: false,
                archived: false,
              });
              setActiveNotebookId(nb.id);
            }
            setShowCreateNotebook(false);
            setEditingNotebook(null);
            refresh();
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone: string }) => (
  <div className={`bm-nb-stat tone-${tone}`}>
    <div className="bm-nb-stat-value">{value}</div>
    <div className="bm-nb-stat-label">{label}</div>
  </div>
);

const fmtRelative = (s: string) => {
  const diff = Date.now() - new Date(s).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

// ─── Page editor ──────────────────────────────────────────────────────

interface PageEditorProps {
  page: NotebookPage;
  labels: Label[];
  viewer: StaffLite;
  onChange: (patch: Partial<NotebookPage>) => void;
  onDelete: () => void;
}

const PageEditor = ({ page, labels, viewer, onChange, onDelete }: PageEditorProps) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [emoji, setEmoji] = useState(page.emoji || '📄');
  const [coverColor, setCoverColor] = useState(page.coverColor || NOTEBOOK_COLORS[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [savedTimer, setSavedTimer] = useState<number | null>(null);

  // Sync local state when page changes (when user clicks a different page)
  useEffect(() => {
    setTitle(page.title);
    setContent(page.content);
    setEmoji(page.emoji || '📄');
    setCoverColor(page.coverColor || NOTEBOOK_COLORS[0]);
  }, [page.id]);

  // Auto-save (debounced)
  useEffect(() => {
    if (title === page.title && content === page.content && emoji === page.emoji && coverColor === page.coverColor) return;
    const t = setTimeout(() => {
      onChange({ title, content, emoji, coverColor });
      setSavedTimer(Date.now());
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, emoji, coverColor]);

  const owner = getStaff(page.createdBy);

  const toggleLabel = (lid: string) => {
    const newLabels = page.labels.includes(lid)
      ? page.labels.filter(l => l !== lid)
      : [...page.labels, lid];
    onChange({ labels: newLabels });
  };

  return (
    <div className="bm-nb-editor">
      <div className="bm-nb-editor-cover" style={{ background: `linear-gradient(135deg, ${coverColor} 0%, ${coverColor}88 100%)` }}>
        <div className="bm-nb-editor-cover-actions">
          <button className="bm-nb-cover-btn" onClick={() => setShowSettings(s => !s)}>
            <HiOutlineDotsVertical />
          </button>
        </div>
      </div>

      <div className="bm-nb-editor-content">
        <div className="bm-nb-editor-emoji">
          <button className="bm-nb-emoji-btn">
            {emoji}
          </button>
          <div className="bm-nb-emoji-picker">
            {['📄','📝','📒','📕','📗','📘','📙','📓','📔','✅','💡','🎯','🚀','🔥','⭐','🌟','🎨','📊','📈','🛠️','🔌','🤝','🎓','📍'].map(e => (
              <button key={e} onClick={() => setEmoji(e)}>{e}</button>
            ))}
          </div>
        </div>

        <input
          className="bm-nb-editor-title"
          placeholder="Untitled"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <div className="bm-nb-editor-meta">
          <button
            className="bm-nb-pin-btn"
            onClick={() => onChange({ pinned: !page.pinned })}
            title={page.pinned ? 'Unpin' : 'Pin'}
          >
            <HiOutlineStar style={page.pinned ? { color: '#f59e0b', fill: '#f59e0b' } : {}} />
            {page.pinned ? 'Pinned' : 'Pin'}
          </button>
          {owner && (
            <span className="bm-nb-meta-item">
              <span className="bm-nb-staff-initials" style={{ background: owner.color }}>{owner.initials}</span>
              {owner.name}
              {owner.id === viewer.id && <em>(you)</em>}
            </span>
          )}
          <span className="bm-nb-meta-item">Edited {fmtRelative(page.updatedAt)}</span>
          {savedTimer && Date.now() - savedTimer < 2000 && (
            <span className="bm-nb-meta-item bm-nb-saved"><HiOutlineCheck /> Saved</span>
          )}
        </div>

        <div className="bm-nb-editor-labels">
          <span className="bm-nb-labels-label"><HiOutlineTag /> Labels:</span>
          {labels.map(l => (
            <button
              key={l.id}
              className={`bm-nb-label-toggle ${page.labels.includes(l.id) ? 'active' : ''}`}
              style={{
                background: page.labels.includes(l.id) ? l.color : 'transparent',
                borderColor: l.color,
                color: page.labels.includes(l.id) ? '#fff' : l.color,
              }}
              onClick={() => toggleLabel(l.id)}
            >
              {l.name}
            </button>
          ))}
        </div>

        <textarea
          className="bm-nb-editor-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Start writing… Markdown supported (# headings, **bold**, lists, etc.)"
          spellCheck="false"
        />

        {/* Settings drawer */}
        {showSettings && (
          <div className="bm-nb-settings">
            <h4>Page settings</h4>
            <div className="bm-nb-settings-row">
              <label>Cover color</label>
              <div className="bm-nb-color-picker">
                {NOTEBOOK_COLORS.map(c => (
                  <button
                    key={c}
                    className={`bm-nb-color-swatch ${coverColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setCoverColor(c)}
                  />
                ))}
              </div>
            </div>
            <div className="bm-nb-settings-row">
              <button className="bm-btn bm-btn-danger" onClick={onDelete}>
                <HiOutlineTrash /> Delete page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sticky note components ───────────────────────────────────────────

const StickyComposer = ({ onAdd }: { onAdd: (body: string, color: string) => void }) => {
  const [body, setBody] = useState('');
  const [color, setColor] = useState(STICKY_COLORS[0]);
  const handleAdd = () => {
    if (!body.trim()) return;
    onAdd(body.trim(), color);
    setBody('');
  };
  return (
    <div className="bm-nb-sticky-composer" style={{ background: color }}>
      <textarea
        placeholder="Quick note…"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={2}
      />
      <div className="bm-nb-sticky-composer-actions">
        <div className="bm-nb-color-picker">
          {STICKY_COLORS.map(c => (
            <button
              key={c}
              className={`bm-nb-color-swatch ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <button className="bm-btn bm-btn-primary" onClick={handleAdd} disabled={!body.trim()}>
          <HiOutlinePlus /> Add
        </button>
      </div>
    </div>
  );
};

const StickyCard = ({
  sticky, onUpdate, onDelete,
}: {
  sticky: StickyNote;
  onUpdate: (patch: Partial<StickyNote>) => void;
  onDelete: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(sticky.body);

  return (
    <div className="bm-nb-sticky" style={{ background: sticky.color }}>
      <div className="bm-nb-sticky-actions">
        <button
          onClick={() => onUpdate({ pinned: !sticky.pinned })}
          title={sticky.pinned ? 'Unpin' : 'Pin'}
        >
          <HiOutlineStar style={sticky.pinned ? { color: '#f59e0b', fill: '#f59e0b' } : {}} />
        </button>
        <button onClick={() => setEditing(s => !s)} title="Edit"><HiOutlinePencil /></button>
        <button onClick={onDelete} title="Delete"><HiOutlineTrash /></button>
      </div>
      {editing ? (
        <>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="bm-nb-color-picker">
            {STICKY_COLORS.map(c => (
              <button
                key={c}
                className={`bm-nb-color-swatch ${sticky.color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => onUpdate({ color: c })}
              />
            ))}
          </div>
          <button className="bm-btn bm-btn-primary" onClick={() => { onUpdate({ body }); setEditing(false); }}>
            <HiOutlineSave /> Save
          </button>
        </>
      ) : (
        <>
          <div className="bm-nb-sticky-body">{sticky.body}</div>
          <div className="bm-nb-sticky-meta">{fmtRelative(sticky.updatedAt)}</div>
        </>
      )}
    </div>
  );
};

// ─── Notebook create/edit modal ───────────────────────────────────────

interface NotebookModalProps {
  existing?: Notebook | null;
  viewer: StaffLite;
  onClose: () => void;
  onSave: (input: Pick<Notebook, 'title' | 'emoji' | 'color' | 'description' | 'sharedWith'>) => void;
}

const NotebookModal = ({ existing, viewer, onClose, onSave }: NotebookModalProps) => {
  const [title, setTitle] = useState(existing?.title || '');
  const [emoji, setEmoji] = useState(existing?.emoji || '📒');
  const [color, setColor] = useState(existing?.color || NOTEBOOK_COLORS[0]);
  const [description, setDescription] = useState(existing?.description || '');
  const [shareMode, setShareMode] = useState<'private' | 'all' | 'specific'>(
    existing
      ? existing.sharedWith.includes('*') ? 'all'
        : existing.sharedWith.length === 1 && existing.sharedWith[0] === viewer.id ? 'private'
          : 'specific'
      : 'private'
  );
  const [specificStaff, setSpecificStaff] = useState<string[]>(
    existing?.sharedWith.filter(s => s !== '*' && s !== viewer.id) || []
  );

  const toggleStaff = (id: string) => {
    setSpecificStaff(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    let sharedWith: string[];
    if (shareMode === 'all') sharedWith = ['*'];
    else if (shareMode === 'private') sharedWith = [viewer.id];
    else sharedWith = [viewer.id, ...specificStaff];

    onSave({
      title: title.trim(),
      emoji,
      color,
      description: description.trim() || undefined,
      sharedWith,
    });
  };

  return (
    <>
      <div className="bm-modal-backdrop" onClick={onClose} />
      <div className="bm-cal-modal">
        <div className="bm-cal-modal-head">
          <h3>{existing ? 'Edit notebook' : 'New notebook'}</h3>
          <button className="bm-cal-modal-close" onClick={onClose}><HiOutlineX /></button>
        </div>
        <div className="bm-cal-modal-body">
          <div className="bm-nb-modal-emoji-row">
            <div className="bm-nb-modal-emoji-preview" style={{ background: color }}>
              {emoji}
            </div>
            <div className="bm-nb-modal-emoji-picker">
              {['📒','📓','📔','📕','📗','📘','📙','📝','✅','💡','🎯','🚀','🔥','⭐','🤝','🎓','📍','🔌','🛠️','📊'].map(e => (
                <button key={e} className={emoji === e ? 'active' : ''} onClick={() => setEmoji(e)}>{e}</button>
              ))}
            </div>
          </div>

          <input
            className="bm-cal-input bm-cal-input-large"
            placeholder="Notebook title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />

          <textarea
            className="bm-cal-textarea"
            placeholder="What's this notebook about? (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />

          <div className="bm-cal-field">
            <label>Cover color</label>
            <div className="bm-nb-color-picker bm-nb-color-picker-large">
              {NOTEBOOK_COLORS.map(c => (
                <button
                  key={c}
                  className={`bm-nb-color-swatch ${color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="bm-cal-field">
            <label><HiOutlineUserGroup /> Visibility</label>
            <div className="bm-cal-share">
              <button
                className={`bm-cal-share-btn ${shareMode === 'private' ? 'active' : ''}`}
                onClick={() => setShareMode('private')}
              >
                <HiOutlineUser /> Private
              </button>
              <button
                className={`bm-cal-share-btn ${shareMode === 'all' ? 'active' : ''}`}
                onClick={() => setShareMode('all')}
              >
                <HiOutlineUserGroup /> All staff
              </button>
              <button
                className={`bm-cal-share-btn ${shareMode === 'specific' ? 'active' : ''}`}
                onClick={() => setShareMode('specific')}
              >
                <HiOutlineUserGroup /> Specific people
              </button>
            </div>
            {shareMode === 'specific' && (
              <div className="bm-cal-staff-chooser">
                {STAFF_DIRECTORY.filter(s => s.id !== viewer.id).map(s => (
                  <button
                    key={s.id}
                    className={`bm-cal-staff-chip ${specificStaff.includes(s.id) ? 'active' : ''}`}
                    style={specificStaff.includes(s.id) ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
                    onClick={() => toggleStaff(s.id)}
                  >
                    <span className="bm-cal-staff-initials" style={{ background: s.color }}>{s.initials}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bm-cal-modal-actions">
            <div style={{ flex: 1 }} />
            <button className="bm-btn" onClick={onClose}>Cancel</button>
            <button className="bm-btn bm-btn-primary" onClick={handleSubmit} disabled={!title.trim()}>
              <HiOutlineCheck /> {existing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notebook;
