import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HiOutlinePlusCircle, HiOutlineArrowLeft, HiOutlineCheck, HiOutlineX,
  HiOutlinePlus, HiOutlineDocumentText, HiOutlineCollection,
  HiOutlineQuestionMarkCircle, HiOutlineCurrencyRupee
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import servicesApi from "@/services/api/services.api";
import type { CreateServiceRequest, ServiceCategory } from "@/types/api.types";
import "../ServiceList/ServiceList.scss";
import "./ServiceCreate.scss";

// =====================================================================
// Types staged client-side; sent in batch after the service is created.
// =====================================================================

const DOC_TYPES = [
  "id_proof", "address_proof", "dob_proof", "photo", "signature",
  "aadhaar", "pan", "passport", "bank", "dsc", "form", "medical",
  "supporting", "mobile_otp", "income_proof",
];

const FIELD_TYPES = [
  { value: "text",     label: "Text" },
  { value: "email",    label: "Email" },
  { value: "tel",      label: "Phone number" },
  { value: "number",   label: "Number" },
  { value: "date",     label: "Date" },
  { value: "select",   label: "Dropdown" },
  { value: "radio",    label: "Radio buttons" },
  { value: "checkbox", label: "Checkbox" },
  { value: "textarea", label: "Long text (textarea)" },
  { value: "file",     label: "File upload" },
] as const;

interface DraftDoc {
  uid: string;
  document_name: string;
  code: string;
  document_type: string;
  is_mandatory: boolean;
  alternatives_group: string;
  max_size_mb: number;
  description: string;
}

interface DraftField {
  uid: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  help_text: string;
  options: string;            // comma-separated for select / radio
}

interface DraftSection {
  uid: string;
  title: string;
  fields: DraftField[];
}

interface DraftFAQ {
  uid: string;
  question: string;
  answer: string;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const newId = () => Math.random().toString(36).slice(2, 9);

// =====================================================================
// Wizard steps
// =====================================================================

type Step = 1 | 2 | 3 | 4;

const STEP_META: Record<Step, { title: string; subtitle: string; icon: React.ReactNode }> = {
  1: { title: "Basics", subtitle: "Name, category, fees, description", icon: <HiOutlineCollection /> },
  2: { title: "Documents", subtitle: "What citizens need to upload", icon: <HiOutlineDocumentText /> },
  3: { title: "Form fields", subtitle: "What citizens need to fill in", icon: <HiOutlinePlusCircle /> },
  4: { title: "FAQs", subtitle: "Common questions and answers", icon: <HiOutlineQuestionMarkCircle /> },
};

// =====================================================================
// Component
// =====================================================================

const ServiceCreate = () => {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  // Step 1 — basics
  const [form, setForm] = useState<CreateServiceRequest>({
    category_id: "",
    code: "",
    name: "",
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
    // Application routing flags (added 2026-05-02). Default: routes to
    // a caseworker; agent cannot complete on their own.
    requires_caseworker: true,
    agent_can_complete: false,
  });
  const [tagInput, setTagInput] = useState("");

  // Step 2 — documents
  const [docs, setDocs] = useState<DraftDoc[]>([]);

  // Step 3 — form sections + fields
  const [sections, setSections] = useState<DraftSection[]>([
    {
      uid: newId(),
      title: "Personal Details",
      fields: [
        { uid: newId(), name: "full_name", label: "Full name", type: "text", required: true, placeholder: "As on Aadhaar", help_text: "", options: "" },
        { uid: newId(), name: "mobile",    label: "Mobile number", type: "tel", required: true, placeholder: "10-digit number", help_text: "", options: "" },
      ]
    }
  ]);

  // Step 4 — FAQs
  const [faqs, setFaqs] = useState<DraftFAQ[]>([]);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await servicesApi.listCategories(false);
        setCategories(r.data || []);
      } catch (e: unknown) {
        const ex = e as { message?: string };
        setError(ex.message || "Failed to load categories");
      }
    })();
  }, []);

  // ---- Step 1 helpers ----
  const setField = <K extends keyof CreateServiceRequest>(k: K, v: CreateServiceRequest[K]) =>
    setForm(p => ({ ...p, [k]: v }));

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

  // ---- Step 2 helpers ----
  const addDoc = () =>
    setDocs(p => [...p, {
      uid: newId(), document_name: "", code: "", document_type: "id_proof",
      is_mandatory: true, alternatives_group: "", max_size_mb: 5, description: ""
    }]);

  const updateDoc = (uid: string, patch: Partial<DraftDoc>) =>
    setDocs(p => p.map(d => d.uid === uid ? { ...d, ...patch, code: patch.document_name && !d.code ? slugify(patch.document_name) : (patch.code ?? d.code) } : d));

  const removeDoc = (uid: string) => setDocs(p => p.filter(d => d.uid !== uid));

  // ---- Step 3 helpers ----
  const addSection = () =>
    setSections(p => [...p, { uid: newId(), title: "New section", fields: [] }]);

  const updateSection = (uid: string, patch: Partial<DraftSection>) =>
    setSections(p => p.map(s => s.uid === uid ? { ...s, ...patch } : s));

  const removeSection = (uid: string) => setSections(p => p.filter(s => s.uid !== uid));

  const addField = (sectionUid: string) =>
    setSections(p => p.map(s => s.uid === sectionUid ? {
      ...s, fields: [...s.fields, {
        uid: newId(), name: "new_field", label: "New field", type: "text",
        required: false, placeholder: "", help_text: "", options: ""
      }]
    } : s));

  const updateField = (sectionUid: string, fieldUid: string, patch: Partial<DraftField>) =>
    setSections(p => p.map(s => s.uid === sectionUid ? {
      ...s, fields: s.fields.map(f => f.uid === fieldUid ? { ...f, ...patch } : f)
    } : s));

  const removeField = (sectionUid: string, fieldUid: string) =>
    setSections(p => p.map(s => s.uid === sectionUid ? {
      ...s, fields: s.fields.filter(f => f.uid !== fieldUid)
    } : s));

  // ---- Step 4 helpers ----
  const addFAQ = () => setFaqs(p => [...p, { uid: newId(), question: "", answer: "" }]);
  const updateFAQ = (uid: string, patch: Partial<DraftFAQ>) =>
    setFaqs(p => p.map(f => f.uid === uid ? { ...f, ...patch } : f));
  const removeFAQ = (uid: string) => setFaqs(p => p.filter(f => f.uid !== uid));

  // ---- Validation ----
  const step1Errors = useMemo(() => {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Service name is required");
    if (!form.code.trim()) errs.push("Code is required");
    if (!form.category_id) errs.push("Pick a category");
    return errs;
  }, [form.name, form.code, form.category_id]);

  const canPublish = step1Errors.length === 0;

  // ---- Submit (batched) ----
  const submit = async () => {
    setError(null);
    if (!canPublish) {
      setStep(1);
      setError(step1Errors.join(" · "));
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create service
      setProgress("Creating service…");
      const r = await servicesApi.create({
        ...form,
        slug: slugify(form.name),
        short_description: form.short_description || undefined,
        description: form.description || undefined,
        department: form.department || undefined,
        ministry: form.ministry || undefined,
        base_processing_time: form.base_processing_time || undefined,
      });
      const svcId = r.data.id;

      // 2. Documents
      const validDocs = docs.filter(d => d.document_name.trim() && d.code.trim());
      for (let i = 0; i < validDocs.length; i++) {
        const d = validDocs[i];
        setProgress(`Adding document ${i + 1} of ${validDocs.length}…`);
        await servicesApi.createDocument(svcId, {
          code: d.code,
          document_name: d.document_name,
          document_type: d.document_type,
          is_mandatory: d.is_mandatory,
          alternatives_group: d.alternatives_group || undefined,
          max_size_mb: d.max_size_mb,
          description: d.description || undefined,
          sort_order: (i + 1) * 10,
        });
      }

      // 3. Form sections
      const validSections = sections.filter(s => s.title.trim() && s.fields.length > 0);
      for (let i = 0; i < validSections.length; i++) {
        const s = validSections[i];
        setProgress(`Adding section ${i + 1} of ${validSections.length}…`);
        const fieldSchema = s.fields.map(f => ({
          name: f.name || slugify(f.label),
          label: f.label,
          type: f.type,
          required: f.required,
          placeholder: f.placeholder || undefined,
          help_text: f.help_text || undefined,
          options: f.type === "select" || f.type === "radio"
            ? f.options.split(",").map(o => o.trim()).filter(Boolean)
            : undefined,
        }));
        await servicesApi.createFieldSection(svcId, {
          section_title: s.title,
          section_order: (i + 1) * 10,
          field_schema: fieldSchema,
        });
      }

      // 4. FAQs
      const validFAQs = faqs.filter(f => f.question.trim() && f.answer.trim());
      for (let i = 0; i < validFAQs.length; i++) {
        const f = validFAQs[i];
        setProgress(`Adding FAQ ${i + 1} of ${validFAQs.length}…`);
        await servicesApi.createFAQ(svcId, {
          question: f.question,
          answer: f.answer,
          sort_order: (i + 1) * 10,
        });
      }

      setProgress("Done");
      nav(`/services/${svcId}`);
    } catch (e: unknown) {
      const ex = e as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(ex.response?.data?.error?.message || ex.message || "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ UI ============

  const totalFee = form.is_free ? 0 :
    Math.round((form.base_government_fee || 0) + (form.base_platform_fee || 0)) +
    Math.round(((form.base_government_fee || 0) + (form.base_platform_fee || 0)) * (form.base_gst_percent || 0) / 100);

  return (
    <div className="bm-services bm-svc-create">
      <PageHeader
        icon={<HiOutlinePlusCircle />}
        title="Add a service"
        description="Set up a new service in the catalog. We auto-create a default profile + pricing, then attach the documents, form fields, and FAQs you define here."
        actions={<Link to="/services" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>}
      />

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <div className="bm-wizard-grid">
        <div className="bm-wizard-main">
          {/* Step indicator */}
          <ol className="bm-wizard-steps">
            {([1, 2, 3, 4] as Step[]).map(n => (
              <li
                key={n}
                className={`bm-wizard-step ${step === n ? "active" : ""} ${step > n ? "done" : ""}`}
                onClick={() => setStep(n)}
              >
                <div className="bm-step-circle">
                  {step > n ? <HiOutlineCheck /> : <span>{n}</span>}
                </div>
                <div className="bm-step-text">
                  <span className="bm-step-title">{STEP_META[n].title}</span>
                  <span className="bm-step-sub">{STEP_META[n].subtitle}</span>
                </div>
              </li>
            ))}
          </ol>

          {step === 1 && (
            <BasicsStep
              form={form}
              setField={setField}
              onNameChange={onNameChange}
              categories={categories}
              tagInput={tagInput}
              setTagInput={setTagInput}
              addTag={addTag}
            />
          )}

          {step === 2 && (
            <DocumentsStep docs={docs} addDoc={addDoc} updateDoc={updateDoc} removeDoc={removeDoc} />
          )}

          {step === 3 && (
            <FieldsStep
              sections={sections}
              addSection={addSection}
              updateSection={updateSection}
              removeSection={removeSection}
              addField={addField}
              updateField={updateField}
              removeField={removeField}
            />
          )}

          {step === 4 && (
            <FAQsStep faqs={faqs} addFAQ={addFAQ} updateFAQ={updateFAQ} removeFAQ={removeFAQ} />
          )}

          {/* Step nav */}
          <div className="bm-wizard-nav">
            <button
              className="bm-btn"
              onClick={() => setStep((step - 1) as Step)}
              disabled={step === 1 || submitting}
            >
              ← Previous
            </button>
            {step < 4 ? (
              <button
                className="bm-btn bm-btn-primary"
                onClick={() => setStep((step + 1) as Step)}
                disabled={submitting}
              >
                Next: {STEP_META[(step + 1) as Step].title} →
              </button>
            ) : (
              <button
                className="bm-btn bm-btn-primary"
                onClick={submit}
                disabled={!canPublish || submitting}
              >
                {submitting ? (progress || "Publishing…") : "Publish service"}
              </button>
            )}
          </div>
        </div>

        {/* Sticky review sidebar */}
        <aside className="bm-wizard-aside">
          <div className="bm-wizard-aside-card">
            <h4>Preview</h4>
            <div className="bm-preview">
              <p className="bm-preview-name">{form.name || "(unnamed service)"}</p>
              <p className="bm-preview-cat">
                {categories.find(c => c.id === form.category_id)?.name || "No category"}
              </p>
              <div className="bm-preview-fee">
                {form.is_free ? (
                  <span className="bm-preview-fee-free">FREE</span>
                ) : (
                  <span><HiOutlineCurrencyRupee />{totalFee}</span>
                )}
              </div>
              <p className="bm-preview-meta">
                {form.base_processing_time || "Processing time —"}
              </p>
            </div>
          </div>

          <div className="bm-wizard-aside-card">
            <h4>What's set up</h4>
            <ul className="bm-checklist">
              <li className={form.name && form.code && form.category_id ? "ok" : ""}>
                <span>Basics</span>
                <strong>{form.name && form.code && form.category_id ? "✓ Ready" : "Incomplete"}</strong>
              </li>
              <li className={docs.filter(d => d.document_name).length > 0 ? "ok" : ""}>
                <span>Documents</span>
                <strong>{docs.filter(d => d.document_name).length}</strong>
              </li>
              <li className={sections.filter(s => s.fields.length > 0).length > 0 ? "ok" : ""}>
                <span>Form sections</span>
                <strong>
                  {sections.filter(s => s.fields.length > 0).length}
                  {" / "}
                  {sections.reduce((n, s) => n + s.fields.length, 0)} fields
                </strong>
              </li>
              <li className={faqs.filter(f => f.question).length > 0 ? "ok" : ""}>
                <span>FAQs</span>
                <strong>{faqs.filter(f => f.question).length}</strong>
              </li>
            </ul>
          </div>

          {step1Errors.length > 0 && (
            <div className="bm-wizard-aside-card bm-wizard-aside-warn">
              <h4>Required to publish</h4>
              <ul>
                {step1Errors.map(e => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

// =====================================================================
// STEP 1 — Basics
// =====================================================================

const BasicsStep = ({ form, setField, onNameChange, categories, tagInput, setTagInput, addTag }: {
  form: CreateServiceRequest;
  setField: <K extends keyof CreateServiceRequest>(k: K, v: CreateServiceRequest[K]) => void;
  onNameChange: (v: string) => void;
  categories: ServiceCategory[];
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
}) => {
  const totalFee = form.is_free ? 0 :
    Math.round((form.base_government_fee || 0) + (form.base_platform_fee || 0)) +
    Math.round(((form.base_government_fee || 0) + (form.base_platform_fee || 0)) * (form.base_gst_percent || 0) / 100);

  return (
    <div className="bm-form-card">
      <h3 className="bm-form-section-title">1. Identity</h3>
      <div className="bm-form-grid">
        <Field label="Service name *">
          <input value={form.name} onChange={(e) => onNameChange(e.target.value)} required placeholder="e.g. Ayushman Bharat Card" />
        </Field>
        <Field label="Code *" hint="Stable identifier — used in URLs and seed data. Auto-derived from name.">
          <input value={form.code} onChange={(e) => setField("code", e.target.value)} required pattern="[a-z0-9-]+" />
        </Field>
        <Field label="Category *">
          <select value={form.category_id} onChange={(e) => setField("category_id", e.target.value)} required>
            <option value="">Select category…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      <h3 className="bm-form-section-title">2. Description</h3>
      <div className="bm-form-grid">
        <Field label="Short description" hint="One sentence shown on the catalog card." span={2}>
          <input value={form.short_description || ""} onChange={(e) => setField("short_description", e.target.value)} maxLength={200} placeholder="e.g. Free health-insurance cover up to ₹5 lakh per family per year." />
        </Field>
        <Field label="Long description" span={2}>
          <textarea value={form.description || ""} onChange={(e) => setField("description", e.target.value)} rows={4} />
        </Field>
      </div>

      <h3 className="bm-form-section-title">3. Department &amp; authority</h3>
      <div className="bm-form-grid">
        <Field label="Department">
          <input value={form.department || ""} onChange={(e) => setField("department", e.target.value)} placeholder="e.g. UIDAI, RTO, Income Tax Dept" />
        </Field>
        <Field label="Ministry">
          <input value={form.ministry || ""} onChange={(e) => setField("ministry", e.target.value)} placeholder="e.g. Ministry of Finance" />
        </Field>
        <Field label="Issuing authority">
          <input value={form.issuing_authority || ""} onChange={(e) => setField("issuing_authority", e.target.value)} placeholder="e.g. Sub-Registrar Office" />
        </Field>
        <Field label="Official URL">
          <input type="url" value={form.official_url || ""} onChange={(e) => setField("official_url", e.target.value)} placeholder="https://" />
        </Field>
      </div>

      <h3 className="bm-form-section-title">4. Default fees &amp; processing</h3>
      <p className="bm-form-hint">These become the default profile. You can add state-specific or applicant-specific variants right after creation.</p>
      <div className="bm-form-grid">
        <Field label="Government fee (₹)">
          <input type="number" step="0.01" min="0" value={form.base_government_fee} onChange={(e) => setField("base_government_fee", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
        </Field>
        <Field label="Platform fee (₹)">
          <input type="number" step="0.01" min="0" value={form.base_platform_fee} onChange={(e) => setField("base_platform_fee", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
        </Field>
        <Field label="GST %">
          <input type="number" step="0.01" min="0" max="28" value={form.base_gst_percent} onChange={(e) => setField("base_gst_percent", parseFloat(e.target.value) || 0)} disabled={form.is_free} />
        </Field>
        <Field label="Processing time">
          <input value={form.base_processing_time || ""} onChange={(e) => setField("base_processing_time", e.target.value)} placeholder="e.g. 7-15 days" />
        </Field>
        <div className="bm-form-checks">
          <label className="bm-check">
            <input type="checkbox" checked={form.is_free || false} onChange={(e) => setField("is_free", e.target.checked)} />
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
          <select value={form.target_audience || "citizen"} onChange={(e) => setField("target_audience", e.target.value)}>
            <option value="citizen">Citizen</option>
            <option value="farmer">Farmer</option>
            <option value="business">Business</option>
            <option value="student">Student</option>
            <option value="senior">Senior citizen</option>
            <option value="msme">MSME</option>
          </select>
        </Field>
        <Field label="Tags" hint="Press Enter to add. Common: popular, govt-backed, express." span={2}>
          <div className="bm-tag-input-wrap">
            <div className="bm-tag-list">
              {(form.tags || []).map(t => (
                <span key={t} className="bm-tag">
                  {t}
                  <button type="button" onClick={() => setField("tags", (form.tags || []).filter(x => x !== t))}>×</button>
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
            <input type="checkbox" checked={form.is_popular || false} onChange={(e) => setField("is_popular", e.target.checked)} />
            Show as Popular
          </label>
          <label className="bm-check">
            <input type="checkbox" checked={form.is_featured || false} onChange={(e) => setField("is_featured", e.target.checked)} />
            Show as Featured
          </label>
          <label className="bm-check">
            <input type="checkbox" checked={form.is_new || false} onChange={(e) => setField("is_new", e.target.checked)} />
            Mark as New
          </label>
        </div>

        <Field
          label="Application routing"
          hint="How an application for this service is processed once an agent submits it."
        >
          <div className="bm-routing-toggles">
            <label className="bm-routing-card">
              <input
                type="checkbox"
                checked={form.requires_caseworker !== false}
                onChange={(e) => setField("requires_caseworker", e.target.checked)}
              />
              <div>
                <strong>Auto-assign to caseworker</strong>
                <small>Routes to the caseworker covering the citizen's GP at submit time. Most services need this.</small>
              </div>
            </label>
            <label className="bm-routing-card">
              <input
                type="checkbox"
                checked={form.agent_can_complete === true}
                onChange={(e) => setField("agent_can_complete", e.target.checked)}
              />
              <div>
                <strong>Agent can complete on their own</strong>
                <small>For simple services like Aadhaar download — agent finishes it without a caseworker. Both can be on; the agent then chooses per application.</small>
              </div>
            </label>
          </div>
          {!form.requires_caseworker && !form.agent_can_complete && (
            <div className="bm-routing-warn">⚠ At least one routing option must be enabled.</div>
          )}
        </Field>
      </div>
    </div>
  );
};

// =====================================================================
// STEP 2 — Documents
// =====================================================================

const DocumentsStep = ({ docs, addDoc, updateDoc, removeDoc }: {
  docs: DraftDoc[];
  addDoc: () => void;
  updateDoc: (uid: string, patch: Partial<DraftDoc>) => void;
  removeDoc: (uid: string) => void;
}) => (
  <div className="bm-form-card">
    <div className="bm-step-head">
      <div>
        <h3 className="bm-form-section-title" style={{ margin: 0 }}>Required documents</h3>
        <p className="bm-form-hint" style={{ margin: 0 }}>
          What citizens need to upload to complete this service. Mark documents as mandatory or optional.
          Use "Alternatives group" when one of several documents is enough — e.g. Aadhaar OR Voter ID.
        </p>
      </div>
      <button type="button" className="bm-btn bm-btn-primary" onClick={addDoc}>
        <HiOutlinePlus /> Add document
      </button>
    </div>

    {docs.length === 0 ? (
      <div className="bm-empty">
        No documents added yet. Click <strong>Add document</strong> to start the checklist.
      </div>
    ) : (
      <div className="bm-doc-list">
        {docs.map((d, idx) => (
          <div key={d.uid} className="bm-doc-row">
            <div className="bm-doc-row-num">{idx + 1}</div>
            <div className="bm-doc-row-body">
              <div className="bm-form-grid">
                <Field label="Document name *">
                  <input value={d.document_name} onChange={(e) => updateDoc(d.uid, { document_name: e.target.value })} placeholder="e.g. Passport-size photograph" />
                </Field>
                <Field label="Document type">
                  <select value={d.document_type} onChange={(e) => updateDoc(d.uid, { document_type: e.target.value })}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Alternatives group" hint="Same group = OR (one of these is enough)">
                  <input value={d.alternatives_group} onChange={(e) => updateDoc(d.uid, { alternatives_group: e.target.value })} placeholder="e.g. id_proof" />
                </Field>
                <Field label="Max size (MB)">
                  <input type="number" min="1" max="50" value={d.max_size_mb} onChange={(e) => updateDoc(d.uid, { max_size_mb: parseInt(e.target.value) || 5 })} />
                </Field>
                <Field label="Description / help text" span={2}>
                  <input value={d.description} onChange={(e) => updateDoc(d.uid, { description: e.target.value })} placeholder="e.g. Color, white background, taken in last 6 months" />
                </Field>
              </div>
              <label className="bm-check" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={d.is_mandatory} onChange={(e) => updateDoc(d.uid, { is_mandatory: e.target.checked })} />
                Mandatory (blocks submission if missing)
              </label>
            </div>
            <button type="button" className="bm-btn bm-btn-ghost bm-btn-sm" onClick={() => removeDoc(d.uid)}>
              <HiOutlineX />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// =====================================================================
// STEP 3 — Form fields (sections + fields)
// =====================================================================

const FieldsStep = ({ sections, addSection, updateSection, removeSection, addField, updateField, removeField }: {
  sections: DraftSection[];
  addSection: () => void;
  updateSection: (uid: string, patch: Partial<DraftSection>) => void;
  removeSection: (uid: string) => void;
  addField: (sectionUid: string) => void;
  updateField: (sectionUid: string, fieldUid: string, patch: Partial<DraftField>) => void;
  removeField: (sectionUid: string, fieldUid: string) => void;
}) => (
  <div className="bm-form-card">
    <div className="bm-step-head">
      <div>
        <h3 className="bm-form-section-title" style={{ margin: 0 }}>Application form fields</h3>
        <p className="bm-form-hint" style={{ margin: 0 }}>
          Group related questions into sections (e.g. Personal Details, Address, Bank Details). Inside each
          section, add fields with custom labels and types. This is what the citizen fills in when they apply.
        </p>
      </div>
      <button type="button" className="bm-btn bm-btn-primary" onClick={addSection}>
        <HiOutlinePlus /> Add section
      </button>
    </div>

    {sections.length === 0 ? (
      <div className="bm-empty">
        No form sections yet. Click <strong>Add section</strong> to start building the application form.
      </div>
    ) : (
      <div className="bm-fields-builder">
        {sections.map((s, sIdx) => (
          <div key={s.uid} className="bm-section-block">
            <div className="bm-section-block-head">
              <span className="bm-section-num">Section {sIdx + 1}</span>
              <input
                className="bm-section-title-input"
                value={s.title}
                onChange={(e) => updateSection(s.uid, { title: e.target.value })}
                placeholder="Section title (e.g. Personal Details)"
              />
              <button type="button" className="bm-btn bm-btn-ghost bm-btn-sm" onClick={() => removeSection(s.uid)} title="Delete section">
                <HiOutlineX /> Remove section
              </button>
            </div>

            <div className="bm-fields-list">
              {s.fields.length === 0 ? (
                <p className="bm-text-muted" style={{ padding: 12, fontSize: 13, margin: 0 }}>
                  No fields in this section. Click "Add field" to add one.
                </p>
              ) : (
                s.fields.map((f, fIdx) => (
                  <div key={f.uid} className="bm-field-row">
                    <div className="bm-field-row-num">{fIdx + 1}</div>
                    <div className="bm-field-row-body">
                      <div className="bm-form-grid">
                        <Field label="Label *">
                          <input
                            value={f.label}
                            onChange={(e) => updateField(s.uid, f.uid, { label: e.target.value, name: f.name === slugify(f.label) ? slugify(e.target.value) : f.name })}
                            placeholder="e.g. Full name"
                          />
                        </Field>
                        <Field label="Field name (key)" hint="Auto-derived from label. Used as the data key.">
                          <input value={f.name} onChange={(e) => updateField(s.uid, f.uid, { name: slugify(e.target.value).replace(/-/g, "_") })} />
                        </Field>
                        <Field label="Type">
                          <select value={f.type} onChange={(e) => updateField(s.uid, f.uid, { type: e.target.value })}>
                            {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </Field>
                        <Field label="Placeholder">
                          <input value={f.placeholder} onChange={(e) => updateField(s.uid, f.uid, { placeholder: e.target.value })} placeholder="e.g. As on Aadhaar" />
                        </Field>
                        {(f.type === "select" || f.type === "radio") && (
                          <Field label="Options (comma-separated)" span={2}>
                            <input
                              value={f.options}
                              onChange={(e) => updateField(s.uid, f.uid, { options: e.target.value })}
                              placeholder="e.g. Male, Female, Other"
                            />
                          </Field>
                        )}
                        <Field label="Help text" span={2}>
                          <input value={f.help_text} onChange={(e) => updateField(s.uid, f.uid, { help_text: e.target.value })} placeholder="Short hint shown under the field" />
                        </Field>
                      </div>
                      <label className="bm-check" style={{ marginTop: 6 }}>
                        <input type="checkbox" checked={f.required} onChange={(e) => updateField(s.uid, f.uid, { required: e.target.checked })} />
                        Required field
                      </label>
                    </div>
                    <button type="button" className="bm-btn bm-btn-ghost bm-btn-sm" onClick={() => removeField(s.uid, f.uid)} title="Remove field">
                      <HiOutlineX />
                    </button>
                  </div>
                ))
              )}

              <button type="button" className="bm-btn bm-btn-ghost bm-add-field-btn" onClick={() => addField(s.uid)}>
                <HiOutlinePlus /> Add field to "{s.title || `section ${sIdx + 1}`}"
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// =====================================================================
// STEP 4 — FAQs
// =====================================================================

const FAQsStep = ({ faqs, addFAQ, updateFAQ, removeFAQ }: {
  faqs: DraftFAQ[];
  addFAQ: () => void;
  updateFAQ: (uid: string, patch: Partial<DraftFAQ>) => void;
  removeFAQ: (uid: string) => void;
}) => (
  <div className="bm-form-card">
    <div className="bm-step-head">
      <div>
        <h3 className="bm-form-section-title" style={{ margin: 0 }}>Frequently asked questions</h3>
        <p className="bm-form-hint" style={{ margin: 0 }}>
          Common questions citizens ask about this service. Shown on the public page below the apply form.
        </p>
      </div>
      <button type="button" className="bm-btn bm-btn-primary" onClick={addFAQ}>
        <HiOutlinePlus /> Add FAQ
      </button>
    </div>

    {faqs.length === 0 ? (
      <div className="bm-empty">No FAQs yet. Add a few to help citizens self-serve before they apply.</div>
    ) : (
      <div className="bm-doc-list">
        {faqs.map((f, idx) => (
          <div key={f.uid} className="bm-doc-row">
            <div className="bm-doc-row-num">{idx + 1}</div>
            <div className="bm-doc-row-body">
              <Field label="Question *">
                <input value={f.question} onChange={(e) => updateFAQ(f.uid, { question: e.target.value })} placeholder="e.g. How long does it take?" />
              </Field>
              <Field label="Answer *">
                <textarea value={f.answer} onChange={(e) => updateFAQ(f.uid, { answer: e.target.value })} rows={3} />
              </Field>
            </div>
            <button type="button" className="bm-btn bm-btn-ghost bm-btn-sm" onClick={() => removeFAQ(f.uid)}>
              <HiOutlineX />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// =====================================================================
// Field helper
// =====================================================================

const Field = ({ label, hint, span, children }: { label: string; hint?: string; span?: number; children: React.ReactNode }) => (
  <label className="bm-form-field" style={span ? { gridColumn: `span ${span}` } : undefined}>
    <span className="bm-form-label">{label}</span>
    {children}
    {hint && <small className="bm-form-hint-inline">{hint}</small>}
  </label>
);

export default ServiceCreate;
