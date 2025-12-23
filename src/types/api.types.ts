import type { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
  error?: {
    message: string;
    code: string;
  };
}

export interface ApiError {
  message: string;
  response?: {
    status: number;
    data?: {
      message?: string;
      code?: string;
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type RequestConfig = AxiosRequestConfig;
