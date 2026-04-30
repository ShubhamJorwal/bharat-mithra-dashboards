import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineCollection, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineCurrencyRupee, HiOutlineSparkles, HiOutlineLightningBolt
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import servicesApi from "@/services/api/services.api";
import type { Service, ServiceCategory, CatalogStats, ServicesQueryParams } from "@/types/api.types";
import "./ServiceList.scss";

const PER_PAGE = 24;

const ServiceList = () => {
  const [items, setItems] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [popular, setPopular] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [free, setFree] = useState(false);
  const [sortBy, setSortBy] = useState<ServicesQueryParams["sort_by"]>("popular");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PER_PAGE)), [total]);

  // Fetch categories + stats once
  useEffect(() => {
    void (async () => {
      try {
        const [catsR, statsR] = await Promise.all([servicesApi.listCategories(true), servicesApi.stats()]);
        setCategories(catsR.data || []);
        setStats(statsR.data);
      } catch {
        // non-blocking
      }
    })();
  }, []);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Fetch services on filter change
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debounced, category, popular, featured, free, sortBy]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await servicesApi.list({
        page,
        per_page: PER_PAGE,
        search: debounced || undefined,
        category: category || undefined,
        popular: popular ? "true" : undefined,
        featured: featured ? "true" : undefined,
        free: free ? "true" : undefined,
        sort_by: sortBy,
      });
      setItems(r.data || []);
      setTotal(r.meta?.total || 0);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch(""); setDebounced(""); setCategory("");
    setPopular(false); setFeatured(false); setFree(false);
    setSortBy("popular"); setPage(1);
  };

  return (
    <div className="bm-services">
      <PageHeader
        icon={<HiOutlineCollection />}
        title="Services"
        description={
          stats
            ? `${stats.total_services} services across ${stats.total_categories} categories — fully customizable per state, applicant category, and channel.`
            : "Loading catalog…"
        }
        actions={
          <Link to="/services/new" className="bm-btn bm-btn-primary">
            <HiOutlinePlus /> Add service
          </Link>
        }
      />

      {/* Stat strip */}
      {stats && (
        <div className="bm-stat-strip">
          <div className="bm-stat"><div className="n">{stats.total_services}</div><div className="l">Total services</div></div>
          <div className="bm-stat"><div className="n">{stats.active_services}</div><div className="l">Active</div></div>
          <div className="bm-stat"><div className="n">{stats.total_categories}</div><div className="l">Categories</div></div>
          <div className="bm-stat"><div className="n">{items.filter(i => i.is_popular).length}</div><div className="l">Popular shown</div></div>
        </div>
      )}

      {/* Big search */}
      <div className="bm-search-hero">
        <HiOutlineSearch className="bm-search-icon" />
        <input
          type="search"
          placeholder="Search 193 services — try 'Aadhaar', 'GST', 'PMKisan', 'driving licence'…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          autoFocus
        />
        {search && (
          <button className="bm-search-clear" onClick={() => { setSearch(""); setDebounced(""); }} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bm-filters">
        <div className="bm-filter-group">
          <button
            className={`bm-pill ${category === "" ? "active" : ""}`}
            onClick={() => { setCategory(""); setPage(1); }}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.code}
              className={`bm-pill ${category === c.code ? "active" : ""}`}
              onClick={() => { setCategory(c.code); setPage(1); }}
              style={{ "--pill-color": c.color } as React.CSSProperties}
            >
              {c.name}
              {c.service_count !== undefined && <span className="bm-pill-count">{c.service_count}</span>}
            </button>
          ))}
        </div>

        <div className="bm-filter-toggles">
          <label className={`bm-toggle ${popular ? "on" : ""}`}>
            <input type="checkbox" checked={popular} onChange={(e) => { setPopular(e.target.checked); setPage(1); }} />
            <HiOutlineSparkles /> Popular
          </label>
          <label className={`bm-toggle ${featured ? "on" : ""}`}>
            <input type="checkbox" checked={featured} onChange={(e) => { setFeatured(e.target.checked); setPage(1); }} />
            <HiOutlineLightningBolt /> Featured
          </label>
          <label className={`bm-toggle ${free ? "on" : ""}`}>
            <input type="checkbox" checked={free} onChange={(e) => { setFree(e.target.checked); setPage(1); }} />
            Free
          </label>

          <select
            className="bm-sort"
            value={sortBy || "popular"}
            onChange={(e) => { setSortBy(e.target.value as ServicesQueryParams["sort_by"]); setPage(1); }}
          >
            <option value="popular">Most popular</option>
            <option value="name">Name A→Z</option>
            <option value="recent">Recently added</option>
            <option value="applications">Most applied</option>
          </select>

          <button className="bm-btn bm-btn-ghost" onClick={resetFilters} title="Reset filters">
            <HiOutlineRefresh />
          </button>
        </div>
      </div>

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="bm-empty">Loading services…</div>
      ) : items.length === 0 ? (
        <div className="bm-empty">
          No services match your filters. <button className="bm-link" onClick={resetFilters}>Reset</button>
        </div>
      ) : (
        <div className="bm-service-grid">
          {items.map((s) => (
            <ServiceCard key={s.id} svc={s} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="bm-pagination">
        <span className="bm-text-muted">Page {page} of {totalPages} · {total} services</span>
        <div className="bm-pagination-actions">
          <button className="bm-btn bm-btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
          <button className="bm-btn bm-btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ svc }: { svc: Service }) => {
  const total = svc.base_government_fee + svc.base_platform_fee;
  return (
    <Link to={`/services/${svc.slug || svc.code}`} className="bm-svc-card" style={{ "--cat-color": svc.category?.color } as React.CSSProperties}>
      <div className="bm-svc-header">
        <span className="bm-svc-cat">{svc.category?.name || ""}</span>
        <div className="bm-svc-badges">
          {svc.is_featured && <span className="bm-badge bm-badge-featured"><HiOutlineLightningBolt /> Featured</span>}
          {svc.is_popular && <span className="bm-badge bm-badge-popular"><HiOutlineSparkles /> Popular</span>}
          {svc.is_new && <span className="bm-badge bm-badge-new">New</span>}
        </div>
      </div>
      <h3 className="bm-svc-name">{svc.name}</h3>
      {svc.short_description && <p className="bm-svc-desc">{svc.short_description}</p>}
      <div className="bm-svc-meta">
        {svc.department && <span className="bm-svc-meta-item">{svc.department}</span>}
        {svc.base_processing_time && <span className="bm-svc-meta-item">⏱ {svc.base_processing_time}</span>}
      </div>
      <div className="bm-svc-foot">
        {svc.is_free ? (
          <span className="bm-svc-fee bm-svc-fee-free">FREE</span>
        ) : (
          <span className="bm-svc-fee"><HiOutlineCurrencyRupee />{total.toFixed(0)}</span>
        )}
        <span className="bm-svc-cta">View →</span>
      </div>
    </Link>
  );
};

export default ServiceList;
