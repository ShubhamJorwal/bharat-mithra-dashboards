// Use User from api.types.ts instead
// Legacy User type moved to api.types.ts

export type UserRole = 'admin' | 'user' | 'manager' | 'viewer';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  width?: string | number;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: string | number | boolean;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export type Status = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}
