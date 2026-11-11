"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the OS/browser `prefers-reduced-motion: reduce` setting safely on client.
 * Defaults to false during SSR; updates immediately if user toggles system preference.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
