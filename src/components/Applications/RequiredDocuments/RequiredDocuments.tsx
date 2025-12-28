import { useState, useRef } from 'react';
import {
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineExternalLink
} from 'react-icons/hi';
import type {
  ApplicationRequiredDocument,
  RequiredDocumentStatus,
  DocumentStatusSummary
} from '../../../types/api.types';
import applicationsApi from '../../../services/api/applications.api';
import './RequiredDocuments.scss';

interface RequiredDocumentsProps {
  applicationId: string;
  documents: ApplicationRequiredDocument[];
  statusSummary?: DocumentStatusSummary;
  canUpload?: boolean;
  canVerify?: boolean;
  onRefresh?: () => void;
}

const STATUS_CONFIG: Record<RequiredDocumentStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  pending: { label: 'Pending', icon: <HiOutlineClock />, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  uploaded: { label: 'Uploaded', icon: <HiOutlineUpload />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  verified: { label: 'Verified', icon: <HiOutlineCheckCircle />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  rejected: { label: 'Rejected', icon: <HiOutlineXCircle />, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
};

const RequiredDocuments = ({
  applicationId,
  documents,
  statusSummary,
  canUpload = false,
  canVerify = false,
  onRefresh
}: RequiredDocumentsProps) => {
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [verifyModal, setVerifyModal] = useState<{
    isOpen: boolean;
    document: ApplicationRequiredDocument | null;
  }>({ isOpen: false, document: null });
  const [verifyAction, setVerifyAction] = useState<'verify' | 'reject'>('verify');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (docId: string, file: File) => {
    if (!file) return;

    setUploadingDocId(docId);
    setError(null);

    try {
      // In a real implementation, you would upload to S3/cloud storage first
      // For now, we'll create a mock URL
      const mockFileUrl = URL.createObjectURL(file);

      const response = await applicationsApi.uploadRequiredDocument(applicationId, docId, {
        file_url: mockFileUrl,
        original_filename: file.name,
        file_type: file.type,
        file_size_bytes: file.size
      });

      if (response.success) {
        onRefresh?.();
      } else {
        setError(response.message || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError('Failed to upload document');
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleVerify = async () => {
    if (!verifyModal.document) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await applicationsApi.verifyRequiredDocument(
        applicationId,
        verifyModal.document.id,
        {
          verified: verifyAction === 'verify',
          rejection_reason: verifyAction === 'reject' ? rejectionReason : undefined
        }
      );

      if (response.success) {
        setVerifyModal({ isOpen: false, document: null });
        setRejectionReason('');
        onRefresh?.();
      } else {
        setError(response.message || 'Failed to verify document');
      }
    } catch (err) {
      console.error('Failed to verify document:', err);
      setError('Failed to verify document');
    } finally {
      setActionLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!statusSummary) return 0;
    const totalMandatory = statusSummary.total_mandatory || statusSummary.mandatory_total || 1;
    return Math.round((statusSummary.verified / totalMandatory) * 100);
  };

  return (
    <div className="rdocs">
      {/* Header with Summary */}
      <div className="rdocs-header">
        <div className="rdocs-header-info">
          <h3>Required Documents</h3>
          {statusSummary && (
            <p>
              {statusSummary.verified} of {statusSummary.total_mandatory} mandatory documents verified
            </p>
          )}
        </div>
        <div className="rdocs-header-actions">
          {statusSummary && (
            <div className="rdocs-status-pills">
              <span className="rdocs-pill pending">
                <HiOutlineClock /> {statusSummary.pending} Pending
              </span>
              <span className="rdocs-pill uploaded">
                <HiOutlineUpload /> {statusSummary.uploaded} Uploaded
              </span>
              <span className="rdocs-pill verified">
                <HiOutlineCheckCircle /> {statusSummary.verified} Verified
              </span>
              {statusSummary.rejected > 0 && (
                <span className="rdocs-pill rejected">
                  <HiOutlineXCircle /> {statusSummary.rejected} Rejected
                </span>
              )}
            </div>
          )}
          {onRefresh && (
            <button className="rdocs-refresh-btn" onClick={onRefresh} title="Refresh">
              <HiOutlineRefresh />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {statusSummary && (
        <div className="rdocs-progress">
          <div className="rdocs-progress-bar">
            <div
              className="rdocs-progress-fill"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <span className="rdocs-progress-text">
            {getCompletionPercentage()}% Verified
          </span>
        </div>
      )}

      {/* Missing Mandatory Alert */}
      {statusSummary && statusSummary.missing_mandatory && statusSummary.missing_mandatory.length > 0 && (
        <div className="rdocs-alert">
          <HiOutlineExclamation />
          <div>
            <strong>Missing mandatory documents:</strong>
            <span>{statusSummary.missing_mandatory.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rdocs-error">
          <HiOutlineExclamation /> {error}
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Documents List */}
      <div className="rdocs-list">
        {documents.map((doc) => {
          const statusConfig = STATUS_CONFIG[doc.status];
          const isUploading = uploadingDocId === doc.id;

          return (
            <div
              key={doc.id}
              className={`rdocs-item ${doc.status} ${doc.is_mandatory ? 'mandatory' : ''}`}
            >
              {/* Document Icon */}
              <div className="rdocs-item-icon">
                <HiOutlineDocumentText />
              </div>

              {/* Document Info */}
              <div className="rdocs-item-info">
                <div className="rdocs-item-header">
                  <h4>
                    {doc.document_name}
                    {doc.is_mandatory && <span className="rdocs-mandatory">*Required</span>}
                  </h4>
                  {doc.document_name_hindi && (
                    <span className="rdocs-hindi">{doc.document_name_hindi}</span>
                  )}
                </div>

                <div className="rdocs-item-meta">
                  <span className="rdocs-item-type">{doc.document_type}</span>
                  {doc.accepted_formats && (
                    <span className="rdocs-item-formats">
                      {doc.accepted_formats.join(', ').toUpperCase()}
                    </span>
                  )}
                  {doc.max_size_mb && (
                    <span className="rdocs-item-size">Max {doc.max_size_mb}MB</span>
                  )}
                </div>

                {doc.description && (
                  <p className="rdocs-item-desc">{doc.description}</p>
                )}

                {doc.sample_url && (
                  <a href={doc.sample_url} target="_blank" rel="noopener noreferrer" className="rdocs-sample-link">
                    <HiOutlineExternalLink /> View Sample
                  </a>
                )}

                {/* Rejection Reason */}
                {doc.status === 'rejected' && doc.rejection_reason && (
                  <div className="rdocs-rejection">
                    <HiOutlineExclamation />
                    <span>{doc.rejection_reason}</span>
                  </div>
                )}

                {/* Uploaded Document Preview */}
                {doc.uploaded_document && (
                  <div className="rdocs-uploaded">
                    <span className="rdocs-uploaded-name">
                      {doc.uploaded_document.original_filename || 'Document uploaded'}
                    </span>
                    <div className="rdocs-uploaded-actions">
                      {doc.uploaded_document.file_url && (
                        <>
                          <a
                            href={doc.uploaded_document.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rdocs-view-btn"
                          >
                            <HiOutlineEye /> View
                          </a>
                          <a
                            href={doc.uploaded_document.file_url}
                            download
                            className="rdocs-download-btn"
                          >
                            <HiOutlineDownload />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div
                className="rdocs-item-status"
                style={{ color: statusConfig.color, backgroundColor: statusConfig.bgColor }}
              >
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </div>

              {/* Actions */}
              <div className="rdocs-item-actions">
                {/* Upload Button */}
                {canUpload && (doc.status === 'pending' || doc.status === 'rejected') && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={doc.accepted_formats?.map(f => `.${f}`).join(',')}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(doc.id, file);
                      }}
                    />
                    <button
                      className="rdocs-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <HiOutlineUpload />
                          {doc.status === 'rejected' ? 'Re-upload' : 'Upload'}
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* Verify/Reject Buttons */}
                {canVerify && doc.status === 'uploaded' && (
                  <div className="rdocs-verify-btns">
                    <button
                      className="rdocs-verify-btn approve"
                      onClick={() => {
                        setVerifyModal({ isOpen: true, document: doc });
                        setVerifyAction('verify');
                      }}
                    >
                      <HiOutlineCheckCircle /> Verify
                    </button>
                    <button
                      className="rdocs-verify-btn reject"
                      onClick={() => {
                        setVerifyModal({ isOpen: true, document: doc });
                        setVerifyAction('reject');
                      }}
                    >
                      <HiOutlineXCircle /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Verify Modal */}
      {verifyModal.isOpen && verifyModal.document && (
        <div className="rdocs-modal-overlay" onClick={() => setVerifyModal({ isOpen: false, document: null })}>
          <div className="rdocs-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {verifyAction === 'verify' ? 'Verify Document' : 'Reject Document'}
            </h3>

            <div className="rdocs-modal-doc">
              <HiOutlineDocumentText />
              <span>{verifyModal.document.document_name}</span>
            </div>

            {verifyAction === 'reject' && (
              <div className="rdocs-modal-field">
                <label>Rejection Reason (Required):</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this document is being rejected..."
                  rows={3}
                />
              </div>
            )}

            {verifyAction === 'verify' && (
              <p className="rdocs-modal-confirm">
                Are you sure you want to verify this document? This will mark it as accepted.
              </p>
            )}

            <div className="rdocs-modal-actions">
              <button
                className="rdocs-modal-btn cancel"
                onClick={() => setVerifyModal({ isOpen: false, document: null })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className={`rdocs-modal-btn ${verifyAction}`}
                onClick={handleVerify}
                disabled={actionLoading || (verifyAction === 'reject' && !rejectionReason.trim())}
              >
                {actionLoading ? 'Processing...' : verifyAction === 'verify' ? 'Verify' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequiredDocuments;
