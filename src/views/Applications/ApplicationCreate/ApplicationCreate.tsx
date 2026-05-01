import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineUser,
  HiOutlineDeviceMobile,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import applicationsApi from "@/services/api/applications.api";
import servicesApi from "@/services/api/services.api";
import type {
  Application,
  CreateApplicationRequest,
  ApplicationPriority,
} from "@/types/api.types";
import "./ApplicationCreate.scss";

type Step = 1 | 2 | 3;

interface ServiceOption {
  id: string;
  code: string;
  name: string;
  category_name?: string;
  requires_caseworker: boolean;
  agent_can_complete: boolean;
}

const ApplicationCreate = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  // Step 1: service
  const [serviceSearch, setServiceSearch] = useState("");
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [pickedService, setPickedService] = useState<ServiceOption | null>(null);

  // Step 2: citizen + routing
  const [citizenName, setCitizenName] = useState("");
  const [citizenMobile, setCitizenMobile] = useState("");
  const [citizenEmail, setCitizenEmail] = useState("");
  const [citizenAadhaar4, setCitizenAadhaar4] = useState("");
  const [citizenAddress, setCitizenAddress] = useState("");
  const [citizenPincode, setCitizenPincode] = useState("");
  const [priority, setPriority] = useState<ApplicationPriority>("normal");
  const [internalNotes, setInternalNotes] = useState("");
  const [agentOnlyOverride, setAgentOnlyOverride] = useState<"default" | "agent" | "caseworker">("default");

  // Step 3: review + submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Application | null>(null);

  // Load services list (debounced search)
  useEffect(() => {
    const t = window.setTimeout(async () => {
      setServicesLoading(true);
      try {
        const r = await servicesApi.list({
          search: serviceSearch || undefined,
          per_page: 30,
          is_active: true,
        } as any);
        const data: any[] = (r as any).data || [];
        setServices(
          data.map((s) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            category_name: s.category?.name,
            requires_caseworker: s.requires_caseworker !== false,
            agent_can_complete: !!s.agent_can_complete,
          })),
        );
      } catch {
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [serviceSearch]);

  const validateStep2 = (): string | null => {
    if (!citizenName.trim()) return "Citizen name is required";
    if (!citizenMobile.trim()) return "Citizen mobile is required";
    if (citizenMobile.replace(/\D/g, "").length !== 10) return "Mobile must be 10 digits";
    if (citizenAadhaar4 && !/^\d{4}$/.test(citizenAadhaar4)) return "Aadhaar last 4 must be 4 digits";
    return null;
  };

  const handleSubmit = async () => {
    if (!pickedService) return;
    const v = validateStep2();
    if (v) { setError(v); return; }

    setSubmitting(true);
    setError(null);
    try {
      const body: CreateApplicationRequest = {
        service_id: pickedService.id,
        citizen_name: citizenName.trim(),
        citizen_mobile: citizenMobile.replace(/\D/g, ""),
        citizen_email: citizenEmail.trim() || undefined,
        citizen_aadhaar_last4: citizenAadhaar4 || undefined,
        citizen_address: citizenAddress.trim() || undefined,
        citizen_pincode: citizenPincode.trim() || undefined,
        priority,
        internal_notes: internalNotes.trim() || undefined,
        agent_only_override:
          agentOnlyOverride === "agent" ? true :
          agentOnlyOverride === "caseworker" ? false :
          undefined,
      };
      const r = await applicationsApi.create(body);
      if (r.success && r.data) {
        setCreated(r.data);
      } else {
        throw new Error(r.message || "Failed to create application");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.error?.message || e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Routing preview based on service flags + override.
  const routingPreview = (() => {
    if (!pickedService) return null;
    if (agentOnlyOverride === "agent") return "agent";
    if (agentOnlyOverride === "caseworker") return "caseworker";
    return pickedService.agent_can_complete && !pickedService.requires_caseworker
      ? "agent" : "caseworker";
  })();

  // ─── Success screen ───────────────────────────────────────────
  if (created) {
    return (
      <div className="bm-app-new">
        <PageHeader
          title="Application created"
          description="The application has been logged and routed."
          actions={
            <Link to="/applications" className="bm-app-new-btn-back">
              <HiOutlineArrowLeft /> Back to applications
            </Link>
          }
        />
        <div className="bm-app-success">
          <HiOutlineCheckCircle className="bm-app-success-check" />
          <h2>{created.application_code}</h2>
          <p>
            Application for <strong>{created.service?.name}</strong> on behalf of{" "}
            <strong>{created.citizen_name}</strong> ({created.citizen_mobile}) was
            successfully {created.is_agent_only ? "completed by the agent." : "submitted."}
          </p>
          <div className="bm-app-success-route">
            {created.is_agent_only ? (
              <span className="bm-app-route-tag agent">
                <HiOutlineUserGroup /> Handled by agent — no caseworker needed
              </span>
            ) : created.assigned_caseworker ? (
              <span className="bm-app-route-tag cw">
                Routed to {created.assigned_caseworker.full_name} (caseworker)
              </span>
            ) : (
              <span className="bm-app-route-tag warn">
                <HiOutlineExclamationCircle /> No caseworker covers this GP yet — sitting in the unassigned queue
              </span>
            )}
          </div>
          <div className="bm-app-success-actions">
            <Link to={`/applications/${created.id}`} className="bm-app-new-btn-primary">
              View details
            </Link>
            <button
              type="button"
              className="bm-app-new-btn-secondary"
              onClick={() => {
                // reset for another submission
                setStep(1); setPickedService(null);
                setCitizenName(""); setCitizenMobile(""); setCitizenEmail("");
                setCitizenAadhaar4(""); setCitizenAddress(""); setCitizenPincode("");
                setPriority("normal"); setInternalNotes("");
                setAgentOnlyOverride("default"); setCreated(null);
              }}
            >
              + New application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-app-new">
      <PageHeader
        title="New application"
        description="Pick a service, fill in citizen details, and submit on their behalf."
        actions={
          <button type="button" className="bm-app-new-btn-back" onClick={() => navigate("/applications")}>
            <HiOutlineArrowLeft /> Back
          </button>
        }
      />

      {/* Step indicator */}
      <div className="bm-app-steps">
        {[1, 2, 3].map((s) => {
          const labels = ["Service", "Citizen details", "Review & submit"];
          return (
            <div
              key={s}
              className={`bm-app-step ${step === s ? "is-current" : ""} ${step > s ? "is-done" : ""}`}
            >
              <span className="bm-app-step-num">{step > s ? <HiOutlineCheck /> : s}</span>
              <span className="bm-app-step-label">{labels[s - 1]}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="bm-app-step-body">
          <div className="bm-app-section-title">
            <h2>Pick a service</h2>
            <p>The service determines whether the application is agent-handled (e.g. Aadhaar download) or routed to a caseworker.</p>
          </div>

          <div className="bm-app-search">
            <HiOutlineSearch />
            <input
              type="text"
              placeholder="Search services by name or code…"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="bm-app-services">
            {servicesLoading && <div className="bm-app-empty"><p>Loading services…</p></div>}
            {!servicesLoading && services.length === 0 && (
              <div className="bm-app-empty"><p>No services found.</p></div>
            )}
            {services.map((s) => {
              const isPicked = pickedService?.id === s.id;
              const route = s.agent_can_complete && !s.requires_caseworker
                ? "agent" : "caseworker";
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`bm-app-service-card ${isPicked ? "is-picked" : ""}`}
                  onClick={() => setPickedService(s)}
                >
                  <div className="bm-app-service-main">
                    <div className="bm-app-service-name">{s.name}</div>
                    <div className="bm-app-service-meta">
                      {s.category_name && <span>{s.category_name}</span>}
                      <span className="bm-app-service-code">{s.code}</span>
                    </div>
                  </div>
                  <span className={`bm-app-route-tag ${route}`}>
                    {route === "agent" ? (
                      <><HiOutlineUserGroup /> Agent-only</>
                    ) : (
                      <><HiOutlineLightningBolt /> Routes to caseworker</>
                    )}
                  </span>
                  {isPicked && <HiOutlineCheck className="bm-app-service-check" />}
                </button>
              );
            })}
          </div>

          <div className="bm-app-step-foot">
            <button
              type="button"
              className="bm-app-new-btn-primary"
              disabled={!pickedService}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Citizen details */}
      {step === 2 && pickedService && (
        <div className="bm-app-step-body">
          <div className="bm-app-section-title">
            <h2>Citizen details</h2>
            <p>Collect what the citizen has on hand. Mobile is required so they can be reached for status updates.</p>
          </div>

          <div className="bm-app-form-grid">
            <div className="bm-app-field">
              <label><HiOutlineUser /> Full name <span className="bm-app-req">*</span></label>
              <input
                type="text"
                placeholder="As on the document"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
              />
            </div>
            <div className="bm-app-field">
              <label><HiOutlineDeviceMobile /> Mobile <span className="bm-app-req">*</span></label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={citizenMobile}
                onChange={(e) => setCitizenMobile(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                maxLength={10}
              />
            </div>
            <div className="bm-app-field">
              <label><HiOutlineMail /> Email</label>
              <input
                type="email"
                placeholder="optional"
                value={citizenEmail}
                onChange={(e) => setCitizenEmail(e.target.value)}
              />
            </div>
            <div className="bm-app-field">
              <label>Aadhaar (last 4 digits)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="optional"
                value={citizenAadhaar4}
                onChange={(e) => setCitizenAadhaar4(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                maxLength={4}
              />
            </div>
            <div className="bm-app-field bm-app-field-wide">
              <label><HiOutlineLocationMarker /> Address</label>
              <textarea
                rows={2}
                placeholder="optional"
                value={citizenAddress}
                onChange={(e) => setCitizenAddress(e.target.value)}
              />
            </div>
            <div className="bm-app-field">
              <label>PIN code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="optional"
                value={citizenPincode}
                onChange={(e) => setCitizenPincode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                maxLength={6}
              />
            </div>
            <div className="bm-app-field">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as ApplicationPriority)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Routing override (only if service permits both) */}
          {pickedService.agent_can_complete && pickedService.requires_caseworker && (
            <div className="bm-app-routing">
              <h3>Who should handle this?</h3>
              <p>This service can be processed either way. Pick how you want to route it.</p>
              <div className="bm-app-routing-cards">
                <label className={`bm-app-routing-card ${agentOnlyOverride === "default" ? "is-picked" : ""}`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={agentOnlyOverride === "default"}
                    onChange={() => setAgentOnlyOverride("default")}
                  />
                  <strong>Service default</strong>
                  <small>Use the recommended path</small>
                </label>
                <label className={`bm-app-routing-card ${agentOnlyOverride === "agent" ? "is-picked" : ""}`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={agentOnlyOverride === "agent"}
                    onChange={() => setAgentOnlyOverride("agent")}
                  />
                  <strong>I'll handle it</strong>
                  <small>Stays with the agent — no caseworker</small>
                </label>
                <label className={`bm-app-routing-card ${agentOnlyOverride === "caseworker" ? "is-picked" : ""}`}>
                  <input
                    type="radio"
                    name="routing"
                    checked={agentOnlyOverride === "caseworker"}
                    onChange={() => setAgentOnlyOverride("caseworker")}
                  />
                  <strong>Send to caseworker</strong>
                  <small>Auto-assign to the caseworker covering this GP</small>
                </label>
              </div>
            </div>
          )}

          <div className="bm-app-field bm-app-field-wide">
            <label>Internal notes (visible to staff only)</label>
            <textarea
              rows={2}
              placeholder="Anything to remember about this application…"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>

          <div className="bm-app-step-foot">
            <button type="button" className="bm-app-new-btn-secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button
              type="button"
              className="bm-app-new-btn-primary"
              onClick={() => {
                const v = validateStep2();
                if (v) { setError(v); return; }
                setError(null);
                setStep(3);
              }}
            >
              Continue →
            </button>
          </div>
          {error && <div className="bm-app-error"><HiOutlineExclamationCircle /> {error}</div>}
        </div>
      )}

      {/* Step 3: Review + submit */}
      {step === 3 && pickedService && (
        <div className="bm-app-step-body">
          <div className="bm-app-section-title">
            <h2>Review & submit</h2>
            <p>Make sure everything's correct before submitting.</p>
          </div>

          <div className="bm-app-review">
            <ReviewRow label="Service" value={pickedService.name} hint={pickedService.code} />
            <ReviewRow label="Citizen" value={citizenName} hint={citizenMobile} />
            {citizenEmail && <ReviewRow label="Email" value={citizenEmail} />}
            {citizenAadhaar4 && <ReviewRow label="Aadhaar" value={`••• ${citizenAadhaar4}`} />}
            {citizenAddress && <ReviewRow label="Address" value={citizenAddress} hint={citizenPincode} />}
            <ReviewRow label="Priority" value={priority} />
            <ReviewRow
              label="Routing"
              value={
                routingPreview === "agent"
                  ? "Handled by agent (no caseworker)"
                  : "Auto-assigned to the caseworker covering this GP"
              }
            />
            {internalNotes && <ReviewRow label="Internal notes" value={internalNotes} />}
          </div>

          {error && <div className="bm-app-error"><HiOutlineExclamationCircle /> {error}</div>}

          <div className="bm-app-step-foot">
            <button type="button" className="bm-app-new-btn-secondary" onClick={() => setStep(2)} disabled={submitting}>
              ← Back
            </button>
            <button
              type="button"
              className="bm-app-new-btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewRow = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="bm-app-review-row">
    <div className="bm-app-review-label">{label}</div>
    <div className="bm-app-review-value">
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  </div>
);

export default ApplicationCreate;
