import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceForm,
  ServiceFAQ,
  ServiceDocument,
  ServiceWorkflow,
  ServicesQueryParams,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
  CreateFormRequest,
  CreateServiceDocumentRequest,
  UpdateServiceDocumentRequest,
  CreateServiceWorkflowRequest,
  UpdateServiceWorkflowRequest,
  GroupedServicesResponse,
  ServicePricing,
  ServiceCaseworkerInfo,
  ServiceChecklist,
  ServiceOfficeLocation,
  ServiceCompleteDetails,
  ServicePricingQueryParams,
  ServiceCaseworkerQueryParams,
  ServiceChecklistQueryParams,
  ServiceOfficeQueryParams
} from '../../types/api.types';

const CATEGORIES_BASE = '/api/v1/categories';
const SERVICES_BASE = '/api/v1/services';
const FORMS_BASE = '/api/v1/forms';
const FAQS_BASE = '/api/v1/faqs';
const DOCUMENTS_BASE = '/api/v1/documents';
const WORKFLOWS_BASE = '/api/v1/workflows';

export const servicesApi = {
  // ==================== CATEGORY ENDPOINTS ====================

  // Get all active categories
  getCategories: async (): Promise<ApiResponse<ServiceCategory[]>> => {
    const response = await axiosInstance.get(CATEGORIES_BASE);
    return response.data;
  },

  // Get all categories including inactive (Admin)
  getAllCategories: async (includeInactive: boolean = false): Promise<ApiResponse<ServiceCategory[]>> => {
    const response = await axiosInstance.get(`${CATEGORIES_BASE}/all`, {
      params: { include_inactive: includeInactive }
    });
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<ApiResponse<ServiceCategory>> => {
    const response = await axiosInstance.get(`${CATEGORIES_BASE}/${id}`);
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<ApiResponse<ServiceCategory>> => {
    const response = await axiosInstance.get(`${CATEGORIES_BASE}/slug/${slug}`);
    return response.data;
  },

  // Get subcategories of a category
  getSubcategories: async (categoryId: string): Promise<ApiResponse<ServiceCategory[]>> => {
    const response = await axiosInstance.get(`${CATEGORIES_BASE}/${categoryId}/subcategories`);
    return response.data;
  },

  // Get services by category
  getServicesByCategory: async (categoryId: string): Promise<ApiResponse<Service[]>> => {
    const response = await axiosInstance.get(`${CATEGORIES_BASE}/${categoryId}/services`);
    return response.data;
  },

  // Create a new category
  createCategory: async (data: CreateCategoryRequest): Promise<ApiResponse<ServiceCategory>> => {
    const response = await axiosInstance.post(CATEGORIES_BASE, data);
    return response.data;
  },

  // Update a category
  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<ApiResponse<ServiceCategory>> => {
    const response = await axiosInstance.put(`${CATEGORIES_BASE}/${id}`, data);
    return response.data;
  },

  // Delete a category (soft delete)
  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${CATEGORIES_BASE}/${id}`);
    return response.data;
  },

  // ==================== SERVICE ENDPOINTS ====================

  // Get paginated list of services
  getServices: async (params?: ServicesQueryParams): Promise<PaginatedResponse<Service>> => {
    const response = await axiosInstance.get(SERVICES_BASE, { params });
    return response.data;
  },

  // Get services grouped by category
  getServicesGrouped: async (): Promise<ApiResponse<GroupedServicesResponse>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/grouped`);
    return response.data;
  },

  // Get all services including inactive (Admin)
  getAllServices: async (includeInactive: boolean = false): Promise<ApiResponse<Service[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/all`, {
      params: { include_inactive: includeInactive }
    });
    return response.data;
  },

  // Get popular services
  getPopularServices: async (limit: number = 10): Promise<ApiResponse<Service[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/popular`, {
      params: { limit }
    });
    return response.data;
  },

  // Get featured services
  getFeaturedServices: async (): Promise<ApiResponse<Service[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/featured`);
    return response.data;
  },

  // Search services
  searchServices: async (query: string, page: number = 1, perPage: number = 20): Promise<PaginatedResponse<Service>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/search`, {
      params: { q: query, page, per_page: perPage }
    });
    return response.data;
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<ApiResponse<Service>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${id}`);
    return response.data;
  },

  // Get service by slug
  getServiceBySlug: async (slug: string): Promise<ApiResponse<Service>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}`);
    return response.data;
  },

  // Create a new service
  createService: async (data: CreateServiceRequest): Promise<ApiResponse<Service>> => {
    const response = await axiosInstance.post(SERVICES_BASE, data);
    return response.data;
  },

  // Update a service
  updateService: async (id: string, data: UpdateServiceRequest): Promise<ApiResponse<Service>> => {
    const response = await axiosInstance.put(`${SERVICES_BASE}/${id}`, data);
    return response.data;
  },

  // Delete a service (soft delete)
  deleteService: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${SERVICES_BASE}/${id}`);
    return response.data;
  },

  // Get active form for a service
  getServiceForm: async (serviceId: string): Promise<ApiResponse<ServiceForm>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/form`);
    return response.data;
  },

  // Get all form versions for a service
  getServiceFormVersions: async (serviceId: string): Promise<ApiResponse<ServiceForm[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/form-versions`);
    return response.data;
  },

  // Get FAQs for a service by ID
  getServiceFAQs: async (serviceId: string): Promise<ApiResponse<ServiceFAQ[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/faqs`);
    return response.data;
  },

  // Get FAQs for a service by slug
  getServiceFAQsBySlug: async (slug: string): Promise<ApiResponse<ServiceFAQ[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/faqs`);
    return response.data;
  },

  // ==================== FORM ENDPOINTS ====================

  // Create a new form
  createForm: async (data: CreateFormRequest): Promise<ApiResponse<ServiceForm>> => {
    const response = await axiosInstance.post(FORMS_BASE, data);
    return response.data;
  },

  // Get form by ID
  getFormById: async (id: string): Promise<ApiResponse<ServiceForm>> => {
    const response = await axiosInstance.get(`${FORMS_BASE}/${id}`);
    return response.data;
  },

  // Update a form
  updateForm: async (id: string, data: { form_schema?: object; is_active?: boolean }): Promise<ApiResponse<ServiceForm>> => {
    const response = await axiosInstance.put(`${FORMS_BASE}/${id}`, data);
    return response.data;
  },

  // Delete a form
  deleteForm: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${FORMS_BASE}/${id}`);
    return response.data;
  },

  // ==================== FAQ ENDPOINTS ====================

  // Create a new FAQ
  createFAQ: async (data: CreateFAQRequest): Promise<ApiResponse<ServiceFAQ>> => {
    const response = await axiosInstance.post(FAQS_BASE, data);
    return response.data;
  },

  // Get FAQ by ID
  getFAQById: async (id: string): Promise<ApiResponse<ServiceFAQ>> => {
    const response = await axiosInstance.get(`${FAQS_BASE}/${id}`);
    return response.data;
  },

  // Update a FAQ
  updateFAQ: async (id: string, data: UpdateFAQRequest): Promise<ApiResponse<ServiceFAQ>> => {
    const response = await axiosInstance.put(`${FAQS_BASE}/${id}`, data);
    return response.data;
  },

  // Delete a FAQ
  deleteFAQ: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${FAQS_BASE}/${id}`);
    return response.data;
  },

  // ==================== PRICING ENDPOINTS ====================

  // Get pricing for a service in a specific state/district
  getServicePricing: async (serviceId: string, params: ServicePricingQueryParams): Promise<ApiResponse<ServicePricing>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/pricing`, { params });
    return response.data;
  },

  // Get all pricing entries for a service
  getAllServicePricing: async (serviceId: string): Promise<ApiResponse<ServicePricing[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/pricing/all`);
    return response.data;
  },

  // Get pricing by slug
  getServicePricingBySlug: async (slug: string, params: ServicePricingQueryParams): Promise<ApiResponse<ServicePricing>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/pricing`, { params });
    return response.data;
  },

  // Get all service pricing for a specific state
  getStatePricing: async (stateCode: string): Promise<ApiResponse<ServicePricing[]>> => {
    const response = await axiosInstance.get(`/api/v1/pricing/state/${stateCode}`);
    return response.data;
  },

  // ==================== CASEWORKER INFO ENDPOINTS ====================

  // Get caseworker information for a service
  getCaseworkerInfo: async (serviceId: string, params: ServiceCaseworkerQueryParams): Promise<ApiResponse<ServiceCaseworkerInfo>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/caseworker-info`, { params });
    return response.data;
  },

  // Get caseworker information by slug
  getCaseworkerInfoBySlug: async (slug: string, params: ServiceCaseworkerQueryParams): Promise<ApiResponse<ServiceCaseworkerInfo>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/caseworker-info`, { params });
    return response.data;
  },

  // ==================== CHECKLIST ENDPOINTS ====================

  // Get checklists for a service
  getServiceChecklists: async (serviceId: string, params?: ServiceChecklistQueryParams): Promise<ApiResponse<ServiceChecklist[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/checklists`, { params });
    return response.data;
  },

  // ==================== OFFICE LOCATION ENDPOINTS ====================

  // Get office locations for a service
  getServiceOffices: async (serviceId: string, params?: ServiceOfficeQueryParams): Promise<ApiResponse<ServiceOfficeLocation[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/offices`, { params });
    return response.data;
  },

  // ==================== COMPLETE DETAILS ENDPOINTS ====================

  // Get service with all related information
  getServiceCompleteDetails: async (serviceId: string, params?: ServicePricingQueryParams): Promise<ApiResponse<ServiceCompleteDetails>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/complete`, { params });
    return response.data;
  },

  // Get service complete details by slug
  getServiceCompleteDetailsBySlug: async (slug: string, params?: ServicePricingQueryParams): Promise<ApiResponse<ServiceCompleteDetails>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/complete`, { params });
    return response.data;
  },

  // ==================== DOCUMENT ENDPOINTS ====================

  // Get documents for a service by ID
  getServiceDocuments: async (serviceId: string): Promise<ApiResponse<ServiceDocument[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/documents`);
    return response.data;
  },

  // Get documents for a service by slug
  getServiceDocumentsBySlug: async (slug: string): Promise<ApiResponse<ServiceDocument[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/documents`);
    return response.data;
  },

  // Create a new document
  createDocument: async (data: CreateServiceDocumentRequest): Promise<ApiResponse<ServiceDocument>> => {
    const response = await axiosInstance.post(DOCUMENTS_BASE, data);
    return response.data;
  },

  // Get document by ID
  getDocumentById: async (id: string): Promise<ApiResponse<ServiceDocument>> => {
    const response = await axiosInstance.get(`${DOCUMENTS_BASE}/${id}`);
    return response.data;
  },

  // Update a document
  updateDocument: async (id: string, data: UpdateServiceDocumentRequest): Promise<ApiResponse<ServiceDocument>> => {
    const response = await axiosInstance.put(`${DOCUMENTS_BASE}/${id}`, data);
    return response.data;
  },

  // Delete a document
  deleteDocument: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${DOCUMENTS_BASE}/${id}`);
    return response.data;
  },

  // ==================== WORKFLOW ENDPOINTS ====================

  // Get workflow steps for a service by ID
  getServiceWorkflow: async (serviceId: string): Promise<ApiResponse<ServiceWorkflow[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/workflow`);
    return response.data;
  },

  // Get workflow steps for a service by slug
  getServiceWorkflowBySlug: async (slug: string): Promise<ApiResponse<ServiceWorkflow[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/workflow`);
    return response.data;
  },

  // Create a new workflow step
  createWorkflowStep: async (data: CreateServiceWorkflowRequest): Promise<ApiResponse<ServiceWorkflow>> => {
    const response = await axiosInstance.post(WORKFLOWS_BASE, data);
    return response.data;
  },

  // Get workflow step by ID
  getWorkflowStepById: async (id: string): Promise<ApiResponse<ServiceWorkflow>> => {
    const response = await axiosInstance.get(`${WORKFLOWS_BASE}/${id}`);
    return response.data;
  },

  // Update a workflow step
  updateWorkflowStep: async (id: string, data: UpdateServiceWorkflowRequest): Promise<ApiResponse<ServiceWorkflow>> => {
    const response = await axiosInstance.put(`${WORKFLOWS_BASE}/${id}`, data);
    return response.data;
  },

  // Delete a workflow step
  deleteWorkflowStep: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${WORKFLOWS_BASE}/${id}`);
    return response.data;
  }
};

export default servicesApi;
