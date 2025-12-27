import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceForm,
  ServiceFAQ,
  ServicesQueryParams,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
  CreateFormRequest,
  GroupedServicesResponse
} from '../../types/api.types';

const CATEGORIES_BASE = '/api/v1/categories';
const SERVICES_BASE = '/api/v1/services';
const FORMS_BASE = '/api/v1/forms';
const FAQS_BASE = '/api/v1/faqs';

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
  }
};

export default servicesApi;
