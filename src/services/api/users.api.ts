import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserLoginHistory,
  UsersQueryParams
} from '../../types/api.types';

const USERS_BASE = '/api/v1/users';

export const usersApi = {
  // Check if mobile exists in a state
  checkMobile: async (mobile: string, state_code: string): Promise<ApiResponse<{ mobile: string; state_code: string; exists: boolean }>> => {
    const response = await axiosInstance.get(`${USERS_BASE}/check-mobile`, {
      params: { mobile, state_code }
    });
    return response.data;
  },

  // Create a new user
  createUser: async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.post(`${USERS_BASE}/create`, data);
    return response.data;
  },

  // Get paginated list of users
  getUsers: async (params?: UsersQueryParams): Promise<PaginatedResponse<User>> => {
    const response = await axiosInstance.get(`${USERS_BASE}/list`, { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string, state_code: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get(`${USERS_BASE}/${id}`, {
      params: { state_code }
    });
    return response.data;
  },

  // Get user by mobile
  getUserByMobile: async (mobile: string, state_code: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get(`${USERS_BASE}/mobile/${mobile}`, {
      params: { state_code }
    });
    return response.data;
  },

  // Update user
  updateUser: async (id: string, state_code: string, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.put(`${USERS_BASE}/${id}`, data, {
      params: { state_code }
    });
    return response.data;
  },

  // Request user deletion
  deleteUser: async (id: string, state_code: string, reason: string): Promise<ApiResponse<{ user_id: string; deletion_status: string }>> => {
    const response = await axiosInstance.delete(`${USERS_BASE}/${id}`, {
      params: { state_code },
      data: { reason }
    });
    return response.data;
  },

  // Approve user deletion (admin)
  approveDeletion: async (id: string, state_code: string): Promise<ApiResponse<{ user_id: string; deletion_status: string; approved_by: string }>> => {
    const response = await axiosInstance.post(`${USERS_BASE}/${id}/approve-deletion`, null, {
      params: { state_code }
    });
    return response.data;
  },

  // Get user login history
  getLoginHistory: async (id: string, state_code: string, limit: number = 20): Promise<ApiResponse<{ user_id: string; history: UserLoginHistory[]; count: number }>> => {
    const response = await axiosInstance.get(`${USERS_BASE}/${id}/login-history`, {
      params: { state_code, limit }
    });
    return response.data;
  },

  // Get current user profile (authenticated)
  getProfile: async (state_code: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get(`${USERS_BASE}/profile`, {
      params: { state_code }
    });
    return response.data;
  },

  // Update current user profile (authenticated)
  updateProfile: async (state_code: string, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.put(`${USERS_BASE}/profile`, data, {
      params: { state_code }
    });
    return response.data;
  }
};

export default usersApi;
