import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineUsers, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh } from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import usersApi from "@/services/api/users.api";
import type { User, UsersQueryParams } from "@/types/api.types";
import "./UserList.scss";

const PER_PAGE = 25;

const UserList = () => {
  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [status, setStatus] = useState<UsersQueryParams["status"] | "">("");
  const [kycStatus, setKycStatus] = useState<UsersQueryParams["kyc_status"] | "">("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PER_PAGE)), [total]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await usersApi.list({
        page,
        per_page: PER_PAGE,
        search: search || undefined,
        state_code: stateCode || undefined,
        status: status || undefined,
        kyc_status: kycStatus || undefined,
      });
      setItems(r.data || []);
      setTotal(r.meta?.total || 0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load users";
      setError(msg);
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
        icon={<HiOutlineUsers />}
        title="Citizens"
        description="Every user of BharatMithra. Citizens log in via OTP from the public site or are created here by staff."
        actions={
          <Link to="/users/new" className="bm-btn bm-btn-primary">
            <HiOutlinePlus /> Add citizen
          </Link>
        }
      />

      <form className="bm-toolbar" onSubmit={onSearch}>
        <div className="bm-toolbar-search">
          <HiOutlineSearch />
          <input
            type="search"
            placeholder="Search by name, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          className="bm-toolbar-input"
          type="text"
          placeholder="State code (e.g. KA)"
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value.toUpperCase())}
          maxLength={5}
        />
        <select
          className="bm-toolbar-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as UsersQueryParams["status"] | "")}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
        <select
          className="bm-toolbar-input"
          value={kycStatus}
          onChange={(e) => setKycStatus(e.target.value as UsersQueryParams["kyc_status"] | "")}
        >
          <option value="">All KYC</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="bm-btn">
          Apply
        </button>
        <button type="button" className="bm-btn bm-btn-ghost" onClick={() => void load()} title="Refresh">
          <HiOutlineRefresh />
        </button>
      </form>

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      <div className="bm-card">
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>State</th>
                <th>KYC</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="bm-table-empty">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="bm-table-empty">
                    No citizens found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <Link to={`/users/${u.id}`} className="bm-link">
                        {u.full_name}
                      </Link>
                    </td>
                    <td>{u.mobile}</td>
                    <td className="bm-text-muted">{u.email || "—"}</td>
                    <td>{u.state_code || "—"}</td>
                    <td>
                      <span className={`bm-chip bm-chip-${u.kyc_status}`}>{u.kyc_status}</span>
                    </td>
                    <td>
                      <span className={`bm-chip bm-chip-${u.status}`}>{u.status}</span>
                    </td>
                    <td className="bm-text-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/users/${u.id}`} className="bm-link bm-link-sm">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="bm-pagination">
          <span className="bm-text-muted">
            Page {page} of {totalPages} · {total} citizens
          </span>
          <div className="bm-pagination-actions">
            <button
              className="bm-btn bm-btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </button>
            <button
              className="bm-btn bm-btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
