import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineIdentification, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import staffApi from "@/services/api/staff.api";
import type { Staff, StaffQueryParams, StaffRole } from "@/types/api.types";
import "../../Users/UserList/UserList.scss";

const PER_PAGE = 25;

const StaffList = () => {
  const [items, setItems] = useState<Staff[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<StaffRole | "">("");
  const [department, setDepartment] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [status, setStatus] = useState<StaffQueryParams["status"] | "">("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PER_PAGE)), [total]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await staffApi.list({
        page,
        per_page: PER_PAGE,
        search: search || undefined,
        role: role || undefined,
        department: department || undefined,
        state_code: stateCode || undefined,
        status: status || undefined,
      });
      setItems(r.data || []);
      setTotal(r.meta?.total || 0);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: { message?: string } } }; message?: string };
      if (e.response?.status === 401 || e.response?.status === 403) {
        setError("You need to be signed in as an admin to view staff. Default admin: admin@bharatmithra.in / BharatMithra@2026");
      } else {
        setError(e.response?.data?.error?.message || e.message || "Failed to load staff");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void load();
  };

  return (
    <div className="bm-users">
      <PageHeader
        icon={<HiOutlineIdentification />}
        title="BM Staff"
        description="BharatMithra employees with assigned roles and geographic scopes."
        actions={
          <Link to="/staff/new" className="bm-btn bm-btn-primary">
            <HiOutlinePlus /> Add staff
          </Link>
        }
      />

      <form className="bm-toolbar" onSubmit={onSearch}>
        <div className="bm-toolbar-search">
          <HiOutlineSearch />
          <input
            type="search"
            placeholder="Search by name, email, mobile, employee code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bm-toolbar-input"
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole | "")}
        >
          <option value="">All roles</option>
          <option value="super_admin">Super admin</option>
          <option value="admin">Admin</option>
          <option value="state_head">State head</option>
          <option value="district_manager">District manager</option>
          <option value="supervisor">Supervisor</option>
          <option value="service_manager">Service manager</option>
          <option value="agent">Agent</option>
          <option value="verifier">Verifier</option>
          <option value="support">Support</option>
          <option value="finance">Finance</option>
        </select>
        <input
          className="bm-toolbar-input"
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <input
          className="bm-toolbar-input"
          type="text"
          placeholder="State (e.g. KA)"
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value.toUpperCase())}
          maxLength={5}
        />
        <select
          className="bm-toolbar-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as StaffQueryParams["status"] | "")}
        >
          <option value="">All status</option>
          <option value="invited">Invited</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="offboarded">Offboarded</option>
        </select>
        <button type="submit" className="bm-btn">Apply</button>
        <button type="button" className="bm-btn bm-btn-ghost" onClick={() => void load()}>
          <HiOutlineRefresh />
        </button>
      </form>

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <div className="bm-card">
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Department</th>
                <th>Roles</th>
                <th>State</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="bm-table-empty">Loading…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={8} className="bm-table-empty">No staff found.</td></tr>
              )}
              {!loading && items.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/staff/${s.id}`} className="bm-link">{s.full_name}</Link>
                    <div className="bm-text-muted" style={{ fontSize: 11 }}>{s.employee_code}</div>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.mobile}</td>
                  <td className="bm-text-muted">{s.department || "—"}</td>
                  <td>
                    {(s.roles || []).slice(0, 3).map((r) => (
                      <span key={r.id} className="bm-chip" style={{ marginRight: 4, marginBottom: 2 }}>
                        {r.role}{r.scope_label ? ` · ${r.scope_label}` : ""}
                      </span>
                    ))}
                    {(s.roles?.length || 0) > 3 && (
                      <span className="bm-text-muted" style={{ fontSize: 11 }}>+{(s.roles!.length - 3)} more</span>
                    )}
                  </td>
                  <td>{s.home_state_code || "—"}</td>
                  <td><span className={`bm-chip bm-chip-${s.status}`}>{s.status}</span></td>
                  <td><Link to={`/staff/${s.id}`} className="bm-link bm-link-sm">View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bm-pagination">
          <span className="bm-text-muted">Page {page} of {totalPages} · {total} staff</span>
          <div className="bm-pagination-actions">
            <button className="bm-btn bm-btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
            <button className="bm-btn bm-btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffList;
