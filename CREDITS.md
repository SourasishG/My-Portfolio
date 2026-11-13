# CREDITS.md — Fonts, Libraries, HDRIs & Third-Party Assets

All external fonts, HDRI environments, textures, and libraries used in **SIGNAL** are recorded here with their source and license.

---

## Fonts
- **Instrument Serif** — Designed by Rodrigo Fuenzalida & Jordan Engel (Instrument), served via `next/font/google` (`display: 'swap'`). License: SIL Open Font License 1.1.
- **Newsreader** — Designed by Production Type, served via `next/font/google` (`display: 'swap'`). License: SIL Open Font License 1.1.
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

## Personal Media, Derived Assets & Monocular Depth
- Portraits, MUZO UI screenshot, Resume PDF, and Certificates — User-supplied personal files by **Sourasish Ghosh** (originals preserved untouched in `/assets-source/`, optimized files served from `/public/`).
- **rembg (u2net ONNX)** — Automated background removal tool by Daniel Gatis, MIT License (`https://github.com/danielgatis/rembg`), based on U2-Net (Qin et al.). Used solely to produce `portrait-cutout.webp` without facial distortion.
- **MiDaS v2.1 Small ONNX** — Monocular relative depth estimation model by Ranftl et al. (Intel ISL), MIT License (`https://github.com/isl-org/MiDaS`). Used solely to generate the derived grayscale heightmap `portrait-depth.png` for 2.5D displacement without facial alteration.

## HDRIs / Environments
- **S4 Procedural Glass Studio Environment** (`components/canvas/GlassObject.tsx`) — Self-contained procedural equirectangular specular + spectral light card map baked into a Three.js `PMREMGenerator` environment texture (`0` external HDRI network dependencies, `0` third-party attribution required).
