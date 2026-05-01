import { useEffect, useMemo, useState } from "react";
import { HiOutlineSearch, HiOutlineX, HiOutlineUserAdd, HiOutlineCheck } from "react-icons/hi";
import { useBodyScrollLock } from "@/hooks";
import managementApi from "@/services/api/management.api";
import type {
  AssignmentLevel,
  CreateAssignmentRequest,
  SlotResponse,
  StaffMini,
} from "@/types/api.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  level: AssignmentLevel;
  slot: SlotResponse | null;
  scope: {
    state_id: string;
    state_code?: string;
    district_id?: string;
    taluk_id?: string;
  };
}

const AssignSlotModal = ({ open, onClose, onSaved, level, slot, scope }: Props) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<StaffMini[]>([]);
  const [picked, setPicked] = useState<StaffMini | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); setPicked(null); setError(null); return; }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const r = await managementApi.searchStaff(q, scope.state_code);
        if (!cancelled) setResults(r.data?.results || []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [q, open, scope.state_code]);

  const handleSave = async () => {
    if (!picked || !slot) return;
    setSaving(true);
    setError(null);
    try {
      const body: CreateAssignmentRequest = {
        staff_id: picked.id,
        level,
        state_id: scope.state_id,
        district_id: scope.district_id,
        taluk_id: scope.taluk_id,
        role_code: slot.role_code,
      };
      await managementApi.createAssignment(body);
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to assign");
    } finally {
      setSaving(false);
    }
  };

  const titleSuffix = useMemo(() => slot?.label ? ` to ${slot.label}` : "", [slot]);

  if (!open) return null;

  return (
    <div className="bm-sm-overlay" onClick={onClose} role="presentation">
      <div className="bm-sm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bm-sm-header">
          <div>
            <div className="bm-sm-eyebrow">Assign staff</div>
            <h2>Pick a team member{titleSuffix}</h2>
          </div>
          <button type="button" onClick={onClose} className="bm-sm-close" aria-label="Close">
            <HiOutlineX />
          </button>
        </div>

        <div className="bm-sm-search">
          <HiOutlineSearch />
          <input
            autoFocus
            type="text"
            placeholder="Search by name, email, mobile, or employee code…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {error && <div className="bm-sm-error">{error}</div>}

        <div className="bm-sm-results">
          {loading && <div className="bm-sm-loading">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="bm-sm-empty">
              <HiOutlineUserAdd />
              <p>No matching staff found.</p>
              <small>Try a different search, or add the person via /staff/members first.</small>
            </div>
          )}
          {!loading && results.map((s) => {
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

        <div className="bm-sm-footer">
          <button type="button" className="bm-btn bm-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="bm-btn bm-btn-primary"
            disabled={!picked || saving}
            onClick={handleSave}
          >
            {saving ? "Assigning…" : `Assign ${picked ? picked.full_name : "staff"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignSlotModal;
