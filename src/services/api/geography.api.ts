import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  NationalSummary,
  State,
  CreateStateRequest,
  UpdateStateRequest,
  District,
  CreateDistrictRequest,
  UpdateDistrictRequest,
  Taluk,
  CreateTalukRequest,
  UpdateTalukRequest,
  GramPanchayat,
  CreateGramPanchayatRequest,
  UpdateGramPanchayatRequest,
  Village,
  CreateVillageRequest,
  UpdateVillageRequest,
  GeographySearchResult,
  GeographyQueryParams
} from '../../types/api.types';

const BASE_URL = '/api/v1/geography';

// Build query string from params
const buildQueryString = (params: GeographyQueryParams): string => {
  const query = new URLSearchParams();

  if (params.page) query.append('page', params.page.toString());
  if (params.per_page) query.append('per_page', params.per_page.toString());
  if (params.search) query.append('search', params.search);
  if (params.state_id) query.append('state_id', params.state_id);
  if (params.district_id) query.append('district_id', params.district_id);
  if (params.taluk_id) query.append('taluk_id', params.taluk_id);
  if (params.gram_panchayat_id) query.append('gram_panchayat_id', params.gram_panchayat_id);
  if (params.state_type) query.append('state_type', params.state_type);
  if (params.zone) query.append('zone', params.zone);
  if (params.is_active !== undefined) query.append('is_active', params.is_active.toString());
  if (params.sort_by) query.append('sort_by', params.sort_by);
  if (params.sort_order !== undefined) query.append('sort_order', params.sort_order.toString());

  return query.toString();
};

const geographyApi = {
  // ==========================================
  // NATIONAL SUMMARY
  // ==========================================
  getNationalSummary: async (): Promise<ApiResponse<NationalSummary>> => {
    const response = await axiosInstance.get(`${BASE_URL}/india`);
    return response.data;
  },

  // ==========================================
  // STATES & UNION TERRITORIES
  // ==========================================
  getStates: async (params: GeographyQueryParams = {}): Promise<PaginatedResponse<State>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/states?${queryString}` : `${BASE_URL}/states`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getStateById: async (id: string): Promise<ApiResponse<State>> => {
    const response = await axiosInstance.get(`${BASE_URL}/states/${id}`);
    return response.data;
  },

  getStateByCode: async (code: string): Promise<ApiResponse<State>> => {
    const response = await axiosInstance.get(`${BASE_URL}/states/code/${code}`);
    return response.data;
  },

  getStateDistricts: async (stateId: string, params: GeographyQueryParams = {}): Promise<PaginatedResponse<District>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/states/${stateId}/districts?${queryString}` : `${BASE_URL}/states/${stateId}/districts`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getStateSummary: async (stateId: string): Promise<ApiResponse<State>> => {
    const response = await axiosInstance.get(`${BASE_URL}/states/${stateId}/summary`);
    return response.data;
  },

  createState: async (data: CreateStateRequest): Promise<ApiResponse<State>> => {
    const response = await axiosInstance.post(`${BASE_URL}/states`, data);
    return response.data;
  },

  updateState: async (id: string, data: UpdateStateRequest): Promise<ApiResponse<State>> => {
    const response = await axiosInstance.put(`${BASE_URL}/states/${id}`, data);
    return response.data;
  },

  deleteState: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${BASE_URL}/states/${id}`);
    return response.data;
  },

  // ==========================================
  // DISTRICTS
  // ==========================================
  getDistricts: async (params: GeographyQueryParams = {}): Promise<PaginatedResponse<District>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/districts?${queryString}` : `${BASE_URL}/districts`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getDistrictById: async (id: string): Promise<ApiResponse<District>> => {
    const response = await axiosInstance.get(`${BASE_URL}/districts/${id}`);
    return response.data;
  },

  getDistrictByCode: async (code: string): Promise<ApiResponse<District>> => {
    const response = await axiosInstance.get(`${BASE_URL}/districts/code/${code}`);
    return response.data;
  },

  getDistrictTaluks: async (districtId: string, params: GeographyQueryParams = {}): Promise<PaginatedResponse<Taluk>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/districts/${districtId}/taluks?${queryString}` : `${BASE_URL}/districts/${districtId}/taluks`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getDistrictSummary: async (districtId: string): Promise<ApiResponse<District>> => {
    const response = await axiosInstance.get(`${BASE_URL}/districts/${districtId}/summary`);
    return response.data;
  },

  createDistrict: async (data: CreateDistrictRequest): Promise<ApiResponse<District>> => {
    const response = await axiosInstance.post(`${BASE_URL}/districts`, data);
    return response.data;
  },

  updateDistrict: async (id: string, data: UpdateDistrictRequest): Promise<ApiResponse<District>> => {
    const response = await axiosInstance.put(`${BASE_URL}/districts/${id}`, data);
    return response.data;
  },

  deleteDistrict: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${BASE_URL}/districts/${id}`);
    return response.data;
  },

  // ==========================================
  // TALUKS / TEHSILS / MANDALS / BLOCKS
  // ==========================================
  getTaluks: async (params: GeographyQueryParams = {}): Promise<PaginatedResponse<Taluk>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/taluks?${queryString}` : `${BASE_URL}/taluks`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getTalukById: async (id: string): Promise<ApiResponse<Taluk>> => {
    const response = await axiosInstance.get(`${BASE_URL}/taluks/${id}`);
    return response.data;
  },

  getTalukByCode: async (code: string): Promise<ApiResponse<Taluk>> => {
    const response = await axiosInstance.get(`${BASE_URL}/taluks/code/${code}`);
    return response.data;
  },

  getTalukGramPanchayats: async (talukId: string, params: GeographyQueryParams = {}): Promise<PaginatedResponse<GramPanchayat>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/taluks/${talukId}/gram-panchayats?${queryString}` : `${BASE_URL}/taluks/${talukId}/gram-panchayats`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getTalukSummary: async (talukId: string): Promise<ApiResponse<Taluk>> => {
    const response = await axiosInstance.get(`${BASE_URL}/taluks/${talukId}/summary`);
    return response.data;
  },

  createTaluk: async (data: CreateTalukRequest): Promise<ApiResponse<Taluk>> => {
    const response = await axiosInstance.post(`${BASE_URL}/taluks`, data);
    return response.data;
  },

  updateTaluk: async (id: string, data: UpdateTalukRequest): Promise<ApiResponse<Taluk>> => {
    const response = await axiosInstance.put(`${BASE_URL}/taluks/${id}`, data);
    return response.data;
  },

  deleteTaluk: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${BASE_URL}/taluks/${id}`);
    return response.data;
  },

  // ==========================================
  // GRAM PANCHAYATS
  // ==========================================
  getGramPanchayats: async (params: GeographyQueryParams = {}): Promise<PaginatedResponse<GramPanchayat>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/gram-panchayats?${queryString}` : `${BASE_URL}/gram-panchayats`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getGramPanchayatById: async (id: string): Promise<ApiResponse<GramPanchayat>> => {
    const response = await axiosInstance.get(`${BASE_URL}/gram-panchayats/${id}`);
    return response.data;
  },

  getGramPanchayatByCode: async (code: string): Promise<ApiResponse<GramPanchayat>> => {
    const response = await axiosInstance.get(`${BASE_URL}/gram-panchayats/code/${code}`);
    return response.data;
  },

  getGramPanchayatSummary: async (gpId: string): Promise<ApiResponse<GramPanchayat>> => {
    const response = await axiosInstance.get(`${BASE_URL}/gram-panchayats/${gpId}/summary`);
    return response.data;
  },

  getGramPanchayatVillages: async (gpId: string, params: GeographyQueryParams = {}): Promise<PaginatedResponse<Village>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/gram-panchayats/${gpId}/villages?${queryString}` : `${BASE_URL}/gram-panchayats/${gpId}/villages`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  createGramPanchayat: async (data: CreateGramPanchayatRequest): Promise<ApiResponse<GramPanchayat>> => {
    const response = await axiosInstance.post(`${BASE_URL}/gram-panchayats`, data);
    return response.data;
  },

  updateGramPanchayat: async (id: string, data: UpdateGramPanchayatRequest): Promise<ApiResponse<GramPanchayat>> => {
    const response = await axiosInstance.put(`${BASE_URL}/gram-panchayats/${id}`, data);
    return response.data;
  },

  deleteGramPanchayat: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${BASE_URL}/gram-panchayats/${id}`);
    return response.data;
  },

  // ==========================================
  // VILLAGES
  // ==========================================
  getVillages: async (params: GeographyQueryParams = {}): Promise<PaginatedResponse<Village>> => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}/villages?${queryString}` : `${BASE_URL}/villages`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getVillageById: async (id: string): Promise<ApiResponse<Village>> => {
    const response = await axiosInstance.get(`${BASE_URL}/villages/${id}`);
    return response.data;
  },

  getVillageByCode: async (code: string): Promise<ApiResponse<Village>> => {
    const response = await axiosInstance.get(`${BASE_URL}/villages/code/${code}`);
    return response.data;
  },

  createVillage: async (data: CreateVillageRequest): Promise<ApiResponse<Village>> => {
    const response = await axiosInstance.post(`${BASE_URL}/villages`, data);
    return response.data;
  },

  updateVillage: async (id: string, data: UpdateVillageRequest): Promise<ApiResponse<Village>> => {
    const response = await axiosInstance.put(`${BASE_URL}/villages/${id}`, data);
    return response.data;
  },

  deleteVillage: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${BASE_URL}/villages/${id}`);
    return response.data;
  },

  // ==========================================
  // UNIVERSAL SEARCH
  // ==========================================
  search: async (query: string, type?: string, stateId?: string, limit: number = 20): Promise<ApiResponse<{ query: string; results: GeographySearchResult[]; total: number }>> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) params.append('type', type);
    if (stateId) params.append('state_id', stateId);
    params.append('limit', limit.toString());

    const response = await axiosInstance.get(`${BASE_URL}/search?${params.toString()}`);
    return response.data;
  }
};

export default geographyApi;
