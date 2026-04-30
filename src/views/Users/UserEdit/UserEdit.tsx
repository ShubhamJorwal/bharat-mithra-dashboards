import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HiOutlinePencil, HiOutlineArrowLeft } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import usersApi from "@/services/api/users.api";
import type { User, UpdateUserRequest } from "@/types/api.types";
import "../UserList/UserList.scss";
import "../UserCreate/UserCreate.scss";

const UserEdit = () => {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState<UpdateUserRequest>({});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await usersApi.getById(id);
        setUser(r.data);
        setForm({
          full_name: r.data.full_name,
          email: r.data.email || "",
          date_of_birth: r.data.date_of_birth || "",
          gender: r.data.gender,
          preferred_language: r.data.preferred_language,
          address_line1: r.data.address_line1 || "",
          address_line2: r.data.address_line2 || "",
          city: r.data.city || "",
          state_code: r.data.state_code || "",
          pincode: r.data.pincode || "",
          profile_photo_url: r.data.profile_photo_url || "",
        });
      } catch {
        setError("Failed to load citizen");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = <K extends keyof UpdateUserRequest>(k: K, v: UpdateUserRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await usersApi.update(id, form);
      nav(`/users/${id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bm-users"><div className="bm-card" style={{ padding: 40, textAlign: "center" }}>Loading…</div></div>;
  if (!user) return <div className="bm-users"><div className="bm-alert bm-alert-error">{error || "Not found"}</div></div>;

  return (
    <div className="bm-users">
      <PageHeader
        icon={<HiOutlinePencil />}
        title={`Edit ${user.full_name}`}
        description="Update profile, preferences, or address."
        actions={
          <Link to={`/users/${id}`} className="bm-btn">
            <HiOutlineArrowLeft /> Back
          </Link>
        }
      />

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <form className="bm-card bm-form" onSubmit={submit}>
        <div className="bm-form-grid">
          <Field label="Full name">
            <input value={form.full_name || ""} onChange={(e) => set("full_name", e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Date of birth">
            <input type="date" value={form.date_of_birth || ""} onChange={(e) => set("date_of_birth", e.target.value)} />
          </Field>
          <Field label="Gender">
            <select value={form.gender || ""} onChange={(e) => set("gender", (e.target.value || undefined) as UpdateUserRequest["gender"]) }>
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Preferred language">
            <select value={form.preferred_language || "en"} onChange={(e) => set("preferred_language", e.target.value)}>
              <option value="en">English</option>
            </select>
          </Field>
          <Field label="State code">
            <input value={form.state_code || ""} onChange={(e) => set("state_code", e.target.value.toUpperCase().slice(0, 5))} />
          </Field>
          <Field label="City">
            <input value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Pincode">
            <input value={form.pincode || ""} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
          </Field>
          <Field label="Address line 1">
            <input value={form.address_line1 || ""} onChange={(e) => set("address_line1", e.target.value)} />
          </Field>
          <Field label="Address line 2">
            <input value={form.address_line2 || ""} onChange={(e) => set("address_line2", e.target.value)} />
          </Field>
          <Field label="Profile photo URL">
            <input value={form.profile_photo_url || ""} onChange={(e) => set("profile_photo_url", e.target.value)} />
          </Field>
        </div>
        <div className="bm-form-actions">
          <Link to={`/users/${id}`} className="bm-btn">Cancel</Link>
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

export default UserEdit;
