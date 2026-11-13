# REDESIGN_AUDIT.md — SIGNAL Portfolio V2 Audit

**Audit Date:** 13 November 2026  
**Auditor:** Creative Director & Creative Frontend Engineer (Antigravity)  
**Target Subject:** Personal Portfolio of **Sourasish Ghosh**  
**Live Production URL:** `https://my-portfolio-s7ven.vercel.app/`  
**Git Branch:** `redesign/signal-v2` (forked from `main` tagged at `v1-pre-redesign`)

---

## 1. Executive Summary

The existing portfolio (**SIGNAL V1**) is a functional, architecturally sound Next.js 16 App Router application. All data models, routes, form handlers, SEO utilities, and content structures are working reliably with **zero console errors** and strong baseline performance (**Desktop 90 / Mobile 74**). 

However, as diagnosed in Master Prompt V2, the current visual identity suffers from:
1. **Scattered visual focus:** Each section mounts an isolated, distinct 3D visual (blob -> sphere -> halftone plane -> constellation -> shear plane -> chrome arches -> glass crystal) rather than telling **one unified story** through **one persistent evolving scene**.
2. **Generic developer-portfolio layout:** Standard cards, uniform grids, and segmented containers dilute the high-end editorial tension present in reference sites like *Lorenzo Lottici*, *Luka Skhiladze*, and *Sarthak Sharma*.
3. **Absence of a prominent hero portrait:** The current hero relies on an abstract 3D particle blob rather than leading with Sourasish's identity as a creative engineer.
4. **Minor live-site polish gaps:** Visible `NEEDS INPUT` strings on public credentials, preview-deployment OG image domains, an unhidden honeypot label perception, and non-canonical status badges.

The redesign (**SIGNAL V2: "From Noise to Signal"**) will **not** rewrite application logic or throw away working code. It will restyle and reorganize the presentation layer, introduce a cinematic 2.5D interactive halftone portrait hero, unify the WebGL canvas into one persistent evolving scene, and elevate typography, spacing, and micro-interactions to award caliber.

---

## 2. Technical Stack & Infrastructure Inventory

| Layer | Approved Technology | Current Status in Repo | Action for Redesign |
|---|---|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript | `next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1` | **Keep as-is** (RSC architecture, fast builds) |
| **Styling** | SCSS Modules + Central Token Layer | `sass@1.108.2`, `styles/abstracts/_tokens.scss` | **Keep & restyle** tokens to V2 palette (Near-black + Ember) |
| **WebGL & 3D** | Three.js + React Three Fiber + Drei | `three@0.187.0`, `@react-three/fiber@9.8.2`, `@react-three/drei@10.7.9` | **Keep & restyle** scene into unified E1–E6 persistent shader pipeline |
| **Postprocessing** | `@react-three/postprocessing` | Installed (`^3.2.2`) | **Keep sparingly**; prefer raw S8 grain quad for low VRAM cost |
| **Scroll Animation** | GSAP + ScrollTrigger | `gsap@3.15.1`, `@gsap/react@2.1.2` | **Keep** as single scroll-trigger owner |
| **UI Animation** | Framer Motion | `framer-motion@14.12.0` | **Keep** for drawer, tabs, accordion, mount/unmount |
| **Smooth Scroll** | Lenis | `lenis@1.3.27` | **Keep** as single smooth scroll engine (synced to `gsap.ticker`) |
| **State Bridge** | Zustand | `zustand@5.1.0` | **Keep** for 60fps transient scroll/pointer store reads |
| **Hardware Tiering** | detect-gpu | `detect-gpu@5.0.70` | **Keep** for mobile/low-tier shader scaling |
| **Forms & Validation**| React Hook Form + Zod | `react-hook-form@7.92.0`, `zod@4.6.7` | **Keep as-is** (server route `/api/contact` + client resolver) |
| **Icons** | Lucide React | `lucide-react@1.72.0` | **Keep as-is** |
| **Dev Shader Tuning** | Leva | `leva@0.10.1` | **Keep restricted** strictly to `/lab` |

> **Dependency Verdict:** Zero new npm packages are required. The entire stack needed for award-winning interactive craft is already installed, configured, and TypeScript-clean.

---

## 3. Measured Live Site Baseline Performance (13 Nov 2026)

Tested live against `https://my-portfolio-s7ven.vercel.app/` via headless Chrome Lighthouse engine:

### A. Desktop Baseline (`--preset=desktop`)
- **Performance:** **90 / 100**
- **Accessibility:** **100 / 100**
- **Best Practices:** **100 / 100**
- **SEO:** **100 / 100**
- **First Contentful Paint (FCP):** `0.4 s`
- **Largest Contentful Paint (LCP):** `0.4 s`
- **Total Blocking Time (TBT):** `240 ms`
- **Cumulative Layout Shift (CLS):** `0`
- **Speed Index:** `1.3 s`
- **Console Errors:** **0 errors** logged to console

### B. Mobile Baseline (Default 4G Synthetic Throttle)
- **Performance:** **74 / 100**
- **Accessibility:** **100 / 100**
- **Best Practices:** **100 / 100**
- **SEO:** **100 / 100**
- **First Contentful Paint (FCP):** `1.1 s`
- **Largest Contentful Paint (LCP):** `1.1 s`
- **Total Blocking Time (TBT):** `1,330 ms`
- **Cumulative Layout Shift (CLS):** `0`
- **Speed Index:** `3.2 s`
- **Console Errors:** **0 errors** logged to console

### Performance Takeaways for V2:
1. LCP is already excellent (`0.4s` desktop / `1.1s` mobile) because typography renders as synchronous server HTML rather than waiting for WebGL. **We must preserve this: the hero text must remain real DOM text.**
2. Mobile TBT (`1,330ms`) is the main opportunity for improvement. In V2, consolidating multiple heavy shader geometries into a single streamlined scene graph and deferring non-hero shaders will bring Mobile Performance toward the 80–85+ target.

---

## 4. Scene & Interaction Inventory (Current vs V2 Proposal)

| Component / Scene | Current Implementation | Status | V2 Redesign Decision |
|---|---|---|---|
| **Preloader** | Curtain reveal with S2 split contour graphic (`sessionStorage` gated, Esc/click skip) | Working | **Restyle:** Keep fast first-visit intro (`<= 1.8s`, skippable), transition seamlessly into E1 particle convergence. |
| **Navigation** | Fixed HUD top bar, live IST clock, anchor tracking, Framer Motion mobile drawer | Working | **Restyle:** Keep IST clock & anchors, elevate to persistent editorial frame (B5) with floating pill option, active ember pip, and Motion On/Off toggle. |
| **S1 Hero Blob** | 55k point-cloud Fibonacci sphere with curl noise & pointer repulsion | Working | **Retire as primary hero; repurpose as E1 intro:** Evolve into the particle field that converges into the 2.5D portrait hero (B8). |
| **02 About Aperture** | Screen-space aperture tracking 3D contour sphere with split scrub | Working | **Restyle as Pinned Story:** Pin the portrait (dimmed/calm) while 3 short monospace beats change beside it (Lorenzo's technique). |
| **S3 Halftone Reveal** | Aspect-corrected halftone-to-color circular lens hover on `#projects-s3-stage` | Working | **Restyle into E4 Project Stages:** Full-viewport pinned panels (Luka's stage pattern) with halftone-to-color reveal on hover and swipe/key navigation. |
| **Stack Trace Panel** | Hover/focus telemetry panel in Section 04 Toolkit linking skills to projects | Working | **Keep & Restyle:** Preserve the project-connection intelligence; restyle into Luka's numbered row pattern with E5 glyph/dot canvas. |
| **Timeline Spine** | SVG non-scaling-stroke vertical line scrubbed with GSAP strokeDashoffset | Working | **Restyle into E6 Contour Path:** Add travelling ember dot and prominent typography scale for milestones. |
| **S7 Velocity Plane** | Lenis-velocity chromatic shear on light `$paper` band | Working | **Retire $paper light band & S7:** Replace with Section 06 outlined-type velocity ticker (`FOOTBALL · GAMING · MUSIC · MOVIES`) on near-black. |
| **S5 Chrome Arches** | 4 PBR tubular arches with procedural equirectangular PMREM studio map | Working | **Retire heavy PBR arches:** Replace with E3 gentle dot-matrix wave plane and scrubbed word-illumination statement for Aspirations. |
| **S4 Glass Object** | Drei MeshTransmissionMaterial faceted crystal with chromatic aberration | Working | **Retire heavy glass refraction in Contact:** The E1 particle field re-forms faintly in Contact to close the narrative arc ("From Noise to Signal"). |
| **Contact Form** | React Hook Form + Zod, sliding-window rate limit, honeypot, Formspree relay | Working | **Keep 100% logic intact; restyle UI:** Large serif email link, one-click copy, clean inputs, visible focus rings. |
| **Custom Cursor** | Fine-pointer trailing circle & reticle | Working | **Restyle:** Refine to subtle ember dot + ring, strictly disabled on touch/reduced-motion. |
| **Case Studies** | Static dynamic routes `/projects/muzo` and `/projects/office-aid` | Working | **Keep routes and data; restyle:** Align layout with V2 editorial typography and deep black palette. |

---

## 5. Detailed Audit of the 10 Known Live-Site Issues (A10)

| Issue ID | Description | Live Site Evidence | Root Cause in Codebase | V2 Fix on `redesign/signal-v2` |
|---|---|---|---|---|
| **A10.1** | **Visible placeholder on AWS DevOps certificate** | Displays `"NEEDS INPUT (see scan)"` and `"QR Link Needs Input"` on public site | `content/certifications.ts` lines 29–30 & `Journey.tsx` lines 406, 446 | Replace visible placeholder copy with neutral `"Verification available on request"` or embed direct scan viewer. Never show `"NEEDS INPUT"` in user-facing UI. |
| **A10.2** | **Share-preview image domain** | OG & Twitter tags point to `my-portfolio-2dr28h2il-herric-s-team.vercel.app` | `app/layout.tsx` uses `process.env.VERCEL_URL` which resolves to branch preview domain | Default canonical base URL to `https://my-portfolio-s7ven.vercel.app` unless `NEXT_PUBLIC_SITE_URL` is set. |
| **A10.3** | **`/lab` route publicly linked** | Footer colophon includes clickable link to `/lab` | `components/layout/Footer.tsx` line 171 | Remove link from production navigation/footer; guard `/lab` behind `NODE_ENV !== "production"` or hide unless explicitly enabled. |
| **A10.4** | **Contact honeypot "Company" label visibility** | Reported as appearing above "Name" in some environments | `Contact.tsx` line 495 `<label htmlFor="contact-company">Company</label>` with offscreen CSS | Ensure honeypot container has `position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; pointer-events: none;` so it is 100% invisible on all browsers/devices while remaining a silent spam sink. |
| **A10.5** | **"Inspect" buttons without visible destination** | Certification rows and More Work archive rows show button text `"Inspect"` | `Journey.tsx` line 376 and `Projects.tsx` line 556 use `"Inspect"` for accordion disclosure | Restyle disclosure affordance to standard accessible expand/collapse chevrons with clear labels (`"View Details"` / `"Hide Details"`) and direct links to live demo or GitHub. |
| **A10.6** | **Instagram link tracking parameter** | Live link has `?srtk=MXR3ZG9zMWViNzB6MA==` | `content/links.ts` line 45 has tracking query string | Update `links.ts` to clean canonical `https://www.instagram.com/h3rric/`. |
| **A10.7** | **Office Aid wording consistency** | Live site mixes `"8+"` vs `"8"` modules, and inconsistent status badges | `content/projects.ts` lines 130, 133 vs `timeline.ts` line 62 | Standardize to `"8 modules"` everywhere; lock status badge to `"Active Local Full-Stack Monorepo (Cloud Hosting Pending)"`. |
| **A10.8** | **Timeline numbering alignment** | Spotlight card shows `"EXP // 01"` while timeline list places Office Aid as `01` | `timeline.ts` line 31 has `EXP // 01` while `JOURNEY_TIMELINE` has Office Aid as `01` | Align numbering semantics: label spotlight card as `SPOTLIGHT // AWS DEVOPS` or align chronological numbering so there is zero ambiguity. |
| **A10.9** | **Skills labelling rule** | Tailwind CSS marked as `"past projects only"` and exploring items already used | `content/skills.ts` lines 129, 295–385 | Update Tailwind CSS to reflect use in Office Aid (Tailwind CSS 4); split into **"Used in projects"** (linked to repo) vs **"Still deepening / exploring"** (AI/ML, GenAI, LLMs, AI agents). |
| **A10.10** | **Preservation of working features** | Risk of losing live IST clock, stack trace hover, intro skip, colophon | Various components | All listed features are cataloged and preserved in the redesign plan. |

---

## 6. Contradictions & Observations Noticed

1. **MUZO Project Date:** The prompt lists MUZO as **"September 2026"** while Office Aid is listed as **"May 2026 – Present"**, the B.Tech program is **"2023–2027"**, and the current date is **November 2026**. While September 2026 is chronologically consistent with the student timeline, please confirm whether MUZO was built in September 2026 or an earlier date.
2. **Section 06 Paper Band:** The original SIGNAL design included an off-white `$paper` (`#F4F4F2`) band for Section 06. Master Prompt V2 recommends dropping the light band in favor of a cohesive near-black palette with an outlined velocity ticker ribbon (Lorenzo's technique). We will adopt the cohesive dark treatment as recommended.
3. **Office Aid Live Demo Button:** Office Aid is an active local full-stack monorepo with cloud deployment pending. As instructed in A6, no live demo button will be rendered for Office Aid—only the verified GitHub repository link and "Cloud hosting pending" status.

---

## 7. Inputs Still Needed From Sourasish (C7 Checklist)

Before proceeding to Phase 2 (Portrait & Lab) and Phase 3 (Hero & Frame), please provide your decisions on:

1. **High-Resolution Portrait Asset:** Supply `portrait-main.jpg` (minimum 2000px on long edge, shoulders-up, facing camera, even lighting) placed in `/assets-source/portrait-main.jpg` (or uploaded here).
2. **Project Screenshots:** Confirm if the existing screenshots in `/public/images/projects/` (MUZO `screenshot-01.jpg` and Office Aid 5 dashboard/copilot captures) are final, or if you want to provide updated covers/captures.
3. **Accent Color Decision:** Confirm whether you prefer **Ember** (`#FF5B1F`, warm, cinematic, matching the default in B3) or **Cool Blue** (`#4DA8FF`).
4. **Audio / Sound Decision:** Confirm **No** (default, clean & silent) or **Yes** (ambient loop + soft UI tick).
5. **Phone Number Privacy:** Confirm that your phone number remains **strictly hidden** from all public DOM/text (accessible only via uploaded Resume PDF upon recruiter download).
6. **Contact Form Provider & Formspree Endpoint:** Confirm you will use Formspree via `/api/contact`, and supply your Formspree form ID when ready for live relay testing.
7. **Confirmation on `main` tag:** Confirm that `main` is clean and tagged `v1-pre-redesign` (completed locally on branch `redesign/signal-v2`).
8. **AWS DevOps Verification URL:** Provide the direct verification link (embedded in the certificate QR code) if available; otherwise, we will use neutral copy `"Verification available on request"`.
9. **`/lab` Visibility:** Confirm that `/lab` should be hidden in production (excluded from navigation and sitemap, accessible only in development or via direct secret URL).
10. **Production Canonical Domain:** Confirm `https://my-portfolio-s7ven.vercel.app/` as the canonical domain for share preview metadata.
