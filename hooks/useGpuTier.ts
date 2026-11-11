"use client";

import { useEffect, useState } from "react";
import { getGPUTier } from "detect-gpu";
import { GpuTierLevel, useSceneStore } from "@/lib/store";

export interface GpuProfile {
  tier: GpuTierLevel;
  webglSupported: boolean;
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
 * Classifies client GPU capability using `detect-gpu` so scenes degrade
 * cleanly from full particle density -> reduced density -> static SVG/image fallbacks.
 */
export function useGpuTier(): GpuProfile {
  const setStoreTier = useSceneStore((s) => s.setGpuTier);
  const [profile, setProfile] = useState<GpuProfile>({
    tier: "mid",
    webglSupported: true,
    isMobile: false,
    ready: false,
  });

  useEffect(() => {
    let active = true;
    const supported = checkWebGLSupport();

    if (!supported) {
      setStoreTier("low");
      setProfile({
        tier: "low",
        webglSupported: false,
        isMobile: window.innerWidth < 768,
        ready: true,
      });
      return;
    }

    getGPUTier()
      .then((result) => {
        if (!active) return;
        let mapped: GpuTierLevel = "mid";
        if (result.tier >= 3) mapped = "high";
        else if (result.tier === 2) mapped = "mid";
        else mapped = "low";

        setStoreTier(mapped);
        setProfile({
          tier: mapped,
          webglSupported: true,
          isMobile: Boolean(result.isMobile) || window.innerWidth < 768,
          ready: true,
        });
      })
      .catch(() => {
        if (!active) return;
        setStoreTier("mid");
        setProfile({
          tier: "mid",
          webglSupported: true,
          isMobile: window.innerWidth < 768,
          ready: true,
        });
      });

    return () => {
      active = false;
    };
  }, [setStoreTier]);

  return profile;
}
