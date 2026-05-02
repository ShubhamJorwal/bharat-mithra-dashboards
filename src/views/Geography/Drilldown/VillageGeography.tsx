import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  HiOutlineMap,
  HiOutlineLocationMarker,
  HiOutlineExclamationCircle,
  HiOutlineSparkles,
  HiOutlineHome,
} from "react-icons/hi";
import geographyApi from "@/services/api/geography.api";
import type { Village } from "@/types/api.types";
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

const VillageGeography = () => {
  const {
    code = "",
    districtId = "",
    talukId = "",
    gpId = "",
    villageId = "",
  } = useParams<{
    code: string;
    districtId: string;
    talukId: string;
    gpId: string;
    villageId: string;
  }>();
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await geographyApi.getVillageById(villageId);
        if (!cancelled) setVillage(r.data);
      } catch (err) {
        const e = err as { response?: { status?: number }; message?: string };
        if (!cancelled) {
          setError(
            e.response?.status === 404
              ? "Village not found"
              : e.message || "Failed to load village"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [villageId]);

  const stateName = village?.state_name || village?.state?.name || "";
  const stateCode = (village?.state_code || village?.state?.code || code).toUpperCase();
  const districtName = village?.district_name || village?.district?.name || "District";
  const talukName = village?.taluk_name || village?.taluk?.name || "Taluk";
  const gpName = village?.gram_panchayat_name || village?.gram_panchayat?.name || "GP";
  const heroImage = stateImageFor(stateCode);

  return (
    <div className="geo-dd geo-dd--village">
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
        <Link
          to={`/geography/states/code/${code.toLowerCase()}/districts/${districtId}/taluks/${talukId}/gps/${gpId}`}
          className="geo-dd__crumb"
        >
          {gpName}
        </Link>
        <span className="geo-dd__crumb-sep">›</span>
        <span className="geo-dd__crumb geo-dd__crumb--current">{village?.name || "Village"}</span>
      </nav>

      {error && (
        <div className="geo-dd__alert">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {loading && !village && (
        <div className="geo-dd__loading">
          <span className="geo-dd__loading-spinner" />
          <p>Loading village…</p>
        </div>
      )}

      {village && (
        <>
          <header className="geo-dd__hero">
            <div className="geo-dd__hero-text">
              <span className="geo-dd__hero-eyebrow">
                <HiOutlineSparkles /> Village in {gpName}
              </span>
              <h1 className="geo-dd__hero-title">
                {village.name}
                <span className="geo-dd__hero-code">{village.code}</span>
              </h1>
              {village.name_hindi && (
                <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-secondary)" }}>
                  {village.name_hindi}
                </p>
              )}
              <div className="geo-dd__hero-sub">
                <span><HiOutlineLocationMarker /> {gpName}, {talukName}, {districtName}</span>
                {village.pin_code && <span>· PIN {village.pin_code}</span>}
                {village.lgd_code && <span>· LGD {village.lgd_code}</span>}
              </div>

              <div className="geo-dd__hero-stats">
                {village.population != null && (
                  <div className="geo-dd__stat">
                    <strong>{formatCompact(village.population)}</strong>
                    <span>Population</span>
                  </div>
                )}
                {village.households != null && (
                  <div className="geo-dd__stat">
                    <strong>{formatINR(village.households)}</strong>
                    <span>Households</span>
                  </div>
                )}
                {village.area_sq_km != null && (
                  <div className="geo-dd__stat">
                    <strong>{village.area_sq_km}</strong>
                    <span>km²</span>
                  </div>
                )}
              </div>
            </div>

            <div className="geo-dd__hero-image">
              <img
                src={heroImage}
                alt={village.name}
                loading="lazy"
                onError={(e) => {
                  const el = e.currentTarget;
                  const fb = fallbackImage(stateCode);
                  if (el.src !== fb) el.src = fb;
                }}
              />
            </div>
          </header>

          <section className="geo-dd__leaf">
            <div className="geo-dd__leaf-card">
              <div className="geo-dd__leaf-head">Profile</div>
              <div className="geo-dd__leaf-rows">
                <div className="row">
                  <span className="key">Village</span>
                  <span className="val">{village.name}</span>
                </div>
                {village.name_hindi && (
                  <div className="row">
                    <span className="key">Name (Hindi)</span>
                    <span className="val">{village.name_hindi}</span>
                  </div>
                )}
                <div className="row">
                  <span className="key">Code</span>
                  <span className="val">{village.code}</span>
                </div>
                {village.lgd_code && (
                  <div className="row">
                    <span className="key">LGD code</span>
                    <span className="val">{village.lgd_code}</span>
                  </div>
                )}
                {village.pin_code && (
                  <div className="row">
                    <span className="key">PIN code</span>
                    <span className="val">{village.pin_code}</span>
                  </div>
                )}
                <div className="row">
                  <span className="key">Gram Panchayat</span>
                  <span className="val">{gpName}</span>
                </div>
                <div className="row">
                  <span className="key">Taluk</span>
                  <span className="val">{talukName}</span>
                </div>
                <div className="row">
                  <span className="key">District</span>
                  <span className="val">{districtName}</span>
                </div>
                <div className="row">
                  <span className="key">State</span>
                  <span className="val">{stateName || stateCode}</span>
                </div>
                {(village.latitude != null && village.longitude != null) && (
                  <div className="row">
                    <span className="key">Coordinates</span>
                    <span className="val">{village.latitude}°, {village.longitude}°</span>
                  </div>
                )}
                <div className="row">
                  <span className="key">Status</span>
                  <span className="val">{village.is_active === false ? "Inactive" : "Active"}</span>
                </div>
              </div>
            </div>

            <div className="geo-dd__leaf-card">
              <div className="geo-dd__leaf-head">At a glance</div>
              <div className="geo-dd__leaf-stats">
                <div className="geo-dd__leaf-stat">
                  <strong>{formatCompact(village.population)}</strong>
                  <span>Population</span>
                </div>
                <div className="geo-dd__leaf-stat">
                  <strong>{formatINR(village.households)}</strong>
                  <span>Households</span>
                </div>
                {village.area_sq_km != null && (
                  <div className="geo-dd__leaf-stat">
                    <strong>{village.area_sq_km}</strong>
                    <span>km²</span>
                  </div>
                )}
                {village.population != null && village.area_sq_km != null && village.area_sq_km > 0 && (
                  <div className="geo-dd__leaf-stat">
                    <strong>{Math.round(village.population / village.area_sq_km)}</strong>
                    <span>per km²</span>
                  </div>
                )}
              </div>
              {village.households == null && village.population == null && (
                <div className="geo-dd__empty" style={{ padding: "20px" }}>
                  <HiOutlineHome />
                  <p>No demographic data recorded for this village yet.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default VillageGeography;
