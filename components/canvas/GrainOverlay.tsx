"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { S8_GRAIN_VIGNETTE_SHADERS } from "@/lib/shaders";
import { useSceneStore } from "@/lib/store";

export interface GrainOverlayProps {
  enabled?: boolean;
  grainOpacity?: number;
  vignetteStrength?: number;
}

/**
 * Shader S8 — Lightweight Screen-Space Film Grain & Vignette.
 * Draws a single clip-space quad inside the single `<Canvas>` (no extra postprocessing buffer pass).
 * Automatically mutes on Section 06 `$paper` light surface (`activeSection === "beyond"`).
 */
export function GrainOverlay({
  enabled = true,
  grainOpacity = 0.045,
  vignetteStrength = 0.24,
}: GrainOverlayProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGrainOpacity: { value: grainOpacity },
      uVignetteStrength: { value: vignetteStrength },
    }),
    [grainOpacity, vignetteStrength]
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!enabled || !mat) return;

    const { activeSection } = useSceneStore.getState();
    const isLightSection = activeSection === "beyond";

    mat.uniforms.uTime.value =
      (mat.uniforms.uTime.value as number) + Math.min(delta, 0.05);
    mat.uniforms.uGrainOpacity.value = isLightSection ? 0.015 : grainOpacity;
    mat.uniforms.uVignetteStrength.value = isLightSection ? 0.0 : vignetteStrength;
  });

  if (!enabled) return null;

  return (
    <mesh frustumCulled={false} renderOrder={99}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={S8_GRAIN_VIGNETTE_SHADERS.vertexShader}
        fragmentShader={S8_GRAIN_VIGNETTE_SHADERS.fragmentShader}
        uniforms={initialUniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
