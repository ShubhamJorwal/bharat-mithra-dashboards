import { useState, useMemo, useCallback } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  reset: () => void;
}

export function usePagination(
  initialPage: number = 1,
  initialLimit: number = 10
): UsePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
  });

  const totalPages = useMemo(() => {
    return Math.ceil(state.total / state.limit) || 1;
  }, [state.total, state.limit]);

  const hasNextPage = state.page < totalPages;
  const hasPrevPage = state.page > 1;

  const setPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, Math.ceil(prev.total / prev.limit) || 1)),
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState((prev) => ({
      ...prev,
      limit,
      page: 1, // Reset to first page when limit changes
    }));
  }, []);

  const setTotal = useCallback((total: number) => {
    setState((prev) => ({ ...prev, total }));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, Math.ceil(prev.total / prev.limit) || 1),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  const firstPage = useCallback(() => {
    setState((prev) => ({ ...prev, page: 1 }));
  }, []);

  const lastPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.ceil(prev.total / prev.limit) || 1,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      page: initialPage,
      limit: initialLimit,
      total: 0,
    });
  }, [initialPage, initialLimit]);

  return {
    page: state.page,
    limit: state.limit,
    total: state.total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
  };
}

export default usePagination;
