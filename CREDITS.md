# CREDITS.md — Fonts, Libraries, HDRIs & Third-Party Assets

All external fonts, HDRI environments, textures, and libraries used in **SIGNAL** are recorded here with their source and license.

---

## Fonts
- **Geist** & **Geist Mono** — Designed by Vercel, served via `next/font/google` (`display: 'swap'`). License: SIL Open Font License 1.1.

## Icons
- **Lucide Icons (`lucide-react`)** — ISC License (`https://lucide.dev/`).

## 3D, Shaders & Animation Libraries
- **Three.js / `@react-three/fiber` / `@react-three/drei` / `@react-three/postprocessing`** — MIT License.
- **GSAP + `@gsap/react`** (`ScrollTrigger`, `SplitText`) — GSAP Standard "No Charge" License (`https://gsap.com/standard-license/`), verified free for non-paywalled personal portfolios.
- **Framer Motion** — MIT License.
- **Lenis** — MIT License.
- **Zustand** — MIT License.
- **detect-gpu** — MIT License.
- **Leva** (dev/preview `/lab` only) — MIT License.

## Shaders & Procedural Geometry
- **S1–S8 Shaders** (`/shaders/*.glsl`) — Original GLSL implementations authored for SIGNAL (simplex noise adapted from Ashima/Stefan Gustavson MIT-licensed 3D simplex noise pattern, credited in shader headers).
- **S5 Procedural Studio Radiance Environment** (`components/canvas/ChromeArches.tsx`) — Self-contained procedural equirectangular softbox light map baked into a Three.js `PMREMGenerator` environment texture at runtime (`0` external `.hdr` downloads, `0` third-party attribution required).

## Personal Media & Documents
- Portraits, MUZO UI screenshot, Resume PDF, and Certificates — User-supplied personal files by **Sourasish Ghosh** (originals preserved in `/assets-source/`, served from `/public/`).

## HDRIs / Textures (Phase 4)
- *(S4 Chromatic Glass HDRI — CC0 asset from Poly Haven will be recorded here with exact filename & URL when added in Phase 4.)*
