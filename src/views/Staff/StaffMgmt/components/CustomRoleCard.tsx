import { Link } from "react-router-dom";
import {
  HiOutlinePhone,
  HiOutlineSupport,
  HiOutlineBriefcase,
  HiOutlineUserCircle,
  HiOutlineX,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import type { StaffAssignment } from "@/types/api.types";

const ROLE_ICONS: Record<string, React.ComponentType> = {
  telecaller: HiOutlinePhone,
  support_staff: HiOutlineSupport,
  caseworker: HiOutlineBriefcase,
  asst_accountant: HiOutlineUserCircle,
};

const ROLE_LABELS: Record<string, string> = {
  telecaller: "Telecaller",
  support_staff: "Support Staff",
  caseworker: "Caseworker",
  asst_accountant: "Asst Accountant",
  custom: "Custom Role",
};

interface Props {
  assignment: StaffAssignment;
  onRemove?: (a: StaffAssignment) => void;
}

const CustomRoleCard = ({ assignment: a, onRemove }: Props) => {
  const Icon = ROLE_ICONS[a.role_code] || HiOutlineUserCircle;
  const label = a.role_code === "custom"
    ? (a.custom_role_label || "Custom Role")
    : ROLE_LABELS[a.role_code] || a.role_code;
  const gpCount = a.gps?.length || 0;

  return (
    <div className="bm-custom-card">
      {onRemove && (
        <button
          type="button"
          className="bm-custom-remove"
          title="Remove"
          onClick={() => onRemove(a)}
        >
          <HiOutlineX />
        </button>
      )}

      <div className="bm-custom-role-row">
        <div className="bm-custom-role-icon"><Icon /></div>
        <div>
          <div className="bm-custom-role-label">{label}</div>
          {a.sub_role && <span className={`bm-sub-pill bm-sub-${a.sub_role}`}>{a.sub_role}</span>}
        </div>
      </div>

      <Link to={`/staff/${a.staff.id}`} className="bm-custom-staff">
        <div className="bm-staff-avatar bm-staff-avatar-sm">
          {a.staff.profile_photo_url ? (
            <img src={a.staff.profile_photo_url} alt={a.staff.full_name} />
          ) : (
            <span>{a.staff.full_name.split(/\s+/).slice(0,2).map(s=>s[0]).join("").toUpperCase()}</span>
          )}
        </div>
        <div className="bm-staff-text">
          <div className="bm-staff-name">{a.staff.full_name}</div>
          <div className="bm-staff-meta">{a.staff.email}</div>
        </div>
      </Link>

      {gpCount > 0 && (
        <div className="bm-custom-gp-count">
          <HiOutlineLocationMarker /> {gpCount} GP{gpCount === 1 ? "" : "s"} assigned
        </div>
      )}
    </div>
  );
};

export default CustomRoleCard;
