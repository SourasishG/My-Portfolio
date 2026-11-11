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
  activeSection: SectionId;
  gpuTier: GpuTierLevel;
  preloaderDone: boolean;

  setScrollState: (scrollY: number, scrollProgress: number, velocity: number) => void;
  setPointer: (x: number, y: number) => void;
  setHeroMorph: (morph: number) => void;
  setActiveSection: (section: SectionId) => void;
  setGpuTier: (tier: GpuTierLevel) => void;
  setPreloaderDone: (done: boolean) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  scrollY: 0,
  scrollProgress: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
  heroMorph: 0,
  activeSection: "hero",
  gpuTier: "mid",
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

  setPreloaderDone: (preloaderDone) => {
    if (get().preloaderDone !== preloaderDone) {
      set({ preloaderDone });
    }
  },
}));
