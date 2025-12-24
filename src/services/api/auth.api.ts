import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse
} from '../../types/api.types';

const AUTH_BASE = '/api/v1/auth';

export const authApi = {
  // Send OTP to mobile
  sendOtp: async (data: SendOtpRequest): Promise<ApiResponse<SendOtpResponse>> => {
    const response = await axiosInstance.post(`${AUTH_BASE}/send-otp`, data);
    return response.data;
  },

  // Verify OTP and get token
  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> => {
    const response = await axiosInstance.post(`${AUTH_BASE}/verify-otp`, data);
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string; expires_at: string }>> => {
    const response = await axiosInstance.post(`${AUTH_BASE}/refresh`);
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${AUTH_BASE}/logout`);
    return response.data;
  }
};

export default authApi;
