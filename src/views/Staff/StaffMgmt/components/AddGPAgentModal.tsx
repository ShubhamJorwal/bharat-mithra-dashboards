import { useEffect, useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineLocationMarker,
  HiOutlineUserAdd,
  HiOutlinePhone,
  HiOutlineSupport,
  HiOutlineBriefcase,
} from "react-icons/hi";
import { useBodyScrollLock } from "@/hooks";
import managementApi from "@/services/api/management.api";
import type {
  CreateAssignmentRequest,
  StaffMini,
  SlotDefinitionsResponse,
} from "@/types/api.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  scope: {
    state_id: string;
    state_code?: string;
    district_id: string;
    taluk_id: string;
    gram_panchayat_id: string;
    gp_name?: string;
    gp_code?: string;
  };
  defs: SlotDefinitionsResponse | null;
}

const AGENT_ROLES = [
  { code: "caseworker", label: "Caseworker", icon: HiOutlineBriefcase, supportsSub: false },
  { code: "telecaller", label: "Telecaller", icon: HiOutlinePhone, supportsSub: true },
  { code: "support_staff", label: "Support Staff", icon: HiOutlineSupport, supportsSub: false },
];

const AddGPAgentModal = ({ open, onClose, onSaved, scope, defs }: Props) => {
  useBodyScrollLock(open);

  const [roleCode, setRoleCode] = useState("caseworker");
  const [subRole, setSubRole] = useState("");
  const [picked, setPicked] = useState<StaffMini | null>(null);
  const [notes, setNotes] = useState("");

  const [staffQ, setStaffQ] = useState("");
  const [staffResults, setStaffResults] = useState<StaffMini[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = AGENT_ROLES.find((r) => r.code === roleCode);
  const supportsSub = !!selectedRole?.supportsSub;

  // Reset state every time it opens
  useEffect(() => {
    if (!open) return;
    setRoleCode("caseworker");
    setSubRole("");
    setPicked(null);
    setNotes("");
    setStaffQ("");
    setError(null);
  }, [open]);

  // Debounced staff search
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setStaffLoading(true);
      try {
        const r = await managementApi.searchStaff(staffQ, scope.state_code);
        if (!cancelled) setStaffResults(r.data?.results || []);
      } catch {
        if (!cancelled) setStaffResults([]);
      } finally {
        if (!cancelled) setStaffLoading(false);
      }
    }, 200);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [staffQ, open, scope.state_code]);

  const handleSave = async () => {
    if (!picked) { setError("Pick a staff member first"); return; }
    setSaving(true); setError(null);
    try {
      // Backend assigns at the district level with this single GP in gp_ids.
      const body: CreateAssignmentRequest = {
        staff_id: picked.id,
        level: "district",
        state_id: scope.state_id,
        district_id: scope.district_id,
        taluk_id: scope.taluk_id,
        role_code: roleCode,
        sub_role: subRole || undefined,
        notes: notes.trim() || undefined,
        gp_ids: [scope.gram_panchayat_id],
      };
      await managementApi.createAssignment(body);
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to assign agent");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const subRoles = defs?.sub_roles || [];

  return (
    <div className="bm-sm-overlay" onClick={onClose} role="presentation">
      <div className="bm-sm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bm-sm-header">
          <div>
            <div className="bm-sm-eyebrow">Assign agent</div>
            <h2>Add agent to {scope.gp_name || "GP"}</h2>
            {scope.gp_code && <div className="bm-gp-modal-sub"><HiOutlineLocationMarker /> {scope.gp_code}</div>}
          </div>
          <button type="button" onClick={onClose} className="bm-sm-close" aria-label="Close">
            <HiOutlineX />
          </button>
        </div>

        <div className="bm-sm-form">
          {/* Role picker */}
          <div className="bm-form-row">
            <label className="bm-form-label">Role</label>
            <div className="bm-role-grid">
              {AGENT_ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.code}
                    type="button"
                    className={`bm-role-chip ${roleCode === r.code ? "is-on" : ""}`}
                    onClick={() => { setRoleCode(r.code); setSubRole(""); }}
                  >
                    <Icon /> {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-role for telecaller */}
          {supportsSub && subRoles.length > 0 && (
            <div className="bm-form-row">
              <label className="bm-form-label">Sub-role <span className="bm-form-opt">(optional)</span></label>
              <div className="bm-sub-pills">
                {subRoles.map((sr) => (
                  <button
                    key={sr}
                    type="button"
                    className={`bm-pill ${subRole === sr ? "is-on" : ""}`}
                    onClick={() => setSubRole(subRole === sr ? "" : sr)}
                  >
                    {sr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Staff picker */}
          <div className="bm-form-row">
            <label className="bm-form-label">Staff member</label>
            <div className="bm-sm-search bm-sm-search-inline">
              <HiOutlineSearch />
              <input
                autoFocus
                type="text"
                placeholder="Search by name, email, mobile, code…"
                value={staffQ}
                onChange={(e) => setStaffQ(e.target.value)}
              />
            </div>

            <div className="bm-sm-results bm-sm-results-mid">
              {staffLoading && <div className="bm-sm-loading">Searching…</div>}
              {!staffLoading && staffResults.length === 0 && (
                <div className="bm-sm-empty">
                  <HiOutlineUserAdd />
                  <p>No staff found.</p>
                  <small>Add the person via /staff/members first.</small>
                </div>
              )}
              {!staffLoading && staffResults.map((s) => {
                const isPicked = picked?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`bm-sm-row ${isPicked ? "is-picked" : ""}`}
                    onClick={() => setPicked(s)}
                  >
                    <div className="bm-staff-avatar">
                      {s.profile_photo_url
                        ? <img src={s.profile_photo_url} alt={s.full_name} />
                        : <span>{s.full_name.split(/\s+/).slice(0,2).map(c=>c[0]).join("").toUpperCase()}</span>}
                    </div>
                    <div className="bm-staff-text">
                      <div className="bm-staff-name">{s.full_name}</div>
                      <div className="bm-staff-meta">
                        {s.designation || s.department || "—"} · {s.email}
                      </div>
                    </div>
                    {isPicked && <HiOutlineCheck className="bm-sm-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bm-form-row">
            <label className="bm-form-label">Notes <span className="bm-form-opt">(optional)</span></label>
            <textarea
              className="bm-input bm-textarea"
              rows={2}
              value={notes}
              placeholder="Anything to remember about this assignment…"
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <div className="bm-sm-error">{error}</div>}
        </div>

        <div className="bm-sm-footer">
          <button type="button" className="bm-btn bm-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="bm-btn bm-btn-primary"
            disabled={!picked || saving}
            onClick={handleSave}
          >
            {saving ? "Assigning…" : `Assign ${picked ? picked.full_name : "agent"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGPAgentModal;
