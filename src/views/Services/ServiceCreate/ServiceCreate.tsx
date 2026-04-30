import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlinePlusCircle, HiOutlineArrowLeft } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import servicesApi from "@/services/api/services.api";
import type { CreateServiceRequest, ServiceCategory } from "@/types/api.types";
import "../ServiceList/ServiceList.scss";
import "./ServiceCreate.scss";

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const ServiceCreate = () => {
  const nav = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [form, setForm] = useState<CreateServiceRequest>({
    category_id: "",
    code: "",
    name: "",
    name_hindi: "",
    short_description: "",
    description: "",
    department: "",
    ministry: "",
    base_government_fee: 0,
    base_platform_fee: 0,
    base_gst_percent: 18,
    base_processing_time: "",
    is_free: false,
    target_audience: "citizen",
    is_popular: false,
    is_featured: false,
    is_new: true,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await servicesApi.listCategories(false);
        setCategories(r.data || []);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message || "Failed to load categories");
      }
    })();
  }, []);

  const set = <K extends keyof CreateServiceRequest>(k: K, v: CreateServiceRequest[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  // Auto-derive slug + code from name
  const onNameChange = (v: string) => {
    const next: Partial<CreateServiceRequest> = { name: v };
    if (!form.code || form.code === slugify(form.name)) next.code = slugify(v);
    setForm(p => ({ ...p, ...next }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !(form.tags || []).includes(t)) {
      setForm(p => ({ ...p, tags: [...(p.tags || []), t] }));
    }
    setTagInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.category_id) { setError("Please pick a category."); return; }
    if (!form.name.trim()) { setError("Service name is required."); return; }
    if (!form.code.trim()) { setError("Code is required."); return; }
    setSubmitting(true);
    try {
      const r = await servicesApi.create({
        ...form,
        slug: slugify(form.name),
        name_hindi: form.name_hindi || undefined,
        short_description: form.short_description || undefined,
        description: form.description || undefined,
        department: form.department || undefined,
        ministry: form.ministry || undefined,
        base_processing_time: form.base_processing_time || undefined,
      });
      nav(`/services/${r.data.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  };

  const totalFee = form.is_free ? 0 :
    Math.round((form.base_government_fee || 0) + (form.base_platform_fee || 0)) +
    Math.round(((form.base_government_fee || 0) + (form.base_platform_fee || 0)) * (form.base_gst_percent || 0) / 100);

  return (
    <div className="bm-services bm-svc-create">
      <PageHeader
        icon={<HiOutlinePlusCircle />}
        title="Add a service"
        description="Create a new service in the catalog. We'll auto-create the default profile + pricing — you can add state/category/channel variants right after."
        actions={<Link to="/services" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>}
      />

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <form className="bm-form-card" onSubmit={submit}>
        <h3 className="bm-form-section-title">1. Identity</h3>
        <div className="bm-form-grid">
          <Field label="Service name *">
            <input type="text" value={form.name} onChange={(e) => onNameChange(e.target.value)} required placeholder="e.g. Ayushman Bharat Card" />
          </Field>
          <Field label="Service name (Hindi)">
            <input type="text" value={form.name_hindi || ""} onChange={(e) => set("name_hindi", e.target.value)} placeholder="e.g. आयुष्मान भारत कार्ड" />
          </Field>
          <Field label="Code *" hint="Stable identifier — used in URLs and seed data. Auto-derived from name.">
            <input type="text" value={form.code} onChange={(e) => set("code", e.target.value)} required pattern="[a-z0-9-]+" />
          </Field>
          <Field label="Category *">
            <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} required>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <h3 className="bm-form-section-title">2. Description</h3>
        <div className="bm-form-grid">
          <Field label="Short description" hint="One sentence shown on the catalog card." span={2}>
            <input type="text" value={form.short_description || ""} onChange={(e) => set("short_description", e.target.value)} maxLength={200} placeholder="e.g. Free health-insurance cover up to ₹5 lakh per family per year." />
          </Field>
          <Field label="Long description" span={2}>
            <textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={4} />
          </Field>
        </div>

        <h3 className="bm-form-section-title">3. Department &amp; authority</h3>
        <div className="bm-form-grid">
          <Field label="Department">
            <input type="text" value={form.department || ""} onChange={(e) => set("department", e.target.value)} placeholder="e.g. UIDAI, RTO, Income Tax Dept" />
          </Field>
          <Field label="Ministry">
            <input type="text" value={form.ministry || ""} onChange={(e) => set("ministry", e.target.value)} placeholder="e.g. Ministry of Finance" />
          </Field>
          <Field label="Issuing authority">
            <input type="text" value={form.issuing_authority || ""} onChange={(e) => set("issuing_authority", e.target.value)} placeholder="e.g. Sub-Registrar Office" />
          </Field>
          <Field label="Official URL">
            <input type="url" value={form.official_url || ""} onChange={(e) => set("official_url", e.target.value)} placeholder="https://" />
          </Field>
        </div>

        <h3 className="bm-form-section-title">4. Default fees &amp; processing</h3>
        <p className="bm-form-hint">These become the default profile. You can add state-specific or applicant-specific variants right after creation.</p>
        <div className="bm-form-grid">
          <Field label="Government fee (₹)">
            <input type="number" step="0.01" min="0" value={form.base_government_fee} onChange={(e) => set("base_government_fee", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
          </Field>
          <Field label="Platform fee (₹)">
            <input type="number" step="0.01" min="0" value={form.base_platform_fee} onChange={(e) => set("base_platform_fee", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
          </Field>
          <Field label="GST %">
            <input type="number" step="0.01" min="0" max="28" value={form.base_gst_percent} onChange={(e) => set("base_gst_percent", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
          </Field>
          <Field label="Processing time">
            <input type="text" value={form.base_processing_time || ""} onChange={(e) => set("base_processing_time", e.target.value)} placeholder="e.g. 7-15 days" />
          </Field>
          <div className="bm-form-checks">
            <label className="bm-check">
              <input type="checkbox" checked={form.is_free || false} onChange={(e) => set("is_free", e.target.checked)} />
              This is a free service
            </label>
          </div>
          <div className="bm-fee-preview">
            <span className="l">Citizen pays</span>
            <span className="n">{form.is_free ? "FREE" : `₹ ${totalFee.toLocaleString("en-IN")}`}</span>
            {!form.is_free && <span className="bm-fee-hint">(govt + platform + GST)</span>}
          </div>
        </div>

        <h3 className="bm-form-section-title">5. Visibility &amp; tags</h3>
        <div className="bm-form-grid">
          <Field label="Target audience">
            <select value={form.target_audience || "citizen"} onChange={(e) => set("target_audience", e.target.value)}>
              <option value="citizen">Citizen</option>
              <option value="farmer">Farmer</option>
              <option value="business">Business</option>
              <option value="student">Student</option>
              <option value="senior">Senior citizen</option>
              <option value="msme">MSME</option>
            </select>
          </Field>
          <Field label="Tags" hint="Press Enter to add. Common: popular, govt-backed, express, popular." span={2}>
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
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type and press Enter…"
              />
            </div>
          </Field>
          <div className="bm-form-checks">
            <label className="bm-check">
              <input type="checkbox" checked={form.is_popular || false} onChange={(e) => set("is_popular", e.target.checked)} />
              Show as Popular
            </label>
            <label className="bm-check">
              <input type="checkbox" checked={form.is_featured || false} onChange={(e) => set("is_featured", e.target.checked)} />
              Show as Featured
            </label>
            <label className="bm-check">
              <input type="checkbox" checked={form.is_new || false} onChange={(e) => set("is_new", e.target.checked)} />
              Mark as New
            </label>
          </div>
        </div>

        <div className="bm-form-actions">
          <Link to="/services" className="bm-btn">Cancel</Link>
          <button type="submit" className="bm-btn bm-btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create service"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, hint, span, children }: { label: string; hint?: string; span?: number; children: React.ReactNode }) => (
  <label className="bm-form-field" style={span ? { gridColumn: `span ${span}` } : undefined}>
    <span className="bm-form-label">{label}</span>
    {children}
    {hint && <small className="bm-form-hint-inline">{hint}</small>}
  </label>
);

export default ServiceCreate;
