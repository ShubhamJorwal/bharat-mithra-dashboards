import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// Resolve the API base URL with this priority:
//   1. VITE_API_BASE_URL env var (for any explicit override)
//   2. localhost:3000 in dev mode (vite serves at localhost:5173, the
//      Go backend runs on 3000, so we hit it directly)
//   3. The production App Runner URL otherwise (Vercel, staging, etc.)
//
// Note: api paths in the codebase are written as `/api/v1/...` — the
// base URL must NOT include `/api` or we'll double-prefix.
const PROD_API = 'https://94rg4ygpy4.ap-south-1.awsapprunner.com';
const DEV_API  = 'http://localhost:3000';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? DEV_API : PROD_API);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't redirect on auth-flow endpoints — login itself returns 401
      // when credentials are wrong, and refresh failures are handled by
      // the AuthContext silently. We just clear stored tokens and let
      // the route guards bounce the user to /login on next render.
      const isAuthFlow = /\/auth\/(login|refresh|logout)\b/.test(url) || /\/staff\/me\b/.test(url);
      if (!isAuthFlow) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authRefreshToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied');
      return Promise.reject(error);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error occurred');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
