"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { GpuTierLevel, useSceneStore } from "@/lib/store";

export interface GlassObjectLabOverrides {
  chromaticAberration?: number;
  thickness?: number;
  roughness?: number;
  ior?: number;
  distortion?: number;
  distortionScale?: number;
  anisotropy?: number;
  envIntensity?: number;
  tumbleSpeed?: number;
  tintColor?: string;
}

export interface GlassObjectProps {
  tier?: GpuTierLevel;
  isMobile?: boolean;
  viewportSelector?: string;
  visible?: boolean;
  reducedMotion?: boolean;
  labOverrides?: GlassObjectLabOverrides;
}

type TransmissionMatHandle = THREE.MeshPhysicalMaterial & {
  chromaticAberration?: number;
  distortion?: number;
  distortionScale?: number;
  anisotropy?: number;
  _transmission?: number;
};

/**
 * Generates a self-contained obsidian-and-prismatic studio PMREM radiance texture
 * so `MeshTransmissionMaterial` catches razor-sharp Fresnel speculars and subtle
 * spectral rim glints without depending on external HDRI downloads.
 */
function createGlassStudioEnv(gl: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const width = 256;
  const height = 128;
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    const theta = (1 - v) * Math.PI;

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const phi = u * Math.PI * 2;

      let r = 6;
      let g = 8;
      let b = 12;

      // Primary crisp studio overhead key strip
      const topStrip = Math.exp(-Math.pow((theta - 0.52) / 0.16, 2));
      const topAzimuth = Math.pow(0.5 + 0.5 * Math.cos(phi - 0.65), 2.4);
      const whiteKey = topStrip * topAzimuth * 255;

      // Sweeping cyan prism light card (left-front grazing)
      const cyanBand = Math.exp(-Math.pow((theta - 1.38) / 0.18, 2));
      const cyanAz = Math.pow(Math.max(0, Math.cos(phi + 1.4)), 1.6);

      // Counter violet prism light card (right-lower grazing)
      const violetBand = Math.exp(-Math.pow((theta - 1.82) / 0.2, 2));
      const violetAz = Math.pow(Math.max(0, Math.cos(phi - 1.9)), 1.6);

      // Faint horizon hairline specular
      const equatorHairline = Math.exp(-Math.pow((theta - 1.56) / 0.03, 2)) * 90;

      r += whiteKey + violetBand * violetAz * 175 + equatorHairline * 0.85;
      g +=
        whiteKey +
        cyanBand * cyanAz * 165 +
        violetBand * violetAz * 115 +
        equatorHairline * 0.9;
      b +=
        whiteKey +
        cyanBand * cyanAz * 255 +
        violetBand * violetAz * 245 +
        equatorHairline;

      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, Math.max(0, Math.round(r)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      data[idx + 3] = 255;
    }
  }

  const eqTex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  eqTex.mapping = THREE.EquirectangularReflectionMapping;
  eqTex.colorSpace = THREE.SRGBColorSpace;
  eqTex.magFilter = THREE.LinearFilter;
  eqTex.minFilter = THREE.LinearFilter;
  eqTex.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(gl);
  pmrem.compileEquirectangularShader();
  const envTarget = pmrem.fromEquirectangular(eqTex);

  eqTex.dispose();
  pmrem.dispose();
  return envTarget;
}

/**
 * Builds the flat-faceted primary crystal geometry and a nested octahedral core
 * so chromatic aberration disperses light sharply across crisp polygonal bevels.
 */
function buildCrystalGeometries(isLowDetail: boolean) {
  // Non-indexed faceted icosahedron keeps planar triangle normals for prism facets
  const rawOuter = new THREE.IcosahedronGeometry(0.96, isLowDetail ? 0 : 1);
  const outer = rawOuter.index ? rawOuter.toNonIndexed() : rawOuter;
  if (outer !== rawOuter) rawOuter.dispose();
  outer.computeVertexNormals();

  // Inner suspended wireframe cage & optical core behind the glass
  const coreOct = new THREE.OctahedronGeometry(0.42, 0);
  const haloRing = new THREE.TorusGeometry(0.76, 0.016, 12, isLowDetail ? 48 : 72);
  const causticArc = new THREE.TorusGeometry(0.56, 0.012, 10, isLowDetail ? 40 : 64);

  return { outer, coreOct, haloRing, causticArc };
}

function setStoreGlassReady(ready: boolean) {
  const store = useSceneStore.getState();
  if (typeof store.setGlassObjectReady === "function") {
    store.setGlassObjectReady(ready);
  } else {
    store.glassObjectReady = ready;
  }
}

/**
 * Shader S4 — Chromatic Glass Object (`GlassObject`).
 *
 * Sculpted refractive crystal powered by `@react-three/drei`'s
 * `MeshTransmissionMaterial` (`ior: 1.45`, `chromaticAberration`, `thickness`)
 * paired with a self-contained procedural PMREM studio map and an internal
 * cyan/violet optical filament rig refracted through the crystal facets.
 */
export function GlassObject({
  tier = "high",
  isMobile = false,
  viewportSelector,
  visible = true,
  reducedMotion = false,
  labOverrides,
}: GlassObjectProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const crystalGroupRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ringARef = useRef<THREE.Mesh>(null);
  const ringBRef = useRef<THREE.Mesh>(null);
  const transMatRef = useRef<TransmissionMatHandle | null>(null);
  const envTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const anchorElRef = useRef<Element | null>(null);
  const elapsedRef = useRef<number>(0);

  const { gl } = useThree();
  const isLowDetail = isMobile || tier !== "high";
  const geometries = useMemo(() => buildCrystalGeometries(isLowDetail), [isLowDetail]);

  const transmissionSamples = tier === "high" && !isMobile ? 6 : 3;
  const transmissionResolution = tier === "high" && !isMobile ? 512 : 256;

  useEffect(() => {
    const envTarget = createGlassStudioEnv(gl);
    envTargetRef.current = envTarget;

    if (transMatRef.current) {
      transMatRef.current.envMap = envTarget.texture;
      transMatRef.current.needsUpdate = true;
    }

    const matSnapshot = transMatRef.current;
    return () => {
      if (matSnapshot) {
        matSnapshot.envMap = null;
        matSnapshot.dispose();
      }
      envTarget.dispose();
      envTargetRef.current = null;
      setStoreGlassReady(false);
    };
  }, [gl]);

  useEffect(() => {
    return () => {
      geometries.outer.dispose();
      geometries.coreOct.dispose();
      geometries.haloRing.dispose();
      geometries.causticArc.dispose();
    };
  }, [geometries]);

  useFrame((state, delta) => {
    const group = rootGroupRef.current;
    const crystalGroup = crystalGroupRef.current;
    const mat = transMatRef.current;
    if (!group || !crystalGroup || !mat) return;

    const envTex = envTargetRef.current?.texture ?? null;

    if (!visible || reducedMotion || !envTex) {
      group.visible = false;
      mat.visible = false;
      if (useSceneStore.getState().glassObjectReady) {
        setStoreGlassReady(false);
      }
      return;
    }

    if (viewportSelector) {
      if (!anchorElRef.current || !anchorElRef.current.isConnected) {
        anchorElRef.current = document.querySelector(viewportSelector);
      }
      const el = anchorElRef.current;
      if (!el) {
        group.visible = false;
        mat.visible = false;
        return;
      }

      const rect = el.getBoundingClientRect();
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);

      if (rect.width <= 0 || rect.height <= 0 || rect.bottom <= 0 || rect.top >= vh) {
        group.visible = false;
        mat.visible = false;
        return;
      }

      const worldW = (rect.width / vw) * state.viewport.width;
      const worldH = (rect.height / vh) * state.viewport.height;
      const worldX = ((rect.left + rect.width * 0.5) / vw - 0.5) * state.viewport.width;
      const worldY = (0.5 - (rect.top + rect.height * 0.5) / vh) * state.viewport.height;
      const fitScale = Math.min(worldW / 2.65, worldH / 2.45);

      group.position.set(worldX, worldY, 0);
      group.scale.setScalar(Math.max(0.28, fitScale));
    } else {
      group.position.set(0, 0, 0);
      group.scale.setScalar(isMobile ? 0.92 : 1.18);
    }

    group.visible = true;
    mat.visible = true;
    if (!useSceneStore.getState().glassObjectReady) {
      setStoreGlassReady(true);
    }

    if (mat.envMap !== envTex) {
      mat.envMap = envTex;
      mat.needsUpdate = true;
    }

    const clampedDelta = Math.min(delta, 0.05);
    const tumbleSpeed = labOverrides?.tumbleSpeed ?? 0.34;
    elapsedRef.current += clampedDelta;
    const t = elapsedRef.current;

    mat.chromaticAberration = labOverrides?.chromaticAberration ?? 0.16;
    mat.thickness = labOverrides?.thickness ?? 0.72;
    mat.roughness = labOverrides?.roughness ?? 0.06;
    mat.ior = labOverrides?.ior ?? 1.45;
    mat.distortion = labOverrides?.distortion ?? 0.18;
    mat.distortionScale = labOverrides?.distortionScale ?? 0.35;
    mat.anisotropy = labOverrides?.anisotropy ?? 0.14;
    mat.envMapIntensity = labOverrides?.envIntensity ?? 1.55;
    mat.color.set(labOverrides?.tintColor ?? "#F3F7FF");

    const store = useSceneStore.getState();
    const pointerYaw = store.pointer.x * 0.42;
    const pointerPitch = -store.pointer.y * 0.32;

    crystalGroup.rotation.y = THREE.MathUtils.lerp(
      crystalGroup.rotation.y,
      t * tumbleSpeed + pointerYaw,
      1 - Math.exp(-5 * clampedDelta)
    );
    crystalGroup.rotation.x = THREE.MathUtils.lerp(
      crystalGroup.rotation.x,
      Math.sin(t * 0.42) * 0.24 + pointerPitch,
      1 - Math.exp(-5 * clampedDelta)
    );
    crystalGroup.rotation.z = Math.cos(t * 0.26) * 0.12;

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = -t * (tumbleSpeed * 1.45);
      innerCoreRef.current.rotation.x = t * 0.3;
    }
    if (ringARef.current) {
      ringARef.current.rotation.z = t * 0.22;
      ringARef.current.rotation.x = 0.72 + Math.sin(t * 0.4) * 0.12;
    }
    if (ringBRef.current) {
      ringBRef.current.rotation.z = -t * 0.18;
      ringBRef.current.rotation.y = -0.68 + Math.cos(t * 0.35) * 0.15;
    }
  });

  return (
    <group ref={rootGroupRef} visible={false}>
      <directionalLight
        visible={visible}
        position={[3.5, 4.2, 4.5]}
        intensity={1.5}
        color="#F3F5F9"
      />
      <pointLight visible={visible} position={[-2.2, 1.4, -1.2]} intensity={3.2} color="#4DA8FF" />
      <pointLight visible={visible} position={[2.2, -1.6, -1.2]} intensity={2.6} color="#B388F5" />

      {/* Optical filament core & orbits positioned inside/behind the crystal so FBO transmission disperses spectral rings */}
      <mesh
        ref={innerCoreRef}
        geometry={geometries.coreOct}
        position={[0, 0, -0.08]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#101726"
          emissive="#4DA8FF"
          emissiveIntensity={0.65}
          wireframe
        />
      </mesh>

      <mesh
        ref={ringARef}
        geometry={geometries.haloRing}
        position={[0, 0, -0.22]}
        rotation={[0.72, 0.3, 0]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#4DA8FF"
          emissive="#4DA8FF"
          emissiveIntensity={1.4}
          roughness={0.2}
        />
      </mesh>

      <mesh
        ref={ringBRef}
        geometry={geometries.causticArc}
        position={[0, 0, -0.18]}
        rotation={[-0.64, -0.45, 0.4]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#B388F5"
          emissive="#B388F5"
          emissiveIntensity={1.25}
          roughness={0.25}
        />
      </mesh>

      {/* Subtle architectural dark backplate behind filaments for crisp internal refraction */}
      <mesh position={[0, 0, -0.95]} frustumCulled={false}>
        <circleGeometry args={[1.18, 48]} />
        <meshBasicMaterial color="#090C14" transparent opacity={0.78} />
      </mesh>

      {/* Primary Chromatic Glass Crystal */}
      <group ref={crystalGroupRef}>
        <mesh geometry={geometries.outer} frustumCulled={false}>
          <MeshTransmissionMaterial
            ref={(node) => {
              transMatRef.current = node as unknown as TransmissionMatHandle | null;
            }}
            visible={false}
            samples={transmissionSamples}
            resolution={transmissionResolution}
            transmission={1}
            thickness={0.72}
            roughness={0.06}
            chromaticAberration={0.16}
            ior={1.45}
            anisotropy={0.14}
            distortion={0.18}
            distortionScale={0.35}
            temporalDistortion={0.08}
            clearcoat={1}
            clearcoatRoughness={0.05}
            color="#F3F7FF"
            attenuationDistance={2.2}
            attenuationColor="#CFE4FF"
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Static dispersion crystal composition + CSS conic-gradient refraction rim
 * for `prefers-reduced-motion`, low GPU tiers, and WebGL-unavailable contexts.
 */
export function GlassObjectFallback() {
  return (
    <div
      role="img"
      aria-label="Static chromatic glass prism illustration"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Subtle CSS conic dispersion glow behind the crystal */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "66%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background:
            "conic-gradient(from 40deg, rgba(77,168,255,0.28), rgba(179,136,245,0.24), rgba(255,91,31,0.12), rgba(243,245,249,0.2), rgba(77,168,255,0.28))",
          filter: "blur(28px)",
          opacity: 0.72,
        }}
      />

      <svg
        viewBox="0 0 360 360"
        style={{ position: "relative", width: "min(74%, 310px)", height: "auto" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="s4-facet-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
            <stop offset="48%" stopColor="#4DA8FF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#07080B" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="s4-facet-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B388F5" stopOpacity="0.34" />
            <stop offset="55%" stopColor="#E8EDF5" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="s4-rim-disp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4DA8FF" />
            <stop offset="52%" stopColor="#F3F5F9" />
            <stop offset="100%" stopColor="#B388F5" />
          </linearGradient>
        </defs>

        {/* Precision orbital guide rings */}
        <ellipse
          cx="180"
          cy="180"
          rx="132"
          ry="48"
          transform="rotate(-24 180 180)"
          fill="none"
          stroke="#4DA8FF"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />
        <ellipse
          cx="180"
          cy="180"
          rx="116"
          ry="40"
          transform="rotate(32 180 180)"
          fill="none"
          stroke="#B388F5"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />

        {/* Faceted Glass Prism Silhouette */}
        <polygon
          points="180,46 278,108 278,242 180,314 82,242 82,108"
          fill="url(#s4-facet-a)"
          stroke="url(#s4-rim-disp)"
          strokeWidth="1.5"
        />
        <polygon
          points="180,46 244,142 180,214 116,142"
          fill="url(#s4-facet-b)"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="1"
        />
        <polygon
          points="116,142 180,214 180,314 82,242"
          fill="rgba(77,168,255,0.12)"
          stroke="rgba(77,168,255,0.4)"
          strokeWidth="1"
        />
        <polygon
          points="244,142 278,242 180,314 180,214"
          fill="rgba(179,136,245,0.12)"
          stroke="rgba(179,136,245,0.4)"
          strokeWidth="1"
        />
        <line
          x1="82"
          y1="108"
          x2="244"
          y2="142"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
        />
        <line
          x1="278"
          y1="108"
          x2="116"
          y2="142"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
        />
        <circle cx="180" cy="180" r="6" fill="#FF5B1F" fillOpacity="0.85" />
      </svg>
    </div>
  );
}
