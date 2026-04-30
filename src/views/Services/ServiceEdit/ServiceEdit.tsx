import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { HiOutlinePencil, HiOutlineArrowLeft } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import servicesApi from "@/services/api/services.api";
import type { Service, ServiceCategory, UpdateServiceRequest } from "@/types/api.types";
import "../ServiceList/ServiceList.scss";
import "../ServiceCreate/ServiceCreate.scss";

const ServiceEdit = () => {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [svc, setSvc] = useState<Service | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [form, setForm] = useState<UpdateServiceRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [r, cats] = await Promise.all([servicesApi.get(id, false), servicesApi.listCategories(false)]);
        setSvc(r.data);
        setCategories(cats.data || []);
        setForm({
          category_id: r.data.category_id,
          name: r.data.name,
          short_description: r.data.short_description || "",
          description: r.data.description || "",
          department: r.data.department || "",
          ministry: r.data.ministry || "",
          issuing_authority: r.data.issuing_authority || "",
          official_url: r.data.official_url || "",
          base_government_fee: r.data.base_government_fee,
          base_platform_fee: r.data.base_platform_fee,
          base_gst_percent: r.data.base_gst_percent,
          base_processing_time: r.data.base_processing_time || "",
          is_free: r.data.is_free,
          tags: r.data.tags || [],
          target_audience: r.data.target_audience || "citizen",
          is_active: r.data.is_active,
          is_popular: r.data.is_popular,
          is_featured: r.data.is_featured,
          is_new: r.data.is_new,
          sort_order: r.data.sort_order,
        });
      } catch {
        setError("Failed to load service");
      } finally { setLoading(false); }
    })();
  }, [id]);

  const set = <K extends keyof UpdateServiceRequest>(k: K, v: UpdateServiceRequest[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !(form.tags || []).includes(t)) set("tags", [...(form.tags || []), t]);
    setTagInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await servicesApi.update(id, form);
      nav(`/services/${id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || "Failed to save");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="bm-services"><div className="bm-empty">Loading…</div></div>;
  if (!svc) return <div className="bm-services"><div className="bm-alert bm-alert-error">{error || "Not found"}</div></div>;

  const totalFee = form.is_free ? 0 :
    Math.round((form.base_government_fee || 0) + (form.base_platform_fee || 0)) +
    Math.round(((form.base_government_fee || 0) + (form.base_platform_fee || 0)) * (form.base_gst_percent || 0) / 100);

  return (
    <div className="bm-services bm-svc-create">
      <PageHeader
        icon={<HiOutlinePencil />}
        title={`Edit ${svc.name}`}
        description="Update the service catalog entry. Profile/pricing variants are managed on the details page."
        actions={<Link to={`/services/${id}`} className="bm-btn"><HiOutlineArrowLeft /> Back</Link>}
      />

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <form className="bm-form-card" onSubmit={submit}>
        <h3 className="bm-form-section-title">Identity</h3>
        <div className="bm-form-grid">
          <Field label="Service name">
            <input value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Category">
            <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Code (read-only)">
            <input value={svc.code} disabled />
          </Field>
        </div>

        <h3 className="bm-form-section-title">Description</h3>
        <div className="bm-form-grid">
          <Field label="Short description" span={2}>
            <input value={form.short_description || ""} onChange={(e) => set("short_description", e.target.value)} maxLength={200} />
          </Field>
          <Field label="Long description" span={2}>
            <textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={4} />
          </Field>
        </div>

        <h3 className="bm-form-section-title">Department &amp; authority</h3>
        <div className="bm-form-grid">
          <Field label="Department"><input value={form.department || ""} onChange={(e) => set("department", e.target.value)} /></Field>
          <Field label="Ministry"><input value={form.ministry || ""} onChange={(e) => set("ministry", e.target.value)} /></Field>
          <Field label="Issuing authority"><input value={form.issuing_authority || ""} onChange={(e) => set("issuing_authority", e.target.value)} /></Field>
          <Field label="Official URL"><input type="url" value={form.official_url || ""} onChange={(e) => set("official_url", e.target.value)} /></Field>
        </div>

        <h3 className="bm-form-section-title">Default fees</h3>
        <div className="bm-form-grid">
          <Field label="Government fee (₹)">
            <input type="number" step="0.01" min="0" value={form.base_government_fee || 0} onChange={(e) => set("base_government_fee", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
          </Field>
          <Field label="Platform fee (₹)">
            <input type="number" step="0.01" min="0" value={form.base_platform_fee || 0} onChange={(e) => set("base_platform_fee", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
          </Field>
          <Field label="GST %">
            <input type="number" step="0.01" min="0" max="28" value={form.base_gst_percent || 0} onChange={(e) => set("base_gst_percent", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
          </Field>
          <Field label="Processing time">
            <input value={form.base_processing_time || ""} onChange={(e) => set("base_processing_time", e.target.value)} />
          </Field>
          <div className="bm-form-checks">
            <label className="bm-check">
              <input type="checkbox" checked={form.is_free || false} onChange={(e) => set("is_free", e.target.checked)} />
              Free service
            </label>
          </div>
          <div className="bm-fee-preview">
            <span className="l">Citizen pays</span>
            <span className="n">{form.is_free ? "FREE" : `₹ ${totalFee.toLocaleString("en-IN")}`}</span>
          </div>
        </div>

        <h3 className="bm-form-section-title">Visibility</h3>
        <div className="bm-form-grid">
          <Field label="Tags" span={2}>
            <div className="bm-tag-input-wrap">
              <div className="bm-tag-list">
                {(form.tags || []).map(t => (
                  <span key={t} className="bm-tag">
                    {t}
                    <button type="button" onClick={() => set("tags", (form.tags || []).filter(x => x !== t))}>×</button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type and press Enter…"
              />
            </div>
          </Field>
          <div className="bm-form-checks">
            <label className="bm-check"><input type="checkbox" checked={form.is_active || false} onChange={(e) => set("is_active", e.target.checked)} /> Active</label>
            <label className="bm-check"><input type="checkbox" checked={form.is_popular || false} onChange={(e) => set("is_popular", e.target.checked)} /> Popular</label>
            <label className="bm-check"><input type="checkbox" checked={form.is_featured || false} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
            <label className="bm-check"><input type="checkbox" checked={form.is_new || false} onChange={(e) => set("is_new", e.target.checked)} /> New</label>
          </div>
        </div>

        <div className="bm-form-actions">
          <Link to={`/services/${id}`} className="bm-btn">Cancel</Link>
          <button type="submit" className="bm-btn bm-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, span, children }: { label: string; span?: number; children: React.ReactNode }) => (
  <label className="bm-form-field" style={span ? { gridColumn: `span ${span}` } : undefined}>
    <span className="bm-form-label">{label}</span>
    {children}
  </label>
);

export default ServiceEdit;
