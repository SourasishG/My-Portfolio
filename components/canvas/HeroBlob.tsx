"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { S1_HERO_BLOB_SHADERS } from "@/lib/shaders";
import { GpuTierLevel, useSceneStore } from "@/lib/store";

export interface HeroBlobLabOverrides {
  pointCount?: number;
  displacementAmp?: number;
  noiseFreq?: number;
  curlMix?: number;
  basePointSize?: number;
  pointerStrength?: number;
  scroll?: number;
  opacity?: number;
  colorCyan?: string;
  colorViolet?: string;
  colorContour?: string;
  autoRotateSpeed?: number;
}

export interface HeroBlobProps {
  tier?: GpuTierLevel;
  isMobile?: boolean;
  reducedMotion?: boolean;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  labOverrides?: HeroBlobLabOverrides;
}

export function getRecommendedHeroPointCount(
  tier: GpuTierLevel,
  isMobile: boolean
): number {
  if (isMobile || tier === "low") return 12_000;
  if (tier === "mid") return 25_000;
  return 55_000;
}

/**
 * Deterministic hash in [0, 1) so point seeds stay pure across React 19 StrictMode mounts.
 */
function deterministicSeed(index: number): number {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Generates an evenly distributed Fibonacci sphere lattice (S^2) avoiding polar bunching.
 */
function buildFibonacciSphereGeometry(
  count: number,
  radius: number
): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const radialSlice = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * radialSlice;
    const z = Math.sin(theta) * radialSlice;

    const offset = i * 3;
    positions[offset] = x * radius;
    positions[offset + 1] = y * radius;
    positions[offset + 2] = z * radius;
    seeds[i] = deterministicSeed(i);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

function createHeroInitialUniforms() {
  return {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPointerStrength: { value: 0.72 },
    uScroll: { value: 0 },
    uDisplacementAmp: { value: 0.34 },
    uNoiseFreq: { value: 1.45 },
    uCurlMix: { value: 0.52 },
    uBasePointSize: { value: 1.9 },
    uPixelRatio: { value: 1 },
    uColorCyan: { value: new THREE.Color("#4DA8FF") },
    uColorViolet: { value: new THREE.Color("#B388F5") },
    uColorContour: { value: new THREE.Color("#F3F5F9") },
    uOpacity: { value: 0.56 },
  };
}

/**
 * Shader S1 — Hero Point-Cloud Blob.
 * Renders a curl-displaced Fibonacci sphere morphing cyan (#4DA8FF) -> violet (#B388F5)
 * with pointer repulsion and seamless scroll alignment toward S2 contours.
 */
export function HeroBlob({
  tier = "high",
  isMobile = false,
  reducedMotion = false,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  labOverrides,
}: HeroBlobProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const glPixelRatio = useThree((state) => state.gl.getPixelRatio());
  const smoothPointerRef = useRef(new THREE.Vector2(0, 0));

  const pointCount =
    labOverrides?.pointCount ?? getRecommendedHeroPointCount(tier, isMobile);

  const geometry = useMemo(
    () => buildFibonacciSphereGeometry(pointCount, 1.48),
    [pointCount]
  );

  const initialUniforms = useMemo(() => createHeroInitialUniforms(), []);

  // Explicitly dispose rebuilt BufferGeometry whenever density tier swaps or on unmount.
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((_, delta) => {
    const shaderMat = materialRef.current;
    if (!visible || !shaderMat) return;

    const clampedDelta = Math.min(delta, 0.05);
    const storeState = useSceneStore.getState();
    const uniforms = shaderMat.uniforms;

    if (!reducedMotion) {
      uniforms.uTime.value = (uniforms.uTime.value as number) + clampedDelta;
    }

    // Smooth transient pointer tracking (zero React re-renders).
    const targetX = storeState.pointer.x;
    const targetY = storeState.pointer.y;
    smoothPointerRef.current.x = THREE.MathUtils.lerp(
      smoothPointerRef.current.x,
      targetX,
      Math.min(1, clampedDelta * 8)
    );
    smoothPointerRef.current.y = THREE.MathUtils.lerp(
      smoothPointerRef.current.y,
      targetY,
      Math.min(1, clampedDelta * 8)
    );
    (uniforms.uPointer.value as THREE.Vector2).copy(smoothPointerRef.current);

    uniforms.uPixelRatio.value = Math.min(glPixelRatio, isMobile ? 1.5 : 2);

    const targetScroll =
      labOverrides?.scroll !== undefined
        ? labOverrides.scroll
        : storeState.heroMorph;
    uniforms.uScroll.value = THREE.MathUtils.lerp(
      uniforms.uScroll.value as number,
      targetScroll,
      Math.min(1, clampedDelta * 10)
    );

    const defaultSize =
      pointCount <= 15_000 ? 3.1 : pointCount <= 30_000 ? 2.45 : 2.1;
    const defaultOpacity =
      pointCount <= 15_000 ? 0.88 : pointCount <= 30_000 ? 0.8 : 0.72;

    uniforms.uDisplacementAmp.value = labOverrides?.displacementAmp ?? 0.34;
    uniforms.uNoiseFreq.value = labOverrides?.noiseFreq ?? 1.45;
    uniforms.uCurlMix.value = labOverrides?.curlMix ?? 0.52;
    uniforms.uBasePointSize.value =
      labOverrides?.basePointSize !== undefined
        ? labOverrides.basePointSize * (pointCount <= 15_000 ? 1.45 : pointCount <= 30_000 ? 1.18 : 1.0)
        : defaultSize;
    uniforms.uPointerStrength.value = reducedMotion
      ? 0
      : (labOverrides?.pointerStrength ?? 0.72);
    uniforms.uOpacity.value =
      labOverrides?.opacity !== undefined
        ? Math.min(1.0, labOverrides.opacity * (pointCount <= 15_000 ? 1.25 : 1.0))
        : defaultOpacity;

    if (labOverrides?.colorCyan) {
      (uniforms.uColorCyan.value as THREE.Color).set(labOverrides.colorCyan);
    }
    if (labOverrides?.colorViolet) {
      (uniforms.uColorViolet.value as THREE.Color).set(labOverrides.colorViolet);
    }
    if (labOverrides?.colorContour) {
      (uniforms.uColorContour.value as THREE.Color).set(labOverrides.colorContour);
    }

    if (pointsRef.current && !reducedMotion) {
      const rotSpeed = labOverrides?.autoRotateSpeed ?? 0.055;
      pointsRef.current.rotation.y += clampedDelta * rotSpeed;
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        smoothPointerRef.current.y * 0.14,
        Math.min(1, clampedDelta * 4)
      );
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      position={position}
      scale={scale}
      visible={visible}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={S1_HERO_BLOB_SHADERS.vertexShader}
        fragmentShader={S1_HERO_BLOB_SHADERS.fragmentShader}
        uniforms={initialUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Static accessible fallback rendered when GPU tier is too low, WebGL is blocked,
 * or `prefers-reduced-motion: reduce` disables real-time shaders.
 */
export function HeroBlobFallback({
  className,
  label = "Static neural topology illustration",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 52% 48%, rgba(77, 168, 255, 0.16) 0%, rgba(179, 136, 245, 0.1) 36%, rgba(0, 0, 0, 0) 68%)",
      }}
    >
      <svg
        viewBox="0 0 420 420"
        style={{ width: "min(76%, 440px)", height: "auto" }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="s1FallbackGlow" cx="48%" cy="46%" r="54%">
            <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#B388F5" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#B388F5" stopOpacity="0.06" />
          </radialGradient>
        </defs>
        <circle
          cx="210"
          cy="210"
          r="156"
          fill="none"
          stroke="url(#s1FallbackGlow)"
          strokeWidth="1.25"
          strokeDasharray="2 7"
        />
        <circle
          cx="210"
          cy="210"
          r="128"
          fill="none"
          stroke="#4DA8FF"
          strokeOpacity="0.65"
          strokeWidth="1.2"
          strokeDasharray="1.5 6"
        />
        <circle
          cx="210"
          cy="210"
          r="96"
          fill="none"
          stroke="#B388F5"
          strokeOpacity="0.6"
          strokeWidth="1.15"
          strokeDasharray="1.5 5.5"
        />
        <circle
          cx="210"
          cy="210"
          r="62"
          fill="none"
          stroke="#F3F5F9"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeDasharray="1 5"
        />
        <path
          d="M66 196 Q 152 132 222 188 T 356 220"
          fill="none"
          stroke="#4DA8FF"
          strokeOpacity="0.65"
          strokeWidth="1.2"
          strokeDasharray="2 5"
        />
        <path
          d="M84 244 Q 178 186 248 232 T 340 184"
          fill="none"
          stroke="#B388F5"
          strokeOpacity="0.65"
          strokeWidth="1.2"
          strokeDasharray="2 5"
        />
      </svg>
    </div>
  );
}
