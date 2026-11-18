"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const DynamicSceneRoot = dynamic(
  () => import("@/components/canvas/SceneRoot").then((mod) => mod.SceneRoot),
  { ssr: false }
);

/**
 * Client-side wrapper required by Next.js 16 App Router to load `<SceneRoot>` with `ssr: false`
 * outside Server Components. Defers heavy WebGL context initialization until the page finishes
 * loading and hits an idle slice on desktop devices.
 * Touch / mobile devices stay 100% lightweight on Tier 0/1 vector and halftone DOM fallbacks.
 */
export function CanvasPortal() {
  const pathname = usePathname();
  const isLabRoute = pathname?.startsWith("/lab") ?? false;
  const [readyToMount, setReadyToMount] = useState(false);

  useEffect(() => {
    // Only mount WebGL canvas on desktop viewports (min-width: 1024px) outside /lab
    if (isLabRoute || typeof window === "undefined" || window.innerWidth < 1024) {
      return;
    }

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
  }, [isLabRoute]);

  if (isLabRoute || !readyToMount) {
    return null;
  }

  return <DynamicSceneRoot />;
}
