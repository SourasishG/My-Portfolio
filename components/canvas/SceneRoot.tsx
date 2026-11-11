"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Canvas, useThree } from "@react-three/fiber";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { GrainOverlay } from "@/components/canvas/GrainOverlay";
import { HeroBlob } from "@/components/canvas/HeroBlob";
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

  const showHeroBlob = activeSection === "hero" || activeSection === "about";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "#000000",
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
            position={isDesktop ? [1.28, 0.02, 0] : [0, 0.28, 0]}
            scale={isDesktop ? 1.04 : 0.88}
            labOverrides={{
              basePointSize: 2.15,
              opacity: isDesktop ? 0.72 : 0.62,
            }}
          />

          {/* S8 — Subtle Global Grain & Vignette (disabled on low GPU / muted on $paper) */}
          <GrainOverlay
            enabled={gpuProfile.tier === "high" || isDesktop}
            grainOpacity={0.04}
            vignetteStrength={0.22}
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
