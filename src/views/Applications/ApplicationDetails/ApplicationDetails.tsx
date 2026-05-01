import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlinePencilAlt,
  HiOutlineX,
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import applicationsApi from "@/services/api/applications.api";
import type {
  Application,
  ApplicationMetaResponse,
  ApplicationStatus,
  ChangeApplicationStatusRequest,
} from "@/types/api.types";
import { useBodyScrollLock } from "@/hooks";
import "./ApplicationDetails.scss";

const STATUS_TONES: Record<ApplicationStatus, string> = {
  draft: "neutral",
  submitted: "info",
  in_progress: "indigo",
  awaiting_citizen: "amber",
  awaiting_external: "amber",
  agent_completed: "green",
  completed: "green",
  rejected: "red",
  cancelled: "neutral",
};

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [app, setApp] = useState<Application | null>(null);
  const [meta, setMeta] = useState<ApplicationMetaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("in_progress");
  const [statusRemark, setStatusRemark] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  useBodyScrollLock(statusModal);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [aRes, mRes] = await Promise.all([
        applicationsApi.get(id),
        meta ? Promise.resolve({ data: meta } as any) : applicationsApi.meta(),
      ]);
      if (aRes.data) setApp(aRes.data);
      if (!meta && (mRes as any).data) setMeta((mRes as any).data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const allowedNextStatuses = useMemo(() => {
    if (!app) return [];
    // Simple progression model — admins can always pick anything via the
    // dropdown, but we surface the most likely next states first.
    const cur = app.status;
    const order: ApplicationStatus[] = [
      "draft",
      "submitted",
      "in_progress",
      "awaiting_citizen",
      "awaiting_external",
      "agent_completed",
      "completed",
      "rejected",
      "cancelled",
    ];
    return order.filter((s) => s !== cur);
  }, [app]);

  const handleSubmitStatus = async () => {
    if (!app) return;
    setStatusSaving(true);
    try {
      const body: ChangeApplicationStatusRequest = {
        status: newStatus,
        remark: statusRemark.trim() || undefined,
        rejection_reason: newStatus === "rejected" ? (rejectionReason.trim() || undefined) : undefined,
      };
      const r = await applicationsApi.changeStatus(app.id, body);
      if (r.data) setApp(r.data);
      setStatusModal(false);
      setStatusRemark("");
      setRejectionReason("");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to update status");
    } finally {
      setStatusSaving(false);
    }
  };

  if (!app && loading) {
    return <div className="bm-appd"><div className="bm-appd-empty">Loading…</div></div>;
  }
  if (!app) {
    return (
      <div className="bm-appd">
        <PageHeader title="Application not found" actions={
          <Link to="/applications" className="bm-appd-btn-back"><HiOutlineArrowLeft /> Back</Link>
        } />
        {error && <div className="bm-appd-error"><HiOutlineExclamationCircle /> {error}</div>}
      </div>
    );
  }

  const statusLabel = meta?.status_labels?.[app.status] || app.status;

  return (
    <div className="bm-appd">
      <PageHeader
        title={`Application ${app.application_code}`}
        description={app.service?.name || ""}
        actions={
          <div className="bm-appd-actions">
            <button type="button" className="bm-appd-btn-ghost" onClick={load} disabled={loading}>
              <HiOutlineRefresh className={loading ? "spin" : ""} /> Refresh
            </button>
            <button type="button" className="bm-appd-btn-primary" onClick={() => { setNewStatus(allowedNextStatuses[0] as ApplicationStatus); setStatusModal(true); }}>
              <HiOutlinePencilAlt /> Update status
            </button>
            <button type="button" className="bm-appd-btn-back" onClick={() => navigate("/applications")}>
              <HiOutlineArrowLeft /> Back
            </button>
          </div>
        }
      />

      {error && <div className="bm-appd-error"><HiOutlineExclamationCircle /> {error}</div>}

      <div className="bm-appd-grid">
        {/* ─── Main column ─────────────────────────────────────── */}
        <div className="bm-appd-main">
          {/* Status hero */}
          <div className="bm-appd-hero">
            <div className={`bm-appd-status tone-${STATUS_TONES[app.status]}`}>
              <span className="bm-appd-status-dot" />
              {statusLabel}
            </div>
            <div className="bm-appd-priority-row">
              <span className="bm-appd-prio-tag" data-prio={app.priority}>{app.priority} priority</span>
              {app.is_agent_only && <span className="bm-appd-tag agent">Agent only</span>}
              {app.payment_status !== "pending" && (
                <span className="bm-appd-tag">Payment: {app.payment_status}</span>
              )}
            </div>
            {app.latest_remark && (
              <div className="bm-appd-remark">
                <span className="bm-appd-remark-label">Latest remark</span>
                <p>"{app.latest_remark}"</p>
              </div>
            )}
            {app.rejection_reason && (
              <div className="bm-appd-remark bm-appd-remark-error">
                <span className="bm-appd-remark-label">Rejection reason</span>
                <p>{app.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Citizen card */}
          <section className="bm-appd-section">
            <h2>Citizen</h2>
            <div className="bm-appd-citizen">
              <div className="bm-appd-citizen-avatar">
                {initials(app.citizen_name)}
              </div>
              <div className="bm-appd-citizen-text">
                <div className="bm-appd-citizen-name">{app.citizen_name}</div>
                <div className="bm-appd-citizen-meta">
                  <span><HiOutlinePhone /> {app.citizen_mobile}</span>
                  {app.citizen_email && <span><HiOutlineMail /> {app.citizen_email}</span>}
                  {app.citizen_aadhaar_last4 && <span>Aadhaar ••• {app.citizen_aadhaar_last4}</span>}
                </div>
                {(app.citizen_address || app.citizen_pincode) && (
                  <div className="bm-appd-citizen-addr">
                    <HiOutlineLocationMarker />
                    {app.citizen_address || ""}
                    {app.citizen_pincode && <> · {app.citizen_pincode}</>}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="bm-appd-section">
            <h2>Timeline</h2>
            <div className="bm-appd-timeline">
              {(app.status_history || []).slice().reverse().map((h, idx) => (
                <div key={h.id} className={`bm-appd-tl-row ${idx === 0 ? "is-current" : ""}`}>
                  <div className={`bm-appd-tl-dot tone-${STATUS_TONES[h.to_status as ApplicationStatus] || "neutral"}`} />
                  <div className="bm-appd-tl-body">
                    <div className="bm-appd-tl-status">
                      {meta?.status_labels?.[h.to_status as ApplicationStatus] || h.to_status}
                      {h.is_system && <span className="bm-appd-tl-system">system</span>}
                    </div>
                    {h.remark && <p className="bm-appd-tl-remark">{h.remark}</p>}
                    <div className="bm-appd-tl-actor">
                      {h.changed_by_name || (h.is_system ? "System" : "")}
                      {h.changed_by_role && <> · {h.changed_by_role}</>}
                      <span className="bm-appd-tl-time">
                        {" · "}{new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(!app.status_history || app.status_history.length === 0) && (
                <div className="bm-appd-empty">No status changes yet.</div>
              )}
            </div>
          </section>

          {/* Documents */}
          <section className="bm-appd-section">
            <h2>Documents</h2>
            {(app.documents || []).length === 0 ? (
              <div className="bm-appd-empty">No documents uploaded yet.</div>
            ) : (
              <div className="bm-appd-docs">
                {app.documents!.map((d) => (
                  <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer" className="bm-appd-doc">
                    <HiOutlineDocumentText />
                    <div>
                      <div className="bm-appd-doc-label">{d.doc_label}</div>
                      <small>{d.file_mime_type || "file"}{d.file_size_bytes ? ` · ${Math.round(d.file_size_bytes / 1024)} KB` : ""}</small>
                    </div>
                    <span className={`bm-appd-doc-status tone-${d.status === "accepted" ? "green" : d.status === "rejected" ? "red" : "neutral"}`}>
                      {d.status}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ─── Sidebar ─────────────────────────────────────────── */}
        <aside className="bm-appd-side">
          <div className="bm-appd-side-card">
            <h3>Service</h3>
            <div className="bm-appd-side-svc">
              <div>
                <div className="bm-appd-side-svc-name">{app.service?.name}</div>
                <div className="bm-appd-side-svc-code">{app.service?.code}</div>
                {app.service?.category_name && <div className="bm-appd-side-svc-cat">{app.service.category_name}</div>}
              </div>
            </div>
          </div>

          <div className="bm-appd-side-card">
            <h3>Routing</h3>
            {app.is_agent_only ? (
              <div className="bm-appd-side-route agent">
                <HiOutlineUserGroup />
                <div>
                  <strong>Agent only</strong>
                  <small>No caseworker — agent completes this themselves</small>
                </div>
              </div>
            ) : app.assigned_caseworker ? (
              <div className="bm-appd-side-route">
                <div className="bm-appd-cw-avatar">{initials(app.assigned_caseworker.full_name)}</div>
                <div>
                  <strong>{app.assigned_caseworker.full_name}</strong>
                  <small>Caseworker · {app.assigned_caseworker.employee_code}</small>
                </div>
              </div>
            ) : (
              <div className="bm-appd-side-route warn">
                <HiOutlineExclamationCircle />
                <div>
                  <strong>Unassigned</strong>
                  <small>No caseworker covers this GP yet</small>
                </div>
              </div>
            )}
          </div>

          {app.submitted_by_agent && (
            <div className="bm-appd-side-card">
              <h3>Submitted by</h3>
              <div className="bm-appd-side-route">
                <div className="bm-appd-cw-avatar agent">{initials(app.submitted_by_agent.full_name)}</div>
                <div>
                  <strong>{app.submitted_by_agent.full_name}</strong>
                  <small>Agent · {app.submitted_by_agent.employee_code}</small>
                </div>
              </div>
            </div>
          )}

          {app.gp && (
            <div className="bm-appd-side-card">
              <h3>Location</h3>
              <div className="bm-appd-side-loc">
                <HiOutlineLocationMarker />
                <div>
                  <strong>{app.gp.name}</strong>
                  <small>
                    {app.gp.taluk_name && <>{app.gp.taluk_name}</>}
                    {app.gp.district_name && <> · {app.gp.district_name}</>}
                  </small>
                </div>
              </div>
            </div>
          )}

          <div className="bm-appd-side-card">
            <h3>Timestamps</h3>
            <ul className="bm-appd-side-times">
              <li>
                <span>Created</span>
                <strong>{new Date(app.created_at).toLocaleString()}</strong>
              </li>
              {app.submitted_at && (
                <li>
                  <span>Submitted</span>
                  <strong>{new Date(app.submitted_at).toLocaleString()}</strong>
                </li>
              )}
              {app.completed_at && (
                <li>
                  <span>Completed</span>
                  <strong>{new Date(app.completed_at).toLocaleString()}</strong>
                </li>
              )}
            </ul>
          </div>

          {(app.fee_charged || app.payment_status !== "pending") && (
            <div className="bm-appd-side-card">
              <h3>Payment</h3>
              <div className="bm-appd-side-pay">
                {app.fee_charged != null && <div className="bm-appd-fee">₹ {app.fee_charged.toFixed(2)}</div>}
                <div>
                  <small>Status</small>
                  <strong>{app.payment_status}</strong>
                </div>
                {app.payment_method && (
                  <div>
                    <small>Method</small>
                    <strong>{app.payment_method}</strong>
                  </div>
                )}
                {app.payment_reference && (
                  <div>
                    <small>Reference</small>
                    <strong className="bm-appd-mono">{app.payment_reference}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {app.internal_notes && (
            <div className="bm-appd-side-card">
              <h3>Internal notes</h3>
              <p className="bm-appd-side-notes">{app.internal_notes}</p>
            </div>
          )}
        </aside>
      </div>

      {/* Status change modal */}
      {statusModal && (
        <div className="bm-appd-modal-overlay" onClick={() => setStatusModal(false)} role="presentation">
          <div className="bm-appd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bm-appd-modal-head">
              <div>
                <small>Update status</small>
                <h2>{app.application_code}</h2>
              </div>
              <button type="button" className="bm-appd-modal-close" onClick={() => setStatusModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <div className="bm-appd-modal-body">
              <div className="bm-appd-field">
                <label>New status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}>
                  {allowedNextStatuses.map((s) => (
                    <option key={s} value={s}>{meta?.status_labels?.[s] || s}</option>
                  ))}
                </select>
              </div>
              <div className="bm-appd-field">
                <label>Remark <span className="bm-appd-opt">(visible on the timeline)</span></label>
                <textarea
                  rows={3}
                  placeholder="What changed and why?"
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                />
              </div>
              {newStatus === "rejected" && (
                <div className="bm-appd-field">
                  <label>Rejection reason</label>
                  <textarea
                    rows={2}
                    placeholder="Why was this rejected?"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="bm-appd-modal-foot">
              <button type="button" className="bm-appd-btn-ghost" onClick={() => setStatusModal(false)} disabled={statusSaving}>
                Cancel
              </button>
              <button type="button" className="bm-appd-btn-primary" onClick={handleSubmitStatus} disabled={statusSaving}>
                {statusSaving ? "Updating…" : <><HiOutlineCheckCircle /> Update status</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

export default ApplicationDetails;
