import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineUserAdd, HiOutlineArrowLeft } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import usersApi from "@/services/api/users.api";
import type { CreateUserRequest } from "@/types/api.types";
import "../UserList/UserList.scss";

const UserCreate = () => {
  const nav = useNavigate();
  const [form, setForm] = useState<CreateUserRequest>({
    mobile: "",
    full_name: "",
    email: "",
    preferred_language: "en",
    state_code: "",
    city: "",
    pincode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof CreateUserRequest, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError("Mobile must be a valid 10-digit Indian number.");
      return;
    }
    if (!form.full_name.trim()) {
      setError("Full name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await usersApi.create({
        ...form,
        email: form.email || undefined,
        state_code: form.state_code || undefined,
        city: form.city || undefined,
        pincode: form.pincode || undefined,
      });
      nav(`/users/${r.data.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || "Failed to create citizen");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bm-users">
      <PageHeader
        icon={<HiOutlineUserAdd />}
        title="Add citizen"
        description="Manually create a new citizen profile. They can later log in via OTP using this mobile number."
        actions={
          <Link to="/users" className="bm-btn">
            <HiOutlineArrowLeft /> Back to list
          </Link>
        }
      />

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <form className="bm-card bm-form" onSubmit={submit}>
        <div className="bm-form-grid">
          <Field label="Full name *">
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              required
            />
          </Field>
          <Field label="Mobile (10 digits) *">
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Preferred language">
            <select
              value={form.preferred_language || "en"}
              onChange={(e) => set("preferred_language", e.target.value)}
            >
              <option value="en">English</option>
            </select>
          </Field>
          <Field label="State code">
            <input
              type="text"
              value={form.state_code || ""}
              onChange={(e) => set("state_code", e.target.value.toUpperCase().slice(0, 5))}
              placeholder="KA, MH, TN..."
            />
          </Field>
          <Field label="City">
            <input
              type="text"
              value={form.city || ""}
              onChange={(e) => set("city", e.target.value)}
            />
          </Field>
          <Field label="Pincode">
            <input
              type="text"
              value={form.pincode || ""}
              onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />
          </Field>
        </div>
        <div className="bm-form-actions">
          <Link to="/users" className="bm-btn">Cancel</Link>
          <button type="submit" className="bm-btn bm-btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create citizen"}
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

export default UserCreate;
