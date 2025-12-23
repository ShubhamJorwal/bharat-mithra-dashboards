import axiosInstance from './axiosInstance';
import type { ApiResponse, ApiError, RequestConfig } from '../../types/api.types';

class ApiClient {
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError<T>(error: unknown): ApiResponse<T> {
    const apiError = error as ApiError;
    return {
      data: null as T,
      status: apiError.response?.status || 500,
      success: false,
      error: {
        message: apiError.response?.data?.message || apiError.message || 'An error occurred',
        code: apiError.response?.data?.code || 'UNKNOWN_ERROR',
      },
    };
  }
}

export const apiClient = new ApiClient();
export default apiClient;
