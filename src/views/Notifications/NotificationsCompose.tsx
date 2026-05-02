import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlinePaperAirplane, HiOutlineArrowLeft,
  HiOutlineUserGroup, HiOutlineUser, HiOutlineGlobe, HiOutlineSpeakerphone,
  HiOutlineExclamation, HiOutlineInformationCircle, HiOutlineCheckCircle,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/components/common/Toast/ToastContext';
import {
  publish, fetchTemplates,
  type Category, type Severity, type AudienceSpec, type Template,
} from '@/services/notifications/notificationsStore';
import { STAFF_DIRECTORY } from '@/services/planner/plannerStore';
import './NotificationsCompose.scss';

type AudienceMode = 'all' | 'roles' | 'states' | 'specific';

const ROLES = ['admin', 'state_head', 'district_manager', 'caseworker', 'agent', 'verifier', 'service_manager', 'support', 'finance', 'supervisor'];

const CATEGORIES: { v: Category; label: string }[] = [
  { v: 'announcement', label: 'Announcement' },
  { v: 'operations',   label: 'Operations'   },
  { v: 'task',         label: 'Task'         },
  { v: 'system',       label: 'System'       },
  { v: 'financial',    label: 'Financial'    },
  { v: 'mention',      label: 'Mention'      },
];

const SEVERITIES: { v: Severity; label: string; icon: React.ReactNode }[] = [
  { v: 'info',     label: 'Info',     icon: <HiOutlineInformationCircle /> },
  { v: 'success',  label: 'Success',  icon: <HiOutlineCheckCircle />        },
  { v: 'warning',  label: 'Warning',  icon: <HiOutlineExclamation />        },
  { v: 'critical', label: 'Critical', icon: <HiOutlineExclamation />        },
];

const NotificationsCompose = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category>('announcement');
  const [severity, setSeverity] = useState<Severity>('info');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>(['KA']);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    void fetchTemplates().then(setTemplates);
  }, []);

  const valid = title.trim().length >= 3 && (
    audienceMode === 'all' ||
    (audienceMode === 'roles' && selectedRoles.length > 0) ||
    (audienceMode === 'states' && selectedStates.length > 0) ||
    (audienceMode === 'specific' && selectedStaff.length > 0)
  );

  const audienceSummary = (): string => {
    if (audienceMode === 'all') return 'Everyone';
    if (audienceMode === 'roles') return `${selectedRoles.length} role${selectedRoles.length === 1 ? '' : 's'}`;
    if (audienceMode === 'states') return `${selectedStates.length} state${selectedStates.length === 1 ? '' : 's'}`;
    return `${selectedStaff.length} specific staff`;
  };

  const buildAudience = (): AudienceSpec => {
    if (audienceMode === 'all')      return { allStaff: true };
    if (audienceMode === 'roles')    return { roles: selectedRoles };
    if (audienceMode === 'states')   return { stateCodes: selectedStates };
    return { staffIds: selectedStaff };
  };

  const handleApplyTemplate = (t: Template) => {
    setCategory(t.category);
    setSeverity(t.severity);
    setTitle(t.titleTemplate.replace(/\{\{[^}]+\}\}/g, '___'));
    setBody(t.bodyTemplate.replace(/\{\{[^}]+\}\}/g, '___'));
  };

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    const result = await publish({
      category,
      severity,
      title: title.trim(),
      body: body.trim() || undefined,
      actionUrl: actionUrl.trim() || undefined,
      actionLabel: actionLabel.trim() || undefined,
      audience: buildAudience(),
      sourceType: 'manual',
    });
    setSubmitting(false);
    if (result) {
      toast.success(
        `Notification sent`,
        `Delivered to ${result.recipientCount} recipient${result.recipientCount === 1 ? '' : 's'}`
      );
      navigate('/notifications');
    } else {
      toast.error(
        'Could not send notification',
        'The notifications backend may not be reachable. Try again or check the migration is applied.'
      );
    }
  };

  const toggleInArray = (arr: string[], v: string): string[] =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  return (
    <div className="bm-compose">
      <PageHeader
        icon={<HiOutlineSpeakerphone />}
        title="Compose notification"
        description="Send an in-app notification to one staff, a role, a state, or everyone."
        actions={
          <Link to="/notifications" className="bm-btn">
            <HiOutlineArrowLeft /> Back to inbox
          </Link>
        }
      />

      <div className="bm-compose-grid">
        {/* Left: form */}
        <div className="bm-compose-card">
          {/* Category + severity */}
          <div className="bm-compose-row-inline">
            <label>
              <span>Category</span>
              <select value={category} onChange={e => setCategory(e.target.value as Category)}>
                {CATEGORIES.map(c => <option key={c.v} value={c.v}>{c.label}</option>)}
              </select>
            </label>
            <label>
              <span>Severity</span>
              <div className="bm-compose-sev-row">
                {SEVERITIES.map(s => (
                  <button
                    key={s.v}
                    type="button"
                    className={`bm-compose-sev sev-${s.v} ${severity === s.v ? 'active' : ''}`}
                    onClick={() => setSeverity(s.v)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <label className="bm-compose-field">
            <span>Title <em>*</em></span>
            <input
              type="text"
              maxLength={120}
              placeholder="e.g. Maintenance window tonight 11 PM – 12 AM"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <small>{title.length}/120</small>
          </label>

          <label className="bm-compose-field">
            <span>Body <small>(optional)</small></span>
            <textarea
              rows={4}
              placeholder="More details, instructions, or context."
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </label>

          <div className="bm-compose-row-inline">
            <label className="bm-compose-field">
              <span>Action URL <small>(optional)</small></span>
              <input
                type="text"
                placeholder="/services/aadhaar-download"
                value={actionUrl}
                onChange={e => setActionUrl(e.target.value)}
              />
            </label>
            <label className="bm-compose-field">
              <span>Action label</span>
              <input
                type="text"
                placeholder="View service"
                value={actionLabel}
                onChange={e => setActionLabel(e.target.value)}
              />
            </label>
          </div>

          {/* Audience picker */}
          <div className="bm-compose-section">
            <h4>Who receives this?</h4>
            <div className="bm-compose-aud-tabs">
              <button
                className={`bm-compose-aud-tab ${audienceMode === 'all' ? 'active' : ''}`}
                onClick={() => setAudienceMode('all')}
              >
                <HiOutlineUserGroup /> Everyone
              </button>
              <button
                className={`bm-compose-aud-tab ${audienceMode === 'roles' ? 'active' : ''}`}
                onClick={() => setAudienceMode('roles')}
              >
                By role
              </button>
              <button
                className={`bm-compose-aud-tab ${audienceMode === 'states' ? 'active' : ''}`}
                onClick={() => setAudienceMode('states')}
              >
                <HiOutlineGlobe /> By state
              </button>
              <button
                className={`bm-compose-aud-tab ${audienceMode === 'specific' ? 'active' : ''}`}
                onClick={() => setAudienceMode('specific')}
              >
                <HiOutlineUser /> Specific people
              </button>
            </div>

            {audienceMode === 'roles' && (
              <div className="bm-compose-chips">
                {ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`bm-compose-chip ${selectedRoles.includes(r) ? 'active' : ''}`}
                    onClick={() => setSelectedRoles(toggleInArray(selectedRoles, r))}
                  >
                    {r.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}

            {audienceMode === 'states' && (
              <div className="bm-compose-chips">
                {['KA','MH','TN','TG','KL','AP','GJ','RJ','UP','BR','WB','OR','MP','PB','HR'].map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`bm-compose-chip ${selectedStates.includes(s) ? 'active' : ''}`}
                    onClick={() => setSelectedStates(toggleInArray(selectedStates, s))}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {audienceMode === 'specific' && (
              <div className="bm-compose-chips">
                {STAFF_DIRECTORY.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`bm-compose-chip ${selectedStaff.includes(s.id) ? 'active' : ''}`}
                    onClick={() => setSelectedStaff(toggleInArray(selectedStaff, s.id))}
                    style={selectedStaff.includes(s.id) ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
                  >
                    <span className="bm-compose-chip-dot" style={{ background: s.color }} />
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="bm-compose-actions">
            <span className="bm-compose-summary">
              Sending to <strong>{audienceSummary()}</strong>
            </span>
            <button
              className="bm-btn bm-btn-primary"
              disabled={!valid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Sending…' : <><HiOutlinePaperAirplane /> Send notification</>}
            </button>
          </div>
        </div>

        {/* Right: preview + templates */}
        <aside className="bm-compose-side">
          <div className="bm-compose-card bm-compose-preview">
            <h4>Preview</h4>
            <div className={`bm-compose-preview-row sev-${severity}`}>
              <div className="bm-compose-preview-bar" />
              <div className="bm-compose-preview-body">
                <div className="bm-compose-preview-title">
                  {title || 'Your notification title will appear here'}
                </div>
                {body && <div className="bm-compose-preview-text">{body}</div>}
                {actionUrl && actionLabel && (
                  <div className="bm-compose-preview-action">→ {actionLabel}</div>
                )}
                <div className="bm-compose-preview-meta">
                  {category} · {severity} · just now
                </div>
              </div>
            </div>
          </div>

          <div className="bm-compose-card">
            <h4>Quick templates</h4>
            <p className="bm-compose-card-sub">Click to fill the form. Replace ___ with real values.</p>
            <div className="bm-compose-templates">
              {templates.length === 0 ? (
                <small className="bm-compose-tpl-empty">No templates loaded yet — backend may need migration 214.</small>
              ) : templates.slice(0, 6).map(t => (
                <button
                  key={t.id}
                  type="button"
                  className="bm-compose-tpl"
                  onClick={() => handleApplyTemplate(t)}
                >
                  <strong>{t.label}</strong>
                  <small>{t.titleTemplate}</small>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NotificationsCompose;
