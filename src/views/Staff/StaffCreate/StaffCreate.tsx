import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineUserAdd, HiOutlineArrowLeft, HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import staffApi from "@/services/api/staff.api";
import type { CreateStaffRequest, RolesCatalog, StaffRole, StaffScope } from "@/types/api.types";
import "../../Users/UserList/UserList.scss";
import "../../Users/UserCreate/UserCreate.scss";
import "./StaffCreate.scss";

interface RoleRow {
  role: StaffRole;
  scope_type: StaffScope;
  scope_ref_id?: string;
  scope_label?: string;
  is_primary: boolean;
}

const StaffCreate = () => {
  const nav = useNavigate();
  const [catalog, setCatalog] = useState<RolesCatalog | null>(null);
  const [form, setForm] = useState<CreateStaffRequest>({
    email: "",
    full_name: "",
    mobile: "",
    designation: "",
    department: "",
    home_state_code: "",
    initial_password: "",
  });
  const [roles, setRoles] = useState<RoleRow[]>([
    { role: "agent", scope_type: "pan_india", is_primary: true },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPwd, setTempPwd] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await staffApi.catalog();
        setCatalog(r.data);
      } catch {
        // catalog optional
      }
    })();
  }, []);

  const set = <K extends keyof CreateStaffRequest>(k: K, v: CreateStaffRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const updateRole = (idx: number, patch: Partial<RoleRow>) =>
    setRoles((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const addRole = () =>
    setRoles((rs) => [...rs, { role: "agent", scope_type: "pan_india", is_primary: false }]);
  const removeRole = (idx: number) =>
    setRoles((rs) => rs.filter((_, i) => i !== idx));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError("Mobile must be a valid 10-digit Indian number.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Valid email required.");
      return;
    }
    if (!form.full_name.trim()) {
      setError("Full name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await staffApi.create({
        ...form,
        designation: form.designation || undefined,
        department: form.department || undefined,
        home_state_code: form.home_state_code || undefined,
        initial_password: form.initial_password || undefined,
        roles: roles.map((rr) => ({
          role: rr.role,
          scope_type: rr.scope_type,
          scope_ref_id: rr.scope_ref_id || undefined,
          scope_label: rr.scope_label || undefined,
          is_primary: rr.is_primary,
        })),
      });
      if (r.data.temp_password) {
        setTempPwd(r.data.temp_password);
        // Show temp password before redirecting
        setTimeout(() => nav(`/staff/${r.data.staff.id}`), 8000);
      } else {
        nav(`/staff/${r.data.staff.id}`);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || "Failed to create staff");
    } finally {
      setSubmitting(false);
    }
  };

  if (tempPwd) {
    return (
      <div className="bm-users">
        <PageHeader icon={<HiOutlineUserAdd />} title="Staff created" />
        <div className="bm-card" style={{ padding: 32, textAlign: "center" }}>
          <p>The temporary password is shown ONCE. Copy it now.</p>
          <div className="bm-temp-pwd">{tempPwd}</div>
          <p className="bm-text-muted" style={{ marginTop: 16 }}>
            Redirecting to staff details in 8 seconds...
          </p>
        </div>
      </div>
    );
  }

  const allRoles = catalog?.roles || [
    "super_admin","admin","state_head","district_manager","supervisor",
    "service_manager","agent","verifier","support","finance",
  ];
  const allScopes = catalog?.scopes || ["pan_india","state","district","taluk","category","center"];

  return (
    <div className="bm-users">
      <PageHeader
        icon={<HiOutlineUserAdd />}
        title="Add staff"
        description="Create a BharatMithra employee. Assign one or more roles, each scoped to a specific geography or category."
        actions={<Link to="/staff" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>}
      />

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <form className="bm-card bm-form" onSubmit={submit}>
        <h3 className="bm-section-title-inline">Profile</h3>
        <div className="bm-form-grid">
          <Field label="Full name *">
            <input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
          </Field>
          <Field label="Email *">
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </Field>
          <Field label="Mobile (10 digits) *">
            <input type="tel" value={form.mobile} maxLength={10}
              onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} required />
          </Field>
          <Field label="Designation">
            <input value={form.designation || ""} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. State Operations Lead" />
          </Field>
          <Field label="Department">
            <select value={form.department || ""} onChange={(e) => set("department", e.target.value)}>
              <option value="">—</option>
              <option value="Operations">Operations</option>
              <option value="Tech">Tech</option>
              <option value="Finance">Finance</option>
              <option value="Support">Support</option>
              <option value="Field">Field</option>
              <option value="HR">HR</option>
            </select>
          </Field>
          <Field label="Home state code">
            <input value={form.home_state_code || ""} onChange={(e) => set("home_state_code", e.target.value.toUpperCase().slice(0, 5))} />
          </Field>
          <Field label="Temporary password">
            <input value={form.initial_password || ""} onChange={(e) => set("initial_password", e.target.value)}
              placeholder="Leave blank to auto-generate" />
          </Field>
        </div>

        <h3 className="bm-section-title-inline" style={{ marginTop: 32 }}>
          Roles &amp; scope
          <button type="button" className="bm-btn bm-btn-ghost" onClick={addRole} style={{ marginLeft: 12 }}>
            <HiOutlinePlus /> Add role
          </button>
        </h3>

        {roles.map((r, idx) => (
          <div key={idx} className="bm-role-row">
            <select value={r.role} onChange={(e) => updateRole(idx, { role: e.target.value as StaffRole })}>
              {allRoles.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select value={r.scope_type} onChange={(e) => updateRole(idx, { scope_type: e.target.value as StaffScope })}>
              {allScopes.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input
              placeholder="Scope ref (e.g. KA, district uuid, category id)"
              value={r.scope_ref_id || ""}
              onChange={(e) => updateRole(idx, { scope_ref_id: e.target.value })}
              disabled={r.scope_type === "pan_india"}
            />
            <input
              placeholder="Scope label (e.g. Karnataka)"
              value={r.scope_label || ""}
              onChange={(e) => updateRole(idx, { scope_label: e.target.value })}
            />
            <label className="bm-role-primary">
              <input type="checkbox" checked={r.is_primary} onChange={(e) => updateRole(idx, { is_primary: e.target.checked })} />
              Primary
            </label>
            <button type="button" className="bm-btn bm-btn-ghost" onClick={() => removeRole(idx)} title="Remove role">
              <HiOutlineX />
            </button>
          </div>
        ))}

        <div className="bm-form-actions">
          <Link to="/staff" className="bm-btn">Cancel</Link>
          <button type="submit" className="bm-btn bm-btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create staff"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="bm-form-field">
    <span>{label}</span>
    {children}
  </label>
);

export default StaffCreate;
