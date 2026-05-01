import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineSupport,
  HiOutlineBriefcase,
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import geographyApi from "@/services/api/geography.api";
import managementApi from "@/services/api/management.api";
import type {
  District,
  GPLevelResponse,
  GPRow,
  StaffMini,
} from "@/types/api.types";
import "../StaffMgmt/StaffMgmt.scss";
import "../StateStaff/StateStaff.scss";

type FilterMode = "all" | "active" | "vacant";

const GPList = () => {
  const { code, districtId } = useParams<{ code: string; districtId: string }>();
  const navigate = useNavigate();

  const [district, setDistrict] = useState<District | null>(null);
  const [data, setData] = useState<GPLevelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const loadAll = async () => {
    if (!districtId) return;
    setLoading(true); setError(null);
    try {
      const [dRes, gRes] = await Promise.all([
        geographyApi.getDistrictById(districtId),
        managementApi.getDistrictGPs(districtId),
      ]);
      setDistrict((dRes as any).data as District);
      setData(gRes.data || null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load GPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [districtId]);

  const stateCode = (code || "").toUpperCase();

  const rowsFiltered = useMemo(() => {
    let rows = data?.rows || [];
    if (filter === "active") rows = rows.filter((r) => r.has_agent);
    if (filter === "vacant") rows = rows.filter((r) => !r.has_agent);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        r.name.toLowerCase().includes(q)
        || r.code.toLowerCase().includes(q)
        || r.taluk_name.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [data, search, filter]);

  return (
    <div className="bm-state-staff">
      <PageHeader
        title={district ? `${district.name} — Gram Panchayats` : "Gram Panchayats"}
        description="Each row is one GP. Active = at least one caseworker, telecaller, or support staff is covering it."
        actions={
          <div className="bm-actions">
            <button type="button" className="bm-btn bm-btn-ghost" onClick={loadAll} disabled={loading}>
              <HiOutlineRefresh className={loading ? "spin" : ""} /> Refresh
            </button>
            <button
              type="button"
              className="bm-btn-back"
              onClick={() => navigate(`/staff/state/${code}/district/${districtId}`)}
            >
              <HiOutlineArrowLeft /> Back
            </button>
          </div>
        }
      />

      <div className="bm-breadcrumb">
        <Link to="/staff">Staff</Link><span>/</span>
        <Link to={`/staff/state/${code}`}>{stateCode}</Link><span>/</span>
        {district && <>
          <Link to={`/staff/state/${code}/district/${districtId}`}>{district.name}</Link><span>/</span>
        </>}
        <span className="current">Gram Panchayats</span>
      </div>

      {error && <div className="bm-error">{error}</div>}

      {data && (
        <div className="bm-gp-stats">
          <div className="bm-gp-stat"><span className="n">{data.total}</span><span className="l">Total GPs</span></div>
          <div className="bm-gp-stat tone-active"><span className="n">{data.active}</span><span className="l">Active</span></div>
          <div className="bm-gp-stat tone-vacant"><span className="n">{data.vacant}</span><span className="l">Vacant</span></div>
        </div>
      )}

      <div className="bm-gp-toolbar-bar">
        <div className="bm-search-bar">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search GP, code, or taluk…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="bm-segmented">
          {([
            { v: "all" as const, label: "All", tone: "" as const },
            { v: "active" as const, label: "Active", tone: "active" as const },
            { v: "vacant" as const, label: "Vacant", tone: "vacant" as const },
          ]).map((opt) => (
            <button
              key={opt.v}
              type="button"
              className={`bm-seg ${filter === opt.v ? "is-on" : ""} ${opt.tone ? `tone-${opt.tone}` : ""}`}
              onClick={() => setFilter(opt.v)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <section className="bm-mgmt-section">
        <div className="bm-gp-rows">
          {loading && (data?.rows || []).length === 0 && (
            <div className="bm-mgmt-empty"><p>Loading gram panchayats…</p></div>
          )}
          {!loading && rowsFiltered.length === 0 && (
            <div className="bm-mgmt-empty"><p>No GPs match.</p></div>
          )}
          {rowsFiltered.map((r) => <GPRowCard key={r.gram_panchayat_id} row={r} />)}
        </div>
      </section>
    </div>
  );
};

const GPRowCard = ({ row }: { row: GPRow }) => {
  const totalAgents = row.caseworkers.length + row.telecallers.length + row.support_staff.length;
  return (
    <div className={`bm-gp-row-card ${row.has_agent ? "is-active" : "is-vacant"}`}>
      <div className="bm-gp-row-left">
        <div className="bm-gp-row-icon"><HiOutlineLocationMarker /></div>
        <div>
          <div className="bm-gp-row-name">{row.name}</div>
          <div className="bm-gp-row-meta">{row.taluk_name} · {row.code}</div>
        </div>
      </div>

      <div className="bm-gp-row-right">
        {row.has_agent ? (
          <>
            <span className="bm-gp-pill tone-active">
              <span className="bm-pill-dot" />
              {totalAgents} agent{totalAgents === 1 ? "" : "s"}
            </span>
            <div className="bm-gp-agents">
              {row.caseworkers.length > 0 && (
                <RoleStack icon={<HiOutlineBriefcase />} label="Caseworker" staff={row.caseworkers} />
              )}
              {row.telecallers.length > 0 && (
                <RoleStack icon={<HiOutlinePhone />} label="Telecaller" staff={row.telecallers} />
              )}
              {row.support_staff.length > 0 && (
                <RoleStack icon={<HiOutlineSupport />} label="Support" staff={row.support_staff} />
              )}
            </div>
          </>
        ) : (
          <span className="bm-gp-pill tone-vacant">Vacant — no agent</span>
        )}
      </div>
    </div>
  );
};

const RoleStack = ({ icon, label, staff }: { icon: React.ReactNode; label: string; staff: StaffMini[] }) => (
  <div className="bm-role-stack" title={`${label}: ${staff.map(s => s.full_name).join(", ")}`}>
    <span className="bm-role-stack-icon">{icon}</span>
    <span className="bm-role-stack-count">{staff.length}</span>
    <span className="bm-role-stack-label">{label}</span>
  </div>
);

export default GPList;
