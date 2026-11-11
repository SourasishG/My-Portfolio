"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { TOOLKIT_CONSTELLATION_SHADERS } from "@/lib/shaders";
import { GpuTierLevel, useSceneStore } from "@/lib/store";

export interface ToolkitConstellationProps {
  tier?: GpuTierLevel;
  isMobile?: boolean;
  reducedMotion?: boolean;
  visible?: boolean;
}

function hash01(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function buildConstellationGeometries(count: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count);

  const coords: Array<[number, number, number]> = [];
  for (let i = 0; i < count; i++) {
    const x = (hash01(i, 1) - 0.5) * 9.2;
    const y = (hash01(i, 2) - 0.5) * 5.6;
    const z = (hash01(i, 3) - 0.5) * 2.8 - 0.8;

    const offset = i * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    seeds[i] = hash01(i, 4);
    scales[i] = 0.8 + hash01(i, 5) * 1.45;
    coords.push([x, y, z]);
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pointsGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  pointsGeo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  pointsGeo.computeBoundingSphere();

  // Build restrained architectural nearest-neighbor segments among primary subset
  const linePositions: number[] = [];
  const anchorCount = Math.min(84, count);
  const maxDistSq = 1.25 * 1.25;
  for (let i = 0; i < anchorCount; i++) {
    let links = 0;
    const [ax, ay, az] = coords[i];
    for (let j = i + 1; j < anchorCount; j++) {
      const [bx, by, bz] = coords[j];
      const dx = ax - bx;
      const dy = ay - by;
      const dz = az - bz;
      if (dx * dx + dy * dy + dz * dz < maxDistSq) {
        linePositions.push(ax, ay, az, bx, by, bz);
        links++;
        if (links >= 2) break;
      }
    }
  }

  const linesGeo = new THREE.BufferGeometry();
  linesGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
  );
  linesGeo.computeBoundingSphere();

  return { pointsGeo, linesGeo };
}

function createInitialUniforms() {
  return {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: 1 },
    uActivityBoost: { value: 0 },
    uAccentMix: { value: 0 },
    uOpacity: { value: 0.44 },
    uColorBase: { value: new THREE.Color("#F3F5F9") },
    uColorCore: { value: new THREE.Color("#4DA8FF") },
    uColorExploring: { value: new THREE.Color("#B388F5") },
  };
}

/**
 * Restrained ambient star-lattice constellation rendered strictly behind Section 04 (`#toolkit`)
 * inside the single persistent `<Canvas>`. Paired only with S8 (`GrainOverlay`) to enforce
 * the hard max-2 WebGL shaders budget per viewport.
 */
export function ToolkitConstellation({
  tier = "mid",
  isMobile = false,
  reducedMotion = false,
  visible = false,
}: ToolkitConstellationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  const smoothPtrRef = useRef(new THREE.Vector2(0, 0));
  const smoothAccentRef = useRef(0);
  const smoothBoostRef = useRef(0);

  const { gl } = useThree();
  const nodeCount = isMobile ? 180 : tier === "low" ? 160 : 420;

  const { pointsGeo, linesGeo } = useMemo(
    () => buildConstellationGeometries(nodeCount),
    [nodeCount]
  );

  const initialUniforms = useMemo(() => createInitialUniforms(), []);

  useEffect(() => {
    return () => {
      pointsGeo.dispose();
      linesGeo.dispose();
    };
  }, [linesGeo, pointsGeo]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const shaderMat = shaderMatRef.current;
    const lineMat = lineMatRef.current;
    if (!group || !shaderMat || !lineMat) return;

    if (!visible || reducedMotion) {
      group.visible = false;
      return;
    }

    group.visible = true;
    const clampedDelta = Math.min(delta, 0.05);
    const { pointer, toolkitAccentMix, toolkitPulse } = useSceneStore.getState();

    smoothPtrRef.current.x = THREE.MathUtils.lerp(
      smoothPtrRef.current.x,
      pointer.x,
      Math.min(1, clampedDelta * 5)
    );
    smoothPtrRef.current.y = THREE.MathUtils.lerp(
      smoothPtrRef.current.y,
      pointer.y,
      Math.min(1, clampedDelta * 5)
    );
    smoothAccentRef.current = THREE.MathUtils.lerp(
      smoothAccentRef.current,
      toolkitAccentMix,
      Math.min(1, clampedDelta * 6)
    );
    smoothBoostRef.current = THREE.MathUtils.lerp(
      smoothBoostRef.current,
      toolkitPulse,
      Math.min(1, clampedDelta * 7)
    );

    const uniforms = shaderMat.uniforms;
    uniforms.uTime.value = (uniforms.uTime.value as number) + clampedDelta;
    (uniforms.uPointer.value as THREE.Vector2).copy(smoothPtrRef.current);
    uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), isMobile ? 1.5 : 2);
    uniforms.uAccentMix.value = smoothAccentRef.current;
    uniforms.uActivityBoost.value = smoothBoostRef.current;

    // Synchronize restrained lattice wireframe opacity and subtle cyan/violet tint
    lineMat.color.set("#4DA8FF").lerp(new THREE.Color("#B388F5"), smoothAccentRef.current);
    lineMat.opacity = 0.075 + smoothBoostRef.current * 0.055;

    group.rotation.y = smoothPtrRef.current.x * 0.045;
    group.rotation.x = -smoothPtrRef.current.y * 0.03;
  });

  return (
    <group ref={groupRef} visible={false}>
      <points geometry={pointsGeo} frustumCulled={false}>
        <shaderMaterial
          ref={shaderMatRef}
          vertexShader={TOOLKIT_CONSTELLATION_SHADERS.vertexShader}
          fragmentShader={TOOLKIT_CONSTELLATION_SHADERS.fragmentShader}
          uniforms={initialUniforms}
          transparent
          depthWrite={false}
        />
      </points>

      <lineSegments geometry={linesGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={lineMatRef}
          color="#4DA8FF"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
