import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HiOutlinePencil, HiOutlineArrowLeft } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import staffApi from "@/services/api/staff.api";
import type { Staff, UpdateStaffRequest } from "@/types/api.types";
import "../../Users/UserList/UserList.scss";
import "../../Users/UserCreate/UserCreate.scss";

const StaffEdit = () => {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState<UpdateStaffRequest>({});
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await staffApi.getById(id);
        setStaff(r.data);
        setForm({
          full_name: r.data.full_name,
          mobile: r.data.mobile,
          designation: r.data.designation || "",
          department: r.data.department || "",
          home_state_code: r.data.home_state_code || "",
          profile_photo_url: r.data.profile_photo_url || "",
          status: r.data.status === "invited" ? "active" : (r.data.status as UpdateStaffRequest["status"]),
        });
      } catch {
        setError("Failed to load staff");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = <K extends keyof UpdateStaffRequest>(k: K, v: UpdateStaffRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await staffApi.update(id, form);
      nav(`/staff/${id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bm-users"><div className="bm-card" style={{ padding: 40, textAlign: "center" }}>Loading…</div></div>;
  if (!staff) return <div className="bm-users"><div className="bm-alert bm-alert-error">{error || "Not found"}</div></div>;

  return (
    <div className="bm-users">
      <PageHeader
        icon={<HiOutlinePencil />}
        title={`Edit ${staff.full_name}`}
        description="Update profile, department, location, or status. Roles are managed on the details page."
        actions={<Link to={`/staff/${id}`} className="bm-btn"><HiOutlineArrowLeft /> Back</Link>}
      />

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <form className="bm-card bm-form" onSubmit={submit}>
        <div className="bm-form-grid">
          <Field label="Full name">
            <input value={form.full_name || ""} onChange={(e) => set("full_name", e.target.value)} />
          </Field>
          <Field label="Mobile">
            <input value={form.mobile || ""} maxLength={10}
              onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} />
          </Field>
          <Field label="Designation">
            <input value={form.designation || ""} onChange={(e) => set("designation", e.target.value)} />
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
          <Field label="Profile photo URL">
            <input value={form.profile_photo_url || ""} onChange={(e) => set("profile_photo_url", e.target.value)} />
          </Field>
          <Field label="Status">
            <select value={form.status || ""} onChange={(e) => set("status", e.target.value as UpdateStaffRequest["status"])}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="offboarded">Off-boarded</option>
            </select>
          </Field>
        </div>
        <div className="bm-form-actions">
          <Link to={`/staff/${id}`} className="bm-btn">Cancel</Link>
          <button className="bm-btn bm-btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
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

export default StaffEdit;
