"use client";

import { useEffect, useState } from "react";
import { getGPUTier } from "detect-gpu";
import { GpuTierLevel, useSceneStore } from "@/lib/store";

export interface GpuProfile {
  tier: GpuTierLevel;
  webglSupported: boolean;
  webglViable: boolean;
  isMobile: boolean;
  ready: boolean;
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Classifies client GPU capability asynchronously via `detect-gpu` so scenes
 * degrade gracefully from full particle density -> reduced density -> static SVG/image fallbacks.
 */
export function useGpuTier(): GpuProfile {
  const setStoreTier = useSceneStore((s) => s.setGpuTier);
  const [profile, setProfile] = useState<GpuProfile>({
    tier: "mid",
    webglSupported: true,
    webglViable: true,
    isMobile: false,
    ready: false,
  });

  useEffect(() => {
    let active = true;

    async function probe(): Promise<void> {
      const supported = checkWebGLSupport();
      if (!supported) {
        await Promise.resolve();
        if (!active) return;
        setStoreTier("low");
        setProfile({
          tier: "low",
          webglSupported: false,
          webglViable: false,
          isMobile: window.innerWidth < 768,
          ready: true,
        });
        return;
      }

      try {
        const result = await getGPUTier();
        if (!active) return;

        // Tier 0 / BLOCKLISTED / <15 FPS hardware cannot sustain smooth interactive WebGL.
        // FALLBACK (e.g. benchmark CDN blocked or unlisted GPU) keeps safe mid density if WebGL works.
        const isBenchmarkedFail =
          result.type === "BLOCKLISTED" ||
          result.type === "WEBGL_UNSUPPORTED" ||
          (result.type === "BENCHMARK" && result.tier === 0);

        let mapped: GpuTierLevel = "mid";
        if (result.type === "FALLBACK") {
          mapped = window.innerWidth < 768 ? "low" : "mid";
        } else if (result.tier >= 3) {
          mapped = "high";
        } else if (result.tier === 2) {
          mapped = "mid";
        } else {
          mapped = "low";
        }

        setStoreTier(mapped);
        setProfile({
          tier: mapped,
          webglSupported: true,
          webglViable: !isBenchmarkedFail,
          isMobile: Boolean(result.isMobile) || window.innerWidth < 768,
          ready: true,
        });
      } catch {
        if (!active) return;
        setStoreTier("mid");
        setProfile({
          tier: "mid",
          webglSupported: true,
          webglViable: true,
          isMobile: window.innerWidth < 768,
          ready: true,
        });
      }
    }

    void probe();

    return () => {
      active = false;
    };
  }, [setStoreTier]);

  return profile;
}
