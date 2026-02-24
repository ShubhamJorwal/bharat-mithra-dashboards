import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  ServiceFieldTemplate,
  FieldTemplateCreateRequest,
  FieldTemplateUpdateRequest,
  ServiceFormTemplateMapping,
  TemplateMappingCreateRequest,
  CommissionSlab,
  CommissionSlabCreateRequest,
  CommissionSlabUpdateRequest,
  CommissionTransaction,
  CommissionSummary,
  ServiceProvider,
  ServiceProviderCreateRequest,
  ServiceProviderUpdateRequest,
  ServiceBundle,
  ServiceBundleCreateRequest,
  ServiceBundleUpdateRequest,
  ServiceReview,
  ServiceReviewCreateRequest,
  ServiceReviewSummary,
} from '../../types/api.types';

const FIELD_TEMPLATES_BASE = '/api/v1/field-templates';
const COMMISSIONS_BASE = '/api/v1/commissions';
const PROVIDERS_BASE = '/api/v1/providers';
const BUNDLES_BASE = '/api/v1/bundles';
const SERVICES_BASE = '/api/v1/services';
const REVIEWS_BASE = '/api/v1/reviews';

export const platformApi = {
  // ═══════════ Field Templates ═══════════

  getFieldTemplates: async (category?: string): Promise<ApiResponse<ServiceFieldTemplate[]>> => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get(FIELD_TEMPLATES_BASE, { params });
    return response.data;
  },

  getFieldTemplateById: async (id: string): Promise<ApiResponse<ServiceFieldTemplate>> => {
    const response = await axiosInstance.get(`${FIELD_TEMPLATES_BASE}/${id}`);
    return response.data;
  },

  getFieldTemplatesByCategory: async (category: string): Promise<ApiResponse<ServiceFieldTemplate[]>> => {
    const response = await axiosInstance.get(`${FIELD_TEMPLATES_BASE}/category/${category}`);
    return response.data;
  },

  createFieldTemplate: async (data: FieldTemplateCreateRequest): Promise<ApiResponse<ServiceFieldTemplate>> => {
    const response = await axiosInstance.post(FIELD_TEMPLATES_BASE, data);
    return response.data;
  },

  updateFieldTemplate: async (id: string, data: FieldTemplateUpdateRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`${FIELD_TEMPLATES_BASE}/${id}`, data);
    return response.data;
  },

  deleteFieldTemplate: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${FIELD_TEMPLATES_BASE}/${id}`);
    return response.data;
  },

  // ═══════════ Template Mapping ═══════════

  getServiceFieldTemplates: async (serviceId: string): Promise<ApiResponse<ServiceFormTemplateMapping[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/field-templates`);
    return response.data;
  },

  mapTemplateToService: async (serviceId: string, data: TemplateMappingCreateRequest): Promise<ApiResponse<ServiceFormTemplateMapping>> => {
    const response = await axiosInstance.post(`${SERVICES_BASE}/${serviceId}/field-templates`, data);
    return response.data;
  },

  removeTemplateFromService: async (serviceId: string, templateId: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${SERVICES_BASE}/${serviceId}/field-templates/${templateId}`);
    return response.data;
  },

  // ═══════════ Commission Slabs ═══════════

  getCommissionSlabs: async (params?: { service_id?: string; category_id?: string; agent_type?: string }): Promise<ApiResponse<CommissionSlab[]>> => {
    const response = await axiosInstance.get(`${COMMISSIONS_BASE}/slabs`, { params });
    return response.data;
  },

  getCommissionSlabById: async (id: string): Promise<ApiResponse<CommissionSlab>> => {
    const response = await axiosInstance.get(`${COMMISSIONS_BASE}/slabs/${id}`);
    return response.data;
  },

  createCommissionSlab: async (data: CommissionSlabCreateRequest): Promise<ApiResponse<CommissionSlab>> => {
    const response = await axiosInstance.post(`${COMMISSIONS_BASE}/slabs`, data);
    return response.data;
  },

  updateCommissionSlab: async (id: string, data: CommissionSlabUpdateRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`${COMMISSIONS_BASE}/slabs/${id}`, data);
    return response.data;
  },

  // ═══════════ Commission Transactions ═══════════

  getCommissionTransactions: async (params?: { agent_id?: string; status?: string; page?: number; per_page?: number }): Promise<PaginatedResponse<CommissionTransaction>> => {
    const response = await axiosInstance.get(`${COMMISSIONS_BASE}/transactions`, { params });
    return response.data;
  },

  getCommissionSummary: async (agentId: string): Promise<ApiResponse<CommissionSummary>> => {
    const response = await axiosInstance.get(`${COMMISSIONS_BASE}/summary`, { params: { agent_id: agentId } });
    return response.data;
  },

  // ═══════════ Service Providers ═══════════

  getServiceProviders: async (type?: string): Promise<ApiResponse<ServiceProvider[]>> => {
    const params = type ? { type } : {};
    const response = await axiosInstance.get(PROVIDERS_BASE, { params });
    return response.data;
  },

  getServiceProviderById: async (id: string): Promise<ApiResponse<ServiceProvider>> => {
    const response = await axiosInstance.get(`${PROVIDERS_BASE}/${id}`);
    return response.data;
  },

  createServiceProvider: async (data: ServiceProviderCreateRequest): Promise<ApiResponse<ServiceProvider>> => {
    const response = await axiosInstance.post(PROVIDERS_BASE, data);
    return response.data;
  },

  updateServiceProvider: async (id: string, data: ServiceProviderUpdateRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`${PROVIDERS_BASE}/${id}`, data);
    return response.data;
  },

  // ═══════════ Service Bundles ═══════════

  getServiceBundles: async (featured?: boolean): Promise<ApiResponse<ServiceBundle[]>> => {
    const params = featured !== undefined ? { featured: String(featured) } : {};
    const response = await axiosInstance.get(BUNDLES_BASE, { params });
    return response.data;
  },

  getServiceBundleById: async (id: string): Promise<ApiResponse<ServiceBundle>> => {
    const response = await axiosInstance.get(`${BUNDLES_BASE}/${id}`);
    return response.data;
  },

  createServiceBundle: async (data: ServiceBundleCreateRequest): Promise<ApiResponse<ServiceBundle>> => {
    const response = await axiosInstance.post(BUNDLES_BASE, data);
    return response.data;
  },

  updateServiceBundle: async (id: string, data: ServiceBundleUpdateRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`${BUNDLES_BASE}/${id}`, data);
    return response.data;
  },

  // ═══════════ Service Reviews ═══════════

  getServiceReviews: async (serviceId: string, params?: { page?: number; per_page?: number; approved?: string }): Promise<PaginatedResponse<ServiceReview>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/reviews`, { params });
    return response.data;
  },

  createServiceReview: async (serviceId: string, data: ServiceReviewCreateRequest): Promise<ApiResponse<ServiceReview>> => {
    const response = await axiosInstance.post(`${SERVICES_BASE}/${serviceId}/reviews`, data);
    return response.data;
  },

  getReviewSummary: async (serviceId: string): Promise<ApiResponse<ServiceReviewSummary>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/reviews/summary`);
    return response.data;
  },

  approveReview: async (reviewId: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`${REVIEWS_BASE}/${reviewId}/approve`);
    return response.data;
  },
};

export default platformApi;
