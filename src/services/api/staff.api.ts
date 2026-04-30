import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  Staff,
  CreateStaffRequest,
  CreateStaffResponse,
  UpdateStaffRequest,
  StaffLoginRequest,
  StaffLoginResponse,
  ChangePasswordRequest,
  AddRoleRequest,
  StaffRoleAssignment,
  RolesCatalog,
  StaffAuditEntry,
  StaffQueryParams,
} from '@/types/api.types';

const BASE = '/api/v1/staff';

export const staffApi = {
  // ---- catalog ----
  catalog: async (): Promise<ApiResponse<RolesCatalog>> => {
    const r = await axiosInstance.get(`${BASE}/roles-catalog`);
    return r.data;
  },

  // ---- auth ----
  login: async (body: StaffLoginRequest): Promise<ApiResponse<StaffLoginResponse>> => {
    const r = await axiosInstance.post(`${BASE}/auth/login`, body);
    return r.data;
  },

  refresh: async (refresh_token: string): Promise<ApiResponse<StaffLoginResponse>> => {
    const r = await axiosInstance.post(`${BASE}/auth/refresh`, { refresh_token });
    return r.data;
  },

  logout: async (refresh_token?: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.post(`${BASE}/auth/logout`, { refresh_token });
    return r.data;
  },

  me: async (): Promise<ApiResponse<Staff>> => {
    const r = await axiosInstance.get(`${BASE}/me`);
    return r.data;
  },

  changePassword: async (body: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.post(`${BASE}/me/password`, body);
    return r.data;
  },

  // ---- CRUD ----
  list: async (params?: StaffQueryParams): Promise<PaginatedResponse<Staff>> => {
    const r = await axiosInstance.get(BASE, { params });
    return r.data;
  },

  getById: async (id: string): Promise<ApiResponse<Staff>> => {
    const r = await axiosInstance.get(`${BASE}/${id}`);
    return r.data;
  },

  create: async (body: CreateStaffRequest): Promise<ApiResponse<CreateStaffResponse>> => {
    const r = await axiosInstance.post(BASE, body);
    return r.data;
  },

  update: async (id: string, body: UpdateStaffRequest): Promise<ApiResponse<Staff>> => {
    const r = await axiosInstance.put(`${BASE}/${id}`, body);
    return r.data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/${id}`);
    return r.data;
  },

  // ---- roles ----
  listRoles: async (id: string): Promise<ApiResponse<StaffRoleAssignment[]>> => {
    const r = await axiosInstance.get(`${BASE}/${id}/roles`);
    return r.data;
  },

  addRole: async (id: string, body: AddRoleRequest): Promise<ApiResponse<StaffRoleAssignment>> => {
    const r = await axiosInstance.post(`${BASE}/${id}/roles`, body);
    return r.data;
  },

  removeRole: async (id: string, roleId: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/${id}/roles/${roleId}`);
    return r.data;
  },

  // ---- audit ----
  audit: async (id: string, limit = 50): Promise<ApiResponse<StaffAuditEntry[]>> => {
    const r = await axiosInstance.get(`${BASE}/${id}/audit`, { params: { limit } });
    return r.data;
  },

  allAudit: async (limit = 100): Promise<ApiResponse<StaffAuditEntry[]>> => {
    const r = await axiosInstance.get(`${BASE}/audit`, { params: { limit } });
    return r.data;
  },
};

export default staffApi;
