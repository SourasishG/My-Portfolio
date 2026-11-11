# LEARNING.md — SIGNAL Engineering Companion Guide

Beginner-friendly architecture notes, plain-language shader/uniform explanations, library trade-off comparisons, and 3 interview questions with model answers for every module built in **SIGNAL**.

---

## Module 01 — Design Tokens & SCSS Module Layer (`styles/abstracts/_tokens.scss`, `_mixins.scss`, `globals.scss`)

### What it does
Defines the complete visual language of SIGNAL — color tokens (`$black`, `$ink`, `$charcoal`, `$white`, `$muted`, `$cyan`, `$violet`, `$signal`, `$paper`), typography scale, spacing scale, z-index layering, easing curves, and WCAG AA contrast pairs — and exposes shared helper mixins (`container`, `hud-label`, `hairline-grid`, `reduced-motion`).

### Why this architecture was chosen
Instead of scattering hard-coded hex values or Tailwind utility classes across components, a single SCSS module token file ensures every component compiles to deterministic, scoped CSS with zero runtime style recalculation. Wait-free server rendering keeps First Contentful Paint crisp, and CSS custom properties inside `:root` allow runtime themes or browser dev-tools inspection without overriding SCSS compile-time safety.

### Trade-offs vs alternatives
| Option | Trade-off | Decision |
|---|---|---|
| **SCSS Modules + `_tokens.scss`** | Requires Sass compiler setup and explicit semantic class names, but yields zero runtime overhead and strict single styling ownership. | **Chosen** (required by portfolio rules) |
| Tailwind CSS | Fast prototyping for standard layouts, but adds utility-class clutter and violates the project's single-styling-system rule. | Rejected |
| CSS-in-JS (Emotion / Styled Components) | Dynamic props are ergonomic, yet runtime style injection clashes with React Server Components and adds bundle overhead. | Rejected |

### Interview Questions & Model Answers
1. **Q:** *Why check WCAG AA contrast separately on `$paper` (`#F4F4F2`) vs `$ink` (`#07080B`) if both use the same accent color `#FF5B1F`?*  
   **A:** Luminance contrast is relative to background brightness. `#FF5B1F` achieves `6.45:1` on dark `$ink` (passing AA), but drops to `2.82:1` on light `$paper`, which fails body-text readability (`4.5:1`). That is why Section 06 restricts `#FF5B1F` to large display accents/shapes and introduces `$paper-muted` (`#555966`, `6.34:1`) for small captions.
2. **Q:** *Why use `@use "abstracts/tokens" as *` in modern Sass instead of `@import`?*  
   **A:** `@import` executes files repeatedly and pollutes the global namespace. Dart Sass `@use` evaluates a module once per compilation graph, scopes variables cleanly, and will remain supported after `@import` deprecation.
3. **Q:** *Why avoid animating layout properties and prefer CSS `transform`/`opacity` + `reduced-motion` media queries?*  
   **A:** `transform` and `opacity` run on the compositor thread without triggering browser layout/reflow. Wrapping resets inside `@media (prefers-reduced-motion: reduce)` guarantees OS accessibility preferences immediately stop motion without waiting for JavaScript.

---

## Module 02 — Zero-Re-Render Scene Bridge & GPU Tiering (`lib/store.ts`, `hooks/useGpuTier.ts`, `hooks/useReducedMotion.ts`)

### What it does
- `useSceneStore` (`lib/store.ts`): Holds high-frequency frame data (`scrollY`, `scrollProgress`, `velocity`, `pointer`, `heroMorph`) alongside low-frequency UI state (`activeSection`, `gpuTier`, `preloaderDone`).
- `useGpuTier` (`hooks/useGpuTier.ts`): Checks WebGL availability cleanly and runs `detect-gpu` asynchronously to classify client hardware into `high`, `mid`, or `low`.
- `useReducedMotion`: Listens to `prefers-reduced-motion: reduce` safely without SSR hydration mismatch.

### React Hooks, Libraries & Data Flow
1. Pointer handlers or Lenis scroll events call `useSceneStore.getState().setPointer(x, y)`.
2. Because `setPointer` / `setScrollState` mutate store fields without calling Zustand `set(...)`, **zero React components re-render** on mousemove or scroll ticks.
3. Inside Three.js `useFrame()`, shaders pull fresh values using `useSceneStore.getState()` and interpolate smoothly toward targets using `THREE.MathUtils.lerp`.
4. Only infrequent UI events (`setActiveSection`, `setGpuTier`) call `set(...)` so React updates HUD labels cleanly.

### Trade-offs vs alternatives
| Option | Trade-off | Decision |
|---|---|---|
| **Zustand transient store (`getState()`)** | Requires discipline not to subscribe components to scroll/pointer fields, but runs at 60–120fps with zero React reconciliation cost. | **Chosen** |
| React `useState` / Context | Calling `setState` on every `mousemove` or scroll event freezes lower-end CPUs via 60fps virtual DOM diffs. | Rejected |
| Prop-drilled Mutable Refs | Zero overhead, yet awkward to share across decoupled sibling trees (`Nav`, `Hero`, and `CanvasRoot`). | Rejected for global sync |

### Interview Questions & Model Answers
1. **Q:** *Why is calling `setState` inside R3F's `useFrame` considered a major anti-pattern?*  
   **A:** `useFrame` runs once per animation frame (`~60–120` times per second). Triggering React `setState` schedules component diffing and reconciliations every frame, stalling main-thread frame times and causing noticeable stutters.
2. **Q:** *Why wrap `detect-gpu` inside a client `useEffect` rather than running it synchronously during component render?*  
   **A:** Next.js App Router renders Client Components once on the server for SSR HTML before hydrating on the client. WebGL contexts and benchmark tables only exist in the browser, so probing inside `useEffect` prevents SSR errors and React hydration mismatches.
3. **Q:** *How does GPU tiering protect mobile batteries and frame rates?*  
   **A:** `detect-gpu` benchmarks or identifies the renderer and maps weak devices to `low`/`mid` tiers. `HeroBlob` scales down from `55,000` points (`high`) to `25,000` (`mid`) or `12,000` (`low`/mobile), or switches completely to a crisp static SVG when WebGL is blocked.

---

## Module 03 — Shader Chunk Preprocessor & S1 Hero Point-Cloud Blob (`lib/shaders.ts`, `shaders/s1HeroBlob.*`, `components/canvas/HeroBlob.tsx`)

### What it does
Generates up to `55,000` evenly distributed particles across a sphere using a Fibonacci golden-angle lattice and animates them on the GPU into an organic cyan (`#4DA8FF`) to violet (`#B388F5`) living field that reacts smoothly to cursor proximity and scroll progress.

### How the Math & Shader Uniforms Work (Plain English)
1. **Why Fibonacci Sphere instead of random latitudes/longitudes?**  
   Standard `theta/phi` grids bunch thousands of points tightly at the North and South Poles. Stepping vertically (`y` from `1` to `-1`) while rotating horizontally by the Golden Angle (`~137.5°`) spaces every dot equidistantly across the sphere like sunflower seeds.
2. **3D Simplex + Divergence-Free Curl Noise (`simplex3d.glsl`):**  
   - **Simplex Noise (`snoise`)** smoothly pushes points inward/outward like breathing hills along the sphere surface.
   - **Curl Noise (`curlNoise`)** takes spatial derivatives across nearby samples so points swirl gracefully *around* eddies instead of clumping into ugly pinholes.
3. **Every S1 Uniform Explained:**
   - `uTime`: Continuous clock advancing noise eddies (`paused` when reduced motion is enabled).
   - `uPointer` (`vec2`, `-1..1`) & `uPointerStrength`: Cursor position on screen; points inside radius `1.35` gently scatter outward and sideways (radial + tangent vector push).
   - `uScroll` (`0..1`): As the user scrolls past the Hero, noise calms down (`mix(1.0, 0.22, uScroll)`) and brightness locks onto horizontal contour bands matching **S2**.
   - `uDisplacementAmp`, `uNoiseFreq`, `uCurlMix`: Height of waves, spatial tightness of folds, and sideways fluid swirl blend.
   - `uBasePointSize` & `uPixelRatio`: Scales point sprites consistently on 1x monitors vs Retina 2x displays (`clamp(size, 1.2, 13.0)`), shrinking slightly deeper inside `-mvPosition.z` for natural 3D depth.
   - `aSeed`: Per-vertex deterministic pseudo-random number (`0..1`) giving subtle organic particle size variance without using impure `Math.random()` inside render.
   - `uColorCyan`, `uColorViolet`, `uColorContour`, `uOpacity`: Fragment shader mixes cyan and violet by displacement height and grazing angle (`vRim`, Fresnel edge factor), dims distant back-hemisphere points (`depthAtten`), and fades corners via `smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5))` into soft luminous circles.

### Trade-offs vs alternatives
| Option | Trade-off | Decision |
|---|---|---|
| **GPU Vertex Displacement via `ShaderMaterial`** | Runs position math in parallel across thousands of shader cores; single draw call, constant CPU cost. | **Chosen** |
| Updating `BufferAttribute` positions on CPU every frame | Looping over 55,000 vertices in JavaScript per frame plus uploading buffers every tick burns CPU and PCIe bandwidth. | Rejected |
| External `@react-three/drei` Sparkles preset | Quick setup, yet cannot morph cleanly into S2's contour bands or deliver custom simplex+curl vector displacement. | Rejected |

### Interview Questions & Model Answers
1. **Q:** *Why use `curlNoise` alongside scalar `snoise` instead of using 3 independent noise channels directly for `xyz` movement?*  
   **A:** Three independent scalar noise channels compress or pinch particles into sinks where field divergence is non-zero. Curl noise is mathematically divergence-free ($\nabla \cdot (\nabla \times \mathbf{F}) = 0$), meaning the velocity field flows continuously like incompressible fluid without unnatural bunching.
2. **Q:** *How do you keep a custom `THREE.BufferGeometry` and `THREE.ShaderMaterial` from leaking GPU VRAM in a Single Page App?*  
   **A:** JavaScript garbage collection frees CPU objects, not allocated WebGL buffers/programs. Placing `geometry.dispose()` and `material.dispose()` inside a React `useEffect` cleanup hook guarantees GPU buffers are freed whenever density presets swap or the component unmounts.
3. **Q:** *Why compute deterministic point seeds using a trig hash (`sin(index * 12.9898) * 43758.5453`) rather than `Math.random()`?*  
   **A:** React StrictMode double-invokes initializers in dev, and deterministic hashes guarantee identical geometry layout across reloads, screenshots, and React concurrent renders.

---

## Module 04 — S2 Topographic Contour Sphere & Split Mechanics (`shaders/s2ContourSphere.*`, `components/canvas/ContourSphere.tsx`)

### What it does
Renders a sculptural dark sphere etched with razor-sharp, screen-space anti-aliased monochrome contour lines (`#F3F5F9` on `#07080B`) that can slice cleanly apart along an angled cutting plane (`uSplitProgress`) for transitions, preloader reveals, and editorial dividers, backed by a static crisp `<svg>` fallback (`ContourSphereFallback`).

### How the Math & Shader Uniforms Work (Plain English)
1. **How procedural contour lines stay razor-sharp (`fwidth` anti-aliasing):**  
   In `s2ContourSphere.frag.glsl`, multi-octave 3D Simplex noise computes an elevation height `h` (`0..1`) at every pixel on the sphere. Multiplying `h * uContourCount` (e.g., `14` bands) and taking `fract()` slices space into repeating elevation rings (`0..1`), just like lines on a hiking topographic map. Because GLSL's `fwidth(scaled)` measures how fast elevation changes across adjacent screen pixels, `smoothstep(uLineWidth - fw, uLineWidth + fw, band)` paints crisp `1px`-antialiased contour rings without blurry textures!
2. **Preventing Stretched Polygons When the Sphere Splits (`aSplitSide`):**  
   A naive vertex shader that moves vertices `+gap` or `-gap` on opposite sides of a plane stretches triangles crossing `dot(dir, splitAxis) == 0` like pulled taffy. `buildSplitAwareContourSphereGeometry` converts the `IcosahedronGeometry` with `.toNonIndexed()` and classifies each triangle's **centroid** once onto `+1` or `-1` via `aSplitSide`. Both halves therefore detach along an authentic faceted cleft with `DoubleSide` visibility and zero warped triangles, while `vSeamProximity` highlights the split rim cleanly with `uAccentRim` (`#FF5B1F`).
3. **Every S2 Uniform Explained:**
   - `uNoiseScale`, `uDisplacementAmp`: Controls fold frequency and mild surface silhouette wobble.
   - `uContourCount`, `uLineWidth`: Number of elevation contour rings and normalized ring thickness.
   - `uSplitProgress` (`0..1`) & `uSplitGap`: Animates separation distance along `normalize(vec3(0.32, 0.92, 0.18))`.
   - `uLineColor` (`#F3F5F9`), `uBgColor` (`#07080B`), `uAccentRim` (`#FF5B1F`): Palette colors synced to `_tokens.scss`.

### Trade-offs vs alternatives
| Option | Trade-off | Decision |
|---|---|---|
| **Procedural Fragment Isolines via `fwidth()`** | Infinite resolution at any zoom/DPR, ~2 KB GLSL, zero PNG texture downloads or seam UV distortion. | **Chosen** |
| Wrapping a high-res contour PNG texture onto `SphereGeometry` | Suffers equirectangular pinching at the poles, blurry zooming, and extra network payload. | Rejected |
| Pre-modeled Blender `.glb` two-half mesh | Large binary asset download and fixed contour density that cannot respond to runtime scroll/split uniforms. | Rejected |

### Interview Questions & Model Answers
1. **Q:** *Why does `fwidth(scaled)` eliminate shimmering/moiré artifacts on procedural contour shaders?*  
   **A:** On silhouette edges wrapping away from the camera, surface height changes rapidly across one screen pixel. Dividing or smoothing using `fwidth()` (which computes $|\frac{\partial v}{\partial x}| + |\frac{\partial v}{\partial y}|$) widens the fade width automatically to match screen-space rate of change so lines neither vanish nor alias into dashed shimmer.
2. **Q:** *Why convert `IcosahedronGeometry` with `.toNonIndexed()` before splitting vertices by plane in the vertex shader?*  
   **A:** Indexed geometry shares vertices among adjacent triangles; moving one vertex shifts all neighboring triangles, stretching any polygon straddling the split plane across the gap. Un-indexing lets each triangle receive an independent `aSplitSide` classification from its centroid so triangles move cleanly with one hemisphere.
3. **Q:** *How is accessibility/resilience handled if a recruiter opens the site with `prefers-reduced-motion` or hardware acceleration disabled?*  
   **A:** `CanvasErrorBoundary`, `webglSupported` detection, and `useReducedMotion` share one fallback interface rendering `ContourSphereFallback`, an inline semantic SVG replicating both the closed and split states with zero GPU dependency.

---

## Module 05 — Isolated Shader Lab Sandbox (`app/lab/page.tsx`, `app/lab/ShaderLabClient.tsx`)

### What it does
Provides a dedicated `/lab` verification route (excluded from SEO crawling/sitemap via `robots: { index: false }`) to test S1, S2, the S1->S2 scroll morph handover, desktop vs mobile particle budgets, `leva` live uniform controls, WebGL error boundaries, and static SVG fallbacks before integrating Section 01 Hero.

### Interview Questions & Model Answers
1. **Q:** *Why build an isolated `/lab` route before integrating shaders into real sections?*  
   **A:** Isolating shaders lets you verify visual craft, shader compilation, mobile particle budgets, and disposal lifecycles without scroll pinning, DOM text, or layout complexity masking GPU performance bugs.
2. **Q:** *Why guard `<Canvas>` and `<Leva>` behind a `mounted` check in Next.js App Router?*  
   **A:** `Leva` and WebGL contexts require browser globals (`window`, `document`, `WebGL2RenderingContext`). Mounting them cleanly on the client after initial hydration avoids SSR errors and keeps first HTML output lightweight.
3. **Q:** *How is `app/lab` kept from diluting production SEO or bloating main visitor bundles?*  
   **A:** `app/lab/page.tsx` sets `robots: { index: false, follow: false }`, `/lab` is excluded from `sitemap.ts`/`robots.ts` and public navigation, and `leva` is imported strictly inside `/app/lab` so Next.js tree-shaking keeps it out of `/` and `/projects/[slug]`.
