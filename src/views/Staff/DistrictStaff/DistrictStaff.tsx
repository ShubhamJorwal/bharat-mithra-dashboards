import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineChevronRight,
  HiOutlineLocationMarker,
  HiOutlineMap,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import geographyApi from "@/services/api/geography.api";
import managementApi from "@/services/api/management.api";
import type {
  District,
  Taluk,
  DistrictLevelResponse,
  StaffAssignment,
  SlotResponse,
  SlotDefinitionsResponse,
} from "@/types/api.types";
import SlotCard from "../StaffMgmt/components/SlotCard";
import CustomRoleCard from "../StaffMgmt/components/CustomRoleCard";
import AssignSlotModal from "../StaffMgmt/components/AssignSlotModal";
import AddCustomStaffModal from "../StaffMgmt/components/AddCustomStaffModal";
import "../StaffMgmt/StaffMgmt.scss";
import "../StateStaff/StateStaff.scss";

const DistrictStaff = () => {
  const { code, districtId } = useParams<{ code: string; districtId: string }>();
  const navigate = useNavigate();

  const [district, setDistrict] = useState<District | null>(null);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [level, setLevel] = useState<DistrictLevelResponse | null>(null);
  const [defs, setDefs] = useState<SlotDefinitionsResponse | null>(null);
  const [stateId, setStateId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignSlot, setAssignSlot] = useState<SlotResponse | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const loadAll = async () => {
    if (!districtId) return;
    setLoading(true); setError(null);
    try {
      const [dRes, tRes, lvl, defsRes] = await Promise.all([
        geographyApi.getDistrictById(districtId),
        geographyApi.getDistrictTaluks(districtId, { per_page: 200, sort_by: "name", sort_order: "asc" } as any),
        managementApi.getDistrictLevel(districtId),
        managementApi.getSlotDefinitions(),
      ]);
      const d = (dRes as any).data as District;
      setDistrict(d);
      setStateId(d.state_id || "");
      setTaluks(((tRes as any).data || []) as Taluk[]);
      setLevel(lvl.data);
      setDefs(defsRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [districtId]);

  const handleRemove = async (a: StaffAssignment) => {
    if (!window.confirm(`Remove ${a.staff.full_name} from this slot?`)) return;
    await managementApi.deleteAssignment(a.id);
    loadAll();
  };

  const stateCode = (code || "").toUpperCase();

  const staffStats = useMemo(() => {
    const filled = level?.counts.filled_slots || 0;
    const vacant = level?.counts.vacant_slots || 0;
    const custom = level?.counts.custom_roles || 0;
    return { filled, vacant, custom, total: filled + custom };
  }, [level]);

  return (
    <div className="bm-state-staff">
      <PageHeader
        title={district ? `${district.name} District — Staff` : "District Staff"}
        description={district?.headquarters ? `HQ · ${district.headquarters}` : "Manage district leadership and field staff."}
        actions={
          <div className="bm-actions">
            <button type="button" className="bm-btn bm-btn-ghost" onClick={loadAll} disabled={loading}>
              <HiOutlineRefresh className={loading ? "spin" : ""} /> Refresh
            </button>
            <Link to={`/staff/state/${code}/district/${districtId}/gps`} className="bm-btn bm-btn-secondary">
              <HiOutlineMap /> View all GPs
            </Link>
            <button type="button" className="bm-btn-back" onClick={() => navigate(`/staff/state/${code}`)}>
              <HiOutlineArrowLeft /> Back to {stateCode}
            </button>
          </div>
        }
      />

      <div className="bm-breadcrumb">
        <Link to="/staff">Staff</Link>
        <span>/</span>
        <Link to={`/staff/state/${code}`}>{stateCode}</Link>
        <span>/</span>
        <span className="current">{district?.name || "District"}</span>
      </div>

      {error && <div className="bm-error">{error}</div>}

      {/* Coverage stats */}
      <div className="bm-coverage-stats">
        <div className="bm-coverage-tile tone-indigo">
          <div className="bm-coverage-icon"><HiOutlineMap /></div>
          <div className="bm-coverage-text">
            <div className="bm-coverage-value">{taluks.length}</div>
            <div className="bm-coverage-label">Taluks</div>
          </div>
        </div>
        <div className="bm-coverage-tile tone-cyan">
          <div className="bm-coverage-icon"><HiOutlineOfficeBuilding /></div>
          <div className="bm-coverage-text">
            <div className="bm-coverage-value">{(district?.total_gram_panchayats || 0).toLocaleString()}</div>
            <div className="bm-coverage-label">Gram Panchayats</div>
          </div>
        </div>
        <div className="bm-coverage-tile tone-green">
          <div className="bm-coverage-icon"><HiOutlineLocationMarker /></div>
          <div className="bm-coverage-text">
            <div className="bm-coverage-value">{(district?.total_villages || 0).toLocaleString()}</div>
            <div className="bm-coverage-label">Villages</div>
          </div>
        </div>
        <div className="bm-coverage-tile tone-amber">
          <div className="bm-coverage-icon"><HiOutlineUserGroup /></div>
          <div className="bm-coverage-text">
            <div className="bm-coverage-value">{staffStats.total}</div>
            <div className="bm-coverage-label">Staff assigned</div>
            {staffStats.vacant > 0 && <div className="bm-coverage-sub">{staffStats.vacant} vacant slots</div>}
          </div>
        </div>
      </div>

      {/* District-level slots */}
      <section className="bm-mgmt-section">
        <div className="bm-mgmt-section-header">
          <div>
            <h2>District-level team</h2>
            <p>District leadership and accountants.</p>
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
            <h3 className="bm-subhead">Telecallers, support, caseworkers &amp; custom roles</h3>
            <div className="bm-custom-grid">
              {level!.custom.map((a) => (
                <CustomRoleCard key={a.id} assignment={a} onRemove={handleRemove} />
              ))}
            </div>
          </>
        )}

        <button type="button" className="bm-add-cta" onClick={() => setAddOpen(true)}>
          <HiOutlinePlus /> Add custom staff
        </button>
      </section>

      {/* Taluks */}
      <section className="bm-mgmt-section">
        <div className="bm-mgmt-section-header">
          <div>
            <h2>Taluks</h2>
            <p>Drill into a taluk to add custom roles. Gram panchayats are managed under each taluk.</p>
          </div>
          <span className="bm-counts">{taluks.length} taluks</span>
        </div>

        <div className="bm-district-grid">
          {taluks.map((t) => (
            <Link
              key={t.id}
              to={`/staff/state/${code}/district/${districtId}/taluk/${t.id}`}
              className="bm-district-card"
            >
              <div className="bm-district-icon"><HiOutlineLocationMarker /></div>
              <div className="bm-district-body">
                <div className="bm-district-name">{t.name}</div>
                <div className="bm-district-meta">
                  {(t as any).code}
                  {(t as any).total_gram_panchayats != null && <> · {(t as any).total_gram_panchayats} GPs</>}
                </div>
              </div>
              <HiOutlineChevronRight className="bm-district-chev" />
            </Link>
          ))}
        </div>
      </section>

      <AssignSlotModal
        open={!!assignSlot}
        slot={assignSlot}
        level="district"
        scope={{ state_id: stateId, state_code: stateCode, district_id: districtId }}
        onClose={() => setAssignSlot(null)}
        onSaved={loadAll}
      />
      <AddCustomStaffModal
        open={addOpen}
        level="district"
        defs={defs}
        scope={{ state_id: stateId, state_code: stateCode, district_id: districtId }}
        onClose={() => setAddOpen(false)}
        onSaved={loadAll}
      />
    </div>
  );
};

export default DistrictStaff;
