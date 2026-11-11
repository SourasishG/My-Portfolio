"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { S2_CONTOUR_SPHERE_SHADERS } from "@/lib/shaders";
import { GpuTierLevel, useSceneStore } from "@/lib/store";

export interface ContourSphereLabOverrides {
  noiseScale?: number;
  displacementAmp?: number;
  contourCount?: number;
  lineWidth?: number;
  splitProgress?: number;
  splitGap?: number;
  lineColor?: string;
  bgColor?: string;
  accentRim?: string;
  autoRotateSpeed?: number;
}

export interface ContourSphereProps {
  tier?: GpuTierLevel;
  isMobile?: boolean;
  reducedMotion?: boolean;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  labOverrides?: ContourSphereLabOverrides;
}

const SPLIT_AXIS = new THREE.Vector3(0.32, 0.92, 0.18).normalize();

/**
 * Builds an un-indexed icosahedron whose triangles are pre-classified onto either side of
 * `SPLIT_AXIS`. Pre-classifying per triangle guarantees zero stretched polygons across
 * the split seam when `uSplitProgress > 0`.
 */
function buildSplitAwareContourSphereGeometry(
  radius: number,
  detail: number
): THREE.BufferGeometry {
  const indexed = new THREE.IcosahedronGeometry(radius, detail);
  const nonIndexed = indexed.toNonIndexed();
  indexed.dispose();

  const posAttr = nonIndexed.getAttribute("position");
  const vertexCount = posAttr.count;
  const splitSides = new Float32Array(vertexCount);

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const centroid = new THREE.Vector3();

  for (let i = 0; i < vertexCount; i += 3) {
    vA.fromBufferAttribute(posAttr, i);
    vB.fromBufferAttribute(posAttr, i + 1);
    vC.fromBufferAttribute(posAttr, i + 2);

    centroid.copy(vA).add(vB).add(vC).divideScalar(3).normalize();
    const side = centroid.dot(SPLIT_AXIS) >= 0 ? 1.0 : -1.0;

    // Snap any vertex crossing the cutting equator cleanly back onto dot(v, SPLIT_AXIS) = 0
    // so both hemispheres open with a razor-clean diagonal slice instead of sawtooth triangles.
    const verts = [vA, vB, vC];
    for (let k = 0; k < 3; k++) {
      const v = verts[k];
      const proj = v.dot(SPLIT_AXIS);
      if (side * proj < 0) {
        v.addScaledVector(SPLIT_AXIS, -proj).normalize().multiplyScalar(radius);
        posAttr.setXYZ(i + k, v.x, v.y, v.z);
      }
    }

    splitSides[i] = side;
    splitSides[i + 1] = side;
    splitSides[i + 2] = side;
  }

  nonIndexed.setAttribute("aSplitSide", new THREE.BufferAttribute(splitSides, 1));
  nonIndexed.computeVertexNormals();
  nonIndexed.computeBoundingSphere();
  return nonIndexed;
}

function createContourInitialUniforms() {
  return {
    uTime: { value: 0 },
    uNoiseScale: { value: 2.15 },
    uDisplacementAmp: { value: 0.085 },
    uContourCount: { value: 14.0 },
    uLineWidth: { value: 0.055 },
    uSplitProgress: { value: 0.0 },
    uSplitGap: { value: 0.36 },
    uLineColor: { value: new THREE.Color("#F3F5F9") },
    uBgColor: { value: new THREE.Color("#07080B") },
    uAccentRim: { value: new THREE.Color("#FF5B1F") },
  };
}

/**
 * Shader S2 — Topographic Contour Sphere.
 * Procedural monochrome contour isolines computed in the fragment shader via `fwidth()`
 * so edges remain razor sharp at any DPI, plus clean diagonal split separation.
 */
export function ContourSphere({
  tier = "high",
  isMobile = false,
  reducedMotion = false,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  labOverrides,
}: ContourSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const detail = isMobile || tier === "low" ? 4 : 5;

  const geometry = useMemo(
    () => buildSplitAwareContourSphereGeometry(1.45, detail),
    [detail]
  );

  const initialUniforms = useMemo(() => createContourInitialUniforms(), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((_, delta) => {
    const shaderMat = materialRef.current;
    if (!visible || !shaderMat) return;

    const clampedDelta = Math.min(delta, 0.05);
    const uniforms = shaderMat.uniforms;
    const storeState = useSceneStore.getState();

    if (!reducedMotion) {
      uniforms.uTime.value = (uniforms.uTime.value as number) + clampedDelta;
    }

    uniforms.uNoiseScale.value = labOverrides?.noiseScale ?? 2.15;
    uniforms.uDisplacementAmp.value = labOverrides?.displacementAmp ?? 0.085;
    uniforms.uContourCount.value = labOverrides?.contourCount ?? 14.0;
    uniforms.uLineWidth.value = labOverrides?.lineWidth ?? 0.055;

    const targetSplit =
      labOverrides?.splitProgress !== undefined ? labOverrides.splitProgress : 0;
    uniforms.uSplitProgress.value = THREE.MathUtils.lerp(
      uniforms.uSplitProgress.value as number,
      targetSplit,
      Math.min(1, clampedDelta * 8)
    );
    uniforms.uSplitGap.value = labOverrides?.splitGap ?? 0.36;

    if (labOverrides?.lineColor) {
      (uniforms.uLineColor.value as THREE.Color).set(labOverrides.lineColor);
    }
    if (labOverrides?.bgColor) {
      (uniforms.uBgColor.value as THREE.Color).set(labOverrides.bgColor);
    }
    if (labOverrides?.accentRim) {
      (uniforms.uAccentRim.value as THREE.Color).set(labOverrides.accentRim);
    }

    if (meshRef.current && !reducedMotion) {
      const rotSpeed = labOverrides?.autoRotateSpeed ?? 0.09;
      meshRef.current.rotation.y += clampedDelta * rotSpeed;
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        storeState.pointer.y * 0.12,
        Math.min(1, clampedDelta * 4)
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      scale={scale}
      visible={visible}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={S2_CONTOUR_SPHERE_SHADERS.vertexShader}
        fragmentShader={S2_CONTOUR_SPHERE_SHADERS.fragmentShader}
        uniforms={initialUniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Crisp SVG topographic sphere fallback for low-tier devices, Preloader fallback,
 * reduced motion, dividers, and footer brand marks.
 */
export function ContourSphereFallback({
  className,
  split = false,
  label = "Static topographic contour sphere illustration",
}: {
  className?: string;
  split?: boolean;
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
      }}
    >
      <svg
        viewBox="0 0 420 420"
        style={{ width: "min(72%, 420px)", height: "auto" }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="s2UpperClip">
            <polygon points="0,0 420,0 420,175 0,255" />
          </clipPath>
          <clipPath id="s2LowerClip">
            <polygon points="0,255 420,175 420,420 0,420" />
          </clipPath>
        </defs>

        <g
          clipPath="url(#s2UpperClip)"
          transform={split ? "translate(-10,-16)" : undefined}
        >
          <circle
            cx="210"
            cy="210"
            r="148"
            fill="#07080B"
            stroke="#F3F5F9"
            strokeWidth="1.2"
          />
          <ellipse
            cx="210"
            cy="186"
            rx="136"
            ry="52"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.85"
            strokeWidth="1.15"
          />
          <ellipse
            cx="210"
            cy="156"
            rx="116"
            ry="38"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.72"
            strokeWidth="1.1"
          />
          <ellipse
            cx="210"
            cy="128"
            rx="88"
            ry="26"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.62"
            strokeWidth="1.05"
          />
          <ellipse
            cx="210"
            cy="102"
            rx="54"
            ry="15"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <path
            d="M68 205 C 128 164, 240 240, 352 192"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.8"
            strokeWidth="1.2"
          />
          <path
            d="M88 150 C 165 112, 260 176, 336 140"
            fill="none"
            stroke="#FF5B1F"
            strokeOpacity={split ? "0.78" : "0.28"}
            strokeWidth="1.2"
          />
        </g>

        <g
          clipPath="url(#s2LowerClip)"
          transform={split ? "translate(10,16)" : undefined}
        >
          <circle
            cx="210"
            cy="210"
            r="148"
            fill="#07080B"
            stroke="#F3F5F9"
            strokeWidth="1.2"
          />
          <ellipse
            cx="210"
            cy="236"
            rx="138"
            ry="52"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.85"
            strokeWidth="1.15"
          />
          <ellipse
            cx="210"
            cy="268"
            rx="112"
            ry="36"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.72"
            strokeWidth="1.1"
          />
          <ellipse
            cx="210"
            cy="296"
            rx="82"
            ry="23"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.62"
            strokeWidth="1.05"
          />
          <ellipse
            cx="210"
            cy="322"
            rx="46"
            ry="13"
            fill="none"
            stroke="#F3F5F9"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <path
            d="M74 238 C 154 275, 258 196, 348 242"
            fill="none"
            stroke="#FF5B1F"
            strokeOpacity={split ? "0.85" : "0.28"}
            strokeWidth="1.2"
          />
        </g>
      </svg>
    </div>
  );
}
