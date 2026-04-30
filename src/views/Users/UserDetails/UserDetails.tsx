import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { HiOutlineUser, HiOutlinePencil, HiOutlineArrowLeft, HiOutlineTrash } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import usersApi from "@/services/api/users.api";
import type { User, UserDocument } from "@/types/api.types";
import "../UserList/UserList.scss";
import "./UserDetails.scss";

const UserDetails = () => {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [docs, setDocs] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await usersApi.getById(id);
      setUser(r.data);
      try {
        const d = await usersApi.listDocuments(id);
        setDocs(d.data || []);
      } catch {
        setDocs([]);
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string };
      setError(e.response?.status === 404 ? "Citizen not found" : e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const remove = async () => {
    if (!confirm("Soft-delete this citizen? They will no longer be able to log in.")) return;
    setDeleting(true);
    try {
      await usersApi.remove(id);
      nav("/users");
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bm-users">
        <div className="bm-card" style={{ padding: 40, textAlign: "center" }}>Loading…</div>
      </div>
    );
  }
  if (error || !user) {
    return (
      <div className="bm-users">
        <div className="bm-alert bm-alert-error">{error || "Not found"}</div>
        <Link to="/users" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>
      </div>
    );
  }

  return (
    <div className="bm-users bm-user-details">
      <PageHeader
        icon={<HiOutlineUser />}
        title={user.full_name}
        description={`${user.mobile} · ${user.email || "no email"} · ${user.state_code || "—"}`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/users" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>
            <Link to={`/users/${user.id}/edit`} className="bm-btn"><HiOutlinePencil /> Edit</Link>
            <button className="bm-btn bm-btn-danger" onClick={remove} disabled={deleting}>
              <HiOutlineTrash /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        }
      />

      <div className="bm-grid-2">
        <Section title="Profile">
          <Row k="Full name" v={user.full_name} />
          <Row k="Mobile" v={`${user.mobile}${user.mobile_verified ? " ✓" : ""}`} />
          <Row k="Email" v={user.email ? `${user.email}${user.email_verified ? " ✓" : ""}` : "—"} />
          <Row k="Date of birth" v={user.date_of_birth || "—"} />
          <Row k="Gender" v={user.gender || "—"} />
          <Row k="Preferred language" v={user.preferred_language} />
        </Section>

        <Section title="KYC">
          <Row k="Status" v={<span className={`bm-chip bm-chip-${user.kyc_status}`}>{user.kyc_status}</span>} />
          <Row k="Aadhaar (last 4)" v={user.aadhaar_last4 ? `XXXX-XXXX-${user.aadhaar_last4}${user.aadhaar_verified ? " ✓" : ""}` : "—"} />
          <Row k="PAN" v={user.pan_number ? `${user.pan_number}${user.pan_verified ? " ✓" : ""}` : "—"} />
        </Section>

        <Section title="Address">
          <Row k="Line 1" v={user.address_line1 || "—"} />
          <Row k="Line 2" v={user.address_line2 || "—"} />
          <Row k="City" v={user.city || "—"} />
          <Row k="State" v={user.state_code || "—"} />
          <Row k="Pincode" v={user.pincode || "—"} />
        </Section>

        <Section title="Account">
          <Row k="Status" v={<span className={`bm-chip bm-chip-${user.status}`}>{user.status}</span>} />
          <Row k="Created" v={new Date(user.created_at).toLocaleString()} />
          <Row k="Last login" v={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"} />
          <Row k="Referral code" v={user.referral_code || "—"} />
          <Row k="Referred by" v={user.referred_by_code || "—"} />
        </Section>
      </div>

      <Section title={`Documents (${docs.length})`} fullWidth>
        {docs.length === 0 ? (
          <div className="bm-text-muted" style={{ padding: 16 }}>No documents uploaded.</div>
        ) : (
          <table className="bm-table">
            <thead><tr><th>Type</th><th>Last 4</th><th>Verified</th><th>Uploaded</th></tr></thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>{d.doc_type}</td>
                  <td>{d.doc_number_last4 || "—"}</td>
                  <td>{d.is_verified ? <span className="bm-chip bm-chip-verified">Verified</span> : <span className="bm-chip bm-chip-pending">Pending</span>}</td>
                  <td className="bm-text-muted">{new Date(d.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
};

const Section = ({ title, children, fullWidth }: { title: string; children: React.ReactNode; fullWidth?: boolean }) => (
  <div className="bm-card bm-section" style={fullWidth ? { gridColumn: "1 / -1" } : undefined}>
    <h3 className="bm-section-title">{title}</h3>
    {children}
  </div>
);

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="bm-row">
    <span className="bm-row-k">{k}</span>
    <span className="bm-row-v">{v}</span>
  </div>
);

export default UserDetails;
