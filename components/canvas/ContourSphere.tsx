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
  /** Optional DOM selector to track a scrollable container inside the fixed persistent Canvas */
  viewportSelector?: string;
  labOverrides?: ContourSphereLabOverrides;
}

const UP_AXIS = new THREE.Vector3(0, 1, 0);
const SPLIT_AXIS = new THREE.Vector3(0.32, 0.92, 0.18).normalize();

/**
 * Builds a single BufferGeometry containing two matching spherical hemispheres
 * whose mutual equator lies cleanly along `SPLIT_AXIS`.
 * - Closed (`uSplitProgress == 0`): vertices meet identically -> zero crease or seam.
 * - Split (`uSplitProgress > 0`): each hemisphere slides along `SPLIT_AXIS` cleanly
 *   with a razor-smooth circular cut silhouette (no sawtooth triangles).
 */
function buildSplitAwareContourSphereGeometry(
  radius: number,
  widthSegments: number,
  heightSegmentsPerHalf: number
): THREE.BufferGeometry {
  const north = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegmentsPerHalf,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.5
  );
  const south = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegmentsPerHalf,
    0,
    Math.PI * 2,
    Math.PI * 0.5,
    Math.PI * 0.5
  );

  // Align the exact theta = PI/2 split equator orthogonal to SPLIT_AXIS
  const alignQuat = new THREE.Quaternion().setFromUnitVectors(UP_AXIS, SPLIT_AXIS);
  north.applyQuaternion(alignQuat);
  south.applyQuaternion(alignQuat);

  const northNonIdx = north.toNonIndexed();
  const southNonIdx = south.toNonIndexed();
  north.dispose();
  south.dispose();

  const nPos = northNonIdx.getAttribute("position").array as Float32Array;
  const sPos = southNonIdx.getAttribute("position").array as Float32Array;
  const nNorm = northNonIdx.getAttribute("normal").array as Float32Array;
  const sNorm = southNonIdx.getAttribute("normal").array as Float32Array;

  const nCount = nPos.length / 3;
  const sCount = sPos.length / 3;
  const totalCount = nCount + sCount;

  const positions = new Float32Array(totalCount * 3);
  const normals = new Float32Array(totalCount * 3);
  const splitSides = new Float32Array(totalCount);

  positions.set(nPos, 0);
  positions.set(sPos, nPos.length);
  normals.set(nNorm, 0);
  normals.set(sNorm, nNorm.length);

  splitSides.fill(1.0, 0, nCount);
  splitSides.fill(-1.0, nCount, totalCount);

  northNonIdx.dispose();
  southNonIdx.dispose();

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.setAttribute("aSplitSide", new THREE.BufferAttribute(splitSides, 1));
  merged.computeBoundingSphere();
  return merged;
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
 * so edges remain razor sharp at any DPI, plus precision circular diagonal split separation.
 */
export function ContourSphere({
  tier = "high",
  isMobile = false,
  reducedMotion = false,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  viewportSelector,
  labOverrides,
}: ContourSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const anchorElRef = useRef<Element | null>(null);

  const widthSegments = isMobile || tier === "low" ? 64 : 96;
  const halfHeightSegments = isMobile || tier === "low" ? 24 : 40;

  const geometry = useMemo(
    () =>
      buildSplitAwareContourSphereGeometry(
        1.45,
        widthSegments,
        halfHeightSegments
      ),
    [widthSegments, halfHeightSegments]
  );

  const initialUniforms = useMemo(() => createContourInitialUniforms(), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const shaderMat = materialRef.current;
    if (!mesh || !shaderMat) return;

    if (!visible) {
      mesh.visible = false;
      return;
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

      const normX = (rect.left + rect.width * 0.5) / vw - 0.5;
      const normY = 0.5 - (rect.top + rect.height * 0.5) / vh;
      const worldX = normX * state.viewport.width;
      const worldY = normY * state.viewport.height;
      const worldBox = Math.min(
        (rect.width / vw) * state.viewport.width,
        (rect.height / vh) * state.viewport.height
      );
      const fittedScale = (worldBox * 0.78) / 2.9;

      mesh.position.set(worldX, worldY, 0);
      mesh.scale.setScalar(fittedScale);
      mesh.visible = true;
    } else {
      mesh.visible = true;
    }

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
      labOverrides?.splitProgress !== undefined
        ? labOverrides.splitProgress
        : viewportSelector
          ? storeState.aboutSplit
          : 0;
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

    if (!reducedMotion) {
      const rotSpeed = labOverrides?.autoRotateSpeed ?? 0.09;
      mesh.rotation.y += clampedDelta * rotSpeed;
      mesh.rotation.x = THREE.MathUtils.lerp(
        mesh.rotation.x,
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
