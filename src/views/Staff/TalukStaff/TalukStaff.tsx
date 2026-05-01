import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft, HiOutlineRefresh, HiOutlinePlus,
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
} from "@/types/api.types";
import CustomRoleCard from "../StaffMgmt/components/CustomRoleCard";
import AddCustomStaffModal from "../StaffMgmt/components/AddCustomStaffModal";
import "../StaffMgmt/StaffMgmt.scss";

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

  const loadAll = async () => {
    if (!talukId) return;
    setLoading(true); setError(null);
    try {
      const [tRes, lvl, defsRes] = await Promise.all([
        geographyApi.getTalukById(talukId),
        managementApi.getTalukLevel(talukId),
        managementApi.getSlotDefinitions(),
      ]);
      const t = (tRes as any).data as Taluk;
      setTaluk(t);
      setLevel(lvl.data);
      setDefs(defsRes.data);
      if (districtId) {
        const dRes = await geographyApi.getDistrictById(districtId);
        const d = (dRes as any).data as District;
        setDistrict(d);
        setStateId(d.state_id || "");
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

  return (
    <div className="bm-state-staff">
      <PageHeader
        title={taluk ? `${taluk.name} Taluk — Staff` : "Taluk Staff"}
        description="Add custom roles for this taluk."
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

      <section className="bm-mgmt-section">
        <div className="bm-mgmt-section-header">
          <div>
            <h2>Taluk staff</h2>
            <p>Custom roles only at this level. Caseworkers, telecallers and support are usually managed at the district level.</p>
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
            <p>No custom roles yet.</p>
          </div>
        )}

        <button type="button" className="bm-add-cta" onClick={() => setAddOpen(true)}>
          <HiOutlinePlus /> Add custom role
        </button>
      </section>

      <AddCustomStaffModal
        open={addOpen}
        level="taluk"
        defs={defs}
        scope={{ state_id: stateId, state_code: stateCode, district_id: districtId, taluk_id: talukId }}
        onClose={() => setAddOpen(false)}
        onSaved={loadAll}
      />
    </div>
  );
};

export default TalukStaff;
