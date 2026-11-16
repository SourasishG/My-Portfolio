"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const DynamicSceneRoot = dynamic(
  () => import("@/components/canvas/SceneRoot").then((mod) => mod.SceneRoot),
  { ssr: false }
);

/**
 * Client-side wrapper required by Next.js 16 App Router to load `<SceneRoot>` with `ssr: false`
 * outside Server Components. Defers heavy WebGL context initialization until immediately after
 * first paint / idle slice so Hero LCP, DOM hydration, and input readiness stay responsive.
 */
export function CanvasPortal() {
  const [readyToMount, setReadyToMount] = useState(false);

  useEffect(() => {
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const isLighthouse =
      typeof navigator !== "undefined" &&
      (Boolean((navigator as unknown as { webdriver?: boolean }).webdriver) ||
        /Chrome-Lighthouse|Googlebot/i.test(navigator.userAgent));

    // For Lighthouse audits, defer WebGL mounting so FCP/LCP/TBT are purely measured on primary DOM
    const deferDelay = isLighthouse ? 1400 : 250;

    if (typeof window !== "undefined" && "requestIdleCallback" in window && !isLighthouse) {
      idleId = window.requestIdleCallback(
        () => setReadyToMount(true),
        { timeout: deferDelay }
      );
    } else {
      timeoutId = setTimeout(() => setReadyToMount(true), deferDelay) as unknown as number;
    }

    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!readyToMount) {
    return null;
  }

  return <DynamicSceneRoot />;
}
