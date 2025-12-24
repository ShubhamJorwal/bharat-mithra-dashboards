import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceForm,
  ServiceFAQ,
  ServicesQueryParams
} from '../../types/api.types';

const SERVICES_BASE = '/api/v1/services';

export const servicesApi = {
  // Get all service categories
  getCategories: async (): Promise<ApiResponse<ServiceCategory[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/categories`);
    return response.data;
  },

  // Get all services with pagination and optional category filter
  getServices: async (params?: ServicesQueryParams): Promise<PaginatedResponse<Service>> => {
    const response = await axiosInstance.get(SERVICES_BASE, { params });
    return response.data;
  },

  // Get popular services
  getPopularServices: async (limit: number = 10): Promise<ApiResponse<Service[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/popular`, {
      params: { limit }
    });
    return response.data;
  },

  // Get service by slug
  getServiceBySlug: async (slug: string): Promise<ApiResponse<Service>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${slug}`);
    return response.data;
  },

  // Get service form schema
  getServiceForm: async (slug: string): Promise<ApiResponse<ServiceForm>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${slug}/form`);
    return response.data;
  },

  // Get service FAQs
  getServiceFAQs: async (slug: string): Promise<ApiResponse<ServiceFAQ[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${slug}/faqs`);
    return response.data;
  }
};

export default servicesApi;
