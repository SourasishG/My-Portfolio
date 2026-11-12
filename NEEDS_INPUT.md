# NEEDS INPUT — Missing Assets, Links & Confirmations

Updated through **Phase 7 (Final Review & Handoff)**. All core portfolio routes (`/` Sections `01–08`, `/projects/muzo`, `/projects/office-aid`, `/lab`, `404`, `/api/contact`) and user-supplied media are complete; only the environment configuration for production go-live and optional supplemental items remain below.

---

## Confirmed & Received

- [x] **Checkpoint 1 Approved:** `PLAN.md`, design tokens, `ANIMATION_MAP.md`, `$signal` orange accent (`#FF5B1F`), and single `$paper` (`#F4F4F2`) Section 06 approved.
- [x] **Contact Provider & Domain:** Formspree confirmed (`/api/contact` server proxy); default `.vercel.app` domain confirmed for initial launch.
- [x] **Resume PDF:** Uploaded `Sourasish_Ghosh_CV.pdf` approved as-is for `/public/docs/Sourasish-Ghosh-Resume.pdf` (phone number `+91 99031 29873` strictly omitted from all public HTML).
- [x] **Portraits Organized in `/public/images/profile/`:**
  - `portrait-main.jpg` (`1024x1024` color studio portrait)
  - `portrait-alt.jpg` (`575x1024` monochrome editorial portrait)
- [x] **GitHub / LinkedIn / Instagram / Email:** Verified and locked (`SourasishG`, `sourasish-ghosh07`, `h3rric`, `sourasishghosh062@gmail.com`).
- [x] **MUZO Live Demo & Screenshot:** `https://code-alpha-muzo-music-player.vercel.app/` + `/public/images/projects/muzo/screenshot-01.jpg` (`917x670` displayed in cleanly proportioned container).
- [x] **Office Aid Scope & Dates:** Full-stack project (`May 2026 – Present`) reflecting the verified React 19 + Express 5 + Prisma + Supabase PostgreSQL + Google Gemini (`Herric`) monorepo.
- [x] **More Work List:** Pokémon Atlas 3D, Support Ticket Dashboard, Face Recognition System, Gradient Descent Visualizer (Orbital Music excluded).
- [x] **Hero Copy Tone & IDs:** Retain `"passionate"` in Hero/about phrasing; `S1–S8` = shaders, `01–08` = page sections.
- [x] **Certificate Assets & URLs Received:**
  - Employability.life XPro AWS DevOps (`XPro27566969`, `/public/certificates/employability-aws-devops.jpg`)
  - Google Cloud Intro GenAI (`03ISU86UC5K4`, `https://coursera.org/verify/03ISU86UC5K4`, `/public/certificates/google-cloud-intro-genai.png`)
  - IBM Generative AI Essentials (`AZ1QO9FKWWB0`, `https://coursera.org/verify/AZ1QO9FKWWB0`, `/public/certificates/ibm-genai-essentials.jpg`)
  - Google Cloud Intro LLMs (`7QAB657M7FS4`, `https://coursera.org/verify/7QAB657M7FS4`)
- [x] **Office Aid Screenshots Received (Organized in `/public/images/projects/office-aid/`):**
  - `herric-copilot.png` (`1024×479`), `dashboard.jpg` (`1024×485`), `projects.png` (`1024×479`), `tasks-kanban.png` (`1024×479`), `tickets.png` (`1024×484`)

---

## Remaining Optional & Go-Live Items

- [ ] **Formspree Form Endpoint (`NEEDS INPUT` — required before Vercel go-live):** Set `FORMSPREE_ENDPOINT` and `NEXT_PUBLIC_SITE_URL` inside your local `.env.local` and Vercel Project Environment Variables (never committed to git; `/api/contact` returns an honest `503` relay-pending notice until set).
- [ ] **Live Vercel Deployment Verification (Checkpoint 6 skipped locally):** Push latest commits to `SourasishG/My-Portfolio` and verify live HTTPS URL, OG card (`/opengraph-image`), `/sitemap.xml`, and end-to-end Formspree email delivery on production.
- [ ] **Office Aid Live Deployment URL (`NEEDS INPUT` — optional):** No public live demo URL currently exists (repo is configured as a local monorepo + Postman suite); Section 03 displays `Local Full-Stack Monorepo` badge alongside the verified GitHub URL until deployed.
- [ ] **4th Certificate Image (`NEEDS INPUT` — optional):** Certificate scan image for **Introduction to Large Language Models (`7QAB657M7FS4`)** alongside the verified Coursera URL (`https://coursera.org/verify/7QAB657M7FS4`).
- [ ] **Employability.life Direct Verification URL (`NEEDS INPUT` — optional):** URL embedded inside the QR code on `XPro27566969` (currently shows the high-res certificate scan directly).
- [ ] **Optional Extra Photos in `assets-source/` (`media_1794416385551_9e8e161f.jpg`, `media_1794416385553_4f6fb081.jpg`):** Kept outside `/public/` cleanly. Note that `assets-source/` currently contains raw original files (including unmodified CV upload `media_1794415523169_c2f228e7.pdf`); confirm whether to keep or add `/assets-source/` to `.gitignore` if preferred.
- [ ] **Analytics Preference:** Kept off by default (no cookies/tracking script); enable Vercel Web Analytics later only if desired.
