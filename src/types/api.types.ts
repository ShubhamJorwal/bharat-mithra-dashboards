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
  name_hindi?: string;
  slug: string;
  description?: string;
  description_hindi?: string;
  icon_url?: string;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Category with Services (grouped response)
export interface CategoryWithServices extends ServiceCategory {
  services: Service[];
}

export interface GroupedServicesResponse {
  categories: CategoryWithServices[];
  total_services: number;
}

export interface CreateCategoryRequest {
  name: string;
  name_hindi?: string;
  slug?: string;
  description?: string;
  icon_url?: string;
  parent_id?: string | null;
  sort_order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  name_hindi?: string;
  slug?: string;
  description?: string;
  icon_url?: string;
  parent_id?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

// Service Types - Complete fields from GENOME API
export interface Service {
  id: string;
  category_id: string;
  name: string;
  name_hindi?: string;
  slug: string;
  description: string;
  description_hindi?: string;
  department?: string;  // Nullable - defaults to 'General Services'
  department_hindi?: string;  // Nullable - defaults to 'सामान्य सेवाएं'
  ministry?: string;
  eligibility_criteria?: string;  // Nullable - defaults to ''
  eligibility_criteria_hindi?: string;
  required_documents?: string[];
  processing_time?: string;  // Nullable - defaults to ''
  service_fee: number;
  platform_fee: number;
  total_fee: number;
  is_free_service: boolean;
  icon_url?: string;
  banner_url?: string;
  official_url?: string;
  is_active?: boolean;
  is_popular: boolean;
  is_featured: boolean;
  total_applications?: number;
  average_rating?: number;
  available_states?: string[];  // Nullable - defaults to []
  available_locations?: string;  // Nullable - defaults to ''
  form_fields?: string | Record<string, unknown>;  // Nullable - defaults to ''
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceRequest {
  category_id: string;
  name: string;
  name_hindi?: string;
  slug?: string;
  description: string;
  description_hindi?: string;
  department?: string;  // Now optional - defaults to 'General Services'
  department_hindi?: string;
  ministry?: string;
  eligibility_criteria?: string;
  required_documents?: string[];
  processing_time?: string;
  service_fee?: number;
  platform_fee?: number;
  is_free_service?: boolean;
  icon_url?: string;
  banner_url?: string;
  official_url?: string;
  is_popular?: boolean;
  is_featured?: boolean;
  available_states?: string[];
  available_locations?: string;
  form_fields?: string | Record<string, unknown>;
  sort_order?: number;
}

export interface UpdateServiceRequest {
  name?: string;
  name_hindi?: string;
  description?: string;
  description_hindi?: string;
  department?: string;
  department_hindi?: string;
  ministry?: string;
  eligibility_criteria?: string;
  required_documents?: string[];
  processing_time?: string;
  service_fee?: number;
  platform_fee?: number;
  is_free_service?: boolean;
  icon_url?: string;
  banner_url?: string;
  official_url?: string;
  is_active?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  available_states?: string[];
  available_locations?: string;
  form_fields?: string | Record<string, unknown>;
  sort_order?: number;
}

// Service Form Types - Complete from GENOME API
export interface FormFieldOption {
  value: string;
  label: string;
  label_hindi?: string;
}

export interface FormFieldValidation {
  min_length?: number;
  max_length?: number;
  min?: number;
  max?: number;
  pattern?: string;
  pattern_msg?: string;
  file_types?: string[];
  max_file_size?: number;
}

export interface ServiceFormField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'file';
  label: string;
  label_hindi?: string;
  placeholder?: string;
  required: boolean;
  sort_order: number;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
}

export interface ServiceFormSection {
  id: string;
  title: string;
  title_hindi?: string;
  sort_order: number;
  fields: ServiceFormField[];
}

export interface ServiceFormSchema {
  title: string;
  title_hindi?: string;
  description?: string;
  sections: ServiceFormSection[];
}

export interface ServiceForm {
  id: string;
  service_id: string;
  version: number;
  form_schema: ServiceFormSchema;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateFormRequest {
  service_id: string;
  form_schema: ServiceFormSchema;
}

// Service FAQ Types - Complete from GENOME API
export interface ServiceFAQ {
  id: string;
  service_id: string;
  question: string;
  question_hindi?: string;
  answer: string;
  answer_hindi?: string;
  sort_order: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateFAQRequest {
  service_id: string;
  question: string;
  question_hindi?: string;
  answer: string;
  answer_hindi?: string;
  sort_order?: number;
}

export interface UpdateFAQRequest {
  question?: string;
  question_hindi?: string;
  answer?: string;
  answer_hindi?: string;
  is_active?: boolean;
  sort_order?: number;
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
  search?: string;
}

export interface UsersQueryParams extends PaginationParams {
  state_code?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export type RequestConfig = AxiosRequestConfig;

// ==========================================
// GEOGRAPHY API TYPES - India Administrative Data
// ==========================================

// National Summary
export interface NationalSummary {
  country: string;
  country_hindi: string;
  capital: string;
  total_states: number;
  total_union_territories: number;
  total_districts: number;
  total_taluks: number;
  total_gram_panchayats: number;
  total_villages: number;
  total_municipalities: number;
  zones: {
    north: number;
    south: number;
    east: number;
    west: number;
    central: number;
    northeast: number;
  };
}

// State / Union Territory
export interface State {
  id: string;
  name: string;
  name_hindi?: string;
  name_local?: string;
  code: string;
  iso_code?: string;
  lgd_code?: string;
  vehicle_code?: string;
  state_type: 'state' | 'union_territory';
  zone: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
  capital?: string;
  largest_city?: string;
  area_sq_km?: number;
  population?: number;
  literacy_rate?: number;
  sex_ratio?: number;
  official_language?: string;
  official_languages?: string[];
  total_districts: number;
  total_taluks: number;
  total_gram_panchayats: number;
  total_villages: number;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateStateRequest {
  name: string;
  name_hindi?: string;
  code: string;
  iso_code?: string;
  lgd_code?: string;
  state_type: 'state' | 'union_territory';
  zone: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
  capital?: string;
  largest_city?: string;
  area_sq_km?: number;
  population?: number;
  literacy_rate?: number;
  official_language?: string;
  official_languages?: string[];
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateStateRequest {
  name?: string;
  name_hindi?: string;
  code?: string;
  iso_code?: string;
  lgd_code?: string;
  state_type?: 'state' | 'union_territory';
  zone?: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
  capital?: string;
  largest_city?: string;
  area_sq_km?: number;
  population?: number;
  literacy_rate?: number;
  official_language?: string;
  official_languages?: string[];
  is_active?: boolean;
  sort_order?: number;
}

// Nested State object (for API responses)
export interface NestedState {
  id: string;
  code: string;
  name: string;
  name_hindi?: string;
  name_local?: string;
  type?: string;
  zone?: string;
  capital?: string;
}

// Nested District object (for API responses)
export interface NestedDistrict {
  id: string;
  state_id: string;
  code: string;
  name: string;
  name_hindi?: string;
  name_local?: string;
  headquarters?: string;
}

// Nested Taluk object (for API responses)
export interface NestedTaluk {
  id: string;
  district_id: string;
  state_id: string;
  code: string;
  name: string;
  name_hindi?: string;
  name_local?: string;
  headquarters?: string;
}

// Nested Gram Panchayat object (for API responses)
export interface NestedGramPanchayat {
  id: string;
  taluk_id: string;
  district_id: string;
  state_id: string;
  code: string;
  name: string;
  name_hindi?: string;
  name_local?: string;
}

// District
export interface District {
  id: string;
  state_id: string;
  state_name?: string;
  state_code?: string;
  state?: NestedState;
  name: string;
  name_hindi?: string;
  code: string;
  lgd_code?: string;
  headquarters?: string;
  area_sq_km?: number;
  population?: number;
  literacy_rate?: number;
  total_taluks: number;
  total_gram_panchayats: number;
  total_villages: number;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateDistrictRequest {
  state_id: string;
  name: string;
  name_hindi?: string;
  code: string;
  lgd_code?: string;
  headquarters?: string;
  area_sq_km?: number;
  population?: number;
  literacy_rate?: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateDistrictRequest {
  name?: string;
  name_hindi?: string;
  code?: string;
  lgd_code?: string;
  headquarters?: string;
  area_sq_km?: number;
  population?: number;
  literacy_rate?: number;
  is_active?: boolean;
  sort_order?: number;
}

// Taluk / Tehsil / Mandal / Block
export interface Taluk {
  id: string;
  district_id: string;
  state_id: string;
  district_name?: string;
  state_name?: string;
  state_code?: string;
  district?: NestedDistrict;
  state?: NestedState;
  name: string;
  name_hindi?: string;
  name_local?: string;
  code: string;
  lgd_code?: string;
  headquarters?: string;
  alternative_name?: string;
  area_sq_km?: number;
  population?: number;
  total_gram_panchayats: number;
  total_villages: number;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateTalukRequest {
  district_id: string;
  state_id: string;
  name: string;
  name_hindi?: string;
  code: string;
  lgd_code?: string;
  headquarters?: string;
  area_sq_km?: number;
  population?: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateTalukRequest {
  name?: string;
  name_hindi?: string;
  code?: string;
  lgd_code?: string;
  headquarters?: string;
  area_sq_km?: number;
  population?: number;
  is_active?: boolean;
  sort_order?: number;
}

// Gram Panchayat
export interface GramPanchayat {
  id: string;
  taluk_id: string;
  district_id: string;
  state_id: string;
  taluk_name?: string;
  district_name?: string;
  state_name?: string;
  state_code?: string;
  taluk?: NestedTaluk;
  district?: NestedDistrict;
  state?: NestedState;
  name: string;
  name_hindi?: string;
  name_local?: string;
  code: string;
  lgd_code?: string;
  pin_code?: string;
  sarpanch_name?: string;
  sarpanch_mobile?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  households?: number;
  total_villages: number;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateGramPanchayatRequest {
  taluk_id: string;
  district_id: string;
  state_id: string;
  name: string;
  name_hindi?: string;
  code: string;
  lgd_code?: string;
  pin_code?: string;
  sarpanch_name?: string;
  sarpanch_mobile?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  households?: number;
  sort_order?: number;
}

export interface UpdateGramPanchayatRequest {
  name?: string;
  name_hindi?: string;
  code?: string;
  lgd_code?: string;
  pin_code?: string;
  sarpanch_name?: string;
  sarpanch_mobile?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  households?: number;
  is_active?: boolean;
  sort_order?: number;
}

// Village
export interface Village {
  id: string;
  gram_panchayat_id: string;
  taluk_id: string;
  district_id: string;
  state_id: string;
  gram_panchayat_name?: string;
  taluk_name?: string;
  district_name?: string;
  state_name?: string;
  state_code?: string;
  gram_panchayat?: NestedGramPanchayat;
  taluk?: NestedTaluk;
  district?: NestedDistrict;
  state?: NestedState;
  name: string;
  name_hindi?: string;
  name_local?: string;
  code: string;
  census_code?: string;
  lgd_code?: string;
  pin_code?: string;
  population?: number;
  male_population?: number;
  female_population?: number;
  households?: number;
  area_sq_km?: number;
  area_hectares?: number;
  latitude?: number;
  longitude?: number;
  // Village Head
  village_head_name?: string;
  village_head_mobile?: string;
  // Amenities
  has_primary_school?: boolean;
  has_middle_school?: boolean;
  has_high_school?: boolean;
  has_primary_health_center?: boolean;
  has_post_office?: boolean;
  has_bank?: boolean;
  has_atm?: boolean;
  has_bus_stop?: boolean;
  has_railway_station?: boolean;
  has_electricity?: boolean;
  has_tap_water?: boolean;
  has_internet?: boolean;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateVillageRequest {
  gram_panchayat_id: string;
  taluk_id: string;
  district_id: string;
  state_id: string;
  name: string;
  name_hindi?: string;
  code: string;
  census_code?: string;
  lgd_code?: string;
  pin_code?: string;
  village_head_name?: string;
  village_head_mobile?: string;
  population?: number;
  male_population?: number;
  female_population?: number;
  households?: number;
  area_sq_km?: number;
  area_hectares?: number;
  latitude?: number;
  longitude?: number;
  has_primary_school?: boolean;
  has_middle_school?: boolean;
  has_high_school?: boolean;
  has_primary_health_center?: boolean;
  has_post_office?: boolean;
  has_bank?: boolean;
  has_atm?: boolean;
  has_bus_stop?: boolean;
  has_railway_station?: boolean;
  has_electricity?: boolean;
  has_tap_water?: boolean;
  has_internet?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateVillageRequest {
  name?: string;
  name_hindi?: string;
  code?: string;
  census_code?: string;
  lgd_code?: string;
  pin_code?: string;
  village_head_name?: string;
  village_head_mobile?: string;
  population?: number;
  male_population?: number;
  female_population?: number;
  households?: number;
  area_sq_km?: number;
  area_hectares?: number;
  latitude?: number;
  longitude?: number;
  has_primary_school?: boolean;
  has_middle_school?: boolean;
  has_high_school?: boolean;
  has_primary_health_center?: boolean;
  has_post_office?: boolean;
  has_bank?: boolean;
  has_atm?: boolean;
  has_bus_stop?: boolean;
  has_railway_station?: boolean;
  has_electricity?: boolean;
  has_tap_water?: boolean;
  has_internet?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

// Geography Search Result
export interface GeographySearchResult {
  id: string;
  type: 'state' | 'district' | 'taluk' | 'gram_panchayat' | 'village';
  name: string;
  name_hindi?: string;
  code: string;
  parent_name?: string;
  full_path: string;
}

// Geography Query Params
export interface GeographyQueryParams extends PaginationParams {
  search?: string;
  state_id?: string;
  district_id?: string;
  taluk_id?: string;
  gram_panchayat_id?: string;
  state_type?: 'state' | 'union_territory';
  zone?: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 0 | 1; // 0 = DESC, 1 = ASC
}

// ==================== APPLICATION TYPES ====================

// Application Status
export type ApplicationStatus =
  | 'draft'
  | 'pending_payment'
  | 'payment_failed'
  | 'submitted'
  | 'under_review'
  | 'document_required'
  | 'processing'
  | 'pending_verification'
  | 'verified'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'on_hold'
  | 'expired';

// Payment Status
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Application Priority
export type ApplicationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Note Type
export type NoteType = 'internal' | 'public' | 'action_required';

// Document Verification Status
export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

// Application Interface
export interface Application {
  id: string;
  application_number: string;
  user_id: string;
  service_id: string;
  agent_id?: string | null;
  applicant_type?: string;
  is_agent_assisted: boolean;

  // Status
  status: ApplicationStatus;
  sub_status?: string | null;
  status_remarks?: string | null;
  last_status_change?: string;
  previous_status?: ApplicationStatus | null;

  // Form Data
  form_data?: Record<string, unknown>;
  form_version?: number;

  // Applicant Personal Info
  applicant_name: string;
  applicant_name_hindi?: string | null;
  applicant_mobile: string;
  applicant_email?: string | null;
  applicant_father_name?: string | null;
  applicant_mother_name?: string | null;
  applicant_spouse_name?: string | null;
  applicant_dob?: string | null;
  applicant_gender?: string | null;
  applicant_religion?: string | null;
  applicant_caste?: string | null;
  applicant_caste_category?: string | null;
  applicant_nationality?: string | null;
  applicant_marital_status?: string | null;
  applicant_occupation?: string | null;
  applicant_qualification?: string | null;
  applicant_annual_income?: number | null;
  applicant_aadhaar_last4?: string | null;
  applicant_pan_number?: string | null;
  applicant_voter_id?: string | null;
  applicant_passport_number?: string | null;
  applicant_driving_license?: string | null;
  applicant_photo_url?: string | null;
  applicant_signature_url?: string | null;

  // Document Address
  doc_address_line1?: string | null;
  doc_address_line2?: string | null;
  doc_address_landmark?: string | null;
  doc_address_village?: string | null;
  doc_address_block?: string | null;
  doc_address_taluk?: string | null;
  doc_address_district?: string | null;
  doc_address_state_code?: string | null;
  doc_address_state_name?: string | null;
  doc_address_pincode?: string | null;
  doc_address_country?: string | null;
  doc_address_type?: string | null;

  // Current Address
  curr_address_line1?: string | null;
  curr_address_line2?: string | null;
  curr_address_landmark?: string | null;
  curr_address_village?: string | null;
  curr_address_block?: string | null;
  curr_address_taluk?: string | null;
  curr_address_district?: string | null;
  curr_address_state_code?: string | null;
  curr_address_state_name?: string | null;
  curr_address_pincode?: string | null;
  curr_address_country?: string | null;
  curr_address_duration_years?: number | null;
  is_address_same_as_document?: boolean;

  // Alternative Contact
  alt_contact_name?: string | null;
  alt_contact_mobile?: string | null;
  alt_contact_relation?: string | null;
  alt_contact_email?: string | null;

  // Bank Details
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc_code?: string | null;
  bank_name?: string | null;
  bank_branch?: string | null;

  // Service Info (populated from service)
  category_id?: string;
  category_name?: string;
  category_name_hindi?: string;
  service_name?: string;
  service_name_hindi?: string;
  service_slug?: string;
  service_department?: string;
  service_department_hindi?: string;
  service_ministry?: string;
  service_category?: string;
  service_processing_time?: string;
  service_required_documents?: string[];
  service_form_fields?: Record<string, unknown>;
  service_extra_fields?: Record<string, unknown>;

  // Fees & Payment
  service_fee?: number;
  platform_fee?: number;
  total_fee: number;
  amount_paid?: number;
  amount_due?: number;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  payment_reference?: string | null;
  payment_gateway?: string | null;
  transaction_id?: string | null;
  payment_date?: string | null;
  is_free_service?: boolean;
  fee_waiver_applied?: boolean;

  // Processing Info
  assigned_to?: string | null;
  assigned_at?: string | null;
  processing_center?: string | null;
  processing_office?: string | null;
  processing_remarks?: string | null;

  // Verification
  verified_by?: string | null;
  verified_at?: string | null;
  verification_remarks?: string | null;

  // Approval/Rejection
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  rejection_code?: string | null;

  // Output/Certificate
  certificate_number?: string | null;
  certificate_url?: string | null;
  certificate_issued_at?: string | null;
  output_data?: Record<string, unknown> | null;

  // SLA & Timeline
  estimated_completion_date?: string | null;
  actual_completion_date?: string | null;
  processing_days?: number | null;
  sla_breached?: boolean;
  sla_days?: number;

  // Priority & Flags
  priority?: ApplicationPriority;
  is_urgent?: boolean;
  urgency_reason?: string | null;

  // Feedback
  rating?: number | null;
  feedback_text?: string | null;
  feedback_given_at?: string | null;

  // Resubmission
  is_resubmission?: boolean;
  parent_application_id?: string | null;
  resubmission_count?: number;
  is_flagged?: boolean;
  flag_reason?: string | null;
  is_deleted?: boolean;

  // Extra
  extra_data?: Record<string, unknown>;
  remarks?: string | null;

  // Source Info
  source?: string;
  device_type?: string;
  app_version?: string;

  // Timestamps
  submitted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

// Application List Item (Minimal for list view)
export interface ApplicationListItem {
  id: string;
  application_number: string;
  service_name: string;
  service_name_hindi?: string;
  applicant_name: string;
  applicant_mobile: string;
  status: ApplicationStatus;
  payment_status: PaymentStatus;
  total_fee: number;
  amount_paid?: number;
  is_agent_assisted: boolean;
  agent_name?: string | null;
  submitted_at?: string | null;
  created_at: string;
}

// Application Document
export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: string;
  document_name: string;
  document_number?: string | null;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
  thumbnail_url?: string | null;
  original_filename?: string;
  verification_status: DocumentVerificationStatus;
  verified_by?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  ocr_data?: Record<string, unknown> | null;
  is_required: boolean;
  sort_order?: number;
  uploaded_by?: string;
  is_deleted?: boolean;
  created_at: string;
  updated_at?: string;
}

// Application Note
export interface ApplicationNote {
  id: string;
  application_id: string;
  note: string;
  note_type: NoteType;
  created_by: string;
  created_by_name?: string;
  is_private: boolean;
  created_at: string;
}

// Application Payment
export interface ApplicationPayment {
  id: string;
  application_id: string;
  amount: number;
  payment_type?: string;
  payment_method?: string;
  payment_gateway?: string;
  transaction_id?: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  failure_reason?: string | null;
  refund_id?: string | null;
  refunded_at?: string | null;
  refund_reason?: string | null;
  payment_data?: Record<string, unknown>;
  paid_at?: string | null;
  created_at: string;
  updated_at?: string;
}

// Application Status History
export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  remarks?: string | null;
  changed_by?: string;
  changed_by_type?: string;
  changed_by_name?: string;
  ip_address?: string;
  created_at: string;
}

// Application Statistics
export interface ApplicationStats {
  total_applications: number;
  draft_count: number;
  submitted_count: number;
  under_review_count: number;
  processing_count: number;
  approved_count: number;
  rejected_count: number;
  completed_count: number;
  pending_payment_count: number;
  total_revenue: number;
  total_pending_revenue: number;
  average_processing_days: number;
  sla_breached_count: number;
}

// Create Application Request
export interface CreateApplicationRequest {
  service_id: string;
  form_data?: Record<string, unknown>;
  applicant_name: string;
  applicant_mobile: string;
  applicant_email?: string;
  applicant_father_name?: string;
  applicant_mother_name?: string;
  applicant_spouse_name?: string;
  applicant_dob?: string;
  applicant_gender?: string;
  applicant_religion?: string;
  applicant_caste?: string;
  applicant_caste_category?: string;
  applicant_nationality?: string;
  applicant_marital_status?: string;
  applicant_occupation?: string;
  applicant_qualification?: string;
  applicant_annual_income?: number;
  applicant_aadhaar_last4?: string;
  applicant_pan_number?: string;
  applicant_voter_id?: string;
  applicant_passport_number?: string;
  applicant_driving_license?: string;
  applicant_photo_url?: string;
  applicant_signature_url?: string;
  doc_address_line1?: string;
  doc_address_line2?: string;
  doc_address_landmark?: string;
  doc_address_village?: string;
  doc_address_block?: string;
  doc_address_taluk?: string;
  doc_address_district?: string;
  doc_address_state_code?: string;
  doc_address_state_name?: string;
  doc_address_pincode?: string;
  doc_address_country?: string;
  doc_address_type?: string;
  curr_address_line1?: string;
  curr_address_line2?: string;
  curr_address_landmark?: string;
  curr_address_village?: string;
  curr_address_block?: string;
  curr_address_taluk?: string;
  curr_address_district?: string;
  curr_address_state_code?: string;
  curr_address_state_name?: string;
  curr_address_pincode?: string;
  curr_address_country?: string;
  curr_address_duration_years?: number;
  is_address_same_as_document?: boolean;
  alt_contact_name?: string;
  alt_contact_mobile?: string;
  alt_contact_relation?: string;
  alt_contact_email?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  service_extra_fields?: Record<string, unknown>;
  source?: string;
  device_type?: string;
  app_version?: string;
  is_urgent?: boolean;
  urgency_reason?: string;
  extra_data?: Record<string, unknown>;
  remarks?: string;
}

// Update Application Request
export interface UpdateApplicationRequest {
  form_data?: Record<string, unknown>;
  status?: ApplicationStatus;
  sub_status?: string;
  status_remarks?: string;
  assigned_to?: string;
  processing_center?: string;
  processing_office?: string;
  processing_remarks?: string;
  priority?: ApplicationPriority;
  is_urgent?: boolean;
  urgency_reason?: string;
  is_flagged?: boolean;
  flag_reason?: string;
  extra_data?: Record<string, unknown>;
  remarks?: string;
}

// Application Query Params
export interface ApplicationQueryParams extends PaginationParams {
  status?: ApplicationStatus;
  statuses?: ApplicationStatus[]; // For filtering by multiple statuses
  payment_status?: PaymentStatus;
  service_id?: string;
  user_id?: string;
  agent_id?: string;
  state_code?: string;
  district?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  is_urgent?: boolean;
  is_flagged?: boolean;
}

// Track Application Response
export interface TrackApplicationResponse {
  application_number: string;
  service_name: string;
  service_name_hindi?: string;
  status: ApplicationStatus;
  submitted_at?: string;
  created_at: string;
}

// ==================== SERVICE PRICING & CASEWORKER TYPES ====================

// Service Pricing - State/District wise pricing
export interface ServicePricing {
  id: string;
  service_id: string;
  state_code: string;
  state_name?: string;
  district_code?: string | null;
  district_name?: string | null;
  service_fee: number;
  platform_fee: number;
  government_fee: number;
  gst_percentage: number;
  gst_amount: number;
  total_fee: number;
  express_available: boolean;
  express_fee?: number | null;
  express_processing_time?: string | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  effective_from?: string | null;
  effective_to?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Caseworker Portal Info
export interface CaseworkerPortal {
  name: string;
  url: string;
  description?: string;
}

// Step by Step Process
export interface ProcessStep {
  step_number: number;
  title: string;
  title_hindi?: string;
  description: string;
  description_hindi?: string;
  documents_needed?: string[];
  tips?: string[];
  estimated_time?: string;
}

// Form Submission Info
export interface FormSubmissionInfo {
  online_available: boolean;
  offline_available: boolean;
  online_portal?: string;
  offline_locations?: string[];
  form_download_url?: string;
  sample_form_url?: string;
}

// Payment Info
export interface PaymentInfo {
  online_payment: boolean;
  offline_payment: boolean;
  payment_modes?: string[];
  challan_download_url?: string;
  bank_details?: {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    branch: string;
  };
}

// Tracking Info
export interface TrackingInfo {
  tracking_available: boolean;
  tracking_url?: string;
  sms_updates: boolean;
  email_updates: boolean;
  whatsapp_updates: boolean;
}

// Helpdesk Info
export interface HelpdeskInfo {
  toll_free_number?: string;
  email?: string;
  working_hours?: string;
  chat_available: boolean;
  chat_url?: string;
}

// Service Caseworker Info
export interface ServiceCaseworkerInfo {
  id: string;
  service_id: string;
  state_code: string;
  state_name?: string;
  portals: CaseworkerPortal[];
  step_by_step_process: ProcessStep[];
  form_submission: FormSubmissionInfo;
  payment_info: PaymentInfo;
  tracking_info: TrackingInfo;
  helpdesk: HelpdeskInfo;
  tips?: string[];
  common_mistakes?: string[];
  success_rate?: number;
  average_processing_days?: number;
  last_updated?: string;
  created_at: string;
  updated_at?: string;
}

// Service State Availability
export interface ServiceStateAvailability {
  id: string;
  service_id: string;
  state_code: string;
  state_name?: string;
  is_available: boolean;
  launch_date?: string | null;
  coming_soon: boolean;
  unavailability_reason?: string | null;
  alternative_service_id?: string | null;
  alternative_service_name?: string | null;
  created_at: string;
  updated_at?: string;
}

// Service Office Location
export interface ServiceOfficeLocation {
  id: string;
  service_id: string;
  state_code: string;
  state_name?: string;
  district_code?: string | null;
  district_name?: string | null;
  office_type: 'head_office' | 'regional_office' | 'district_office' | 'taluk_office' | 'service_center';
  office_name: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  pincode: string;
  phone?: string | null;
  email?: string | null;
  working_hours?: string | null;
  working_days?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Service Checklist
export interface ServiceChecklist {
  id: string;
  service_id: string;
  state_code?: string | null;
  state_name?: string | null;
  checklist_type: 'pre_application' | 'documents' | 'eligibility' | 'post_application';
  title: string;
  title_hindi?: string;
  items: ChecklistItem[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ChecklistItem {
  item_number: number;
  text: string;
  text_hindi?: string;
  is_mandatory: boolean;
  help_text?: string;
  document_type?: string;
}

// Service Complete Details - All information combined
export interface ServiceCompleteDetails {
  service: Service;
  pricing?: ServicePricing | null;
  caseworker_info?: ServiceCaseworkerInfo | null;
  checklists: ServiceChecklist[];
  offices: ServiceOfficeLocation[];
  faqs: ServiceFAQ[];
  state_availability?: ServiceStateAvailability | null;
}

// Query params for pricing
export interface ServicePricingQueryParams {
  state_code: string;
  district_code?: string;
}

// Query params for caseworker info
export interface ServiceCaseworkerQueryParams {
  state_code: string;
}

// Query params for checklists
export interface ServiceChecklistQueryParams {
  state_code?: string;
  type?: 'pre_application' | 'documents' | 'eligibility' | 'post_application';
}

// Query params for offices
export interface ServiceOfficeQueryParams {
  state_code?: string;
  district_code?: string;
  office_type?: 'head_office' | 'regional_office' | 'district_office' | 'taluk_office' | 'service_center';
}
