"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { S7_VELOCITY_DISTORTION_SHADERS } from "@/lib/shaders";
import { useSceneStore } from "@/lib/store";

const DEFAULT_PORTRAIT_SRC = "/images/profile/portrait-alt.jpg";
const DEFAULT_PORTRAIT_W = 768;
const DEFAULT_PORTRAIT_H = 1024;

export interface VelocityPlaneLabOverrides {
  src?: string;
  imageWidth?: number;
  imageHeight?: number;
  velocity?: number;
  rgbShift?: number;
  streakDir?: number;
  paperColor?: string;
  accentColor?: string;
}

export interface VelocityPlaneProps {
  viewportSelector?: string;
  visible?: boolean;
  reducedMotion?: boolean;
  labOverrides?: VelocityPlaneLabOverrides;
}

function createInitialUniforms() {
  return {
    uTexture: { value: null as THREE.Texture | null },
    uPlaneSize: { value: new THREE.Vector2(420, 560) },
    uImageSize: { value: new THREE.Vector2(DEFAULT_PORTRAIT_W, DEFAULT_PORTRAIT_H) },
    uVelocity: { value: 0.0 },
    uRgbShift: { value: 0.011 },
    uStreakDir: { value: 1.0 },
    uTime: { value: 0.0 },
    uHasTexture: { value: 0.0 },
    uPaperColor: { value: new THREE.Color("#F4F4F2") },
    uAccentColor: { value: new THREE.Color("#FF5B1F") },
  };
}

/**
 * Shader S7 — Scroll-Velocity Distortion Plane.
 *
 * Aligns inside the single persistent `<Canvas>` to `#beyond-s7-stage` (Section 06
 * `$paper` band) without React state updates per frame. Reads `useSceneStore.velocity`
 * inside `useFrame` to subtly bend, RGB-split, and streak-tint the monochrome portrait
 * proportionally to scroll momentum.
 */
export function VelocityPlane({
  viewportSelector,
  visible = true,
  reducedMotion = false,
  labOverrides,
}: VelocityPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const anchorElRef = useRef<Element | null>(null);
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const loadingSetRef = useRef<Set<string>>(new Set());
  const activeTexSrcRef = useRef<string>("");
  const smoothedVelRef = useRef<number>(0);

  const { size } = useThree();
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 12, 18), []);
  const initialUniforms = useMemo(() => createInitialUniforms(), []);

  useEffect(() => {
    const cache = textureCacheRef.current;
    return () => {
      geometry.dispose();
      cache.forEach((tex) => tex.dispose());
      cache.clear();
      useSceneStore.getState().setVelocityShaderReady(false);
    };
  }, [geometry]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const shaderMat = materialRef.current;
    if (!mesh || !shaderMat) return;

    const store = useSceneStore.getState();

    if (!visible || reducedMotion) {
      mesh.visible = false;
      if (store.velocityShaderReady) {
        store.setVelocityShaderReady(false);
      }
      return;
    }

    const uniforms = shaderMat.uniforms;
    const targetSrc = labOverrides?.src ?? DEFAULT_PORTRAIT_SRC;
    const targetImgW = labOverrides?.imageWidth ?? DEFAULT_PORTRAIT_W;
    const targetImgH = labOverrides?.imageHeight ?? DEFAULT_PORTRAIT_H;

    if (targetSrc) {
      const cached = textureCacheRef.current.get(targetSrc);
      if (cached) {
        if (activeTexSrcRef.current !== targetSrc) {
          uniforms.uTexture.value = cached;
          uniforms.uHasTexture.value = 1.0;
          activeTexSrcRef.current = targetSrc;
        }
        if (!store.velocityShaderReady) {
          store.setVelocityShaderReady(true);
        }
      } else {
        if (store.velocityShaderReady) {
          store.setVelocityShaderReady(false);
        }
        if (!loadingSetRef.current.has(targetSrc)) {
          loadingSetRef.current.add(targetSrc);
          const loader = new THREE.TextureLoader();
          loader.load(
            targetSrc,
            (loadedTex) => {
              loadedTex.colorSpace = THREE.SRGBColorSpace;
              loadedTex.minFilter = THREE.LinearFilter;
              loadedTex.magFilter = THREE.LinearFilter;
              loadedTex.generateMipmaps = false;
              textureCacheRef.current.set(targetSrc, loadedTex);
              loadingSetRef.current.delete(targetSrc);
            },
            undefined,
            () => {
              loadingSetRef.current.delete(targetSrc);
            }
          );
        }
      }
    }

    if (viewportSelector) {
      if (!anchorElRef.current || !anchorElRef.current.isConnected) {
        anchorElRef.current = document.querySelector(viewportSelector);
      }
      const el = anchorElRef.current;
      if (!el) {
        mesh.visible = false;
        return;
      }

      const rect = el.getBoundingClientRect();
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);

      if (rect.width <= 0 || rect.height <= 0 || rect.bottom <= 0 || rect.top >= vh) {
        mesh.visible = false;
        return;
      }

      const worldW = (rect.width / vw) * state.viewport.width;
      const worldH = (rect.height / vh) * state.viewport.height;
      const worldX = ((rect.left + rect.width * 0.5) / vw - 0.5) * state.viewport.width;
      const worldY = (0.5 - (rect.top + rect.height * 0.5) / vh) * state.viewport.height;

      mesh.position.set(worldX, worldY, 0);
      mesh.scale.set(worldW, worldH, 1);
      mesh.visible = uniforms.uHasTexture.value > 0.5;
      (uniforms.uPlaneSize.value as THREE.Vector2).set(rect.width, rect.height);
    } else {
      // Lab centered editorial portrait frame (~5:7 aspect)
      const maxH = state.viewport.height * 0.72;
      const maxW = state.viewport.width * 0.55;
      const targetAspect = 0.72;
      let worldH = maxH;
      let worldW = worldH * targetAspect;
      if (worldW > maxW) {
        worldW = maxW;
        worldH = worldW / targetAspect;
      }

      mesh.position.set(0, 0, 0);
      mesh.scale.set(worldW, worldH, 1);
      mesh.visible = uniforms.uHasTexture.value > 0.5;
      (uniforms.uPlaneSize.value as THREE.Vector2).set(
        (worldW / Math.max(0.01, state.viewport.width)) * size.width,
        (worldH / Math.max(0.01, state.viewport.height)) * size.height
      );
    }

    const clampedDelta = Math.min(delta, 0.05);
    const targetVelocity =
      labOverrides?.velocity !== undefined ? labOverrides.velocity : store.velocity;

    smoothedVelRef.current = THREE.MathUtils.lerp(
      smoothedVelRef.current,
      targetVelocity,
      1 - Math.exp(-10 * clampedDelta)
    );

    uniforms.uTime.value = (uniforms.uTime.value as number) + clampedDelta;
    uniforms.uVelocity.value = smoothedVelRef.current;
    uniforms.uRgbShift.value = labOverrides?.rgbShift ?? 0.011;
    uniforms.uStreakDir.value = labOverrides?.streakDir ?? 1.0;
    (uniforms.uImageSize.value as THREE.Vector2).set(targetImgW, targetImgH);

    if (labOverrides?.paperColor) {
      (uniforms.uPaperColor.value as THREE.Color).set(labOverrides.paperColor);
    }
    if (labOverrides?.accentColor) {
      (uniforms.uAccentColor.value as THREE.Color).set(labOverrides.accentColor);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} visible={false} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={S7_VELOCITY_DISTORTION_SHADERS.vertexShader}
        fragmentShader={S7_VELOCITY_DISTORTION_SHADERS.fragmentShader}
        uniforms={initialUniforms}
        depthWrite={false}
      />
    </mesh>
  );
}
