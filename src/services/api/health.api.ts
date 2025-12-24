import axiosInstance from './axiosInstance';
import type { HealthStatus } from '../../types/api.types';

export const healthApi = {
  // Health check endpoint
  check: async (): Promise<HealthStatus> => {
    const response = await axiosInstance.get('/health');
    return response.data;
  }
};

export default healthApi;
