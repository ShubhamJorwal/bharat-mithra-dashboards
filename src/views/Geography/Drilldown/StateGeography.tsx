import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineMap,
  HiOutlineLocationMarker,
  HiOutlineExclamationCircle,
  HiOutlineSearch,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi";
import geographyApi from "@/services/api/geography.api";
import type { State, District } from "@/types/api.types";
import { stateImageFor, fallbackImage } from "@/views/Staff/StatePicker/stateImages";
import "./_drilldown.scss";

const formatINR = (n?: number) => (n ? n.toLocaleString("en-IN") : "—");
const formatCompact = (n?: number) => {
  if (!n) return "—";
  if (n >= 1e7) return (n / 1e7).toFixed(1) + " Cr";
  if (n >= 1e5) return (n / 1e5).toFixed(1) + " L";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};

const StateGeography = () => {
  const { code = "" } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<State | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const stateRes = await geographyApi.getStateByCode(code.toUpperCase());
        if (cancelled) return;
        const s = stateRes.data;
        setState(s);
        const dRes = await geographyApi.getStateDistricts(s.id, {
          per_page: 200,
          sort_by: "name",
          sort_order: 1,
        });
        if (!cancelled) setDistricts(dRes.data || []);
      } catch (err) {
        const e = err as { response?: { status?: number }; message?: string };
        if (!cancelled) {
          setError(
            e.response?.status === 404
              ? `State "${code.toUpperCase()}" not found`
              : e.message || "Failed to load state"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  const filteredDistricts = useMemo(() => {
    if (!search.trim()) return districts;
    const q = search.trim().toLowerCase();
    return districts.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.headquarters || "").toLowerCase().includes(q) ||
        (d.code || "").toLowerCase().includes(q)
    );
  }, [districts, search]);

  return (
    <div className="geo-dd geo-dd--state">
      {/* Breadcrumb */}
      <nav className="geo-dd__crumbs" aria-label="Breadcrumb">
        <Link to="/geography" className="geo-dd__crumb">
          <HiOutlineMap /> Bharat
        </Link>
        <span className="geo-dd__crumb-sep">›</span>
        <Link to="/geography/states" className="geo-dd__crumb">States &amp; UTs</Link>
        <span className="geo-dd__crumb-sep">›</span>
        <span className="geo-dd__crumb geo-dd__crumb--current">
          {state?.name || code.toUpperCase()}
        </span>
      </nav>

      {error && (
        <div className="geo-dd__alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Hero */}
      {state && (
        <header className="geo-dd__hero">
          <div className="geo-dd__hero-text">
            <span className="geo-dd__hero-eyebrow">
              <HiOutlineSparkles /> State / Union Territory
            </span>
            <h1 className="geo-dd__hero-title">
              {state.name}
              <span className="geo-dd__hero-code">{state.code}</span>
            </h1>
            <div className="geo-dd__hero-sub">
              {state.capital && (
                <span><HiOutlineLocationMarker /> Capital: <strong>{state.capital}</strong></span>
              )}
              {state.region && <span>· {state.region}</span>}
              {state.lgd_code && <span>· LGD {state.lgd_code}</span>}
            </div>

            <div className="geo-dd__hero-stats">
              <div className="geo-dd__stat">
                <strong>{formatINR(state.total_districts)}</strong>
                <span>Districts</span>
              </div>
              {state.population != null && (
                <div className="geo-dd__stat">
                  <strong>{formatCompact(state.population)}</strong>
                  <span>Population</span>
                </div>
              )}
              {state.area_sq_km != null && (
                <div className="geo-dd__stat">
                  <strong>{formatCompact(state.area_sq_km)}</strong>
                  <span>km²</span>
                </div>
              )}
            </div>
          </div>

          <div className="geo-dd__hero-image">
            <img
              src={stateImageFor(state.code)}
              alt={state.name}
              loading="lazy"
              onError={(e) => {
                const el = e.currentTarget;
                const fb = fallbackImage(state.code);
                if (el.src !== fb) el.src = fb;
              }}
            />
          </div>
        </header>
      )}

      {/* Districts grid */}
      <section className="geo-dd__section">
        <header className="geo-dd__section-head">
          <h2 className="geo-dd__section-title">
            Districts <small>{filteredDistricts.length}</small>
          </h2>
          <div className="geo-dd__toolbar">
            <div className="geo-dd__search">
              <HiOutlineSearch />
              <input
                type="search"
                placeholder="Search districts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="geo-dd__grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="geo-dd__skel">
                <div className="geo-dd__skel-mark" />
                <div className="geo-dd__skel-body">
                  <div className="geo-dd__skel-line" />
                  <div className="geo-dd__skel-line geo-dd__skel-line--short" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDistricts.length === 0 ? (
          <div className="geo-dd__empty">
            <HiOutlineMap />
            <h4>No districts found</h4>
            <p>{search ? "Try a different search term." : "This state has no districts in the system yet."}</p>
          </div>
        ) : (
          <div className="geo-dd__grid">
            {filteredDistricts.map((d) => (
              <button
                key={d.id}
                type="button"
                className="geo-dd__tcard"
                style={{ "--child-color": "#10b981" } as React.CSSProperties}
                onClick={() =>
                  navigate(`/geography/states/code/${code.toLowerCase()}/districts/${d.id}`)
                }
              >
                <span className="geo-dd__tcard-mark">
                  <span className="geo-dd__tcard-mark-letter">{d.name?.charAt(0)}</span>
                  <img
                    src={stateImageFor(state?.code || code)}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      const fb = fallbackImage(state?.code || code);
                      if (el.src !== fb) el.src = fb;
                    }}
                  />
                </span>
                <div className="geo-dd__tcard-body">
                  <span className="geo-dd__tcard-pin">District · {d.code}</span>
                  <h3 className="geo-dd__tcard-name">{d.name}</h3>
                  <div className="geo-dd__tcard-meta">
                    <span><HiOutlineLocationMarker /> {d.headquarters || "—"}</span>
                  </div>
                  {(d.total_taluks || d.total_villages) ? (
                    <div className="geo-dd__tcard-stats">
                      {d.total_taluks ? (
                        <span><strong>{formatINR(d.total_taluks)}</strong>taluks</span>
                      ) : null}
                      {d.total_villages ? (
                        <span><strong>{formatCompact(d.total_villages)}</strong>villages</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <span className="geo-dd__tcard-arrow"><HiOutlineArrowRight /></span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StateGeography;

