# ANIMATION_MAP.md — SIGNAL Portfolio

Single source of truth for **animation ownership, scroll triggers, and WebGL shader budget**.

> **Invariant:** One animation library owns one element/property. Never animate the same element or CSS property with both GSAP and Framer Motion. Never write scroll/pointer values to React `useState` per frame; use `useSceneStore` (Zustand transient reads inside `useFrame`).

---

## 1. Core Engines & Synchronization

| System | Owner | Mechanism | Cleanup / Reduced-Motion Behavior |
|---|---|---|---|
| Smooth scroll | **Lenis** (`SmoothScrollProvider`) | `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add((t) => lenis.raf(t * 1000))` + `gsap.ticker.lagSmoothing(0)` | Destroyed on unmount. **Disabled** under `prefers-reduced-motion: reduce` (uses native browser scroll). |
| Shared frame state | **Zustand (`useSceneStore`)** | Transient mutable getters (`scrollY`, `scrollProgress`, `velocity`, `pointer`, `activeSection`) read inside R3F `useFrame` | Zero React re-renders per frame. |
| Scroll triggers | **GSAP + ScrollTrigger (`lib/gsap.ts`)** | Registered once; components bind via `@gsap/react` (`useGSAP`) scoped with `scope` ref | `useGSAP` auto-reverts animations & kills ScrollTriggers on unmount. |
| Persistent 3D | **R3F `<Canvas>` (`CanvasRoot`)** | Single fixed canvas (`next/dynamic`, `ssr: false`, `aria-hidden="true"`), `dpr` `[1, 1.5]` mobile / `[1, 2]` desktop | Disposes geometries, materials, textures on unmount; pauses when tab hidden; falls back to static SVG/image on low GPU / WebGL error / reduced motion. |

---

## 2. Shader Catalog Mapping (`S1–S8`) & Per-Viewport Budget

**Hard Budget:** Maximum **2** active WebGL effects in any single viewport (`01–08`).

| Shader ID | Title | Section(s) | Key Uniforms / Props | Active Co-Shader | Total WebGL in Viewport | Fallback (Low GPU / Reduced Motion / No WebGL) |
|---|---|---|---|---|---|---|
| **S1** | Hero Point-Cloud Blob | `01 Hero` (morphs toward `02`) | `uTime`, `uPointer`, `uScroll`, `uDisplacement`, `uColorA` (`$cyan`), `uColorB` (`$violet`) | **S8** (subtle grain/vignette) | **2** | Static rendered silhouette + subtle CSS radial glow |
| **S2** | Topographic Contour Sphere | `Preloader`, `02 About`, dividers, `Footer` mark | `uTime`, `uNoiseScale`, `uContourCount`, `uSplitProgress` | **S8** (or none on dividers) | **1–2** | Crisp inline SVG contour spheres & dividers |
| **S3** | Halftone Project Reveal | `03 Selected Projects` (MUZO & Office Aid previews) | `uTexture`, `uMouse`, `uRevealRadius`, `uDotDensity`, `uResolution` | **S8** | **2** | Unprocessed full-colour `next/image` (also default on touch & reduced motion) |
| **S4** | Chromatic Glass Object | `08 Contact` (and optional hover accent) | Drei `MeshTransmissionMaterial` (`transmission`, `thickness`, `chromaticAberration`, `ior`) + CC0 HDRI | **S8** | **2** | Static pre-rendered glass PNG + CSS `conic-gradient` edge highlight |
| **S5** | Chrome Fluid Arches | `07 Aspirations` | `MeshPhysicalMaterial` (`metalness: 1`, `roughness: 0.08`) + scroll camera drift (`uScrollSection`) | **S8** | **2** | Static pre-rendered monochrome chrome arch image |
| **S6** | Particle Dissolve | Optional `02 About` portrait (if photo supplied) / section transitions | `uTexture`, `uProgress` (`0..1`), `uTime`, `uScatterStrength` | **S8** *(mutually exclusive with S2 when portrait active)* | **2** | Smooth CSS `opacity` cross-fade & unprocessed `next/image` |
| **S7** | Scroll-Velocity Distortion | `06 Beyond the screen` (`$paper` light band) | `uVelocity` (clamped Lenis velocity), `uRgbShift`, `uStreakDir` | **S8** (vignette disabled on `$paper`) | **1–2** | Effect disabled; crisp static editorial layout |
| **S8** | Film Grain & Vignette | Global (`01–05`, `07–08`; muted/off on `06`) | `uTime`, `uOpacity` (`<= 0.06`), `uVignette` | Combined with at most 1 scene shader | **<= 2** | Disabled (`0` overhead) under reduced motion & low GPU |

*(Note: Section 04 Toolkit uses a lightweight point constellation rendered inside the single `<Canvas>` when scrolled into view, paired with S8 -> max 2 WebGL effects.)*

---

## 3. Complete Element Ownership Table (`Section -> Element -> Library -> Trigger -> Properties`)

| Section | Element / Selector | Owner Library | Trigger | Animated Properties | Reduced-Motion Behavior |
|---|---|---|---|---|---|
| **Preloader** | `.preloader-curtain`, `.preloader-contours` | **GSAP** | Mount (first visit only via `sessionStorage`, <= 2s, skippable) | `clipPath`, `transform (y, scale)`, `opacity` | Completely bypassed (`return null`) |
| **Navigation** | `.nav-bar`, `.nav-active-indicator` | **CSS + GSAP ScrollTrigger** | Scroll section intersection callbacks (`useSceneStore.activeSection`) | CSS `transform: scaleX()` active bottom hairline & color transition | Instant state highlight |
| **Navigation** | `.mobile-drawer`, `.mobile-backdrop` | **Framer Motion** (`AnimatePresence`) | Menu toggle button click / `Esc` | `x`, `opacity` | Instant show/hide (`duration: 0`) |
| **Global** | `.custom-cursor` | **Vanilla rAF + Pointer Ref** | `pointermove` on `(pointer: fine)` desktop | `transform: translate3d(x, y, 0)`, `scale` on link hover | Disabled (`null`); system cursor never hidden on touch/reduced motion |
| **01 Hero** | `.hero-name`, `.hero-headline`, `.hero-sub` | **GSAP + SplitText** | Initial client mount (text starts visible at `opacity: 1` for LCP!) | Subtle `y` settle & char stagger (`0.025s/char`, `cubic-bezier(0.16,1,0.3,1)` via `ease: "expo.out"`) | Immediate static layout (`y: 0`, no split animation) |
| **01 Hero** | `.hero-cta-magnetic`, `.hero-social-btn` | **Framer Motion** | Hover / focus / tap / pointer offset | `x`, `y` (spring), `scale` | Hover border/color only; no spring offset |
| **01 Hero** | `HeroBlob` (`S1`) | **R3F (`useFrame`)** | Continuous time + `uPointer` + `uScroll` (GSAP ScrollTrigger writes store) | Vertex noise displacement, point size, morph factor to S2 | Static fallback visual |
| **02 About** | `.about-hud-line` (SVG 1px trace), `.about-reveal`, `.about-caption` | **GSAP + ScrollTrigger** | Scroll enter (`once: true`) & scrub across `#about` / `#about-s2-aperture` | `strokeDashoffset`, subtle `y` reveal/parallax, `aboutSplit` store scrub (`0..0.92`) | Line drawn immediately (`dashoffset: 0`), `y: 0`, `opacity: 1` |
| **02 About** | `ContourSphere` (`S2` in `#about-s2-aperture`) | **R3F (`useFrame`)** | Tracked to `#about-s2-aperture` DOM box + `useSceneStore.aboutSplit` | Screen-space frustum alignment (`position`, `scale`), rotation, `uSplitProgress` | Static `ContourSphereFallback` inline SVG inside `#about-s2-aperture` |
| **03 Projects** | `.projects-hud-line`, `.projects-reveal` | **GSAP + ScrollTrigger** | Scroll enter `#projects` (`once: true`) | `strokeDashoffset`, subtle `y` settle at `opacity: 1` | Immediate drawn line, `y: 0`, `opacity: 1` |
| **03 Projects** | `.projects-showcase-pin` (outer pinned frame + `.railFill`) | **GSAP + ScrollTrigger** | Scroll across `#projects` (`matchMedia("(min-width: 1024px)")` only; linear stack `< 1024px`) | `pin`, active project step (`0 -> 1`), HUD progress bar `scaleX` | No pinning; full stacked showcase for all featured projects |
| **03 Projects** | `ProjectReveal` (`S3` aligned to `#projects-s3-stage`) | **R3F (`useFrame`)** | DOM bounding-box projection + hover / `Full-Color View` lock | `uRevealRadius` lerp `0 <-> 0.54 / 1.45`, `uMouse`, `fitContainUv` | Full-colour `next/image` rendered seamlessly inside stage |
| **03 Projects** | `.project-screen-caption`, `.more-work-hover-preview`, `.more-work-accordion` | **Framer Motion** (`AnimatePresence`) | Screen switch, archive row hover/focus, accordion expand/collapse | `opacity`, `y`, `height` (isolated from GSAP nodes) | Instant expand/collapse (`duration: 0`) |
| **Case Studies** | `.case-study-gallery-frame` | **Framer Motion** (`motion.div` opacity) | Screenshot tab selection on `/projects/[slug]` | `opacity` crossfade across pre-mounted frames | Instant screenshot switch (`duration: 0`) |
| **04 Toolkit** | `.toolkit-category-grid` | **GSAP + ScrollTrigger** | Scroll enter `#toolkit` (once) | `y`, `opacity` stagger (`0.06s`) | Immediate `opacity: 1, y: 0` |
| **04 Toolkit** | `.skill-chip`, `.skill-highlight-pill` | **Framer Motion** | Hover / focus on skill or category filter | `borderColor`, `backgroundColor`, `scale` | Instant border/color highlight |
| **04 Toolkit** | `ToolkitConstellation` | **R3F (`useFrame`)** | Pointer proximity + section visibility | Subtle star drift & hovered category node glow | Static subtle dot pattern |
| **05 Journey** | `.journey-spine-line` (SVG path) | **GSAP + ScrollTrigger** | Scroll scrub across `#journey` | `strokeDashoffset` (`1 -> 0`) | Full line visible immediately |
| **05 Journey** | `.journey-entry` | **GSAP + ScrollTrigger** | Sequential reveal per entry (`start: "top 82%"`) | `y`, `opacity`, HUD dot activation | Immediate `opacity: 1, y: 0` |
| **05 Journey** | `.cert-detail-panel` (expandable credential note) | **Framer Motion** (`AnimatePresence`) | Click toggle on certificate row | `height`, `opacity` | Instant toggle |
| **06 Beyond** | `.beyond-paper-section`, `.beyond-headline`, `.beyond-caption` | **GSAP + ScrollTrigger** | Scroll enter `#beyond` | `y`, `opacity` (tight editorial stagger) | Immediate static layout |
| **06 Beyond** | `VelocityDistortion` (`S7` on Section 06 band) | **R3F (`useFrame`)** | `useSceneStore.velocity` (clamped `[-1.5, 1.5]`) | Skew, directional streak & subtle RGB shift | Disabled (`uVelocity = 0`) |
| **07 Aspirations** | `.aspirations-copy` | **GSAP + ScrollTrigger** | Scroll enter `#aspirations` | `y`, `opacity` | Immediate `opacity: 1, y: 0` |
| **07 Aspirations** | `ChromeArches` (`S5`) | **R3F (`useFrame`)** | `useSceneStore` section progress | Camera arc drift & arch harmonic ripple | Static pre-rendered monochrome image |
| **08 Contact** | `.contact-line-art` (original connection SVG), `.contact-intro` | **GSAP + ScrollTrigger** | Scroll enter `#contact` | SVG `strokeDashoffset`, `y`, `opacity` | Immediately drawn & visible |
| **08 Contact** | `.contact-form-feedback` (success / error alert), `.contact-submit-btn` | **Framer Motion** (`AnimatePresence`) | Form submit state change / hover / tap | `opacity`, `y`, `scale` | Instant alert appearance |
| **08 Contact** | `GlassObject` (`S4`) | **R3F (`useFrame`)** | Continuous slow tumble + pointer tilt | `rotation.x`, `rotation.y` | Static PNG + CSS dispersion accent |
| **Footer** | `.footer-wordmark`, `.footer-contour-split` | **GSAP + ScrollTrigger** | Scroll enter `<footer>` | Subtle split reveal & `y` settle | Immediately visible |
