import { useEffect, useState } from "react";
import {
  HiOutlineX,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineSupport,
  HiOutlineBriefcase,
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineDeviceMobile,
  HiOutlineIdentification,
  HiOutlineCheckCircle,
  HiOutlineClipboardCopy,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { useBodyScrollLock } from "@/hooks";
import managementApi from "@/services/api/management.api";
import staffApi from "@/services/api/staff.api";
import type {
  CreateAssignmentRequest,
  CreateStaffRequest,
  SlotDefinitionsResponse,
  Staff,
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
  {
    code: "caseworker",
    label: "Caseworker",
    icon: HiOutlineBriefcase,
    supportsSub: false,
    description: "Fulfills citizen applications and changes their status.",
    designation: "Caseworker",
    department: "Field",
  },
  {
    code: "telecaller",
    label: "Telecaller",
    icon: HiOutlinePhone,
    supportsSub: true,
    description: "Outbound + inbound citizen calls for this GP.",
    designation: "Telecaller",
    department: "Operations",
  },
  {
    code: "support_staff",
    label: "Support Staff",
    icon: HiOutlineSupport,
    supportsSub: false,
    description: "On-ground support and citizen handholding.",
    designation: "Support Staff",
    department: "Support",
  },
];

type SuccessInfo = {
  staff: Staff;
  tempPassword?: string;
};

const AddGPAgentModal = ({ open, onClose, onSaved, scope, defs }: Props) => {
  useBodyScrollLock(open);

  // Role + sub-role
  const [roleCode, setRoleCode] = useState("caseworker");
  const [subRole, setSubRole] = useState("");

  // Agent form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedRole = AGENT_ROLES.find((r) => r.code === roleCode);
  const supportsSub = !!selectedRole?.supportsSub;
  const subRoles = defs?.sub_roles || [];

  // Reset state every time the modal opens. All fields start empty —
  // the role-specific text appears as input placeholders only.
  useEffect(() => {
    if (!open) return;
    setRoleCode("caseworker");
    setSubRole("");
    setFullName("");
    setEmail("");
    setMobile("");
    setDesignation("");
    setDepartment("");
    setNotes("");
    setError(null);
    setSuccess(null);
    setCopied(false);
    setSaving(false);
  }, [open]);

  const validateForm = (): string | null => {
    if (!fullName.trim()) return "Full name is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Email looks invalid";
    if (!mobile.trim()) return "Mobile is required";
    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) return "Mobile must be 10 digits";
    return null;
  };

  const handleSave = async () => {
    const v = validateForm();
    if (v) { setError(v); return; }
    setSaving(true);
    setError(null);

    try {
      // 1. Create the new staff member.
      const staffBody: CreateStaffRequest = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.replace(/\D/g, ""),
        designation: designation.trim() || selectedRole?.designation,
        department: department.trim() || selectedRole?.department,
        home_state_code: scope.state_code,
        home_district_id: scope.district_id,
      };
      const staffRes = await staffApi.create(staffBody);
      if (!staffRes.success || !staffRes.data?.staff?.id) {
        throw new Error(staffRes.message || "Failed to create staff member");
      }
      const newStaff = staffRes.data.staff;
      const tempPassword = staffRes.data.temp_password;

      // 2. Assign the new staff to this GP (district-level role + gp_ids).
      const assignBody: CreateAssignmentRequest = {
        staff_id: newStaff.id,
        level: "district",
        state_id: scope.state_id,
        district_id: scope.district_id,
        taluk_id: scope.taluk_id,
        role_code: roleCode,
        sub_role: subRole || undefined,
        notes: notes.trim() || undefined,
        gp_ids: [scope.gram_panchayat_id],
      };
      await managementApi.createAssignment(assignBody);

      setSuccess({ staff: newStaff, tempPassword });
      onSaved();
    } catch (e: any) {
      const msg = e?.response?.data?.message
        || e?.response?.data?.error?.message
        || e?.message
        || "Failed to create agent";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const copyPassword = async () => {
    if (!success?.tempPassword) return;
    try {
      await navigator.clipboard.writeText(success.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {/* ignore */}
  };

  if (!open) return null;

  // ─── Success state ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="bm-sm-overlay" onClick={onClose} role="presentation">
        <div className="bm-sm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="bm-sm-header">
            <div>
              <div className="bm-sm-eyebrow bm-sm-eyebrow-success">Agent created</div>
              <h2>{success.staff.full_name} is ready</h2>
              {scope.gp_name && (
                <div className="bm-gp-modal-sub">
                  <HiOutlineLocationMarker /> Assigned to {scope.gp_name}
                </div>
              )}
            </div>
            <button type="button" onClick={onClose} className="bm-sm-close" aria-label="Close">
              <HiOutlineX />
            </button>
          </div>

          <div className="bm-sm-form">
            <div className="bm-success-card">
              <HiOutlineCheckCircle className="bm-success-check" />
              <div>
                <div className="bm-success-title">Staff record created</div>
                <div className="bm-success-meta">
                  <strong>{success.staff.employee_code}</strong> · {success.staff.email} · {success.staff.mobile}
                </div>
              </div>
            </div>

            {success.tempPassword && (
              <div className="bm-temp-pw">
                <div className="bm-temp-pw-label">
                  <HiOutlineExclamationCircle /> Temporary password — share securely with the agent
                </div>
                <div className="bm-temp-pw-value">
                  <code>{success.tempPassword}</code>
                  <button type="button" className="bm-temp-pw-copy" onClick={copyPassword} title="Copy">
                    <HiOutlineClipboardCopy /> {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="bm-temp-pw-hint">
                  The agent will be forced to reset this on first login. This password is shown only once.
                </div>
              </div>
            )}
          </div>

          <div className="bm-sm-footer">
            <button type="button" className="bm-btn bm-btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form state ──────────────────────────────────────────────────
  return (
    <div className="bm-sm-overlay" onClick={onClose} role="presentation">
      <div className="bm-sm-modal bm-sm-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="bm-sm-header">
          <div>
            <div className="bm-sm-eyebrow">New agent</div>
            <h2>Add agent for {scope.gp_name || "GP"}</h2>
            {scope.gp_code && (
              <div className="bm-gp-modal-sub">
                <HiOutlineLocationMarker /> {scope.gp_code}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} className="bm-sm-close" aria-label="Close">
            <HiOutlineX />
          </button>
        </div>

        <div className="bm-sm-form">
          {/* Role */}
          <div className="bm-form-row">
            <label className="bm-form-label">Agent role</label>
            <div className="bm-role-cards">
              {AGENT_ROLES.map((r) => {
                const Icon = r.icon;
                const on = roleCode === r.code;
                return (
                  <button
                    key={r.code}
                    type="button"
                    className={`bm-role-card ${on ? "is-on" : ""}`}
                    onClick={() => { setRoleCode(r.code); setSubRole(""); }}
                  >
                    <div className="bm-role-card-icon"><Icon /></div>
                    <div className="bm-role-card-text">
                      <div className="bm-role-card-name">{r.label}</div>
                      <div className="bm-role-card-desc">{r.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-role for telecaller */}
          {supportsSub && subRoles.length > 0 && (
            <div className="bm-form-row">
              <label className="bm-form-label">Sub-role <span className="bm-form-opt">(optional badge)</span></label>
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

          {/* Personal details */}
          <div className="bm-form-grid-2">
            <div className="bm-form-row">
              <label className="bm-form-label">
                <HiOutlineUser /> Full name <span className="bm-form-required">*</span>
              </label>
              <input
                type="text"
                className="bm-input"
                placeholder="e.g. Anita Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="bm-form-row">
              <label className="bm-form-label">
                <HiOutlineDeviceMobile /> Mobile <span className="bm-form-required">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                className="bm-input"
                placeholder="10-digit mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                maxLength={10}
              />
            </div>
            <div className="bm-form-row bm-form-row-wide">
              <label className="bm-form-label">
                <HiOutlineMail /> Email <span className="bm-form-required">*</span>
              </label>
              <input
                type="email"
                className="bm-input"
                placeholder="agent@bharatmithra.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="bm-form-row">
              <label className="bm-form-label">
                <HiOutlineIdentification /> Designation
              </label>
              <input
                type="text"
                className="bm-input"
                placeholder={selectedRole?.designation || "Designation"}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
            <div className="bm-form-row">
              <label className="bm-form-label">Department</label>
              <input
                type="text"
                className="bm-input"
                placeholder={selectedRole?.department || "Department"}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bm-form-row">
            <label className="bm-form-label">Notes <span className="bm-form-opt">(optional)</span></label>
            <textarea
              className="bm-input bm-textarea"
              rows={2}
              value={notes}
              placeholder="Anything to remember about this agent…"
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="bm-form-info">
            <HiOutlineExclamationCircle />
            <span>
              A new staff record will be created and the agent will be assigned to{" "}
              <strong>{scope.gp_name || "this GP"}</strong>. A temporary password will be
              generated — you'll see it on the next screen.
            </span>
          </div>

          {error && <div className="bm-sm-error">{error}</div>}
        </div>

        <div className="bm-sm-footer">
          <button type="button" className="bm-btn bm-btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="bm-btn bm-btn-primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Creating agent…" : "Create agent & assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGPAgentModal;
