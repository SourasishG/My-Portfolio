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
2. **Laser-Smooth Circular Split Mechanics (`aSplitSide` + Dual Hemisphere Caps):**  
   A naive single sphere mesh that shifts vertices across an oblique cutting plane either stretches straddling triangles or exposes jagged sawtooth steps along icosahedron edges. `buildSplitAwareContourSphereGeometry` instead builds two matching spherical hemisphere caps rotated cleanly onto `SPLIT_AXIS` so every vertex along the `theta = PI/2` equator aligns seamlessly when closed (`uSplitProgress = 0`), then parts along a razor-clean diagonal circle when `uSplitProgress > 0`. Meanwhile, checking `gl_FrontFacing` in the fragment shader shades the hollow interior shell deep matte obsidian so looking inside the split reveals real 3D sculptural depth.
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
2. **Q:** *How do you keep a spherical mesh split completely smooth along a diagonal cut without jagged triangles or seam creases when closed?*  
   **A:** Constructing North and South spherical hemisphere caps (`theta = 0..PI/2` and `PI/2..PI`), aligning their mutual equator ring orthogonal to `SPLIT_AXIS`, and tagging each half with `aSplitSide` ensures vertices meet identically at `uSplitProgress = 0` (zero visible seam) and open cleanly along an exact geometric circle when separated.
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


---

## Module 06 — Persistent Smooth Scroll & Scene Engine (`components/layout/SmoothScrollProvider.tsx`, `CanvasPortal.tsx`, `SceneRoot.tsx`, `GrainOverlay.tsx`)

### What it does
- `SmoothScrollProvider`: Runs one global **Lenis** smooth-scroll controller synchronized strictly to `gsap.ticker` (`lagSmoothing(0)`) and `ScrollTrigger.update()`, captures fine-pointer coords on `window`, and routes `#section` clicks cleanly without conflicting with Locomotive Scroll.
- `CanvasPortal` + `SceneRoot`: Dynamically mounts the single persistent `<Canvas>` outside Server Components (`ssr: false`), scales WebGL `dpr` (`[1, 2]` desktop / `[1, 1.5]` mobile), enforces the max-2-shader budget (**S1** + **S8** on Hero), listens for `webglcontextlost`/`webglcontextrestored`, pauses rendering when the browser tab is hidden, and disables `<Canvas>` automatically on `/lab`, reduced motion, or tier-0 GPUs.
- `GrainOverlay` (**S8**): Lightweight fullscreen post-pass adding subtle organic film grain (`opacity <= 0.04`) and gentle edge vignette without extra postprocessing render-target passes.

### Why this architecture was chosen
Next.js 16 Server Components forbid `next/dynamic(..., { ssr: false })` directly inside server files. Wrapping `SceneRoot` inside a tiny `"use client"` bridge (`CanvasPortal`) keeps `app/layout.tsx` a pure Server Component with fast SSR HTML and zero Three.js bytes on initial render blocking LCP, while syncing `useSceneStore.setUseStaticFallback` ensures `Hero` never shows an empty canvas void if WebGL drops.

### Interview Questions & Model Answers
1. **Q:** *Why connect Lenis specifically to `gsap.ticker` with `gsap.ticker.lagSmoothing(0)` instead of running a separate `requestAnimationFrame` loop?*  
   **A:** Two independent animation loops drift out of phase by sub-frame milliseconds, causing pinned ScrollTriggers to jitter during fast wheel flings. Driving `lenis.raf()` directly inside `gsap.ticker` executes scroll easing and ScrollTrigger measurement in the exact same frame tick, while `lagSmoothing(0)` prevents GSAP from warping time deltas after a tab resume.
2. **Q:** *Why put `next/dynamic({ ssr: false })` inside `CanvasPortal` instead of directly inside `app/layout.tsx`?*  
   **A:** In Next.js App Router, `app/layout.tsx` is a Server Component, and Next 16 prohibits `ssr: false` inside Server Components. Isolating `dynamic()` in a Client Component preserves SSR benefits for layout metadata, JSON-LD, and Hero text while deferring WebGL compilation cleanly to the client.
3. **Q:** *Why write a standalone raw GLSL `GrainOverlay` (`S8`) mesh rather than stacking `@react-three/postprocessing` `EffectComposer` + `Noise` + `Vignette` on Hero?*  
   **A:** Full `EffectComposer` ping-pong framebuffers allocate extra offscreen render targets every frame, hurting fill-rate on integrated laptop GPUs and high-DPR phones. A single fullscreen transparent quad with zero vertex projection (`vec4(position.xy, 0.0, 1.0)`) delivers tasteful film grain at virtually zero VRAM cost.

---

## Module 07 — Chrome Shell: Navigation, Editorial Preloader & Reticle Cursor (`Navigation.tsx`, `Preloader.tsx`, `CustomCursor.tsx`, `MagneticButton.tsx`)

### What it does
- `Navigation`: Fixed 64px HUD bar with `[ SG ]` monogram, desktop numbered anchors (`01`–`08`), live `KOLKATA HH:MM IST` telemetry clock, crisp Resume download CTA (`>= 44px` hit target), and a **Framer Motion** slide drawer below `1024px` with focus restoration and `Esc` close support.
- `Preloader`: First-visit `sessionStorage`-gated curtain reveal (`~1.25s`) featuring the split **S2** contour geometric mark and accessible skip `<button>` + `Esc` handler; suppressed cleanly on `/lab` and under `prefers-reduced-motion`.
- `CustomCursor` & `MagneticButton`: Desktop fine-pointer trailing reticle via a single vanilla `rAF` transform ref, plus Framer Motion spring buttons (`useMotionValue` + `useSpring`) completely decoupled from GSAP timelines.

### Library Ownership & Trade-offs
| Concern | Owner | Reason |
|---|---|---|
| Mobile drawer slide + magnetic buttons | **Framer Motion** | Excels at declarative React mount/unmount (`AnimatePresence`) and pointer spring physics (`useSpring`). |
| Preloader clip curtain + Hero scroll morph | **GSAP** | Excels at deterministic multi-step timelines and scroll-linked scrubbing without React re-renders. |
| Trailing pointer reticle | **Vanilla `rAF` DOM ref** | Avoids per-frame React state updates or heavy spring listeners across global mousemove. |

### Interview Questions & Model Answers
1. **Q:** *Why must `Navigation`, `Preloader`, `CustomCursor`, and `SceneRoot` check `pathname.startsWith("/lab")`?*  
   **A:** `/lab` mounts its own standalone R3F `<Canvas>` and `Leva` debugging drawer. Suppressing global portfolio chrome on `/lab` prevents dual WebGL contexts and overlapping UI bars while keeping `/` layout code clean without refactoring folders.
2. **Q:** *Why keep KOLKATA time formatting inside a client `useEffect` rather than rendering `new Date()` directly?*  
   **A:** Server timezones (e.g., UTC on Vercel build/edge servers) often differ from client clocks or trigger React hydration mismatches if formatted synchronously during render. Deferring updates to client effects keeps SSR deterministic.
3. **Q:** *Why must Framer Motion (`MagneticButton`) never be targeted by GSAP transforms on the same DOM node?*  
   **A:** Both GSAP and Framer Motion mutate inline `transform` matrices. Competing writers overwrite each other unpredictably and leak stale values on cleanup, whereas wrapper isolation gives Framer Motion its outer motion `div` while GSAP never touches CTA transforms.

---

## Module 08 — Section 01 Kinetic Hero & Static Fallback (`components/sections/Hero.tsx`, `Hero.module.scss`)

### What it does
Renders the immediate SSR editorial Hero (`SOURASISH GHOSH`, `"I design, develop, and build digital experiences."`, honest bio retaining `"passionate"`, open-to-roles badge, magnetic CTAs for Projects / Resume / Contact, social HUD links, and `HeroBlobFallback` SVG backdrop when WebGL is inactive).

### LCP Protection & Animation Design
- `<h1>SOURASISH GHOSH</h1>` renders synchronously at **`opacity: 1`** on SSR—GSAP `SplitText.create` only performs a subtle upward `yPercent: 22 -> 0` mask settle inside line containers (`mask: "lines"`, `aria: "auto"`) without fading from zero opacity.
- `#hero` ScrollTrigger scrubs cleanly `0 -> 1` into `useSceneStore.getState().setHeroMorph(self.progress)` while marking active section `"hero"` / `"about"`.

### Interview Questions & Model Answers
1. **Q:** *Why animate `yPercent` inside SplitText line masks instead of starting `opacity: 0` on the Hero headline?*  
   **A:** Waiting 1+ seconds for JavaScript hydration + font load before turning `opacity: 0 -> 1` delays Largest Contentful Paint (LCP) and risks blank above-the-fold frames if scripts load slowly on 3G. Keeping `opacity: 1` delivers instant visual content on initial HTML paint.
2. **Q:** *How does `SplitText.create(..., { mask: "lines", aria: "auto" })` protect accessibility?*  
   **A:** Naive character-splitting tools turn `"SOURASISH"` into 9 separate `<div>` elements that screen readers read letter by letter (`S - O - U...`). GSAP 3.15 `aria: "auto"` attaches an `aria-label` on the parent and hides split spans from screen-reader narration, and we also preserve explicit whitespace between first and last name spans.
3. **Q:** *How does the Hero layout keep left typography readable without dimming the 3D point cloud across the entire screen?*  
   **A:** A directional CSS scrim darkens behind the left copy (`0% -> 46%`) while decaying to transparent alpha on the right half so `S1` keeps full luminous color depth.


---

## Module 09 — Section 02 Personal Architecture & S2 Viewport-Tracked Aperture (`components/sections/About.tsx`, `ContourSphere.tsx`, `SceneRoot.tsx`)

### What it does
Integrates Section 02 (`#about`): the editorial narrative (progression from frontend -> full-stack -> cloud, quick-learner/patient problem-solver philosophy, honest exploration story of **Next.js / TypeScript / Three.js / R3F / Framer Motion**, and SNU B.Tech CSE CGPA `8.08`), four structured engineering pillar cards, the optimized studio portrait (`portrait-main.jpg` via `next/image`), an SVG hairline stroke trace drawn on scroll, and `#about-s2-aperture` showcasing the live **S2 Topographic Contour Sphere**.

### How DOM-to-WebGL Sync Works Without Re-Renders
1. `#about-s2-aperture` sits in standard scrolling HTML layout with a transparent interior background (`background: transparent`) and CSS corner brackets.
2. When `activeSection === "about"`, `HeroBlob` (**S1**) turns off and `ContourSphere` (**S2**) wakes up cleanly inside the single persistent `<Canvas>` (**strictly <= 2 WebGL shaders active**: S2 + S8).
3. Inside R3F `useFrame`, `ContourSphere` checks `#about-s2-aperture.getBoundingClientRect()` and projects screen center & width directly into Three.js world space using `state.viewport.width` and `state.viewport.height`, scaling diameter smoothly (`worldBox * 0.78 / 2.9`). Scroll-linked `ScrollTrigger` writes `aboutSplit` (`0..0.92`) directly into Zustand without React `setState`.

### Interview Questions & Model Answers
1. **Q:** *Why align an R3F mesh inside a fixed full-screen `<Canvas>` to a scrolling DOM element via `getBoundingClientRect()` instead of rendering a second `<Canvas>` directly inside Section 02?*  
   **A:** Mounting one `<Canvas>` per section exhausts WebGL context limits cleanly around 8–16 contexts across mobile Safari/Chrome, multiplies GPU memory per shader program, and causes flicker during rapid scroll transitions. One fixed persistent `<Canvas>` driven by `state.viewport` gives pixel-exact layout alignment inside any scrolling grid at single-context cost.
2. **Q:** *Why configure `images.qualities: [75, 90]` in Next.js 16 `next.config.ts` when using `quality={90}` on `<Image />`?*  
   **A:** Next.js 16 introduced strict allowlists for `/_next/image` `quality` values (defaulting strictly to `[75]`) so third parties cannot hammer the optimizer with arbitrary quality query strings. Listing `[75, 90]` avoids broken requests/warnings while keeping portrait crispness intact.
3. **Q:** *Why normalize SVG trace length with `pathLength={1}` before animating `strokeDashoffset` with GSAP?*  
   **A:** Measuring pixel `getTotalLength()` depends on SVG layout scaling across breakpoints. Setting `pathLength={1}` lets CSS/GSAP animate `strokeDasharray: 1` and `strokeDashoffset: 1 -> 0` reliably across mobile `360px` and ultrawide `1920px` displays.
