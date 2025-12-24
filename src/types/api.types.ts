import type { AxiosRequestConfig } from 'axios';

// Generic API Response Types (matching GENOME API)
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  status?: number;
  error?: {
    message: string;
    code: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: string;
  response?: {
    status: number;
    data: {
      message?: string;
      code?: string;
    };
  };
}

// Service Category Types
export interface ServiceCategory {
  id: string;
  name: string;
  name_hindi: string;
  slug: string;
  description?: string;
  icon_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Service Types
export interface Service {
  id: string;
  category_id: string;
  name: string;
  name_hindi: string;
  slug: string;
  description: string;
  department: string;
  department_hindi?: string;
  ministry?: string;
  eligibility_criteria?: string;
  required_documents?: string[];
  processing_time?: string;
  service_fee: number;
  platform_fee: number;
  total_fee: number;
  is_free_service: boolean;
  is_popular: boolean;
  is_featured: boolean;
  icon_url?: string;
  total_applications?: number;
  created_at?: string;
  updated_at?: string;
}

// Service Form Types
export interface ServiceFormField {
  name: string;
  type: 'text' | 'date' | 'select' | 'checkbox' | 'file' | 'number' | 'email' | 'tel';
  label: string;
  label_hindi?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ServiceFormSection {
  title: string;
  title_hindi?: string;
  fields: ServiceFormField[];
}

export interface ServiceFormSchema {
  title: string;
  title_hindi?: string;
  sections: ServiceFormSection[];
}

export interface ServiceForm {
  id: string;
  service_id: string;
  version: number;
  form_schema: ServiceFormSchema;
  is_active: boolean;
  created_at: string;
}

// Service FAQ Types
export interface ServiceFAQ {
  id: string;
  service_id: string;
  question: string;
  question_hindi: string;
  answer: string;
  answer_hindi: string;
  sort_order: number;
}

// User Types - Complete 80+ fields from GENOME API
export interface User {
  id: string;
  state_code: string;

  // Contact Information
  mobile: string;
  mobile_verified?: boolean;
  email?: string;
  email_verified?: boolean;

  // Basic Information
  full_name: string;
  full_name_hindi?: string;
  father_name?: string;
  father_name_hindi?: string;
  mother_name?: string;
  mother_name_hindi?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  spouse_name?: string;
  spouse_name_hindi?: string;
  religion?: string;
  caste?: string;
  caste_category?: 'general' | 'obc' | 'sc' | 'st' | 'ews';
  nationality?: string;
  profile_photo_url?: string;

  // Identity Documents
  aadhaar_verified?: boolean;
  aadhaar_linked_mobile?: string;
  pan_number?: string;
  pan_verified?: boolean;
  voter_id?: string;
  voter_id_verified?: boolean;
  passport_number?: string;
  passport_expiry?: string;
  driving_license?: string;
  driving_license_expiry?: string;
  ration_card_number?: string;
  ration_card_type?: 'APL' | 'BPL' | 'AAY';

  // Current Address
  current_address_line1?: string;
  current_address_line2?: string;
  current_landmark?: string;
  current_village?: string;
  current_gram_panchayat?: string;
  current_block?: string;
  current_tehsil?: string;
  current_city?: string;
  current_district?: string;
  current_state_code?: string;
  current_pincode?: string;

  // Permanent Address
  permanent_address_line1?: string;
  permanent_address_line2?: string;
  permanent_landmark?: string;
  permanent_village?: string;
  permanent_gram_panchayat?: string;
  permanent_block?: string;
  permanent_tehsil?: string;
  permanent_city?: string;
  permanent_district?: string;
  permanent_state_code?: string;
  permanent_pincode?: string;
  same_as_current_address?: boolean;
  document_address?: string;

  // Occupation & Income
  occupation?: string;
  occupation_type?: 'salaried' | 'self_employed' | 'business' | 'student' | 'retired' | 'homemaker' | 'unemployed';
  employer_name?: string;
  employer_address?: string;
  designation?: string;
  annual_income?: number;
  income_source?: string;
  is_income_tax_payer?: boolean;

  // Education
  education_level?: 'illiterate' | 'primary' | 'secondary' | 'higher_secondary' | 'graduate' | 'post_graduate' | 'doctorate';
  education_details?: string;

  // Bank Details
  bank_account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  bank_ifsc?: string;
  bank_verified?: boolean;

  // Status
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  kyc_status: 'pending' | 'partial' | 'verified' | 'rejected';
  is_deleted?: boolean;
  deletion_status?: 'pending' | 'approved' | null;

  // Preferences
  preferred_language?: 'en' | 'hi';
  notification_enabled?: boolean;
  sms_enabled?: boolean;
  email_notification_enabled?: boolean;
  whatsapp_enabled?: boolean;
  whatsapp_number?: string;

  // Entry Details
  entered_by?: 'self' | 'agent' | 'admin';
  agent_details?: AgentDetails;

  // Login Stats
  last_login_at?: string;
  login_count?: number;
  failed_login_attempts?: number;

  // Extra Fields
  extra_field_01?: string;
  extra_field_02?: string;
  extra_field_03?: string;
  extra_data?: Record<string, unknown>;

  // Timestamps
  created_at: string;
  updated_at?: string;
}

export interface AgentDetails {
  agent_id: string;
  agent_name: string;
  agent_mobile: string;
  agent_center: string;
  remarks?: string;
}

export interface CreateUserRequest {
  mobile: string;
  full_name: string;
  state_code: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  current_city?: string;
  current_pincode?: string;
  entered_by?: 'self' | 'agent' | 'admin';
  agent_details?: {
    agent_id: string;
    agent_name: string;
    agent_mobile: string;
    agent_center: string;
  };
}

export interface UpdateUserRequest {
  full_name?: string;
  full_name_hindi?: string;
  father_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: string;
  religion?: string;
  caste_category?: string;
  current_address_line1?: string;
  current_village?: string;
  current_gram_panchayat?: string;
  current_city?: string;
  current_district?: string;
  current_pincode?: string;
  permanent_address_line1?: string;
  same_as_current_address?: boolean;
  occupation?: string;
  occupation_type?: string;
  employer_name?: string;
  annual_income?: number;
  income_source?: string;
  education_level?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  bank_ifsc?: string;
  preferred_language?: 'en' | 'hi';
  notification_enabled?: boolean;
  whatsapp_enabled?: boolean;
}

export interface UserLoginHistory {
  id: string;
  login_at: string;
  ip_address: string;
  device_type: 'web' | 'android' | 'ios';
  device_name: string;
  location_city?: string;
  location_state?: string;
  login_method: 'otp' | 'password';
  is_successful: boolean;
}

// Auth Types
export interface SendOtpRequest {
  mobile: string;
  purpose: 'login' | 'register' | 'reset_password';
}

export interface SendOtpResponse {
  otp_id: string;
  expires_in: number;
  mobile: string;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}

export interface VerifyOtpResponse {
  user: User;
  token: string;
  expires_at: string;
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  version: string;
  services: {
    postgres: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
  };
  system: {
    go_version: string;
    num_goroutine: number;
    uptime: string;
  };
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface ServicesQueryParams extends PaginationParams {
  category_id?: string;
}

export interface UsersQueryParams extends PaginationParams {
  state_code?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export type RequestConfig = AxiosRequestConfig;
