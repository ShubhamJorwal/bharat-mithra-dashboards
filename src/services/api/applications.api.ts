import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  Application,
  ApplicationListResponse,
  ApplicationStatsResponse,
  ApplicationMetaResponse,
  ApplicationListFilters,
  ApplicationDocument,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ChangeApplicationStatusRequest,
  AssignApplicationRequest,
  AddApplicationDocumentRequest,
  ReviewApplicationDocumentRequest,
} from '@/types/api.types';

const BASE = '/api/v1/applications';

const buildQS = (f: ApplicationListFilters): string => {
  const q = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

const applicationsApi = {
  meta: async (): Promise<ApiResponse<ApplicationMetaResponse>> => {
    const r = await axiosInstance.get(`${BASE}/meta`);
    return r.data;
  },

  stats: async (): Promise<ApiResponse<ApplicationStatsResponse>> => {
    const r = await axiosInstance.get(`${BASE}/stats`);
    return r.data;
  },

  list: async (filters: ApplicationListFilters = {}): Promise<ApiResponse<ApplicationListResponse>> => {
    const r = await axiosInstance.get(`${BASE}${buildQS(filters)}`);
    return r.data;
  },

  myQueue: async (filters: ApplicationListFilters = {}): Promise<ApiResponse<ApplicationListResponse>> => {
    const r = await axiosInstance.get(`${BASE}/queues/me${buildQS(filters)}`);
    return r.data;
  },

  get: async (id: string): Promise<ApiResponse<Application>> => {
    const r = await axiosInstance.get(`${BASE}/${id}`);
    return r.data;
  },

  create: async (body: CreateApplicationRequest): Promise<ApiResponse<Application>> => {
    const r = await axiosInstance.post(BASE, body);
    return r.data;
  },

  update: async (id: string, body: UpdateApplicationRequest): Promise<ApiResponse<Application>> => {
    const r = await axiosInstance.patch(`${BASE}/${id}`, body);
    return r.data;
  },

  changeStatus: async (id: string, body: ChangeApplicationStatusRequest): Promise<ApiResponse<Application>> => {
    const r = await axiosInstance.post(`${BASE}/${id}/status`, body);
    return r.data;
  },

  assign: async (id: string, body: AssignApplicationRequest): Promise<ApiResponse<Application>> => {
    const r = await axiosInstance.post(`${BASE}/${id}/assign`, body);
    return r.data;
  },

  addDocument: async (id: string, body: AddApplicationDocumentRequest): Promise<ApiResponse<ApplicationDocument>> => {
    const r = await axiosInstance.post(`${BASE}/${id}/documents`, body);
    return r.data;
  },

  reviewDocument: async (docID: string, body: ReviewApplicationDocumentRequest): Promise<ApiResponse<ApplicationDocument>> => {
    const r = await axiosInstance.patch(`${BASE}/documents/${docID}/review`, body);
    return r.data;
  },

  deleteDocument: async (docID: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/documents/${docID}`);
    return r.data;
  },
};

export default applicationsApi;
