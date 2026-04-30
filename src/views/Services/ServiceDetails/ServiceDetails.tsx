import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineCollection, HiOutlinePencil, HiOutlineArrowLeft, HiOutlineTrash,
  HiOutlinePlus, HiOutlineCurrencyRupee, HiOutlineSparkles, HiOutlineLightningBolt
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import servicesApi from "@/services/api/services.api";
import type { Service, ServiceProfile, ServiceCompleteResponse } from "@/types/api.types";
import "../ServiceList/ServiceList.scss";
import "./ServiceDetails.scss";

type Tab = "overview" | "profiles" | "pricing" | "documents" | "workflow" | "faqs";

const ServiceDetails = () => {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [svc, setSvc] = useState<Service | null>(null);
  const [profiles, setProfiles] = useState<ServiceProfile[]>([]);
  const [complete, setComplete] = useState<ServiceCompleteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await servicesApi.get(id, true);
      setSvc(r.data);
      setProfiles(r.data.profiles || []);
      const cR = await servicesApi.getComplete(id);
      setComplete(cR.data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string };
      setError(e.response?.status === 404 ? "Service not found" : e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

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
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="bm-services"><div className="bm-empty">Loading…</div></div>;
  if (error || !svc) return (
    <div className="bm-services">
      <div className="bm-alert bm-alert-error">{error}</div>
      <Link to="/services" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>
    </div>
  );

  const total = svc.base_government_fee + svc.base_platform_fee;

  return (
    <div className="bm-services bm-svc-details">
      <PageHeader
        icon={<HiOutlineCollection />}
        title={svc.name}
        description={svc.short_description || svc.description || ""}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/services" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>
            <Link to={`/services/${svc.id}/edit`} className="bm-btn"><HiOutlinePencil /> Edit</Link>
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
          <span>·</span>
          <code>{svc.code}</code>
          {svc.is_featured && <span className="bm-badge bm-badge-featured"><HiOutlineLightningBolt /> Featured</span>}
          {svc.is_popular && <span className="bm-badge bm-badge-popular"><HiOutlineSparkles /> Popular</span>}
          {svc.is_new && <span className="bm-badge bm-badge-new">New</span>}
        </div>
        <div className="bm-svc-hero-stats">
          <div><span className="l">Base fee</span><span className="n">{svc.is_free ? "FREE" : <><HiOutlineCurrencyRupee />{total.toFixed(0)}</>}</span></div>
          <div><span className="l">Processing</span><span className="n">{svc.base_processing_time || "—"}</span></div>
          <div><span className="l">Profiles</span><span className="n">{profiles.length}</span></div>
          <div><span className="l">Department</span><span className="n">{svc.department || "—"}</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bm-tabs">
        {(["overview", "profiles", "pricing", "documents", "workflow", "faqs"] as Tab[]).map(t => (
          <button key={t} className={`bm-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "profiles" && profiles.length > 0 && <span className="bm-tab-count">{profiles.length}</span>}
            {t === "documents" && (complete?.documents?.length || 0) > 0 && <span className="bm-tab-count">{complete?.documents?.length}</span>}
            {t === "workflow" && (complete?.workflow?.length || 0) > 0 && <span className="bm-tab-count">{complete?.workflow?.length}</span>}
            {t === "faqs" && (complete?.faqs?.length || 0) > 0 && <span className="bm-tab-count">{complete?.faqs?.length}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
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

      {tab === "profiles" && (
        <div>
          <p className="bm-text-muted" style={{ marginBottom: 12 }}>
            Profiles are variants of this service — different state, different applicant category (BPL/APL/SC/ST/etc.), or different channel (online/agent/tatkal). Each profile can override pricing and processing time.
          </p>
          {profiles.length === 0 ? (
            <div className="bm-empty">No profiles yet.</div>
          ) : (
            <table className="bm-table">
              <thead>
                <tr>
                  <th>Profile code</th><th>State</th><th>Applicant category</th><th>Channel</th>
                  <th>Processing</th><th>Total fee</th><th>Default</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id}>
                    <td><code>{p.profile_code}</code></td>
                    <td>{p.state_code || <span className="bm-text-muted">—</span>}</td>
                    <td>{p.applicant_category || <span className="bm-text-muted">—</span>}</td>
                    <td>{p.channel || <span className="bm-text-muted">—</span>}</td>
                    <td>{p.processing_time || svc.base_processing_time || "—"}</td>
                    <td>{p.pricing?.is_free ? "FREE" : `₹${p.pricing?.total_amount?.toFixed(0) ?? "—"}`}</td>
                    <td>{p.is_default ? "✓" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "pricing" && complete?.pricing && (
        <Card title={`Pricing (default profile)`}>
          <Row k="Government fee" v={`₹ ${complete.pricing.government_fee}`} />
          <Row k="Platform fee" v={`₹ ${complete.pricing.platform_fee}`} />
          <Row k="Convenience fee" v={`₹ ${complete.pricing.convenience_fee}`} />
          <Row k="Agent commission" v={`₹ ${complete.pricing.agent_commission}`} />
          <Row k="GST %" v={`${complete.pricing.gst_percent}%`} />
          <Row k="Total amount" v={<b>₹ {complete.pricing.total_amount.toFixed(2)}</b>} />
          <Row k="Free service" v={complete.pricing.is_free ? "Yes" : "No"} />
          <Row k="Refund policy" v={complete.pricing.refund_policy || "—"} />
        </Card>
      )}

      {tab === "documents" && (
        <div>
          {(complete?.documents || []).length === 0 ? (
            <div className="bm-empty">No documents required (yet) for this service. Add them in Edit mode.</div>
          ) : (
            <table className="bm-table">
              <thead><tr><th>Document</th><th>Type</th><th>Mandatory</th><th>Max size</th><th>Sample</th></tr></thead>
              <tbody>
                {complete!.documents!.map(d => (
                  <tr key={d.id}>
                    <td>{d.document_name}</td>
                    <td><code>{d.document_type}</code></td>
                    <td>{d.is_mandatory ? "Yes" : "No"}</td>
                    <td>{d.max_size_mb} MB</td>
                    <td>{d.sample_url ? <a href={d.sample_url} target="_blank" rel="noopener">View</a> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "workflow" && (
        <div>
          {(complete?.workflow || []).length === 0 ? (
            <div className="bm-empty">No workflow steps defined yet.</div>
          ) : (
            <ol className="bm-workflow">
              {complete!.workflow!.map(step => (
                <li key={step.id} className="bm-workflow-step">
                  <div className="bm-step-num">{step.step_number}</div>
                  <div className="bm-step-body">
                    <h4>{step.step_name}</h4>
                    {step.step_description && <p>{step.step_description}</p>}
                    <div className="bm-step-meta">
                      <span>Type: <code>{step.step_type}</code></span>
                      {step.assigned_role && <span>Assigned: <code>{step.assigned_role}</code></span>}
                      {step.sla_hours !== undefined && step.sla_hours !== null && <span>SLA: {step.sla_hours}h</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {tab === "faqs" && (
        <div>
          {(complete?.faqs || []).length === 0 ? (
            <div className="bm-empty">No FAQs added yet.</div>
          ) : (
            complete!.faqs!.map(f => (
              <details key={f.id} className="bm-faq">
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))
          )}
          <Link to={`/services/${svc.id}/edit`} className="bm-btn" style={{ marginTop: 16 }}>
            <HiOutlinePlus /> Add FAQ
          </Link>
        </div>
      )}
    </div>
  );
};

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

export default ServiceDetails;
