"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { S3_HALFTONE_REVEAL_SHADERS } from "@/lib/shaders";
import { useSceneStore } from "@/lib/store";

export interface ProjectRevealLabOverrides {
  src?: string;
  imageWidth?: number;
  imageHeight?: number;
  dotDensity?: number;
  revealRadius?: number;
  bgColor?: string;
  halftoneTint?: string;
  ringAccent?: string;
}

export interface ProjectRevealProps {
  viewportSelector?: string;
  visible?: boolean;
  reducedMotion?: boolean;
  labOverrides?: ProjectRevealLabOverrides;
}

function createInitialUniforms() {
  return {
    uTexture: { value: null as THREE.Texture | null },
    uPlaneSize: { value: new THREE.Vector2(800, 450) },
    uImageSize: { value: new THREE.Vector2(917, 670) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uRevealRadius: { value: 0.0 },
    uDotDensity: { value: 78.0 },
    uTime: { value: 0.0 },
    uHasTexture: { value: 0.0 },
    uBgColor: { value: new THREE.Color("#07080B") },
    uHalftoneTint: { value: new THREE.Color("#4DA8FF") },
    uRingAccent: { value: new THREE.Color("#FF5B1F") },
  };
}

/**
 * Shader S3 — Interactive Halftone Project Reveal.
 *
 * When mounted inside the persistent `<Canvas>` with `viewportSelector="#projects-s3-stage"`,
 * aligns pixel-accurately to the DOM stage box without triggering React re-renders per frame.
 * Renders an ambient monochrome-cyan halftone matrix at rest that expands into full-color UI
 * around the pointer (`uRevealRadius` modulated via `useSceneStore.projectHover`).
 */
export function ProjectReveal({
  viewportSelector,
  visible = true,
  reducedMotion = false,
  labOverrides,
}: ProjectRevealProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const anchorElRef = useRef<Element | null>(null);
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const loadingSetRef = useRef<Set<string>>(new Set());
  const activeTexSrcRef = useRef<string>("");
  const currentRadiusRef = useRef<number>(0);

  const { size } = useThree();
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const initialUniforms = useMemo(() => createInitialUniforms(), []);

  useEffect(() => {
    const cache = textureCacheRef.current;
    return () => {
      geometry.dispose();
      cache.forEach((tex) => tex.dispose());
      cache.clear();
      useSceneStore.getState().setProjectShaderReady(false);
    };
  }, [geometry]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const shaderMat = materialRef.current;
    if (!mesh || !shaderMat) return;

    const store = useSceneStore.getState();

    if (!visible || reducedMotion) {
      mesh.visible = false;
      if (store.projectShaderReady) {
        store.setProjectShaderReady(false);
      }
      return;
    }

    const uniforms = shaderMat.uniforms;
    const targetSrc = labOverrides?.src ?? store.activeProjectVisualSrc;
    const targetImgW = labOverrides?.imageWidth ?? store.activeProjectVisualSize.width;
    const targetImgH = labOverrides?.imageHeight ?? store.activeProjectVisualSize.height;

    if (targetSrc) {
      const cached = textureCacheRef.current.get(targetSrc);
      if (cached) {
        if (activeTexSrcRef.current !== targetSrc) {
          uniforms.uTexture.value = cached;
          uniforms.uHasTexture.value = 1.0;
          activeTexSrcRef.current = targetSrc;
        }
        if (!store.projectShaderReady) {
          store.setProjectShaderReady(true);
        }
      } else {
        if (store.projectShaderReady) {
          store.setProjectShaderReady(false);
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
      // Lab centered plane filling comfortable 16:9 stage in world coordinates
      const maxH = state.viewport.height * 0.72;
      const maxW = state.viewport.width * 0.78;
      const targetAspect = 16 / 9;
      let worldW = maxW;
      let worldH = worldW / targetAspect;
      if (worldH > maxH) {
        worldH = maxH;
        worldW = worldH * targetAspect;
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
    uniforms.uTime.value = (uniforms.uTime.value as number) + clampedDelta;
    (uniforms.uImageSize.value as THREE.Vector2).set(targetImgW, targetImgH);

    // Pointer tracking
    if (viewportSelector) {
      (uniforms.uMouse.value as THREE.Vector2).set(store.projectUV.x, store.projectUV.y);
      const hoverMode = store.projectHover;
      const targetRadius = hoverMode >= 2 ? 1.45 : hoverMode >= 1 ? 0.54 : 0.0;
      currentRadiusRef.current = THREE.MathUtils.lerp(
        currentRadiusRef.current,
        targetRadius,
        Math.min(1, clampedDelta * 9)
      );
      uniforms.uRevealRadius.value = currentRadiusRef.current;
    } else {
      const labUvX = store.pointer.x * 0.5 + 0.5;
      const labUvY = store.pointer.y * 0.5 + 0.5;
      (uniforms.uMouse.value as THREE.Vector2).set(labUvX, labUvY);
      const desired = labOverrides?.revealRadius ?? 0.45;
      currentRadiusRef.current = THREE.MathUtils.lerp(
        currentRadiusRef.current,
        desired,
        Math.min(1, clampedDelta * 9)
      );
      uniforms.uRevealRadius.value = currentRadiusRef.current;
    }

    uniforms.uDotDensity.value = labOverrides?.dotDensity ?? 78.0;
    if (labOverrides?.bgColor) {
      (uniforms.uBgColor.value as THREE.Color).set(labOverrides.bgColor);
    }
    if (labOverrides?.halftoneTint) {
      (uniforms.uHalftoneTint.value as THREE.Color).set(labOverrides.halftoneTint);
    }
    if (labOverrides?.ringAccent) {
      (uniforms.uRingAccent.value as THREE.Color).set(labOverrides.ringAccent);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} visible={false} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={S3_HALFTONE_REVEAL_SHADERS.vertexShader}
        fragmentShader={S3_HALFTONE_REVEAL_SHADERS.fragmentShader}
        uniforms={initialUniforms}
        depthWrite={false}
      />
    </mesh>
  );
}
