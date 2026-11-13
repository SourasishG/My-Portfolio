# PLAN.md — Phase 2 Architecture & Execution Plan ("SIGNAL")

> **Status:** Phase 2 Deliverable (Pending Checkpoint 1 Approval — No application code written yet).

---

## 1. Site Architecture & Directory Tree

```text
/app
  layout.tsx                 // Root Server Component: Geist + Geist Mono fonts, JSON-LD Person, metadata, providers
  page.tsx                   // Main landing route: semantic Sections 01–08 + Footer
  not-found.tsx              // Custom SIGNAL 404 with S2 contour SVG & recovery links
  sitemap.ts                 // Dynamic sitemap (explicitly excludes /lab)
  robots.ts                  // Standard crawl rules (disallows /lab and /api)
  opengraph-image.tsx        // 1200x630 dynamic OG image in SIGNAL aesthetic
  /projects/[slug]/page.tsx  // Static-generated deep case studies (muzo, office-aid, extensible via content/projects.ts)
  /api/contact/route.ts      // Server-only POST handler: zod validation, honeypot, rate limiting, Resend/Formspree
  /lab/page.tsx              // Isolated Shader Lab (dev/preview only; blocked in prod sitemap/nav) with leva controls
/components
  /canvas                    // SceneRoot (dynamic ssr:false), CanvasErrorBoundary, HeroBlob (S1), ContourSphere (S2), ProjectReveal (S3), GlassObject (S4), ChromeArches (S5), ParticleDissolve (S6), VelocityPlane (S7), GrainOverlay (S8), ToolkitConstellation
  /sections                  // Hero, About, Projects, Toolkit, Journey, Beyond, Aspirations, Contact, Footer
  /ui                        // Button, MagneticButton, HudLabel, SectionIndex, CornerBrackets, Marquee, PlaceholderFrame
  /layout                    // SmoothScrollProvider, Navigation, Preloader, CustomCursor
/shaders                     // *.vert.glsl, *.frag.glsl, shared simplex/curl noise GLSL chunks
/hooks                       // useLenis, useScrollProgress, useReducedMotion, useGpuTier, useMediaQuery
/lib                         // gsap.ts (single plugin registry), store.ts (Zustand transient scroll/pointer), rateLimit.ts, utils.ts
/content                     // projects.ts, certifications.ts, timeline.ts, skills.ts, links.ts, copy.ts
/styles
  /abstracts/_tokens.scss    // Colors, spacing, z-index, radii, motion easings, typography scale
  /abstracts/_mixins.scss    // Breakpoints, fluid type, 1px hairline HUD grid, reduced-motion helpers
  /base/_reset.scss          // Clean modern reset + focus-visible ring
  /globals.scss              // Root CSS variables + base typography
/public
  /images/...                // User-supplied assets only (per Section 19 manifest)
  /docs/                     // Sourasish-Ghosh-Resume.pdf
  /certificates/             // Optional certificate PDFs/images
```

---

## 2. Design Tokens & Contrast Verification (`_tokens.scss`)

### Color System (Section 11.3)
| Token | Value | Role | WCAG AA Contrast Check (Verified) |
|---|---|---|---|
| `$black` | `#000000` | Hero WebGL backdrop & preloader | — |
| `$ink` | `#07080B` | Default page ground (`02–05`, `07–08`) | Base ground |
| `$charcoal` | `#101218` | Elevated containers & project panels | Base elevated |
| `$line` | `rgba(255, 255, 255, 0.12)` | 1px HUD rules, borders, corner brackets | Decorative divider |
| `$white` | `#F3F5F9` | Primary headings & body copy | **18.35:1** on `$ink` (AAA) |
| `$muted` | `#8A90A0` | Secondary copy & HUD labels | **6.27:1** on `$ink`, **5.86:1** on `$charcoal` (AA Pass) |
| `$cyan` | `#4DA8FF` | Primary accent (S1 blob & key focal highlights) | **7.97:1** on `$ink` (AA/AAA) |
| `$violet` | `#B388F5` | Secondary accent (S1 gradient & "Currently exploring" tags) | **7.40:1** on `$ink` (AA/AAA) |
| `$signal` | `#FF5B1F` | Tertiary heat accent (availability dot, primary CTA hover, active nav, HUD focus — **max 2 per viewport**) | **6.45:1** on `$ink` (AA Pass). *Note: **2.82:1** on `$paper` — so on `$paper`, `$signal` is restricted strictly to non-text graphics/accents or large bold 18pt+ strokes, never small text!* |
| `$chrome-hi` | `#E8EDF5` | S5 chrome highlights | — |
| `$paper` | `#F4F4F2` | **ONLY** Section 06 ("Beyond the screen") | Light section ground |
| `$paper-ink` | `#0A0A0A` | Primary text inside Section 06 | **17.98:1** on `$paper` (AAA) |
| `$paper-muted` | `#555966` | Small editorial captions inside Section 06 (contrast-safe replacement for `$muted` on light ground) | **6.34:1** on `$paper` (AA Pass) |

### Typography (`next/font/google` with `display: 'swap'`)
- **Display & Body:** `Geist` (`--font-geist-sans`) — Verified available via Google Fonts (`HTTP 200`).
- **HUD & Mono Labels:** `Geist Mono` (`--font-geist-mono`) — Verified available via Google Fonts (`HTTP 200`).
- **Type Scale:**
  - Hero Name (`SOURASISH GHOSH`): `clamp(3.5rem, 12vw, 11rem)`, `line-height: 0.9`, `letter-spacing: -0.04em`
  - Section Headings: `clamp(2.25rem, 6vw, 5rem)`, `line-height: 0.98`, `letter-spacing: -0.03em`
  - Body: `clamp(1rem, 1.1vw, 1.125rem)` (`16px–18px`), `line-height: 1.6`
  - HUD Mono Labels: `11px–12px`, uppercase, `letter-spacing: 0.08em`
  - Editorial Captions (Ref 6 style): `13px–14px`, narrow max-width (`32ch`), left-aligned below display type.

---

## 3. Section-by-Section Content & Visual Plan

| # | Route / Section | Core Content (100% Verified Facts) | Visual & Motion Design |
|---|---|---|---|
| **Preloader** | Overlay (1st visit) | `SG // SIGNAL` wordmark + S2 contour sphere split | Max 2.0s, click/Esc skippable, `sessionStorage`, bypassed under reduced motion |
| **Nav** | Fixed Header + Mobile Drawer | `SG`, numbered anchors `[01]–[08]`, live `KOLKATA IST` telemetry, Resume & Contact buttons | Translucent `$ink` bar with subtle 1px hairline + Framer Motion drawer on `< 1024px` |
| **01** | **Hero** (`#hero`) | `SOURASISH GHOSH` · `"I design. I develop. I build."` · Full-Stack Developer (`passionate` phrasing retained per user confirmation) · Open-to-roles orange dot · **View Projects**, **Download Resume**, **Contact** + GitHub / LinkedIn / Instagram | Server DOM text paints immediately at `opacity: 1` for instant LCP; **S1 Point Cloud** (`cyan→violet`, pointer-reactive, scroll morph) mounts via `next/dynamic` after first paint |
| **02** | **About** (`#about`) | Personal intro, quick learner & patient problem-solver philosophy, SNU B.Tech CSE (2023–2027), honest portfolio learning story | Asymmetric 2-column grid, **S2 Contour Sphere** (or portrait + **S6** if photo supplied), scroll-drawn HUD trace line |
| **03** | **Selected Projects** (`#projects`) & `/projects/[slug]` | **01 MUZO** (3D Neumorphic CSS token system `#e0e5ec`/`#ff6b35`, single `HTMLAudioElement` engine, Zustand `persist`, `AbortController`, Deezer→iTunes fallback, text-measurement marquee; live Vercel link + GitHub; *volume ramping omitted per code check*). **02 Office Aid** (`May 2026 – Present`, full-stack React 19 + Express 5 + Prisma + Supabase + Gemini `Herric` copilot, Apple Liquid Glass + dark UI; split **Built** vs **Pending/Planned** lists). **More work:** *Pokémon Atlas 3D*, *Support Ticket Dashboard*, *Face Recognition System*, *Gradient Descent Visualizer* (*Orbital Music excluded per user*). | Full-bleed showcase panels with corner brackets, **S3 Halftone→Colour** hover reveal, GSAP pinned desktop showcase; Framer Motion hover preview for "More work" + dedicated case study routes |
| **04** | **Technical Toolkit** (`#toolkit`) | Grouped lists (no percentages/bars): Languages, Frontend, Backend, Databases, Cloud/DevOps, Tools + separate **"Currently exploring"** group (`Next.js`, `TypeScript`, `AI/ML`, `Generative AI`, `LLMs`, `AI agents`, `Three.js`, `R3F`, `Framer Motion`) | Structured grid over restrained canvas point-constellation; hovering a skill highlights related stack & projects |
| **05** | **Experience & Education** (`#journey`) | Vertical timeline: Office Aid (`May 2026 – Present`), MUZO (`Sep 2026`), **AWS DevOps Intern — Employability.life** (`Remote, Nov 2025 – Jan 2026`, accurate unexaggerated duties), 4 Certifications (`XPro27566969`, `03ISU86UC5K4`, `AZ1QO9FKWWB0`, `7QAB657M7FS4`), **SNU** (2023–2027), **Aditya Academy CBSE** (XII 80% 2023, X 86% 2021) | Scroll-scrubbed vertical contour spine with staggered milestone reveals; expandable cert note drawer (`NEEDS INPUT` links until supplied) |
| **06** | **Beyond Technology** (`#beyond`) | Football, Video Games, Music, Movies (strictly no fabricated personal details) | **Single `$paper` (`#F4F4F2`) light interruption**, large tight typography, small Ref-6 captions, `$signal` orange geometric motif, **S7 Velocity Distortion** |
| **07** | **Aspirations** (`#aspirations`) | Honest engineering ambition: mastering end-to-end full-stack architecture, scalable backends, DB/API integration, and AI/LLM workflows | Returns to dark `$ink`; **S5 Chrome Fluid Arches** (`MeshPhysicalMaterial`) with scroll-linked camera drift |
| **08** | **Contact & Footer** (`#contact`) | Invitation copy, email (`sourasishghosh062@gmail.com`), Resume CTA, social links, working form (`react-hook-form` + `zod` + honeypot + rate limit), phone kept off public HTML | **S4 Chromatic Glass Object** + original geometric connection SVG line art + magnetic submit/social buttons + split-contour **Footer** |

---

## 4. Library Justifications & Verified Licenses

### Core Fixed Stack (Section 13)
| Package | Verified Version | License | Justification |
|---|---|---|---|
| `next` / `react` / `react-dom` | `16.4.6` / `19.3.1` | MIT | App Router SSR for instant LCP, static case studies, API route for server-only email, `next/font`, `next/image`. |
| `sass` | `1.108.2` | MIT | Required for SCSS Modules + `_tokens.scss` / `_mixins.scss` (single styling system; **no Tailwind CSS**). |
| `three` / `@react-three/fiber` / `@react-three/drei` | `0.187.0` / `9.8.2` / `10.7.9` | MIT | React 19-compatible declarative Three.js scene inside one persistent `<Canvas>` + `shaderMaterial` & `MeshTransmissionMaterial`. |
| `gsap` | `3.15.1` | Standard "No Charge" License | Verified at `gsap.com/community/standard-license/`: free for personal & commercial sites where end users aren't charged. Covers `ScrollTrigger` + `SplitText`. |
| `framer-motion` | `14.12.0` | MIT | Mount/unmount (`AnimatePresence`), mobile nav drawer, interactive chips, form alerts, magnetic springs. |
| `lenis` | `1.3.27` | MIT | Smooth scroll provider synced exclusively to `gsap.ticker` (never alongside Locomotive Scroll). |
| `lucide-react` | `1.72.0` | ISC | Crisp UI icons consistent across nav, case studies, and contact. |
| `react-hook-form` + `zod` | `7.92.0` + `4.6.7` | MIT | Shared client/server validation schema, accessible field errors, honeypot check. |
| `resend` *(pending confirmation vs Formspree)* | `6.38.0` | MIT | Official Node SDK for `/api/contact/route.ts` server-side delivery. |

### Justified Allowed Extras (Section 13)
| Package | Verified Version | License | Written Justification |
|---|---|---|---|
| `zustand` | `5.1.0` | MIT | Needed as a zero-re-render transient store bridging Lenis scroll velocity/progress and pointer coords directly into R3F `useFrame` without `useState`. |
| `@gsap/react` | `2.1.2` | GSAP Standard | Provides `useGSAP()` context-safe hook for React 19 StrictMode so all ScrollTriggers and SplitText instances revert/kill cleanly on unmount. |
| `detect-gpu` | `5.0.70` | MIT | Classifies client GPU tier (`0–3`) so mid/low devices drop particle counts/postprocessing or switch to static SVG/image fallbacks automatically. |
| `@react-three/postprocessing` | `3.2.2` | MIT | Used sparingly on high-tier GPUs only if needed for subtle vignette/bloom/chromatic dispersion pass (`S4`/`S8`); bypassed on mid/low tiers. |
| `leva` | `0.10.1` | MIT | **Dev/preview-only** tuning controls inside `/lab` for shaders `S1–S8` (never bundled on public production sections). |

*Note: Raw `.glsl` shader imports via Webpack/Turbopack (`raw-loader` or Next.js `turbopack.rules` / `webpack.module.rules` `asset/source`) will be configured natively in `next.config.ts` without extra packages, or typed `.ts` GLSL template strings if Turbopack raw loader hits edge cases.*

---

## 5. Responsive & Performance Plan

- **Responsive Breakpoints (`_mixins.scss`):**
  - `360px` / `390px` (Mobile): Single-column vertical rhythm, zero horizontal overflow, GSAP `pin` disabled (`ScrollTrigger.matchMedia`), S3 halftone defaults to crisp full-colour `next/image`, mobile particle count capped (`~12k` points for S1), `dpr: [1, 1.5]`, drawer navigation, `customCursor` disabled.
  - `768px` (Tablet): Two-column About & Toolkit grids, full-width project showcase panels, touch-friendly `44x44px` minimum hit targets.
  - `1024px` / `1440px` / `1920px` (Desktop): Full split Hero layout, pinned Project Showcase, desktop `dpr: [1, 2]`, `~55k` point S1 sphere (high GPU tier), fine-pointer custom cursor & magnetic buttons.
- **Performance Targets & Guardrails:**
  - **LCP = Hero DOM Text** (`SOURASISH GHOSH`), rendered at `opacity: 1` on initial SSR HTML.
  - **Code Splitting:** `<CanvasRoot>` loaded via `next/dynamic(..., { ssr: false })` after mount; `/lab` excluded from nav/sitemap.
  - **GPU Tiering & Tab Visibility:** `useGpuTier()` scales particle counts (Tier 3 = 55k, Tier 2 = 25k, Tier 0/1 = static fallback). `document.visibilitychange` pauses R3F loop when tab is hidden; Canvas pauses shaders outside active viewport ranges.
  - **WebGL Error Boundary:** Wraps `<Canvas>`; shader compile errors or `webglcontextlost` cleanly render static SVG/PNG fallbacks.
  - **Reduced Motion (`prefers-reduced-motion: reduce`):** Disables Lenis smooth scroll, Preloader, GSAP scroll scrubbing, SplitText, S7 velocity distortion, S8 grain, and custom cursor; shows clean static typography and sharp project images.
