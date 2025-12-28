import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  PaginatedResponse,
  Application,
  ApplicationListItem,
  ApplicationDocument,
  ApplicationNote,
  ApplicationPayment,
  ApplicationStatusHistory,
  ApplicationStats,
  ApplicationQueryParams,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationStatus,
  TrackApplicationResponse,
  // V2 Workflow Types
  ApplicationFullResponse,
  ApplicationRequiredDocument,
  ApplicationWorkflowProgress,
  ApplicationEligibilityCheck,
  DocumentStatusSummary,
  CreateApplicationV2Request,
  CreateApplicationV2Response,
  UploadRequiredDocumentRequest,
  UploadRequiredDocumentResponse,
  VerifyDocumentRequest,
  WorkflowAdvanceRequest,
  WorkflowAdvanceResponse,
  CurrentWorkflowStepResponse
} from '../../types/api.types';

const APPLICATIONS_BASE = '/api/v1/applications';

export const applicationsApi = {
  // ==================== APPLICATION CRUD ====================

  // Get paginated list of applications (Admin)
  getApplications: async (params?: ApplicationQueryParams): Promise<PaginatedResponse<ApplicationListItem>> => {
    // Convert statuses array to comma-separated string for API compatibility
    const queryParams = params ? { ...params } : {};
    if (queryParams.statuses && queryParams.statuses.length > 0) {
      (queryParams as Record<string, unknown>).statuses = queryParams.statuses.join(',');
    }
    const response = await axiosInstance.get(APPLICATIONS_BASE, { params: queryParams });
    return response.data;
  },

  // Get my applications (User)
  getMyApplications: async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<ApplicationListItem>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/my`, { params });
    return response.data;
  },

  // Get application by ID
  getApplicationById: async (id: string): Promise<ApiResponse<Application>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}`);
    return response.data;
  },

  // Create a new application
  createApplication: async (data: CreateApplicationRequest): Promise<ApiResponse<Application>> => {
    const response = await axiosInstance.post(APPLICATIONS_BASE, data);
    return response.data;
  },

  // Update an application
  updateApplication: async (id: string, data: UpdateApplicationRequest): Promise<ApiResponse<Application>> => {
    const response = await axiosInstance.put(`${APPLICATIONS_BASE}/${id}`, data);
    return response.data;
  },

  // Delete an application
  deleteApplication: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${APPLICATIONS_BASE}/${id}`);
    return response.data;
  },

  // ==================== STATUS MANAGEMENT ====================

  // Submit application
  submitApplication: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/submit`);
    return response.data;
  },

  // Update application status
  updateApplicationStatus: async (
    id: string,
    status: ApplicationStatus,
    remarks?: string
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/status`, {
      status,
      remarks
    });
    return response.data;
  },

  // Verify application
  verifyApplication: async (
    id: string,
    verified: boolean,
    remarks?: string
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/verify`, {
      verified,
      remarks
    });
    return response.data;
  },

  // Approve or reject application
  approveApplication: async (
    id: string,
    approved: boolean,
    remarks?: string,
    rejectionReason?: string,
    rejectionCode?: string
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/approve`, {
      approved,
      remarks,
      rejection_reason: rejectionReason,
      rejection_code: rejectionCode
    });
    return response.data;
  },

  // Complete application
  completeApplication: async (
    id: string,
    certificateNumber: string,
    certificateUrl?: string
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/complete`, {
      certificate_number: certificateNumber,
      certificate_url: certificateUrl
    });
    return response.data;
  },

  // Cancel application
  cancelApplication: async (id: string, reason: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/cancel`, {
      reason
    });
    return response.data;
  },

  // ==================== STATUS HISTORY ====================

  // Get application status history
  getApplicationHistory: async (id: string): Promise<ApiResponse<ApplicationStatusHistory[]>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/history`);
    return response.data;
  },

  // ==================== DOCUMENTS ====================

  // Get application documents
  getApplicationDocuments: async (id: string): Promise<ApiResponse<ApplicationDocument[]>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/documents`);
    return response.data;
  },

  // Upload document
  uploadDocument: async (
    applicationId: string,
    data: {
      document_type: string;
      document_name: string;
      document_number?: string;
      file_url: string;
      file_type?: string;
      file_size_bytes?: number;
      thumbnail_url?: string;
      original_filename?: string;
      is_required?: boolean;
      sort_order?: number;
    }
  ): Promise<ApiResponse<ApplicationDocument>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${applicationId}/documents`, data);
    return response.data;
  },

  // Verify document
  verifyDocument: async (
    docId: string,
    verified: boolean,
    rejectionReason?: string
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/documents/${docId}/verify`, {
      verified,
      rejection_reason: rejectionReason
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (docId: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`${APPLICATIONS_BASE}/documents/${docId}`);
    return response.data;
  },

  // ==================== NOTES ====================

  // Get application notes
  getApplicationNotes: async (
    id: string,
    includePrivate: boolean = true
  ): Promise<ApiResponse<ApplicationNote[]>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/notes`, {
      params: { include_private: includePrivate }
    });
    return response.data;
  },

  // Add note
  addApplicationNote: async (
    applicationId: string,
    note: string,
    noteType: 'internal' | 'public' | 'action_required' = 'internal',
    isPrivate: boolean = true
  ): Promise<ApiResponse<ApplicationNote>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${applicationId}/notes`, {
      note,
      note_type: noteType,
      is_private: isPrivate
    });
    return response.data;
  },

  // ==================== PAYMENTS ====================

  // Get application payments
  getApplicationPayments: async (id: string): Promise<ApiResponse<ApplicationPayment[]>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/payments`);
    return response.data;
  },

  // Record payment
  recordPayment: async (
    applicationId: string,
    data: {
      amount: number;
      payment_method: string;
      payment_gateway?: string;
      transaction_id?: string;
      gateway_order_id?: string;
      gateway_payment_id?: string;
      payment_data?: Record<string, unknown>;
    }
  ): Promise<ApiResponse<ApplicationPayment>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${applicationId}/payments`, data);
    return response.data;
  },

  // ==================== FEEDBACK ====================

  // Submit feedback
  submitFeedback: async (
    id: string,
    rating: number,
    feedback?: string
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/feedback`, {
      rating,
      feedback
    });
    return response.data;
  },

  // ==================== STATISTICS ====================

  // Get application statistics
  getApplicationStats: async (params?: {
    service_id?: string;
    agent_id?: string;
    state_code?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<ApplicationStats>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/stats`, { params });
    return response.data;
  },

  // ==================== PUBLIC TRACKING ====================

  // Track application (public - no auth required)
  trackApplication: async (applicationNumber: string): Promise<ApiResponse<TrackApplicationResponse>> => {
    const response = await axiosInstance.get(`/api/v1/track/${applicationNumber}`);
    return response.data;
  },

  // ==================== V2 WORKFLOW SYSTEM ====================

  // Create application with service integration (V2)
  createApplicationV2: async (data: CreateApplicationV2Request): Promise<ApiResponse<CreateApplicationV2Response>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/v2`, data);
    return response.data;
  },

  // Get full application details with workflow data
  getApplicationFull: async (id: string): Promise<ApiResponse<ApplicationFullResponse>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/full`);
    return response.data;
  },

  // ==================== REQUIRED DOCUMENTS ====================

  // Get required documents for an application
  getRequiredDocuments: async (id: string): Promise<ApiResponse<ApplicationRequiredDocument[]>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/required-documents`);
    return response.data;
  },

  // Get document status summary
  getDocumentStatus: async (id: string): Promise<ApiResponse<DocumentStatusSummary>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/required-documents/status`);
    return response.data;
  },

  // Upload document for a required document
  uploadRequiredDocument: async (
    applicationId: string,
    documentId: string,
    data: UploadRequiredDocumentRequest
  ): Promise<ApiResponse<UploadRequiredDocumentResponse>> => {
    const response = await axiosInstance.post(
      `${APPLICATIONS_BASE}/${applicationId}/required-documents/${documentId}/upload`,
      data
    );
    return response.data;
  },

  // Verify or reject a required document
  verifyRequiredDocument: async (
    applicationId: string,
    documentId: string,
    data: VerifyDocumentRequest
  ): Promise<ApiResponse<ApplicationRequiredDocument>> => {
    const response = await axiosInstance.post(
      `${APPLICATIONS_BASE}/${applicationId}/required-documents/${documentId}/verify`,
      data
    );
    return response.data;
  },

  // ==================== WORKFLOW PROGRESS ====================

  // Get all workflow steps for an application
  getWorkflowProgress: async (id: string): Promise<ApiResponse<ApplicationWorkflowProgress[]>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/workflow`);
    return response.data;
  },

  // Get current active workflow step
  getCurrentWorkflowStep: async (id: string): Promise<ApiResponse<CurrentWorkflowStepResponse>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/workflow/current`);
    return response.data;
  },

  // Start the workflow (begins step 1)
  startWorkflow: async (id: string): Promise<ApiResponse<{ current_step: number; total_steps: number }>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/workflow/start`);
    return response.data;
  },

  // Advance to the next workflow step
  advanceWorkflow: async (
    id: string,
    data: WorkflowAdvanceRequest
  ): Promise<ApiResponse<WorkflowAdvanceResponse>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/workflow/advance`, data);
    return response.data;
  },

  // ==================== ELIGIBILITY CHECKS ====================

  // Get eligibility check results
  getEligibilityChecks: async (id: string): Promise<ApiResponse<ApplicationEligibilityCheck[]>> => {
    const response = await axiosInstance.get(`${APPLICATIONS_BASE}/${id}/eligibility`);
    return response.data;
  },

  // Re-run eligibility checks
  runEligibilityChecks: async (id: string): Promise<ApiResponse<ApplicationEligibilityCheck[]>> => {
    const response = await axiosInstance.post(`${APPLICATIONS_BASE}/${id}/eligibility/check`);
    return response.data;
  }
};

export default applicationsApi;
