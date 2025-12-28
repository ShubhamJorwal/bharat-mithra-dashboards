import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamation,
  HiOutlineRefresh,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import type { ApplicationEligibilityCheck } from '../../../types/api.types';
import './EligibilityChecks.scss';

interface EligibilityChecksProps {
  eligibilityChecks: ApplicationEligibilityCheck[];
  passed: boolean;
  onRecheck?: () => void;
  loading?: boolean;
}

const RULE_TYPE_LABELS: Record<string, string> = {
  age: 'Age',
  income: 'Income',
  residence: 'Residence',
  caste: 'Caste Category',
  gender: 'Gender',
  education: 'Education',
  occupation: 'Occupation',
  marital_status: 'Marital Status',
  bpl: 'BPL Status',
  disability: 'Disability',
  document: 'Document'
};

const OPERATOR_LABELS: Record<string, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  greater_than: 'is greater than',
  less_than: 'is less than',
  greater_than_equals: 'is at least',
  less_than_equals: 'is at most',
  in: 'is one of',
  not_in: 'is not one of',
  contains: 'contains',
  not_contains: 'does not contain',
  between: 'is between',
  exists: 'exists',
  not_exists: 'does not exist'
};

const EligibilityChecks = ({
  eligibilityChecks,
  passed,
  onRecheck,
  loading = false
}: EligibilityChecksProps) => {
  const passedCount = eligibilityChecks.filter(c => c.check_result).length;
  const failedCount = eligibilityChecks.filter(c => !c.check_result).length;

  const formatRuleDescription = (check: ApplicationEligibilityCheck): string => {
    const ruleType = RULE_TYPE_LABELS[check.rule_type] || check.rule_type;
    const operator = check.rule_operator ? (OPERATOR_LABELS[check.rule_operator] || check.rule_operator) : '';
    return `${ruleType} ${operator} ${check.rule_value}`.trim();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (eligibilityChecks.length === 0) {
    return (
      <div className="elc">
        <div className="elc-empty">
          <HiOutlineShieldCheck />
          <h4>No Eligibility Rules</h4>
          <p>This service has no eligibility requirements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="elc">
      {/* Header */}
      <div className="elc-header">
        <div className="elc-header-info">
          <h3>Eligibility Check</h3>
          <p>{passedCount} passed, {failedCount} failed of {eligibilityChecks.length} rules</p>
        </div>
        <div className="elc-header-actions">
          {/* Status Badge */}
          <div className={`elc-status-badge ${passed ? 'passed' : 'failed'}`}>
            {passed ? (
              <>
                <HiOutlineCheckCircle /> Eligible
              </>
            ) : (
              <>
                <HiOutlineXCircle /> Not Eligible
              </>
            )}
          </div>
          {onRecheck && (
            <button
              className="elc-recheck-btn"
              onClick={onRecheck}
              disabled={loading}
              title="Re-check eligibility"
            >
              <HiOutlineRefresh className={loading ? 'spinning' : ''} />
              {loading ? 'Checking...' : 'Re-check'}
            </button>
          )}
        </div>
      </div>

      {/* Failed Alert */}
      {!passed && (
        <div className="elc-alert">
          <HiOutlineExclamation />
          <div>
            <strong>Eligibility requirements not met</strong>
            <span>The applicant does not meet all the eligibility criteria for this service.</span>
          </div>
        </div>
      )}

      {/* Checks List */}
      <div className="elc-list">
        {eligibilityChecks.map((check) => (
          <div
            key={check.id}
            className={`elc-item ${check.check_result ? 'passed' : 'failed'}`}
          >
            {/* Status Icon */}
            <div className={`elc-item-icon ${check.check_result ? 'passed' : 'failed'}`}>
              {check.check_result ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />}
            </div>

            {/* Content */}
            <div className="elc-item-content">
              <div className="elc-item-header">
                <span className="elc-item-type">
                  {RULE_TYPE_LABELS[check.rule_type] || check.rule_type}
                </span>
                <span className={`elc-item-result ${check.check_result ? 'passed' : 'failed'}`}>
                  {check.check_result ? 'Passed' : 'Failed'}
                </span>
              </div>

              <p className="elc-item-rule">{formatRuleDescription(check)}</p>

              <div className="elc-item-values">
                <div className="elc-item-value">
                  <span className="elc-item-label">Required:</span>
                  <span className="elc-item-data">{check.rule_value}</span>
                </div>
                {check.applicant_value && (
                  <div className="elc-item-value">
                    <span className="elc-item-label">Applicant:</span>
                    <span className={`elc-item-data ${check.check_result ? 'match' : 'mismatch'}`}>
                      {check.applicant_value}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Message for Failed Checks */}
              {!check.check_result && check.error_message && (
                <div className="elc-item-error">
                  <HiOutlineExclamation />
                  <div>
                    <span>{check.error_message}</span>
                    {check.error_message_hindi && (
                      <span className="hindi">{check.error_message_hindi}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              {check.checked_at && (
                <span className="elc-item-time">Checked: {formatDate(check.checked_at)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EligibilityChecks;
