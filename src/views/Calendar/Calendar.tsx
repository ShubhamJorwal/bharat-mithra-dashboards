import { useState, useMemo, useCallback } from 'react';
import {
  HiOutlineCalendar,
  HiOutlinePlus,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineTag,
  HiOutlineFilter,
} from 'react-icons/hi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PageHeader } from '../../components/common/PageHeader';
import './Calendar.scss';

// ============================================
// TYPES
// ============================================
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: 'meeting' | 'task' | 'reminder' | 'holiday' | 'deadline' | 'personal';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  isAllDay?: boolean;
  createdAt: string;
}

type ViewMode = 'month' | 'week' | 'list';

const EVENT_TYPES = [
  { value: 'meeting', label: 'Meeting', color: '#3b82f6', emoji: '📅' },
  { value: 'task', label: 'Task', color: '#8b5cf6', emoji: '📋' },
  { value: 'reminder', label: 'Reminder', color: '#f59e0b', emoji: '🔔' },
  { value: 'holiday', label: 'Holiday', color: '#22c55e', emoji: '🎉' },
  { value: 'deadline', label: 'Deadline', color: '#ef4444', emoji: '🔴' },
  { value: 'personal', label: 'Personal', color: '#06b6d4', emoji: '🧑' },
];

const PRIORITY_MAP = {
  low: { label: 'Low', color: '#22c55e' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ============================================
// HELPERS
// ============================================
const generateId = () => `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime12h = (time: string) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ============================================
// COMPONENT
// ============================================
const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showEventDetail, setShowEventDetail] = useState<CalendarEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // localStorage CRUD
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('bm-calendar-events', []);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: todayStr(),
    startTime: '09:00',
    endTime: '10:00',
    type: 'meeting' as CalendarEvent['type'],
    priority: 'medium' as CalendarEvent['priority'],
    location: '',
    isAllDay: false,
  });

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  const createEvent = useCallback(() => {
    if (!form.title.trim()) return;
    const newEvent: CalendarEvent = {
      id: generateId(),
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      startTime: form.isAllDay ? '00:00' : form.startTime,
      endTime: form.isAllDay ? '23:59' : form.endTime,
      type: form.type,
      priority: form.priority,
      location: form.location.trim() || undefined,
      isAllDay: form.isAllDay,
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
    resetForm();
    setShowModal(false);
  }, [form, setEvents]);

  const updateEvent = useCallback(() => {
    if (!editingEvent || !form.title.trim()) return;
    setEvents(prev =>
      prev.map(e =>
        e.id === editingEvent.id
          ? {
              ...e,
              title: form.title.trim(),
              description: form.description.trim(),
              date: form.date,
              startTime: form.isAllDay ? '00:00' : form.startTime,
              endTime: form.isAllDay ? '23:59' : form.endTime,
              type: form.type,
              priority: form.priority,
              location: form.location.trim() || undefined,
              isAllDay: form.isAllDay,
            }
          : e
      )
    );
    resetForm();
    setShowModal(false);
    setEditingEvent(null);
  }, [editingEvent, form, setEvents]);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeleteConfirm(null);
    setShowEventDetail(null);
  }, [setEvents]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      date: selectedDate || todayStr(),
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
      priority: 'medium',
      location: '',
      isAllDay: false,
    });
    setEditingEvent(null);
  };

  const openCreateModal = (date?: string) => {
    resetForm();
    if (date) setForm(prev => ({ ...prev, date }));
    setShowModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setForm({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      priority: event.priority,
      location: event.location || '',
      isAllDay: event.isAllDay || false,
    });
    setEditingEvent(event);
    setShowEventDetail(null);
    setShowModal(true);
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayStr());
  };

  // ============================================
  // COMPUTED
  // ============================================
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  const getEventsForDate = useCallback(
    (dateStr: string) => filteredEvents.filter(e => e.date === dateStr),
    [filteredEvents]
  );

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, getEventsForDate]);

  const upcomingEvents = useMemo(() => {
    const now = todayStr();
    return filteredEvents
      .filter(e => e.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 8);
  }, [filteredEvents]);

  // Stats
  const totalEvents = events.length;
  const thisMonthEvents = events.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  const todayEvents = events.filter(e => e.date === todayStr()).length;

  // ============================================
  // CALENDAR GRID
  // ============================================
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);

    const days: { day: number; month: 'prev' | 'current' | 'next'; dateStr: string }[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        day: d,
        month: 'prev',
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: 'current',
        dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        day: i,
        month: 'next',
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // ============================================
  // LIST VIEW DATA
  // ============================================
  const listViewEvents = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const grouped: { date: string; events: CalendarEvent[] }[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      if (dayEvents.length > 0) {
        grouped.push({ date: dateStr, events: dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime)) });
      }
    }

    return grouped;
  }, [currentYear, currentMonth, getEventsForDate]);

  // ============================================
  // RENDER
  // ============================================
  const getTypeInfo = (type: string) => EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];

  return (
    <div className="cal">
      <PageHeader
        icon={<HiOutlineCalendar />}
        title="Calendar"
        description="Manage events, tasks, reminders and schedules"
        actions={
          <div className="cal-header-actions">
            <button className="cal-btn cal-btn--primary" onClick={() => openCreateModal()}>
              <HiOutlinePlus />
              <span>New Event</span>
            </button>
          </div>
        }
      />

      {/* Stats Bar */}
      <div className="cal-stats">
        <div className="cal-stat">
          <span className="cal-stat__value">{totalEvents}</span>
          <span className="cal-stat__label">Total Events</span>
        </div>
        <div className="cal-stat">
          <span className="cal-stat__value">{thisMonthEvents}</span>
          <span className="cal-stat__label">This Month</span>
        </div>
        <div className="cal-stat">
          <span className="cal-stat__value">{todayEvents}</span>
          <span className="cal-stat__label">Today</span>
        </div>
        <div className="cal-stat">
          <span className="cal-stat__value">{upcomingEvents.length}</span>
          <span className="cal-stat__label">Upcoming</span>
        </div>
      </div>

      {/* Controls */}
      <div className="cal-controls">
        <div className="cal-controls__left">
          <button className="cal-nav-btn" onClick={goToPrevMonth}><HiOutlineChevronLeft /></button>
          <h2 className="cal-month-title">{MONTHS[currentMonth]} {currentYear}</h2>
          <button className="cal-nav-btn" onClick={goToNextMonth}><HiOutlineChevronRight /></button>
          <button className="cal-today-btn" onClick={goToToday}>Today</button>
        </div>
        <div className="cal-controls__right">
          <div className="cal-filter">
            <HiOutlineFilter />
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="cal-view-toggle">
            {(['month', 'week', 'list'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                className={`cal-view-btn ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="cal-layout">
        {/* Calendar Grid */}
        <div className="cal-main">
          {viewMode === 'month' && (
            <div className="cal-grid-card">
              <div className="cal-grid-header">
                {DAYS.map(day => (
                  <div key={day} className="cal-grid-day-label">{day}</div>
                ))}
              </div>
              <div className="cal-grid">
                {calendarDays.map((day, idx) => {
                  const dayEvents = getEventsForDate(day.dateStr);
                  const isToday = day.dateStr === todayStr();
                  const isSelected = day.dateStr === selectedDate;
                  const isOtherMonth = day.month !== 'current';

                  return (
                    <div
                      key={idx}
                      className={`cal-cell ${isOtherMonth ? 'cal-cell--other' : ''} ${isToday ? 'cal-cell--today' : ''} ${isSelected ? 'cal-cell--selected' : ''}`}
                      onClick={() => setSelectedDate(day.dateStr)}
                      onDoubleClick={() => openCreateModal(day.dateStr)}
                    >
                      <span className={`cal-cell__day ${isToday ? 'cal-cell__day--today' : ''}`}>
                        {day.day}
                      </span>
                      <div className="cal-cell__events">
                        {dayEvents.slice(0, 3).map(evt => {
                          const typeInfo = getTypeInfo(evt.type);
                          return (
                            <div
                              key={evt.id}
                              className="cal-cell__event"
                              style={{ background: typeInfo.color + '20', borderLeft: `3px solid ${typeInfo.color}` }}
                              onClick={(e) => { e.stopPropagation(); setShowEventDetail(evt); }}
                              title={evt.title}
                            >
                              <span className="cal-cell__event-text">{evt.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span className="cal-cell__more">+{dayEvents.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="cal-list-card">
              <h3 className="cal-list-title">Events in {MONTHS[currentMonth]} {currentYear}</h3>
              {listViewEvents.length === 0 ? (
                <div className="cal-empty">
                  <HiOutlineCalendar />
                  <p>No events this month</p>
                  <button className="cal-btn cal-btn--primary cal-btn--sm" onClick={() => openCreateModal()}>
                    <HiOutlinePlus /> Add Event
                  </button>
                </div>
              ) : (
                <div className="cal-list">
                  {listViewEvents.map(group => (
                    <div key={group.date} className="cal-list-group">
                      <div className="cal-list-date">
                        <span className={`cal-list-date__day ${group.date === todayStr() ? 'cal-list-date__day--today' : ''}`}>
                          {new Date(group.date + 'T00:00:00').getDate()}
                        </span>
                        <span className="cal-list-date__name">
                          {new Date(group.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short' })}
                        </span>
                      </div>
                      <div className="cal-list-events">
                        {group.events.map(evt => {
                          const typeInfo = getTypeInfo(evt.type);
                          return (
                            <div
                              key={evt.id}
                              className="cal-list-event"
                              onClick={() => setShowEventDetail(evt)}
                              style={{ borderLeft: `4px solid ${typeInfo.color}` }}
                            >
                              <div className="cal-list-event__top">
                                <span className="cal-list-event__title">{evt.title}</span>
                                <span className="cal-list-event__badge" style={{ background: typeInfo.color + '15', color: typeInfo.color }}>
                                  {typeInfo.emoji} {typeInfo.label}
                                </span>
                              </div>
                              <div className="cal-list-event__meta">
                                <span><HiOutlineClock /> {evt.isAllDay ? 'All Day' : `${formatTime12h(evt.startTime)} - ${formatTime12h(evt.endTime)}`}</span>
                                {evt.location && <span><HiOutlineLocationMarker /> {evt.location}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === 'week' && (
            <div className="cal-week-card">
              <div className="cal-week-notice">
                <HiOutlineCalendar />
                <p>Week view shows events for the selected week. Click on a date in month view first, then switch to see the week.</p>
              </div>
              {(() => {
                // Show events for the current week
                const reference = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
                const dayOfWeek = reference.getDay();
                const weekStart = new Date(reference);
                weekStart.setDate(reference.getDate() - dayOfWeek);

                const weekDays: string[] = [];
                for (let i = 0; i < 7; i++) {
                  const d = new Date(weekStart);
                  d.setDate(weekStart.getDate() + i);
                  weekDays.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                }

                return (
                  <div className="cal-week-grid">
                    {weekDays.map(dateStr => {
                      const d = new Date(dateStr + 'T00:00:00');
                      const dayEvents = getEventsForDate(dateStr);
                      const isToday = dateStr === todayStr();
                      return (
                        <div key={dateStr} className={`cal-week-day ${isToday ? 'cal-week-day--today' : ''}`}>
                          <div className="cal-week-day__header">
                            <span className="cal-week-day__name">{DAYS[d.getDay()]}</span>
                            <span className={`cal-week-day__num ${isToday ? 'cal-week-day__num--today' : ''}`}>{d.getDate()}</span>
                          </div>
                          <div className="cal-week-day__events">
                            {dayEvents.length === 0 && <span className="cal-week-day__empty">No events</span>}
                            {dayEvents.map(evt => {
                              const typeInfo = getTypeInfo(evt.type);
                              return (
                                <div
                                  key={evt.id}
                                  className="cal-week-event"
                                  style={{ background: typeInfo.color + '15', borderLeft: `3px solid ${typeInfo.color}` }}
                                  onClick={() => setShowEventDetail(evt)}
                                >
                                  <span className="cal-week-event__title">{evt.title}</span>
                                  <span className="cal-week-event__time">
                                    {evt.isAllDay ? 'All Day' : formatTime12h(evt.startTime)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="cal-sidebar">
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="cal-sidebar-card">
              <div className="cal-sidebar-card__header">
                <h3>{formatDate(selectedDate)}</h3>
                <button className="cal-btn cal-btn--sm cal-btn--ghost" onClick={() => openCreateModal(selectedDate)}>
                  <HiOutlinePlus />
                </button>
              </div>
              {selectedDateEvents.length === 0 ? (
                <p className="cal-sidebar-empty">No events on this date</p>
              ) : (
                <div className="cal-sidebar-events">
                  {selectedDateEvents.map(evt => {
                    const typeInfo = getTypeInfo(evt.type);
                    return (
                      <div
                        key={evt.id}
                        className="cal-sidebar-event"
                        style={{ borderLeft: `3px solid ${typeInfo.color}` }}
                        onClick={() => setShowEventDetail(evt)}
                      >
                        <span className="cal-sidebar-event__title">{evt.title}</span>
                        <span className="cal-sidebar-event__time">
                          <HiOutlineClock />
                          {evt.isAllDay ? 'All Day' : `${formatTime12h(evt.startTime)} - ${formatTime12h(evt.endTime)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="cal-sidebar-card">
            <div className="cal-sidebar-card__header">
              <h3>Upcoming Events</h3>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="cal-sidebar-empty">No upcoming events</p>
            ) : (
              <div className="cal-sidebar-events">
                {upcomingEvents.map(evt => {
                  const typeInfo = getTypeInfo(evt.type);
                  return (
                    <div
                      key={evt.id}
                      className="cal-sidebar-event"
                      style={{ borderLeft: `3px solid ${typeInfo.color}` }}
                      onClick={() => setShowEventDetail(evt)}
                    >
                      <div className="cal-sidebar-event__row">
                        <span className="cal-sidebar-event__title">{evt.title}</span>
                        <span className="cal-sidebar-event__dot" style={{ background: typeInfo.color }}></span>
                      </div>
                      <span className="cal-sidebar-event__date">{formatDate(evt.date)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Event Type Legend */}
          <div className="cal-sidebar-card">
            <div className="cal-sidebar-card__header">
              <h3>Event Types</h3>
            </div>
            <div className="cal-legend">
              {EVENT_TYPES.map(t => (
                <div key={t.value} className="cal-legend__item">
                  <span className="cal-legend__dot" style={{ background: t.color }}></span>
                  <span>{t.emoji} {t.label}</span>
                  <span className="cal-legend__count">
                    {events.filter(e => e.type === t.value).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="cal-modal-overlay" onClick={() => { setShowModal(false); setEditingEvent(null); }}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-modal__header">
              <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button className="cal-modal__close" onClick={() => { setShowModal(false); setEditingEvent(null); }}>
                <HiOutlineX />
              </button>
            </div>
            <div className="cal-modal__body">
              <div className="cal-form">
                <div className="cal-form__field cal-form__field--full">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Event title"
                    autoFocus
                  />
                </div>

                <div className="cal-form__field cal-form__field--full">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Add a description..."
                    rows={2}
                  />
                </div>

                <div className="cal-form__field">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>

                <div className="cal-form__field">
                  <label className="cal-form__checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isAllDay}
                      onChange={e => setForm(f => ({ ...f, isAllDay: e.target.checked }))}
                    />
                    All Day Event
                  </label>
                </div>

                {!form.isAllDay && (
                  <>
                    <div className="cal-form__field">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={form.startTime}
                        onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="cal-form__field">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={form.endTime}
                        onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div className="cal-form__field">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CalendarEvent['type'] }))}>
                    {EVENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="cal-form__field">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as CalendarEvent['priority'] }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="cal-form__field cal-form__field--full">
                  <label>Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Add location (optional)"
                  />
                </div>
              </div>
            </div>
            <div className="cal-modal__footer">
              <button className="cal-btn cal-btn--outline" onClick={() => { setShowModal(false); setEditingEvent(null); }}>
                Cancel
              </button>
              <button
                className="cal-btn cal-btn--primary"
                onClick={editingEvent ? updateEvent : createEvent}
                disabled={!form.title.trim()}
              >
                <HiOutlineCheck />
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetail && (
        <div className="cal-modal-overlay" onClick={() => setShowEventDetail(null)}>
          <div className="cal-modal cal-modal--detail" onClick={e => e.stopPropagation()}>
            <div className="cal-modal__header" style={{ background: getTypeInfo(showEventDetail.type).color }}>
              <div className="cal-modal__header-info">
                <span className="cal-modal__emoji">{getTypeInfo(showEventDetail.type).emoji}</span>
                <div>
                  <h2>{showEventDetail.title}</h2>
                  <span className="cal-modal__type-label">{getTypeInfo(showEventDetail.type).label}</span>
                </div>
              </div>
              <div className="cal-modal__header-actions">
                <button className="cal-modal__action-btn" onClick={() => openEditModal(showEventDetail)} title="Edit">
                  <HiOutlinePencil />
                </button>
                <button className="cal-modal__action-btn" onClick={() => setDeleteConfirm(showEventDetail.id)} title="Delete">
                  <HiOutlineTrash />
                </button>
                <button className="cal-modal__close" onClick={() => setShowEventDetail(null)}>
                  <HiOutlineX />
                </button>
              </div>
            </div>
            <div className="cal-modal__body">
              <div className="cal-detail">
                <div className="cal-detail__row">
                  <HiOutlineCalendar />
                  <span>{formatDate(showEventDetail.date)}</span>
                </div>
                <div className="cal-detail__row">
                  <HiOutlineClock />
                  <span>{showEventDetail.isAllDay ? 'All Day' : `${formatTime12h(showEventDetail.startTime)} - ${formatTime12h(showEventDetail.endTime)}`}</span>
                </div>
                {showEventDetail.location && (
                  <div className="cal-detail__row">
                    <HiOutlineLocationMarker />
                    <span>{showEventDetail.location}</span>
                  </div>
                )}
                <div className="cal-detail__row">
                  <HiOutlineTag />
                  <span className="cal-detail__priority" style={{ background: PRIORITY_MAP[showEventDetail.priority].color + '15', color: PRIORITY_MAP[showEventDetail.priority].color }}>
                    {PRIORITY_MAP[showEventDetail.priority].label} Priority
                  </span>
                </div>
                {showEventDetail.description && (
                  <div className="cal-detail__desc">
                    <p>{showEventDetail.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="cal-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="cal-modal cal-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="cal-confirm">
              <div className="cal-confirm__icon">
                <HiOutlineTrash />
              </div>
              <h3>Delete Event?</h3>
              <p>This action cannot be undone. The event will be permanently removed.</p>
              <div className="cal-confirm__actions">
                <button className="cal-btn cal-btn--outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="cal-btn cal-btn--danger" onClick={() => deleteEvent(deleteConfirm)}>
                  <HiOutlineTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
