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
  HiOutlineUserAdd,
  HiOutlineViewGrid,
  HiOutlineViewList,
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
import AddGPAgentModal from "../StaffMgmt/components/AddGPAgentModal";
import "../StaffMgmt/StaffMgmt.scss";
import "../StateStaff/StateStaff.scss";

type FilterMode = "all" | "active" | "vacant";
type ViewMode = "list" | "grid";

const GPList = () => {
  const { code, districtId } = useParams<{ code: string; districtId: string }>();
  const navigate = useNavigate();

  const [district, setDistrict] = useState<District | null>(null);
  const [data, setData] = useState<GPLevelResponse | null>(null);
  const [stateId, setStateId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [agentForGP, setAgentForGP] = useState<GPRow | null>(null);

  const loadAll = async () => {
    if (!districtId) return;
    setLoading(true); setError(null);
    try {
      const [dRes, gRes] = await Promise.all([
        geographyApi.getDistrictById(districtId),
        managementApi.getDistrictGPs(districtId),
      ]);
      const d = (dRes as any).data as District;
      setDistrict(d);
      setStateId(d.state_id || "");
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
        <div className="bm-toolbar-controls">
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
          <div className="bm-view-toggle">
            <button
              type="button"
              className={view === "grid" ? "is-on" : ""}
              onClick={() => setView("grid")}
              title="Grid view"
              aria-label="Grid view"
            >
              <HiOutlineViewGrid />
            </button>
            <button
              type="button"
              className={view === "list" ? "is-on" : ""}
              onClick={() => setView("list")}
              title="List view"
              aria-label="List view"
            >
              <HiOutlineViewList />
            </button>
          </div>
        </div>
      </div>

      <section className="bm-mgmt-section">
        {loading && (data?.rows || []).length === 0 ? (
          <div className="bm-mgmt-empty"><p>Loading gram panchayats…</p></div>
        ) : !loading && rowsFiltered.length === 0 ? (
          <div className="bm-mgmt-empty"><p>No GPs match.</p></div>
        ) : (
          <div className={view === "grid" ? "bm-gp-grid" : "bm-gp-rows"}>
            {rowsFiltered.map((r) =>
              view === "grid" ? (
                <GPCard key={r.gram_panchayat_id} row={r} onAddAgent={() => setAgentForGP(r)} />
              ) : (
                <GPRowCard key={r.gram_panchayat_id} row={r} onAddAgent={() => setAgentForGP(r)} />
              ),
            )}
          </div>
        )}
      </section>

      <AddGPAgentModal
        open={!!agentForGP}
        scope={{
          state_id: stateId,
          state_code: stateCode,
          district_id: districtId || "",
          taluk_id: agentForGP?.taluk_id || "",
          gram_panchayat_id: agentForGP?.gram_panchayat_id || "",
          gp_name: agentForGP?.name,
          gp_code: agentForGP?.code,
        }}
        onClose={() => setAgentForGP(null)}
        onSaved={loadAll}
      />
    </div>
  );
};

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

const GPRowCard = ({ row, onAddAgent }: { row: GPRow; onAddAgent: () => void }) => {
  const agent = row.agent;
  const hasAgent = !!agent;
  return (
    <div className={`bm-gp-row-card ${hasAgent ? "is-active" : "is-vacant"}`}>
      <div className="bm-gp-row-left">
        <div className="bm-gp-row-icon"><HiOutlineLocationMarker /></div>
        <div>
          <div className="bm-gp-row-name">{row.name}</div>
          <div className="bm-gp-row-meta">{row.taluk_name} · {row.code}</div>
        </div>
      </div>

      <div className="bm-gp-row-right">
        {hasAgent ? (
          <>
            <div className="bm-gp-agent-pill" title={`Agent: ${agent!.full_name}`}>
              <div className="bm-gp-agent-avatar">
                {agent!.profile_photo_url
                  ? <img src={agent!.profile_photo_url} alt={agent!.full_name} />
                  : <span>{initials(agent!.full_name)}</span>}
              </div>
              <div className="bm-gp-agent-text">
                <div className="bm-gp-agent-name">{agent!.full_name}</div>
                <div className="bm-gp-agent-role">Agent</div>
              </div>
            </div>
            {(row.caseworkers.length > 0 || row.telecallers.length > 0 || row.support_staff.length > 0) && (
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
            )}
          </>
        ) : (
          <span className="bm-gp-pill tone-vacant">No agent assigned</span>
        )}
        {!hasAgent && (
          <button
            type="button"
            className="bm-gp-add-btn is-primary"
            onClick={onAddAgent}
            title={`Assign an agent to ${row.name}`}
          >
            <HiOutlineUserAdd /> Add agent
          </button>
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

const GPCard = ({ row, onAddAgent }: { row: GPRow; onAddAgent: () => void }) => {
  const agent = row.agent;
  const hasAgent = !!agent;
  return (
    <div className={`bm-gp-card ${hasAgent ? "is-active" : "is-vacant"}`}>
      <div className="bm-gp-card-head">
        <div className="bm-gp-row-icon"><HiOutlineLocationMarker /></div>
        <span className={`bm-gp-pill tone-${hasAgent ? "active" : "vacant"}`}>
          {hasAgent ? <><span className="bm-pill-dot" /> Active</> : "No agent"}
        </span>
      </div>
      <div className="bm-gp-card-body">
        <div className="bm-gp-card-name">{row.name}</div>
        <div className="bm-gp-card-meta">{row.taluk_name} · {row.code}</div>
        {hasAgent && (
          <div className="bm-gp-agent-pill bm-gp-agent-pill-card" title={`Agent: ${agent!.full_name}`}>
            <div className="bm-gp-agent-avatar">
              {agent!.profile_photo_url
                ? <img src={agent!.profile_photo_url} alt={agent!.full_name} />
                : <span>{initials(agent!.full_name)}</span>}
            </div>
            <div className="bm-gp-agent-text">
              <div className="bm-gp-agent-name">{agent!.full_name}</div>
              <div className="bm-gp-agent-role">Agent</div>
            </div>
          </div>
        )}
        {hasAgent && (row.caseworkers.length > 0 || row.telecallers.length > 0 || row.support_staff.length > 0) && (
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
        )}
      </div>
      {!hasAgent && (
        <button
          type="button"
          className="bm-gp-add-btn is-primary bm-gp-card-cta"
          onClick={onAddAgent}
        >
          <HiOutlineUserAdd /> Add agent
        </button>
      )}
    </div>
  );
};

export default GPList;
