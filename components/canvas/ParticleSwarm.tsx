"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "@/shaders/e1ParticleSwarm.vert.glsl";
import fragmentShader from "@/shaders/e1ParticleSwarm.frag.glsl";
import { useSceneStore } from "@/lib/store";

export interface ParticleSwarmProps {
  particleCount?: number;
  convergence?: number; // 0 = random noise cloud, 1 = converged to silhouette
  pointerStrength?: number;
}

/** Pure deterministic pseudo-random generator satisfying React 19 purity rules */
function seededRandom(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function ParticleSwarm({
  particleCount = 12000,
  convergence = 0,
  pointerStrength = 0.5,
}: ParticleSwarmProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const { geometry, uniforms } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const targets = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // 1. Initial drift cloud: deterministic spherical volume
      const u = seededRandom(i, 1);
      const v = seededRandom(i, 2);
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(seededRandom(i, 3)) * 2.2;

      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.7;

      // 2. Converged target silhouette: head & shoulders outline
      const tAngle = seededRandom(i, 4) * Math.PI * 2;
      const isHead = seededRandom(i, 5) > 0.35;
      if (isHead) {
        // Oval head shape
        const hr = 0.55 + seededRandom(i, 6) * 0.25;
        targets[i * 3 + 0] = Math.cos(tAngle) * hr * 0.85;
        targets[i * 3 + 1] = Math.sin(tAngle) * hr * 1.05 + 0.35;
        targets[i * 3 + 2] = (seededRandom(i, 7) - 0.5) * 0.3;
      } else {
        // Shoulders trapezoid
        const sw = (seededRandom(i, 8) - 0.5) * 2.2;
        const sh = -0.5 - seededRandom(i, 9) * 0.8;
        targets[i * 3 + 0] = sw;
        targets[i * 3 + 1] = sh;
        targets[i * 3 + 2] = (seededRandom(i, 10) - 0.5) * 0.3;
      }

      // 3. Seed for size/color variance
      seeds[i] = seededRandom(i, 11);
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const unis = {
      uTime: { value: 0 },
      uConvergence: { value: convergence },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: pointerStrength },
      uBaseSize: { value: 16.0 },
      uPixelRatio: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2) },
    };

    return { geometry: geo, uniforms: unis };
  }, [particleCount, convergence, pointerStrength]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uConvergence.value = convergence;
    materialRef.current.uniforms.uPointerStrength.value = pointerStrength;
  }, [convergence, pointerStrength]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;

    const storePointer = useSceneStore.getState().pointer;
    materialRef.current.uniforms.uPointer.value.set(
      (storePointer.x * viewport.width) / 2,
      (storePointer.y * viewport.height) / 2
    );
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
