import { useEffect, useState } from 'react';

// Mirror the SCSS breakpoint tokens in `src/styles/_variables.scss`
// so JS-side decisions match CSS-side media queries exactly.
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

interface Viewport {
  width: number;
  height: number;
  /** width < 1024 — the layout shell flips to drawer mode */
  isMobile: boolean;
  /** width < 768 — phone-class screens */
  isPhone: boolean;
  /** width >= 1024 — desktop / laptop */
  isDesktop: boolean;
  /** Generic helper: width is at or below the named breakpoint */
  isAtMost: (bp: Breakpoint) => boolean;
  /** Generic helper: width is at or above the named breakpoint */
  isAtLeast: (bp: Breakpoint) => boolean;
}

const readViewport = (): Pick<Viewport, 'width' | 'height'> => {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 800 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
};

/**
 * Subscribe to viewport size changes.
 *
 * Used by the layout shell to flip the sidebar into a drawer below
 * 1024 px and by the topbar to collapse search/wallet on narrow screens.
 *
 * Resize events are throttled via requestAnimationFrame so we don't
 * thrash React on every pixel of a window drag.
 */
export const useViewport = (): Viewport => {
  const [size, setSize] = useState(readViewport);

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSize(readViewport()));
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const { width, height } = size;
  return {
    width,
    height,
    isMobile: width < BREAKPOINTS.lg,
    isPhone: width < BREAKPOINTS.md,
    isDesktop: width >= BREAKPOINTS.lg,
    isAtMost: (bp) => width < BREAKPOINTS[bp],
    isAtLeast: (bp) => width >= BREAKPOINTS[bp],
  };
};
