import { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineCalendar, HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineX, HiOutlineCheck, HiOutlineTrash, HiOutlinePencil, HiOutlineClock,
  HiOutlineLocationMarker, HiOutlineSearch, HiOutlineUserGroup, HiOutlineUser,
  HiOutlineRefresh, HiOutlineTag,
  HiOutlineExclamation, HiOutlineCheckCircle, HiOutlineFire,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import {
  loadItems, createItem, updateItem, deleteItem, toggleTaskStatus,
  loadLabels, subscribe, getViewer, setViewer, getStaff,
  STAFF_DIRECTORY, TYPE_META, PRIORITY_META, isVisibleTo, isForYou,
  type CalendarItem, type EventType, type Priority, type RecurrenceFreq,
  type TaskStatus, type Label, type StaffLite,
} from '@/services/planner/plannerStore';
import './Calendar.scss';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';
type ScopeFilter = 'foryou' | 'all' | 'mine' | 'shared';

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
};

const Calendar = () => {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [viewer, setViewerState] = useState<StaffLite>(getViewer());
  const [view, setView] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState<Date>(new Date());
  const [scope, setScope] = useState<ScopeFilter>('foryou');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [labelFilter, setLabelFilter] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<CalendarItem | null>(null);
  const [showCompose, setShowCompose] = useState<{ date?: string } | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const refresh = () => {
    setItems(loadItems());
    setLabels(loadLabels());
    setViewerState(getViewer());
  };

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, []);

  // Filter visible items
  const visibleItems = useMemo(() => {
    let data = items.filter(i => isVisibleTo(i, viewer.id));
    if (scope === 'foryou') data = data.filter(i => isForYou(i, viewer.id));
    if (scope === 'mine') data = data.filter(i => i.createdBy === viewer.id);
    if (scope === 'shared') data = data.filter(i => i.createdBy !== viewer.id);
    if (typeFilter !== 'all') data = data.filter(i => i.type === typeFilter);
    if (labelFilter !== 'all') data = data.filter(i => i.labels.includes(labelFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [items, viewer, scope, typeFilter, labelFilter, search]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const i of visibleItems) {
      const start = i.date;
      const end = i.endDate || i.date;
      // place on every day in range
      const startD = new Date(start);
      const endD = new Date(end);
      for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
        const k = fmtDate(d);
        const arr = map.get(k) || [];
        arr.push(i);
        map.set(k, arr);
      }
    }
    return map;
  }, [visibleItems]);

  const todayStr = fmtDate(new Date());

  // Counts for top stats
  const stats = useMemo(() => {
    const today = visibleItems.filter(i => {
      const start = new Date(i.date);
      const end = new Date(i.endDate || i.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return start < tomorrow && end >= today;
    });
    const overdueTasks = visibleItems.filter(i =>
      i.type === 'task' &&
      i.status !== 'done' &&
      new Date(i.date) < new Date(todayStr)
    );
    const upcoming = visibleItems.filter(i => new Date(i.date) >= new Date(todayStr)).length;
    const tasksDone = visibleItems.filter(i => i.type === 'task' && i.status === 'done').length;
    return {
      today: today.length,
      overdue: overdueTasks.length,
      upcoming,
      tasksDone,
    };
  }, [visibleItems, todayStr]);

  const navTitle = useMemo(() => {
    if (view === 'month') return cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (view === 'week') {
      const s = startOfWeek(cursor);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    if (view === 'day') return cursor.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return 'Agenda';
  }, [cursor, view]);

  const navigate = (dir: 1 | -1) => {
    const next = new Date(cursor);
    if (view === 'month') next.setMonth(next.getMonth() + dir);
    else if (view === 'week') next.setDate(next.getDate() + dir * 7);
    else if (view === 'day') next.setDate(next.getDate() + dir);
    setCursor(next);
  };

  return (
    <div className="bm-cal-page">
      <PageHeader
        icon={<HiOutlineCalendar />}
        title="Calendar"
        description={`Plan tasks, events, and notes — share with the team or keep them private.`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bm-btn" onClick={refresh} title="Refresh"><HiOutlineRefresh /></button>
            <button className="bm-btn" onClick={() => setCursor(new Date())}>Today</button>
            <button className="bm-btn bm-btn-primary" onClick={() => setShowCompose({ date: todayStr })}>
              <HiOutlinePlus /> New
            </button>
          </div>
        }
      />

      {/* Stat strip */}
      <div className="bm-cal-stats">
        <StatCard icon={<HiOutlineFire />} label="Today" value={stats.today} tone="primary" />
        <StatCard icon={<HiOutlineExclamation />} label="Overdue" value={stats.overdue} tone="danger" />
        <StatCard icon={<HiOutlineClock />} label="Upcoming" value={stats.upcoming} tone="warn" />
        <StatCard icon={<HiOutlineCheckCircle />} label="Tasks done" value={stats.tasksDone} tone="success" />
      </div>

      {/* Toolbar — viewer pick + scope + type + search */}
      <div className="bm-cal-toolbar">
        {/* Viewer = "I'm logged in as" */}
        <div className="bm-cal-viewer">
          <span className="bm-cal-viewer-label">Viewing as</span>
          <span
            className="bm-cal-viewer-dot"
            style={{ background: viewer.color }}
            aria-hidden
          />
          <select
            value={viewer.id}
            onChange={e => { setViewer(e.target.value); refresh(); }}
            className="bm-cal-viewer-select"
          >
            {STAFF_DIRECTORY.map(s => (
              <option key={s.id} value={s.id}>{s.initials} · {s.name} ({s.role})</option>
            ))}
          </select>
        </div>

        {/* Scope dropdown — replaces the wrap-and-scroll tab row */}
        <div className="bm-cal-scope-wrap">
          <span className="bm-cal-viewer-label">Show</span>
          <select
            className="bm-cal-scope-select"
            value={scope}
            onChange={(e) => setScope(e.target.value as ScopeFilter)}
            aria-label="Scope filter"
          >
            <option value="foryou">⭐ For you</option>
            <option value="mine">📌 By me</option>
            <option value="shared">👥 Shared with me</option>
            <option value="all">🌐 All staff</option>
          </select>
        </div>

        {/* Search */}
        <div className="bm-cal-search">
          <HiOutlineSearch />
          <input
            placeholder="Search title, description, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><HiOutlineX /></button>}
        </div>

        {/* Type + label */}
        <div className="bm-cal-filters-mini">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as EventType | 'all')}>
            <option value="all">All types</option>
            {(Object.keys(TYPE_META) as EventType[]).map(t => (
              <option key={t} value={t}>{TYPE_META[t].emoji} {TYPE_META[t].label}</option>
            ))}
          </select>
          <select value={labelFilter} onChange={e => setLabelFilter(e.target.value)}>
            <option value="all">All labels</option>
            {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Calendar nav — bigger title on the left, segmented view on the right */}
      <div className="bm-cal-nav">
        <div className="bm-cal-nav-left">
          <div className="bm-cal-nav-arrows">
            <button
              className="bm-cal-nav-btn"
              onClick={() => navigate(-1)}
              aria-label={`Previous ${view}`}
            >
              <HiOutlineChevronLeft />
            </button>
            <button
              className="bm-cal-nav-btn"
              onClick={() => navigate(1)}
              aria-label={`Next ${view}`}
            >
              <HiOutlineChevronRight />
            </button>
          </div>
          <div className="bm-cal-nav-title-block">
            {view === 'month' ? (
              <>
                <h2 className="bm-cal-nav-month">
                  {cursor.toLocaleDateString('en-IN', { month: 'long' })}
                </h2>
                <span className="bm-cal-nav-year">
                  {cursor.getFullYear()}
                </span>
              </>
            ) : (
              <h2 className="bm-cal-nav-month">{navTitle}</h2>
            )}
          </div>
          <button
            className="bm-cal-today-btn"
            onClick={() => setCursor(new Date())}
            title="Jump to today"
          >
            Today
          </button>
        </div>
        <div className="bm-cal-view-tabs" role="tablist" aria-label="Calendar view">
          {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(v => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              className={`bm-cal-view-tab ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      {view === 'month' && (
        <MonthView
          cursor={cursor}
          itemsByDate={itemsByDate}
          onDayClick={setSelectedDay}
          onCompose={(date) => setShowCompose({ date })}
          onItemClick={setEditing}
        />
      )}
      {view === 'week' && (
        <WeekView
          cursor={cursor}
          itemsByDate={itemsByDate}
          onCompose={(date) => setShowCompose({ date })}
          onItemClick={setEditing}
          onItemToggle={(id) => { toggleTaskStatus(id); refresh(); }}
        />
      )}
      {view === 'day' && (
        <DayView
          cursor={cursor}
          itemsByDate={itemsByDate}
          onCompose={(date) => setShowCompose({ date })}
          onItemClick={setEditing}
          onItemToggle={(id) => { toggleTaskStatus(id); refresh(); }}
        />
      )}
      {view === 'agenda' && (
        <AgendaView
          items={visibleItems}
          onItemClick={setEditing}
          onItemToggle={(id) => { toggleTaskStatus(id); refresh(); }}
        />
      )}

      {/* Day drilldown popover (from month-view click) */}
      {selectedDay && (
        <DayPopover
          date={selectedDay}
          items={itemsByDate.get(selectedDay) || []}
          onClose={() => setSelectedDay(null)}
          onCompose={() => { setShowCompose({ date: selectedDay }); setSelectedDay(null); }}
          onItemClick={(i) => { setEditing(i); setSelectedDay(null); }}
          onItemToggle={(id) => { toggleTaskStatus(id); refresh(); }}
        />
      )}

      {/* Compose modal */}
      {showCompose && (
        <ComposeModal
          defaultDate={showCompose.date || todayStr}
          viewer={viewer}
          labels={labels}
          onClose={() => setShowCompose(null)}
          onCreate={(input) => {
            createItem(input);
            setShowCompose(null);
            refresh();
          }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <ComposeModal
          defaultDate={editing.date}
          viewer={viewer}
          labels={labels}
          existing={editing}
          onClose={() => setEditing(null)}
          onCreate={(input) => {
            updateItem(editing.id, input);
            setEditing(null);
            refresh();
          }}
          onDelete={() => {
            deleteItem(editing.id);
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) => (
  <div className={`bm-cal-stat tone-${tone}`}>
    <div className="bm-cal-stat-icon">{icon}</div>
    <div>
      <div className="bm-cal-stat-value">{value}</div>
      <div className="bm-cal-stat-label">{label}</div>
    </div>
  </div>
);

// ─── Month view ────────────────────────────────────────────────────────

const MonthView = ({
  cursor, itemsByDate, onDayClick, onCompose, onItemClick,
}: {
  cursor: Date;
  itemsByDate: Map<string, CalendarItem[]>;
  onDayClick: (date: string) => void;
  onCompose: (date: string) => void;
  onItemClick: (item: CalendarItem) => void;
}) => {
  const monthStart = startOfMonth(cursor);
  const startDay = new Date(monthStart);
  startDay.setDate(startDay.getDate() - monthStart.getDay()); // back to Sunday

  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    cells.push(d);
  }

  const todayStr = fmtDate(new Date());
  const monthIdx = cursor.getMonth();

  return (
    <div className="bm-cal-month">
      <div className="bm-cal-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bm-cal-weekday">{d}</div>
        ))}
      </div>
      <div className="bm-cal-grid">
        {cells.map((d, idx) => {
          const dStr = fmtDate(d);
          const isToday = dStr === todayStr;
          const isOtherMonth = d.getMonth() !== monthIdx;
          const items = itemsByDate.get(dStr) || [];
          return (
            <div
              key={idx}
              className={`bm-cal-cell ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}`}
            >
              <div className="bm-cal-cell-head">
                <span
                  className="bm-cal-cell-date"
                  onClick={() => onDayClick(dStr)}
                >
                  {d.getDate()}
                </span>
                <button
                  className="bm-cal-cell-add"
                  onClick={() => onCompose(dStr)}
                  title="Add"
                >
                  <HiOutlinePlus />
                </button>
              </div>
              <div className="bm-cal-cell-items">
                {items.slice(0, 3).map(i => (
                  <ItemPill key={i.id} item={i} onClick={() => onItemClick(i)} />
                ))}
                {items.length > 3 && (
                  <button
                    className="bm-cal-cell-more"
                    onClick={() => onDayClick(dStr)}
                  >
                    + {items.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ItemPill = ({ item, onClick }: { item: CalendarItem; onClick: () => void }) => {
  const owner = getStaff(item.createdBy);
  const meta = TYPE_META[item.type];
  const color = item.color || meta.color;
  const isDone = item.status === 'done';
  return (
    <button
      className={`bm-cal-item-pill type-${item.type} ${isDone ? 'done' : ''}`}
      style={{ '--pill-color': color } as React.CSSProperties}
      onClick={onClick}
      title={item.title}
    >
      <span className="bm-cal-item-dot" aria-hidden />
      {!item.isAllDay && item.startTime && (
        <span className="bm-cal-item-time">{item.startTime}</span>
      )}
      <span className="bm-cal-item-title">{item.title}</span>
      {owner && (
        <span className="bm-cal-item-owner" style={{ background: owner.color }} title={owner.name}>
          {owner.initials}
        </span>
      )}
    </button>
  );
};

// ─── Week view ────────────────────────────────────────────────────────

const WeekView = ({
  cursor, itemsByDate, onCompose, onItemClick, onItemToggle,
}: {
  cursor: Date;
  itemsByDate: Map<string, CalendarItem[]>;
  onCompose: (date: string) => void;
  onItemClick: (item: CalendarItem) => void;
  onItemToggle: (id: string) => void;
}) => {
  const weekStart = startOfWeek(cursor);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }
  const todayStr = fmtDate(new Date());
  return (
    <div className="bm-cal-week">
      {days.map(d => {
        const dStr = fmtDate(d);
        const items = (itemsByDate.get(dStr) || []).sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));
        const isToday = dStr === todayStr;
        return (
          <div key={dStr} className={`bm-cal-week-col ${isToday ? 'today' : ''}`}>
            <div className="bm-cal-week-head">
              <div className="bm-cal-week-dayname">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
              <div className="bm-cal-week-daynum">{d.getDate()}</div>
              <button className="bm-cal-cell-add" onClick={() => onCompose(dStr)}><HiOutlinePlus /></button>
            </div>
            <div className="bm-cal-week-items">
              {items.length === 0 && (
                <div className="bm-cal-week-empty">No items</div>
              )}
              {items.map(i => (
                <ItemRow key={i.id} item={i} onClick={() => onItemClick(i)} onToggle={() => onItemToggle(i.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Day view ────────────────────────────────────────────────────────

const DayView = ({
  cursor, itemsByDate, onCompose, onItemClick, onItemToggle,
}: {
  cursor: Date;
  itemsByDate: Map<string, CalendarItem[]>;
  onCompose: (date: string) => void;
  onItemClick: (item: CalendarItem) => void;
  onItemToggle: (id: string) => void;
}) => {
  const dStr = fmtDate(cursor);
  const items = (itemsByDate.get(dStr) || []).sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));
  return (
    <div className="bm-cal-day">
      <div className="bm-cal-day-head">
        <h3>{cursor.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
        <button className="bm-btn bm-btn-primary" onClick={() => onCompose(dStr)}>
          <HiOutlinePlus /> Add for this day
        </button>
      </div>
      {items.length === 0 ? (
        <div className="bm-cal-day-empty">
          <HiOutlineCalendar />
          <p>Nothing scheduled. Quiet day, or add something.</p>
        </div>
      ) : (
        <div className="bm-cal-day-list">
          {items.map(i => (
            <ItemRow key={i.id} item={i} onClick={() => onItemClick(i)} onToggle={() => onItemToggle(i.id)} expanded />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Agenda view ─────────────────────────────────────────────────────

const AgendaView = ({
  items, onItemClick, onItemToggle,
}: {
  items: CalendarItem[];
  onItemClick: (item: CalendarItem) => void;
  onItemToggle: (id: string) => void;
}) => {
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = `${a.date}T${a.startTime || '00:00'}`;
      const db = `${b.date}T${b.startTime || '00:00'}`;
      return da.localeCompare(db);
    });
  }, [items]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const i of sorted) {
      const arr = map.get(i.date) || [];
      arr.push(i);
      map.set(i.date, arr);
    }
    return Array.from(map.entries());
  }, [sorted]);

  return (
    <div className="bm-cal-agenda">
      {grouped.length === 0 ? (
        <div className="bm-cal-day-empty">
          <HiOutlineCalendar />
          <p>No items match your filters.</p>
        </div>
      ) : grouped.map(([date, items]) => {
        const d = new Date(date);
        const isToday = date === fmtDate(new Date());
        return (
          <div key={date} className="bm-cal-agenda-group">
            <div className={`bm-cal-agenda-date ${isToday ? 'today' : ''}`}>
              <div className="bm-cal-agenda-date-num">{d.getDate()}</div>
              <div className="bm-cal-agenda-date-meta">
                <div>{d.toLocaleDateString('en-IN', { weekday: 'long' })}</div>
                <div>{d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
            <div className="bm-cal-agenda-items">
              {items.map(i => (
                <ItemRow key={i.id} item={i} onClick={() => onItemClick(i)} onToggle={() => onItemToggle(i.id)} expanded />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ItemRow = ({
  item, onClick, onToggle, expanded,
}: {
  item: CalendarItem;
  onClick: () => void;
  onToggle: () => void;
  expanded?: boolean;
}) => {
  const owner = getStaff(item.createdBy);
  const meta = TYPE_META[item.type];
  const color = item.color || meta.color;
  const isTask = item.type === 'task';
  const isDone = item.status === 'done';
  return (
    <div className={`bm-cal-row ${isDone ? 'done' : ''}`} style={{ borderLeftColor: color }}>
      {isTask && (
        <button
          className={`bm-cal-row-check ${isDone ? 'checked' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          title={isDone ? 'Mark incomplete' : 'Mark complete'}
        >
          {isDone ? <HiOutlineCheck /> : null}
        </button>
      )}
      <div className="bm-cal-row-body" onClick={onClick}>
        <div className="bm-cal-row-line1">
          <span className="bm-cal-row-emoji">{meta.emoji}</span>
          <span className="bm-cal-row-title">{item.title}</span>
          <span
            className={`bm-cal-priority pri-${item.priority}`}
            style={{ background: PRIORITY_META[item.priority].color }}
          >
            {PRIORITY_META[item.priority].label}
          </span>
        </div>
        {expanded && item.description && (
          <div className="bm-cal-row-desc">{item.description}</div>
        )}
        <div className="bm-cal-row-line2">
          {item.isAllDay ? (
            <span className="bm-cal-row-meta"><HiOutlineClock /> All day</span>
          ) : item.startTime && (
            <span className="bm-cal-row-meta"><HiOutlineClock /> {item.startTime}{item.endTime ? `–${item.endTime}` : ''}</span>
          )}
          {item.location && <span className="bm-cal-row-meta"><HiOutlineLocationMarker /> {item.location}</span>}
          {item.recurrence !== 'none' && <span className="bm-cal-row-meta">↻ {item.recurrence}</span>}
          {owner && (
            <span className="bm-cal-row-owner" style={{ background: owner.color }} title={owner.name}>
              {owner.initials}
            </span>
          )}
          {item.sharedWith.includes('*') && (
            <span className="bm-cal-row-meta shared"><HiOutlineUserGroup /> All staff</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Day popover ────────────────────────────────────────────────────────

const DayPopover = ({
  date, items, onClose, onCompose, onItemClick, onItemToggle,
}: {
  date: string;
  items: CalendarItem[];
  onClose: () => void;
  onCompose: () => void;
  onItemClick: (i: CalendarItem) => void;
  onItemToggle: (id: string) => void;
}) => {
  const d = new Date(date);
  return (
    <>
      <div className="bm-modal-backdrop" onClick={onClose} />
      <div className="bm-cal-popover">
        <div className="bm-cal-popover-head">
          <h3>{d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <button className="bm-cal-modal-close" onClick={onClose}><HiOutlineX /></button>
        </div>
        <div className="bm-cal-popover-body">
          {items.length === 0 ? (
            <div className="bm-cal-day-empty">
              <p>Nothing scheduled.</p>
            </div>
          ) : (
            items.map(i => (
              <ItemRow key={i.id} item={i} onClick={() => onItemClick(i)} onToggle={() => onItemToggle(i.id)} expanded />
            ))
          )}
          <button className="bm-btn bm-btn-primary" onClick={onCompose} style={{ marginTop: 12, width: '100%' }}>
            <HiOutlinePlus /> Add for this day
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Compose / Edit modal ───────────────────────────────────────────────

interface ComposeModalProps {
  defaultDate: string;
  viewer: StaffLite;
  labels: Label[];
  existing?: CalendarItem;
  onClose: () => void;
  onCreate: (input: Omit<CalendarItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
}

const ComposeModal = ({
  defaultDate, viewer, labels, existing, onClose, onCreate, onDelete,
}: ComposeModalProps) => {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [type, setType] = useState<EventType>(existing?.type || 'task');
  const [date, setDate] = useState(existing?.date || defaultDate);
  const [endDate, setEndDate] = useState(existing?.endDate || '');
  const [isAllDay, setIsAllDay] = useState(existing?.isAllDay ?? false);
  const [startTime, setStartTime] = useState(existing?.startTime || '09:00');
  const [endTime, setEndTime] = useState(existing?.endTime || '10:00');
  const [priority, setPriority] = useState<Priority>(existing?.priority || 'medium');
  const [location, setLocation] = useState(existing?.location || '');
  const [recurrence, setRecurrence] = useState<RecurrenceFreq>(existing?.recurrence || 'none');
  const [reminderMinutes, setReminderMinutes] = useState<number | undefined>(existing?.reminderMinutes);
  const [status, setStatus] = useState<TaskStatus>(existing?.status || 'todo');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(existing?.labels || []);
  const [assignedTo, setAssignedTo] = useState<string>(existing?.assignedTo || viewer.id);
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

  const toggleLabel = (id: string) => {
    setSelectedLabels(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };
  const toggleStaff = (id: string) => {
    setSpecificStaff(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    let sharedWith: string[];
    if (shareMode === 'all') sharedWith = ['*'];
    else if (shareMode === 'private') sharedWith = [viewer.id];
    else sharedWith = [viewer.id, ...specificStaff];

    onCreate({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      endDate: endDate || undefined,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      isAllDay,
      status: type === 'task' ? status : undefined,
      priority,
      location: location.trim() || undefined,
      labels: selectedLabels,
      recurrence,
      reminderMinutes,
      createdBy: existing?.createdBy || viewer.id,
      assignedTo: type === 'task' ? assignedTo : undefined,
      sharedWith,
    });
  };

  return (
    <>
      <div className="bm-modal-backdrop" onClick={onClose} />
      <div className="bm-cal-modal">
        <div className="bm-cal-modal-head">
          <h3>{existing ? <><HiOutlinePencil /> Edit item</> : <><HiOutlinePlus /> New item</>}</h3>
          <button className="bm-cal-modal-close" onClick={onClose}><HiOutlineX /></button>
        </div>
        <div className="bm-cal-modal-body">
          {/* Type chooser */}
          <div className="bm-cal-type-chooser">
            {(Object.keys(TYPE_META) as EventType[]).map(t => (
              <button
                key={t}
                className={`bm-cal-type-btn ${type === t ? 'active' : ''}`}
                style={type === t ? { borderColor: TYPE_META[t].color, color: TYPE_META[t].color } : {}}
                onClick={() => setType(t)}
              >
                <span>{TYPE_META[t].emoji}</span> {TYPE_META[t].label}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            className="bm-cal-input bm-cal-input-large"
            placeholder="Title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />

          {/* Description */}
          <textarea
            className="bm-cal-textarea"
            placeholder="Description, agenda, or notes…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />

          {/* Date + time */}
          <div className="bm-cal-row-fields">
            <div className="bm-cal-field">
              <label>Date</label>
              <input type="date" className="bm-cal-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="bm-cal-field">
              <label>End date <small>(optional)</small></label>
              <input type="date" className="bm-cal-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="bm-cal-field">
              <label className="bm-cal-checkbox">
                <input type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} />
                All day
              </label>
            </div>
          </div>

          {!isAllDay && (
            <div className="bm-cal-row-fields">
              <div className="bm-cal-field">
                <label>Start</label>
                <input type="time" className="bm-cal-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="bm-cal-field">
                <label>End</label>
                <input type="time" className="bm-cal-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
          )}

          {/* Priority + recurrence + reminder */}
          <div className="bm-cal-row-fields">
            <div className="bm-cal-field">
              <label>Priority</label>
              <select className="bm-cal-input" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                {(Object.keys(PRIORITY_META) as Priority[]).map(p => (
                  <option key={p} value={p}>{PRIORITY_META[p].label}</option>
                ))}
              </select>
            </div>
            <div className="bm-cal-field">
              <label>Repeat</label>
              <select className="bm-cal-input" value={recurrence} onChange={e => setRecurrence(e.target.value as RecurrenceFreq)}>
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="bm-cal-field">
              <label>Remind</label>
              <select
                className="bm-cal-input"
                value={reminderMinutes ?? ''}
                onChange={e => setReminderMinutes(e.target.value === '' ? undefined : Number(e.target.value))}
              >
                <option value="">No reminder</option>
                <option value="0">At time</option>
                <option value="5">5 min before</option>
                <option value="15">15 min before</option>
                <option value="30">30 min before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>
          </div>

          {/* Task status + assignee */}
          {type === 'task' && (
            <div className="bm-cal-row-fields">
              <div className="bm-cal-field">
                <label>Status</label>
                <select className="bm-cal-input" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="bm-cal-field">
                <label>Assigned to</label>
                <select className="bm-cal-input" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                  {STAFF_DIRECTORY.map(s => (
                    <option key={s.id} value={s.id}>{s.initials} · {s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="bm-cal-field">
            <label>Location <small>(optional)</small></label>
            <input
              type="text"
              className="bm-cal-input"
              placeholder="e.g. Bengaluru office, Room 2"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          {/* Labels */}
          <div className="bm-cal-field">
            <label><HiOutlineTag /> Labels</label>
            <div className="bm-cal-labels-chooser">
              {labels.map(l => (
                <button
                  key={l.id}
                  className={`bm-cal-label-chip ${selectedLabels.includes(l.id) ? 'active' : ''}`}
                  style={{
                    background: selectedLabels.includes(l.id) ? l.color : undefined,
                    borderColor: l.color,
                    color: selectedLabels.includes(l.id) ? '#fff' : l.color,
                  }}
                  onClick={() => toggleLabel(l.id)}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sharing */}
          <div className="bm-cal-field">
            <label><HiOutlineUserGroup /> Visibility</label>
            <div className="bm-cal-share">
              <button
                className={`bm-cal-share-btn ${shareMode === 'private' ? 'active' : ''}`}
                onClick={() => setShareMode('private')}
              >
                <HiOutlineUser /> Private (only you)
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
            {onDelete && (
              <button className="bm-btn bm-btn-danger" onClick={onDelete}>
                <HiOutlineTrash /> Delete
              </button>
            )}
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

export default Calendar;
