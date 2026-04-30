import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceProfile,
  ServiceCompleteResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateProfileRequest,
  UpdateProfileRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ServicesQueryParams,
  CatalogStats,
} from '@/types/api.types';

const BASE = '/api/v1';

export const servicesApi = {
  // Stats
  stats: async (): Promise<ApiResponse<CatalogStats>> => {
    const r = await axiosInstance.get(`${BASE}/services/stats`);
    return r.data;
  },

  // Categories
  listCategories: async (withCount = true): Promise<ApiResponse<ServiceCategory[]>> => {
    const r = await axiosInstance.get(`${BASE}/categories`, { params: { with_count: withCount } });
    return r.data;
  },
  getCategory: async (idOrSlug: string): Promise<ApiResponse<ServiceCategory>> => {
    const r = await axiosInstance.get(`${BASE}/categories/${idOrSlug}`);
    return r.data;
  },
  createCategory: async (body: CreateCategoryRequest): Promise<ApiResponse<ServiceCategory>> => {
    const r = await axiosInstance.post(`${BASE}/categories`, body);
    return r.data;
  },
  updateCategory: async (id: string, body: UpdateCategoryRequest): Promise<ApiResponse<ServiceCategory>> => {
    const r = await axiosInstance.put(`${BASE}/categories/${id}`, body);
    return r.data;
  },

  // Services
  list: async (params?: ServicesQueryParams): Promise<PaginatedResponse<Service>> => {
    const r = await axiosInstance.get(`${BASE}/services`, { params });
    return r.data;
  },
  get: async (idOrSlug: string, withProfiles = false): Promise<ApiResponse<Service>> => {
    const r = await axiosInstance.get(`${BASE}/services/${idOrSlug}`, { params: { with_profiles: withProfiles } });
    return r.data;
  },
  getComplete: async (
    idOrSlug: string,
    opts?: { state_code?: string; applicant_category?: string; channel?: string }
  ): Promise<ApiResponse<ServiceCompleteResponse>> => {
    const r = await axiosInstance.get(`${BASE}/services/${idOrSlug}/complete`, { params: opts });
    return r.data;
  },
  create: async (body: CreateServiceRequest): Promise<ApiResponse<Service>> => {
    const r = await axiosInstance.post(`${BASE}/services`, body);
    return r.data;
  },
  update: async (id: string, body: UpdateServiceRequest): Promise<ApiResponse<Service>> => {
    const r = await axiosInstance.put(`${BASE}/services/${id}`, body);
    return r.data;
  },
  remove: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/services/${id}`);
    return r.data;
  },

  // Profiles
  listProfiles: async (serviceIdOrSlug: string): Promise<ApiResponse<ServiceProfile[]>> => {
    const r = await axiosInstance.get(`${BASE}/services/${serviceIdOrSlug}/profiles`);
    return r.data;
  },
  createProfile: async (serviceId: string, body: CreateProfileRequest): Promise<ApiResponse<ServiceProfile>> => {
    const r = await axiosInstance.post(`${BASE}/services/${serviceId}/profiles`, body);
    return r.data;
  },
  updateProfile: async (id: string, body: UpdateProfileRequest): Promise<ApiResponse<ServiceProfile>> => {
    const r = await axiosInstance.put(`${BASE}/profiles/${id}`, body);
    return r.data;
  },
  deleteProfile: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/profiles/${id}`);
    return r.data;
  },
};

export default servicesApi;
