import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { HiOutlineIdentification, HiOutlinePencil, HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import staffApi from "@/services/api/staff.api";
import type { Staff, StaffAuditEntry, StaffRole, StaffScope } from "@/types/api.types";
import "../../Users/UserList/UserList.scss";
import "../../Users/UserDetails/UserDetails.scss";
import "../StaffCreate/StaffCreate.scss";

const StaffDetails = () => {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [audit, setAudit] = useState<StaffAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role form
  const [newRole, setNewRole] = useState<StaffRole>("agent");
  const [newScope, setNewScope] = useState<StaffScope>("pan_india");
  const [newScopeRef, setNewScopeRef] = useState("");
  const [newScopeLabel, setNewScopeLabel] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await staffApi.getById(id);
      setStaff(r.data);
      try {
        const a = await staffApi.audit(id, 30);
        setAudit(a.data || []);
      } catch {
        setAudit([]);
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string };
      setError(e.response?.status === 404 ? "Staff not found" : e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const remove = async () => {
    if (!confirm("Off-board this staff member? They will be unable to log in.")) return;
    try {
      await staffApi.remove(id);
      nav("/staff");
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e.message || "Failed");
    }
  };

  const addRole = async () => {
    try {
      await staffApi.addRole(id, {
        role: newRole,
        scope_type: newScope,
        scope_ref_id: newScopeRef || undefined,
        scope_label: newScopeLabel || undefined,
      });
      setNewScopeRef("");
      setNewScopeLabel("");
      void load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      alert(e.response?.data?.error?.message || e.message || "Failed");
    }
  };

  const removeRole = async (roleId: string) => {
    if (!confirm("Revoke this role?")) return;
    try {
      await staffApi.removeRole(id, roleId);
      void load();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e.message || "Failed");
    }
  };

  if (loading) return <div className="bm-users"><div className="bm-card" style={{ padding: 40, textAlign: "center" }}>Loading…</div></div>;
  if (error || !staff) return <div className="bm-users"><div className="bm-alert bm-alert-error">{error || "Not found"}</div></div>;

  return (
    <div className="bm-users bm-user-details">
      <PageHeader
        icon={<HiOutlineIdentification />}
        title={staff.full_name}
        description={`${staff.employee_code} · ${staff.email} · ${staff.department || "—"}`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/staff" className="bm-btn"><HiOutlineArrowLeft /> Back</Link>
            <Link to={`/staff/${id}/edit`} className="bm-btn"><HiOutlinePencil /> Edit</Link>
            <button className="bm-btn bm-btn-danger" onClick={remove}><HiOutlineTrash /> Off-board</button>
          </div>
        }
      />

      <div className="bm-grid-2">
        <div className="bm-card bm-section">
          <h3 className="bm-section-title">Profile</h3>
          <Row k="Employee code" v={staff.employee_code} />
          <Row k="Full name" v={staff.full_name} />
          <Row k="Email" v={staff.email} />
          <Row k="Mobile" v={staff.mobile} />
          <Row k="Designation" v={staff.designation || "—"} />
          <Row k="Department" v={staff.department || "—"} />
          <Row k="Joined" v={new Date(staff.joined_at).toLocaleDateString()} />
        </div>

        <div className="bm-card bm-section">
          <h3 className="bm-section-title">Account</h3>
          <Row k="Status" v={<span className={`bm-chip bm-chip-${staff.status}`}>{staff.status}</span>} />
          <Row k="Must change password" v={staff.must_change_password ? "Yes" : "No"} />
          <Row k="Last login" v={staff.last_login_at ? new Date(staff.last_login_at).toLocaleString() : "Never"} />
          <Row k="Home state" v={staff.home_state_code || "—"} />
          <Row k="Created" v={new Date(staff.created_at).toLocaleString()} />
        </div>
      </div>

      <div className="bm-card bm-section" style={{ marginTop: 18 }}>
        <h3 className="bm-section-title">Roles &amp; scope</h3>
        {(staff.roles || []).length === 0 ? (
          <div className="bm-text-muted" style={{ padding: 8 }}>No roles assigned.</div>
        ) : (
          <table className="bm-table">
            <thead><tr><th>Role</th><th>Scope</th><th>Reference</th><th>Label</th><th>Primary</th><th></th></tr></thead>
            <tbody>
              {staff.roles!.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.role}</strong></td>
                  <td>{r.scope_type}</td>
                  <td className="bm-text-muted">{r.scope_ref_id || "—"}</td>
                  <td>{r.scope_label || "—"}</td>
                  <td>{r.is_primary ? "✓" : ""}</td>
                  <td>
                    <button className="bm-btn bm-btn-ghost" onClick={() => removeRole(r.id)}>
                      <HiOutlineX /> Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="bm-role-row" style={{ marginTop: 16 }}>
          <select value={newRole} onChange={(e) => setNewRole(e.target.value as StaffRole)}>
            {["super_admin","admin","state_head","district_manager","supervisor","service_manager","agent","verifier","support","finance"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={newScope} onChange={(e) => setNewScope(e.target.value as StaffScope)}>
            {["pan_india","state","district","taluk","category","center"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input placeholder="Scope ref (e.g. KA, district uuid)" value={newScopeRef} onChange={(e) => setNewScopeRef(e.target.value)} disabled={newScope === "pan_india"} />
          <input placeholder="Label (e.g. Karnataka)" value={newScopeLabel} onChange={(e) => setNewScopeLabel(e.target.value)} />
          <span />
          <button type="button" className="bm-btn bm-btn-primary" onClick={addRole}><HiOutlinePlus /></button>
        </div>
      </div>

      <div className="bm-card bm-section" style={{ marginTop: 18 }}>
        <h3 className="bm-section-title">Recent activity ({audit.length})</h3>
        {audit.length === 0 ? (
          <div className="bm-text-muted" style={{ padding: 8 }}>No activity yet.</div>
        ) : (
          <table className="bm-table">
            <thead><tr><th>When</th><th>Action</th><th>Target</th><th>IP</th></tr></thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id}>
                  <td className="bm-text-muted">{new Date(a.created_at).toLocaleString()}</td>
                  <td>{a.action}</td>
                  <td className="bm-text-muted">{a.target_table || ""}{a.target_id ? `:${a.target_id.slice(0, 8)}` : ""}</td>
                  <td className="bm-text-muted">{a.ip_address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="bm-row"><span className="bm-row-k">{k}</span><span className="bm-row-v">{v}</span></div>
);

export default StaffDetails;
