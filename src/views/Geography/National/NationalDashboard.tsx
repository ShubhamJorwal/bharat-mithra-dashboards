import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineMap,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineFlag,
  HiOutlineGlobeAlt,
  HiOutlineSparkles,
  HiOutlineArrowSmRight
} from 'react-icons/hi';
import geographyApi from '../../../services/api/geography.api';
import type { NationalSummary } from '../../../types/api.types';
import './NationalDashboard.scss';

type LevelKey = 'states' | 'districts' | 'taluks' | 'gp' | 'villages';

interface Orbit {
  key: LevelKey;
  label: string;
  shortLabel: string;
  value: number;
  path: string;
  icon: typeof HiOutlineMap;
  color: string;
  startAngle: number; // degrees on the shared ring
}

interface ZonePetal {
  name: string;
  code: string;
  count: number;
  angle: number;
  color: string;
}

const useCountUp = (target: number, duration = 1400, start = 0): number => {
  const [value, setValue] = useState(start);
  useEffect(() => {
    if (!target) {
      setValue(0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
};

const formatIndian = (num: number | undefined): string => {
  if (!num) return '0';
  return num.toLocaleString('en-IN');
};

const formatCompact = (num: number | undefined): string => {
  if (!num) return '0';
  if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Renders the 24-spoke Ashoka Chakra in pure SVG.
// Spokes run from r=42 (outer-edge of the inner core ring) to r=94 — so the
// outer rim sits as close to the orbit ring as possible without touching.
const AshokaChakra = () => {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg className="nd-chakra__svg" viewBox="-100 -100 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="chakra-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0, 0, 128, 0.4)" />
          <stop offset="100%" stopColor="rgba(0, 0, 128, 0)" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="98" fill="url(#chakra-glow)" />
      <circle cx="0" cy="0" r="96" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <circle cx="0" cy="0" r="90" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      {spokes.map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <line x1="0" y1="-42" x2="0" y2="-90" stroke="currentColor" strokeWidth="1.6" opacity="0.85" strokeLinecap="round" />
          <circle cx="0" cy="-90" r="2" fill="currentColor" opacity="0.85" />
        </g>
      ))}
      <circle cx="0" cy="0" r="40" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
};

const NationalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NationalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredOrbit, setHoveredOrbit] = useState<LevelKey | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await geographyApi.getNationalSummary();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to load national data');
        setData(null);
      }
    } catch (err) {
      console.error('Failed to fetch national summary:', err);
      setError('Unable to connect to the server. Please try again later.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalStatesUts = (data?.total_states || 0) + (data?.total_union_territories || 0);
  const populationDisplay = useCountUp(data?.population || 0, 1800);
  const totalSubdivisions =
    (data?.total_districts || 0) +
    (data?.total_taluks || 0) +
    (data?.total_gram_panchayats || 0) +
    (data?.total_villages || 0);

  if (loading) {
    return (
      <div className="nd">
        <div className="nd-loader">
          <div className="nd-loader__chakra"><AshokaChakra /></div>
          <p className="nd-loader__text">Loading Bharat…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="nd">
        <div className="nd-error">
          <HiOutlineExclamationCircle className="nd-error__icon" />
          <h2 className="nd-error__title">Unable to Load</h2>
          <p className="nd-error__text">{error || 'No data available'}</p>
          <button className="nd-error__btn" onClick={fetchData}>
            <HiOutlineRefresh /> Retry
          </button>
        </div>
      </div>
    );
  }

  // All 5 levels share ONE orbit. Evenly spaced at 72° apart.
  const orbits: Orbit[] = [
    { key: 'states', label: 'States & UTs', shortLabel: 'States', value: totalStatesUts, path: '/geography/states', icon: HiOutlineMap, color: '#FF9933', startAngle: -90 },
    { key: 'districts', label: 'Districts', shortLabel: 'Districts', value: data.total_districts, path: '/geography/districts', icon: HiOutlineOfficeBuilding, color: '#10b981', startAngle: -18 },
    { key: 'taluks', label: 'Taluks', shortLabel: 'Taluks', value: data.total_taluks, path: '/geography/taluks', icon: HiOutlineLocationMarker, color: '#ec4899', startAngle: 54 },
    { key: 'gp', label: 'Gram Panchayats', shortLabel: 'Panchayats', value: data.total_gram_panchayats, path: '/geography/gram-panchayats', icon: HiOutlineUserGroup, color: '#f59e0b', startAngle: 126 },
    { key: 'villages', label: 'Villages', shortLabel: 'Villages', value: data.total_villages, path: '/geography/villages', icon: HiOutlineHome, color: '#6366f1', startAngle: 198 }
  ];

  const cascade = [
    { label: 'Bharat', subLabel: 'The Republic', count: 1, color: '#FF9933', icon: HiOutlineFlag, path: '/geography', tier: 'I' },
    { label: 'States & Union Territories', subLabel: 'Federal Subjects', count: totalStatesUts, color: '#3b82f6', icon: HiOutlineMap, path: '/geography/states', tier: 'II' },
    { label: 'Districts', subLabel: 'Administrative Divisions', count: data.total_districts, color: '#10b981', icon: HiOutlineOfficeBuilding, path: '/geography/districts', tier: 'III' },
    { label: 'Taluks', subLabel: 'Sub-divisions', count: data.total_taluks, color: '#ec4899', icon: HiOutlineLocationMarker, path: '/geography/taluks', tier: 'IV' },
    { label: 'Gram Panchayats', subLabel: 'Village Councils', count: data.total_gram_panchayats, color: '#f59e0b', icon: HiOutlineUserGroup, path: '/geography/gram-panchayats', tier: 'V' },
    { label: 'Villages', subLabel: 'Local Communities', count: data.total_villages, color: '#6366f1', icon: HiOutlineHome, path: '/geography/villages', tier: 'VI' }
  ];

  const zones: ZonePetal[] = data.zones
    ? [
        { name: 'North', code: 'N', count: data.zones.north, angle: 0, color: '#3b82f6' },
        { name: 'Northeast', code: 'NE', count: data.zones.northeast, angle: 60, color: '#8b5cf6' },
        { name: 'East', code: 'E', count: data.zones.east, angle: 120, color: '#10b981' },
        { name: 'South', code: 'S', count: data.zones.south, angle: 180, color: '#FF9933' },
        { name: 'West', code: 'W', count: data.zones.west, angle: 240, color: '#ec4899' },
        { name: 'Central', code: 'C', count: data.zones.central, angle: 300, color: '#f59e0b' }
      ]
    : [];

  const maxZone = zones.length ? Math.max(...zones.map((z) => z.count), 1) : 1;

  return (
    <div className="nd">
      {/* ============================================================
          ACT 1 — THE COSMOS
         ============================================================ */}
      <section className="nd-hero">
        {/* Aurora layers */}
        <div className="nd-aurora nd-aurora--saffron" />
        <div className="nd-aurora nd-aurora--green" />
        <div className="nd-aurora nd-aurora--blue" />

        {/* Starfield */}
        <div className="nd-stars">
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              className="nd-star"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 71) % 100}%`,
                animationDelay: `${(i % 9) * 0.4}s`,
                animationDuration: `${3 + (i % 5)}s`
              }}
            />
          ))}
        </div>

        <div className="nd-hero__topbar">
          <div className="nd-hero__brand">
            <span className="nd-hero__brand-dot" />
            <span>BHARAT MITHRA · GOVERNANCE OS</span>
          </div>
          <button className="nd-hero__refresh" onClick={fetchData} title="Refresh data">
            <HiOutlineRefresh />
            <span>Refresh</span>
          </button>
        </div>

        <div className="nd-hero__main">
        <div className="nd-cosmos">
          {/* Chakra at the center */}
          <div className="nd-chakra">
            <AshokaChakra />
            <div className="nd-chakra__core">
              <span className="nd-chakra__title">India</span>
              {data.capital && (
                <span className="nd-chakra__capital">{data.capital}</span>
              )}
            </div>
          </div>

          {/* Single shared orbit ring */}
          <div className="nd-orbit-ring" />

          {/* Five level pins arrayed around the ring */}
          {orbits.map((o) => {
            const Icon = o.icon;
            const isHovered = hoveredOrbit === o.key;
            return (
              <button
                key={o.key}
                className={`nd-pin ${isHovered ? 'nd-pin--hovered' : ''}`}
                onClick={() => navigate(o.path)}
                onMouseEnter={() => setHoveredOrbit(o.key)}
                onMouseLeave={() => setHoveredOrbit(null)}
                style={
                  {
                    '--pin-angle': `${o.startAngle}deg`,
                    '--pin-color': o.color
                  } as CSSProperties
                }
                title={`${o.label} — ${formatIndian(o.value)}`}
              >
                <span className="nd-pin__icon">
                  <Icon />
                </span>
                <span className="nd-pin__label">
                  <strong>{o.shortLabel}</strong>
                  <em>{formatIndian(o.value)}</em>
                </span>
              </button>
            );
          })}
        </div>

        {/* Hero stat strip */}
        <div className="nd-hero__strip">
          <div className="nd-hero__metric">
            <span className="nd-hero__metric-value">{formatIndian(totalStatesUts)}</span>
            <span className="nd-hero__metric-label">States &amp; UTs</span>
          </div>
          <span className="nd-hero__divider" />
          <div className="nd-hero__metric">
            <span className="nd-hero__metric-value">{formatCompact(data.total_districts)}</span>
            <span className="nd-hero__metric-label">Districts</span>
          </div>
          <span className="nd-hero__divider" />
          <div className="nd-hero__metric">
            <span className="nd-hero__metric-value">{formatCompact(totalSubdivisions)}</span>
            <span className="nd-hero__metric-label">Total Records</span>
          </div>
          {data.population ? (
            <>
              <span className="nd-hero__divider" />
              <div className="nd-hero__metric">
                <span className="nd-hero__metric-value nd-hero__metric-value--ticker">
                  {formatCompact(populationDisplay)}
                </span>
                <span className="nd-hero__metric-label">Population</span>
              </div>
            </>
          ) : null}
          {data.area_sq_km ? (
            <>
              <span className="nd-hero__divider" />
              <div className="nd-hero__metric">
                <span className="nd-hero__metric-value">{formatCompact(data.area_sq_km)}</span>
                <span className="nd-hero__metric-label">km²</span>
              </div>
            </>
          ) : null}
        </div>
        </div>

      </section>

      {/* ============================================================
          ACT 2 — THE CASCADE
         ============================================================ */}
      <section className="nd-cascade">
        <header className="nd-section-head">
          <span className="nd-section-head__kicker">
            <HiOutlineSparkles /> 02 · The Hierarchy
          </span>
          <h2 className="nd-section-head__title">
            Six tiers of <em>governance</em>, end to end.
          </h2>
          <p className="nd-section-head__sub">
            From the Republic of India down to its half a million villages —
            click any tier to drill in.
          </p>
        </header>

        <div className="nd-cascade__list">
          {cascade.map((row, idx) => {
            const Icon = row.icon;
            const isLast = idx === cascade.length - 1;
            return (
              <button
                key={row.label}
                className="nd-cascade__row"
                onClick={() => navigate(row.path)}
                style={
                  {
                    '--row-color': row.color,
                    animationDelay: `${idx * 90}ms`
                  } as CSSProperties
                }
              >
                {/* Vertical connector spine */}
                <div className="nd-cascade__spine">
                  {!isLast && <div className="nd-cascade__line" />}
                  <span className="nd-cascade__tier">{row.tier}</span>
                </div>

                <div className="nd-cascade__icon">
                  <Icon />
                </div>

                <div className="nd-cascade__text">
                  <strong>{row.label}</strong>
                  <small>{row.subLabel}</small>
                </div>

                <div className="nd-cascade__count">
                  <span className="nd-cascade__count-num">{formatIndian(row.count)}</span>
                  <span className="nd-cascade__count-compact">{formatCompact(row.count)}</span>
                </div>

                <span className="nd-cascade__cta" aria-label="Explore">
                  <HiOutlineArrowSmRight />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          ACT 3 — THE COMPASS
         ============================================================ */}
      {zones.length > 0 && (
        <section className="nd-compass-section">
          <header className="nd-section-head">
            <span className="nd-section-head__kicker">
              <HiOutlineGlobeAlt /> 03 · Regional Compass
            </span>
            <h2 className="nd-section-head__title">
              Six directions, <em>one</em> Bharat.
            </h2>
            <p className="nd-section-head__sub">
              The country mapped by zone — each petal grows with the count of states it holds.
            </p>
          </header>

          <div className="nd-compass">
            <div className="nd-compass__rose">
              <svg viewBox="-220 -220 440 440" className="nd-compass__svg" aria-hidden="true">
                {/* Outer ring */}
                <circle cx="0" cy="0" r="200" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.15" />
                <circle cx="0" cy="0" r="160" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.1" />
                <circle cx="0" cy="0" r="120" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.08" />
                {/* Cardinal labels */}
                <text x="0" y="-208" textAnchor="middle" className="nd-compass__cardinal">N</text>
                <text x="208" y="6" textAnchor="middle" className="nd-compass__cardinal">E</text>
                <text x="0" y="218" textAnchor="middle" className="nd-compass__cardinal">S</text>
                <text x="-208" y="6" textAnchor="middle" className="nd-compass__cardinal">W</text>
              </svg>

              {/* Petals */}
              {zones.map((z) => {
                const scale = 0.55 + (z.count / maxZone) * 0.45;
                return (
                  <button
                    key={z.name}
                    className="nd-compass__petal"
                    onClick={() => navigate(`/geography/states?zone=${z.name.toLowerCase()}`)}
                    style={
                      {
                        '--petal-angle': `${z.angle}deg`,
                        '--petal-scale': scale,
                        '--petal-color': z.color
                      } as CSSProperties
                    }
                  >
                    <span className="nd-compass__petal-shape" />
                    <span className="nd-compass__petal-label">
                      <strong>{z.name}</strong>
                      <em>{z.count}</em>
                    </span>
                  </button>
                );
              })}

              <div className="nd-compass__core">
                <span className="nd-compass__core-glyph">✦</span>
                <span className="nd-compass__core-text">BHARAT</span>
              </div>
            </div>

            {/* Zone list — accessible alternative + numeric truth */}
            <ul className="nd-compass__legend">
              {zones.map((z) => (
                <li
                  key={z.name}
                  className="nd-compass__legend-item"
                  onClick={() => navigate(`/geography/states?zone=${z.name.toLowerCase()}`)}
                  style={{ '--row-color': z.color } as CSSProperties}
                >
                  <span className="nd-compass__legend-code">{z.code}</span>
                  <div className="nd-compass__legend-text">
                    <strong>{z.name}</strong>
                    <small>{z.count} {z.count === 1 ? 'state' : 'states'}</small>
                  </div>
                  <div className="nd-compass__legend-bar">
                    <span style={{ width: `${(z.count / maxZone) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

    </div>
  );
};

export default NationalDashboard;
