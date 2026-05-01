import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineUsers,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineX,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import managementApi from "@/services/api/management.api";
import type { StateButton, StatesManagementResponse } from "@/types/api.types";
import { stateImageFor, fallbackImage } from "./stateImages";
import { useBodyScrollLock } from "@/hooks";
import "./StatePicker.scss";

type ViewFilter = "all" | "active" | "inactive";

const StatePicker = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StatesManagementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewFilter>("all");
  const [comingSoonState, setComingSoonState] = useState<StateButton | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await managementApi.listStates();
      setData(r.data || { active: [], inactive: [], total: 0 });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load states");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!comingSoonState) return;
    const t = window.setTimeout(() => setComingSoonState(null), 3200);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setComingSoonState(null); };
    window.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [comingSoonState]);

  const handlePick = (s: StateButton) => {
    if (s.management_status === "active") {
      navigate(`/staff/state/${s.code.toLowerCase()}`);
    } else {
      setComingSoonState(s);
    }
  };

  const filterFn = (s: StateButton) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return s.name.toLowerCase().includes(q)
      || s.code.toLowerCase().includes(q)
      || (s.capital || "").toLowerCase().includes(q);
  };

  const active = useMemo(() => (data?.active || []).filter(filterFn), [data, search]);
  const inactive = useMemo(() => (data?.inactive || []).filter(filterFn), [data, search]);

  const stateCount = (data?.active.length || 0);
  const utCount = (data?.inactive || []).filter(s => s.type === "union_territory").length
    + (data?.active || []).filter(s => s.type === "union_territory").length;
  const totalRegions = (data?.total || 0);

  const showActive = view !== "inactive";
  const showInactive = view !== "active";

  return (
    <div className="bm-state-picker">
      <PageHeader
        title="Staff Management"
        description="Choose a state or union territory to manage. Active regions are live; the rest are coming soon."
        actions={
          <div className="bm-actions">
            <button
              type="button"
              className="bm-btn bm-btn-secondary"
              onClick={() => navigate("/staff/members")}
              title="View all staff members across India"
            >
              <HiOutlineUsers /> All Staff Members
            </button>
            <button
              type="button"
              className="bm-btn bm-btn-ghost"
              onClick={load}
              disabled={loading}
              title="Refresh"
            >
              <HiOutlineRefresh className={loading ? "spin" : ""} /> Refresh
            </button>
          </div>
        }
      />

      {/* Hero / India coverage summary */}
      <div className="bm-hero">
        <div className="bm-hero-bg" aria-hidden>
          <div className="bm-hero-orb bm-hero-orb-1" />
          <div className="bm-hero-orb bm-hero-orb-2" />
          <div className="bm-hero-orb bm-hero-orb-3" />
        </div>
        <div className="bm-hero-content">
          <div className="bm-hero-eyebrow">
            <HiOutlineSparkles /> India Operations
          </div>
          <h1 className="bm-hero-title">
            Pick a region to manage
          </h1>
          <p className="bm-hero-sub">
            BharatMithra is rolling out state by state — start with a live region or peek
            at what's coming next.
          </p>

          <div className="bm-hero-stats">
            <div className="bm-hero-stat">
              <span className="n">{stateCount}</span>
              <span className="l">Live region{stateCount === 1 ? "" : "s"}</span>
            </div>
            <div className="bm-hero-stat">
              <span className="n">{Math.max(0, totalRegions - stateCount)}</span>
              <span className="l">Coming soon</span>
            </div>
            <div className="bm-hero-stat">
              <span className="n">{totalRegions}</span>
              <span className="l">Total states &amp; UTs</span>
            </div>
            <div className="bm-hero-stat">
              <span className="n">{utCount}</span>
              <span className="l">Union Territories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: search + view filter */}
      <div className="bm-toolbar">
        <div className="bm-search-bar">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search by state, UT, code, or capital…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="bm-search-clear" onClick={() => setSearch("")} aria-label="Clear">
              <HiOutlineX />
            </button>
          )}
        </div>

        <div className="bm-segmented" role="tablist" aria-label="Filter by status">
          {([
            { v: "all" as const, label: "All" },
            { v: "active" as const, label: "Active", tone: "active" as const },
            { v: "inactive" as const, label: "Coming soon", tone: "inactive" as const },
          ]).map((opt) => (
            <button
              key={opt.v}
              type="button"
              role="tab"
              aria-selected={view === opt.v}
              className={`bm-seg ${view === opt.v ? "is-on" : ""} ${opt.tone ? `tone-${opt.tone}` : ""}`}
              onClick={() => setView(opt.v)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bm-banner bm-banner-error">{error}</div>}

      {loading && !data && (
        <div className="bm-grid bm-grid-skeleton">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bm-card bm-card-skel" />
          ))}
        </div>
      )}

      {data && (
        <>
          {showActive && (
            <>
              <SectionHeader
                label="Active"
                count={active.length}
                tone="active"
                note="Live and being managed by BharatMithra. Click to drill in."
              />
              {active.length === 0 ? (
                <EmptyState
                  tone="active"
                  message={search ? "No active states match your search." : "No active states yet."}
                />
              ) : (
                <div className="bm-grid">
                  {active.map((s) => (
                    <StateCard key={s.id} state={s} onPick={handlePick} />
                  ))}
                </div>
              )}
            </>
          )}

          {showInactive && (
            <>
              <SectionHeader
                label="Coming soon"
                count={inactive.length}
                tone="inactive"
                note="We're not live in these regions yet — they'll go live as we expand."
              />
              {inactive.length === 0 ? (
                <EmptyState
                  tone="inactive"
                  message={search ? "No coming-soon states match your search." : "No coming-soon states."}
                />
              ) : (
                <div className="bm-grid">
                  {inactive.map((s) => (
                    <StateCard key={s.id} state={s} onPick={handlePick} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {comingSoonState && (
        <ComingSoonOverlay
          state={comingSoonState}
          onClose={() => setComingSoonState(null)}
        />
      )}
    </div>
  );
};

const SectionHeader = ({
  label,
  count,
  note,
  tone,
}: {
  label: string;
  count: number;
  note: string;
  tone: "active" | "inactive";
}) => (
  <div className={`bm-section-header tone-${tone}`}>
    <div className="bm-section-title">
      <span className={`bm-dot tone-${tone}`} />
      <h2>{label}</h2>
      <span className="bm-count">{count}</span>
    </div>
    <p className="bm-section-note">{note}</p>
  </div>
);

const EmptyState = ({ tone, message }: { tone: "active" | "inactive"; message: string }) => (
  <div className={`bm-empty tone-${tone}`}>
    <HiOutlineLocationMarker />
    <p>{message}</p>
  </div>
);

const StateCard = ({
  state,
  onPick,
}: {
  state: StateButton;
  onPick: (s: StateButton) => void;
}) => {
  const isActive = state.management_status === "active";
  const img = stateImageFor(state.code, state.banner_image_url);
  return (
    <button
      type="button"
      className={`bm-card ${isActive ? "is-active" : "is-inactive"}`}
      onClick={() => onPick(state)}
      title={isActive ? `Manage ${state.name}` : `${state.name} — coming soon`}
    >
      <div className="bm-card-text">
        <div className="bm-card-text-top">
          <span className={`bm-status-pill tone-${isActive ? "active" : "inactive"}`}>
            <span className="bm-pill-dot" />
            {isActive ? "Live" : "Coming soon"}
          </span>
          <span className="bm-meta-chip">
            {state.type === "union_territory" ? "UT" : "State"}
          </span>
        </div>
        <h3 className="bm-card-name">{state.name}</h3>
        <div className="bm-card-code">{state.code}</div>
        {state.capital && (
          <div className="bm-card-capital">
            <HiOutlineLocationMarker /> {state.capital}
          </div>
        )}
        {isActive && (
          <span className="bm-cta">
            Manage <HiOutlineArrowRight />
          </span>
        )}
      </div>
      <div className="bm-card-thumb">
        <img
          src={img}
          alt={state.name}
          loading="lazy"
          onError={(e) => {
            const el = e.currentTarget;
            const fb = fallbackImage(state.code);
            if (el.src !== fb) el.src = fb;
          }}
        />
      </div>
    </button>
  );
};

const ComingSoonOverlay = ({
  state,
  onClose,
}: {
  state: StateButton;
  onClose: () => void;
}) => {
  useBodyScrollLock(true);
  return (
  <div className="bm-coming-soon-overlay" onClick={onClose} role="presentation">
    <div className="bm-coming-soon-card" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="bm-cs-close"
        aria-label="Close"
        onClick={onClose}
      >
        <HiOutlineX />
      </button>

      <div className="bm-cs-pulse" aria-hidden>
        <span /><span /><span />
        <div className="bm-cs-pin">
          <HiOutlineLocationMarker />
        </div>
      </div>

      <div className="bm-cs-eyebrow">Coming soon</div>
      <h2>We're not live in {state.name} yet</h2>
      <p>
        BharatMithra is rolling out state by state. {state.name} is on the
        roadmap — we'll be active here soon. Stay tuned.
      </p>

      {state.tagline && (
        <div className="bm-cs-tagline">"{state.tagline}"</div>
      )}

      <div className="bm-cs-actions">
        <button type="button" className="bm-btn bm-btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  </div>
  );
};

export default StatePicker;
