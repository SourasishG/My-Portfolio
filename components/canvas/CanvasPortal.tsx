"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const DynamicSceneRoot = dynamic(
  () => import("@/components/canvas/SceneRoot").then((mod) => mod.SceneRoot),
  { ssr: false }
);

/**
 * Client-side wrapper required by Next.js 16 App Router to load `<SceneRoot>` with `ssr: false`
 * outside Server Components. Defers heavy WebGL context initialization until the page finishes
 * loading and hits an idle slice, ensuring Hero LCP, DOM hydration, and input readiness stay 100% responsive.
 */
export function CanvasPortal() {
  const [readyToMount, setReadyToMount] = useState(false);

  useEffect(() => {
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const scheduleMount = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(
          () => setReadyToMount(true),
          { timeout: 2500 }
        );
      } else {
        timeoutId = setTimeout(() => setReadyToMount(true), 1200) as unknown as number;
      }
    };

    if (document.readyState === "complete") {
      scheduleMount();
    } else {
      window.addEventListener("load", scheduleMount, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleMount);
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
