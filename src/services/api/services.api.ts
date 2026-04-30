import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceProfile,
  ServiceCompleteResponse,
  ServiceDocument,
  ServiceWorkflowStep,
  ServiceFAQ,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateProfileRequest,
  UpdateProfileRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CreateWorkflowStepRequest,
  UpdateWorkflowStepRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
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

  // Documents
  listDocuments: async (idOrSlug: string, profileId?: string): Promise<ApiResponse<ServiceDocument[]>> => {
    const r = await axiosInstance.get(`${BASE}/services/${idOrSlug}/documents`, {
      params: profileId ? { profile_id: profileId } : undefined,
    });
    return r.data;
  },
  createDocument: async (idOrSlug: string, body: CreateDocumentRequest): Promise<ApiResponse<ServiceDocument>> => {
    const r = await axiosInstance.post(`${BASE}/services/${idOrSlug}/documents`, body);
    return r.data;
  },
  updateDocument: async (id: string, body: UpdateDocumentRequest): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.put(`${BASE}/documents/${id}`, body);
    return r.data;
  },
  deleteDocument: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/documents/${id}`);
    return r.data;
  },

  // Workflow steps
  listWorkflow: async (idOrSlug: string, profileId?: string): Promise<ApiResponse<ServiceWorkflowStep[]>> => {
    const r = await axiosInstance.get(`${BASE}/services/${idOrSlug}/workflow`, {
      params: profileId ? { profile_id: profileId } : undefined,
    });
    return r.data;
  },
  createWorkflowStep: async (idOrSlug: string, body: CreateWorkflowStepRequest): Promise<ApiResponse<ServiceWorkflowStep>> => {
    const r = await axiosInstance.post(`${BASE}/services/${idOrSlug}/workflow`, body);
    return r.data;
  },
  updateWorkflowStep: async (id: string, body: UpdateWorkflowStepRequest): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.put(`${BASE}/workflow/${id}`, body);
    return r.data;
  },
  deleteWorkflowStep: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/workflow/${id}`);
    return r.data;
  },

  // FAQs
  listFAQs: async (idOrSlug: string): Promise<ApiResponse<ServiceFAQ[]>> => {
    const r = await axiosInstance.get(`${BASE}/services/${idOrSlug}/faqs`);
    return r.data;
  },
  createFAQ: async (idOrSlug: string, body: CreateFAQRequest): Promise<ApiResponse<ServiceFAQ>> => {
    const r = await axiosInstance.post(`${BASE}/services/${idOrSlug}/faqs`, body);
    return r.data;
  },
  updateFAQ: async (id: string, body: UpdateFAQRequest): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.put(`${BASE}/faqs/${id}`, body);
    return r.data;
  },
  deleteFAQ: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/faqs/${id}`);
    return r.data;
  },

  // Form field sections
  listFields: async (idOrSlug: string, profileId?: string): Promise<ApiResponse<unknown[]>> => {
    const r = await axiosInstance.get(`${BASE}/services/${idOrSlug}/fields`, {
      params: profileId ? { profile_id: profileId } : undefined,
    });
    return r.data;
  },
  createFieldSection: async (
    idOrSlug: string,
    body: {
      profile_id?: string;
      section_title?: string;
      section_order?: number;
      field_schema?: unknown;
      field_overrides?: unknown;
      excluded_fields?: string[];
    }
  ): Promise<ApiResponse<unknown>> => {
    const r = await axiosInstance.post(`${BASE}/services/${idOrSlug}/fields`, body);
    return r.data;
  },
  updateFieldSection: async (id: string, body: Record<string, unknown>): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.put(`${BASE}/fields/${id}`, body);
    return r.data;
  },
  deleteFieldSection: async (id: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.delete(`${BASE}/fields/${id}`);
    return r.data;
  },
};

export default servicesApi;
