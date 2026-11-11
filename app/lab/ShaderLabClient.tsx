"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { Canvas, useThree } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { ArrowLeft, Cpu, Eye, Layers, Sparkles } from "lucide-react";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import {
  ContourSphere,
  ContourSphereFallback,
} from "@/components/canvas/ContourSphere";
import {
  getRecommendedHeroPointCount,
  HeroBlob,
  HeroBlobFallback,
} from "@/components/canvas/HeroBlob";
import { useGpuTier } from "@/hooks/useGpuTier";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { GpuTierLevel, useSceneStore } from "@/lib/store";
import styles from "./lab.module.scss";

type LabSceneMode = "s1" | "s2" | "morph";
type PresetTier = "desktop" | "mid" | "mobile";

const emptySubscribe = () => () => {};

function getUrlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function getInitialSceneMode(): LabSceneMode {
  const qScene = getUrlParam("scene");
  if (qScene === "s1" || qScene === "s2" || qScene === "morph") return qScene;
  return "s1";
}

function getInitialPresetTier(): PresetTier {
  const qPreset = getUrlParam("preset");
  if (qPreset === "desktop" || qPreset === "mid" || qPreset === "mobile") {
    return qPreset;
  }
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

function getInitialFallback(): boolean {
  const qFallback = getUrlParam("fallback");
  return qFallback === "1" || qFallback === "true";
}

function getInitialNumberParam(name: string, fallback: number): number {
  const raw = getUrlParam(name);
  if (raw === null) return fallback;
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) ? fallback : Math.min(1, Math.max(0, parsed));
}

export function ShaderLabClient() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return (
      <main id="main-content" className={styles.labShell}>
        <div className={styles.stageFrame} />
      </main>
    );
  }

  return <ShaderLabInteractive />;
}

function LabCameraRig({ isMobilePreset }: { isMobilePreset: boolean }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const targetZ = isMobilePreset || aspect < 0.85 ? 7.1 : 4.9;
    camera.position.set(0, 0, targetZ);
    camera.updateProjectionMatrix();
  }, [camera, isMobilePreset, size.height, size.width]);

  return null;
}

function ShaderLabInteractive() {
  const gpuProfile = useGpuTier();
  const osReducedMotion = useReducedMotion();
  const isNarrowViewport = useMediaQuery("(max-width: 767px)");

  const [sceneMode, setSceneMode] = useState<LabSceneMode>(getInitialSceneMode);
  const [presetTier, setPresetTier] = useState<PresetTier>(getInitialPresetTier);
  const [forceFallback, setForceFallback] = useState<boolean>(getInitialFallback);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const pointerReadoutRef = useRef<HTMLSpanElement | null>(null);

  const initialScrollValue = useMemo(() => {
    const fallbackScroll = getInitialSceneMode() === "morph" ? 0.65 : 0.0;
    return getInitialNumberParam("scroll", fallbackScroll);
  }, []);

  const initialSplitValue = useMemo(
    () => getInitialNumberParam("split", 0.0),
    []
  );

  const [s1Values, setS1Values] = useControls("S1 — Hero Point Cloud", () => ({
    displacementAmp: { value: 0.34, min: 0.0, max: 0.85, step: 0.01 },
    noiseFreq: { value: 1.45, min: 0.4, max: 3.2, step: 0.05 },
    curlMix: { value: 0.52, min: 0.0, max: 1.4, step: 0.02 },
    basePointSize: { value: 2.15, min: 0.8, max: 4.5, step: 0.05 },
    pointerStrength: { value: 0.85, min: 0.0, max: 1.8, step: 0.02 },
    scrollMorph: { value: initialScrollValue, min: 0.0, max: 1.0, step: 0.01 },
    opacity: { value: 0.74, min: 0.15, max: 1.0, step: 0.02 },
    colorCyan: "#4DA8FF",
    colorViolet: "#B388F5",
  }));

  const [s2Values, setS2Values] = useControls("S2 — Contour Sphere", () => ({
    noiseScale: { value: 2.15, min: 0.6, max: 4.8, step: 0.05 },
    displacementAmp: { value: 0.085, min: 0.0, max: 0.35, step: 0.005 },
    contourCount: { value: 14.0, min: 4.0, max: 32.0, step: 1.0 },
    lineWidth: { value: 0.055, min: 0.015, max: 0.18, step: 0.005 },
    splitProgress: { value: initialSplitValue, min: 0.0, max: 1.0, step: 0.01 },
    splitGap: { value: 0.36, min: 0.05, max: 0.75, step: 0.01 },
    lineColor: "#F3F5F9",
    bgColor: "#07080B",
    accentRim: "#FF5B1F",
  }));

  useEffect(() => {
    const canvas = canvasElementRef.current;
    if (!canvas) return;

    const handleLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleRestored = () => {
      setContextLost(false);
    };

    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
    };
  }, [forceFallback]);

  const effectiveTier: GpuTierLevel =
    presetTier === "desktop" ? "high" : presetTier === "mid" ? "mid" : "low";
  const isMobilePreset = presetTier === "mobile";
  const effectiveReducedMotion = osReducedMotion || forceReducedMotion;
  const activePointCount = getRecommendedHeroPointCount(
    effectiveTier,
    isMobilePreset
  );

  const showFallback =
    forceFallback || contextLost || !gpuProfile.webglSupported || effectiveReducedMotion;

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      useSceneStore.getState().setPointer(nx, ny);
      if (pointerReadoutRef.current) {
        pointerReadoutRef.current.textContent = `PTR ${nx.toFixed(2)}, ${ny.toFixed(2)}`;
      }
    },
    []
  );

  const handlePointerLeave = useCallback(() => {
    useSceneStore.getState().setPointer(0, 0);
    if (pointerReadoutRef.current) {
      pointerReadoutRef.current.textContent = "PTR 0.00, 0.00";
    }
  }, []);

  const activeInfo = useMemo(() => {
    if (sceneMode === "s1") {
      return {
        code: "S1 // HERO POINT-CLOUD BLOB",
        budget: `${activePointCount.toLocaleString()} Fibonacci Vertices · WebGL 1/2 Active`,
        summary:
          "Displaces uniformly spaced Fibonacci sphere points along outward normals using 3D Simplex Noise + divergence-free Curl Turbulence, with cyan (#4DA8FF) -> violet (#B388F5) rim shading and radial cursor repulsion.",
      };
    }
    if (sceneMode === "s2") {
      return {
        code: "S2 // TOPOGRAPHIC CONTOUR SPHERE",
        budget: `${isMobilePreset ? "5,120" : "20,480"} Split-Aware Tris · WebGL 1/2 Active`,
        summary:
          "Evaluates multi-octave 3D Simplex elevation in the fragment shader and traces anti-aliased monochrome isolines via fract(h * uContourCount) + screen-space fwidth(). Pre-classified non-indexed triangles avoid seam stretching on split.",
      };
    }
    return {
      code: "S1 -> S2 // SCROLL MORPH TRANSITION",
      budget: "Co-rendered S1 + S2 Handover · Max 2 WebGL Effects Budget",
      summary:
        "Demonstrates how scrolling dampens S1 curl displacement while snapping point size along topographic elevation bands before cross-fading cleanly into S2.",
    };
  }, [activePointCount, isMobilePreset, sceneMode]);

  const fallbackNode =
    sceneMode === "s2" ? (
      <ContourSphereFallback split={s2Values.splitProgress > 0.2} />
    ) : (
      <HeroBlobFallback />
    );

  return (
    <main id="main-content" className={styles.labShell}>
      <div className={styles.levaWrapper}>
        <Leva
          fill
          collapsed={isNarrowViewport || isMobilePreset}
          oneLineLabels={false}
          titleBar={{ title: "SIGNAL // SHADER UNIFORMS", drag: false }}
          theme={{
            colors: {
              elevation1: "#07080B",
              elevation2: "#101218",
              elevation3: "#191D26",
              accent1: "#4DA8FF",
              accent2: "#FF5B1F",
              accent3: "#B388F5",
              highlight1: "#8A90A0",
              highlight2: "#F3F5F9",
              highlight3: "#FFFFFF",
            },
            fonts: {
              mono: "var(--font-geist-mono), monospace",
              sans: "var(--font-geist-sans), sans-serif",
            },
          }}
        />
      </div>

      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Back</span>
          </Link>
          <div className={styles.titleBlock}>
            <span className={styles.hudTag}>PHASE 3.5 // SHADER LAB</span>
            <h1 className={styles.title}>S1 &amp; S2 Interactive Verification</h1>
          </div>
        </div>

        <nav className={styles.controlsStrip} aria-label="Shader Lab quick controls">
          <div className={styles.segmented} role="group" aria-label="Active shader">
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "s1" ? styles.active : ""}`}
              onClick={() => {
                setSceneMode("s1");
                setS1Values({ scrollMorph: 0 });
              }}
            >
              S1 Blob
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "s2" ? styles.active : ""}`}
              onClick={() => setSceneMode("s2")}
            >
              S2 Sphere
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "morph" ? styles.active : ""}`}
              onClick={() => {
                setSceneMode("morph");
                setS1Values({ scrollMorph: 0.65 });
              }}
            >
              S1 → S2 Morph
            </button>
          </div>

          <div className={styles.segmented} role="group" aria-label="Device profile">
            <button
              type="button"
              className={`${styles.segBtn} ${presetTier === "desktop" ? styles.active : ""}`}
              onClick={() => setPresetTier("desktop")}
            >
              Desktop 55k
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${presetTier === "mid" ? styles.active : ""}`}
              onClick={() => setPresetTier("mid")}
            >
              Mid 25k
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${presetTier === "mobile" ? styles.active : ""}`}
              onClick={() => setPresetTier("mobile")}
            >
              Mobile 12k
            </button>
          </div>

          {sceneMode === "s2" && (
            <button
              type="button"
              className={`${styles.toggleBtn} ${
                s2Values.splitProgress > 0.2 ? styles.toggleSignal : ""
              }`}
              onClick={() =>
                setS2Values({ splitProgress: s2Values.splitProgress > 0.2 ? 0 : 0.85 })
              }
            >
              <Layers size={14} aria-hidden="true" />
              <span>{s2Values.splitProgress > 0.2 ? "Close Sphere" : "Split S2"}</span>
            </button>
          )}

          <button
            type="button"
            className={`${styles.toggleBtn} ${forceFallback ? styles.toggleSignal : ""}`}
            onClick={() => setForceFallback((prev) => !prev)}
          >
            <Eye size={14} aria-hidden="true" />
            <span>{forceFallback ? "Fallback ON" : "Static Fallback"}</span>
          </button>

          <button
            type="button"
            className={`${styles.toggleBtn} ${
              forceReducedMotion ? styles.toggleSignal : ""
            }`}
            onClick={() => setForceReducedMotion((prev) => !prev)}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>{forceReducedMotion ? "Reduced Motion" : "Motion Full"}</span>
          </button>
        </nav>
      </header>

      <section
        className={`${styles.stageFrame} ${
          isMobilePreset ? styles.mobilePreviewFrame : ""
        }`}
        aria-label="Shader preview canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className={styles.stageCornerTL} aria-hidden="true" />
        <div className={styles.stageCornerTR} aria-hidden="true" />
        <div className={styles.stageCornerBL} aria-hidden="true" />
        <div className={styles.stageCornerBR} aria-hidden="true" />

        {!showFallback ? (
          <CanvasErrorBoundary fallback={fallbackNode}>
            <Canvas
              camera={{ position: [0, 0, isMobilePreset ? 6.8 : 4.9], fov: 42 }}
              dpr={isMobilePreset ? [1, 1.5] : [1, 2]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
              onCreated={({ gl }) => {
                canvasElementRef.current = gl.domElement;
              }}
              aria-hidden="true"
            >
              <LabCameraRig isMobilePreset={isMobilePreset} />
              {sceneMode === "s1" && (
                <HeroBlob
                  tier={effectiveTier}
                  isMobile={isMobilePreset}
                  reducedMotion={effectiveReducedMotion}
                  labOverrides={{
                    pointCount: activePointCount,
                    displacementAmp: s1Values.displacementAmp,
                    noiseFreq: s1Values.noiseFreq,
                    curlMix: s1Values.curlMix,
                    basePointSize: s1Values.basePointSize,
                    pointerStrength: s1Values.pointerStrength,
                    scroll: s1Values.scrollMorph,
                    opacity: s1Values.opacity,
                    colorCyan: s1Values.colorCyan,
                    colorViolet: s1Values.colorViolet,
                  }}
                />
              )}

              {sceneMode === "s2" && (
                <ContourSphere
                  tier={effectiveTier}
                  isMobile={isMobilePreset}
                  reducedMotion={effectiveReducedMotion}
                  labOverrides={{
                    noiseScale: s2Values.noiseScale,
                    displacementAmp: s2Values.displacementAmp,
                    contourCount: s2Values.contourCount,
                    lineWidth: s2Values.lineWidth,
                    splitProgress: s2Values.splitProgress,
                    splitGap: s2Values.splitGap,
                    lineColor: s2Values.lineColor,
                    bgColor: s2Values.bgColor,
                    accentRim: s2Values.accentRim,
                  }}
                />
              )}

              {sceneMode === "morph" && (
                <>
                  <ContourSphere
                    tier={effectiveTier}
                    isMobile={isMobilePreset}
                    reducedMotion={effectiveReducedMotion}
                    scale={0.84 + s1Values.scrollMorph * 0.16}
                    labOverrides={{
                      noiseScale: s2Values.noiseScale,
                      displacementAmp: s2Values.displacementAmp,
                      contourCount: s2Values.contourCount,
                      lineWidth: s2Values.lineWidth,
                      splitProgress: s2Values.splitProgress,
                      splitGap: s2Values.splitGap,
                      lineColor: s2Values.lineColor,
                      bgColor: s2Values.bgColor,
                      accentRim: s2Values.accentRim,
                    }}
                  />
                  <HeroBlob
                    tier={effectiveTier}
                    isMobile={isMobilePreset}
                    reducedMotion={effectiveReducedMotion}
                    scale={1.06 - s1Values.scrollMorph * 0.08}
                    labOverrides={{
                      pointCount: activePointCount,
                      displacementAmp: s1Values.displacementAmp,
                      noiseFreq: s1Values.noiseFreq,
                      curlMix: s1Values.curlMix,
                      basePointSize: s1Values.basePointSize,
                      pointerStrength: s1Values.pointerStrength,
                      scroll: s1Values.scrollMorph,
                      opacity: Math.max(
                        0.12,
                        s1Values.opacity * (1 - s1Values.scrollMorph * 0.45)
                      ),
                      colorCyan: s1Values.colorCyan,
                      colorViolet: s1Values.colorViolet,
                    }}
                  />
                </>
              )}
            </Canvas>
          </CanvasErrorBoundary>
        ) : (
          fallbackNode
        )}

        <aside className={styles.infoOverlay} aria-label="Active shader summary">
          <div className={styles.infoHeader}>
            <span className={styles.shaderCode}>{activeInfo.code}</span>
            <span className={styles.telemetry}>
              <Cpu size={12} aria-hidden="true" />
              <span>
                DETECTED GPU: {gpuProfile.ready ? gpuProfile.tier.toUpperCase() : "SCAN"} ·{" "}
                <span ref={pointerReadoutRef}>PTR 0.00, 0.00</span>
              </span>
            </span>
          </div>
          <p className={styles.infoBudget}>{activeInfo.budget}</p>
          <p className={styles.infoSummary}>{activeInfo.summary}</p>
          {showFallback && (
            <p className={styles.fallbackNote}>
              Static SVG Fallback Active (
              {contextLost
                ? "WebGL context lost"
                : !gpuProfile.webglSupported
                  ? "WebGL unavailable"
                  : effectiveReducedMotion
                    ? "prefers-reduced-motion"
                    : "manual lab preview"}
              ).
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
