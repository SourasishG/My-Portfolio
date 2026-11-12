"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GpuTierLevel, useSceneStore } from "@/lib/store";

export interface ChromeArchesLabOverrides {
  scrollSection?: number;
  roughness?: number;
  metalness?: number;
  rippleAmp?: number;
  chromeTint?: string;
  envIntensity?: number;
}

export interface ChromeArchesProps {
  tier?: GpuTierLevel;
  isMobile?: boolean;
  viewportSelector?: string;
  visible?: boolean;
  reducedMotion?: boolean;
  labOverrides?: ChromeArchesLabOverrides;
}

/**
 * Generates a self-contained studio equirectangular radiance map baked into
 * a PMREM environment texture so `MeshPhysicalMaterial` chrome arches gleam with
 * crisp softbox highlights and obsidian shadow cavities without external HDR downloads.
 */
function createChromeStudioEnv(gl: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const width = 256;
  const height = 128;
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1); // 0 bottom -> 1 top
    const theta = (1 - v) * Math.PI; // 0 zenith -> PI nadir

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const phi = u * Math.PI * 2;

      // Deep obsidian base environment
      let r = 8;
      let g = 10;
      let b = 15;

      // Primary top overhead softbox
      const zenithMask = Math.exp(-Math.pow((theta - 0.58) / 0.26, 2));
      const keyAzimuth = 0.5 + 0.5 * Math.cos(phi - 0.85);
      const overheadGlow = zenithMask * Math.pow(keyAzimuth, 1.8);

      // Sweeping lateral studio ribbon reflection (catches along curved tube silhouettes)
      const bandCenter = 1.48 + 0.24 * Math.sin(phi * 2.0 + 0.4);
      const ribbon = Math.exp(-Math.pow((theta - bandCenter) / 0.085, 2));
      const ribbonSplit = 0.55 + 0.45 * Math.sin(phi * 3.0 - 0.6);

      // Secondary counter-rim strip with cool cyan grazing tint
      const coolRimBand = Math.exp(-Math.pow((theta - 1.92) / 0.14, 2));
      const coolAzimuth = Math.max(0, Math.cos(phi + 2.1));

      // Combine luminance channels cleanly into chrome softbox palette
      const chromeHighlight = overheadGlow * 238 + ribbon * ribbonSplit * 245;
      r += chromeHighlight * 0.94 + coolRimBand * coolAzimuth * 48;
      g += chromeHighlight * 0.97 + coolRimBand * coolAzimuth * 128;
      b += chromeHighlight * 1.02 + coolRimBand * coolAzimuth * 218;

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

interface ArchSpec {
  id: string;
  geometry: THREE.TubeGeometry;
  baseRotation: [number, number, number];
  driftSpeed: number;
  driftPhase: number;
}

function buildArchGeometries(isLowDetail: boolean): ArchSpec[] {
  const segMult = isLowDetail ? 0.68 : 1.0;

  // 1. Primary Vault Arch — broad sweeping signature chrome arc
  const vaultPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const angle = THREE.MathUtils.lerp(-Math.PI * 0.86, -Math.PI * 0.14, t);
    const x = Math.cos(angle) * 1.62;
    const y = -Math.sin(angle) * 1.24 - 0.34;
    const z = Math.sin(t * Math.PI * 2.0) * 0.34;
    vaultPts.push(new THREE.Vector3(x, y, z));
  }
  const vaultGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(vaultPts),
    Math.round(108 * segMult),
    0.095,
    isLowDetail ? 16 : 22,
    false
  );

  // 2. Counter-Catenary Arch — opposing spatial ribbon intersecting depth plane
  const counterPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const angle = THREE.MathUtils.lerp(Math.PI * 0.12, Math.PI * 0.88, t);
    const x = Math.cos(angle) * 1.44;
    const y = -Math.sin(angle) * 1.02 + 0.36;
    const z = Math.cos(t * Math.PI * 1.8) * 0.38;
    counterPts.push(new THREE.Vector3(x, y, z));
  }
  const counterGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(counterPts),
    Math.round(96 * segMult),
    0.068,
    isLowDetail ? 14 : 20,
    false
  );

  // 3. Crown Cantilever Arc — lighter inner arc threading across top vault
  const crownPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const angle = THREE.MathUtils.lerp(-Math.PI * 0.78, -Math.PI * 0.22, t);
    const x = Math.cos(angle) * 1.12;
    const y = -Math.sin(angle) * 0.84 - 0.04;
    const z = -0.32 + Math.sin(t * Math.PI) * 0.76;
    crownPts.push(new THREE.Vector3(x, y, z));
  }
  const crownGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(crownPts),
    Math.round(84 * segMult),
    0.048,
    isLowDetail ? 12 : 18,
    false
  );

  // 4. Closed Horizon Halo Loop — fine precision ring binding the arch system
  const haloPts: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const x = Math.cos(a) * 1.42;
    const y = Math.sin(a * 2.0) * 0.16 - 0.18;
    const z = Math.sin(a) * 0.72;
    haloPts.push(new THREE.Vector3(x, y, z));
  }
  const haloGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(haloPts, true),
    Math.round(112 * segMult),
    0.028,
    isLowDetail ? 12 : 16,
    true
  );

  return [
    {
      id: "vault",
      geometry: vaultGeo,
      baseRotation: [0.06, -0.1, 0.04],
      driftSpeed: 0.34,
      driftPhase: 0.0,
    },
    {
      id: "counter",
      geometry: counterGeo,
      baseRotation: [-0.14, 0.22, -0.08],
      driftSpeed: -0.26,
      driftPhase: 1.4,
    },
    {
      id: "crown",
      geometry: crownGeo,
      baseRotation: [0.18, -0.28, 0.1],
      driftSpeed: 0.42,
      driftPhase: 2.7,
    },
    {
      id: "halo",
      geometry: haloGeo,
      baseRotation: [0.22, 0.08, -0.06],
      driftSpeed: -0.2,
      driftPhase: 0.85,
    },
  ];
}

/**
 * Shader S5 — Chrome Fluid Arches.
 *
 * Sculptural interlocking brushed-chrome arches (`MeshPhysicalMaterial`,
 * `metalness: 1.0`, `roughness: 0.08`) illuminated by a self-contained procedural
 * PMREM studio radiance environment and subtle GPU harmonic ripple. Pivots along
 * a smooth camera-like arc proportional to Section 07 scroll progress.
 */
export function ChromeArches({
  tier = "high",
  isMobile = false,
  viewportSelector,
  visible = true,
  reducedMotion = false,
  labOverrides,
}: ChromeArchesProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const archRefs = useRef<Array<THREE.Mesh | null>>([]);
  const anchorElRef = useRef<Element | null>(null);
  const smoothedScrollRef = useRef<number>(0);

  const shaderUniformsRef = useRef({
    uTime: { value: 0 },
    uRippleAmp: { value: 0.048 },
    uScrollArc: { value: 0 },
  });

  const { gl } = useThree();
  const isLowDetail = isMobile || tier !== "high";
  const arches = useMemo(() => buildArchGeometries(isLowDetail), [isLowDetail]);

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#E8EDF5"),
      metalness: 1.0,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.45,
      reflectivity: 1.0,
    });

    mat.customProgramCacheKey = () => "signal-s5-chrome-arches-v1";
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = shaderUniformsRef.current.uTime;
      shader.uniforms.uRippleAmp = shaderUniformsRef.current.uRippleAmp;
      shader.uniforms.uScrollArc = shaderUniformsRef.current.uScrollArc;

      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uRippleAmp;
        uniform float uScrollArc;
        ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        float s5WavePhase = transformed.x * 1.9 + transformed.z * 1.35 + uTime * 1.2 + uScrollArc * 2.5;
        transformed.y += sin(s5WavePhase) * uRippleAmp;
        transformed.z += cos(s5WavePhase * 0.8 + 0.9) * (uRippleAmp * 0.65);
        `
      );
    };

    return mat;
  }, []);

  // Build procedural studio PMREM environment once & dispose cleanly on unmount
  useEffect(() => {
    const envTarget = createChromeStudioEnv(gl);
    material.envMap = envTarget.texture;
    material.needsUpdate = true;

    return () => {
      envTarget.dispose();
      material.envMap = null;
      useSceneStore.getState().setChromeArchesReady(false);
    };
  }, [gl, material]);

  useEffect(() => {
    return () => {
      arches.forEach((arch) => arch.geometry.dispose());
    };
  }, [arches]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((state, delta) => {
    const group = rootGroupRef.current;
    if (!group) return;

    const store = useSceneStore.getState();

    if (!visible || reducedMotion) {
      group.visible = false;
      if (store.chromeArchesReady) {
        store.setChromeArchesReady(false);
      }
      return;
    }

    if (!store.chromeArchesReady && material.envMap) {
      store.setChromeArchesReady(true);
    }

    // Align smoothly to `#aspirations-s5-stage` on "/" or center inside Shader Lab
    if (viewportSelector) {
      if (!anchorElRef.current || !anchorElRef.current.isConnected) {
        anchorElRef.current = document.querySelector(viewportSelector);
      }
      const el = anchorElRef.current;
      if (!el) {
        group.visible = false;
        return;
      }

      const rect = el.getBoundingClientRect();
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);

      if (rect.width <= 0 || rect.height <= 0 || rect.bottom <= 0 || rect.top >= vh) {
        group.visible = false;
        return;
      }

      const worldW = (rect.width / vw) * state.viewport.width;
      const worldH = (rect.height / vh) * state.viewport.height;
      const worldX = ((rect.left + rect.width * 0.5) / vw - 0.5) * state.viewport.width;
      const worldY = (0.5 - (rect.top + rect.height * 0.5) / vh) * state.viewport.height;
      const fitScale = Math.min(worldW / 3.85, worldH / 2.75);

      group.position.set(worldX, worldY, 0);
      group.scale.setScalar(Math.max(0.2, fitScale));
    } else {
      group.position.set(0, 0, 0);
      group.scale.setScalar(isMobile ? 0.82 : 1.05);
    }

    group.visible = Boolean(material.envMap);

    const clampedDelta = Math.min(delta, 0.05);
    const targetScroll =
      labOverrides?.scrollSection !== undefined
        ? labOverrides.scrollSection
        : store.aspirationsProgress;

    smoothedScrollRef.current = THREE.MathUtils.lerp(
      smoothedScrollRef.current,
      targetScroll,
      1 - Math.exp(-6 * clampedDelta)
    );

    const t = shaderUniformsRef.current.uTime.value + clampedDelta;
    shaderUniformsRef.current.uTime.value = t;
    shaderUniformsRef.current.uRippleAmp.value = labOverrides?.rippleAmp ?? 0.048;
    shaderUniformsRef.current.uScrollArc.value = smoothedScrollRef.current;

    // Synchronize live material overrides if supplied in Shader Lab
    material.roughness = labOverrides?.roughness ?? 0.08;
    material.metalness = labOverrides?.metalness ?? 1.0;
    material.envMapIntensity = labOverrides?.envIntensity ?? 1.45;
    if (labOverrides?.chromeTint) {
      material.color.set(labOverrides.chromeTint);
    } else {
      material.color.set("#E8EDF5");
    }

    // Camera-like scroll arc rotation + subtle fine pointer parallax
    const scrollArcYaw = (smoothedScrollRef.current - 0.5) * 0.96;
    const scrollArcPitch = Math.sin(smoothedScrollRef.current * Math.PI) * 0.24 - 0.08;
    const pointerYaw = store.pointer.x * 0.22;
    const pointerPitch = -store.pointer.y * 0.14;

    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      scrollArcYaw + pointerYaw + Math.sin(t * 0.28) * 0.08,
      1 - Math.exp(-5 * clampedDelta)
    );
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      scrollArcPitch + pointerPitch,
      1 - Math.exp(-5 * clampedDelta)
    );

    // Subtle counter-harmonic breathing per arch rib
    for (let i = 0; i < arches.length; i++) {
      const archMesh = archRefs.current[i];
      const spec = arches[i];
      if (!archMesh) continue;

      archMesh.rotation.x =
        spec.baseRotation[0] + Math.sin(t * 0.48 + spec.driftPhase) * 0.065;
      archMesh.rotation.y =
        spec.baseRotation[1] + Math.cos(t * 0.36 + spec.driftPhase) * 0.095 * spec.driftSpeed;
      archMesh.rotation.z =
        spec.baseRotation[2] + Math.sin(t * 0.3 + spec.driftPhase) * 0.045;
    }
  });

  return (
    <group ref={rootGroupRef} visible={false}>
      <directionalLight
        visible={visible}
        position={[3.6, 4.5, 4.2]}
        intensity={1.35}
        color="#F3F5F9"
      />
      <directionalLight
        visible={visible}
        position={[-4.0, -2.5, 3.0]}
        intensity={0.55}
        color="#4DA8FF"
      />
      {arches.map((spec, index) => (
        <mesh
          key={spec.id}
          ref={(el) => {
            archRefs.current[index] = el;
          }}
          geometry={spec.geometry}
          material={material}
          rotation={spec.baseRotation}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}

/**
 * Monochrome crisp SVG chrome arch composition rendered whenever reduced-motion,
 * low GPU tier, or WebGL fallback is active.
 */
export function ChromeArchesFallback() {
  return (
    <svg
      viewBox="0 0 640 480"
      width="100%"
      height="100%"
      fill="none"
      role="img"
      aria-label="Monochrome sculpted chrome arch illustration"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <radialGradient id="s5-bg-glow" cx="50%" cy="48%" r="58%">
          <stop offset="0%" stopColor="#1B2232" stopOpacity="0.65" />
          <stop offset="65%" stopColor="#0D1017" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#07080B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s5-chrome-primary" x1="0%" y1="15%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#3B4252" />
          <stop offset="28%" stopColor="#E8EDF5" />
          <stop offset="48%" stopColor="#FFFFFF" />
          <stop offset="72%" stopColor="#8A90A0" />
          <stop offset="100%" stopColor="#1A1F2B" />
        </linearGradient>
        <linearGradient id="s5-chrome-secondary" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E2433" />
          <stop offset="35%" stopColor="#C8D2E3" />
          <stop offset="52%" stopColor="#4DA8FF" stopOpacity="0.82" />
          <stop offset="80%" stopColor="#E8EDF5" />
          <stop offset="100%" stopColor="#141821" />
        </linearGradient>
        <linearGradient id="s5-chrome-rim" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#8A90A0" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#F3F5F9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <rect width="640" height="480" fill="url(#s5-bg-glow)" />

      {/* Subtle architectural reference crosshair */}
      <line x1="64" y1="240" x2="576" y2="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="320" y1="48" x2="320" y2="432" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Counter-Catenary Arch */}
      <path
        d="M 110 152 C 205 390, 445 384, 534 166"
        stroke="url(#s5-chrome-secondary)"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M 110 152 C 205 390, 445 384, 534 166"
        stroke="#FFFFFF"
        strokeOpacity="0.32"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Horizon Halo Loop */}
      <ellipse
        cx="320"
        cy="264"
        rx="222"
        ry="58"
        transform="rotate(-11 320 264)"
        stroke="url(#s5-chrome-rim)"
        strokeWidth="7"
        opacity="0.7"
      />

      {/* Primary Vault Arch */}
      <path
        d="M 78 342 C 154 78, 486 78, 562 342"
        stroke="url(#s5-chrome-primary)"
        strokeWidth="30"
        strokeLinecap="round"
      />
      <path
        d="M 78 342 C 154 78, 486 78, 562 342"
        stroke="#FFFFFF"
        strokeOpacity="0.55"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Crown Cantilever Arc */}
      <path
        d="M 176 286 C 232 142, 412 138, 474 280"
        stroke="url(#s5-chrome-primary)"
        strokeWidth="15"
        strokeLinecap="round"
        opacity="0.92"
      />
    </svg>
  );
}
