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
import type { District, Taluk } from "@/types/api.types";
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

const DistrictGeography = () => {
  const { code = "", districtId = "" } = useParams<{ code: string; districtId: string }>();
  const navigate = useNavigate();
  const [district, setDistrict] = useState<District | null>(null);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const dRes = await geographyApi.getDistrictById(districtId);
        if (cancelled) return;
        setDistrict(dRes.data);
        const tRes = await geographyApi.getDistrictTaluks(districtId, {
          per_page: 200,
          sort_by: "name",
          sort_order: 1,
        });
        if (!cancelled) setTaluks(tRes.data || []);
      } catch (err) {
        const e = err as { response?: { status?: number }; message?: string };
        if (!cancelled) {
          setError(
            e.response?.status === 404
              ? "District not found"
              : e.message || "Failed to load district"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [districtId]);

  const filteredTaluks = useMemo(() => {
    if (!search.trim()) return taluks;
    const q = search.trim().toLowerCase();
    return taluks.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.code || "").toLowerCase().includes(q)
    );
  }, [taluks, search]);

  const stateName = district?.state_name || district?.state?.name || "";
  const stateCode = (district?.state_code || district?.state?.code || code).toUpperCase();
  const heroImage = stateImageFor(stateCode);

  return (
    <div className="geo-dd geo-dd--district">
      <nav className="geo-dd__crumbs" aria-label="Breadcrumb">
        <Link to="/geography" className="geo-dd__crumb"><HiOutlineMap /> Bharat</Link>
        <span className="geo-dd__crumb-sep">›</span>
        <Link to="/geography/states" className="geo-dd__crumb">States &amp; UTs</Link>
        <span className="geo-dd__crumb-sep">›</span>
        <Link to={`/geography/states/code/${code.toLowerCase()}`} className="geo-dd__crumb">
          {stateName || stateCode}
        </Link>
        <span className="geo-dd__crumb-sep">›</span>
        <span className="geo-dd__crumb geo-dd__crumb--current">
          {district?.name || "District"}
        </span>
      </nav>

      {error && (
        <div className="geo-dd__alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {district && (
        <header className="geo-dd__hero">
          <div className="geo-dd__hero-text">
            <span className="geo-dd__hero-eyebrow">
              <HiOutlineSparkles /> District in {stateName || stateCode}
            </span>
            <h1 className="geo-dd__hero-title">
              {district.name}
              <span className="geo-dd__hero-code">{district.code}</span>
            </h1>
            <div className="geo-dd__hero-sub">
              {district.headquarters && (
                <span><HiOutlineLocationMarker /> HQ: <strong>{district.headquarters}</strong></span>
              )}
              {district.lgd_code && <span>· LGD {district.lgd_code}</span>}
            </div>

            <div className="geo-dd__hero-stats">
              <div className="geo-dd__stat">
                <strong>{formatINR(district.total_taluks)}</strong>
                <span>Taluks</span>
              </div>
              <div className="geo-dd__stat">
                <strong>{formatCompact(district.total_gram_panchayats)}</strong>
                <span>Gram Panchayats</span>
              </div>
              <div className="geo-dd__stat">
                <strong>{formatCompact(district.total_villages)}</strong>
                <span>Villages</span>
              </div>
              {district.population != null && (
                <div className="geo-dd__stat">
                  <strong>{formatCompact(district.population)}</strong>
                  <span>Population</span>
                </div>
              )}
            </div>
          </div>

          <div className="geo-dd__hero-image">
            <img
              src={heroImage}
              alt={district.name}
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
            Taluks <small>{filteredTaluks.length}</small>
          </h2>
          <div className="geo-dd__toolbar">
            <div className="geo-dd__search">
              <HiOutlineSearch />
              <input
                type="search"
                placeholder="Search taluks…"
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
        ) : filteredTaluks.length === 0 ? (
          <div className="geo-dd__empty">
            <HiOutlineMap />
            <h4>No taluks found</h4>
            <p>{search ? "Try a different search term." : "This district has no taluks in the system yet."}</p>
          </div>
        ) : (
          <div className="geo-dd__grid">
            {filteredTaluks.map((t) => (
              <button
                key={t.id}
                type="button"
                className="geo-dd__tcard"
                style={{ "--child-color": "#ec4899" } as React.CSSProperties}
                onClick={() =>
                  navigate(`/geography/states/code/${code.toLowerCase()}/districts/${districtId}/taluks/${t.id}`)
                }
              >
                <span className="geo-dd__tcard-mark">
                  <span className="geo-dd__tcard-mark-letter">{t.name?.charAt(0)}</span>
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
                  <span className="geo-dd__tcard-pin">Taluk · {t.code}</span>
                  <h3 className="geo-dd__tcard-name">{t.name}</h3>
                  {t.pin_code && (
                    <div className="geo-dd__tcard-meta">
                      <span>PIN {t.pin_code}</span>
                    </div>
                  )}
                  {(t.total_gram_panchayats || t.total_villages) ? (
                    <div className="geo-dd__tcard-stats">
                      {t.total_gram_panchayats ? (
                        <span><strong>{formatINR(t.total_gram_panchayats)}</strong>GPs</span>
                      ) : null}
                      {t.total_villages ? (
                        <span><strong>{formatCompact(t.total_villages)}</strong>villages</span>
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

export default DistrictGeography;
