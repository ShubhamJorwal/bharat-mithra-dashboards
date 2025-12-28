import { useState } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlinePlay,
  HiOutlineArrowRight,
  HiOutlineRewind,
  HiOutlineXCircle,
  HiOutlineRefresh
} from 'react-icons/hi';
import type {
  ApplicationWorkflowProgress,
  WorkflowStepStatus,
  WorkflowAdvanceRequest
} from '../../../types/api.types';
import applicationsApi from '../../../services/api/applications.api';
import './WorkflowProgress.scss';

interface WorkflowProgressProps {
  applicationId: string;
  workflowSteps: ApplicationWorkflowProgress[];
  currentStep: number;
  totalSteps: number;
  canManage?: boolean;
  onRefresh?: () => void;
}

const STEP_STATUS_CONFIG: Record<WorkflowStepStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <HiOutlineClock />, color: '#6b7280' },
  in_progress: { label: 'In Progress', icon: <HiOutlinePlay />, color: '#3b82f6' },
  completed: { label: 'Completed', icon: <HiOutlineCheckCircle />, color: '#10b981' },
  skipped: { label: 'Skipped', icon: <HiOutlineArrowRight />, color: '#9ca3af' }
};

const STEP_TYPE_LABELS: Record<string, string> = {
  manual: 'Manual',
  automatic: 'Automatic',
  verification: 'Verification',
  approval: 'Approval'
};

const WorkflowProgress = ({
  applicationId,
  workflowSteps,
  currentStep,
  totalSteps,
  canManage = false,
  onRefresh
}: WorkflowProgressProps) => {
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'advance' | 'send_back' | 'reject' | null;
    step: ApplicationWorkflowProgress | null;
  }>({ isOpen: false, type: null, step: null });
  const [actionRemarks, setActionRemarks] = useState('');
  const [sendBackTo, setSendBackTo] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    const completedSteps = workflowSteps.filter(s => s.step_status === 'completed').length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const handleAdvance = async () => {
    if (!actionModal.step) return;
    setActionLoading(true);
    setError(null);

    try {
      const data: WorkflowAdvanceRequest = { remarks: actionRemarks };
      const response = await applicationsApi.advanceWorkflow(applicationId, data);
      if (response.success) {
        setActionModal({ isOpen: false, type: null, step: null });
        setActionRemarks('');
        onRefresh?.();
      } else {
        setError(response.message || 'Failed to advance workflow');
      }
    } catch (err) {
      console.error('Failed to advance workflow:', err);
      setError('Failed to advance workflow');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendBack = async () => {
    if (!actionModal.step) return;
    setActionLoading(true);
    setError(null);

    try {
      const data: WorkflowAdvanceRequest = {
        send_back: true,
        send_back_to: sendBackTo,
        remarks: actionRemarks
      };
      const response = await applicationsApi.advanceWorkflow(applicationId, data);
      if (response.success) {
        setActionModal({ isOpen: false, type: null, step: null });
        setActionRemarks('');
        setSendBackTo(1);
        onRefresh?.();
      } else {
        setError(response.message || 'Failed to send back');
      }
    } catch (err) {
      console.error('Failed to send back:', err);
      setError('Failed to send back');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionModal.step) return;
    setActionLoading(true);
    setError(null);

    try {
      const data: WorkflowAdvanceRequest = {
        reject_reason: actionRemarks
      };
      const response = await applicationsApi.advanceWorkflow(applicationId, data);
      if (response.success) {
        setActionModal({ isOpen: false, type: null, step: null });
        setActionRemarks('');
        onRefresh?.();
      } else {
        setError(response.message || 'Failed to reject');
      }
    } catch (err) {
      console.error('Failed to reject:', err);
      setError('Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className="wfp">
      {/* Progress Header */}
      <div className="wfp-header">
        <div className="wfp-header-info">
          <h3>Workflow Progress</h3>
          <p>Step {currentStep} of {totalSteps}</p>
        </div>
        <div className="wfp-header-actions">
          <div className="wfp-progress-bar">
            <div className="wfp-progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <span className="wfp-progress-text">{progressPercentage}% Complete</span>
          {onRefresh && (
            <button className="wfp-refresh-btn" onClick={onRefresh} title="Refresh">
              <HiOutlineRefresh />
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="wfp-timeline">
        {workflowSteps.map((step, index) => {
          const statusConfig = STEP_STATUS_CONFIG[step.step_status];
          const isActive = step.step_status === 'in_progress';
          const isCompleted = step.step_status === 'completed';
          const isPending = step.step_status === 'pending';

          return (
            <div
              key={step.id}
              className={`wfp-step ${step.step_status} ${isActive ? 'active' : ''}`}
            >
              {/* Connector Line */}
              {index < workflowSteps.length - 1 && (
                <div className={`wfp-step-connector ${isCompleted ? 'completed' : ''}`}></div>
              )}

              {/* Step Icon */}
              <div
                className="wfp-step-icon"
                style={{
                  backgroundColor: isActive ? statusConfig.color : isCompleted ? statusConfig.color : undefined,
                  borderColor: statusConfig.color,
                  color: isActive || isCompleted ? '#fff' : statusConfig.color
                }}
              >
                {statusConfig.icon}
              </div>

              {/* Step Content */}
              <div className="wfp-step-content">
                <div className="wfp-step-header">
                  <h4>{step.step_name}</h4>
                  {step.step_name_hindi && (
                    <span className="wfp-step-hindi">{step.step_name_hindi}</span>
                  )}
                </div>

                <div className="wfp-step-meta">
                  <span
                    className="wfp-step-status"
                    style={{ color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </span>
                  <span className="wfp-step-type">
                    {STEP_TYPE_LABELS[step.step_type] || step.step_type}
                  </span>
                  {step.assigned_role && (
                    <span className="wfp-step-role">
                      {step.assigned_role}
                    </span>
                  )}
                </div>

                {step.step_description && (
                  <p className="wfp-step-desc">{step.step_description}</p>
                )}

                {/* Timing Info */}
                <div className="wfp-step-timing">
                  {step.started_at && (
                    <span>Started: {formatDate(step.started_at)}</span>
                  )}
                  {step.completed_at && (
                    <span>Completed: {formatDate(step.completed_at)}</span>
                  )}
                  {step.completed_by_name && (
                    <span>By: {step.completed_by_name}</span>
                  )}
                </div>

                {/* SLA Warning */}
                {step.sla_deadline && isPending && (
                  <div className={`wfp-step-sla ${step.sla_breached ? 'breached' : ''}`}>
                    <HiOutlineClock />
                    <span>
                      SLA: {formatDate(step.sla_deadline)}
                      {step.sla_breached && ' (Breached)'}
                    </span>
                  </div>
                )}

                {step.sla_breached && isActive && (
                  <div className="wfp-step-sla breached">
                    <HiOutlineExclamation />
                    <span>SLA Breached!</span>
                  </div>
                )}

                {/* Remarks */}
                {step.remarks && (
                  <div className="wfp-step-remarks">
                    <strong>Remarks:</strong> {step.remarks}
                  </div>
                )}

                {/* Actions for current step */}
                {canManage && isActive && (
                  <div className="wfp-step-actions">
                    <button
                      className="wfp-action-btn advance"
                      onClick={() => setActionModal({ isOpen: true, type: 'advance', step })}
                    >
                      <HiOutlineCheckCircle /> Complete Step
                    </button>
                    {step.can_send_back && (
                      <button
                        className="wfp-action-btn send-back"
                        onClick={() => setActionModal({ isOpen: true, type: 'send_back', step })}
                      >
                        <HiOutlineRewind /> Send Back
                      </button>
                    )}
                    {step.can_reject && (
                      <button
                        className="wfp-action-btn reject"
                        onClick={() => setActionModal({ isOpen: true, type: 'reject', step })}
                      >
                        <HiOutlineXCircle /> Reject
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="wfp-modal-overlay" onClick={() => setActionModal({ isOpen: false, type: null, step: null })}>
          <div className="wfp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {actionModal.type === 'advance' && 'Complete Step'}
              {actionModal.type === 'send_back' && 'Send Back'}
              {actionModal.type === 'reject' && 'Reject Application'}
            </h3>

            {error && (
              <div className="wfp-modal-error">
                <HiOutlineExclamation /> {error}
              </div>
            )}

            {actionModal.type === 'send_back' && (
              <div className="wfp-modal-field">
                <label>Send back to step:</label>
                <select
                  value={sendBackTo}
                  onChange={(e) => setSendBackTo(Number(e.target.value))}
                >
                  {workflowSteps
                    .filter(s => s.step_number < (actionModal.step?.step_number || 0))
                    .map(s => (
                      <option key={s.step_number} value={s.step_number}>
                        Step {s.step_number}: {s.step_name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="wfp-modal-field">
              <label>
                Remarks {actionModal.type === 'reject' ? '(Required)' : '(Optional)'}:
              </label>
              <textarea
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                placeholder={
                  actionModal.type === 'advance'
                    ? 'Enter any notes about this step completion...'
                    : actionModal.type === 'send_back'
                    ? 'Explain why this needs to go back...'
                    : 'Provide rejection reason...'
                }
                rows={3}
              />
            </div>

            <div className="wfp-modal-actions">
              <button
                className="wfp-modal-btn cancel"
                onClick={() => setActionModal({ isOpen: false, type: null, step: null })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className={`wfp-modal-btn ${actionModal.type}`}
                onClick={
                  actionModal.type === 'advance'
                    ? handleAdvance
                    : actionModal.type === 'send_back'
                    ? handleSendBack
                    : handleReject
                }
                disabled={actionLoading || (actionModal.type === 'reject' && !actionRemarks.trim())}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowProgress;
