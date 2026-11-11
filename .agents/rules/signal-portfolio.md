---
trigger: always_on
description: "Mandatory rules for Sourasish Ghosh's SIGNAL portfolio: fixed tech stack, no unapproved dependencies, animation ownership, content accuracy, secrets protection, and phase checkpoints."
---

# SIGNAL Portfolio — Project Rules

These rules govern every phase of building **Sourasish Ghosh's personal portfolio ("SIGNAL")**. No rule may be violated for convenience.

---

## 1. Fixed Tech Stack (Section 13)

Do **NOT** swap or add frameworks/styling systems outside this table:

| Concern | Approved Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Server Components for static content; Client Components only where needed |
| Styling | **SCSS Modules** + global token/mixin layer | **NO Tailwind CSS** (single styling system only) |
| 3D | **Three.js via `@react-three/fiber` + `@react-three/drei`** | Vanilla Three.js only for isolated pieces if explicitly justified |
| Shaders | **GLSL** via drei `shaderMaterial` | `.glsl` in `/shaders` (`asset/source`) or typed template strings |
| Scroll-linked animation | **GSAP + ScrollTrigger (+ SplitText)** | Pinning, timelines, text splitting, scrubbing shader uniforms (verify GSAP license terms) |
| Component animation | **Framer Motion** | Mount/unmount, `AnimatePresence`, layout animation, drawers, hover/tap |
| Smooth scroll | **Lenis** | Single client provider; NEVER run alongside Locomotive Scroll |
| Icons | **Lucide** (`lucide-react`) | — |
| Forms & Validation | **`react-hook-form` + `zod`** | Client and server validation |
| Email delivery | **Resend** (or Formspree if user prefers) | Server route (`/api/contact`) only |
| Hosting | **Vercel** | Verified production build |

**Allowed extras (only if justified in `PLAN`):**
- `zustand` (shared scroll/pointer store read via `useFrame`, never `useState`)
- `@react-three/postprocessing` (bloom/chromatic aberration, sparingly)
- `detect-gpu` (device tiering)
- `@gsap/react`
- `leva` (dev-only `/lab` shader tuning)

### No New Dependencies Without Asking
- **NEVER** install any npm package outside the Fixed Tech Stack + Allowed Extras above without first proposing it to the user with a written justification and getting explicit approval.

---

## 2. Animation Ownership & Scroll/WebGL Rules (Sections 13–15)

1. **One library owns one element:** NEVER animate the same CSS property of the same element with both GSAP and Framer Motion.
2. **Maintain `ANIMATION_MAP.md`:** Every animated element must be logged (`section -> element -> library -> trigger -> animated properties`) before/during implementation.
3. **Scroll engine:** One Lenis instance only (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(...)`, `gsap.ticker.lagSmoothing(0)`). Never mix Lenis and Locomotive Scroll.
4. **High-frequency updates:** Scroll progress, scroll velocity, and pointer coordinates go to Zustand/refs and are read inside `useFrame` — NEVER trigger React `setState` per frame.
5. **Single persistent `<Canvas>`:** One fixed WebGL canvas (`next/dynamic` with `ssr: false`, `aria-hidden="true"`). All content lives in semantic server-rendered DOM.
6. **WebGL budget:** Maximum **2** simultaneously active WebGL effects in any single viewport. Cap `dpr` at `[1, 1.5]` mobile and `[1, 2]` desktop.
7. **Cleanup & Fallbacks:** Register GSAP plugins once in `/lib/gsap.ts`; use `useGSAP`; kill ScrollTriggers and dispose geometries/materials/textures on unmount. Provide `detect-gpu` tiering, `prefers-reduced-motion` fallbacks, and WebGL error boundary fallbacks.

---

## 3. Content Accuracy & Asset Rules (Sections 6, 18, 19)

1. **Never fabricate facts:** Never invent companies, experience, clients, awards, project metrics, performance numbers, or user counts.
2. **Skill honesty:** Never present "Currently exploring" items (`Next.js`, `TypeScript`, `AI/ML`, `Generative AI`, `LLMs`, `AI agents`, `Three.js`, `React Three Fiber`, `Framer Motion`) as mastered skills. Always label them **Currently exploring**.
3. **Date & role honesty:** Never alter or exaggerate academic dates, grades, or AWS DevOps Intern duties. Flag any date contradictions (e.g., prompt dates vs GitHub history) for user confirmation.
4. **Verify against code:** Clearly separate **Built** vs **Planned** functionality by reading actual repositories; never guess from thin READMEs.
5. **No invented URLs:** Never fabricate live demo links, repository links, or certificate verification URLs. Log missing items as `NEEDS INPUT` in `NEEDS_INPUT.md`.
6. **Personal details & privacy:** Never invent personal details beyond the four listed interests (football, video games, music, movies). Do NOT print the user's phone number in plain text on public pages unless explicitly approved.
7. **Real assets only:** Use only user-supplied files from `/public` following the Section 19 manifest, or clearly labelled placeholders logged in `NEEDS_INPUT.md`. Never use stock photography or AI-generated portraits. Log font/HDRI/texture/model sources and licenses in `CREDITS.md`.

---

## 4. Secrets & Security Rules (Section 15)

- **Never commit secrets:** Never commit `.env`, `.env.local`, API keys, Resend/Formspree credentials, or private tokens. Maintain `.env.example` with placeholder keys only and verify `.gitignore` excludes `.env*` (except `.env.example`).
- Keep email sending and validation strictly server-side (`/api/contact/route.ts` with `zod`, honeypot field, and rate limiting).
- Never bypass access controls, permissions, or CAPTCHAs.

---

## 5. Phase Workflow, Hard-Stop Checkpoints & Learning (Section 17)

Work sequentially through: **Phase 1 (Research)** -> **Phase 2 (Planning)** -> **Phase 3 (Design)** -> **Phase 3.5 (Shader Lab `/lab`)** -> **Phase 4 (Development)** -> **Phase 5 (Testing)** -> **Phase 6 (Deployment)** -> **Phase 7 (Final Review)**.

### Mandatory Hard Stops (WAIT for explicit written user approval before proceeding)
1. **Checkpoint 1:** After Phase 1 + Phase 2 deliverables (design brief, design tokens, architecture plan, `ANIMATION_MAP.md`). **Do not write application code before approval.**
2. **Checkpoint 2:** After Shader Lab (`/lab`) for **S1** and **S2** (with browser screenshots/recordings and plain-language shader/uniform explanations).
3. **Checkpoint 3:** After Hero (Section 01) integration (desktop + mobile verified).
4. **Checkpoint 4:** After each remaining section (Sections 02–08 + Project case studies + 404).
5. **Checkpoint 5:** After the contact form works end-to-end (validation, honeypot, rate limit, delivery, error/success states).
6. **Checkpoint 6:** After production build and Vercel deployment verification.

### Mandatory Companion Docs & Verification
- **`LEARNING.md`:** After every component/shader, add a beginner-friendly explanation (purpose, architecture rationale, hooks/functions, state/data flow, shader uniforms & math in plain English, library trade-offs) plus **3 likely interview questions with model answers**.
- **Evidence-based testing (Phase 5):** Browser screenshots at `360`, `390`, `768`, `1024`, `1440`, and `1920` px; link/resume/contact form checks (success, validation error, server error); `prefers-reduced-motion` and WebGL-disabled checks; keyboard-only navigation check; Lighthouse mobile & desktop scores. Never claim a pass without real evidence.
