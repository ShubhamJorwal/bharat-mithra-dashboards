/**
 * Surepass store — KYC & Verification catalogue + audit log.
 *
 * Thin client over /api/v1/surepass on the genome backend. Surfaces:
 *
 *   - getHealth()       → is SUREPASS_API_TOKEN set, which env will we hit
 *   - getCatalogue()    → the list of Surepass services we know about
 *   - getRecentCalls()  → last 50 audit rows (for live debugging)
 *
 * Per-service handlers (PAN, Bank, GSTIN, Aadhaar, …) get their own
 * function added here as they're integrated. Each one is a plain POST
 * with the request shape that matches the Surepass docs.
 */
import axiosInstance from '@/services/api/axiosInstance';

const BASE = '/api/v1/surepass';

export interface SurepassHealth {
  configured: boolean;
  environment: 'sandbox' | 'production';
  baseUrl: string;
}

export interface SurepassService {
  id: number;
  slug: string;
  category: string;
  name: string;
  description?: string;
  endpoint: string;
  costPaise: number;
  pricePaise: number;
  icon?: string;
  enabled: boolean;
  sandboxOnly: boolean;
  sortOrder: number;
}

export interface SurepassCallRow {
  id: number;
  serviceSlug: string;
  endpoint: string;
  method: string;
  responseStatus?: number;
  success: boolean;
  isBillable: boolean;
  errorMessage?: string;
  durationMs?: number;
  environment: string;
  createdAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export async function getHealth(): Promise<SurepassHealth> {
  const { data } = await axiosInstance.get<SurepassHealth & { success: boolean }>(`${BASE}/health`);
  return {
    configured: data.configured,
    environment: data.environment,
    baseUrl: data.baseUrl,
  };
}

export async function getCatalogue(): Promise<SurepassService[]> {
  const { data } = await axiosInstance.get<ApiEnvelope<SurepassService[]>>(`${BASE}/services`);
  return data.data ?? [];
}

export async function getRecentCalls(): Promise<SurepassCallRow[]> {
  const { data } = await axiosInstance.get<ApiEnvelope<SurepassCallRow[]>>(`${BASE}/recent-calls`);
  return data.data ?? [];
}

// ─── Per-service callers (added one at a time as docs come in) ────────
//
// As you paste docs for each Surepass API, we'll add a function here
// (e.g. verifyPan, verifyBank, …) that hits its dedicated backend
// endpoint. Until then, the catalogue page just shows the cards in
// "not yet integrated" state.
