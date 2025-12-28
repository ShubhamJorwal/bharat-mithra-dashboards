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
  ServiceCaseworkerInfoFull,
  ServiceChecklist,
  ServiceOfficeLocation,
  ServiceCompleteDetails,
  ServicePricingQueryParams,
  ServiceCaseworkerQueryParams,
  ServiceChecklistQueryParams,
  ServiceOfficeQueryParams,
  // New imports for extended functionality
  CreateServicePricingRequest,
  UpdateServicePricingRequest,
  CreateServiceCaseworkerInfoRequest,
  UpdateServiceCaseworkerInfoRequest,
  CreateServiceChecklistRequest,
  UpdateServiceChecklistRequest,
  CreateServiceOfficeLocationRequest,
  UpdateServiceOfficeLocationRequest,
  ServiceStateAvailability,
  ServiceStateAvailabilityQueryParams,
  CreateServiceStateAvailabilityRequest,
  UpdateServiceStateAvailabilityRequest,
  ServiceContactPerson,
  ServiceContactQueryParams,
  CreateServiceContactPersonRequest,
  UpdateServiceContactPersonRequest,
  ServiceEligibility,
  CreateServiceEligibilityRequest,
  UpdateServiceEligibilityRequest,
  ServiceStatusMapping,
  CreateServiceStatusMappingRequest,
  UpdateServiceStatusMappingRequest
} from '../../types/api.types';

const CATEGORIES_BASE = '/api/v1/categories';
const SERVICES_BASE = '/api/v1/services';
const FORMS_BASE = '/api/v1/forms';
const FAQS_BASE = '/api/v1/faqs';
const DOCUMENTS_BASE = '/api/v1/documents';
const WORKFLOWS_BASE = '/api/v1/workflows';
const PRICING_BASE = '/api/v1/pricing';
const CASEWORKER_INFO_BASE = '/api/v1/caseworker-info';
const CHECKLISTS_BASE = '/api/v1/checklists';
const OFFICES_BASE = '/api/v1/offices';
const AVAILABILITY_BASE = '/api/v1/availability';
const CONTACTS_BASE = '/api/v1/contacts';
const ELIGIBILITY_BASE = '/api/v1/eligibility';
const STATUSES_BASE = '/api/v1/statuses';

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
  getServicePricing: async (serviceId: string, params?: ServicePricingQueryParams): Promise<ApiResponse<ServicePricing>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/pricing`, { params });
    return response.data;
  },

  // Get all pricing entries for a service
  getAllServicePricing: async (serviceId: string): Promise<ApiResponse<ServicePricing[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/pricing/all`);
    return response.data;
  },

  // Get pricing by slug
  getServicePricingBySlug: async (slug: string, params?: ServicePricingQueryParams): Promise<ApiResponse<ServicePricing>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/pricing`, { params });
    return response.data;
  },

  // Get all service pricing for a specific state
  getStatePricing: async (stateCode: string): Promise<ApiResponse<ServicePricing[]>> => {
    const response = await axiosInstance.get(`${PRICING_BASE}/state/${stateCode}`);
    return response.data;
  },

  // Create pricing (Admin)
  createPricing: async (data: CreateServicePricingRequest): Promise<ApiResponse<ServicePricing>> => {
    const response = await axiosInstance.post(PRICING_BASE, data);
    return response.data;
  },

  // Get pricing by ID
  getPricingById: async (id: string): Promise<ApiResponse<ServicePricing>> => {
    const response = await axiosInstance.get(`${PRICING_BASE}/${id}`);
    return response.data;
  },

  // Update pricing (Admin)
  updatePricing: async (id: string, data: UpdateServicePricingRequest): Promise<ApiResponse<ServicePricing>> => {
    const response = await axiosInstance.put(`${PRICING_BASE}/${id}`, data);
    return response.data;
  },

  // Delete pricing (Admin)
  deletePricing: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${PRICING_BASE}/${id}`);
    return response.data;
  },

  // ==================== CASEWORKER INFO ENDPOINTS ====================

  // Get caseworker information for a service
  getCaseworkerInfo: async (serviceId: string, params?: ServiceCaseworkerQueryParams): Promise<ApiResponse<ServiceCaseworkerInfo>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/caseworker-info`, { params });
    return response.data;
  },

  // Get caseworker information by slug
  getCaseworkerInfoBySlug: async (slug: string, params?: ServiceCaseworkerQueryParams): Promise<ApiResponse<ServiceCaseworkerInfo>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/caseworker-info`, { params });
    return response.data;
  },

  // Get all caseworker info entries for a service
  getAllCaseworkerInfo: async (serviceId: string): Promise<ApiResponse<ServiceCaseworkerInfoFull[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/caseworker-info/all`);
    return response.data;
  },

  // Create caseworker info (Admin)
  createCaseworkerInfo: async (data: CreateServiceCaseworkerInfoRequest): Promise<ApiResponse<ServiceCaseworkerInfoFull>> => {
    const response = await axiosInstance.post(CASEWORKER_INFO_BASE, data);
    return response.data;
  },

  // Get caseworker info by ID
  getCaseworkerInfoById: async (id: string): Promise<ApiResponse<ServiceCaseworkerInfoFull>> => {
    const response = await axiosInstance.get(`${CASEWORKER_INFO_BASE}/${id}`);
    return response.data;
  },

  // Update caseworker info (Admin)
  updateCaseworkerInfo: async (id: string, data: UpdateServiceCaseworkerInfoRequest): Promise<ApiResponse<ServiceCaseworkerInfoFull>> => {
    const response = await axiosInstance.put(`${CASEWORKER_INFO_BASE}/${id}`, data);
    return response.data;
  },

  // Delete caseworker info (Admin)
  deleteCaseworkerInfo: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${CASEWORKER_INFO_BASE}/${id}`);
    return response.data;
  },

  // ==================== CHECKLIST ENDPOINTS ====================

  // Get checklists for a service
  getServiceChecklists: async (serviceId: string, params?: ServiceChecklistQueryParams): Promise<ApiResponse<ServiceChecklist[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/checklists`, { params });
    return response.data;
  },

  // Get checklists by service slug
  getServiceChecklistsBySlug: async (slug: string, params?: ServiceChecklistQueryParams): Promise<ApiResponse<ServiceChecklist[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/checklists`, { params });
    return response.data;
  },

  // Create checklist item (Admin)
  createChecklist: async (data: CreateServiceChecklistRequest): Promise<ApiResponse<ServiceChecklist>> => {
    const response = await axiosInstance.post(CHECKLISTS_BASE, data);
    return response.data;
  },

  // Get checklist by ID
  getChecklistById: async (id: string): Promise<ApiResponse<ServiceChecklist>> => {
    const response = await axiosInstance.get(`${CHECKLISTS_BASE}/${id}`);
    return response.data;
  },

  // Update checklist item (Admin)
  updateChecklist: async (id: string, data: UpdateServiceChecklistRequest): Promise<ApiResponse<ServiceChecklist>> => {
    const response = await axiosInstance.put(`${CHECKLISTS_BASE}/${id}`, data);
    return response.data;
  },

  // Delete checklist item (Admin)
  deleteChecklist: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${CHECKLISTS_BASE}/${id}`);
    return response.data;
  },

  // ==================== OFFICE LOCATION ENDPOINTS ====================

  // Get office locations for a service
  getServiceOffices: async (serviceId: string, params?: ServiceOfficeQueryParams): Promise<ApiResponse<ServiceOfficeLocation[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/offices`, { params });
    return response.data;
  },

  // Get office locations by service slug
  getServiceOfficesBySlug: async (slug: string, params?: ServiceOfficeQueryParams): Promise<ApiResponse<ServiceOfficeLocation[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/offices`, { params });
    return response.data;
  },

  // Get nearby offices (requires lat/lng)
  getNearbyOffices: async (params: ServiceOfficeQueryParams): Promise<ApiResponse<ServiceOfficeLocation[]>> => {
    const response = await axiosInstance.get(`${OFFICES_BASE}/nearby`, { params });
    return response.data;
  },

  // Create office location (Admin)
  createOffice: async (data: CreateServiceOfficeLocationRequest): Promise<ApiResponse<ServiceOfficeLocation>> => {
    const response = await axiosInstance.post(OFFICES_BASE, data);
    return response.data;
  },

  // Get office by ID
  getOfficeById: async (id: string): Promise<ApiResponse<ServiceOfficeLocation>> => {
    const response = await axiosInstance.get(`${OFFICES_BASE}/${id}`);
    return response.data;
  },

  // Update office location (Admin)
  updateOffice: async (id: string, data: UpdateServiceOfficeLocationRequest): Promise<ApiResponse<ServiceOfficeLocation>> => {
    const response = await axiosInstance.put(`${OFFICES_BASE}/${id}`, data);
    return response.data;
  },

  // Delete office location (Admin)
  deleteOffice: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${OFFICES_BASE}/${id}`);
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
  },

  // ==================== STATE AVAILABILITY ENDPOINTS ====================

  // Get state availability for a service
  getServiceAvailability: async (serviceId: string, params?: ServiceStateAvailabilityQueryParams): Promise<ApiResponse<ServiceStateAvailability[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/availability`, { params });
    return response.data;
  },

  // Get specific state availability
  getServiceStateAvailability: async (serviceId: string, stateCode: string): Promise<ApiResponse<ServiceStateAvailability>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/availability/${stateCode}`);
    return response.data;
  },

  // Get availability by service slug
  getServiceAvailabilityBySlug: async (slug: string, params?: ServiceStateAvailabilityQueryParams): Promise<ApiResponse<ServiceStateAvailability[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/availability`, { params });
    return response.data;
  },

  // Create state availability (Admin)
  createAvailability: async (data: CreateServiceStateAvailabilityRequest): Promise<ApiResponse<ServiceStateAvailability>> => {
    const response = await axiosInstance.post(AVAILABILITY_BASE, data);
    return response.data;
  },

  // Get availability by ID
  getAvailabilityById: async (id: string): Promise<ApiResponse<ServiceStateAvailability>> => {
    const response = await axiosInstance.get(`${AVAILABILITY_BASE}/${id}`);
    return response.data;
  },

  // Update state availability (Admin)
  updateAvailability: async (id: string, data: UpdateServiceStateAvailabilityRequest): Promise<ApiResponse<ServiceStateAvailability>> => {
    const response = await axiosInstance.put(`${AVAILABILITY_BASE}/${id}`, data);
    return response.data;
  },

  // Delete state availability (Admin)
  deleteAvailability: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${AVAILABILITY_BASE}/${id}`);
    return response.data;
  },

  // ==================== CONTACT PERSONS ENDPOINTS ====================

  // Get contact persons for a service
  getServiceContacts: async (serviceId: string, params?: ServiceContactQueryParams): Promise<ApiResponse<ServiceContactPerson[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/contacts`, { params });
    return response.data;
  },

  // Get contact persons by service slug
  getServiceContactsBySlug: async (slug: string, params?: ServiceContactQueryParams): Promise<ApiResponse<ServiceContactPerson[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/contacts`, { params });
    return response.data;
  },

  // Create contact person (Admin)
  createContact: async (data: CreateServiceContactPersonRequest): Promise<ApiResponse<ServiceContactPerson>> => {
    const response = await axiosInstance.post(CONTACTS_BASE, data);
    return response.data;
  },

  // Get contact by ID
  getContactById: async (id: string): Promise<ApiResponse<ServiceContactPerson>> => {
    const response = await axiosInstance.get(`${CONTACTS_BASE}/${id}`);
    return response.data;
  },

  // Update contact person (Admin)
  updateContact: async (id: string, data: UpdateServiceContactPersonRequest): Promise<ApiResponse<ServiceContactPerson>> => {
    const response = await axiosInstance.put(`${CONTACTS_BASE}/${id}`, data);
    return response.data;
  },

  // Delete contact person (Admin)
  deleteContact: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${CONTACTS_BASE}/${id}`);
    return response.data;
  },

  // ==================== ELIGIBILITY RULES ENDPOINTS ====================

  // Get eligibility rules for a service
  getServiceEligibility: async (serviceId: string): Promise<ApiResponse<ServiceEligibility[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/eligibility`);
    return response.data;
  },

  // Get eligibility rules by service slug
  getServiceEligibilityBySlug: async (slug: string): Promise<ApiResponse<ServiceEligibility[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/eligibility`);
    return response.data;
  },

  // Create eligibility rule (Admin)
  createEligibility: async (data: CreateServiceEligibilityRequest): Promise<ApiResponse<ServiceEligibility>> => {
    const response = await axiosInstance.post(ELIGIBILITY_BASE, data);
    return response.data;
  },

  // Get eligibility rule by ID
  getEligibilityById: async (id: string): Promise<ApiResponse<ServiceEligibility>> => {
    const response = await axiosInstance.get(`${ELIGIBILITY_BASE}/${id}`);
    return response.data;
  },

  // Update eligibility rule (Admin)
  updateEligibility: async (id: string, data: UpdateServiceEligibilityRequest): Promise<ApiResponse<ServiceEligibility>> => {
    const response = await axiosInstance.put(`${ELIGIBILITY_BASE}/${id}`, data);
    return response.data;
  },

  // Delete eligibility rule (Admin)
  deleteEligibility: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${ELIGIBILITY_BASE}/${id}`);
    return response.data;
  },

  // ==================== STATUS MAPPING ENDPOINTS ====================

  // Get status mapping for a service
  getServiceStatuses: async (serviceId: string): Promise<ApiResponse<ServiceStatusMapping[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/${serviceId}/statuses`);
    return response.data;
  },

  // Get status mapping by service slug
  getServiceStatusesBySlug: async (slug: string): Promise<ApiResponse<ServiceStatusMapping[]>> => {
    const response = await axiosInstance.get(`${SERVICES_BASE}/slug/${slug}/statuses`);
    return response.data;
  },

  // Create status mapping (Admin)
  createStatus: async (data: CreateServiceStatusMappingRequest): Promise<ApiResponse<ServiceStatusMapping>> => {
    const response = await axiosInstance.post(STATUSES_BASE, data);
    return response.data;
  },

  // Get status mapping by ID
  getStatusById: async (id: string): Promise<ApiResponse<ServiceStatusMapping>> => {
    const response = await axiosInstance.get(`${STATUSES_BASE}/${id}`);
    return response.data;
  },

  // Update status mapping (Admin)
  updateStatus: async (id: string, data: UpdateServiceStatusMappingRequest): Promise<ApiResponse<ServiceStatusMapping>> => {
    const response = await axiosInstance.put(`${STATUSES_BASE}/${id}`, data);
    return response.data;
  },

  // Delete status mapping (Admin)
  deleteStatus: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${STATUSES_BASE}/${id}`);
    return response.data;
  }
};

export default servicesApi;
