export interface ProjectScreenAsset {
  id: string;
  label: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export interface ProjectChallenge {
  challenge: string;
  solution: string;
}

export interface FeaturedProject {
  index: string;
  slug: "medbuddy" | "office-aid";
  name: string;
  shortName: string;
  tagline: string;
  category: string;
  dateRange: string;
  statusBadge: string;
  overview: string;
  problemAddressed: string;
  roleSummary: string;
  highlights: string[];
  builtItems: string[];
  plannedItems?: string[];
  modules?: string[];
  technologies: string[];
  challenges: ProjectChallenge[];
  githubUrl: string;
  liveDemoUrl?: string;
  screens: ProjectScreenAsset[];
}

export interface ArchiveProject {
  id: string;
  index: string;
  name: string;
  category: string;
  dateLabel: string;
  summary: string;
  architectureNote: string;
  technologies: string[];
  githubUrl: string;
  liveDemoUrl?: string;
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    index: "01",
    slug: "medbuddy",
    name: "MedBuddy",
    shortName: "MedBuddy PWA",
    tagline: "Privacy-first medicine adherence & expiry platform with a FEFO inventory engine and WebGL capsule stage.",
    category: "Full-Stack PWA · WebGL Systems",
    dateRange: "October 2026 – Present",
    statusBadge: "Live Production Build (Vercel)",
    overview:
      "MedBuddy is a calm, privacy-first medicine expiry, refill, and adherence tracker engineered with Next.js 16 (App Router), React 19, TypeScript, Supabase PostgreSQL with Row Level Security, and an installable Serwist Service Worker PWA. It couples an interactive Three.js/R3F 3D capsule orbital stage with a strict First-Expiry-First-Out (FEFO) clinical inventory ledger, automated opened-bottle shelf-life countdowns, zero-tracker VAPID Web Push notifications, and self-service GDPR/HIPAA-inspired data export and account deletion cascades.",
    problemAddressed:
      "Managing prescription medicines, opened syrups, and eye drops across a household frequently causes missed doses, accidental consumption of expired pharmaceuticals, and anxiety. Existing commercial trackers compromise user privacy with cross-site medical analytics and ad targeting while lacking physical batch-level expiry awareness.",
    roleSummary:
      "Sole Full-Stack / Systems Architect & Developer — engineered the Next.js 16 SSR frontend, Supabase PostgreSQL schema with RLS & Security Definer RPCs, FEFO stock reduction engine, VAPID Web Push pipeline, Serwist PWA offline caching, and interactive 3D capsule stage.",
    highlights: [
      "First-Expiry-First-Out (FEFO) physical batch inventory engine automatically deducting stock from earliest-expiring boxes, with dynamic opened-bottle shelf-life calculation (min(expiry_date, opened_on + shelf_life_days)).",
      "Privacy-preserving VAPID Web Push architecture delivering scheduled dose reminders with zero 3rd-party trackers and lock-screen notification sanitization.",
      "Scoped middleware & cookie isolation: marketing routes (/, /privacy, /offline) run 100% cookie-free, while app routes use HttpOnly SameSite=Lax @supabase/ssr cookies with HMAC-SHA256 signed onboarding state caching.",
      "Interactive 3D orbital capsule stage built with Three.js, React Three Fiber, and Drei, featuring procedural pill swarms, real-time lighting, and an expiry slider demo.",
      "Self-service data sovereignty: one-click machine-readable JSON data export (fn_export_my_data) and verified zero-residual account deletion (fn_delete_my_data).",
    ],
    builtItems: [
      "Guided 3-step medicine onboarding wizard (/app/medicine/add) spanning clinical details, physical batch box registration, and recurring dose schedules.",
      "Physical inventory ledger (/app/cabinet) with 4 clinical expiry status bands (Safe, Expiring Soon, Opened Bottle Warning, Expired).",
      "Supabase PostgreSQL schema with strict Row Level Security (RLS) policies isolating user records and security definer functions for atomic batch transactions.",
      "Full-featured Serwist Service Worker PWA with same-origin asset precaching and custom offline fallback (/offline).",
      "Next.js 16 App Router architecture with React 19, Server Components for marketing, and TanStack React Query 5 for optimistic UI mutations and cache invalidation.",
      "Automated pg_cron schedule engine for timely dose and refill dispatch.",
      "Automated test matrix: Playwright end-to-end golden path suite, database scenario tests, service worker privacy audit, and security audit ensuring no service role keys reach the client.",
    ],
    technologies: [
      "Next.js 16 (App Router)",
      "React 19",
      "TypeScript",
      "Supabase (PostgreSQL 16 & RLS)",
      "Serwist PWA",
      "Three.js / React Three Fiber / Drei",
      "TanStack React Query 5",
      "GSAP & Framer Motion",
      "Zod",
      "Web Push (VAPID)",
      "SCSS Modules",
      "Playwright",
      "Vercel",
    ],
    challenges: [
      {
        challenge: "Ensuring medicine stock is deducted accurately across multiple physical boxes with distinct expiration dates without race conditions.",
        solution:
          "Architected a First-Expiry-First-Out (FEFO) SQL transaction pipeline in Supabase PostgreSQL that automatically sorts and decrements stock from the earliest valid batch box, tracking physical bottle open dates and restoring exact batch counts on dose undo.",
      },
      {
        challenge: "Guaranteeing patient privacy and zero medical tracking on public landing and marketing routes while providing seamless session persistence in the app.",
        solution:
          "Implemented scoped Next.js middleware that strictly prevents cookies on /, /privacy, and /offline, restricting @supabase/ssr cookies exclusively to /app/* and caching verified onboarding status via a 10-minute HMAC-SHA256 signed cookie to eliminate redundant database roundtrips.",
      },
      {
        challenge: "Delivering reliable cross-device dose notifications without relying on invasive third-party telemetry or notification aggregators.",
        solution:
          "Built a direct browser Web Push pipeline using standard VAPID keys, allowing direct dispatch from serverless cron workers to registered Service Worker push endpoints with lock-screen text redaction toggles.",
      },
    ],
    githubUrl: "https://github.com/SourasishG/MedBuddy-Medicine-Expiry-Refill-Tracker",
    liveDemoUrl: "https://medbuddy-s7ven.vercel.app/",
    screens: [
      {
        id: "medbuddy-landing",
        label: "3D Orbital Stage",
        src: "/images/projects/medbuddy/landing-hero.webp",
        alt: "MedBuddy landing hero experience showing 3D interactive capsule swarm framing the mobile adherence cabinet",
        caption: "Interactive Three.js / R3F capsule swarm framing the mobile medicine cabinet with real-time dose schedule HUDs.",
        width: 1024,
        height: 485,
      },
      {
        id: "medbuddy-cabinet",
        label: "Cabinet & Expiry Ledger",
        src: "/images/projects/medbuddy/cabinet-monitor.webp",
        alt: "MedBuddy Home Cabinet showing Metformin, Eye Drops opened countdown, and Cough Syrup expiry status",
        caption: "FEFO physical inventory ledger tracking open-bottle shelf-life countdowns and multi-box clinical expiry bands.",
        width: 768,
        height: 830,
      },
    ],
  },
  {
    index: "02",
    slug: "office-aid",
    name: "Office Aid",
    shortName: "Office Aid",
    tagline: "Full-stack workplace automation monorepo uniting 8+ operational modules with the Herric Gemini AI copilot.",
    category: "Full-Stack Monorepo · Applied AI",
    dateRange: "May 2026 – Present",
    statusBadge: "Active Local Full-Stack Monorepo",
    overview:
      "Office Aid consolidates enterprise project tracking, agile Kanban execution, meeting schedules, IT helpdesk SLAs, internal email, and talent directories into one full-stack workspace powered by React 19, Express 5, Prisma ORM, Supabase PostgreSQL, and the context-aware Herric Gemini copilot.",
    problemAddressed:
      "Fragmented workplace suites force teams to jump between disconnected ticket queues, spreadsheets, calendars, and generic AI chat tabs that have zero visibility into live tasks or meetings.",
    roleSummary:
      "Full-Stack Architect & Developer — designed the 10-model Prisma PostgreSQL schema, Express 5 REST API with Zod & JWT RBAC, multi-model Gemini failover service, and Liquid Glass frontend modules.",
    highlights: [
      "Monorepo pairing React 19 + Vite 8 + Tailwind CSS 4 + Framer Motion with Express 5.3 + Prisma 6.4 + Supabase PostgreSQL.",
      "Herric AI Copilot injects live user tasks, daily schedules, tickets, emails, and announcements with Gemini multi-model failover.",
      "Stateless JWT + bcryptjs authentication with role-based access control (ADMIN, MANAGER, EMPLOYEE) and Zod validation.",
      "Unifies Dashboard, Projects, Kanban Tasks, Meetings, Employees Org Chart, Internal Mail, IT Helpdesk SLA Queue & Notifications.",
    ],
    builtItems: [
      "Full-stack monorepo verified in source: React 19, Vite 8, Tailwind CSS 4, Framer Motion, Recharts frontend + Node.js 22, Express 5.3, Prisma 6.4, Supabase PostgreSQL backend (10 relational models across 11 /api/v1 route groups).",
      "Native fetch ApiClient (apiClient.js) with automatic JWT Bearer injection, response unwrapping, and global 401 session cleanup.",
      "Herric Gemini AI engine (ai.service.js) with multi-model failover chain, PostgreSQL user workspace context injection, executive briefings, meeting-scheduling JSON action parser, email reply drafter, and ticket diagnosis assistant.",
      "Operational workspace modules built: Executive Dashboard (with Open-Meteo live weather sync), Projects Portfolio, Drag-and-Drop Kanban Tasks, Meetings Timeline & Calendar modal, Employees Directory/OrgChart, Emails client, IT Helpdesk SLA Queue, Notifications, and Profile.",
      "Liquid Glass & dark HUD token layer (glass.js, specular edge highlights, Framer Motion spring panels) plus a 40-endpoint Postman verification suite.",
    ],
    plannedItems: [
      "Public cloud hosting deployment (currently configured cleanly for local frontend + backend + Supabase PostgreSQL execution).",
      "Automated Vitest unit tests and Playwright E2E test suite wiring across full-stack workflows.",
      "External OAuth/SSO enterprise identity providers beyond email/password JWT sessions.",
      "Note on verified implementation: client requests use the native fetch ApiClient wrapper with controlled React state rather than Axios or React Hook Form.",
    ],
    modules: [
      "Executive Dashboard & Weather Sync",
      "Projects Portfolio",
      "Agile Kanban Task Board",
      "Meetings & Daily Timeline",
      "IT Helpdesk & SLA Queue",
      "Employees Directory & Org Chart",
      "Internal Emails + AI Summarizer",
      "Herric Gemini AI Copilot",
    ],
    technologies: [
      "React 19",
      "Vite 8",
      "Tailwind CSS 4",
      "Framer Motion",
      "Recharts",
      "Node.js 22",
      "Express 5",
      "Prisma ORM",
      "Supabase PostgreSQL",
      "Google Gemini AI",
      "Zod",
      "JWT + Bcrypt",
    ],
    challenges: [
      {
        challenge: "Making AI assistant answers aware of live workplace state instead of generic chatbot completions.",
        solution:
          "Built getUserWorkspaceContext() in ai.service.js to run parallel Prisma queries across pending tasks, today's meetings, tickets, unread email count, and announcements into Herric's system prompt.",
      },
      {
        challenge: "Resilience against upstream Gemini free-tier model quota spikes or transient API failures.",
        solution:
          "Implemented a multi-model failover iteration inside the Express AI service alongside Zod validation and graceful frontend error recovery.",
      },
      {
        challenge: "Structuring 10 tightly connected relational entities across projects, tasks, tickets, and schedules.",
        solution:
          "Designed normalized Prisma schemas supporting Supabase pgBouncer connection pooling (6543) for runtime queries and direct PostgreSQL port (5432) for migrations.",
      },
    ],
    githubUrl:
      "https://github.com/SourasishG/Web-Based-Office-Automation-Platform-With-AI-Chatbot",
    screens: [
      {
        id: "office-herric",
        label: "Herric Copilot",
        src: "/images/projects/office-aid/herric-copilot.png",
        alt: "Office Aid Executive Dashboard showing the live Herric AI Operations Copilot side drawer with quick workspace actions",
        caption: "Live workspace-synced Herric Copilot overlay inside Executive Central Command.",
        width: 1024,
        height: 479,
      },
      {
        id: "office-dashboard",
        label: "Dashboard",
        src: "/images/projects/office-aid/dashboard.jpg",
        alt: "Office Aid dark Command Dashboard with live Kolkata Open-Meteo weather card, Department Velocity chart, and Today's Schedule",
        caption: "Executive Central Command aggregating workforce metrics, live weather telemetry, velocity, and daily syncs.",
        width: 1024,
        height: 485,
      },
      {
        id: "office-projects",
        label: "Projects",
        src: "/images/projects/office-aid/projects.png",
        alt: "Office Aid Projects Portfolio screen showing KPI cards, status filters, sorting, and AI Chatbot / Cloud Migration cards",
        caption: "Projects Portfolio with live filtering, priority tags, and workspace status counters.",
        width: 1024,
        height: 479,
      },
      {
        id: "office-kanban",
        label: "Kanban Tasks",
        src: "/images/projects/office-aid/tasks-kanban.png",
        alt: "Office Aid Task Command Center displaying Kanban columns To Do, In Progress, Review, and Completed",
        caption: "Task Command Center featuring multi-stage Agile Kanban columns and priority filtering.",
        width: 1024,
        height: 479,
      },
      {
        id: "office-tickets",
        label: "IT Tickets",
        src: "/images/projects/office-aid/tickets.png",
        alt: "Office Aid IT Helpdesk and Tickets view showing SLA Queue KPIs, category tabs, and priority ticket cards",
        caption: "IT Helpdesk & SLA Monitor Queue supporting category triage, list/board toggle, and escalation badges.",
        width: 1024,
        height: 484,
      },
    ],
  },
];

export const MORE_WORK_PROJECTS: ArchiveProject[] = [
  {
    id: "muzo-audio",
    index: "03",
    name: "MUZO Web Audio Player",
    category: "Web Audio Engine · UI Systems",
    dateLabel: "Sep 2026",
    summary:
      "Responsive web audio discovery and playback platform engineered around a provider-agnostic singleton audio controller and persistent Zustand queue slices.",
    architectureNote:
      "Decoupled single HTMLAudioElement engine (audioEngine.js) isolated outside React component trees via event pub/sub, debounced search with AbortController cancellation, and hand-crafted neumorphic design tokens.",
    technologies: ["React", "Vite", "JavaScript ES6+", "Zustand", "HTML5 Audio", "Deezer & iTunes APIs"],
    githubUrl: "https://github.com/SourasishG/Muzo-music-player",
    liveDemoUrl: "https://code-alpha-muzo-music-player.vercel.app/",
  },
  {
    id: "pokemon-atlas-3d",
    index: "04",
    name: "Pokémon Atlas 3D",
    category: "WebGL · R3F Explorer",
    dateLabel: "Aug – Nov 2026",
    summary:
      "Interactive WebGL Pokédex & competitive 6-member squad builder spanning Gen I–IX (1,025+ species via PokéAPI).",
    architectureNote:
      "Dual 3D GLTF & volumetric hologram modes protected by SafeCanvas / CanvasErrorBoundary, shared vulnerability multiplier calculator, Zustand stores, and automated Vitest + MSW + Playwright + jest-axe test coverage.",
    technologies: ["React 19", "Three.js", "@react-three/fiber", "Zustand", "Vitest", "Playwright"],
    githubUrl: "https://github.com/SourasishG/Pokemon-Atlas-3D",
  },
  {
    id: "support-ticket-dashboard",
    index: "05",
    name: "Support Ticket Dashboard",
    category: "Next.js 16 · Resilience UI",
    dateLabel: "Sep – Oct 2026",
    summary:
      "Enterprise AI-triaged support ticket dashboard handling ~5,000 synthetic tickets with SLA timers and chaos testing.",
    architectureNote:
      "Enforces XSS stripHtml & javascript: URL sanitization, Enterprise P1 priority floor rules, state-machine status guards, bi-directional URL filter sync (Redux Toolkit), RTL detection, and exponential backoff retries over simulated 500/409 failures.",
    technologies: ["Next.js 16", "React 19", "Redux Toolkit", "Tailwind CSS 4", "shadcn/ui", "Vitest"],
    githubUrl: "https://github.com/SourasishG/support-ticket-dashboard",
    liveDemoUrl: "https://support-ticket-dashboard-lime.vercel.app/",
  },
  {
    id: "face-recognition-system",
    index: "06",
    name: "Face Recognition System",
    category: "Computer Vision · PyTorch",
    dateLabel: "Oct 2026",
    summary:
      "Modular 5-stage computer vision biometric pipeline using OpenCV, PyTorch, and pre-trained FaceNet (Inception-ResNet-v1).",
    architectureNote:
      "Extracts 512-D deep facial embeddings, preserves eyewear geometry with 20px bounding padding & multi-condition nearest-sample cosine similarity matching (0.65 stranger rejection threshold), confusion matrix evaluation, and live webcam overlays.",
    technologies: ["Python", "PyTorch", "OpenCV", "FaceNet", "scikit-learn", "NumPy"],
    githubUrl: "https://github.com/SourasishG/Face-Recognition-System",
  },
  {
    id: "gradient-descent-visualizer",
    index: "07",
    name: "Gradient Descent Visualizer",
    category: "ML Foundations · NumPy",
    dateLabel: "Oct 2026",
    summary:
      "From-scratch implementation & visual benchmark comparing Batch, Stochastic (SGD), and Mini-Batch Gradient Descent.",
    architectureNote:
      "Derives analytical MSE gradients in pure Python + NumPy without ML libraries, plotting parameter trajectories across varying learning rates and rendering 3D optimization loss surfaces via Matplotlib.",
    technologies: ["Python", "NumPy", "Matplotlib", "Analytical Gradients"],
    githubUrl: "https://github.com/SourasishG/Gradient-Descent-Visualizer",
  },
];

export function getFeaturedProjectBySlug(slug: string): FeaturedProject | undefined {
  return FEATURED_PROJECTS.find((p) => p.slug === slug);
}
