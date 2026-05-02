/**
 * Notifications store — bell, inbox, broadcasts, preferences.
 *
 * Like the planner store, this is a thin client over the backend API
 * (migration 214). LocalStorage acts as a write-through cache for the
 * unread count + the last-fetched inbox so the bell renders instantly
 * on page load even if the network is slow.
 *
 * No localStorage seed data — when the backend is unreachable, the
 * inbox just shows empty rather than fake notifications.
 */
import axiosInstance from '@/services/api/axiosInstance';

const BASE = '/api/v1/notifications';

// ─── Types ───────────────────────────────────────────────────────────

export type Category = 'operations' | 'financial' | 'system' | 'announcement' | 'mention' | 'task';
export type Severity = 'critical' | 'warning' | 'info' | 'success';

export interface NotificationView {
  // notification fields
  id: string;
  templateId?: string;
  category: Category;
  severity: Severity;
  title: string;
  body?: string;
  icon?: string;
  actionUrl?: string;
  actionLabel?: string;
  payload: Record<string, unknown>;
  audienceSpec: Record<string, unknown>;
  createdBy?: string;
  sourceType?: string;
  sourceId?: string;
  expiresAt?: string;
  createdAt: string;
  // recipient fields
  recipientId: string;
  staffId: string;
  readAt?: string;
  dismissedAt?: string;
  pinned: boolean;
}

export interface Template {
  id: string;
  label: string;
  category: Category;
  severity: Severity;
  titleTemplate: string;
  bodyTemplate: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Preferences {
  staffId: string;
  category: Category;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  quietFrom?: string | null;
  quietTo?: string | null;
}

export interface AudienceSpec {
  allStaff?: boolean;
  roles?: string[];
  stateCodes?: string[];
  districts?: string[];
  staffIds?: string[];
}

export interface PublishInput {
  templateId?: string;
  category: Category;
  severity: Severity;
  title: string;
  body?: string;
  icon?: string;
  actionUrl?: string;
  actionLabel?: string;
  payload?: Record<string, unknown>;
  audience: AudienceSpec;
  createdBy?: string;
  sourceType?: string;
  sourceId?: string;
}

// ─── Cache keys ──────────────────────────────────────────────────────

const CACHE_INBOX = 'bm_notif_inbox_cache';
const CACHE_UNREAD = 'bm_notif_unread';
const CACHE_PREFS = 'bm_notif_prefs';

const fire = () => window.dispatchEvent(new CustomEvent('bm-notifications-changed'));

export const subscribe = (cb: () => void): (() => void) => {
  const handler = () => cb();
  window.addEventListener('bm-notifications-changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('bm-notifications-changed', handler);
    window.removeEventListener('storage', handler);
  };
};

// ─── Current viewer (synced with planner store viewer) ──────────────

const VIEWER_KEY = 'bm_planner_current_staff';
export const getViewerStaffId = (): string =>
  localStorage.getItem(VIEWER_KEY) || 'staff_1';

// ─── Public API ──────────────────────────────────────────────────────

export interface ListParams {
  unread?: boolean;
  category?: Category | '';
  severity?: Severity | '';
  limit?: number;
  offset?: number;
}

export interface ListResponse {
  items: NotificationView[];
  total: number;
}

export const fetchInbox = async (params: ListParams = {}): Promise<ListResponse> => {
  const staffId = getViewerStaffId();
  try {
    const r = await axiosInstance.get(BASE + '/', {
      params: {
        staffId,
        unread: params.unread ? 'true' : undefined,
        category: params.category || undefined,
        severity: params.severity || undefined,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      },
      timeout: 8000,
    });
    if (r.data?.success) {
      const items: NotificationView[] = r.data.data || [];
      const total = r.data.meta?.total ?? items.length;
      // Cache the first page for instant bell render next time
      if ((params.offset ?? 0) === 0) {
        try {
          localStorage.setItem(CACHE_INBOX, JSON.stringify({ staffId, items, fetchedAt: Date.now() }));
        } catch { /* ignore quota */ }
      }
      return { items, total };
    }
  } catch { /* fall through */ }
  // Fallback to cache if same staff
  try {
    const raw = localStorage.getItem(CACHE_INBOX);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.staffId === staffId) return { items: cached.items, total: cached.items.length };
    }
  } catch { /* ignore */ }
  return { items: [], total: 0 };
};

export const fetchUnreadCount = async (): Promise<number> => {
  const staffId = getViewerStaffId();
  try {
    const r = await axiosInstance.get(BASE + '/unread-count', { params: { staffId }, timeout: 5000 });
    if (r.data?.success) {
      const n = r.data.data?.unread ?? 0;
      localStorage.setItem(CACHE_UNREAD, String(n));
      return n;
    }
  } catch { /* ignore */ }
  // Fallback to cached
  const cached = localStorage.getItem(CACHE_UNREAD);
  return cached ? parseInt(cached) || 0 : 0;
};

export const markRead = async (recipientId: string): Promise<void> => {
  try {
    await axiosInstance.post(`${BASE}/recipients/${encodeURIComponent(recipientId)}/read`);
    fire();
  } catch { /* ignore */ }
};

export const dismiss = async (recipientId: string): Promise<void> => {
  try {
    await axiosInstance.post(`${BASE}/recipients/${encodeURIComponent(recipientId)}/dismiss`);
    fire();
  } catch { /* ignore */ }
};

export const togglePin = async (recipientId: string): Promise<void> => {
  try {
    await axiosInstance.post(`${BASE}/recipients/${encodeURIComponent(recipientId)}/toggle-pin`);
    fire();
  } catch { /* ignore */ }
};

export const markAllRead = async (): Promise<void> => {
  const staffId = getViewerStaffId();
  try {
    await axiosInstance.post(`${BASE}/mark-all-read`, null, { params: { staffId } });
    fire();
  } catch { /* ignore */ }
};

export const publish = async (input: PublishInput): Promise<{ id: string; recipientCount: number } | null> => {
  try {
    const r = await axiosInstance.post(`${BASE}/publish`, {
      ...input,
      createdBy: input.createdBy ?? getViewerStaffId(),
    });
    if (r.data?.success) {
      fire();
      return {
        id: r.data.data?.notification?.id,
        recipientCount: r.data.data?.recipient_count ?? 0,
      };
    }
  } catch { /* ignore */ }
  return null;
};

export const fetchTemplates = async (): Promise<Template[]> => {
  try {
    const r = await axiosInstance.get(`${BASE}/templates`);
    if (r.data?.success) return r.data.data || [];
  } catch { /* ignore */ }
  return [];
};

export const fetchPreferences = async (): Promise<Preferences[]> => {
  const staffId = getViewerStaffId();
  try {
    const r = await axiosInstance.get(`${BASE}/preferences`, { params: { staffId } });
    if (r.data?.success) {
      const prefs: Preferences[] = r.data.data || [];
      try { localStorage.setItem(CACHE_PREFS, JSON.stringify({ staffId, prefs })); } catch { /* ignore */ }
      return prefs;
    }
  } catch { /* ignore */ }
  // Fallback
  try {
    const raw = localStorage.getItem(CACHE_PREFS);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.staffId === staffId) return cached.prefs;
    }
  } catch { /* ignore */ }
  return [];
};

export const upsertPreference = async (p: Preferences): Promise<boolean> => {
  try {
    await axiosInstance.put(`${BASE}/preferences`, p);
    fire();
    return true;
  } catch { return false; }
};

// ─── Display helpers ─────────────────────────────────────────────────

export const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string }> = {
  operations:   { label: 'Operations',   emoji: '⚙️', color: '#3b82f6' },
  financial:    { label: 'Financial',    emoji: '💰', color: '#22c55e' },
  system:       { label: 'System',       emoji: '🔧', color: '#6b7280' },
  announcement: { label: 'Announcement', emoji: '📢', color: '#a855f7' },
  mention:      { label: 'Mention',      emoji: '@',  color: '#ec4899' },
  task:         { label: 'Task',         emoji: '📋', color: '#f59e0b' },
};

export const SEVERITY_META: Record<Severity, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#ef4444' },
  warning:  { label: 'Warning',  color: '#f59e0b' },
  info:     { label: 'Info',     color: '#3b82f6' },
  success:  { label: 'Success',  color: '#22c55e' },
};

export const fmtRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};
