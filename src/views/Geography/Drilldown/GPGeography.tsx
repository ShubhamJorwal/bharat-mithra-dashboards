import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineMap,
  HiOutlineLocationMarker,
  HiOutlineExclamationCircle,
  HiOutlineSearch,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlinePhone,
} from "react-icons/hi";
import geographyApi from "@/services/api/geography.api";
import type { GramPanchayat, Village } from "@/types/api.types";
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

const GPGeography = () => {
  const {
    code = "",
    districtId = "",
    talukId = "",
    gpId = "",
  } = useParams<{ code: string; districtId: string; talukId: string; gpId: string }>();
  const navigate = useNavigate();
  const [gp, setGp] = useState<GramPanchayat | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const gRes = await geographyApi.getGramPanchayatById(gpId);
        if (cancelled) return;
        setGp(gRes.data);
        const vRes = await geographyApi.getGramPanchayatVillages(gpId, {
          per_page: 200,
          sort_by: "name",
          sort_order: 1,
        });
        if (!cancelled) setVillages(vRes.data || []);
      } catch (err) {
        const e = err as { response?: { status?: number }; message?: string };
        if (!cancelled) {
          setError(
            e.response?.status === 404
              ? "Gram Panchayat not found"
              : e.message || "Failed to load GP"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [gpId]);

  const filteredVillages = useMemo(() => {
    if (!search.trim()) return villages;
    const q = search.trim().toLowerCase();
    return villages.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.code || "").toLowerCase().includes(q) ||
        (v.pin_code || "").toLowerCase().includes(q)
    );
  }, [villages, search]);

  const stateName = gp?.state_name || gp?.state?.name || "";
  const stateCode = (gp?.state_code || gp?.state?.code || code).toUpperCase();
  const districtName = gp?.district_name || gp?.district?.name || "District";
  const talukName = gp?.taluk_name || gp?.taluk?.name || "Taluk";
  const heroImage = stateImageFor(stateCode);

  return (
    <div className="geo-dd geo-dd--gp">
      <nav className="geo-dd__crumbs" aria-label="Breadcrumb">
        <Link to="/geography" className="geo-dd__crumb"><HiOutlineMap /> Bharat</Link>
        <span className="geo-dd__crumb-sep">›</span>
        <Link to="/geography/states" className="geo-dd__crumb">States &amp; UTs</Link>
        <span className="geo-dd__crumb-sep">›</span>
        <Link to={`/geography/states/code/${code.toLowerCase()}`} className="geo-dd__crumb">
          {stateName || stateCode}
        </Link>
        <span className="geo-dd__crumb-sep">›</span>
        <Link
          to={`/geography/states/code/${code.toLowerCase()}/districts/${districtId}`}
          className="geo-dd__crumb"
        >
          {districtName}
        </Link>
        <span className="geo-dd__crumb-sep">›</span>
        <Link
          to={`/geography/states/code/${code.toLowerCase()}/districts/${districtId}/taluks/${talukId}`}
          className="geo-dd__crumb"
        >
          {talukName}
        </Link>
        <span className="geo-dd__crumb-sep">›</span>
        <span className="geo-dd__crumb geo-dd__crumb--current">{gp?.name || "GP"}</span>
      </nav>

      {error && (
        <div className="geo-dd__alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {gp && (
        <header className="geo-dd__hero">
          <div className="geo-dd__hero-text">
            <span className="geo-dd__hero-eyebrow">
              <HiOutlineSparkles /> Gram Panchayat in {talukName}
            </span>
            <h1 className="geo-dd__hero-title">
              {gp.name}
              <span className="geo-dd__hero-code">{gp.code}</span>
            </h1>
            <div className="geo-dd__hero-sub">
              <span><HiOutlineLocationMarker /> {talukName}, {districtName}</span>
              {gp.pin_code && <span>· PIN {gp.pin_code}</span>}
              {gp.sarpanch_name && (
                <span><HiOutlineUsers /> Sarpanch: <strong>{gp.sarpanch_name}</strong></span>
              )}
              {gp.sarpanch_mobile && (
                <span><HiOutlinePhone /> {gp.sarpanch_mobile}</span>
              )}
            </div>

            <div className="geo-dd__hero-stats">
              <div className="geo-dd__stat">
                <strong>{formatINR(gp.total_villages)}</strong>
                <span>Villages</span>
              </div>
              {gp.population != null && (
                <div className="geo-dd__stat">
                  <strong>{formatCompact(gp.population)}</strong>
                  <span>Population</span>
                </div>
              )}
              {gp.households != null && (
                <div className="geo-dd__stat">
                  <strong>{formatINR(gp.households)}</strong>
                  <span>Households</span>
                </div>
              )}
            </div>
          </div>

          <div className="geo-dd__hero-image">
            <img
              src={heroImage}
              alt={gp.name}
              loading="lazy"
              onError={(e) => {
                const el = e.currentTarget;
                const fb = fallbackImage(stateCode);
                if (el.src !== fb) el.src = fb;
              }}
            />
          </div>
        </header>
      )}

      <section className="geo-dd__section">
        <header className="geo-dd__section-head">
          <h2 className="geo-dd__section-title">
            Villages <small>{filteredVillages.length}</small>
          </h2>
          <div className="geo-dd__toolbar">
            <div className="geo-dd__search">
              <HiOutlineSearch />
              <input
                type="search"
                placeholder="Search villages…"
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
        ) : filteredVillages.length === 0 ? (
          <div className="geo-dd__empty">
            <HiOutlineMap />
            <h4>No villages found</h4>
            <p>{search ? "Try a different search term." : "This GP has no villages in the system yet."}</p>
          </div>
        ) : (
          <div className="geo-dd__grid">
            {filteredVillages.map((v) => (
              <button
                key={v.id}
                type="button"
                className="geo-dd__tcard"
                style={{ "--child-color": "#6366f1" } as React.CSSProperties}
                onClick={() =>
                  navigate(
                    `/geography/states/code/${code.toLowerCase()}/districts/${districtId}/taluks/${talukId}/gps/${gpId}/villages/${v.id}`
                  )
                }
              >
                <span className="geo-dd__tcard-mark">
                  <span className="geo-dd__tcard-mark-letter">{v.name?.charAt(0)}</span>
                  <img
                    src={heroImage}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      const fb = fallbackImage(stateCode);
                      if (el.src !== fb) el.src = fb;
                    }}
                  />
                </span>
                <div className="geo-dd__tcard-body">
                  <span className="geo-dd__tcard-pin">Village · {v.code}</span>
                  <h3 className="geo-dd__tcard-name">{v.name}</h3>
                  {v.pin_code && (
                    <div className="geo-dd__tcard-meta">
                      <span>PIN {v.pin_code}</span>
                    </div>
                  )}
                  {((v.population != null && v.population > 0) || (v.households != null && v.households > 0)) ? (
                    <div className="geo-dd__tcard-stats">
                      {v.population != null && v.population > 0 ? (
                        <span><strong>{formatCompact(v.population)}</strong>people</span>
                      ) : null}
                      {v.households != null && v.households > 0 ? (
                        <span><strong>{formatINR(v.households)}</strong>households</span>
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

export default GPGeography;
