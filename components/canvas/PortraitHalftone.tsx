"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "@/shaders/e2PortraitHalftone.vert.glsl";
import fragmentShader from "@/shaders/e2PortraitHalftone.frag.glsl";
import { useSceneStore } from "@/lib/store";
import styles from "./PortraitHalftone.module.scss";

export interface PortraitHalftoneProps {
  textureSrc?: string;
  depthSrc?: string;
  dotScale?: number;
  depthDisplacement?: number;
  revealRadius?: number;
  dissolve?: number;
  rimStrength?: number;
  interactivePointer?: boolean;
  viewportSelector?: string;
  visible?: boolean;
}

export function PortraitHalftone({
  textureSrc = "/images/profile/portrait-bw.webp",
  depthSrc = "/images/profile/portrait-depth.png",
  dotScale = 72,
  depthDisplacement = 0.28,
  revealRadius = 0.32,
  dissolve = 0,
  rimStrength = 0.65,
  interactivePointer = true,
  viewportSelector,
  visible = true,
}: PortraitHalftoneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const anchorElRef = useRef<HTMLElement | null>(null);
  const { size } = useThree();

  // Load textures with TextureLoader
  const { baseTexture, depthTexture } = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const base = loader.load(textureSrc);
    base.generateMipmaps = true;
    base.minFilter = THREE.LinearMipmapLinearFilter;
    base.magFilter = THREE.LinearFilter;

    const depth = loader.load(depthSrc);
    depth.generateMipmaps = false;
    depth.minFilter = THREE.LinearFilter;
    depth.magFilter = THREE.LinearFilter;

    return { baseTexture: base, depthTexture: depth };
  }, [textureSrc, depthSrc]);

  // Clean up textures on unmount
  useEffect(() => {
    return () => {
      baseTexture.dispose();
      depthTexture.dispose();
    };
  }, [baseTexture, depthTexture]);

  // Plane geometry with fine subdivisions for T2 vertex displacement
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(1, 1, 96, 96);
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Uniforms dictionary
  const uniforms = useMemo(() => {
    return {
      uTexture: { value: baseTexture },
      uDepthMap: { value: depthTexture },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uRevealRadius: { value: revealRadius },
      uDotScale: { value: dotScale },
      uDotMinRadius: { value: 0.035 },
      uDotMaxRadius: { value: 0.46 },
      uDepthDisplacement: { value: depthDisplacement },
      uDissolve: { value: dissolve },
      uInkColor: { value: new THREE.Color("#07080A") },
      uDotColor: { value: new THREE.Color("#F4F2EE") },
      uRimColor: { value: new THREE.Color("#4DA8FF") },
      uRimStrength: { value: rimStrength },
      uTime: { value: 0 },
    };
  }, [baseTexture, depthTexture, size.width, size.height, revealRadius, dotScale, depthDisplacement, dissolve, rimStrength]);

  // Update uniforms when props change
  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uRevealRadius.value = revealRadius;
    materialRef.current.uniforms.uDotScale.value = dotScale;
    materialRef.current.uniforms.uDepthDisplacement.value = depthDisplacement;
    materialRef.current.uniforms.uDissolve.value = dissolve;
    materialRef.current.uniforms.uRimStrength.value = rimStrength;
  }, [revealRadius, dotScale, depthDisplacement, dissolve, rimStrength]);

  // Track target pointer smoothly
  const targetPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const currentPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const targetRotation = useRef(new THREE.Vector2(0, 0));

  useFrame((_, delta) => {
    if (!materialRef.current || !groupRef.current) return;

    // Advance continuous time uniform
    materialRef.current.uniforms.uTime.value += delta;

    if (interactivePointer) {
      // Read normalized pointer from scene store (-1..1)
      const storePointer = useSceneStore.getState().pointer;
      // Map to 0..1 UV coordinates
      targetPointer.current.set(storePointer.x * 0.5 + 0.5, 1.0 - (storePointer.y * 0.5 + 0.5));

      // Lerp pointer position smoothly (decay = 0.08)
      currentPointer.current.lerp(targetPointer.current, 0.08);
      materialRef.current.uniforms.uPointer.value.copy(currentPointer.current);

      // T2 3D parallax yaw and pitch (clamped to max ±7 deg yaw, ±5 deg pitch)
      targetRotation.current.x = -storePointer.y * 0.09; // pitch
      targetRotation.current.y = storePointer.x * 0.12;  // yaw

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.06);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.06);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} scale={[2.65, 2.65, 1]}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * High-res accessible static fallback for touch devices, low-tier GPUs,
 * prefers-reduced-motion, or WebGL-disabled environments.
 */
export function PortraitFallback({
  alt = "Portrait of Sourasish Ghosh, Full-Stack Developer",
  priority = false,
}: {
  alt?: string;
  priority?: boolean;
}) {
  return (
    <div className={styles.fallbackContainer} aria-label={alt}>
      <div className={styles.imageWrap}>
        <Image
          src="/images/profile/portrait-bw.webp"
          alt={alt}
          width={1024}
          height={1024}
          priority={priority}
          className={styles.fallbackImage}
        />
        <div className={styles.dotScreenOverlay} aria-hidden="true" />
      </div>
    </div>
  );
}
