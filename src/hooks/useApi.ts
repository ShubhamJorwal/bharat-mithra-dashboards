import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import type { ApiResponse, PaginationParams } from '../types';

// Generic hook for GET requests
export function useApiQuery<T>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<ApiResponse<T>>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? key : [key];

  return useQuery<ApiResponse<T>>({
    queryKey,
    queryFn: () => apiClient.get<T>(url),
    ...options,
  });
}

// Generic hook for paginated GET requests
export function usePaginatedQuery<T>(
  key: string | string[],
  url: string,
  params: PaginationParams,
  options?: Omit<UseQueryOptions<ApiResponse<T>>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? [...key, params] : [key, params];
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  return useQuery<ApiResponse<T>>({
    queryKey,
    queryFn: () => apiClient.get<T>(`${url}?${queryString}`),
    ...options,
  });
}

// Generic hook for POST mutations
export function useApiMutation<TData, TVariables = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<ApiResponse<TData>, Error, TVariables>({
    mutationFn: (data) => apiClient.post<TData, TVariables>(url, data),
    ...options,
  });
}

// Generic hook for PUT mutations
export function useApiPutMutation<TData, TVariables = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<ApiResponse<TData>, Error, TVariables>({
    mutationFn: (data) => apiClient.put<TData, TVariables>(url, data),
    ...options,
  });
}

// Generic hook for PATCH mutations
export function useApiPatchMutation<TData, TVariables = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<ApiResponse<TData>, Error, TVariables>({
    mutationFn: (data) => apiClient.patch<TData, TVariables>(url, data),
    ...options,
  });
}

// Generic hook for DELETE mutations
export function useApiDeleteMutation<TData>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, void>, 'mutationFn'>
) {
  return useMutation<ApiResponse<TData>, Error, void>({
    mutationFn: () => apiClient.delete<TData>(url),
    ...options,
  });
}
