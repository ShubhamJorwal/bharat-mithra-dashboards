import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlinePaperAirplane, HiOutlineArrowLeft,
  HiOutlineUserGroup, HiOutlineUser, HiOutlineGlobe,
  HiOutlineSpeakerphone, HiOutlineLightningBolt, HiOutlineCheck,
  HiOutlineExclamation, HiOutlineInformationCircle, HiOutlineCheckCircle,
  HiOutlineMail, HiOutlineDeviceMobile, HiOutlineChat, HiOutlineBell,
  HiOutlinePlus, HiOutlineTrash, HiOutlineClock, HiOutlineCalendar,
  HiOutlineRefresh, HiOutlineSparkles, HiOutlineEye, HiOutlineSave,
  HiOutlineLink, HiOutlineThumbUp, HiOutlineExternalLink,
} from 'react-icons/hi';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/components/common/Toast/ToastContext';
import {
  publish, fetchTemplates, fetchPresets, estimateAudience, upsertPreset,
  type Category, type Severity, type AudienceSpec, type Template,
  type AudiencePreset, type Channel, type NotificationAction, type ActionStyle,
} from '@/services/notifications/notificationsStore';
import { STAFF_DIRECTORY } from '@/services/planner/plannerStore';
import './NotificationsCompose.scss';

// ─── Catalogs ────────────────────────────────────────────────────────

const ROLES = [
  { v: 'admin',            label: 'Admins',            icon: '🛡️' },
  { v: 'state_head',       label: 'State heads',       icon: '🏛️' },
  { v: 'district_manager', label: 'District managers', icon: '🗺️' },
  { v: 'caseworker',       label: 'Caseworkers',       icon: '📂' },
  { v: 'agent',            label: 'Field agents',      icon: '🚜' },
  { v: 'verifier',         label: 'Verifiers',         icon: '✓'  },
  { v: 'service_manager',  label: 'Service managers',  icon: '⚙️' },
  { v: 'support',          label: 'Support team',      icon: '💬' },
  { v: 'finance',          label: 'Finance',           icon: '💰' },
  { v: 'supervisor',       label: 'Supervisors',       icon: '👁️' },
];

const STATES = [
  'KA','MH','TN','TG','KL','AP','GJ','RJ','UP','BR','WB','OR','MP','PB','HR','DL','UK','AS','JH','CG',
];

const CATEGORIES: { v: Category; label: string; emoji: string; color: string }[] = [
  { v: 'announcement', label: 'Announcement', emoji: '📢', color: '#a855f7' },
  { v: 'operations',   label: 'Operations',   emoji: '⚙️', color: '#3b82f6' },
  { v: 'task',         label: 'Task',         emoji: '📋', color: '#f59e0b' },
  { v: 'system',       label: 'System',       emoji: '🔧', color: '#6b7280' },
  { v: 'financial',    label: 'Financial',    emoji: '💰', color: '#22c55e' },
  { v: 'mention',      label: 'Mention',      emoji: '@',  color: '#ec4899' },
];

const SEVERITIES: { v: Severity; label: string; icon: React.ReactNode; color: string }[] = [
  { v: 'info',     label: 'Info',     icon: <HiOutlineInformationCircle />, color: '#3b82f6' },
  { v: 'success',  label: 'Success',  icon: <HiOutlineCheckCircle />,        color: '#22c55e' },
  { v: 'warning',  label: 'Warning',  icon: <HiOutlineExclamation />,        color: '#f59e0b' },
  { v: 'critical', label: 'Critical', icon: <HiOutlineExclamation />,        color: '#ef4444' },
];

const CHANNELS: { v: Channel; label: string; icon: React.ReactNode; sublabel: string; ready: boolean }[] = [
  { v: 'in_app',   label: 'In-app',   icon: <HiOutlineBell />,         sublabel: 'Bell + inbox', ready: true  },
  { v: 'email',    label: 'Email',    icon: <HiOutlineMail />,         sublabel: 'Via SES',      ready: false },
  { v: 'sms',      label: 'SMS',      icon: <HiOutlineDeviceMobile />, sublabel: 'Via MSG91',    ready: false },
  { v: 'whatsapp', label: 'WhatsApp', icon: <HiOutlineChat />,         sublabel: 'Via Gupshup',  ready: false },
  { v: 'push',     label: 'Push',     icon: <HiOutlineLightningBolt />,sublabel: 'Browser/FCM',  ready: false },
];

const ACTION_STYLES: { v: ActionStyle; label: string; color: string }[] = [
  { v: 'primary', label: 'Primary', color: '#3b82f6' },
  { v: 'success', label: 'Success', color: '#22c55e' },
  { v: 'danger',  label: 'Danger',  color: '#ef4444' },
  { v: 'ghost',   label: 'Ghost',   color: '#6b7280' },
];

// ─── Audience modes ──────────────────────────────────────────────────

type AudienceMode = 'preset' | 'all' | 'roles' | 'states' | 'specific';

// ─── Step indicator ──────────────────────────────────────────────────

const STEPS = [
  { key: 'audience', label: 'Audience',  icon: <HiOutlineUserGroup /> },
  { key: 'message',  label: 'Message',   icon: <HiOutlineSpeakerphone /> },
  { key: 'actions',  label: 'Actions',   icon: <HiOutlineLightningBolt /> },
  { key: 'schedule', label: 'Schedule',  icon: <HiOutlineClock /> },
];
type StepKey = typeof STEPS[number]['key'];

// ─── Component ───────────────────────────────────────────────────────

const NotificationsCompose = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<StepKey>('audience');

  // Audience
  const [audMode, setAudMode] = useState<AudienceMode>('preset');
  const [presetId, setPresetId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>(['KA']);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [presets, setPresets] = useState<AudiencePreset[]>([]);
  const [estCount, setEstCount] = useState<number>(0);
  const [estimating, setEstimating] = useState(false);

  // Message
  const [category, setCategory] = useState<Category>('announcement');
  const [severity, setSeverity] = useState<Severity>('info');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [navigateTo, setNavigateTo] = useState('');

  // Actions
  const [actions, setActions] = useState<NotificationAction[]>([]);

  // Channels + scheduling
  const [channels, setChannels] = useState<Channel[]>(['in_app']);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later' | 'recurring'>('now');
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceUntil, setRecurrenceUntil] = useState<string>('');

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetDraftName, setPresetDraftName] = useState('');

  // Bootstrap data
  useEffect(() => {
    void fetchTemplates().then(setTemplates);
    void fetchPresets().then((p) => {
      setPresets(p);
      if (p.length > 0 && !presetId) setPresetId(p[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build the audience spec from current state
  const currentAudience: AudienceSpec = useMemo(() => {
    if (audMode === 'preset') {
      const p = presets.find(x => x.id === presetId);
      return p?.spec || { allStaff: false };
    }
    if (audMode === 'all')      return { allStaff: true };
    if (audMode === 'roles')    return { roles: selectedRoles };
    if (audMode === 'states')   return { stateCodes: selectedStates };
    return { staffIds: selectedStaff };
  }, [audMode, presetId, presets, selectedRoles, selectedStates, selectedStaff]);

  // Live recipient estimate (debounced)
  useEffect(() => {
    let cancel = false;
    setEstimating(true);
    const t = setTimeout(async () => {
      const count = audMode === 'preset' && presetId
        ? await estimateAudience({ presetId })
        : await estimateAudience(currentAudience);
      if (cancel) return;
      setEstCount(count);
      setEstimating(false);
    }, 250);
    return () => { cancel = true; clearTimeout(t); };
  }, [currentAudience, audMode, presetId]);

  const audienceValid = (
    (audMode === 'preset' && !!presetId) ||
    audMode === 'all' ||
    (audMode === 'roles' && selectedRoles.length > 0) ||
    (audMode === 'states' && selectedStates.length > 0) ||
    (audMode === 'specific' && selectedStaff.length > 0)
  );
  const messageValid = title.trim().length >= 3;
  const allValid = audienceValid && messageValid && channels.length > 0;

  const audienceSummary = (): string => {
    if (audMode === 'preset') {
      const p = presets.find(x => x.id === presetId);
      return p ? p.name : '— pick a preset —';
    }
    if (audMode === 'all') return 'Everyone';
    if (audMode === 'roles')    return selectedRoles.map(r => ROLES.find(x => x.v === r)?.label || r).join(', ');
    if (audMode === 'states')   return selectedStates.join(', ');
    return `${selectedStaff.length} specific people`;
  };

  const handleApplyTemplate = (t: Template) => {
    setCategory(t.category);
    setSeverity(t.severity);
    setTitle(t.titleTemplate.replace(/\{\{[^}]+\}\}/g, '___'));
    setBody(t.bodyTemplate.replace(/\{\{[^}]+\}\}/g, '___'));
  };

  const toggleArr = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const addAction = () => {
    setActions(a => [
      ...a,
      { key: `act_${a.length + 1}`, label: 'New action', style: 'primary', handler: 'callback' },
    ]);
  };
  const updateAction = (idx: number, patch: Partial<NotificationAction>) => {
    setActions(a => a.map((x, i) => i === idx ? { ...x, ...patch } : x));
  };
  const removeAction = (idx: number) => setActions(a => a.filter((_, i) => i !== idx));

  const handleSavePreset = async () => {
    if (!presetDraftName.trim()) return;
    const saved = await upsertPreset({
      name: presetDraftName.trim(),
      spec: currentAudience,
      isShared: false,
    });
    if (saved) {
      const updated = await fetchPresets();
      setPresets(updated);
      setPresetId(saved.id);
      setAudMode('preset');
      toast.success('Audience saved', `"${saved.name}" is now in your presets`);
    } else {
      toast.error('Could not save preset');
    }
    setShowSavePreset(false);
    setPresetDraftName('');
  };

  const handleSubmit = async () => {
    if (!allValid) return;
    setSubmitting(true);
    const result = await publish({
      category,
      severity,
      title: title.trim(),
      body: body.trim() || undefined,
      actionUrl: navigateTo.trim() || undefined,
      actionLabel: navigateTo.trim() ? 'View' : undefined,
      actions,
      channels,
      audience: currentAudience,
      presetId: audMode === 'preset' ? (presetId ?? undefined) : undefined,
      scheduledFor: scheduleMode === 'later' ? new Date(scheduledFor).toISOString() : undefined,
      recurrence: scheduleMode === 'recurring' ? recurrence : 'none',
      recurrenceUntil: scheduleMode === 'recurring' && recurrenceUntil
        ? new Date(recurrenceUntil).toISOString()
        : undefined,
      sourceType: 'manual',
    });
    setSubmitting(false);
    if (result) {
      const verb = result.scheduleStatus === 'pending' ? 'scheduled' : 'sent';
      toast.success(
        `Notification ${verb}`,
        result.scheduleStatus === 'pending'
          ? `Will fire at ${new Date(scheduledFor).toLocaleString()}`
          : `Delivered to ${result.recipientCount} recipient${result.recipientCount === 1 ? '' : 's'}`
      );
      navigate('/notifications');
    } else {
      toast.error(
        'Could not send',
        'Backend may not be reachable, or the migration is not yet applied. Try again or check.'
      );
    }
  };

  const stepIdx = STEPS.findIndex(s => s.key === step);
  const goNext = () => setStep(STEPS[Math.min(stepIdx + 1, STEPS.length - 1)].key as StepKey);
  const goPrev = () => setStep(STEPS[Math.max(stepIdx - 1, 0)].key as StepKey);

  const canAdvance: Record<StepKey, boolean> = {
    audience: audienceValid,
    message:  messageValid,
    actions:  true,
    schedule: channels.length > 0,
  };

  return (
    <div className="bm-cmp">
      <PageHeader
        icon={<HiOutlineSpeakerphone />}
        title="Compose notification"
        description="Send rich, actionable updates to a targeted audience. Schedule for later or fire now."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/notifications/analytics" className="bm-btn">
              <HiOutlineEye /> Analytics
            </Link>
            <Link to="/notifications" className="bm-btn">
              <HiOutlineArrowLeft /> Inbox
            </Link>
          </div>
        }
      />

      {/* Step indicator */}
      <div className="bm-cmp-stepper">
        {STEPS.map((s, i) => {
          const active = s.key === step;
          const done = i < stepIdx;
          const ok = canAdvance[s.key as StepKey];
          return (
            <div key={s.key} className="bm-cmp-stepper-item">
              <button
                type="button"
                className={`bm-cmp-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                onClick={() => setStep(s.key as StepKey)}
              >
                <span className="bm-cmp-step-icon">
                  {done ? <HiOutlineCheck /> : s.icon}
                </span>
                <span className="bm-cmp-step-label">{s.label}</span>
                {!ok && active && <span className="bm-cmp-step-warn" />}
              </button>
              {i < STEPS.length - 1 && <span className={`bm-cmp-step-line ${done ? 'done' : ''}`} />}
            </div>
          );
        })}
      </div>

      <div className="bm-cmp-grid">
        {/* ────── LEFT: STEP CONTENT ────── */}
        <div className="bm-cmp-card">

          {/* ─── STEP 1: AUDIENCE ─── */}
          {step === 'audience' && (
            <>
              <div className="bm-cmp-section-head">
                <h3>Who receives this?</h3>
                <span className={`bm-cmp-recipient-pill ${estCount === 0 ? 'empty' : ''}`}>
                  <HiOutlineUserGroup />
                  {estimating ? '…' : <strong>{estCount}</strong>} {estCount === 1 ? 'person' : 'people'}
                </span>
              </div>

              <div className="bm-cmp-aud-tabs">
                <button className={`bm-cmp-aud-tab ${audMode === 'preset' ? 'active' : ''}`} onClick={() => setAudMode('preset')}>
                  <HiOutlineSparkles /> Saved presets
                </button>
                <button className={`bm-cmp-aud-tab ${audMode === 'all' ? 'active' : ''}`} onClick={() => setAudMode('all')}>
                  <HiOutlineUserGroup /> Everyone
                </button>
                <button className={`bm-cmp-aud-tab ${audMode === 'roles' ? 'active' : ''}`} onClick={() => setAudMode('roles')}>
                  By role
                </button>
                <button className={`bm-cmp-aud-tab ${audMode === 'states' ? 'active' : ''}`} onClick={() => setAudMode('states')}>
                  <HiOutlineGlobe /> By state
                </button>
                <button className={`bm-cmp-aud-tab ${audMode === 'specific' ? 'active' : ''}`} onClick={() => setAudMode('specific')}>
                  <HiOutlineUser /> Specific people
                </button>
              </div>

              {audMode === 'preset' && (
                <div className="bm-cmp-presets">
                  {presets.length === 0 ? (
                    <div className="bm-cmp-empty">
                      No presets yet. Pick a different mode above and save the audience as a preset for later.
                    </div>
                  ) : presets.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`bm-cmp-preset ${presetId === p.id ? 'active' : ''}`}
                      onClick={() => setPresetId(p.id)}
                      style={presetId === p.id && p.color ? { borderColor: p.color, background: `${p.color}10` } : {}}
                    >
                      <div className="bm-cmp-preset-icon" style={{ background: p.color || '#3b82f6' }}>
                        {p.icon || '📌'}
                      </div>
                      <div className="bm-cmp-preset-body">
                        <strong>{p.name}</strong>
                        {p.description && <small>{p.description}</small>}
                        <span className="bm-cmp-preset-meta">
                          Used {p.useCount}× {p.isShared ? '· shared' : ''}
                        </span>
                      </div>
                      {presetId === p.id && <HiOutlineCheck className="bm-cmp-preset-check" />}
                    </button>
                  ))}
                </div>
              )}

              {audMode === 'all' && (
                <div className="bm-cmp-info-box">
                  <HiOutlineExclamation />
                  <div>
                    <strong>Heads up</strong>
                    <p>This sends to every active staff member. Use for outage notices, holidays, or org-wide announcements only.</p>
                  </div>
                </div>
              )}

              {audMode === 'roles' && (
                <div className="bm-cmp-chips">
                  {ROLES.map(r => (
                    <button
                      key={r.v}
                      type="button"
                      className={`bm-cmp-chip ${selectedRoles.includes(r.v) ? 'active' : ''}`}
                      onClick={() => setSelectedRoles(toggleArr(selectedRoles, r.v))}
                    >
                      <span className="bm-cmp-chip-emoji">{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              )}

              {audMode === 'states' && (
                <div className="bm-cmp-chips">
                  {STATES.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`bm-cmp-chip ${selectedStates.includes(s) ? 'active' : ''}`}
                      onClick={() => setSelectedStates(toggleArr(selectedStates, s))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {audMode === 'specific' && (
                <div className="bm-cmp-staff-grid">
                  {STAFF_DIRECTORY.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={`bm-cmp-staff ${selectedStaff.includes(s.id) ? 'active' : ''}`}
                      onClick={() => setSelectedStaff(toggleArr(selectedStaff, s.id))}
                    >
                      <span className="bm-cmp-staff-avatar" style={{ background: s.color }}>
                        {s.initials}
                      </span>
                      <div>
                        <strong>{s.name}</strong>
                        <small>{s.role}</small>
                      </div>
                      {selectedStaff.includes(s.id) && <HiOutlineCheck />}
                    </button>
                  ))}
                </div>
              )}

              {/* Save as preset CTA */}
              {(audMode === 'roles' || audMode === 'states' || audMode === 'specific') && audienceValid && (
                <div className="bm-cmp-save-preset">
                  {!showSavePreset ? (
                    <button className="bm-btn-ghost" onClick={() => setShowSavePreset(true)}>
                      <HiOutlineSave /> Save this audience as a preset
                    </button>
                  ) : (
                    <div className="bm-cmp-save-row">
                      <input
                        autoFocus
                        placeholder="e.g. Bengaluru caseworkers"
                        value={presetDraftName}
                        onChange={e => setPresetDraftName(e.target.value)}
                      />
                      <button className="bm-btn bm-btn-primary" onClick={handleSavePreset} disabled={!presetDraftName.trim()}>
                        Save
                      </button>
                      <button className="bm-btn-ghost" onClick={() => setShowSavePreset(false)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ─── STEP 2: MESSAGE ─── */}
          {step === 'message' && (
            <>
              <h3>Compose message</h3>

              {/* Category & severity */}
              <div className="bm-cmp-row-2">
                <div className="bm-cmp-field">
                  <label>Category</label>
                  <div className="bm-cmp-cats">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.v}
                        type="button"
                        className={`bm-cmp-cat ${category === c.v ? 'active' : ''}`}
                        onClick={() => setCategory(c.v)}
                        style={category === c.v ? { borderColor: c.color, background: `${c.color}15`, color: c.color } : {}}
                      >
                        <span>{c.emoji}</span> {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bm-cmp-field">
                  <label>Severity</label>
                  <div className="bm-cmp-sevs">
                    {SEVERITIES.map(s => (
                      <button
                        key={s.v}
                        type="button"
                        className={`bm-cmp-sev sev-${s.v} ${severity === s.v ? 'active' : ''}`}
                        onClick={() => setSeverity(s.v)}
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="bm-cmp-field">
                <label>Title <em>*</em><small>{title.length}/120</small></label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Maintenance window tonight 11 PM – 12 AM"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* Body */}
              <div className="bm-cmp-field">
                <label>Body<small>(supports line breaks)</small></label>
                <textarea
                  rows={5}
                  placeholder="Add details, context, instructions…"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              </div>

              {/* Navigate-to URL (the headline link) */}
              <div className="bm-cmp-field">
                <label><HiOutlineLink /> When clicked, navigate to <small>(optional)</small></label>
                <input
                  type="text"
                  placeholder="/applications/123 or https://…"
                  value={navigateTo}
                  onChange={e => setNavigateTo(e.target.value)}
                />
              </div>

              {/* Templates */}
              <div className="bm-cmp-templates-block">
                <h4>Quick templates</h4>
                <div className="bm-cmp-tpl-row">
                  {templates.length === 0 ? (
                    <small className="bm-cmp-tpl-empty">Templates load once migration 214 is applied.</small>
                  ) : templates.slice(0, 8).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className="bm-cmp-tpl"
                      onClick={() => handleApplyTemplate(t)}
                      title={t.titleTemplate}
                    >
                      <strong>{t.label}</strong>
                      <small>{t.category}</small>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 3: ACTIONS ─── */}
          {step === 'actions' && (
            <>
              <div className="bm-cmp-section-head">
                <h3>Add inline action buttons</h3>
                <button className="bm-btn bm-btn-primary" onClick={addAction}>
                  <HiOutlinePlus /> Add action
                </button>
              </div>
              <p className="bm-cmp-hint">
                Recipients can approve, reject, acknowledge, or open links right from the notification — without leaving their inbox.
              </p>

              {actions.length === 0 ? (
                <div className="bm-cmp-empty bm-cmp-empty-actions">
                  <HiOutlineThumbUp />
                  <p>No actions yet. Add buttons like "Approve", "Reject", or "Open application".</p>
                </div>
              ) : (
                <div className="bm-cmp-actions-list">
                  {actions.map((a, i) => (
                    <div key={i} className="bm-cmp-action-row">
                      <div className="bm-cmp-action-grid">
                        <input
                          placeholder="Key (approve, reject, ack…)"
                          value={a.key}
                          onChange={e => updateAction(i, { key: e.target.value })}
                          className="bm-cmp-action-key"
                        />
                        <input
                          placeholder="Button label"
                          value={a.label}
                          onChange={e => updateAction(i, { label: e.target.value })}
                          className="bm-cmp-action-label"
                        />
                        <select
                          value={a.style || 'primary'}
                          onChange={e => updateAction(i, { style: e.target.value as ActionStyle })}
                        >
                          {ACTION_STYLES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                        </select>
                        <select
                          value={a.handler}
                          onChange={e => updateAction(i, { handler: e.target.value as NotificationAction['handler'] })}
                        >
                          <option value="callback">Callback (record click)</option>
                          <option value="link">Open link</option>
                          <option value="dismiss">Dismiss</option>
                          <option value="snooze">Snooze 1h</option>
                        </select>
                      </div>
                      {a.handler === 'link' && (
                        <input
                          className="bm-cmp-action-url"
                          placeholder="URL or path"
                          value={a.url || ''}
                          onChange={e => updateAction(i, { url: e.target.value })}
                        />
                      )}
                      <button
                        className="bm-cmp-action-del"
                        onClick={() => removeAction(i)}
                        title="Remove"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick add buttons */}
              <div className="bm-cmp-quick-actions">
                <h4>Quick add</h4>
                <div className="bm-cmp-quick-row">
                  <button onClick={() => setActions(a => [...a, { key: 'approve', label: 'Approve', style: 'success', handler: 'callback' }])}>
                    ✓ Approve
                  </button>
                  <button onClick={() => setActions(a => [...a, { key: 'reject', label: 'Reject', style: 'danger', handler: 'callback' }])}>
                    ✕ Reject
                  </button>
                  <button onClick={() => setActions(a => [...a, { key: 'ack', label: 'Acknowledge', style: 'primary', handler: 'callback' }])}>
                    👍 Acknowledge
                  </button>
                  <button onClick={() => setActions(a => [...a, { key: 'view', label: 'View details', style: 'ghost', handler: 'link', url: '/' }])}>
                    👁 View details
                  </button>
                  <button onClick={() => setActions(a => [...a, { key: 'snooze', label: 'Snooze 1h', style: 'ghost', handler: 'snooze' }])}>
                    💤 Snooze
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 4: SCHEDULE + CHANNELS ─── */}
          {step === 'schedule' && (
            <>
              <h3>Channels &amp; schedule</h3>

              {/* Channels */}
              <div className="bm-cmp-field">
                <label>Channels</label>
                <div className="bm-cmp-channels">
                  {CHANNELS.map(c => {
                    const on = channels.includes(c.v);
                    return (
                      <button
                        key={c.v}
                        type="button"
                        className={`bm-cmp-channel ${on ? 'active' : ''} ${!c.ready ? 'not-ready' : ''}`}
                        onClick={() => {
                          if (!c.ready && !on) {
                            toast.warning(`${c.label} not yet wired`, 'Notification will still queue but no delivery until adapter is connected.');
                          }
                          setChannels(toggleArr(channels, c.v) as Channel[]);
                        }}
                      >
                        <span className="bm-cmp-channel-icon">{c.icon}</span>
                        <div>
                          <strong>{c.label}</strong>
                          <small>{c.sublabel}</small>
                        </div>
                        {on && <HiOutlineCheck className="bm-cmp-channel-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule mode */}
              <div className="bm-cmp-field">
                <label>When?</label>
                <div className="bm-cmp-schedule-tabs">
                  <button
                    className={`bm-cmp-sched-tab ${scheduleMode === 'now' ? 'active' : ''}`}
                    onClick={() => setScheduleMode('now')}
                  >
                    <HiOutlinePaperAirplane /> Send now
                  </button>
                  <button
                    className={`bm-cmp-sched-tab ${scheduleMode === 'later' ? 'active' : ''}`}
                    onClick={() => setScheduleMode('later')}
                  >
                    <HiOutlineClock /> Send at…
                  </button>
                  <button
                    className={`bm-cmp-sched-tab ${scheduleMode === 'recurring' ? 'active' : ''}`}
                    onClick={() => setScheduleMode('recurring')}
                  >
                    <HiOutlineRefresh /> Recurring
                  </button>
                </div>
              </div>

              {scheduleMode === 'later' && (
                <div className="bm-cmp-field">
                  <label><HiOutlineCalendar /> Send at</label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={e => setScheduledFor(e.target.value)}
                  />
                </div>
              )}

              {scheduleMode === 'recurring' && (
                <div className="bm-cmp-row-2">
                  <div className="bm-cmp-field">
                    <label><HiOutlineRefresh /> Repeat</label>
                    <select value={recurrence} onChange={e => setRecurrence(e.target.value as 'daily' | 'weekly' | 'monthly')}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="bm-cmp-field">
                    <label>Until</label>
                    <input
                      type="date"
                      value={recurrenceUntil}
                      onChange={e => setRecurrenceUntil(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Final summary */}
              <div className="bm-cmp-summary">
                <h4>Ready to {scheduleMode === 'now' ? 'send' : 'schedule'}</h4>
                <ul>
                  <li><span>To</span><strong>{audienceSummary()}</strong> ({estCount} people)</li>
                  <li><span>Channels</span><strong>{channels.join(', ')}</strong></li>
                  <li><span>Category</span><strong>{category} · {severity}</strong></li>
                  {actions.length > 0 && <li><span>Actions</span><strong>{actions.length} inline</strong></li>}
                  <li><span>When</span>
                    <strong>
                      {scheduleMode === 'now' && 'Immediately'}
                      {scheduleMode === 'later' && (scheduledFor ? new Date(scheduledFor).toLocaleString() : '— pick time —')}
                      {scheduleMode === 'recurring' && `${recurrence} · until ${recurrenceUntil || 'forever'}`}
                    </strong>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* ───── Footer nav ───── */}
          <div className="bm-cmp-foot">
            <button className="bm-btn-ghost" onClick={goPrev} disabled={stepIdx === 0}>
              <HiOutlineArrowLeft /> Back
            </button>
            <div style={{ flex: 1 }} />
            {stepIdx < STEPS.length - 1 ? (
              <button className="bm-btn bm-btn-primary" onClick={goNext} disabled={!canAdvance[step]}>
                Continue → {STEPS[stepIdx + 1].label}
              </button>
            ) : (
              <button
                className="bm-btn bm-btn-primary bm-btn-send"
                onClick={handleSubmit}
                disabled={!allValid || submitting}
              >
                {submitting ? 'Sending…' : (
                  <>
                    <HiOutlinePaperAirplane />
                    {scheduleMode === 'now' ? `Send to ${estCount}` : 'Schedule'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ────── RIGHT: LIVE PREVIEW ────── */}
        <aside className="bm-cmp-preview">
          <div className="bm-cmp-preview-card">
            <div className="bm-cmp-preview-head">
              <span><HiOutlineEye /> Live preview</span>
              <span className="bm-cmp-preview-channels">
                {channels.includes('in_app') && <HiOutlineBell title="In-app" />}
                {channels.includes('email') && <HiOutlineMail title="Email" />}
                {channels.includes('sms') && <HiOutlineDeviceMobile title="SMS" />}
                {channels.includes('whatsapp') && <HiOutlineChat title="WhatsApp" />}
                {channels.includes('push') && <HiOutlineLightningBolt title="Push" />}
              </span>
            </div>

            {/* Phone-style notification */}
            <div className={`bm-cmp-pv-card sev-${severity}`}>
              <div className="bm-cmp-pv-bar" />
              <div className="bm-cmp-pv-body">
                <div className="bm-cmp-pv-meta">
                  <span className="bm-cmp-pv-cat" style={{ color: CATEGORIES.find(c => c.v === category)?.color }}>
                    {CATEGORIES.find(c => c.v === category)?.emoji} {category}
                  </span>
                  <span className="bm-cmp-pv-time">just now</span>
                </div>
                <div className="bm-cmp-pv-title">
                  {title || 'Your notification title appears here'}
                </div>
                {body && <div className="bm-cmp-pv-text">{body}</div>}
                {navigateTo && (
                  <a className="bm-cmp-pv-nav" href={navigateTo} onClick={e => e.preventDefault()}>
                    <HiOutlineExternalLink /> Open
                  </a>
                )}
                {actions.length > 0 && (
                  <div className="bm-cmp-pv-actions">
                    {actions.map((a, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`bm-cmp-pv-act bm-cmp-pv-act-${a.style || 'primary'}`}
                        onClick={e => e.preventDefault()}
                      >
                        {a.label || 'Action'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bm-cmp-preview-card bm-cmp-preview-stats">
            <h4>Reach</h4>
            <div className="bm-cmp-preview-stat">
              <span className="bm-cmp-preview-stat-num">{estimating ? '…' : estCount}</span>
              <span className="bm-cmp-preview-stat-label">recipients</span>
            </div>
            <div className="bm-cmp-preview-stat-channels">
              {channels.length === 0 ? (
                <em>No channels selected</em>
              ) : (
                <span>{channels.length} channel{channels.length === 1 ? '' : 's'}</span>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NotificationsCompose;
