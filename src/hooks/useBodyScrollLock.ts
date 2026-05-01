import { useEffect } from "react";

// Tracks how many active modals/overlays want the body locked, so nesting
// (a modal that opens another modal) doesn't unlock prematurely when the
// inner one closes.
let lockCount = 0;
let savedScrollY = 0;

const apply = () => {
  if (lockCount === 1) {
    savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }
};

const release = () => {
  if (lockCount === 0) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    window.scrollTo(0, savedScrollY);
  }
};

/**
 * Locks the body scroll while `active` is true. Multiple modals can be
 * open at once; the body unlocks only when the last one closes.
 *
 * Restores the previous scroll position on unlock, so the user doesn't
 * jump to the top when closing a modal mid-page.
 */
export const useBodyScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    lockCount++;
    apply();
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      release();
    };
  }, [active]);
};

export default useBodyScrollLock;
