import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineLocationMarker,
  HiOutlineUserAdd,
} from "react-icons/hi";
import { useBodyScrollLock } from "@/hooks";
import managementApi from "@/services/api/management.api";
import geographyApi from "@/services/api/geography.api";
import type {
  AssignmentLevel,
  CreateAssignmentRequest,
  SlotDefinitionsResponse,
  StaffMini,
  AssignmentPermission,
} from "@/types/api.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  level: AssignmentLevel;
  scope: {
    state_id: string;
    state_code?: string;
    district_id?: string;
    taluk_id?: string;
    gram_panchayat_id?: string;
  };
  defs: SlotDefinitionsResponse | null;
}

interface GPOption {
  id: string;
  name: string;
  taluk_id: string;
  taluk_name: string;
}

const AddCustomStaffModal = ({ open, onClose, onSaved, level, scope, defs }: Props) => {
  useBodyScrollLock(open);
  // Form state
  const [roleCode, setRoleCode] = useState("caseworker");
  const [customLabel, setCustomLabel] = useState("");
  const [subRole, setSubRole] = useState("");
  const [picked, setPicked] = useState<StaffMini | null>(null);
  const [pickedGPIds, setPickedGPIds] = useState<Set<string>>(new Set());
  const [perms, setPerms] = useState<AssignmentPermission[]>([]);
  const [notes, setNotes] = useState("");

  // Search state
  const [staffQ, setStaffQ] = useState("");
  const [staffResults, setStaffResults] = useState<StaffMini[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // GP picker state
  const [gpOptions, setGPOptions] = useState<GPOption[]>([]);
  const [gpSearch, setGPSearch] = useState("");
  const [gpsLoading, setGPsLoading] = useState(false);
  const [gpPanelOpen, setGPPanelOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = defs?.district_role_options || [];
  const selectedRole = roleOptions.find((r) => r.code === roleCode);
  const isGPScoped = !!selectedRole?.gp_scoped;
  const isCustom = selectedRole?.is_custom;

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setRoleCode(level === "taluk" ? "custom" : "caseworker");
    setCustomLabel("");
    setSubRole("");
    setPicked(null);
    setPickedGPIds(new Set());
    setPerms([]);
    setNotes("");
    setStaffQ("");
    setError(null);
    setGPPanelOpen(false);
  }, [open, level]);

  // Search staff (debounced)
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

  // Fetch GPs for the side panel when opening it (filtered to district scope)
  useEffect(() => {
    if (!open || !isGPScoped || !scope.district_id) return;
    let cancelled = false;
    setGPsLoading(true);
    geographyApi
      .getGramPanchayats({ district_id: scope.district_id, per_page: 1000, sort_by: "name", sort_order: "asc" } as any)
      .then((r) => {
        if (cancelled) return;
        const data = (r as any).data || [];
        setGPOptions(
          data.map((gp: any) => ({
            id: gp.id,
            name: gp.name,
            taluk_id: gp.taluk_id,
            taluk_name: gp.taluk_name || gp.taluk?.name || "",
          })),
        );
      })
      .catch(() => setGPOptions([]))
      .finally(() => { if (!cancelled) setGPsLoading(false); });
    return () => { cancelled = true; };
  }, [open, isGPScoped, scope.district_id]);

  const filteredGPs = useMemo(() => {
    const q = gpSearch.trim().toLowerCase();
    if (!q) return gpOptions;
    return gpOptions.filter(
      (g) => g.name.toLowerCase().includes(q) || g.taluk_name.toLowerCase().includes(q),
    );
  }, [gpOptions, gpSearch]);

  const groupedGPs = useMemo(() => {
    const map = new Map<string, { name: string; gps: GPOption[] }>();
    for (const g of filteredGPs) {
      if (!map.has(g.taluk_id)) map.set(g.taluk_id, { name: g.taluk_name, gps: [] });
      map.get(g.taluk_id)!.gps.push(g);
    }
    return Array.from(map.values());
  }, [filteredGPs]);

  const toggleGP = (id: string) => {
    setPickedGPIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const togglePerm = (mod: string, field: "can_view" | "can_edit") => {
    setPerms((prev) => {
      const i = prev.findIndex((p) => p.module_code === mod);
      if (i < 0) {
        return [...prev, { module_code: mod, can_view: field === "can_view", can_edit: field === "can_edit" }];
      }
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: !copy[i][field] };
      // If both off, drop the row
      if (!copy[i].can_view && !copy[i].can_edit) copy.splice(i, 1);
      return copy;
    });
  };

  const handleSave = async () => {
    if (!picked) { setError("Pick a staff member first"); return; }
    if (isCustom && !customLabel.trim()) { setError("Custom role needs a name"); return; }
    if (isGPScoped && pickedGPIds.size === 0) {
      setError("Pick at least one gram panchayat to cover");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body: CreateAssignmentRequest = {
        staff_id: picked.id,
        level,
        state_id: scope.state_id,
        district_id: scope.district_id,
        taluk_id: scope.taluk_id,
        gram_panchayat_id: scope.gram_panchayat_id,
        role_code: roleCode,
        custom_role_label: isCustom ? customLabel.trim() : undefined,
        sub_role: subRole || undefined,
        notes: notes.trim() || undefined,
        gp_ids: isGPScoped ? Array.from(pickedGPIds) : undefined,
        permissions: isCustom ? perms : undefined,
      };
      await managementApi.createAssignment(body);
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  const filteredRoleOptions = level === "taluk"
    ? roleOptions.filter((r) => r.is_custom)
    : roleOptions;

  return (
    <div className="bm-sm-overlay" onClick={onClose} role="presentation">
      <div className="bm-sm-modal bm-sm-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="bm-sm-header">
          <div>
            <div className="bm-sm-eyebrow">Add staff</div>
            <h2>Add custom staff</h2>
          </div>
          <button type="button" onClick={onClose} className="bm-sm-close" aria-label="Close">
            <HiOutlineX />
          </button>
        </div>

        <div className="bm-sm-form">
          {/* Role + sub-role */}
          <div className="bm-form-row">
            <label className="bm-form-label">Role</label>
            <div className="bm-role-grid">
              {filteredRoleOptions.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  className={`bm-role-chip ${roleCode === r.code ? "is-on" : ""}`}
                  onClick={() => { setRoleCode(r.code); setSubRole(""); setPickedGPIds(new Set()); }}
                >
                  {r.label}
                  {r.gp_scoped && <span className="bm-chip-tag">GP-scoped</span>}
                  {r.is_custom && <span className="bm-chip-tag bm-tag-custom">Custom</span>}
                </button>
              ))}
            </div>
          </div>

          {isCustom && (
            <div className="bm-form-row">
              <label className="bm-form-label">Custom role name</label>
              <input
                type="text"
                className="bm-input"
                placeholder="e.g. Field Coordinator"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
            </div>
          )}

          {selectedRole?.supports_sub_role && (
            <div className="bm-form-row">
              <label className="bm-form-label">Sub-role <span className="bm-form-opt">(optional)</span></label>
              <div className="bm-sub-pills">
                {(defs?.sub_roles || []).map((sr) => (
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

          {/* GP coverage */}
          {isGPScoped && (
            <div className="bm-form-row">
              <label className="bm-form-label">
                GP coverage <span className="bm-form-opt">({pickedGPIds.size} selected)</span>
              </label>
              <button
                type="button"
                className="bm-gp-trigger"
                onClick={() => setGPPanelOpen(true)}
              >
                <HiOutlineLocationMarker />
                {pickedGPIds.size === 0
                  ? "Pick gram panchayats this person will cover"
                  : `${pickedGPIds.size} gram panchayat${pickedGPIds.size === 1 ? "" : "s"} picked — click to edit`}
              </button>
            </div>
          )}

          {/* Custom-role module permissions */}
          {isCustom && (
            <div className="bm-form-row">
              <label className="bm-form-label">
                Module permissions <span className="bm-form-opt">(optional — refine later)</span>
              </label>
              <div className="bm-perm-grid">
                {(defs?.modules || []).map((m) => {
                  const p = perms.find((x) => x.module_code === m.code);
                  return (
                    <div key={m.code} className="bm-perm-row">
                      <div className="bm-perm-label">{m.label}</div>
                      <label className="bm-perm-toggle">
                        <input
                          type="checkbox"
                          checked={!!p?.can_view}
                          onChange={() => togglePerm(m.code, "can_view")}
                        />
                        <span>View</span>
                      </label>
                      <label className="bm-perm-toggle">
                        <input
                          type="checkbox"
                          checked={!!p?.can_edit}
                          onChange={() => togglePerm(m.code, "can_edit")}
                        />
                        <span>Edit</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bm-form-row">
            <label className="bm-form-label">Notes <span className="bm-form-opt">(optional)</span></label>
            <textarea
              className="bm-input bm-textarea"
              rows={2}
              value={notes}
              placeholder="Anything internal you want to remember about this assignment…"
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
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Adding…" : "Add staff"}
          </button>
        </div>

        {/* GP multi-select side panel */}
        {gpPanelOpen && (
          <div className="bm-gp-panel">
            <div className="bm-gp-panel-header">
              <div>
                <div className="bm-sm-eyebrow">GP coverage</div>
                <h3>Select gram panchayats</h3>
              </div>
              <button type="button" className="bm-sm-close" onClick={() => setGPPanelOpen(false)}>
                <HiOutlineX />
              </button>
            </div>
            <div className="bm-sm-search bm-sm-search-inline">
              <HiOutlineSearch />
              <input
                type="text"
                placeholder="Search GP or taluk…"
                value={gpSearch}
                onChange={(e) => setGPSearch(e.target.value)}
              />
            </div>
            <div className="bm-gp-toolbar">
              <button
                type="button"
                className="bm-link-btn"
                onClick={() => setPickedGPIds(new Set(filteredGPs.map((g) => g.id)))}
              >
                Select all visible
              </button>
              <button
                type="button"
                className="bm-link-btn"
                onClick={() => setPickedGPIds(new Set())}
              >
                Clear all
              </button>
              <span className="bm-gp-count">{pickedGPIds.size} picked</span>
            </div>
            <div className="bm-gp-list">
              {gpsLoading && <div className="bm-sm-loading">Loading GPs…</div>}
              {!gpsLoading && groupedGPs.length === 0 && (
                <div className="bm-sm-empty"><p>No GPs match.</p></div>
              )}
              {!gpsLoading && groupedGPs.map((grp) => (
                <div key={grp.name} className="bm-gp-group">
                  <div className="bm-gp-group-title">{grp.name}</div>
                  {grp.gps.map((g) => {
                    const on = pickedGPIds.has(g.id);
                    return (
                      <label key={g.id} className={`bm-gp-row ${on ? "is-on" : ""}`}>
                        <input type="checkbox" checked={on} onChange={() => toggleGP(g.id)} />
                        <span className="bm-gp-name">{g.name}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="bm-gp-panel-footer">
              <button type="button" className="bm-btn bm-btn-primary" onClick={() => setGPPanelOpen(false)}>
                Done — {pickedGPIds.size} selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCustomStaffModal;
