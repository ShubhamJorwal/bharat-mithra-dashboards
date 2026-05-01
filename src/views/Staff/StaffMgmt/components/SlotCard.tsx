import { Link } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
  HiOutlineCalculator,
  HiOutlinePlusCircle,
  HiOutlineDotsHorizontal,
} from "react-icons/hi";
import type { SlotResponse, StaffAssignment } from "@/types/api.types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "shield-check": HiOutlineShieldCheck,
  "user-circle": HiOutlineUserCircle,
  "calculator": HiOutlineCalculator,
};

interface SlotCardProps {
  slot: SlotResponse;
  onAssign: (slot: SlotResponse) => void;
  onRemove?: (asg: StaffAssignment) => void;
}

export const SlotCard = ({ slot, onAssign, onRemove }: SlotCardProps) => {
  const Icon = ICONS[slot.icon] || HiOutlineUserCircle;
  const filled = !!slot.assignment;
  const a = slot.assignment;

  return (
    <div className={`bm-slot-card ${filled ? "is-filled" : "is-vacant"}`}>
      <div className="bm-slot-header">
        <div className="bm-slot-icon"><Icon /></div>
        <div className="bm-slot-titles">
          <div className="bm-slot-label">{slot.label}</div>
          <div className="bm-slot-status">{filled ? "Active" : "Vacant"}</div>
        </div>
        {filled && onRemove && (
          <button
            type="button"
            className="bm-slot-menu"
            title="Remove from this slot"
            onClick={() => a && onRemove(a)}
          >
            <HiOutlineDotsHorizontal />
          </button>
        )}
      </div>

      {filled && a ? (
        <Link to={`/staff/${a.staff.id}`} className="bm-slot-body bm-slot-body-link">
          <div className="bm-staff-avatar">
            {a.staff.profile_photo_url ? (
              <img src={a.staff.profile_photo_url} alt={a.staff.full_name} />
            ) : (
              <span>{initials(a.staff.full_name)}</span>
            )}
          </div>
          <div className="bm-staff-text">
            <div className="bm-staff-name">{a.staff.full_name}</div>
            <div className="bm-staff-meta">
              {a.staff.designation || a.staff.department || a.staff.employee_code}
            </div>
            <div className="bm-staff-contact">{a.staff.email}</div>
          </div>
        </Link>
      ) : (
        <button
          type="button"
          className="bm-slot-body bm-slot-body-vacant"
          onClick={() => onAssign(slot)}
        >
          <div className="bm-vacant-illust">
            <HiOutlinePlusCircle />
          </div>
          <div className="bm-vacant-text">
            <div className="bm-vacant-title">Assign staff</div>
            <div className="bm-vacant-sub">Pick from existing team</div>
          </div>
        </button>
      )}
    </div>
  );
};

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

export default SlotCard;
