import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineLocationMarker,
  HiOutlineUsers,
  HiOutlineChevronRight,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineOfficeBuilding,
  HiOutlineMap,
  HiOutlineUserGroup,
  HiOutlineSparkles,
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import geographyApi from "@/services/api/geography.api";
import managementApi from "@/services/api/management.api";
import type {
  State,
  District,
  StateLevelResponse,
  StaffAssignment,
  SlotResponse,
  SlotDefinitionsResponse,
} from "@/types/api.types";
import SlotCard from "../StaffMgmt/components/SlotCard";
import CustomRoleCard from "../StaffMgmt/components/CustomRoleCard";
import AssignSlotModal from "../StaffMgmt/components/AssignSlotModal";
import AddCustomStaffModal from "../StaffMgmt/components/AddCustomStaffModal";
import { stateImageFor, fallbackImage } from "../StatePicker/stateImages";
import "../StaffMgmt/StaffMgmt.scss";
import "./StateStaff.scss";

type ViewMode = "grid" | "list";
type SortKey = "name" | "population" | "taluks";

const StateStaff = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<State | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [level, setLevel] = useState<StateLevelResponse | null>(null);
  const [defs, setDefs] = useState<SlotDefinitionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignSlot, setAssignSlot] = useState<SlotResponse | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // District toolbar state
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortKey>("name");

  const loadAll = async () => {
    if (!code) return;
    setLoading(true); setError(null);
    try {
      const stateRes = await geographyApi.getStateByCode(code.toUpperCase());
      const s = (stateRes as any).data as State;
      setState(s);
      const [lvl, dList, defsRes] = await Promise.all([
        managementApi.getStateLevel(s.id),
        geographyApi.getDistricts({ state_id: s.id, per_page: 200, sort_by: "name", sort_order: "asc" } as any),
        managementApi.getSlotDefinitions(),
      ]);
      setLevel(lvl.data);
      setDistricts(((dList as any).data || []) as District[]);
      setDefs(defsRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [code]);

  const handleRemove = async (a: StaffAssignment) => {
    if (!window.confirm(`Remove ${a.staff.full_name} from this slot?`)) return;
    await managementApi.deleteAssignment(a.id);
    loadAll();
  };

  // ─── Derived stats ──────────────────────────────────────────────
  const totals = useMemo(() => {
    const taluks = districts.reduce((sum, d) => sum + (d.total_taluks || 0), 0);
    const gps = districts.reduce((sum, d) => sum + (d.total_gram_panchayats || 0), 0);
    const villages = districts.reduce((sum, d) => sum + (d.total_villages || 0), 0);
    return { taluks, gps, villages };
  }, [districts]);

  const staffStats = useMemo(() => {
    const filled = level?.counts.filled_slots || 0;
    const vacant = level?.counts.vacant_slots || 0;
    const custom = level?.counts.custom_roles || 0;
    const total = filled + custom;
    return { filled, vacant, custom, total };
  }, [level]);

  const filteredDistricts = useMemo(() => {
    let list = districts.slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q)
        || (d.headquarters || "").toLowerCase().includes(q)
        || (d.code || "").toLowerCase().includes(q),
      );
    }
    if (sortBy === "population") list.sort((a, b) => (b.population || 0) - (a.population || 0));
    else if (sortBy === "taluks") list.sort((a, b) => (b.total_taluks || 0) - (a.total_taluks || 0));
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [districts, search, sortBy]);

  const stateBanner = state ? stateImageFor(state.code, state.banner_image_url as any) : "";
  const isActive = state?.management_status === "active";

  return (
    <div className="bm-state-staff">
      <PageHeader
        title={state ? `${state.name} — Staff Management` : "State Staff"}
        description={(state?.tagline as any) || "Manage state leadership, districts, taluks, and gram panchayats."}
        actions={
          <div className="bm-actions">
            <button type="button" className="bm-btn bm-btn-ghost" onClick={loadAll} disabled={loading}>
              <HiOutlineRefresh className={loading ? "spin" : ""} /> Refresh
            </button>
            <Link to="/staff/members" className="bm-btn bm-btn-secondary">
              <HiOutlineUsers /> All Staff Members
            </Link>
            <button type="button" className="bm-btn-back" onClick={() => navigate("/staff")}>
              <HiOutlineArrowLeft /> Back
            </button>
          </div>
        }
      />

      {error && <div className="bm-error">{error}</div>}

      {/* ─── Hero with overlay state info ────────────────────────── */}
      {state && (
        <div className="bm-state-hero">
          <img
            src={stateBanner}
            alt={state.name}
            onError={(e) => {
              const fb = fallbackImage(state.code);
              if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
            }}
          />
          <div className="bm-state-hero-overlay" />
          <div className="bm-state-hero-content">
            {isActive && (
              <span className="bm-hero-status">
                <span className="bm-hero-status-dot" /> Live
              </span>
            )}
            <h1>{state.name}</h1>
            <div className="bm-hero-meta">
              {state.capital && (
                <span><HiOutlineLocationMarker /> Capital · {state.capital}</span>
              )}
              {state.code && <span className="bm-hero-code">{state.code}</span>}
              {state.zone && <span>{(state.zone as any).toString().replace(/^./, (c: string) => c.toUpperCase())} zone</span>}
            </div>
          </div>
        </div>
      )}

      {/* ─── Coverage stats strip ────────────────────────────────── */}
      <div className="bm-coverage-stats">
        <CoverageStat icon={<HiOutlineOfficeBuilding />} label="Districts" value={districts.length} tone="indigo" />
        <CoverageStat icon={<HiOutlineMap />} label="Taluks" value={totals.taluks} tone="cyan" />
        <CoverageStat icon={<HiOutlineLocationMarker />} label="Gram Panchayats" value={totals.gps} tone="green" />
        <CoverageStat icon={<HiOutlineUserGroup />} label="Staff assigned" value={staffStats.total} tone="amber" sub={staffStats.vacant > 0 ? `${staffStats.vacant} vacant` : "fully staffed"} />
      </div>

      {/* ─── Quick jump nav ──────────────────────────────────────── */}
      <nav className="bm-jump-nav">
        <a href="#state-team" className="bm-jump-chip">State team</a>
        {staffStats.custom > 0 && <a href="#custom-roles" className="bm-jump-chip">Custom roles <span className="bm-jump-badge">{staffStats.custom}</span></a>}
        <a href="#districts" className="bm-jump-chip">Districts <span className="bm-jump-badge">{districts.length}</span></a>
      </nav>

      {/* ─── State-level slots ────────────────────────────────────── */}
      <section className="bm-mgmt-section" id="state-team">
        <div className="bm-mgmt-section-header">
          <div>
            <h2><HiOutlineSparkles className="bm-h2-icon" /> State leadership</h2>
            <p>Senior team responsible for the entire state.</p>
          </div>
          {level && (
            <span className="bm-counts">
              <strong>{staffStats.filled}</strong>/{staffStats.filled + staffStats.vacant} filled
              {staffStats.vacant > 0 && <> · <span className="bm-vacant-warn">{staffStats.vacant} vacant</span></>}
            </span>
          )}
        </div>

        <div className="bm-slot-grid">
          {(level?.slots || []).map((slot) => (
            <SlotCard
              key={slot.role_code}
              slot={slot}
              onAssign={() => setAssignSlot(slot)}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <button type="button" className="bm-add-cta" onClick={() => setAddOpen(true)}>
          <HiOutlinePlus /> Add custom role
        </button>
      </section>

      {/* ─── Custom roles ────────────────────────────────────────── */}
      {(level?.custom?.length || 0) > 0 && (
        <section className="bm-mgmt-section" id="custom-roles">
          <div className="bm-mgmt-section-header">
            <div>
              <h2>Custom state roles</h2>
              <p>Roles you've added on top of the default state slots.</p>
            </div>
            <span className="bm-counts"><strong>{level!.custom.length}</strong> custom</span>
          </div>
          <div className="bm-custom-grid">
            {level!.custom.map((a) => (
              <CustomRoleCard key={a.id} assignment={a} onRemove={handleRemove} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Districts ────────────────────────────────────────────── */}
      <section className="bm-mgmt-section" id="districts">
        <div className="bm-mgmt-section-header">
          <div>
            <h2>Districts</h2>
            <p>Click a district to manage its staff, taluks, and gram panchayats.</p>
          </div>
          <span className="bm-counts">
            <strong>{filteredDistricts.length}</strong>{search && filteredDistricts.length !== districts.length && <> of {districts.length}</>} districts
          </span>
        </div>

        {/* Toolbar */}
        <div className="bm-district-toolbar">
          <div className="bm-search-bar">
            <HiOutlineSearch />
            <input
              type="text"
              placeholder="Search district by name, code, or HQ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="bm-search-clear" onClick={() => setSearch("")} aria-label="Clear">
                <HiOutlineX />
              </button>
            )}
          </div>

          <div className="bm-toolbar-controls">
            <select
              className="bm-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              title="Sort districts"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="population">Sort: Population (high-low)</option>
              <option value="taluks">Sort: Taluks (most first)</option>
            </select>

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

        {loading && districts.length === 0 ? (
          <div className="bm-district-grid">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bm-district-card bm-district-skel" />)}
          </div>
        ) : filteredDistricts.length === 0 ? (
          <div className="bm-mgmt-empty">
            <p>No districts match "{search}".</p>
          </div>
        ) : view === "grid" ? (
          <div className="bm-district-grid bm-district-grid-rich">
            {filteredDistricts.map((d) => (
              <DistrictCard key={d.id} district={d} code={code} />
            ))}
          </div>
        ) : (
          <div className="bm-district-list">
            {filteredDistricts.map((d) => (
              <DistrictRow key={d.id} district={d} code={code} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Modals ───────────────────────────────────────────────── */}
      <AssignSlotModal
        open={!!assignSlot}
        slot={assignSlot}
        level="state"
        scope={{ state_id: state?.id || "", state_code: state?.code }}
        onClose={() => setAssignSlot(null)}
        onSaved={loadAll}
      />
      <AddCustomStaffModal
        open={addOpen}
        level="state"
        defs={defs}
        scope={{ state_id: state?.id || "", state_code: state?.code }}
        onClose={() => setAddOpen(false)}
        onSaved={loadAll}
      />
    </div>
  );
};

// ─── Stat tiles ────────────────────────────────────────────────────
const CoverageStat = ({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  tone: "indigo" | "cyan" | "green" | "amber";
}) => (
  <div className={`bm-coverage-tile tone-${tone}`}>
    <div className="bm-coverage-icon">{icon}</div>
    <div className="bm-coverage-text">
      <div className="bm-coverage-value">{value.toLocaleString()}</div>
      <div className="bm-coverage-label">{label}</div>
      {sub && <div className="bm-coverage-sub">{sub}</div>}
    </div>
  </div>
);

// ─── District card (grid view, rich) ──────────────────────────────
const DistrictCard = ({ district: d, code }: { district: District; code?: string }) => {
  const popK = d.population ? Math.round(d.population / 1000) : null;
  return (
    <Link
      to={`/staff/state/${code}/district/${d.id}`}
      className="bm-district-card bm-district-card-rich"
    >
      <div className="bm-district-card-top">
        <div className="bm-district-icon"><HiOutlineLocationMarker /></div>
        <div className="bm-district-name-block">
          <div className="bm-district-name">{d.name}</div>
          <div className="bm-district-meta">{d.headquarters || d.code}</div>
        </div>
        <HiOutlineChevronRight className="bm-district-chev" />
      </div>
      <div className="bm-district-stats">
        {d.total_taluks != null && (
          <span><strong>{d.total_taluks}</strong> taluks</span>
        )}
        {d.total_gram_panchayats != null && d.total_gram_panchayats > 0 && (
          <span><strong>{d.total_gram_panchayats.toLocaleString()}</strong> GPs</span>
        )}
        {popK != null && (
          <span><strong>{popK >= 1000 ? `${(popK / 1000).toFixed(1)}M` : `${popK}k`}</strong> people</span>
        )}
      </div>
    </Link>
  );
};

// ─── District row (list view, compact) ────────────────────────────
const DistrictRow = ({ district: d, code }: { district: District; code?: string }) => {
  const popK = d.population ? Math.round(d.population / 1000) : null;
  return (
    <Link
      to={`/staff/state/${code}/district/${d.id}`}
      className="bm-district-row"
    >
      <div className="bm-district-icon"><HiOutlineLocationMarker /></div>
      <div className="bm-district-row-name">
        <div className="bm-district-name">{d.name}</div>
        <div className="bm-district-meta">{d.headquarters || d.code}</div>
      </div>
      <div className="bm-district-row-stats">
        {d.total_taluks != null && <span><strong>{d.total_taluks}</strong> taluks</span>}
        {d.total_gram_panchayats != null && d.total_gram_panchayats > 0 && (
          <span><strong>{d.total_gram_panchayats.toLocaleString()}</strong> GPs</span>
        )}
        {popK != null && (
          <span><strong>{popK >= 1000 ? `${(popK / 1000).toFixed(1)}M` : `${popK}k`}</strong></span>
        )}
      </div>
      <HiOutlineChevronRight className="bm-district-chev" />
    </Link>
  );
};

export default StateStaff;
