import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlinePhone,
  HiOutlineSupport,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineUserAdd,
  HiOutlineViewGrid,
  HiOutlineViewList,
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import geographyApi from "@/services/api/geography.api";
import managementApi from "@/services/api/management.api";
import type {
  Taluk,
  TalukLevelResponse,
  StaffAssignment,
  SlotDefinitionsResponse,
  District,
  GramPanchayat,
  GPRow,
  StaffMini,
} from "@/types/api.types";
import CustomRoleCard from "../StaffMgmt/components/CustomRoleCard";
import AddCustomStaffModal from "../StaffMgmt/components/AddCustomStaffModal";
import AddGPAgentModal from "../StaffMgmt/components/AddGPAgentModal";
import "../StaffMgmt/StaffMgmt.scss";
import "../StateStaff/StateStaff.scss";

type GPFilter = "all" | "active" | "vacant";
type GPView = "list" | "grid";

const TalukStaff = () => {
  const { code, districtId, talukId } = useParams<{ code: string; districtId: string; talukId: string }>();
  const navigate = useNavigate();

  const [taluk, setTaluk] = useState<Taluk | null>(null);
  const [district, setDistrict] = useState<District | null>(null);
  const [level, setLevel] = useState<TalukLevelResponse | null>(null);
  const [defs, setDefs] = useState<SlotDefinitionsResponse | null>(null);
  const [stateId, setStateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Per-GP agent assignment modal
  const [agentForGP, setAgentForGP] = useState<GramPanchayat | null>(null);

  // GP list state — pulls all GPs in this taluk plus their staff coverage.
  const [gps, setGps] = useState<GramPanchayat[]>([]);
  const [gpStaffByID, setGpStaffByID] = useState<Map<string, GPRow>>(new Map());
  const [gpSearch, setGpSearch] = useState("");
  const [gpFilter, setGpFilter] = useState<GPFilter>("all");
  const [gpView, setGpView] = useState<GPView>("list");

  const loadAll = async () => {
    if (!talukId) return;
    setLoading(true); setError(null);
    try {
      const [tRes, lvl, defsRes, gpsRes] = await Promise.all([
        geographyApi.getTalukById(talukId),
        managementApi.getTalukLevel(talukId),
        managementApi.getSlotDefinitions(),
        geographyApi.getTalukGramPanchayats(talukId, { per_page: 1000, sort_by: "name", sort_order: "asc" } as any),
      ]);
      const t = (tRes as any).data as Taluk;
      setTaluk(t);
      setLevel(lvl.data);
      setDefs(defsRes.data);
      setGps(((gpsRes as any).data || []) as GramPanchayat[]);

      if (districtId) {
        const dRes = await geographyApi.getDistrictById(districtId);
        const d = (dRes as any).data as District;
        setDistrict(d);
        setStateId(d.state_id || "");

        // Load district-wide GP staff coverage and filter to this taluk's GPs.
        try {
          const districtGPs = await managementApi.getDistrictGPs(districtId);
          const map = new Map<string, GPRow>();
          for (const row of districtGPs.data?.rows || []) {
            if (row.taluk_id === talukId) map.set(row.gram_panchayat_id, row);
          }
          setGpStaffByID(map);
        } catch {
          setGpStaffByID(new Map());
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [talukId, districtId]);

  const handleRemove = async (a: StaffAssignment) => {
    if (!window.confirm(`Remove ${a.staff.full_name} from this taluk?`)) return;
    await managementApi.deleteAssignment(a.id);
    loadAll();
  };

  const stateCode = (code || "").toUpperCase();

  const gpStats = useMemo(() => {
    let active = 0;
    for (const gp of gps) {
      const staff = gpStaffByID.get(gp.id);
      if (staff?.has_agent) active++;
    }
    return { total: gps.length, active, vacant: gps.length - active };
  }, [gps, gpStaffByID]);

  const filteredGPs = useMemo(() => {
    let list = gps;
    if (gpFilter === "active") list = list.filter((gp) => gpStaffByID.get(gp.id)?.has_agent);
    if (gpFilter === "vacant") list = list.filter((gp) => !gpStaffByID.get(gp.id)?.has_agent);
    if (gpSearch.trim()) {
      const q = gpSearch.trim().toLowerCase();
      list = list.filter((gp) =>
        gp.name.toLowerCase().includes(q) || (gp.code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [gps, gpStaffByID, gpFilter, gpSearch]);

  return (
    <div className="bm-state-staff">
      <PageHeader
        title={taluk ? `${taluk.name} Taluk — Staff` : "Taluk Staff"}
        description={taluk?.headquarters ? `HQ · ${taluk.headquarters}` : "Custom roles + gram panchayat coverage."}
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
        <span className="current">{taluk?.name || "Taluk"}</span>
      </div>

      {error && <div className="bm-error">{error}</div>}

      {/* Coverage stats */}
      <div className="bm-coverage-stats">
        <div className="bm-coverage-tile tone-cyan">
          <div className="bm-coverage-icon"><HiOutlineOfficeBuilding /></div>
          <div className="bm-coverage-text">
            <div className="bm-coverage-value">{gpStats.total}</div>
            <div className="bm-coverage-label">Gram Panchayats</div>
          </div>
        </div>
        <div className="bm-coverage-tile tone-green">
          <div className="bm-coverage-icon"><HiOutlineLocationMarker /></div>
          <div className="bm-coverage-text">
            <div className="bm-coverage-value">{(taluk?.total_villages || 0).toLocaleString()}</div>
            <div className="bm-coverage-label">Villages</div>
          </div>
        </div>
        <div className="bm-coverage-tile tone-amber">
          <div className="bm-coverage-icon"><HiOutlineUserGroup /></div>
          <div className="bm-coverage-text">
            <div className="bm-coverage-value">{level?.counts.custom_roles || 0}</div>
            <div className="bm-coverage-label">Custom roles</div>
            {gpStats.vacant > 0 && <div className="bm-coverage-sub">{gpStats.vacant} vacant GPs</div>}
          </div>
        </div>
      </div>

      {/* ─── Taluk-level custom roles ────────────────────────────── */}
      <section className="bm-mgmt-section">
        <div className="bm-mgmt-section-header">
          <div>
            <h2>Taluk staff</h2>
            <p>Custom roles only at this level. Caseworkers / telecallers / support staff are usually assigned at the district level (their GP coverage is shown below).</p>
          </div>
          {level && <span className="bm-counts"><strong>{level.counts.custom_roles}</strong> custom</span>}
        </div>

        {(level?.custom?.length || 0) > 0 ? (
          <div className="bm-custom-grid">
            {level!.custom.map((a) => (
              <CustomRoleCard key={a.id} assignment={a} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <div className="bm-mgmt-empty">
            <p>No custom roles for this taluk yet.</p>
          </div>
        )}

        <button type="button" className="bm-add-cta" onClick={() => setAddOpen(true)}>
          <HiOutlinePlus /> Add custom role
        </button>
      </section>

      {/* ─── Gram Panchayats ─────────────────────────────────────── */}
      <section className="bm-mgmt-section">
        <div className="bm-mgmt-section-header">
          <div>
            <h2>Gram Panchayats</h2>
            <p>Every GP in this taluk. Active = at least one caseworker, telecaller, or support agent assigned.</p>
          </div>
          <span className="bm-counts">
            <strong>{filteredGPs.length}</strong>{gpSearch && filteredGPs.length !== gps.length && <> of {gps.length}</>} GPs
          </span>
        </div>

        {gps.length > 0 && (
          <>
            <div className="bm-gp-stats">
              <div className="bm-gp-stat"><span className="n">{gpStats.total}</span><span className="l">Total GPs</span></div>
              <div className="bm-gp-stat tone-active"><span className="n">{gpStats.active}</span><span className="l">Active</span></div>
              <div className="bm-gp-stat tone-vacant"><span className="n">{gpStats.vacant}</span><span className="l">Vacant</span></div>
            </div>

            <div className="bm-gp-toolbar-bar">
              <div className="bm-search-bar">
                <HiOutlineSearch />
                <input
                  type="text"
                  placeholder="Search GP by name or code…"
                  value={gpSearch}
                  onChange={(e) => setGpSearch(e.target.value)}
                />
                {gpSearch && (
                  <button type="button" className="bm-search-clear" onClick={() => setGpSearch("")} aria-label="Clear">
                    <HiOutlineX />
                  </button>
                )}
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
                      className={`bm-seg ${gpFilter === opt.v ? "is-on" : ""} ${opt.tone ? `tone-${opt.tone}` : ""}`}
                      onClick={() => setGpFilter(opt.v)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="bm-view-toggle">
                  <button
                    type="button"
                    className={gpView === "grid" ? "is-on" : ""}
                    onClick={() => setGpView("grid")}
                    title="Grid view"
                    aria-label="Grid view"
                  >
                    <HiOutlineViewGrid />
                  </button>
                  <button
                    type="button"
                    className={gpView === "list" ? "is-on" : ""}
                    onClick={() => setGpView("list")}
                    title="List view"
                    aria-label="List view"
                  >
                    <HiOutlineViewList />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {gps.length === 0 ? (
          <div className="bm-mgmt-empty">
            <p>No gram panchayats found for this taluk.</p>
          </div>
        ) : filteredGPs.length === 0 ? (
          <div className="bm-mgmt-empty">
            <p>No GPs match your filter.</p>
          </div>
        ) : (
          <div className={gpView === "grid" ? "bm-gp-grid" : "bm-gp-rows"}>
            {filteredGPs.map((gp) =>
              gpView === "grid" ? (
                <TalukGPCard
                  key={gp.id}
                  gp={gp}
                  staff={gpStaffByID.get(gp.id)}
                  onAddAgent={() => setAgentForGP(gp)}
                />
              ) : (
                <TalukGPRow
                  key={gp.id}
                  gp={gp}
                  staff={gpStaffByID.get(gp.id)}
                  onAddAgent={() => setAgentForGP(gp)}
                />
              ),
            )}
          </div>
        )}
      </section>

      <AddCustomStaffModal
        open={addOpen}
        level="taluk"
        defs={defs}
        scope={{ state_id: stateId, state_code: stateCode, district_id: districtId, taluk_id: talukId }}
        onClose={() => setAddOpen(false)}
        onSaved={loadAll}
      />

      <AddGPAgentModal
        open={!!agentForGP}
        defs={defs}
        scope={{
          state_id: stateId,
          state_code: stateCode,
          district_id: districtId || "",
          taluk_id: talukId || "",
          gram_panchayat_id: agentForGP?.id || "",
          gp_name: agentForGP?.name,
          gp_code: agentForGP?.code,
        }}
        onClose={() => setAgentForGP(null)}
        onSaved={loadAll}
      />
    </div>
  );
};

const TalukGPRow = ({
  gp,
  staff,
  onAddAgent,
}: {
  gp: GramPanchayat;
  staff?: GPRow;
  onAddAgent: () => void;
}) => {
  const hasAgent = !!staff?.has_agent;
  const total = (staff?.caseworkers?.length || 0) + (staff?.telecallers?.length || 0) + (staff?.support_staff?.length || 0);
  return (
    <div className={`bm-gp-row-card ${hasAgent ? "is-active" : "is-vacant"}`}>
      <div className="bm-gp-row-left">
        <div className="bm-gp-row-icon"><HiOutlineLocationMarker /></div>
        <div>
          <div className="bm-gp-row-name">{gp.name}</div>
          <div className="bm-gp-row-meta">{gp.code || ""}{gp.lgd_code && ` · LGD ${gp.lgd_code}`}</div>
        </div>
      </div>
      <div className="bm-gp-row-right">
        {hasAgent ? (
          <>
            <span className="bm-gp-pill tone-active">
              <span className="bm-pill-dot" />
              {total} agent{total === 1 ? "" : "s"}
            </span>
            <div className="bm-gp-agents">
              {staff!.caseworkers.length > 0 && (
                <RoleStack icon={<HiOutlineBriefcase />} label="Caseworker" staff={staff!.caseworkers} />
              )}
              {staff!.telecallers.length > 0 && (
                <RoleStack icon={<HiOutlinePhone />} label="Telecaller" staff={staff!.telecallers} />
              )}
              {staff!.support_staff.length > 0 && (
                <RoleStack icon={<HiOutlineSupport />} label="Support" staff={staff!.support_staff} />
              )}
            </div>
          </>
        ) : (
          <span className="bm-gp-pill tone-vacant">Vacant — no agent</span>
        )}
        <button
          type="button"
          className={`bm-gp-add-btn ${hasAgent ? "is-secondary" : "is-primary"}`}
          onClick={onAddAgent}
          title={hasAgent ? `Add another agent to ${gp.name}` : `Assign an agent to ${gp.name}`}
        >
          <HiOutlineUserAdd /> {hasAgent ? "Add" : "Add agent"}
        </button>
      </div>
    </div>
  );
};

const RoleStack = ({ icon, label, staff }: { icon: React.ReactNode; label: string; staff: StaffMini[] }) => (
  <div className="bm-role-stack" title={`${label}: ${staff.map((s) => s.full_name).join(", ")}`}>
    <span className="bm-role-stack-icon">{icon}</span>
    <span className="bm-role-stack-count">{staff.length}</span>
    <span className="bm-role-stack-label">{label}</span>
  </div>
);

const TalukGPCard = ({
  gp,
  staff,
  onAddAgent,
}: {
  gp: GramPanchayat;
  staff?: GPRow;
  onAddAgent: () => void;
}) => {
  const hasAgent = !!staff?.has_agent;
  const total = (staff?.caseworkers?.length || 0) + (staff?.telecallers?.length || 0) + (staff?.support_staff?.length || 0);
  return (
    <div className={`bm-gp-card ${hasAgent ? "is-active" : "is-vacant"}`}>
      <div className="bm-gp-card-head">
        <div className="bm-gp-row-icon"><HiOutlineLocationMarker /></div>
        <span className={`bm-gp-pill tone-${hasAgent ? "active" : "vacant"}`}>
          {hasAgent ? <><span className="bm-pill-dot" /> {total} agent{total === 1 ? "" : "s"}</> : "Vacant"}
        </span>
      </div>
      <div className="bm-gp-card-body">
        <div className="bm-gp-card-name">{gp.name}</div>
        <div className="bm-gp-card-meta">
          {gp.code || ""}{gp.lgd_code && ` · LGD ${gp.lgd_code}`}
        </div>
        {hasAgent && (
          <div className="bm-gp-agents">
            {staff!.caseworkers.length > 0 && (
              <RoleStack icon={<HiOutlineBriefcase />} label="Caseworker" staff={staff!.caseworkers} />
            )}
            {staff!.telecallers.length > 0 && (
              <RoleStack icon={<HiOutlinePhone />} label="Telecaller" staff={staff!.telecallers} />
            )}
            {staff!.support_staff.length > 0 && (
              <RoleStack icon={<HiOutlineSupport />} label="Support" staff={staff!.support_staff} />
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className={`bm-gp-add-btn ${hasAgent ? "is-secondary" : "is-primary"} bm-gp-card-cta`}
        onClick={onAddAgent}
      >
        <HiOutlineUserAdd /> {hasAgent ? "Add another agent" : "Add agent"}
      </button>
    </div>
  );
};

export default TalukStaff;
