import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  StatesManagementResponse,
  UpdateStateManagementRequest,
  State,
  StateLevelResponse,
  DistrictLevelResponse,
  TalukLevelResponse,
  GPLevelResponse,
  SlotDefinitionsResponse,
  StaffAssignment,
  StaffMini,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
} from '@/types/api.types';

const BASE = '/api/v1/management';

const managementApi = {
  // ─── State picker (level 0) ──────────────────────────────────────────
  listStates: async (): Promise<ApiResponse<StatesManagementResponse>> => {
    const r = await axiosInstance.get(`${BASE}/states`);
    return r.data;
  },

  updateStateManagement: async (
    id: string,
    body: UpdateStateManagementRequest,
  ): Promise<ApiResponse<State>> => {
    const r = await axiosInstance.patch(`${BASE}/states/${id}`, body);
    return r.data;
  },

  // ─── Staff Management ────────────────────────────────────────────────
  getSlotDefinitions: async (): Promise<ApiResponse<SlotDefinitionsResponse>> => {
    const r = await axiosInstance.get(`${BASE}/staff/slots`);
    return r.data;
  },

  searchStaff: async (
    q: string,
    stateCode?: string,
    limit = 25,
  ): Promise<ApiResponse<{ results: StaffMini[]; total: number }>> => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (stateCode) params.append('state_code', stateCode);
    params.append('limit', String(limit));
    const r = await axiosInstance.get(`${BASE}/staff/search?${params.toString()}`);
    return r.data;
  },

  getStateLevel: async (stateId: string): Promise<ApiResponse<StateLevelResponse>> => {
    const r = await axiosInstance.get(`${BASE}/staff/state/${stateId}`);
    return r.data;
  },

  getDistrictLevel: async (districtId: string): Promise<ApiResponse<DistrictLevelResponse>> => {
    const r = await axiosInstance.get(`${BASE}/staff/district/${districtId}`);
    return r.data;
  },

  getDistrictGPs: async (districtId: string): Promise<ApiResponse<GPLevelResponse>> => {
    const r = await axiosInstance.get(`${BASE}/staff/district/${districtId}/gps`);
    return r.data;
  },

  getTalukLevel: async (talukId: string): Promise<ApiResponse<TalukLevelResponse>> => {
    const r = await axiosInstance.get(`${BASE}/staff/taluk/${talukId}`);
    return r.data;
  },

  getAssignment: async (id: string): Promise<ApiResponse<StaffAssignment>> => {
    const r = await axiosInstance.get(`${BASE}/staff/assignments/${id}`);
    return r.data;
  },

  createAssignment: async (body: CreateAssignmentRequest): Promise<ApiResponse<StaffAssignment>> => {
    const r = await axiosInstance.post(`${BASE}/staff/assignments`, body);
    return r.data;
  },

  updateAssignment: async (
    id: string,
    body: UpdateAssignmentRequest,
  ): Promise<ApiResponse<StaffAssignment>> => {
    const r = await axiosInstance.patch(`${BASE}/staff/assignments/${id}`, body);
    return r.data;
  },

  deleteAssignment: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/staff/assignments/${id}`);
    return r.data;
  },
};

export default managementApi;
