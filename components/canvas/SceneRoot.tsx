"use client";

import { useEffect, useRef, useState } from "react";

// Silence known upstream Three.js deprecation warning emitted inside @react-three/fiber's internal store
if (typeof window !== "undefined") {
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock: This module has been deprecated")) {
      return;
    }
    origWarn.apply(console, args);
  };
}

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Canvas, useThree } from "@react-three/fiber";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { GrainOverlay } from "@/components/canvas/GrainOverlay";
import { useGpuTier } from "@/hooks/useGpuTier";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSceneStore } from "@/lib/store";

const DynamicContourSphere = dynamic(
  () => import("@/components/canvas/ContourSphere").then((m) => m.ContourSphere),
  { ssr: false }
);
const DynamicProjectReveal = dynamic(
  () => import("@/components/canvas/ProjectReveal").then((m) => m.ProjectReveal),
  { ssr: false }
);
const DynamicToolkitConstellation = dynamic(
  () => import("@/components/canvas/ToolkitConstellation").then((m) => m.ToolkitConstellation),
  { ssr: false }
);
const DynamicVelocityPlane = dynamic(
  () => import("@/components/canvas/VelocityPlane").then((m) => m.VelocityPlane),
  { ssr: false }
);
const DynamicChromeArches = dynamic(
  () => import("@/components/canvas/ChromeArches").then((m) => m.ChromeArches),
  { ssr: false }
);
const DynamicGlassObject = dynamic(
  () => import("@/components/canvas/GlassObject").then((m) => m.GlassObject),
  { ssr: false }
);
const DynamicPortraitHalftone = dynamic(
  () => import("@/components/canvas/PortraitHalftone").then((m) => m.PortraitHalftone),
  { ssr: false }
);

function ResponsiveSceneCamera({ isDesktop }: { isDesktop: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, isDesktop ? 5.05 : 6.75);
    camera.updateProjectionMatrix();
  }, [camera, isDesktop]);

  return null;
}

/**
 * Single persistent fixed WebGL `<Canvas>` mounted lazily after client hydration.
 * Enforces:
 * - Max 2 active WebGL shaders per viewport (active section shader + S8 GrainOverlay)
 * - Section-adjacent lazy chunk loading via `next/dynamic` so offscreen shaders never
 *   block Hero boot CPU/GPU compilation
 * - Automatic GPU tier scaling & fallback trigger on context loss or low GPU
 * - Pauses loop cleanly when browser tab is hidden (`visibilitychange`)
 * - Full bypass when `prefers-reduced-motion: reduce` is enabled
 */
export function SceneRoot() {
  const pathname = usePathname();
  const isLabRoute = pathname?.startsWith("/lab") ?? false;

  const gpuProfile = useGpuTier();
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const activeSection = useSceneStore((s) => s.activeSection);
  const webglFailed = useSceneStore((s) => s.webglFailed);
  const setWebglFailed = useSceneStore((s) => s.setWebglFailed);
  const setUseStaticFallback = useSceneStore((s) => s.setUseStaticFallback);

  const [tabHidden, setTabHidden] = useState(false);
  const cleanupContextListenersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onVisibilityChange = () => {
      setTabHidden(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (gpuProfile.ready && !gpuProfile.webglSupported) {
      setWebglFailed(true);
    }
  }, [gpuProfile.ready, gpuProfile.webglSupported, setWebglFailed]);

  const shouldRenderCanvas =
    !isLabRoute &&
    !reducedMotion &&
    !webglFailed &&
    gpuProfile.webglSupported &&
    gpuProfile.webglViable;

  useEffect(() => {
    const needsFallback =
      !isLabRoute &&
      (reducedMotion ||
        webglFailed ||
        (gpuProfile.ready && (!gpuProfile.webglSupported || !gpuProfile.webglViable)));
    setUseStaticFallback(needsFallback);
  }, [
    gpuProfile.ready,
    gpuProfile.webglSupported,
    gpuProfile.webglViable,
    isLabRoute,
    reducedMotion,
    setUseStaticFallback,
    webglFailed,
  ]);

  useEffect(() => {
    return () => {
      cleanupContextListenersRef.current?.();
      cleanupContextListenersRef.current = null;
    };
  }, []);

  if (!shouldRenderCanvas) {
    return null;
  }

  const isHomeRoute = pathname === "/";

  const showHeroPortrait = isHomeRoute && activeSection === "hero" && isDesktop;
  const mountHeroPortrait = isHomeRoute && isDesktop && (activeSection === "hero" || activeSection === "about");

  const showAboutSphere = isHomeRoute && activeSection === "about";
  const mountAboutSphere = isHomeRoute && (activeSection === "about" || activeSection === "hero" || activeSection === "projects");

  const showProjectReveal = isHomeRoute && activeSection === "projects" && isDesktop;
  const mountProjectReveal =
    isHomeRoute && isDesktop && (activeSection === "projects" || activeSection === "about" || activeSection === "toolkit");

  const showToolkitConstellation = isHomeRoute && activeSection === "toolkit";
  const mountToolkitConstellation =
    isHomeRoute && (activeSection === "toolkit" || activeSection === "projects" || activeSection === "journey");

  const showVelocityPlane = isHomeRoute && activeSection === "beyond";
  const mountVelocityPlane =
    isHomeRoute && (activeSection === "beyond" || activeSection === "journey" || activeSection === "aspirations");

  const showChromeArches = isHomeRoute && activeSection === "aspirations";
  const mountChromeArches =
    isHomeRoute && (activeSection === "aspirations" || activeSection === "beyond" || activeSection === "contact");

  const showGlassObject = isHomeRoute && activeSection === "contact";
  const mountGlassObject =
    isHomeRoute && (activeSection === "contact" || activeSection === "aspirations");

  const canvasBackdrop = isHomeRoute && activeSection === "hero" ? "#000000" : "#07080B";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: canvasBackdrop,
        transition: "background-color 0.45s ease",
      }}
    >
      <CanvasErrorBoundary
        fallback={null}
        onError={() => {
          setWebglFailed(true);
        }}
      >
        <Canvas
          camera={{ position: [0, 0, isDesktop ? 5.05 : 6.75], fov: 42 }}
          dpr={isDesktop ? [1, 2] : [1, 1.5]}
          frameloop={tabHidden ? "never" : "always"}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            cleanupContextListenersRef.current?.();
            const el = gl.domElement;
            const onLost = (event: Event) => {
              event.preventDefault();
              setWebglFailed(true);
            };
            const onRestored = () => {
              setWebglFailed(false);
            };
            el.addEventListener("webglcontextlost", onLost);
            el.addEventListener("webglcontextrestored", onRestored);
            cleanupContextListenersRef.current = () => {
              el.removeEventListener("webglcontextlost", onLost);
              el.removeEventListener("webglcontextrestored", onRestored);
            };
          }}
        >
          <ResponsiveSceneCamera isDesktop={isDesktop} />

          {/* T1/T2 — Hero Halftone Portrait synced to #hero-portrait-stage */}
          {mountHeroPortrait && (
            <DynamicPortraitHalftone
              viewportSelector="#hero-portrait-stage"
              visible={showHeroPortrait}
            />
          )}

          {/* S2 — Procedural Topographic Contour Sphere synced to Section 02 aperture */}
          {mountAboutSphere && (
            <DynamicContourSphere
              tier={gpuProfile.tier}
              isMobile={!isDesktop}
              reducedMotion={reducedMotion}
              visible={showAboutSphere}
              viewportSelector="#about-s2-aperture"
            />
          )}

          {/* S3 — Halftone -> True-Color Optical Reveal synced to Section 03 stage (desktop) */}
          {mountProjectReveal && (
            <DynamicProjectReveal
              visible={showProjectReveal}
              reducedMotion={reducedMotion}
              viewportSelector="#projects-s3-stage"
            />
          )}

          {/* Section 04 Restrained Point Constellation */}
          {mountToolkitConstellation && (
            <DynamicToolkitConstellation
              tier={gpuProfile.tier}
              isMobile={!isDesktop}
              reducedMotion={reducedMotion}
              visible={showToolkitConstellation}
            />
          )}

          {/* S7 — Scroll-Velocity Distortion synced to Section 06 $paper aperture */}
          {mountVelocityPlane && (
            <DynamicVelocityPlane
              visible={showVelocityPlane}
              reducedMotion={reducedMotion}
              viewportSelector="#beyond-s7-stage"
            />
          )}

          {/* S5 — Chrome Fluid Arches synced to Section 07 Aspirations aperture */}
          {mountChromeArches && (
            <DynamicChromeArches
              tier={gpuProfile.tier}
              isMobile={!isDesktop}
              reducedMotion={reducedMotion}
              visible={showChromeArches}
              viewportSelector="#aspirations-s5-stage"
            />
          )}

          {/* S4 — Chromatic Glass Crystal synced to Section 08 Contact aperture */}
          {mountGlassObject && (
            <DynamicGlassObject
              tier={gpuProfile.tier}
              isMobile={!isDesktop}
              reducedMotion={reducedMotion}
              visible={showGlassObject}
              viewportSelector="#contact-s4-stage"
            />
          )}

          {/* S8 — Subtle Global Grain & Vignette */}
          <GrainOverlay
            enabled={gpuProfile.tier === "high" || isDesktop}
            grainOpacity={0.036}
            vignetteStrength={0.1}
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
