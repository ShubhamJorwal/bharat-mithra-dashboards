import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  StatesManagementResponse,
  UpdateStateManagementRequest,
  State,
} from '@/types/api.types';

const BASE = '/api/v1/management';

const managementApi = {
  listStates: async (): Promise<ApiResponse<StatesManagementResponse>> => {
    const r = await axiosInstance.get(`${BASE}/states`);
    return r.data;
  },

  updateStateManagement: async (
    id: string,
    body: UpdateStateManagementRequest,
  ): Promise<ApiResponse<State>> => {
    const r = await axiosInstance.patch(`${BASE}/states/${id}`, body);
    return r.data;
  },
};

export default managementApi;
