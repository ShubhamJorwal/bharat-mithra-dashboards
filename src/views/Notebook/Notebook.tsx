import { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineBookOpen,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import {
  loadNotebooks, loadPages,
  createNotebook, deleteNotebook,
  createPage, updatePage, deletePage,
  subscribe, getViewer,
  type Notebook as NotebookT, type NotebookPage,
} from '@/services/planner/plannerStore';
import './Notebook.scss';

// =====================================================================
// Notebook — simple 3-column layout: notebooks → pages → editor
// No stats, no persona switcher, no scope tabs, no sticky notes,
// no emoji/color pickers, no sharing modal. Just the essentials.
// =====================================================================

const Notebook = () => {
  const viewer = getViewer();
  const [notebooks, setNotebooks] = useState<NotebookT[]>([]);
  const [pages, setPages] = useState<NotebookPage[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const refresh = () => {
    setNotebooks(loadNotebooks());
    setPages(loadPages());
  };

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, []);

  // Notebooks owned by the current viewer (most-recently-updated first)
  const myNotebooks = useMemo(
    () =>
      notebooks
        .filter((n) => n.createdBy === viewer.id && !n.archived)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [notebooks, viewer.id]
  );

  // Pages of the active notebook (most-recently-updated first)
  const visiblePages = useMemo(() => {
    if (!activeNotebookId) return [];
    return pages
      .filter((p) => p.notebookId === activeNotebookId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [pages, activeNotebookId]);

  // Auto-select first notebook on mount / when the list changes
  useEffect(() => {
    if (!activeNotebookId && myNotebooks.length > 0) {
      setActiveNotebookId(myNotebooks[0].id);
    }
    if (activeNotebookId && !myNotebooks.find((n) => n.id === activeNotebookId)) {
      setActiveNotebookId(myNotebooks[0]?.id ?? null);
    }
  }, [myNotebooks, activeNotebookId]);

  // Auto-select first page when the page list changes
  useEffect(() => {
    if (visiblePages.length > 0) {
      if (!activePageId || !visiblePages.find((p) => p.id === activePageId)) {
        setActivePageId(visiblePages[0].id);
      }
    } else {
      setActivePageId(null);
    }
  }, [visiblePages, activePageId]);

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || null;
  const activePage = pages.find((p) => p.id === activePageId) || null;

  const handleNewNotebook = () => {
    const title = window.prompt('Notebook name?')?.trim();
    if (!title) return;
    const nb = createNotebook({
      title,
      createdBy: viewer.id,
      sharedWith: [viewer.id],
      pinned: false,
      archived: false,
      color: '#3b82f6',
    });
    setActiveNotebookId(nb.id);
    refresh();
  };

  const handleDeleteNotebook = () => {
    if (!activeNotebook) return;
    if (!window.confirm(`Delete notebook "${activeNotebook.title}" and all its pages?`)) return;
    deleteNotebook(activeNotebook.id);
    setActiveNotebookId(null);
    refresh();
  };

  const handleNewPage = () => {
    if (!activeNotebookId) return;
    const pg = createPage({
      notebookId: activeNotebookId,
      title: 'Untitled',
      content: '',
      labels: [],
      pinned: false,
      createdBy: viewer.id,
      sharedWith: [viewer.id],
    });
    setActivePageId(pg.id);
    refresh();
  };

  const handleDeletePage = () => {
    if (!activePage) return;
    if (!window.confirm(`Delete page "${activePage.title || 'Untitled'}"?`)) return;
    deletePage(activePage.id);
    setActivePageId(null);
    refresh();
  };

  return (
    <div className="nb">
      <PageHeader
        icon={<HiOutlineBookOpen />}
        title="Notebook"
        description="Quick notes and playbooks. Auto-saved as you type."
        actions={
          <button className="bm-btn bm-btn-primary" onClick={handleNewNotebook}>
            <HiOutlinePlus /> New notebook
          </button>
        }
      />

      <div className="nb-grid">
        {/* ------------ Notebooks column ------------ */}
        <aside className="nb-col nb-col--books">
          <div className="nb-col-head">
            <span>Notebooks</span>
            <em>{myNotebooks.length}</em>
          </div>
          <div className="nb-col-body">
            {myNotebooks.length === 0 ? (
              <div className="nb-empty">
                <p>No notebooks yet</p>
                <button className="nb-link-btn" onClick={handleNewNotebook}>
                  <HiOutlinePlus /> Create your first
                </button>
              </div>
            ) : (
              myNotebooks.map((nb) => (
                <button
                  key={nb.id}
                  type="button"
                  className={`nb-item ${nb.id === activeNotebookId ? 'is-active' : ''}`}
                  onClick={() => setActiveNotebookId(nb.id)}
                >
                  <span className="nb-item-title">{nb.title}</span>
                  <span className="nb-item-sub">
                    {pages.filter((p) => p.notebookId === nb.id).length} pages
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ------------ Pages column ------------ */}
        <aside className="nb-col nb-col--pages">
          <div className="nb-col-head">
            <span>{activeNotebook ? activeNotebook.title : 'Pages'}</span>
            {activeNotebook && (
              <button
                type="button"
                className="nb-icon-btn"
                onClick={handleDeleteNotebook}
                title="Delete notebook"
                aria-label="Delete notebook"
              >
                <HiOutlineTrash />
              </button>
            )}
          </div>
          <div className="nb-col-body">
            {activeNotebook && (
              <button type="button" className="nb-add-page" onClick={handleNewPage}>
                <HiOutlinePlus /> New page
              </button>
            )}
            {!activeNotebook ? (
              <div className="nb-empty">
                <p>Pick a notebook</p>
              </div>
            ) : visiblePages.length === 0 ? (
              <div className="nb-empty">
                <p>No pages in this notebook</p>
              </div>
            ) : (
              visiblePages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`nb-item ${p.id === activePageId ? 'is-active' : ''}`}
                  onClick={() => setActivePageId(p.id)}
                >
                  <span className="nb-item-title">{p.title || 'Untitled'}</span>
                  <span className="nb-item-sub">{fmtRelative(p.updatedAt)}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ------------ Editor pane ------------ */}
        <main className="nb-editor">
          {activePage ? (
            <PageEditor
              key={activePage.id}
              page={activePage}
              onChange={(patch) => {
                updatePage(activePage.id, patch);
                refresh();
              }}
              onDelete={handleDeletePage}
            />
          ) : (
            <div className="nb-empty nb-empty--lg">
              <HiOutlineDocumentText />
              <p>Select a page to start writing</p>
              {activeNotebook && (
                <button type="button" className="nb-link-btn" onClick={handleNewPage}>
                  <HiOutlinePlus /> New page
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notebook;

// ---------- Editor ----------

interface PageEditorProps {
  page: NotebookPage;
  onChange: (patch: Partial<NotebookPage>) => void;
  onDelete: () => void;
}

const PageEditor = ({ page, onChange, onDelete }: PageEditorProps) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Debounced auto-save
  useEffect(() => {
    if (title === page.title && content === page.content) return;
    const t = setTimeout(() => {
      onChange({ title, content });
      setSavedAt(Date.now());
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  const showSaved = savedAt && Date.now() - savedAt < 2000;

  return (
    <div className="nb-edit">
      <div className="nb-edit-head">
        <input
          type="text"
          className="nb-edit-title"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="nb-edit-meta">
          {showSaved ? (
            <span className="nb-saved">
              <HiOutlineCheck /> Saved
            </span>
          ) : (
            <span className="nb-edit-muted">Edited {fmtRelative(page.updatedAt)}</span>
          )}
          <button
            type="button"
            className="nb-icon-btn"
            onClick={onDelete}
            title="Delete page"
            aria-label="Delete page"
          >
            <HiOutlineTrash />
          </button>
        </div>
      </div>

      <textarea
        className="nb-edit-area"
        placeholder="Start writing… Markdown supported (# headings, **bold**, lists)."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck="false"
      />
    </div>
  );
};

// ---------- Util ----------

const fmtRelative = (s: string): string => {
  const diff = Date.now() - new Date(s).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};
