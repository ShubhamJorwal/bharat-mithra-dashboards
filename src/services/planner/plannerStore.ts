/**
 * Planner store — single source of truth for staff calendar (events + tasks)
 * and notebooks (notebooks + pages + sticky notes).
 *
 * Multi-staff aware: every record has a `createdBy` (the staff who owns it)
 * and `sharedWith` (visibility list). UI filters by the current viewer.
 *
 * Strategy:
 * 1. Reads come from localStorage (instant, offline-friendly).
 * 2. Writes go to localStorage immediately, then fire-and-forget to the
 *    backend at /api/v1/planner.
 * 3. On bootstrapFromBackend(), we GET /planner/snapshot — if it succeeds
 *    AND has data, we replace the localStorage cache with the canonical
 *    server state. If it fails (backend down, migration not yet run), we
 *    keep the local cache so the UI still works.
 */
import {
  fetchSnapshot,
  upsertItemRemote, deleteItemRemote,
  upsertNotebookRemote, deleteNotebookRemote,
  upsertPageRemote, deletePageRemote,
  upsertStickyRemote, deleteStickyRemote,
  upsertLabelRemote, deleteLabelRemote,
} from './plannerApi';

// ─── Types ───────────────────────────────────────────────────────────────

export type EventType = 'meeting' | 'task' | 'reminder' | 'holiday' | 'deadline' | 'personal' | 'note';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type RecurrenceFreq = 'none' | 'daily' | 'weekly' | 'monthly';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface StaffLite {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;     // hex, used for chips and dots
}

export interface CalendarItem {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  // ISO date strings — we keep separate date + time so all-day works cleanly
  date: string;          // YYYY-MM-DD (start)
  endDate?: string;      // YYYY-MM-DD (end, optional, for multi-day events)
  startTime?: string;    // HH:MM (optional for all-day)
  endTime?: string;      // HH:MM
  isAllDay: boolean;

  // Task-specific
  status?: TaskStatus;
  dueAt?: string;        // ISO datetime
  completedAt?: string;

  // Common
  priority: Priority;
  location?: string;
  labels: string[];        // label IDs
  recurrence: RecurrenceFreq;
  recurrenceUntil?: string;

  // Multi-staff
  createdBy: string;       // staff ID
  assignedTo?: string;     // staff ID (for tasks)
  sharedWith: string[];    // staff IDs OR ['*'] for "all staff"

  reminderMinutes?: number; // minutes before to remind
  color?: string;           // override; falls back to type color

  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  title: string;
  emoji?: string;
  color: string;          // hex, used as cover band
  description?: string;
  createdBy: string;
  sharedWith: string[];   // staff IDs OR ['*']
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookPage {
  id: string;
  notebookId: string;
  title: string;
  content: string;        // markdown / plain text
  emoji?: string;
  coverColor?: string;
  labels: string[];
  pinned: boolean;
  createdBy: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StickyNote {
  id: string;
  body: string;
  color: string;          // pastel hex
  createdBy: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdBy: string;
  createdAt?: string;
}

// ─── Storage keys ────────────────────────────────────────────────────────

const K_ITEMS    = 'bm_planner_items';
const K_NOTEBOOKS = 'bm_planner_notebooks';
const K_PAGES    = 'bm_planner_pages';
const K_STICKIES = 'bm_planner_stickies';
const K_LABELS   = 'bm_planner_labels';
const K_VIEWER   = 'bm_planner_current_staff';

// ─── Default staff directory (shared across calendar + notebook) ────────

export const STAFF_DIRECTORY: StaffLite[] = [
  { id: 'staff_1',  name: 'Thimma Shetty',     initials: 'TS', role: 'Agent',           color: '#3b82f6' },
  { id: 'staff_2',  name: 'Priya Sharma',      initials: 'PS', role: 'District Manager', color: '#a855f7' },
  { id: 'staff_3',  name: 'Rajesh Kumar',      initials: 'RK', role: 'Caseworker',       color: '#22c55e' },
  { id: 'staff_4',  name: 'Sunita Devi',       initials: 'SD', role: 'Verifier',         color: '#f59e0b' },
  { id: 'staff_5',  name: 'Vikram Singh',      initials: 'VS', role: 'State Head',       color: '#ef4444' },
  { id: 'staff_6',  name: 'Meena Kumari',      initials: 'MK', role: 'Supervisor',       color: '#06b6d4' },
  { id: 'staff_7',  name: 'Amit Patel',        initials: 'AP', role: 'Service Manager',  color: '#ec4899' },
  { id: 'staff_8',  name: 'Anita Rao',         initials: 'AR', role: 'Support',          color: '#14b8a6' },
];

export const getStaff = (id: string): StaffLite | undefined =>
  STAFF_DIRECTORY.find(s => s.id === id);

// ─── Current viewer (defaults to staff_1) ────────────────────────────────

export const getViewer = (): StaffLite => {
  const id = localStorage.getItem(K_VIEWER) || 'staff_1';
  return getStaff(id) || STAFF_DIRECTORY[0];
};
export const setViewer = (id: string): void => {
  localStorage.setItem(K_VIEWER, id);
  fire();
};

// ─── Generic load/save ──────────────────────────────────────────────────

const fire = () => window.dispatchEvent(new CustomEvent('bm-planner-changed'));

const load = <T>(key: string, defaults: T[]): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};
const save = <T>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
  fire();
};

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 6)}`;

// ─── Seeds ──────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().slice(0, 10);
const dayOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const ts = (offsetMs: number = 0) => new Date(Date.now() + offsetMs).toISOString();

const SEED_LABELS: Label[] = [
  { id: 'lbl_kyc',      name: 'KYC',           color: '#3b82f6', createdBy: 'staff_1' },
  { id: 'lbl_urgent',   name: 'Urgent',        color: '#ef4444', createdBy: 'staff_1' },
  { id: 'lbl_field',    name: 'Field-visit',   color: '#22c55e', createdBy: 'staff_1' },
  { id: 'lbl_admin',    name: 'Admin',         color: '#a855f7', createdBy: 'staff_1' },
  { id: 'lbl_finance',  name: 'Finance',       color: '#f59e0b', createdBy: 'staff_1' },
  { id: 'lbl_followup', name: 'Follow-up',     color: '#06b6d4', createdBy: 'staff_1' },
  { id: 'lbl_idea',     name: 'Idea',          color: '#ec4899', createdBy: 'staff_1' },
];

const SEED_ITEMS: CalendarItem[] = [
  {
    id: newId('itm'),
    type: 'meeting',
    title: 'District manager standup',
    description: 'Weekly district-wide review with caseworkers + agents.',
    date: todayISO(),
    startTime: '10:00',
    endTime: '10:30',
    isAllDay: false,
    priority: 'high',
    location: 'Bengaluru office, Room 2',
    labels: ['lbl_admin'],
    recurrence: 'weekly',
    createdBy: 'staff_2',
    sharedWith: ['*'],
    reminderMinutes: 15,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('itm'),
    type: 'task',
    title: 'Verify 12 pending PAN applications',
    description: 'Batch from yesterday; SLA 24h.',
    date: todayISO(),
    isAllDay: true,
    status: 'in_progress',
    priority: 'urgent',
    labels: ['lbl_kyc', 'lbl_urgent'],
    recurrence: 'none',
    createdBy: 'staff_2',
    assignedTo: 'staff_3',
    sharedWith: ['staff_2', 'staff_3'],
    reminderMinutes: 60,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('itm'),
    type: 'task',
    title: 'Field visit — Yelahanka GP',
    description: 'Visit 3 agents, collect daily reports, settle wallets.',
    date: dayOffset(1),
    startTime: '09:00',
    endTime: '14:00',
    isAllDay: false,
    status: 'todo',
    priority: 'high',
    location: 'Yelahanka, Bengaluru',
    labels: ['lbl_field'],
    recurrence: 'none',
    createdBy: 'staff_1',
    assignedTo: 'staff_1',
    sharedWith: ['staff_1', 'staff_6'],
    reminderMinutes: 30,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('itm'),
    type: 'deadline',
    title: 'Monthly finance close',
    description: 'Reconcile wallet vs bank; export GST report.',
    date: dayOffset(3),
    isAllDay: true,
    priority: 'urgent',
    labels: ['lbl_finance', 'lbl_urgent'],
    recurrence: 'monthly',
    createdBy: 'staff_5',
    sharedWith: ['*'],
    reminderMinutes: 1440,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('itm'),
    type: 'reminder',
    title: 'Follow up Surepass sandbox keys',
    date: dayOffset(2),
    startTime: '14:00',
    endTime: '14:15',
    isAllDay: false,
    priority: 'medium',
    labels: ['lbl_followup'],
    recurrence: 'none',
    createdBy: 'staff_5',
    assignedTo: 'staff_5',
    sharedWith: ['staff_5'],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('itm'),
    type: 'meeting',
    title: 'Eko KYB call — 30 min',
    date: dayOffset(2),
    startTime: '16:00',
    endTime: '16:30',
    isAllDay: false,
    priority: 'high',
    labels: ['lbl_admin', 'lbl_urgent'],
    recurrence: 'none',
    createdBy: 'staff_5',
    sharedWith: ['staff_5', 'staff_2'],
    reminderMinutes: 15,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('itm'),
    type: 'note',
    title: 'BBMP contact — Mr. Ramesh, 9876543210',
    description: 'For property-tax escalation. Available 11am–4pm weekdays.',
    date: todayISO(),
    isAllDay: true,
    priority: 'low',
    labels: ['lbl_followup'],
    recurrence: 'none',
    createdBy: 'staff_3',
    sharedWith: ['*'],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('itm'),
    type: 'task',
    title: 'Onboard 5 new agents this week',
    description: 'Bengaluru-rural cluster.',
    date: dayOffset(0),
    endDate: dayOffset(4),
    isAllDay: true,
    status: 'in_progress',
    priority: 'high',
    labels: ['lbl_field', 'lbl_admin'],
    recurrence: 'none',
    createdBy: 'staff_2',
    assignedTo: 'staff_2',
    sharedWith: ['staff_2', 'staff_5'],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('itm'),
    type: 'holiday',
    title: 'Karnataka State Holiday — Karaga Festival',
    date: dayOffset(7),
    isAllDay: true,
    priority: 'low',
    labels: [],
    recurrence: 'none',
    createdBy: 'staff_5',
    sharedWith: ['*'],
    createdAt: ts(),
    updatedAt: ts(),
  },
];

const SEED_NOTEBOOKS: Notebook[] = [
  {
    id: 'nb_personal',
    title: 'My quick notes',
    emoji: '📓',
    color: '#3b82f6',
    description: 'Personal thoughts and reminders',
    createdBy: 'staff_1',
    sharedWith: ['staff_1'],
    pinned: true,
    archived: false,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: 'nb_team',
    title: 'Team playbook',
    emoji: '🤝',
    color: '#a855f7',
    description: 'How we run BharatMithra ops — shared with the whole team',
    createdBy: 'staff_5',
    sharedWith: ['*'],
    pinned: true,
    archived: false,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: 'nb_apis',
    title: 'API integrations log',
    emoji: '🔌',
    color: '#22c55e',
    description: 'Surepass, Eko, Cashfree, TBO… credentials, limits, gotchas',
    createdBy: 'staff_5',
    sharedWith: ['staff_5', 'staff_2', 'staff_7'],
    pinned: false,
    archived: false,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: 'nb_field',
    title: 'Field reports',
    emoji: '🚜',
    color: '#f59e0b',
    description: 'Per-GP visit notes from agents',
    createdBy: 'staff_2',
    sharedWith: ['*'],
    pinned: false,
    archived: false,
    createdAt: ts(),
    updatedAt: ts(),
  },
];

const SEED_PAGES: NotebookPage[] = [
  {
    id: newId('pg'),
    notebookId: 'nb_personal',
    title: 'Today',
    emoji: '☀️',
    coverColor: '#3b82f6',
    content: `# Plan for today

- [ ] Standup at 10:00
- [ ] Review pending PAN batch
- [ ] Yelahanka field visit prep
- [ ] Call Surepass support re: sandbox keys
- [ ] End-of-day wallet settle

## Notes
- Carry the printed agent forms; the new ones from yesterday.
- Remind Sunita about the Aadhaar update training tomorrow.`,
    labels: ['lbl_followup'],
    pinned: true,
    createdBy: 'staff_1',
    sharedWith: ['staff_1'],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('pg'),
    notebookId: 'nb_team',
    title: 'Onboarding checklist for new agents',
    emoji: '✅',
    coverColor: '#a855f7',
    content: `# Agent onboarding — 7 day plan

**Day 1**
- KYC documents collected (Aadhaar, PAN, photo, address proof, bank passbook)
- Wallet activation, training login, Eko app install
- WhatsApp group invite

**Day 2-3**
- Service catalog walkthrough (Identity → Banking → Bills)
- 3 dummy transactions on sandbox
- Caseworker handoff demo

**Day 4-7**
- Live transactions under supervision
- Daily de-brief, weekly review with district manager

## Common questions
- Why was my AEPS txn declined? — usually low-quality fingerprint, retry with thumb on warm cloth.
- How do I add money to wallet? — wallet → top up → UPI is fastest.`,
    labels: ['lbl_admin'],
    pinned: true,
    createdBy: 'staff_5',
    sharedWith: ['*'],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('pg'),
    notebookId: 'nb_apis',
    title: 'Surepass — pending sign-up',
    emoji: '🔑',
    coverColor: '#22c55e',
    content: `# Surepass.io

- Submitted demo form on 2026-05-02
- Expect sandbox key + rate sheet within 24h
- Endpoints we want first: PAN verify, Aadhaar masked verify, GST search, RC verify, DL verify, Bank account verify, UPI verify
- Pricing model: pay-as-you-go credit packs (rate sheet pending)

## Notes
- Once we have the sandbox key, store it as \`SUREPASS_API_KEY\` in genome env.
- Wire calls through services/services.api.ts — use the existing action_handler routing pattern.`,
    labels: ['lbl_admin', 'lbl_followup'],
    pinned: false,
    createdBy: 'staff_5',
    sharedWith: ['staff_5', 'staff_2'],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('pg'),
    notebookId: 'nb_field',
    title: 'Yelahanka GP — agent issues',
    emoji: '📍',
    coverColor: '#f59e0b',
    content: `# Yelahanka cluster — 3 active agents

**Agent: Ramappa (RK_YEL_001)**
- 24 transactions/day average, mostly bill pay
- Wallet float runs low by EOD; recommend ₹5k auto-top-up trigger
- Asked for AEPS biometric — Mantra MFS110 ordered

**Agent: Lakshmi (LK_YEL_002)**
- New, started 2026-04-12
- Strong on PMJAY card applications
- Needs Kannada training material for service forms

**Agent: Suresh (SU_YEL_003)**
- Inactive last 7 days — needs re-engagement call`,
    labels: ['lbl_field'],
    pinned: false,
    createdBy: 'staff_2',
    sharedWith: ['*'],
    createdAt: ts(),
    updatedAt: ts(),
  },
];

const SEED_STICKIES: StickyNote[] = [
  {
    id: newId('stk'),
    body: 'Call Saarthii at 3 PM about IRCTC PSP onboarding fees.',
    color: '#fef3c7',
    createdBy: 'staff_1',
    pinned: true,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('stk'),
    body: 'Cashfree test webhook URL: /webhooks/cashfree → register before going live',
    color: '#dbeafe',
    createdBy: 'staff_5',
    pinned: false,
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: newId('stk'),
    body: 'BBPS biller list refresh every Monday — keep Eko + Setu in sync',
    color: '#d1fae5',
    createdBy: 'staff_5',
    pinned: false,
    createdAt: ts(),
    updatedAt: ts(),
  },
];

// ─── Public API ─────────────────────────────────────────────────────────

export const loadItems = (): CalendarItem[] => load(K_ITEMS, SEED_ITEMS);
export const saveItems = (items: CalendarItem[]) => save(K_ITEMS, items);

export const loadNotebooks = (): Notebook[] => load(K_NOTEBOOKS, SEED_NOTEBOOKS);
export const saveNotebooks = (nbs: Notebook[]) => save(K_NOTEBOOKS, nbs);

export const loadPages = (): NotebookPage[] => load(K_PAGES, SEED_PAGES);
export const savePages = (pages: NotebookPage[]) => save(K_PAGES, pages);

export const loadStickies = (): StickyNote[] => load(K_STICKIES, SEED_STICKIES);
export const saveStickies = (s: StickyNote[]) => save(K_STICKIES, s);

export const loadLabels = (): Label[] => load(K_LABELS, SEED_LABELS);
export const saveLabels = (l: Label[]) => save(K_LABELS, l);

/**
 * Pull the canonical state from the backend and replace local cache.
 * Safe to call anytime — silently noops if backend is unavailable.
 * If the backend has zero records (fresh DB), we push our local seeds
 * up to the backend so other devices can see them.
 */
let bootstrapPromise: Promise<void> | null = null;
export const bootstrapFromBackend = (): Promise<void> => {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const snap = await fetchSnapshot();
    if (!snap) return; // backend down — keep local

    const hasAny =
      snap.items.length + snap.notebooks.length + snap.pages.length +
      snap.stickies.length + snap.labels.length > 0;

    if (hasAny) {
      // Backend has data — make it canonical
      localStorage.setItem(K_ITEMS, JSON.stringify(snap.items));
      localStorage.setItem(K_NOTEBOOKS, JSON.stringify(snap.notebooks));
      localStorage.setItem(K_PAGES, JSON.stringify(snap.pages));
      localStorage.setItem(K_STICKIES, JSON.stringify(snap.stickies));
      localStorage.setItem(K_LABELS, JSON.stringify(snap.labels));
      fire();
      return;
    }

    // Backend is empty — seed it from our local data (likely the seed set).
    const items = loadItems();
    const notebooks = loadNotebooks();
    const pages = loadPages();
    const stickies = loadStickies();
    const labels = loadLabels();

    // Notebooks first (pages have FK)
    await Promise.all(labels.map(l => upsertLabelRemote(l)));
    await Promise.all(notebooks.map(n => upsertNotebookRemote(n)));
    await Promise.all(pages.map(p => upsertPageRemote(p)));
    await Promise.all(items.map(i => upsertItemRemote(i)));
    await Promise.all(stickies.map(s => upsertStickyRemote(s)));
  })();
  // Reset the promise after a delay so future calls can re-sync
  bootstrapPromise.finally(() => {
    setTimeout(() => { bootstrapPromise = null; }, 30_000);
  });
  return bootstrapPromise;
};

// Mutations — calendar items

export const createItem = (input: Omit<CalendarItem, 'id' | 'createdAt' | 'updatedAt'>): CalendarItem => {
  const all = loadItems();
  const item: CalendarItem = {
    ...input,
    id: newId('itm'),
    createdAt: ts(),
    updatedAt: ts(),
  };
  saveItems([item, ...all]);
  void upsertItemRemote(item);
  return item;
};

export const updateItem = (id: string, patch: Partial<CalendarItem>): void => {
  const all = loadItems();
  let updated: CalendarItem | undefined;
  const next = all.map(i => {
    if (i.id !== id) return i;
    updated = { ...i, ...patch, updatedAt: ts() };
    return updated;
  });
  saveItems(next);
  if (updated) void upsertItemRemote(updated);
};

export const deleteItem = (id: string): void => {
  saveItems(loadItems().filter(i => i.id !== id));
  void deleteItemRemote(id);
};

export const toggleTaskStatus = (id: string): void => {
  const all = loadItems();
  let updated: CalendarItem | undefined;
  const next = all.map(i => {
    if (i.id !== id) return i;
    const status: TaskStatus = i.status === 'done' ? 'todo' : 'done';
    updated = {
      ...i,
      status,
      completedAt: status === 'done' ? ts() : undefined,
      updatedAt: ts(),
    };
    return updated;
  });
  saveItems(next);
  if (updated) void upsertItemRemote(updated);
};

// Mutations — notebooks
export const createNotebook = (input: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>): Notebook => {
  const all = loadNotebooks();
  const nb: Notebook = { ...input, id: newId('nb'), createdAt: ts(), updatedAt: ts() };
  saveNotebooks([nb, ...all]);
  void upsertNotebookRemote(nb);
  return nb;
};
export const updateNotebook = (id: string, patch: Partial<Notebook>): void => {
  const all = loadNotebooks();
  let updated: Notebook | undefined;
  const next = all.map(n => {
    if (n.id !== id) return n;
    updated = { ...n, ...patch, updatedAt: ts() };
    return updated;
  });
  saveNotebooks(next);
  if (updated) void upsertNotebookRemote(updated);
};
export const deleteNotebook = (id: string): void => {
  saveNotebooks(loadNotebooks().filter(n => n.id !== id));
  // also delete its pages locally; backend cascades via FK ON DELETE CASCADE
  savePages(loadPages().filter(p => p.notebookId !== id));
  void deleteNotebookRemote(id);
};

// Mutations — pages
export const createPage = (input: Omit<NotebookPage, 'id' | 'createdAt' | 'updatedAt'>): NotebookPage => {
  const all = loadPages();
  const pg: NotebookPage = { ...input, id: newId('pg'), createdAt: ts(), updatedAt: ts() };
  savePages([pg, ...all]);
  // bump notebook updatedAt
  const nbs = loadNotebooks();
  let nbUpdated: Notebook | undefined;
  const nextNbs = nbs.map(n => {
    if (n.id !== pg.notebookId) return n;
    nbUpdated = { ...n, updatedAt: ts() };
    return nbUpdated;
  });
  saveNotebooks(nextNbs);
  void upsertPageRemote(pg);
  if (nbUpdated) void upsertNotebookRemote(nbUpdated);
  return pg;
};
export const updatePage = (id: string, patch: Partial<NotebookPage>): void => {
  const all = loadPages();
  let updated: NotebookPage | undefined;
  const next = all.map(p => {
    if (p.id !== id) return p;
    updated = { ...p, ...patch, updatedAt: ts() };
    return updated;
  });
  savePages(next);
  if (updated) void upsertPageRemote(updated);
};
export const deletePage = (id: string): void => {
  savePages(loadPages().filter(p => p.id !== id));
  void deletePageRemote(id);
};

// Mutations — stickies
export const createSticky = (body: string, color: string, createdBy: string): StickyNote => {
  const all = loadStickies();
  const s: StickyNote = {
    id: newId('stk'), body, color, createdBy, pinned: false,
    createdAt: ts(), updatedAt: ts(),
  };
  saveStickies([s, ...all]);
  void upsertStickyRemote(s);
  return s;
};
export const updateSticky = (id: string, patch: Partial<StickyNote>): void => {
  let updated: StickyNote | undefined;
  saveStickies(loadStickies().map(s => {
    if (s.id !== id) return s;
    updated = { ...s, ...patch, updatedAt: ts() };
    return updated;
  }));
  if (updated) void upsertStickyRemote(updated);
};
export const deleteSticky = (id: string): void => {
  saveStickies(loadStickies().filter(s => s.id !== id));
  void deleteStickyRemote(id);
};

// Labels
export const createLabel = (name: string, color: string, createdBy: string): Label => {
  const all = loadLabels();
  const l: Label = { id: newId('lbl'), name, color, createdBy };
  saveLabels([l, ...all]);
  void upsertLabelRemote(l);
  return l;
};
export const deleteLabel = (id: string): void => {
  saveLabels(loadLabels().filter(l => l.id !== id));
  void deleteLabelRemote(id);
};

// Helpers
export const isVisibleTo = (item: { createdBy: string; sharedWith: string[] }, viewerId: string): boolean => {
  return (
    item.createdBy === viewerId ||
    item.sharedWith.includes('*') ||
    item.sharedWith.includes(viewerId)
  );
};

export const isForYou = (
  item: { createdBy: string; assignedTo?: string; sharedWith?: string[] },
  viewerId: string
): boolean => {
  return (
    item.createdBy === viewerId ||
    item.assignedTo === viewerId
  );
};

export const subscribe = (cb: () => void): (() => void) => {
  const handler = () => cb();
  window.addEventListener('bm-planner-changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('bm-planner-changed', handler);
    window.removeEventListener('storage', handler);
  };
};

// Type colors
export const TYPE_META: Record<EventType, { color: string; emoji: string; label: string }> = {
  meeting:  { color: '#3b82f6', emoji: '📅', label: 'Meeting'   },
  task:     { color: '#a855f7', emoji: '📋', label: 'Task'      },
  reminder: { color: '#f59e0b', emoji: '🔔', label: 'Reminder'  },
  holiday:  { color: '#22c55e', emoji: '🎉', label: 'Holiday'   },
  deadline: { color: '#ef4444', emoji: '🚩', label: 'Deadline'  },
  personal: { color: '#06b6d4', emoji: '🧑', label: 'Personal'  },
  note:     { color: '#ec4899', emoji: '🗒️', label: 'Note'      },
};

export const PRIORITY_META: Record<Priority, { color: string; label: string }> = {
  low:    { color: '#22c55e', label: 'Low'    },
  medium: { color: '#3b82f6', label: 'Medium' },
  high:   { color: '#f59e0b', label: 'High'   },
  urgent: { color: '#ef4444', label: 'Urgent' },
};

export const STICKY_COLORS = ['#fef3c7', '#dbeafe', '#d1fae5', '#fce7f3', '#e0e7ff', '#fed7aa', '#fee2e2'];
export const NOTEBOOK_COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
