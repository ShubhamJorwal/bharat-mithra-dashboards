import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineLocationMarker,
  HiOutlineUsers,
  HiOutlineChevronRight,
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
import "../StaffMgmt/StaffMgmt.scss";
import "./StateStaff.scss";

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

  return (
    <div className="bm-state-staff">
      <PageHeader
        title={state ? `${state.name} — Staff` : "State Staff"}
        description={(state?.tagline as any) || "Three-tier staff management for Karnataka."}
        actions={
          <div className="bm-actions">
            <button type="button" className="bm-btn bm-btn-ghost" onClick={loadAll} disabled={loading}>
              <HiOutlineRefresh className={loading ? "spin" : ""} /> Refresh
            </button>
            <button type="button" className="bm-btn-back" onClick={() => navigate("/staff")}>
              <HiOutlineArrowLeft /> Back
            </button>
          </div>
        }
      />

      {error && <div className="bm-error">{error}</div>}

      {state && (
        <div className="bm-state-hero">
          {state.banner_image_url && <img src={state.banner_image_url as any} alt={state.name} />}
          <div className="bm-state-hero-meta">
            <span className="bm-pill">Live</span>
            <h2>{state.name}</h2>
            {state.capital && <p>Capital · {state.capital}</p>}
          </div>
        </div>
      )}

      {/* ─── State-level slots ────────────────────────────────────── */}
      <section className="bm-mgmt-section">
        <div className="bm-mgmt-section-header">
          <div>
            <h2>State-level team</h2>
            <p>Senior leadership for the entire state.</p>
          </div>
          {level && (
            <span className="bm-counts">
              <strong>{level.counts.filled_slots}</strong>/{level.counts.filled_slots + level.counts.vacant_slots} slots filled
              {level.counts.custom_roles > 0 && <> · <strong>{level.counts.custom_roles}</strong> custom</>}
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

        {(level?.custom?.length || 0) > 0 && (
          <>
            <h3 className="bm-subhead">Custom roles</h3>
            <div className="bm-custom-grid">
              {level!.custom.map((a) => (
                <CustomRoleCard key={a.id} assignment={a} onRemove={handleRemove} />
              ))}
            </div>
          </>
        )}

        <button type="button" className="bm-add-cta" onClick={() => setAddOpen(true)}>
          <HiOutlinePlus /> Add custom role
        </button>
      </section>

      {/* ─── Districts ─────────────────────────────────────────────── */}
      <section className="bm-mgmt-section">
        <div className="bm-mgmt-section-header">
          <div>
            <h2>Districts</h2>
            <p>Click a district to manage its staff, taluks, and gram panchayats.</p>
          </div>
          <span className="bm-counts">{districts.length} districts</span>
        </div>

        {loading && districts.length === 0 ? (
          <div className="bm-district-grid">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bm-district-card bm-district-skel" />)}
          </div>
        ) : (
          <div className="bm-district-grid">
            {districts.map((d) => (
              <Link
                key={d.id}
                to={`/staff/state/${code}/district/${d.id}`}
                className="bm-district-card"
              >
                <div className="bm-district-icon"><HiOutlineLocationMarker /></div>
                <div className="bm-district-body">
                  <div className="bm-district-name">{d.name}</div>
                  <div className="bm-district-meta">
                    {d.headquarters || d.code}
                    {d.population != null && <> · {Math.round((d.population || 0) / 1000).toLocaleString()}k</>}
                  </div>
                </div>
                <HiOutlineChevronRight className="bm-district-chev" />
              </Link>
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

      {/* Quick "view all members" link */}
      <div className="bm-state-bottom">
        <Link to="/staff/members" className="bm-link">
          <HiOutlineUsers /> View all staff members across India
        </Link>
      </div>
    </div>
  );
};

export default StateStaff;
