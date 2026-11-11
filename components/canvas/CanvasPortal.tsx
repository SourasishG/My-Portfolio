"use client";

import dynamic from "next/dynamic";

const DynamicSceneRoot = dynamic(
  () => import("@/components/canvas/SceneRoot").then((mod) => mod.SceneRoot),
  { ssr: false }
);

/**
 * Client-side wrapper required by Next.js 16 App Router to load `<SceneRoot>` with `ssr: false`
 * outside Server Components so WebGL code splits cleanly away from initial HTML/LCP.
 */
export function CanvasPortal() {
  return <DynamicSceneRoot />;
}
