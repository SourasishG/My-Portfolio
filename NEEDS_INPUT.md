# NEEDS INPUT — Missing Assets, Links & Confirmations

Updated through **Phase 3.5 (Shader Lab `/lab` — Checkpoint 2)**. Remaining items below apply before or during **Phase 4 (Sections 02–08)**.

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

## Remaining Inputs Needed Before Relevant Phase 4 Sections

- [ ] **Office Aid Live Deployment URL (`NEEDS INPUT` — optional):** No public live demo URL currently exists (repo is configured as a local monorepo + Postman suite); Section 03 displays `Local Full-Stack Monorepo` badge alongside the verified GitHub URL until deployed.
- [ ] **Café Photo Permission (`media_1794416385551_9e8e161f.jpg` in `assets-source/`):** Photo shows bystanders in a public café; kept out of `/public` unless you explicitly confirm you want it cropped/used.
- [ ] **Solo Night Street Photo Placement (`media_1794416385553_4f6fb081.jpg` in `assets-source/`):** Confirm whether to use this in **Section 06 ("Beyond the screen")** or keep it unused/backup.
- [ ] **4th Certificate Image (`NEEDS INPUT` — optional before Section 05):** Image file for **Introduction to Large Language Models (`7QAB657M7FS4`)** if desired alongside the verified Coursera URL.
- [ ] **Employability.life Direct Verification URL (`NEEDS INPUT` — optional before Section 05):** URL embedded inside the QR code on `XPro27566969` (currently shows certificate image directly).
- [ ] **Formspree Form Endpoint (`NEEDS INPUT` — needed before final Vercel go-live):** Set `FORMSPREE_ENDPOINT` inside your local `.env.local` and Vercel Project Environment Variables (never committed to git; `/api/contact` currently returns an honest `503` relay-pending notice until set).
- [ ] **Analytics Preference:** Keep analytics off (default) or add Vercel Web Analytics?
