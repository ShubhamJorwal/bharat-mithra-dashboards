/**
 * Planner backend API client.
 *
 * Wraps the /api/v1/planner endpoints. The plannerStore uses these when
 * available and silently falls back to localStorage if the backend is
 * unreachable, so the UX never breaks.
 */
import axiosInstance from '@/services/api/axiosInstance';
import type {
  CalendarItem, Notebook, NotebookPage, StickyNote, Label,
} from './plannerStore';

const BASE = '/api/v1/planner';
const HEALTH_KEY = 'bm_planner_backend_alive';
const HEALTH_TTL = 30_000; // re-probe at most every 30s

interface Snapshot {
  items: CalendarItem[];
  notebooks: Notebook[];
  pages: NotebookPage[];
  stickies: StickyNote[];
  labels: Label[];
}

let lastProbeAt = 0;
let lastProbeResult = false;

/** Quick probe — caches result for HEALTH_TTL. */
export const isBackendAlive = async (): Promise<boolean> => {
  const cached = sessionStorage.getItem(HEALTH_KEY);
  if (cached !== null && Date.now() - lastProbeAt < HEALTH_TTL) {
    return cached === '1';
  }
  try {
    await axiosInstance.get(`${BASE}/snapshot`, { timeout: 4000 });
    lastProbeResult = true;
  } catch {
    lastProbeResult = false;
  }
  lastProbeAt = Date.now();
  sessionStorage.setItem(HEALTH_KEY, lastProbeResult ? '1' : '0');
  return lastProbeResult;
};

export const fetchSnapshot = async (): Promise<Snapshot | null> => {
  try {
    const r = await axiosInstance.get(`${BASE}/snapshot`);
    if (r.data?.success) {
      return r.data.data as Snapshot;
    }
  } catch { /* ignore */ }
  return null;
};

export const upsertItemRemote = async (item: CalendarItem): Promise<boolean> => {
  try {
    await axiosInstance.put(`${BASE}/items/${encodeURIComponent(item.id)}`, item);
    return true;
  } catch { return false; }
};
export const deleteItemRemote = async (id: string): Promise<boolean> => {
  try { await axiosInstance.delete(`${BASE}/items/${encodeURIComponent(id)}`); return true; }
  catch { return false; }
};

export const upsertNotebookRemote = async (nb: Notebook): Promise<boolean> => {
  try { await axiosInstance.put(`${BASE}/notebooks/${encodeURIComponent(nb.id)}`, nb); return true; }
  catch { return false; }
};
export const deleteNotebookRemote = async (id: string): Promise<boolean> => {
  try { await axiosInstance.delete(`${BASE}/notebooks/${encodeURIComponent(id)}`); return true; }
  catch { return false; }
};

export const upsertPageRemote = async (p: NotebookPage): Promise<boolean> => {
  try { await axiosInstance.put(`${BASE}/pages/${encodeURIComponent(p.id)}`, p); return true; }
  catch { return false; }
};
export const deletePageRemote = async (id: string): Promise<boolean> => {
  try { await axiosInstance.delete(`${BASE}/pages/${encodeURIComponent(id)}`); return true; }
  catch { return false; }
};

export const upsertStickyRemote = async (s: StickyNote): Promise<boolean> => {
  try { await axiosInstance.put(`${BASE}/stickies/${encodeURIComponent(s.id)}`, s); return true; }
  catch { return false; }
};
export const deleteStickyRemote = async (id: string): Promise<boolean> => {
  try { await axiosInstance.delete(`${BASE}/stickies/${encodeURIComponent(id)}`); return true; }
  catch { return false; }
};

export const upsertLabelRemote = async (l: Label): Promise<boolean> => {
  try { await axiosInstance.put(`${BASE}/labels/${encodeURIComponent(l.id)}`, l); return true; }
  catch { return false; }
};
export const deleteLabelRemote = async (id: string): Promise<boolean> => {
  try { await axiosInstance.delete(`${BASE}/labels/${encodeURIComponent(id)}`); return true; }
  catch { return false; }
};
