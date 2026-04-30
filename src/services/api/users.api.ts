import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  UserDocument,
  CreateUserRequest,
  UpdateUserRequest,
  UsersQueryParams,
} from '@/types/api.types';

const BASE = '/api/v1/users';

export const usersApi = {
  // ---- admin CRUD on citizens ----
  list: async (params?: UsersQueryParams): Promise<PaginatedResponse<User>> => {
    const r = await axiosInstance.get(BASE, { params });
    return r.data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const r = await axiosInstance.get(`${BASE}/${id}`);
    return r.data;
  },

  getByMobile: async (mobile: string): Promise<ApiResponse<User>> => {
    const r = await axiosInstance.get(`${BASE}/mobile/${mobile}`);
    return r.data;
  },

  checkMobile: async (mobile: string): Promise<ApiResponse<{ exists: boolean }>> => {
    const r = await axiosInstance.get(`${BASE}/check-mobile`, { params: { mobile } });
    return r.data;
  },

  create: async (body: CreateUserRequest): Promise<ApiResponse<User>> => {
    const r = await axiosInstance.post(BASE, body);
    return r.data;
  },

  update: async (id: string, body: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const r = await axiosInstance.put(`${BASE}/${id}`, body);
    return r.data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/${id}`);
    return r.data;
  },

  listDocuments: async (id: string): Promise<ApiResponse<UserDocument[]>> => {
    const r = await axiosInstance.get(`${BASE}/${id}/documents`);
    return r.data;
  },
};

export default usersApi;
