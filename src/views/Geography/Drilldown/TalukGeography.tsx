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
} from "react-icons/hi";
import geographyApi from "@/services/api/geography.api";
import type { Taluk, GramPanchayat } from "@/types/api.types";
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

const TalukGeography = () => {
  const { code = "", districtId = "", talukId = "" } = useParams<{
    code: string; districtId: string; talukId: string;
  }>();
  const navigate = useNavigate();
  const [taluk, setTaluk] = useState<Taluk | null>(null);
  const [gps, setGps] = useState<GramPanchayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const tRes = await geographyApi.getTalukById(talukId);
        if (cancelled) return;
        setTaluk(tRes.data);
        const gRes = await geographyApi.getTalukGramPanchayats(talukId, {
          per_page: 200,
          sort_by: "name",
          sort_order: 1,
        });
        if (!cancelled) setGps(gRes.data || []);
      } catch (err) {
        const e = err as { response?: { status?: number }; message?: string };
        if (!cancelled) {
          setError(
            e.response?.status === 404
              ? "Taluk not found"
              : e.message || "Failed to load taluk"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [talukId]);

  const filteredGps = useMemo(() => {
    if (!search.trim()) return gps;
    const q = search.trim().toLowerCase();
    return gps.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.code || "").toLowerCase().includes(q) ||
        (g.sarpanch_name || "").toLowerCase().includes(q)
    );
  }, [gps, search]);

  const stateName = taluk?.state_name || taluk?.state?.name || "";
  const stateCode = (taluk?.state_code || taluk?.state?.code || code).toUpperCase();
  const districtName = taluk?.district_name || taluk?.district?.name || "District";
  const heroImage = stateImageFor(stateCode);

  return (
    <div className="geo-dd geo-dd--taluk">
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
        <span className="geo-dd__crumb geo-dd__crumb--current">
          {taluk?.name || "Taluk"}
        </span>
      </nav>

      {error && (
        <div className="geo-dd__alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {taluk && (
        <header className="geo-dd__hero">
          <div className="geo-dd__hero-text">
            <span className="geo-dd__hero-eyebrow">
              <HiOutlineSparkles /> Taluk in {districtName}
            </span>
            <h1 className="geo-dd__hero-title">
              {taluk.name}
              <span className="geo-dd__hero-code">{taluk.code}</span>
            </h1>
            <div className="geo-dd__hero-sub">
              <span><HiOutlineLocationMarker /> {districtName}, {stateName || stateCode}</span>
              {taluk.pin_code && <span>· PIN {taluk.pin_code}</span>}
            </div>

            <div className="geo-dd__hero-stats">
              <div className="geo-dd__stat">
                <strong>{formatINR(taluk.total_gram_panchayats)}</strong>
                <span>Gram Panchayats</span>
              </div>
              <div className="geo-dd__stat">
                <strong>{formatCompact(taluk.total_villages)}</strong>
                <span>Villages</span>
              </div>
              {taluk.population != null && (
                <div className="geo-dd__stat">
                  <strong>{formatCompact(taluk.population)}</strong>
                  <span>Population</span>
                </div>
              )}
            </div>
          </div>

          <div className="geo-dd__hero-image">
            <img
              src={heroImage}
              alt={taluk.name}
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
            Gram Panchayats <small>{filteredGps.length}</small>
          </h2>
          <div className="geo-dd__toolbar">
            <div className="geo-dd__search">
              <HiOutlineSearch />
              <input
                type="search"
                placeholder="Search GPs or sarpanch name…"
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
        ) : filteredGps.length === 0 ? (
          <div className="geo-dd__empty">
            <HiOutlineMap />
            <h4>No Gram Panchayats found</h4>
            <p>{search ? "Try a different search term." : "This taluk has no GPs in the system yet."}</p>
          </div>
        ) : (
          <div className="geo-dd__grid">
            {filteredGps.map((g) => (
              <button
                key={g.id}
                type="button"
                className="geo-dd__tcard"
                style={{ "--child-color": "#f59e0b" } as React.CSSProperties}
                onClick={() =>
                  navigate(
                    `/geography/states/code/${code.toLowerCase()}/districts/${districtId}/taluks/${talukId}/gps/${g.id}`
                  )
                }
              >
                <span className="geo-dd__tcard-mark">
                  <span className="geo-dd__tcard-mark-letter">{g.name?.charAt(0)}</span>
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
                  <span className="geo-dd__tcard-pin">Gram Panchayat · {g.code}</span>
                  <h3 className="geo-dd__tcard-name">{g.name}</h3>
                  {g.sarpanch_name && (
                    <div className="geo-dd__tcard-meta">
                      <span><HiOutlineUsers /> Sarpanch: {g.sarpanch_name}</span>
                    </div>
                  )}
                  {(g.total_villages || (g.population != null && g.population > 0)) ? (
                    <div className="geo-dd__tcard-stats">
                      {g.total_villages ? (
                        <span><strong>{formatINR(g.total_villages)}</strong>villages</span>
                      ) : null}
                      {g.population != null && g.population > 0 ? (
                        <span><strong>{formatCompact(g.population)}</strong>people</span>
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

export default TalukGeography;
