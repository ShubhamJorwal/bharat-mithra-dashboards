import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineCollection, HiOutlinePencil, HiOutlineArrowLeft, HiOutlineTrash,
  HiOutlinePlus, HiOutlineCurrencyRupee, HiOutlineSparkles, HiOutlineLightningBolt,
  HiOutlineX, HiOutlineCheck
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import servicesApi from "@/services/api/services.api";
import type {
  Service, ServiceProfile, ServiceDocument, ServiceWorkflowStep, ServiceFAQ,
  CreateProfileRequest, CreateDocumentRequest, CreateWorkflowStepRequest, CreateFAQRequest
} from "@/types/api.types";
import "../ServiceList/ServiceList.scss";
import "./ServiceDetails.scss";

type Tab = "overview" | "profiles" | "documents" | "workflow" | "faqs";

const STAFF_ROLES = [
  "super_admin", "admin", "state_head", "district_manager", "supervisor",
  "service_manager", "agent", "verifier", "support", "finance",
];

const DOC_TYPES = [
  "id_proof", "address_proof", "dob_proof", "photo", "signature",
  "aadhaar", "pan", "passport", "bank", "dsc", "form", "medical",
  "supporting", "mobile_otp", "income_proof",
];

const STEP_TYPES = [
  "submission", "document_verify", "payment", "approval", "dispatch", "delivery", "external",
];

const APPLICANT_CATEGORIES = [
  "general", "sc", "st", "obc", "ews", "bpl", "apl", "senior", "minor",
  "pvt_ltd", "llp", "opc", "sole_prop", "partnership", "salaried", "self_employed", "farmer",
];

const CHANNELS = [
  "self_serve", "agent_assisted", "expert", "tatkal", "express", "offline", "kiosk",
];

const ServiceDetails = () => {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [svc, setSvc] = useState<Service | null>(null);
  const [profiles, setProfiles] = useState<ServiceProfile[]>([]);
  const [docs, setDocs] = useState<ServiceDocument[]>([]);
  const [workflow, setWorkflow] = useState<ServiceWorkflowStep[]>([]);
  const [faqs, setFaqs] = useState<ServiceFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [deleting, setDeleting] = useState(false);

  const reload = async () => {
    if (!id) return;
    try {
      const [s, d, w, f] = await Promise.all([
        servicesApi.get(id, true),
        servicesApi.listDocuments(id),
        servicesApi.listWorkflow(id),
        servicesApi.listFAQs(id),
      ]);
      setSvc(s.data);
      setProfiles(s.data.profiles || []);
      setDocs(d.data || []);
      setWorkflow(w.data || []);
      setFaqs(f.data || []);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string };
      setError(e.response?.status === 404 ? "Service not found" : e.message || "Failed to load");
    }
  };

  useEffect(() => {
    setLoading(true);
    void reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const remove = async () => {
    if (!svc) return;
    if (!confirm(`Soft-delete "${svc.name}"? It will hide from citizens but stay in the DB.`)) return;
    setDeleting(true);
    try {
      await servicesApi.remove(svc.id);
      nav("/services");
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e.message || "Failed to delete");
    } finally { setDeleting(false); }
  };

  if (loading) return <div className="bm-services"><div className="bm-empty">Loading…</div></div>;
  if (error || !svc) return (
    <div className="bm-services">
      <div className="bm-alert bm-alert-error">{error}</div>
      <Link to="/services" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>
    </div>
  );

  const totalFee = svc.base_government_fee + svc.base_platform_fee;

  return (
    <div className="bm-services bm-svc-details">
      <PageHeader
        icon={<HiOutlineCollection />}
        title={svc.name}
        description={svc.short_description || svc.description || ""}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/services" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>
            <Link to={`/services/${svc.id}/edit`} className="bm-btn"><HiOutlinePencil /> Edit basics</Link>
            <button className="bm-btn bm-btn-danger" onClick={remove} disabled={deleting}>
              <HiOutlineTrash /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        }
      />

      {/* Hero strip */}
      <div className="bm-svc-hero" style={{ "--cat-color": svc.category?.color } as React.CSSProperties}>
        <div className="bm-svc-hero-meta">
          {svc.category && <Link to={`/services?category=${svc.category.code}`} className="bm-svc-hero-cat">{svc.category.name}</Link>}
          {svc.category && <span className={`bm-type-pill bm-type-${svc.category.category_type}`}>{svc.category.category_type}</span>}
          <span>·</span>
          <code>{svc.code}</code>
          {svc.is_featured && <span className="bm-badge bm-badge-featured"><HiOutlineLightningBolt /> Featured</span>}
          {svc.is_popular && <span className="bm-badge bm-badge-popular"><HiOutlineSparkles /> Popular</span>}
          {svc.is_new && <span className="bm-badge bm-badge-new">New</span>}
        </div>
        <div className="bm-svc-hero-stats">
          <div><span className="l">Base fee</span><span className="n">{svc.is_free ? "FREE" : <><HiOutlineCurrencyRupee />{totalFee.toFixed(0)}</>}</span></div>
          <div><span className="l">Processing</span><span className="n">{svc.base_processing_time || "—"}</span></div>
          <div><span className="l">Profiles</span><span className="n">{profiles.length}</span></div>
          <div><span className="l">Department</span><span className="n">{svc.department || "—"}</span></div>
        </div>
      </div>

      <div className="bm-tabs">
        {(["overview", "profiles", "documents", "workflow", "faqs"] as Tab[]).map(t => {
          const counts: Record<Tab, number> = {
            overview: 0, profiles: profiles.length, documents: docs.length, workflow: workflow.length, faqs: faqs.length,
          };
          return (
            <button key={t} className={`bm-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {counts[t] > 0 && <span className="bm-tab-count">{counts[t]}</span>}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="bm-grid-2">
          <Card title="Description"><p>{svc.description || svc.short_description || "—"}</p></Card>
          <Card title="Identifiers">
            <Row k="Code" v={<code>{svc.code}</code>} />
            <Row k="Slug" v={<code>{svc.slug}</code>} />
            <Row k="Category" v={svc.category?.name || "—"} />
            <Row k="Department" v={svc.department || "—"} />
            <Row k="Ministry" v={svc.ministry || "—"} />
            <Row k="Issuing authority" v={svc.issuing_authority || "—"} />
            <Row k="Official URL" v={svc.official_url ? <a href={svc.official_url} target="_blank" rel="noopener">{svc.official_url}</a> : "—"} />
            <Row k="Target audience" v={svc.target_audience || "—"} />
          </Card>
          <Card title="Tags">
            <div className="bm-tags">
              {svc.tags.length === 0 ? <span className="bm-text-muted">No tags</span> :
                svc.tags.map(t => <span key={t} className="bm-tag">{t}</span>)}
            </div>
          </Card>
          <Card title="Status">
            <Row k="Active" v={svc.is_active ? "Yes" : "No"} />
            <Row k="Popular" v={svc.is_popular ? "Yes" : "No"} />
            <Row k="Featured" v={svc.is_featured ? "Yes" : "No"} />
            <Row k="New" v={svc.is_new ? "Yes" : "No"} />
            <Row k="Sort order" v={svc.sort_order} />
            <Row k="Total applications" v={svc.total_applications} />
            <Row k="Avg rating" v={svc.avg_rating > 0 ? `${svc.avg_rating} / 5` : "—"} />
          </Card>
        </div>
      )}

      {tab === "profiles" && <ProfilesBuilder svcId={svc.id} profiles={profiles} reload={reload} />}
      {tab === "documents" && <DocumentsBuilder svcId={svc.id} docs={docs} reload={reload} />}
      {tab === "workflow" && <WorkflowBuilder svcId={svc.id} steps={workflow} reload={reload} />}
      {tab === "faqs" && <FAQsBuilder svcId={svc.id} faqs={faqs} reload={reload} />}
    </div>
  );
};

// =====================================================================
// Profiles Builder
// =====================================================================

const ProfilesBuilder = ({ svcId, profiles, reload }: { svcId: string; profiles: ServiceProfile[]; reload: () => Promise<void> }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<CreateProfileRequest>({
    profile_code: "", state_code: "", applicant_category: "", channel: "", is_default: false,
  });
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!draft.profile_code) { setErr("Profile code required"); return; }
    try {
      await servicesApi.createProfile(svcId, {
        ...draft,
        state_code: draft.state_code || undefined,
        applicant_category: draft.applicant_category || undefined,
        channel: draft.channel || undefined,
      });
      setShowAdd(false);
      setDraft({ profile_code: "", state_code: "", applicant_category: "", channel: "", is_default: false });
      await reload();
    } catch (e: unknown) {
      const ex = e as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setErr(ex.response?.data?.error?.message || ex.message || "Failed");
    }
  };

  const removeProfile = async (id: string) => {
    if (!confirm("Delete this profile and its pricing?")) return;
    try { await servicesApi.deleteProfile(id); await reload(); }
    catch (e: unknown) { alert((e as { message?: string }).message || "Failed"); }
  };

  return (
    <div className="bm-builder">
      <div className="bm-builder-head">
        <p className="bm-text-muted">
          Profiles are variants of this service — different state, applicant category (BPL/APL/SC/ST/etc.), or channel (online/agent/tatkal). Each profile can override pricing and processing time.
        </p>
        <button className="bm-btn bm-btn-primary" onClick={() => setShowAdd(s => !s)}>
          <HiOutlinePlus /> {showAdd ? "Cancel" : "Add profile"}
        </button>
      </div>

      {showAdd && (
        <form className="bm-builder-form" onSubmit={submit}>
          {err && <div className="bm-alert bm-alert-error">{err}</div>}
          <div className="bm-form-grid">
            <Field label="Profile code *"><input value={draft.profile_code} onChange={(e) => setDraft({ ...draft, profile_code: e.target.value })} placeholder="e.g. income-cert-ka-bpl" required /></Field>
            <Field label="State code"><input value={draft.state_code || ""} onChange={(e) => setDraft({ ...draft, state_code: e.target.value.toUpperCase().slice(0, 5) })} placeholder="KA, MH, TN…" /></Field>
            <Field label="Applicant category">
              <select value={draft.applicant_category || ""} onChange={(e) => setDraft({ ...draft, applicant_category: e.target.value })}>
                <option value="">—</option>
                {APPLICANT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Channel">
              <select value={draft.channel || ""} onChange={(e) => setDraft({ ...draft, channel: e.target.value })}>
                <option value="">—</option>
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Display name (optional)"><input value={draft.display_name || ""} onChange={(e) => setDraft({ ...draft, display_name: e.target.value })} /></Field>
            <Field label="Processing time (optional)"><input value={draft.processing_time || ""} onChange={(e) => setDraft({ ...draft, processing_time: e.target.value })} placeholder="e.g. 7-10 days" /></Field>
            <label className="bm-check">
              <input type="checkbox" checked={draft.is_default || false} onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })} />
              Make this the default profile (only one default per service)
            </label>
          </div>
          <div className="bm-form-actions">
            <button type="submit" className="bm-btn bm-btn-primary"><HiOutlineCheck /> Add profile</button>
          </div>
        </form>
      )}

      {profiles.length === 0 ? (
        <div className="bm-empty">No profiles yet — at least the default profile should be created when the service is added.</div>
      ) : (
        <table className="bm-table">
          <thead>
            <tr><th>Profile code</th><th>State</th><th>Applicant cat.</th><th>Channel</th><th>Processing</th><th>Total fee</th><th>Default</th><th></th></tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td><code>{p.profile_code}</code></td>
                <td>{p.state_code || <span className="bm-text-muted">—</span>}</td>
                <td>{p.applicant_category || <span className="bm-text-muted">—</span>}</td>
                <td>{p.channel || <span className="bm-text-muted">—</span>}</td>
                <td>{p.processing_time || <span className="bm-text-muted">base</span>}</td>
                <td>{p.pricing?.is_free ? "FREE" : `₹${p.pricing?.total_amount?.toFixed(0) ?? "—"}`}</td>
                <td>{p.is_default ? "✓" : ""}</td>
                <td>
                  {!p.is_default && (
                    <button className="bm-btn bm-btn-ghost bm-btn-sm" onClick={() => removeProfile(p.id)}>
                      <HiOutlineX />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// =====================================================================
// Documents Builder
// =====================================================================

const DocumentsBuilder = ({ svcId, docs, reload }: { svcId: string; docs: ServiceDocument[]; reload: () => Promise<void> }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<CreateDocumentRequest>({
    code: "", document_name: "", document_type: "id_proof", is_mandatory: true,
    accepted_formats: ["pdf", "jpg", "jpeg", "png"], max_size_mb: 5, sort_order: 100,
  });
  const [err, setErr] = useState<string | null>(null);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 50);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!draft.code || !draft.document_name) { setErr("Code and name are required"); return; }
    try {
      await servicesApi.createDocument(svcId, draft);
      setShowAdd(false);
      setDraft({ code: "", document_name: "", document_type: "id_proof", is_mandatory: true,
        accepted_formats: ["pdf", "jpg", "jpeg", "png"], max_size_mb: 5, sort_order: 100 });
      await reload();
    } catch (e: unknown) {
      const ex = e as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setErr(ex.response?.data?.error?.message || ex.message || "Failed");
    }
  };

  const removeDoc = async (id: string) => {
    if (!confirm("Remove this document?")) return;
    try { await servicesApi.deleteDocument(id); await reload(); }
    catch (e: unknown) { alert((e as { message?: string }).message || "Failed"); }
  };

  const toggleMandatory = async (doc: ServiceDocument) => {
    try { await servicesApi.updateDocument(doc.id, { is_mandatory: !doc.is_mandatory }); await reload(); }
    catch (e: unknown) { alert((e as { message?: string }).message || "Failed"); }
  };

  return (
    <div className="bm-builder">
      <div className="bm-builder-head">
        <p className="bm-text-muted">
          Documents the citizen needs to upload. Mandatory documents block submission. Documents in the same "alternatives group" are OR — citizen needs to upload one of them.
        </p>
        <button className="bm-btn bm-btn-primary" onClick={() => setShowAdd(s => !s)}>
          <HiOutlinePlus /> {showAdd ? "Cancel" : "Add document"}
        </button>
      </div>

      {showAdd && (
        <form className="bm-builder-form" onSubmit={submit}>
          {err && <div className="bm-alert bm-alert-error">{err}</div>}
          <div className="bm-form-grid">
            <Field label="Document name *">
              <input value={draft.document_name} onChange={(e) => {
                const name = e.target.value;
                setDraft({ ...draft, document_name: name, code: draft.code || slugify(name) });
              }} placeholder="e.g. Passport-size photograph" required />
            </Field>
            <Field label="Code *" hint="Stable identifier; auto-derived from name">
              <input value={draft.code} onChange={(e) => setDraft({ ...draft, code: slugify(e.target.value) })} required />
            </Field>
            <Field label="Document type">
              <select value={draft.document_type} onChange={(e) => setDraft({ ...draft, document_type: e.target.value })}>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Alternatives group" hint="Same group = OR (one of these is enough)">
              <input value={draft.alternatives_group || ""} onChange={(e) => setDraft({ ...draft, alternatives_group: e.target.value })} placeholder="e.g. id_proof, address_proof" />
            </Field>
            <Field label="Max size (MB)">
              <input type="number" min="1" max="50" value={draft.max_size_mb || 5} onChange={(e) => setDraft({ ...draft, max_size_mb: parseInt(e.target.value) || 5 })} />
            </Field>
            <Field label="Sort order">
              <input type="number" value={draft.sort_order || 100} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })} />
            </Field>
            <Field label="Description / help text" span={2}>
              <input value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="e.g. Color, white background, taken in last 6 months" />
            </Field>
            <Field label="Sample URL (optional)" span={2}>
              <input type="url" value={draft.sample_url || ""} onChange={(e) => setDraft({ ...draft, sample_url: e.target.value })} placeholder="Show citizen what good looks like" />
            </Field>
            <label className="bm-check">
              <input type="checkbox" checked={draft.is_mandatory ?? true} onChange={(e) => setDraft({ ...draft, is_mandatory: e.target.checked })} />
              Mandatory (blocks submission if missing)
            </label>
          </div>
          <div className="bm-form-actions">
            <button type="submit" className="bm-btn bm-btn-primary"><HiOutlineCheck /> Add document</button>
          </div>
        </form>
      )}

      {docs.length === 0 ? (
        <div className="bm-empty">No documents required (yet) for this service. Add one to start the checklist.</div>
      ) : (
        <table className="bm-table">
          <thead>
            <tr><th>Document</th><th>Type</th><th>Mandatory</th><th>Alternatives</th><th>Max size</th><th>Sample</th><th></th></tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{d.document_name}</div>
                  {d.description && <small className="bm-text-muted">{d.description}</small>}
                </td>
                <td><code>{d.document_type}</code></td>
                <td>
                  <button className={`bm-toggle-mini ${d.is_mandatory ? "on" : ""}`} onClick={() => toggleMandatory(d)}>
                    {d.is_mandatory ? "Yes" : "Optional"}
                  </button>
                </td>
                <td>{d.alternatives_group ? <code>{d.alternatives_group}</code> : <span className="bm-text-muted">—</span>}</td>
                <td>{d.max_size_mb} MB</td>
                <td>{d.sample_url ? <a href={d.sample_url} target="_blank" rel="noopener">View</a> : <span className="bm-text-muted">—</span>}</td>
                <td>
                  <button className="bm-btn bm-btn-ghost bm-btn-sm" onClick={() => removeDoc(d.id)}><HiOutlineX /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// =====================================================================
// Workflow Builder
// =====================================================================

const WorkflowBuilder = ({ svcId, steps, reload }: { svcId: string; steps: ServiceWorkflowStep[]; reload: () => Promise<void> }) => {
  const [showAdd, setShowAdd] = useState(false);
  const nextStepNumber = steps.length === 0 ? 1 : Math.max(...steps.map(s => s.step_number)) + 1;
  const [draft, setDraft] = useState<CreateWorkflowStepRequest>({
    step_number: nextStepNumber, step_name: "", step_type: "submission",
    sla_hours: 24, notify_applicant: true, notify_sms: true, sort_order: nextStepNumber,
  });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const n = steps.length === 0 ? 1 : Math.max(...steps.map(s => s.step_number)) + 1;
    setDraft(d => ({ ...d, step_number: n, sort_order: n }));
  }, [steps.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!draft.step_name) { setErr("Step name required"); return; }
    try {
      await servicesApi.createWorkflowStep(svcId, draft);
      setShowAdd(false);
      setDraft({ step_number: nextStepNumber + 1, step_name: "", step_type: "submission",
        sla_hours: 24, notify_applicant: true, notify_sms: true, sort_order: nextStepNumber + 1 });
      await reload();
    } catch (e: unknown) {
      const ex = e as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setErr(ex.response?.data?.error?.message || ex.message || "Failed");
    }
  };

  const removeStep = async (id: string) => {
    if (!confirm("Remove this step?")) return;
    try { await servicesApi.deleteWorkflowStep(id); await reload(); }
    catch (e: unknown) { alert((e as { message?: string }).message || "Failed"); }
  };

  return (
    <div className="bm-builder">
      <div className="bm-builder-head">
        <p className="bm-text-muted">
          Steps the application goes through after submission. Each step is assigned to a staff role and has a target SLA.
        </p>
        <button className="bm-btn bm-btn-primary" onClick={() => setShowAdd(s => !s)}>
          <HiOutlinePlus /> {showAdd ? "Cancel" : "Add step"}
        </button>
      </div>

      {showAdd && (
        <form className="bm-builder-form" onSubmit={submit}>
          {err && <div className="bm-alert bm-alert-error">{err}</div>}
          <div className="bm-form-grid">
            <Field label="Step number *">
              <input type="number" value={draft.step_number} onChange={(e) => setDraft({ ...draft, step_number: parseInt(e.target.value) || 1 })} required />
            </Field>
            <Field label="Step name *">
              <input value={draft.step_name} onChange={(e) => setDraft({ ...draft, step_name: e.target.value })} placeholder="e.g. Document verification" required />
            </Field>
            <Field label="Step type">
              <select value={draft.step_type} onChange={(e) => setDraft({ ...draft, step_type: e.target.value })}>
                {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Assigned role">
              <select value={draft.assigned_role || ""} onChange={(e) => setDraft({ ...draft, assigned_role: e.target.value || undefined })}>
                <option value="">— None / external —</option>
                {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="SLA (hours)">
              <input type="number" value={draft.sla_hours || 0} onChange={(e) => setDraft({ ...draft, sla_hours: parseInt(e.target.value) || 0 })} />
            </Field>
            <Field label="Description" span={2}>
              <textarea value={draft.step_description || ""} onChange={(e) => setDraft({ ...draft, step_description: e.target.value })} rows={2} />
            </Field>
            <div className="bm-form-checks" style={{ gridColumn: "span 2" }}>
              <label className="bm-check"><input type="checkbox" checked={draft.is_optional || false} onChange={(e) => setDraft({ ...draft, is_optional: e.target.checked })} /> Optional step</label>
              <label className="bm-check"><input type="checkbox" checked={draft.notify_applicant ?? true} onChange={(e) => setDraft({ ...draft, notify_applicant: e.target.checked })} /> Notify applicant</label>
              <label className="bm-check"><input type="checkbox" checked={draft.notify_email ?? false} onChange={(e) => setDraft({ ...draft, notify_email: e.target.checked })} /> Email</label>
              <label className="bm-check"><input type="checkbox" checked={draft.notify_sms ?? true} onChange={(e) => setDraft({ ...draft, notify_sms: e.target.checked })} /> SMS</label>
              <label className="bm-check"><input type="checkbox" checked={draft.notify_whatsapp ?? false} onChange={(e) => setDraft({ ...draft, notify_whatsapp: e.target.checked })} /> WhatsApp</label>
            </div>
          </div>
          <div className="bm-form-actions">
            <button type="submit" className="bm-btn bm-btn-primary"><HiOutlineCheck /> Add step</button>
          </div>
        </form>
      )}

      {steps.length === 0 ? (
        <div className="bm-empty">No workflow steps yet. Citizens will see "Submission only" until you add steps here.</div>
      ) : (
        <ol className="bm-workflow">
          {steps.map(step => (
            <li key={step.id} className="bm-workflow-step">
              <div className="bm-step-num">{step.step_number}</div>
              <div className="bm-step-body">
                <h4>{step.step_name}</h4>
                {step.step_description && <p>{step.step_description}</p>}
                <div className="bm-step-meta">
                  <span>Type: <code>{step.step_type}</code></span>
                  {step.assigned_role && <span>Assigned: <code>{step.assigned_role}</code></span>}
                  {step.sla_hours !== undefined && step.sla_hours !== null && <span>SLA: {step.sla_hours}h</span>}
                  {step.is_optional && <span>Optional</span>}
                </div>
              </div>
              <button className="bm-btn bm-btn-ghost bm-btn-sm" onClick={() => removeStep(step.id)}>
                <HiOutlineX />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

// =====================================================================
// FAQs Builder
// =====================================================================

const FAQsBuilder = ({ svcId, faqs, reload }: { svcId: string; faqs: ServiceFAQ[]; reload: () => Promise<void> }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<CreateFAQRequest>({ question: "", answer: "", sort_order: 100 });
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!draft.question || !draft.answer) { setErr("Question and answer required"); return; }
    try {
      await servicesApi.createFAQ(svcId, draft);
      setShowAdd(false);
      setDraft({ question: "", answer: "", sort_order: 100 });
      await reload();
    } catch (e: unknown) {
      const ex = e as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setErr(ex.response?.data?.error?.message || ex.message || "Failed");
    }
  };

  const removeFAQ = async (id: string) => {
    if (!confirm("Remove this FAQ?")) return;
    try { await servicesApi.deleteFAQ(id); await reload(); }
    catch (e: unknown) { alert((e as { message?: string }).message || "Failed"); }
  };

  return (
    <div className="bm-builder">
      <div className="bm-builder-head">
        <p className="bm-text-muted">Common questions citizens ask about this service. Shown on the public service page.</p>
        <button className="bm-btn bm-btn-primary" onClick={() => setShowAdd(s => !s)}>
          <HiOutlinePlus /> {showAdd ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {showAdd && (
        <form className="bm-builder-form" onSubmit={submit}>
          {err && <div className="bm-alert bm-alert-error">{err}</div>}
          <div className="bm-form-grid">
            <Field label="Question *" span={2}>
              <input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder="e.g. How long does it take?" required />
            </Field>
            <Field label="Answer *" span={2}>
              <textarea value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} rows={3} required />
            </Field>
            <Field label="Sort order">
              <input type="number" value={draft.sort_order || 100} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })} />
            </Field>
          </div>
          <div className="bm-form-actions">
            <button type="submit" className="bm-btn bm-btn-primary"><HiOutlineCheck /> Add FAQ</button>
          </div>
        </form>
      )}

      {faqs.length === 0 ? (
        <div className="bm-empty">No FAQs yet. Add a few to help citizens self-serve.</div>
      ) : (
        <div className="bm-faqs-list">
          {faqs.map(f => (
            <details key={f.id} className="bm-faq">
              <summary>
                <span>{f.question}</span>
                <button className="bm-btn bm-btn-ghost bm-btn-sm" onClick={(e) => { e.preventDefault(); removeFAQ(f.id); }}>
                  <HiOutlineX />
                </button>
              </summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// Helpers
// =====================================================================

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bm-svc-card-detail">
    <h3>{title}</h3>
    {children}
  </div>
);

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="bm-row">
    <span className="bm-row-k">{k}</span>
    <span className="bm-row-v">{v}</span>
  </div>
);

const Field = ({ label, hint, span, children }: { label: string; hint?: string; span?: number; children: React.ReactNode }) => (
  <label className="bm-form-field" style={span ? { gridColumn: `span ${span}` } : undefined}>
    <span className="bm-form-label">{label}</span>
    {children}
    {hint && <small className="bm-form-hint-inline">{hint}</small>}
  </label>
);

export default ServiceDetails;
