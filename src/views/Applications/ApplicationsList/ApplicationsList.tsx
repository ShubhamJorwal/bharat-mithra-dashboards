import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineLightningBolt,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineFilter,
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import applicationsApi from "@/services/api/applications.api";
import type {
  Application,
  ApplicationListResponse,
  ApplicationMetaResponse,
  ApplicationStatsResponse,
  ApplicationStatus,
  ApplicationPriority,
} from "@/types/api.types";
import "./ApplicationsList.scss";

const PER_PAGE = 25;

const STATUS_TONES: Record<ApplicationStatus, string> = {
  draft: "neutral",
  submitted: "info",
  in_progress: "indigo",
  awaiting_citizen: "amber",
  awaiting_external: "amber",
  agent_completed: "green",
  completed: "green",
  rejected: "red",
  cancelled: "neutral",
};

const PRIORITY_TONES: Record<ApplicationPriority, string> = {
  low: "neutral",
  normal: "info",
  high: "amber",
  urgent: "red",
};

type StatusFilter = "all" | "active" | "completed" | "rejected" | ApplicationStatus;

const ApplicationsList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<ApplicationListResponse | null>(null);
  const [meta, setMeta] = useState<ApplicationMetaResponse | null>(null);
  const [stats, setStats] = useState<ApplicationStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [priorityFilter, setPriorityFilter] = useState<ApplicationPriority | "">("");
  const [page, setPage] = useState(1);

  const filters = useMemo(() => {
    const f: any = { page, per_page: PER_PAGE };
    if (search.trim()) f.search = search.trim();
    if (priorityFilter) f.priority = priorityFilter;
    if (statusFilter === "active") {
      // default — backend hides terminal statuses
    } else if (statusFilter === "completed") {
      f.status = "completed";
      f.include_terminal = "true";
    } else if (statusFilter === "rejected") {
      f.status = "rejected";
      f.include_terminal = "true";
    } else if (statusFilter !== "all") {
      f.status = statusFilter;
      f.include_terminal = "true";
    } else {
      f.include_terminal = "true";
    }
    return f;
  }, [search, statusFilter, priorityFilter, page]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, metaRes, statsRes] = await Promise.all([
        applicationsApi.list(filters),
        meta ? Promise.resolve({ data: meta } as any) : applicationsApi.meta(),
        applicationsApi.stats(),
      ]);
      setData(listRes.data || null);
      if (!meta && (metaRes as any).data) setMeta((metaRes as any).data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter, priorityFilter]);

  // Debounced search
  useEffect(() => {
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = data?.meta?.total_pages || 1;

  return (
    <div className="bm-apps">
      <PageHeader
        title="Applications"
        description="All citizen applications across India. Filter by status, priority, or search by code, name, or mobile."
        actions={
          <div className="bm-apps-actions">
            <button
              type="button"
              className="bm-apps-btn bm-apps-btn-ghost"
              onClick={load}
              disabled={loading}
            >
              <HiOutlineRefresh className={loading ? "spin" : ""} /> Refresh
            </button>
            <button
              type="button"
              className="bm-apps-btn bm-apps-btn-primary"
              onClick={() => navigate("/applications/new")}
            >
              <HiOutlinePlus /> New application
            </button>
          </div>
        }
      />

      {error && <div className="bm-apps-error"><HiOutlineExclamation /> {error}</div>}

      {/* Stat tiles */}
      <div className="bm-apps-stats">
        <StatTile
          icon={<HiOutlineDocumentText />}
          label="Total"
          value={stats?.total ?? 0}
          tone="indigo"
          onClick={() => setStatusFilter("all")}
          active={statusFilter === "all"}
        />
        <StatTile
          icon={<HiOutlineLightningBolt />}
          label="Awaiting pickup"
          value={stats?.awaiting_pickup ?? 0}
          tone="amber"
          onClick={() => setStatusFilter("submitted")}
          active={statusFilter === "submitted"}
        />
        <StatTile
          icon={<HiOutlineClock />}
          label="In progress"
          value={stats?.by_status?.in_progress ?? 0}
          tone="indigo"
          onClick={() => setStatusFilter("in_progress")}
          active={statusFilter === "in_progress"}
        />
        <StatTile
          icon={<HiOutlineCheckCircle />}
          label="Completed"
          value={(stats?.by_status?.completed ?? 0) + (stats?.by_status?.agent_completed ?? 0)}
          tone="green"
          onClick={() => setStatusFilter("completed")}
          active={statusFilter === "completed"}
        />
      </div>

      {/* Toolbar */}
      <div className="bm-apps-toolbar">
        <div className="bm-apps-search">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search by code, citizen name, mobile, or service…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear">
              <HiOutlineX />
            </button>
          )}
        </div>

        <div className="bm-apps-toolbar-right">
          <div className="bm-apps-segmented">
            {([
              { v: "active", label: "Active" },
              { v: "all", label: "All" },
              { v: "completed", label: "Completed" },
              { v: "rejected", label: "Rejected" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                type="button"
                className={`bm-apps-seg ${statusFilter === opt.v ? "is-on" : ""}`}
                onClick={() => { setStatusFilter(opt.v); setPage(1); }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            className="bm-apps-select"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as any); setPage(1); }}
          >
            <option value="">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bm-apps-list">
        {loading && !data && (
          <div className="bm-apps-empty"><p>Loading applications…</p></div>
        )}
        {data && data.data.length === 0 && (
          <div className="bm-apps-empty">
            <HiOutlineFilter />
            <p>No applications match your filters.</p>
            <small>Try a different status or clear the search.</small>
          </div>
        )}
        {data && data.data.map((a) => (
          <ApplicationCard key={a.id} app={a} statusLabels={meta?.status_labels} />
        ))}
      </div>

      {/* Pager */}
      {data && data.meta.total_pages > 1 && (
        <div className="bm-apps-pager">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

const StatTile = ({
  icon,
  label,
  value,
  tone,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "indigo" | "amber" | "green" | "red";
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    className={`bm-apps-stat tone-${tone} ${active ? "is-active" : ""}`}
    onClick={onClick}
  >
    <div className="bm-apps-stat-icon">{icon}</div>
    <div>
      <div className="bm-apps-stat-value">{value.toLocaleString()}</div>
      <div className="bm-apps-stat-label">{label}</div>
    </div>
  </button>
);

const ApplicationCard = ({
  app,
  statusLabels,
}: {
  app: Application;
  statusLabels?: Record<ApplicationStatus, string>;
}) => {
  const statusLabel = statusLabels?.[app.status] || app.status;
  return (
    <Link to={`/applications/${app.id}`} className="bm-apps-card">
      <div className="bm-apps-card-left">
        <div className={`bm-apps-status tone-${STATUS_TONES[app.status]}`}>
          <span className="bm-apps-status-dot" />
          {statusLabel}
        </div>
        {app.priority !== "normal" && (
          <span className={`bm-apps-priority tone-${PRIORITY_TONES[app.priority]}`}>
            {app.priority}
          </span>
        )}
      </div>

      <div className="bm-apps-card-main">
        <div className="bm-apps-card-row1">
          <span className="bm-apps-code">{app.application_code}</span>
          <span className="bm-apps-service">{app.service?.name || "Unknown service"}</span>
          {app.is_agent_only && <span className="bm-apps-tag">Agent only</span>}
        </div>
        <div className="bm-apps-card-row2">
          <span className="bm-apps-citizen">
            <HiOutlineUser /> {app.citizen_name}
          </span>
          <span className="bm-apps-mobile">
            <HiOutlinePhone /> {app.citizen_mobile}
          </span>
          {app.gp && (
            <span className="bm-apps-gp">
              <HiOutlineLocationMarker />
              {app.gp.name}
              {app.gp.taluk_name && <> · {app.gp.taluk_name}</>}
            </span>
          )}
        </div>
      </div>

      <div className="bm-apps-card-right">
        {app.assigned_caseworker ? (
          <div className="bm-apps-assignee">
            <div className="bm-apps-assignee-avatar">
              {initials(app.assigned_caseworker.full_name)}
            </div>
            <div className="bm-apps-assignee-text">
              <small>Caseworker</small>
              <div>{app.assigned_caseworker.full_name}</div>
            </div>
          </div>
        ) : app.is_agent_only ? (
          <div className="bm-apps-assignee bm-apps-assignee-agent">
            <div className="bm-apps-assignee-avatar">
              <HiOutlineUserGroup />
            </div>
            <div className="bm-apps-assignee-text">
              <small>Handled by</small>
              <div>{app.submitted_by_agent?.full_name || "Agent"}</div>
            </div>
          </div>
        ) : (
          <div className="bm-apps-assignee bm-apps-assignee-none">
            <small>Caseworker</small>
            <div>Unassigned</div>
          </div>
        )}
        <div className="bm-apps-time">
          {app.submitted_at ? formatRelative(app.submitted_at) : "Not submitted"}
        </div>
      </div>
    </Link>
  );
};

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

const formatRelative = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
};

export default ApplicationsList;
