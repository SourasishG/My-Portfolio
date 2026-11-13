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
import Image from "next/image";
import { Canvas, useThree } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { ArrowLeft, Cpu, Eye, Layers, Sparkles } from "lucide-react";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import {
  ChromeArches,
  ChromeArchesFallback,
} from "@/components/canvas/ChromeArches";
import {
  ContourSphere,
  ContourSphereFallback,
} from "@/components/canvas/ContourSphere";
import {
  GlassObject,
  GlassObjectFallback,
} from "@/components/canvas/GlassObject";
import {
  PortraitHalftone,
  PortraitFallback,
} from "@/components/canvas/PortraitHalftone";
import { ParticleSwarm } from "@/components/canvas/ParticleSwarm";
import {
  getRecommendedHeroPointCount,
  HeroBlob,
  HeroBlobFallback,
} from "@/components/canvas/HeroBlob";
import { ProjectReveal } from "@/components/canvas/ProjectReveal";
import { VelocityPlane } from "@/components/canvas/VelocityPlane";
import { FEATURED_PROJECTS } from "@/content/projects";
import { useGpuTier } from "@/hooks/useGpuTier";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { GpuTierLevel, useSceneStore } from "@/lib/store";
import styles from "./lab.module.scss";

type LabSceneMode =
  | "s1"
  | "s2"
  | "morph"
  | "s3"
  | "s4"
  | "s5"
  | "s7"
  | "portrait"
  | "particles";
type PresetTier = "desktop" | "mid" | "mobile";

const emptySubscribe = () => () => {};

function getUrlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function getInitialSceneMode(): LabSceneMode {
  const qScene = getUrlParam("scene");
  if (
    qScene === "s1" ||
    qScene === "s2" ||
    qScene === "morph" ||
    qScene === "s3" ||
    qScene === "s4" ||
    qScene === "s5" ||
    qScene === "s7" ||
    qScene === "portrait" ||
    qScene === "particles"
  ) {
    return qScene;
  }
  return "portrait";
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

function LabCameraRig({
  isMobilePreset,
  sceneMode,
}: {
  isMobilePreset: boolean;
  sceneMode: LabSceneMode;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const targetZ =
      sceneMode === "portrait"
        ? 4.2
        : isMobilePreset || aspect < 0.85
          ? 7.1
          : 4.9;
    camera.position.set(0, 0, targetZ);
    camera.updateProjectionMatrix();
  }, [camera, isMobilePreset, sceneMode, size.height, size.width]);

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

  const [s3Values] = useControls("S3 — Halftone Reveal", () => ({
    sample: {
      options: ["MUZO", "Office Aid"] as const,
      value: "MUZO" as const,
    },
    dotDensity: { value: 78.0, min: 32.0, max: 130.0, step: 1.0 },
    revealRadius: { value: 0.42, min: 0.0, max: 1.45, step: 0.01 },
    bgColor: "#07080B",
    halftoneTint: "#4DA8FF",
    ringAccent: "#FF5B1F",
  }));

  const [s7Values] = useControls("S7 — Velocity Distortion", () => ({
    velocity: { value: 0.85, min: -1.5, max: 1.5, step: 0.05 },
    rgbShift: { value: 0.014, min: 0.0, max: 0.04, step: 0.001 },
    streakDir: { value: 1.0, min: -1.0, max: 1.0, step: 0.1 },
    paperColor: "#F4F4F2",
    accentColor: "#FF5B1F",
  }));

  const [s5Values] = useControls("S5 — Chrome Fluid Arches", () => ({
    scrollSection: { value: 0.38, min: 0.0, max: 1.0, step: 0.02 },
    roughness: { value: 0.08, min: 0.02, max: 0.45, step: 0.01 },
    metalness: { value: 1.0, min: 0.5, max: 1.0, step: 0.02 },
    rippleAmp: { value: 0.048, min: 0.0, max: 0.14, step: 0.004 },
    envIntensity: { value: 1.45, min: 0.4, max: 2.5, step: 0.05 },
    chromeTint: "#E8EDF5",
  }));

  const [s4Values] = useControls("S4 — Chromatic Glass", () => ({
    chromaticAberration: { value: 0.16, min: 0.0, max: 0.65, step: 0.01 },
    thickness: { value: 0.72, min: 0.05, max: 2.4, step: 0.02 },
    roughness: { value: 0.06, min: 0.0, max: 0.35, step: 0.01 },
    ior: { value: 1.45, min: 1.1, max: 2.2, step: 0.02 },
    distortion: { value: 0.18, min: 0.0, max: 0.85, step: 0.01 },
    anisotropy: { value: 0.14, min: 0.0, max: 0.8, step: 0.02 },
    envIntensity: { value: 1.55, min: 0.5, max: 2.8, step: 0.05 },
    tumbleSpeed: { value: 0.34, min: 0.0, max: 1.2, step: 0.02 },
    tintColor: "#F3F7FF",
  }));

  const [portraitValues] = useControls("E2 — Portrait Halftone (T1/T2)", () => ({
    dotScale: { value: 72.0, min: 25.0, max: 140.0, step: 1.0 },
    depthDisplacement: { value: 0.28, min: 0.0, max: 0.65, step: 0.01 },
    revealRadius: { value: 0.32, min: 0.05, max: 0.8, step: 0.01 },
    dissolve: { value: 0.0, min: 0.0, max: 1.0, step: 0.01 },
    rimStrength: { value: 0.65, min: 0.0, max: 1.5, step: 0.02 },
    showFallback: false,
  }));

  const [particleValues] = useControls("E1 — Particle Swarm (Noise -> Signal)", () => ({
    convergence: { value: 0.0, min: 0.0, max: 1.0, step: 0.01 },
    particleCount: { value: 12000, min: 2000, max: 25000, step: 1000 },
    pointerStrength: { value: 0.5, min: 0.0, max: 1.5, step: 0.05 },
  }));

  const s3SampleScreen = useMemo(() => {
    const projectIndex = s3Values.sample === "Office Aid" ? 1 : 0;
    return FEATURED_PROJECTS[projectIndex].screens[0];
  }, [s3Values.sample]);

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
    forceFallback ||
    contextLost ||
    !gpuProfile.webglSupported ||
    effectiveReducedMotion ||
    (sceneMode === "portrait" && portraitValues.showFallback);

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
        budget: `${isMobilePreset ? "6,144" : "15,360"} Dual-Cap Tris · WebGL 1/2 Active`,
        summary:
          "Evaluates multi-octave 3D Simplex elevation in the fragment shader and traces anti-aliased monochrome isolines via fract(h * uContourCount) + screen-space fwidth(). Aligned spherical hemisphere caps preserve a laser-smooth circular split seam.",
      };
    }
    if (sceneMode === "s3") {
      return {
        code: "S3 // HALFTONE PROJECT REVEAL",
        budget: `1 Textured Plane · fitContainUv (${s3SampleScreen.width}x${s3SampleScreen.height})`,
        summary:
          "Samples center luminance across a crisp square halftone matrix with #4DA8FF highlight tinting and opens an interactive full-color optical lens (`uRevealRadius`) around the cursor.",
      };
    }
    if (sceneMode === "s7") {
      return {
        code: "S7 // SCROLL-VELOCITY DISTORTION",
        budget: "1 Subdivided Quad (12x18) · WebGL 1/2 Active",
        summary:
          "Drives vertex scroll shear, wave displacement, and directional RGB channel split + Swiss orange rim streaks on Section 06 ($paper) proportional to damped Lenis velocity.",
      };
    }
    if (sceneMode === "s5") {
      return {
        code: "S5 // CHROME FLUID ARCHES",
        budget: "4 Catmull-Rom Tube Arches · Procedural PMREM Studio Env",
        summary:
          "Reflective brushed-chrome MeshPhysicalMaterial arches (metalness 1.0, roughness 0.08) with GPU harmonic vertex ripple pivoting smoothly along a scroll-driven camera arc.",
      };
    }
    if (sceneMode === "s4") {
      return {
        code: "S4 // CHROMATIC GLASS OBJECT",
        budget: `Drei MeshTransmissionMaterial (${presetTier === "desktop" ? "6" : "3"} FBO Samples) · IOR ${s4Values.ior.toFixed(2)}`,
        summary:
          "Refractive faceted crystal with chromatic aberration splitting transmitted cyan/violet optical filaments across bevels inside a procedural PMREM studio radiance cage.",
      };
    }
    if (sceneMode === "portrait") {
      return {
        code: "E2 // PORTRAIT HALFTONE (T1 / T2)",
        budget: "2.5D Displacement + Halftone Dot-Screen · Max 1 WebGL Shader",
        summary:
          "Photographic halftone shader with cursor-reactive lens, depth-derived rim light, breathing idle micro-motion, and scroll dissolve into dots.",
      };
    }
    if (sceneMode === "particles") {
      return {
        code: "E1 // PARTICLE SWARM (NOISE -> SIGNAL)",
        budget: `${particleValues.particleCount.toLocaleString()} Instanced Particles · Simplex Curl Noise`,
        summary:
          "Interactive 3D particle field drifting with curl noise, converging into the portrait contour silhouette as convergence progress advances.",
      };
    }
    return {
      code: "S1 -> S2 // SCROLL MORPH TRANSITION",
      budget: "Co-rendered S1 + S2 Handover · Max 2 WebGL Effects Budget",
      summary:
        "Demonstrates how scrolling dampens S1 curl displacement while snapping point size along topographic elevation bands before cross-fading cleanly into S2.",
    };
  }, [activePointCount, isMobilePreset, particleValues.particleCount, presetTier, s3SampleScreen.height, s3SampleScreen.width, s4Values.ior, sceneMode]);

  const fallbackNode =
    sceneMode === "portrait" ? (
      <div style={{ width: "min(72vw, 560px)", aspectRatio: "1 / 1" }}>
        <PortraitFallback />
      </div>
    ) : sceneMode === "s2" ? (
      <ContourSphereFallback split={s2Values.splitProgress > 0.2} />
    ) : sceneMode === "s3" ? (
      <div className={styles.s3FallbackWrap}>
        <div className={styles.s3FallbackFrame}>
          <Image
            src={s3SampleScreen.src}
            alt={s3SampleScreen.alt}
            fill
            sizes="78vw"
            className={styles.s3FallbackImg}
          />
        </div>
      </div>
    ) : sceneMode === "s7" ? (
      <div className={styles.s7FallbackWrap}>
        <div className={styles.s7FallbackFrame}>
          <Image
            src="/images/profile/portrait-alt.jpg"
            alt="Monochrome portrait preview for S7 static fallback"
            fill
            sizes="420px"
            className={styles.s7FallbackImg}
          />
        </div>
      </div>
    ) : sceneMode === "s5" ? (
      <div style={{ width: "min(76vw, 680px)", aspectRatio: "4 / 3" }}>
        <ChromeArchesFallback />
      </div>
    ) : sceneMode === "s4" ? (
      <div style={{ width: "min(72vw, 480px)", aspectRatio: "1 / 1" }}>
        <GlassObjectFallback />
      </div>
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
            <span className={styles.hudTag}>PHASE 3.5 / 4 // SHADER LAB</span>
            <h1 className={styles.title}>S1 – S8 Interactive Verification</h1>
          </div>
        </div>

        <nav className={styles.controlsStrip} aria-label="Shader Lab quick controls">
          <div className={styles.segmented} role="group" aria-label="Active shader">
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "portrait" ? styles.active : ""}`}
              onClick={() => setSceneMode("portrait")}
            >
              Portrait T1/T2
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "particles" ? styles.active : ""}`}
              onClick={() => setSceneMode("particles")}
            >
              E1 Particles
            </button>
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
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "s3" ? styles.active : ""}`}
              onClick={() => setSceneMode("s3")}
            >
              S3 Halftone
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "s7" ? styles.active : ""}`}
              onClick={() => setSceneMode("s7")}
            >
              S7 Velocity
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "s5" ? styles.active : ""}`}
              onClick={() => setSceneMode("s5")}
            >
              S5 Arches
            </button>
            <button
              type="button"
              className={`${styles.segBtn} ${sceneMode === "s4" ? styles.active : ""}`}
              onClick={() => setSceneMode("s4")}
            >
              S4 Glass
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
              <LabCameraRig isMobilePreset={isMobilePreset} sceneMode={sceneMode} />
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

              {sceneMode === "s3" && (
                <ProjectReveal
                  visible
                  reducedMotion={effectiveReducedMotion}
                  labOverrides={{
                    src: s3SampleScreen.src,
                    imageWidth: s3SampleScreen.width,
                    imageHeight: s3SampleScreen.height,
                    dotDensity: s3Values.dotDensity,
                    revealRadius: s3Values.revealRadius,
                    bgColor: s3Values.bgColor,
                    halftoneTint: s3Values.halftoneTint,
                    ringAccent: s3Values.ringAccent,
                  }}
                />
              )}

              {sceneMode === "s7" && (
                <VelocityPlane
                  visible
                  reducedMotion={effectiveReducedMotion}
                  labOverrides={{
                    velocity: s7Values.velocity,
                    rgbShift: s7Values.rgbShift,
                    streakDir: s7Values.streakDir,
                    paperColor: s7Values.paperColor,
                    accentColor: s7Values.accentColor,
                  }}
                />
              )}

              {sceneMode === "s5" && (
                <ChromeArches
                  tier={effectiveTier}
                  isMobile={isMobilePreset}
                  visible
                  reducedMotion={effectiveReducedMotion}
                  labOverrides={{
                    scrollSection: s5Values.scrollSection,
                    roughness: s5Values.roughness,
                    metalness: s5Values.metalness,
                    rippleAmp: s5Values.rippleAmp,
                    envIntensity: s5Values.envIntensity,
                    chromeTint: s5Values.chromeTint,
                  }}
                />
              )}

              {sceneMode === "s4" && (
                <GlassObject
                  tier={effectiveTier}
                  isMobile={isMobilePreset}
                  visible
                  reducedMotion={effectiveReducedMotion}
                  labOverrides={{
                    chromaticAberration: s4Values.chromaticAberration,
                    thickness: s4Values.thickness,
                    roughness: s4Values.roughness,
                    ior: s4Values.ior,
                    distortion: s4Values.distortion,
                    anisotropy: s4Values.anisotropy,
                    envIntensity: s4Values.envIntensity,
                    tumbleSpeed: s4Values.tumbleSpeed,
                    tintColor: s4Values.tintColor,
                  }}
                />
              )}

              {sceneMode === "portrait" && (
                <PortraitHalftone
                  dotScale={portraitValues.dotScale}
                  depthDisplacement={portraitValues.depthDisplacement}
                  revealRadius={portraitValues.revealRadius}
                  dissolve={portraitValues.dissolve}
                  rimStrength={portraitValues.rimStrength}
                />
              )}

              {sceneMode === "particles" && (
                <ParticleSwarm
                  particleCount={particleValues.particleCount}
                  convergence={particleValues.convergence}
                  pointerStrength={particleValues.pointerStrength}
                />
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
              Static Fallback Preview Active (
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
