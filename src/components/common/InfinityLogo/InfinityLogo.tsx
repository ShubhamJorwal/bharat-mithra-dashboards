import { useEffect, useRef, useState, useCallback, useId } from "react";
import "./InfinityLogo.scss";

// 10 filled icon paths (24x24 viewBox) — solid white icons
const iconPaths: string[] = [
  // Home
  "M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z",
  // Heartbeat / Health
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  // People / Group
  "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  // Person
  "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  // Sports / Running
  "M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z",
  // Yoga / Wellness
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  // Family
  "M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm14 3c-1.1 0-2 .9-2 2v4h-2V9c0-1.1-.9-2-2-2s-2 .9-2 2v4H8V9c0-1.1-.9-2-2-2s-2 .9-2 2v7h4v5h2v-5h4v5h2v-5h4V9c0-1.1-.9-2-2-2z",
  // Education / Book
  "M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z",
  // Graduation cap
  "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
  // Shield / Protection
  "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
];

// Each segment has a gradient: [startColor, endColor]
const segmentGradients: [string, string][] = [
  ["#2ed47a", "#178a4a"],
  ["#20d4a8", "#128a6e"],
  ["#ffe040", "#d4a010"],
  ["#ffb84d", "#c87a18"],
  ["#f09840", "#b85c10"],
  ["#20d4a8", "#128a6e"],
  ["#ffa050", "#c06020"],
  ["#9b7ae0", "#5c3a9e"],
  ["#7b6ac0", "#3d2a7e"],
  ["#48d090", "#1a8a50"],
];

const NUM = 10;
const DUR = 20;
const SW = 80;
const GAP = 1.5;

const FULL_PATH = "M 280,150 C 312,80 365,25 435,25 C 505,25 555,80 555,150 C 555,220 505,275 435,275 C 365,275 312,220 280,150 C 248,80 195,25 125,25 C 55,25 5,80 5,150 C 5,220 55,275 125,275 C 195,275 248,220 280,150 Z";
const LEFT_LOOP = "M 280,150 C 248,80 195,25 125,25 C 55,25 5,80 5,150 C 5,220 55,275 125,275 C 195,275 248,220 280,150";

interface InfinityLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'splash';
}

const InfinityLogo = ({ className = "", size = "md" }: InfinityLogoProps) => {
  const uid = useId().replace(/:/g, "");
  const [ready, setReady] = useState(false);
  const [pathLen, setPathLen] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const colorRefs = useRef<(SVGPathElement | null)[]>([]);
  const crossColorRefs = useRef<(SVGPathElement | null)[]>([]);
  const iconRefs = useRef<(SVGGElement | null)[]>([]);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLen(len);
    }
  }, []);

  const animate = useCallback(() => {
    if (!pathRef.current || pathLen <= 0) return;

    const now = performance.now();
    if (!startRef.current) startRef.current = now;
    const elapsed = (now - startRef.current) / 1000;
    const segLen = pathLen / NUM;
    const progress = (elapsed / DUR) * pathLen;

    for (let i = 0; i < NUM; i++) {
      const offset = -(i * segLen + GAP / 2) - progress;
      const dashVal = `${segLen - GAP} ${pathLen - segLen + GAP}`;

      const colorEl = colorRefs.current[i];
      if (colorEl) {
        colorEl.style.strokeDasharray = dashVal;
        colorEl.style.strokeDashoffset = `${offset}`;
      }

      const crossEl = crossColorRefs.current[i];
      if (crossEl) {
        crossEl.style.strokeDasharray = dashVal;
        crossEl.style.strokeDashoffset = `${offset}`;
      }

      const iconEl = iconRefs.current[i];
      if (iconEl) {
        const iconOffset = ((i + 0.5) * segLen + progress) % pathLen;
        const pt = pathRef.current!.getPointAtLength(iconOffset);
        iconEl.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);

        const distFromCenter = Math.abs(pt.x - 280);
        const inCenterZone = distFromCenter < 40 && Math.abs(pt.y - 150) < 50;
        const onBackLoop = iconOffset < pathLen / 2;
        iconEl.style.opacity = inCenterZone && onBackLoop ? "0" : "1";
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }, [pathLen]);

  useEffect(() => {
    if (pathLen > 0) {
      const t = setTimeout(() => {
        setReady(true);
        startRef.current = 0;
        animRef.current = requestAnimationFrame(animate);
      }, 500);
      return () => {
        clearTimeout(t);
        cancelAnimationFrame(animRef.current);
      };
    }
  }, [pathLen, animate]);

  return (
    <div className={`infinity-logo infinity-logo--${size} ${ready ? "infinity-logo--on" : ""} ${className}`}>
      <svg viewBox="-40 -30 640 360" xmlns="http://www.w3.org/2000/svg" className="infinity-logo-svg">
        <path
          d={FULL_PATH}
          ref={pathRef}
          fill="none"
          stroke="none"
          style={{ visibility: "hidden", pointerEvents: "none" }}
        />

        <defs>
          <clipPath id={`clip-${uid}`}>
            <rect x="230" y="75" width="100" height="150" />
          </clipPath>

          {segmentGradients.map(([start, end], i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`sg${uid}-${i}`}
              x1="0%" y1="0%" x2="100%" y2="100%"
            >
              <stop offset="0%" stopColor={start} />
              <stop offset="100%" stopColor={end} />
            </linearGradient>
          ))}

          <filter id={`fs-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur" />
            <feFlood floodColor="#001740" floodOpacity="0.35" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feGaussianBlur in="shadow" stdDeviation="8" result="spread" />
            <feMerge>
              <feMergeNode in="spread" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter={`url(#fs-${uid})`}>
          <path
            d={FULL_PATH}
            className="infinity-logo-white-base"
            fill="none"
            stroke="white"
            strokeWidth={SW}
            strokeLinecap="butt"
          />

          {segmentGradients.map((_, i) => (
            <path
              key={`cs-${i}`}
              d={FULL_PATH}
              ref={(el) => { colorRefs.current[i] = el; }}
              fill="none"
              stroke={`url(#sg${uid}-${i})`}
              strokeWidth={SW}
              strokeLinecap="butt"
              className="infinity-logo-color-seg"
            />
          ))}
        </g>

        <g clipPath={`url(#clip-${uid})`}>
          <path
            d={LEFT_LOOP}
            className="infinity-logo-crossover"
            fill="none"
            stroke="white"
            strokeWidth={SW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {segmentGradients.map((_, i) => (
            <path
              key={`cx-${i}`}
              d={FULL_PATH}
              ref={(el) => { crossColorRefs.current[i] = el; }}
              fill="none"
              stroke={`url(#sg${uid}-${i})`}
              strokeWidth={SW}
              strokeLinecap="butt"
              className="infinity-logo-color-seg"
            />
          ))}
        </g>

        {iconPaths.map((d, i) => (
          <g
            key={`icon-${i}`}
            className="infinity-logo-icon-group"
            ref={(el) => { iconRefs.current[i] = el; }}
          >
            <g transform="translate(-33.6,-33.6) scale(2.8)">
              <path d={d} fill="white" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default InfinityLogo;
