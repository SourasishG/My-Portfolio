"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Canvas, useThree } from "@react-three/fiber";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { ChromeArches } from "@/components/canvas/ChromeArches";
import { ContourSphere } from "@/components/canvas/ContourSphere";
import { GrainOverlay } from "@/components/canvas/GrainOverlay";
import { HeroBlob } from "@/components/canvas/HeroBlob";
import { ProjectReveal } from "@/components/canvas/ProjectReveal";
import { ToolkitConstellation } from "@/components/canvas/ToolkitConstellation";
import { VelocityPlane } from "@/components/canvas/VelocityPlane";
import { useGpuTier } from "@/hooks/useGpuTier";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSceneStore } from "@/lib/store";

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
 * - Max 2 active WebGL shaders per viewport (S1 + S8 in Section 01 Hero)
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
  const showHeroBlob = isHomeRoute && activeSection === "hero";
  const showAboutSphere = isHomeRoute && activeSection === "about";
  const showProjectReveal = isHomeRoute && activeSection === "projects" && isDesktop;
  const showToolkitConstellation = isHomeRoute && activeSection === "toolkit";
  const showVelocityPlane = isHomeRoute && activeSection === "beyond";
  const showChromeArches = isHomeRoute && activeSection === "aspirations";
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

          {/* S1 — Hero Point-Cloud Blob positioned cleanly to the right on desktop */}
          <HeroBlob
            tier={gpuProfile.tier}
            isMobile={!isDesktop}
            reducedMotion={reducedMotion}
            visible={showHeroBlob}
            position={isDesktop ? [1.28, 0.02, 0] : [0, 0.45, 0]}
            scale={isDesktop ? 1.06 : 0.92}
            labOverrides={{
              basePointSize: isDesktop ? 2.6 : 2.85,
              opacity: isDesktop ? 0.94 : 0.98,
            }}
          />

          {/* S2 — Procedural Topographic Contour Sphere synced to Section 02 aperture */}
          <ContourSphere
            tier={gpuProfile.tier}
            isMobile={!isDesktop}
            reducedMotion={reducedMotion}
            visible={showAboutSphere}
            viewportSelector="#about-s2-aperture"
          />

          {/* S3 — Halftone -> True-Color Optical Reveal synced to Section 03 stage (desktop) */}
          <ProjectReveal
            visible={showProjectReveal}
            reducedMotion={reducedMotion}
            viewportSelector="#projects-s3-stage"
          />

          {/* Section 04 Restrained Point Constellation */}
          <ToolkitConstellation
            tier={gpuProfile.tier}
            isMobile={!isDesktop}
            reducedMotion={reducedMotion}
            visible={showToolkitConstellation}
          />

          {/* S7 — Scroll-Velocity Distortion synced to Section 06 $paper aperture */}
          <VelocityPlane
            visible={showVelocityPlane}
            reducedMotion={reducedMotion}
            viewportSelector="#beyond-s7-stage"
          />

          {/* S5 — Chrome Fluid Arches synced to Section 07 Aspirations aperture */}
          <ChromeArches
            tier={gpuProfile.tier}
            isMobile={!isDesktop}
            reducedMotion={reducedMotion}
            visible={showChromeArches}
            viewportSelector="#aspirations-s5-stage"
          />

          {/* S8 — Subtle Global Grain & Vignette (disabled on low GPU / muted on $paper) */}
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
