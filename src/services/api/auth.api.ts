import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  User,
} from '@/types/api.types';

// Citizen authentication (OTP-based)
const BASE = '/api/v1/users/auth';

export const authApi = {
  sendOtp: async (data: SendOtpRequest): Promise<ApiResponse<SendOtpResponse>> => {
    const r = await axiosInstance.post(`${BASE}/otp/send`, data);
    return r.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> => {
    const r = await axiosInstance.post(`${BASE}/otp/verify`, data);
    return r.data;
  },

  refresh: async (refresh_token: string): Promise<ApiResponse<VerifyOtpResponse>> => {
    const r = await axiosInstance.post(`${BASE}/refresh`, { refresh_token });
    return r.data;
  },

  logout: async (refresh_token?: string): Promise<ApiResponse<null>> => {
    const r = await axiosInstance.post(`${BASE}/logout`, { refresh_token });
    return r.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const r = await axiosInstance.get('/api/v1/users/me');
    return r.data;
  },
};

export default authApi;
