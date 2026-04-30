// Auto-rewritten 2026-04-30 after the services module rebuild.
// Only includes types backed by current backend endpoints.
import type { AxiosRequestConfig } from 'axios';

// =====================================================================
// COMMON
// =====================================================================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  status?: number;
  error?: { message: string; code: string };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: string;
  response?: { status: number; data: { message?: string; code?: string } };
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

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export type RequestConfig = AxiosRequestConfig;

// =====================================================================
// SERVICES — categories, services, profiles
// =====================================================================
export interface ServiceCategory {
  id: string;
  code: string;
  name: string;
  name_hindi?: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  category_type: 'government' | 'financial' | 'utility' | 'private' | 'schemes';
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  service_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  code: string;
  name: string;
  name_hindi?: string;
  slug: string;
  short_description?: string;
  description?: string;
  description_hindi?: string;
  department?: string;
  ministry?: string;
  issuing_authority?: string;
  icon_url?: string;
  banner_url?: string;
  official_url?: string;

  base_government_fee: number;
  base_platform_fee: number;
  base_gst_percent: number;
  base_processing_time?: string;
  is_free: boolean;

  tags: string[];
  keywords?: string;
  target_audience?: string;

  is_active: boolean;
  is_popular: boolean;
  is_featured: boolean;
  is_new: boolean;
  sort_order: number;

  avg_rating: number;
  total_applications: number;
  total_reviews: number;

  metadata?: Record<string, unknown>;

  created_at: string;
  updated_at: string;
  deleted_at?: string;

  category?: ServiceCategory;
  profiles?: ServiceProfile[];
}

export interface ServiceProfile {
  id: string;
  service_id: string;
  profile_code: string;
  display_name?: string;
  display_name_hindi?: string;
  state_code?: string;
  applicant_category?: string;
  channel?: string;
  processing_time?: string;
  sla_hours?: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pricing?: ServicePricing;
}

export interface ServicePricing {
  id: string;
  profile_id: string;
  currency: string;
  government_fee: number;
  platform_fee: number;
  convenience_fee: number;
  agent_commission: number;
  gst_percent: number;
  total_amount: number;
  is_free: boolean;
  refund_policy?: string;
}

export interface ServiceDocument {
  id: string;
  service_id: string;
  profile_id?: string;
  code: string;
  document_name: string;
  document_name_hindi?: string;
  document_type: string;
  is_mandatory: boolean;
  alternatives_group?: string;
  accepted_formats: string[];
  max_size_mb: number;
  min_size_kb: number;
  sample_url?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ServiceWorkflowStep {
  id: string;
  service_id: string;
  profile_id?: string;
  step_number: number;
  step_name: string;
  step_name_hindi?: string;
  step_description?: string;
  step_type: 'submission' | 'document_verify' | 'payment' | 'approval' | 'dispatch' | 'delivery' | 'external';
  assigned_role?: string;
  sla_hours?: number;
  is_optional: boolean;
  notify_applicant: boolean;
  notify_email: boolean;
  notify_sms: boolean;
  notify_whatsapp: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface ServiceFAQ {
  id: string;
  service_id: string;
  profile_id?: string;
  question: string;
  question_hindi?: string;
  answer: string;
  answer_hindi?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ServiceCompleteResponse {
  service: Service;
  profile?: ServiceProfile;
  pricing?: ServicePricing;
  documents?: ServiceDocument[];
  workflow?: ServiceWorkflowStep[];
  faqs?: ServiceFAQ[];
}

export interface CatalogStats {
  total_services: number;
  active_services: number;
  total_categories: number;
  by_category: Record<string, number>;
  by_department?: Record<string, number>;
}

export interface CreateServiceRequest {
  category_id: string;
  code: string;
  name: string;
  name_hindi?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  description_hindi?: string;
  department?: string;
  ministry?: string;
  issuing_authority?: string;
  icon_url?: string;
  banner_url?: string;
  official_url?: string;
  base_government_fee?: number;
  base_platform_fee?: number;
  base_gst_percent?: number;
  base_processing_time?: string;
  is_free?: boolean;
  tags?: string[];
  keywords?: string;
  target_audience?: string;
  is_popular?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  sort_order?: number;
}

export interface UpdateServiceRequest {
  category_id?: string;
  name?: string;
  name_hindi?: string;
  short_description?: string;
  description?: string;
  description_hindi?: string;
  department?: string;
  ministry?: string;
  issuing_authority?: string;
  icon_url?: string;
  banner_url?: string;
  official_url?: string;
  base_government_fee?: number;
  base_platform_fee?: number;
  base_gst_percent?: number;
  base_processing_time?: string;
  is_free?: boolean;
  tags?: string[];
  keywords?: string;
  target_audience?: string;
  is_active?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  sort_order?: number;
}

export interface CreateProfileRequest {
  profile_code: string;
  display_name?: string;
  state_code?: string;
  applicant_category?: string;
  channel?: string;
  processing_time?: string;
  sla_hours?: number;
  is_default?: boolean;
  pricing?: {
    government_fee: number;
    platform_fee: number;
    convenience_fee?: number;
    agent_commission?: number;
    gst_percent: number;
    is_free?: boolean;
    refund_policy?: string;
  };
}

export interface UpdateProfileRequest {
  display_name?: string;
  state_code?: string;
  applicant_category?: string;
  channel?: string;
  processing_time?: string;
  sla_hours?: number;
  is_default?: boolean;
  is_active?: boolean;
}

// Documents
export interface CreateDocumentRequest {
  profile_id?: string;
  code: string;
  document_name: string;
  document_type: string;
  is_mandatory?: boolean;
  alternatives_group?: string;
  accepted_formats?: string[];
  max_size_mb?: number;
  min_size_kb?: number;
  sample_url?: string;
  description?: string;
  sort_order?: number;
}
export interface UpdateDocumentRequest {
  profile_id?: string;
  document_name?: string;
  document_type?: string;
  is_mandatory?: boolean;
  alternatives_group?: string;
  accepted_formats?: string[];
  max_size_mb?: number;
  min_size_kb?: number;
  sample_url?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

// Workflow
export interface CreateWorkflowStepRequest {
  profile_id?: string;
  step_number: number;
  step_name: string;
  step_description?: string;
  step_type?: string;
  assigned_role?: string;
  sla_hours?: number;
  is_optional?: boolean;
  notify_applicant?: boolean;
  notify_email?: boolean;
  notify_sms?: boolean;
  notify_whatsapp?: boolean;
  sort_order?: number;
}
export interface UpdateWorkflowStepRequest {
  profile_id?: string;
  step_number?: number;
  step_name?: string;
  step_description?: string;
  step_type?: string;
  assigned_role?: string;
  sla_hours?: number;
  is_optional?: boolean;
  notify_applicant?: boolean;
  notify_email?: boolean;
  notify_sms?: boolean;
  notify_whatsapp?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

// FAQs
export interface CreateFAQRequest {
  profile_id?: string;
  question: string;
  answer: string;
  sort_order?: number;
}
export interface UpdateFAQRequest {
  profile_id?: string;
  question?: string;
  answer?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateCategoryRequest {
  code: string;
  name: string;
  name_hindi?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  category_type?: ServiceCategory['category_type'];
  sort_order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  name_hindi?: string;
  description?: string;
  icon?: string;
  color?: string;
  category_type?: ServiceCategory['category_type'];
  sort_order?: number;
  is_active?: boolean;
}

export interface ServicesQueryParams extends PaginationParams {
  search?: string;
  category?: string;        // category code
  category_id?: string;
  tags?: string;            // comma-separated
  department?: string;
  state_code?: string;
  popular?: 'true' | 'false';
  featured?: 'true' | 'false';
  free?: 'true' | 'false';
  active?: 'true' | 'false';
  sort_by?: 'popular' | 'name' | 'recent' | 'applications';
}

// =====================================================================
// USER (citizen)
// =====================================================================
export interface User {
  id: string;
  mobile: string;
  mobile_verified: boolean;
  email?: string;
  email_verified: boolean;
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  profile_photo_url?: string;
  preferred_language: string;
  aadhaar_last4?: string;
  aadhaar_verified: boolean;
  pan_number?: string;
  pan_verified: boolean;
  kyc_status: 'pending' | 'partial' | 'verified' | 'rejected';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  district_id?: string;
  state_code?: string;
  pincode?: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  referral_code?: string;
  referred_by_code?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserDocument {
  id: string;
  user_id: string;
  doc_type: string;
  doc_number_last4?: string;
  file_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  mobile: string;
  full_name: string;
  email?: string;
  preferred_language?: string;
  state_code?: string;
  city?: string;
  pincode?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  profile_photo_url?: string;
  preferred_language?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_code?: string;
  pincode?: string;
}

export interface UsersQueryParams extends PaginationParams {
  search?: string;
  state_code?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
  kyc_status?: 'pending' | 'partial' | 'verified' | 'rejected';
}

// =====================================================================
// AUTH (OTP)
// =====================================================================
export interface SendOtpRequest {
  mobile: string;
  purpose?: 'login' | 'signup' | 'verify_mobile' | 'reset';
}
export interface SendOtpResponse {
  mobile: string;
  expires_in: number;
  purpose: string;
  dev_otp?: string;
}
export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
  full_name?: string;
}
export interface VerifyOtpResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// =====================================================================
// STAFF
// =====================================================================
export type StaffRole =
  | 'super_admin' | 'admin' | 'state_head' | 'district_manager'
  | 'supervisor' | 'service_manager' | 'agent' | 'verifier'
  | 'support' | 'finance';

export type StaffScope = 'pan_india' | 'state' | 'district' | 'taluk' | 'category' | 'center';

export interface StaffRoleAssignment {
  id: string;
  staff_id: string;
  role: StaffRole;
  scope_type: StaffScope;
  scope_ref_id?: string;
  scope_label?: string;
  is_primary: boolean;
  assigned_at: string;
  revoked_at?: string;
}

export interface Staff {
  id: string;
  employee_code: string;
  email: string;
  email_verified: boolean;
  must_change_password: boolean;
  full_name: string;
  mobile: string;
  mobile_verified: boolean;
  profile_photo_url?: string;
  designation?: string;
  department?: string;
  joined_at: string;
  reporting_to?: string;
  home_state_code?: string;
  home_district_id?: string;
  status: 'invited' | 'active' | 'suspended' | 'offboarded';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  roles?: StaffRoleAssignment[];
}

export interface CreateStaffRequest {
  email: string;
  full_name: string;
  mobile: string;
  designation?: string;
  department?: string;
  home_state_code?: string;
  home_district_id?: string;
  reporting_to?: string;
  initial_password?: string;
  roles?: Array<{
    role: StaffRole;
    scope_type?: StaffScope;
    scope_ref_id?: string;
    scope_label?: string;
    is_primary?: boolean;
  }>;
}

export interface CreateStaffResponse { staff: Staff; temp_password?: string; }

export interface UpdateStaffRequest {
  full_name?: string;
  mobile?: string;
  designation?: string;
  department?: string;
  home_state_code?: string;
  home_district_id?: string;
  reporting_to?: string;
  profile_photo_url?: string;
  status?: 'active' | 'suspended' | 'offboarded';
}

export interface StaffLoginRequest { email: string; password: string; }
export interface StaffLoginResponse {
  staff: Staff;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  must_change_password: boolean;
}
export interface ChangePasswordRequest { current_password: string; new_password: string; }
export interface AddRoleRequest {
  role: StaffRole;
  scope_type?: StaffScope;
  scope_ref_id?: string;
  scope_label?: string;
  is_primary?: boolean;
}
export interface RolesCatalog { roles: StaffRole[]; scopes: StaffScope[]; }

export interface StaffAuditEntry {
  id: number;
  staff_id?: string;
  action: string;
  target_table?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface StaffQueryParams extends PaginationParams {
  search?: string;
  role?: StaffRole;
  department?: string;
  state_code?: string;
  status?: 'invited' | 'active' | 'suspended' | 'offboarded';
}

// =====================================================================
// HEALTH
// =====================================================================
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  services: { postgres: 'healthy' | 'unhealthy'; redis: 'healthy' | 'unhealthy' };
  system: { go_version: string; num_goroutine: number; uptime: string };
}

// =====================================================================
// GEOGRAPHY
// =====================================================================
export interface NationalSummary {
  country: string;
  capital?: string;
  total_states: number;
  total_union_territories?: number;
  total_districts: number;
  total_taluks: number;
  total_gram_panchayats: number;
  total_villages: number;
  population?: number;
  area_sq_km?: number;
  zones?: {
    north: number;
    south: number;
    east: number;
    west: number;
    central: number;
    northeast: number;
  };
}

export interface State {
  id: string;
  code: string;
  name: string;
  name_hindi?: string;
  capital?: string;
  region?: string;
  population?: number;
  area_sq_km?: number;
  lgd_code?: string;
  total_districts?: number;
  is_active?: boolean;
  [k: string]: any;
}

export interface CreateStateRequest {
  code: string;
  name: string;
  name_hindi?: string;
  capital?: string;
  region?: string;
  population?: number;
  area_sq_km?: number;
  lgd_code?: string;
  [k: string]: any;
}
export interface UpdateStateRequest extends Partial<CreateStateRequest> {
  is_active?: boolean;
  [k: string]: any;
}

export interface District {
  id: string;
  state_id?: string;
  state_code?: string;
  state_name?: string;
  state?: { id?: string; code?: string; name?: string };
  code: string;
  name: string;
  name_hindi?: string;
  headquarters?: string;
  population?: number;
  area_sq_km?: number;
  lgd_code?: string;
  total_taluks?: number;
  total_gram_panchayats?: number;
  total_villages?: number;
  literacy_rate?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [k: string]: any;
}
export interface CreateDistrictRequest {
  state_id?: string;
  state_code?: string;
  code: string;
  name: string;
  name_hindi?: string;
  headquarters?: string;
  population?: number;
  area_sq_km?: number;
  lgd_code?: string;
  [k: string]: any;
}
export interface UpdateDistrictRequest extends Partial<CreateDistrictRequest> {
  is_active?: boolean;
  [k: string]: any;
}

export interface Taluk {
  id: string;
  district_id?: string;
  district_name?: string;
  state_id?: string;
  state_code?: string;
  state_name?: string;
  district?: { id?: string; name?: string };
  state?: { id?: string; code?: string; name?: string };
  code: string;
  name: string;
  name_hindi?: string;
  population?: number;
  area_sq_km?: number;
  lgd_code?: string;
  pin_code?: string;
  total_gram_panchayats?: number;
  total_villages?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [k: string]: any;
}
export interface CreateTalukRequest {
  district_id?: string;
  code: string;
  name: string;
  name_hindi?: string;
  population?: number;
  area_sq_km?: number;
  lgd_code?: string;
  [k: string]: any;
}
export interface UpdateTalukRequest extends Partial<CreateTalukRequest> {
  is_active?: boolean;
  [k: string]: any;
}

export interface GramPanchayat {
  id: string;
  taluk_id?: string;
  taluk_name?: string;
  district_id?: string;
  district_name?: string;
  state_id?: string;
  state_code?: string;
  state_name?: string;
  district?: { id?: string; name?: string };
  state?: { id?: string; code?: string; name?: string };
  taluk?: { id?: string; name?: string };
  code: string;
  name: string;
  name_hindi?: string;
  population?: number;
  households?: number;
  total_villages?: number;
  pin_code?: string;
  lgd_code?: string;
  sarpanch_name?: string;
  sarpanch_mobile?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [k: string]: any;
}
export interface CreateGramPanchayatRequest {
  taluk_id?: string;
  state_id?: string;
  district_id?: string;
  code: string;
  name: string;
  name_hindi?: string;
  population?: number;
  households?: number;
  pin_code?: string;
  lgd_code?: string;
  sarpanch_name?: string;
  sarpanch_mobile?: string;
  latitude?: number;
  longitude?: number;
  [k: string]: any;
}
export interface UpdateGramPanchayatRequest extends Partial<CreateGramPanchayatRequest> {
  is_active?: boolean;
  [k: string]: any;
}

export interface Village {
  id: string;
  gram_panchayat_id?: string;
  gram_panchayat_name?: string;
  taluk_id?: string;
  taluk_name?: string;
  district_id?: string;
  district_name?: string;
  state_id?: string;
  state_code?: string;
  state_name?: string;
  district?: { id?: string; name?: string };
  state?: { id?: string; code?: string; name?: string };
  taluk?: { id?: string; name?: string };
  gram_panchayat?: { id?: string; name?: string };
  code: string;
  name: string;
  name_hindi?: string;
  population?: number;
  area_sq_km?: number;
  households?: number;
  lgd_code?: string;
  pin_code?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [k: string]: any;
}
export interface CreateVillageRequest {
  gram_panchayat_id?: string;
  state_id?: string;
  district_id?: string;
  taluk_id?: string;
  code: string;
  name: string;
  name_hindi?: string;
  population?: number;
  households?: number;
  pin_code?: string;
  lgd_code?: string;
  latitude?: number;
  longitude?: number;
  [k: string]: any;
}
export interface UpdateVillageRequest extends Partial<CreateVillageRequest> {
  is_active?: boolean;
  [k: string]: any;
}

export interface GeographySearchResult {
  type: 'state' | 'district' | 'taluk' | 'gram_panchayat' | 'village';
  id: string;
  name: string;
  parent?: string;
}

export interface GeographyQueryParams extends PaginationParams {
  search?: string;
  state_code?: string;
  state_type?: string;
  zone?: string;
  is_active?: boolean | string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc' | 1 | -1;
  state_id?: string;
  district_id?: string;
  taluk_id?: string;
  gram_panchayat_id?: string;
}
