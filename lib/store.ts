import { create } from "zustand";

export type GpuTierLevel = "high" | "mid" | "low";
export type SectionId =
  | "hero"
  | "about"
  | "projects"
  | "toolkit"
  | "journey"
  | "beyond"
  | "aspirations"
  | "contact";

interface SceneState {
  // High-frequency values: ALWAYS mutate or read via useSceneStore.getState() in useFrame.
  // Never subscribe React UI components to scrollProgress / velocity / pointer.
  scrollY: number;
  scrollProgress: number; // 0..1 across full document
  velocity: number; // Normalized Lenis scroll velocity
  pointer: { x: number; y: number }; // Normalized -1..1 viewport coordinates
  heroMorph: number; // 0 (S1 hero point cloud) -> 1 (S2 contour morph)
  aboutSplit: number; // 0..1 circular cross-section split inside Section 02
  activeProjectVisualSrc: string;
  activeProjectVisualSize: { width: number; height: number };
  projectUV: { x: number; y: number }; // Normalized [0..1] pointer inside #projects-s3-stage
  projectHover: number; // 0 resting halftone -> 1 interactive lens -> 2 full-color lock
  projectShaderReady: boolean;
  velocityShaderReady: boolean;
  toolkitAccentMix: number; // 0 ($cyan Core Stack) -> 1 ($violet Currently Exploring)
  toolkitPulse: number; // 0..1 gentle interactive glow boost
  activeSection: SectionId;
  gpuTier: GpuTierLevel;
  webglFailed: boolean;
  useStaticFallback: boolean;
  preloaderDone: boolean;

  setScrollState: (scrollY: number, scrollProgress: number, velocity: number) => void;
  setPointer: (x: number, y: number) => void;
  setHeroMorph: (morph: number) => void;
  setAboutSplit: (split: number) => void;
  setProjectVisual: (src: string, width: number, height: number) => void;
  setProjectPointer: (x: number, y: number, hover: number) => void;
  setProjectShaderReady: (ready: boolean) => void;
  setVelocityShaderReady: (ready: boolean) => void;
  setToolkitVisual: (accentMix: number, pulse: number) => void;
  setActiveSection: (section: SectionId) => void;
  setGpuTier: (tier: GpuTierLevel) => void;
  setWebglFailed: (failed: boolean) => void;
  setUseStaticFallback: (fallback: boolean) => void;
  setPreloaderDone: (done: boolean) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  scrollY: 0,
  scrollProgress: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
  heroMorph: 0,
  aboutSplit: 0,
  activeProjectVisualSrc: "/images/projects/muzo/screenshot-01.jpg",
  activeProjectVisualSize: { width: 917, height: 670 },
  projectUV: { x: 0.5, y: 0.5 },
  projectHover: 0,
  projectShaderReady: false,
  velocityShaderReady: false,
  toolkitAccentMix: 0,
  toolkitPulse: 0,
  activeSection: "hero",
  gpuTier: "mid",
  webglFailed: false,
  useStaticFallback: false,
  preloaderDone: false,

  setScrollState: (scrollY, scrollProgress, velocity) => {
    const state = get();
    state.scrollY = scrollY;
    state.scrollProgress = scrollProgress;
    state.velocity = velocity;
  },

  setPointer: (x, y) => {
    const state = get();
    state.pointer.x = x;
    state.pointer.y = y;
  },

  setHeroMorph: (morph) => {
    get().heroMorph = morph;
  },

  setAboutSplit: (split) => {
    get().aboutSplit = split;
  },

  setProjectVisual: (src, width, height) => {
    const state = get();
    state.activeProjectVisualSrc = src;
    state.activeProjectVisualSize.width = width;
    state.activeProjectVisualSize.height = height;
  },

  setProjectPointer: (x, y, hover) => {
    const state = get();
    state.projectUV.x = x;
    state.projectUV.y = y;
    state.projectHover = hover;
  },

  setProjectShaderReady: (projectShaderReady) => {
    if (get().projectShaderReady !== projectShaderReady) {
      set({ projectShaderReady });
    }
  },

  setVelocityShaderReady: (velocityShaderReady) => {
    if (get().velocityShaderReady !== velocityShaderReady) {
      set({ velocityShaderReady });
    }
  },

  setToolkitVisual: (accentMix, pulse) => {
    const state = get();
    state.toolkitAccentMix = accentMix;
    state.toolkitPulse = pulse;
  },

  setActiveSection: (activeSection) => {
    if (get().activeSection !== activeSection) {
      set({ activeSection });
    }
  },

  setGpuTier: (gpuTier) => {
    if (get().gpuTier !== gpuTier) {
      set({ gpuTier });
    }
  },

  setWebglFailed: (webglFailed) => {
    if (get().webglFailed !== webglFailed) {
      set({ webglFailed });
    }
  },

  setUseStaticFallback: (useStaticFallback) => {
    if (get().useStaticFallback !== useStaticFallback) {
      set({ useStaticFallback });
    }
  },

  setPreloaderDone: (preloaderDone) => {
    if (get().preloaderDone !== preloaderDone) {
      set({ preloaderDone });
    }
  },
}));
