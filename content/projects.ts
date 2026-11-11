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
  slug: "muzo" | "office-aid";
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
    slug: "muzo",
    name: "MUZO",
    shortName: "MUZO Audio",
    tagline: "Web audio discovery platform with a decoupled HTML5 audio engine & soft 3D neumorphic system.",
    category: "Web Audio Engine · UI Systems",
    dateRange: "September 2026",
    statusBadge: "Live Production Build",
    overview:
      "MUZO is a responsive web audio discovery and playback platform engineered around a provider-agnostic singleton audio controller, persistent Zustand queue slices, race-free catalog search, and a custom tactile CSS design system.",
    problemAddressed:
      "Binding HTML5 <audio> side effects directly inside React view components frequently causes stale event listeners, interrupted playback across navigation, and race-condition search results under fast typing.",
    roleSummary:
      "Sole Full-Stack / Frontend Engineer — architected the audio engine, state synchronization hooks, catalog fallback mapper, and zero-library neumorphic UI token layer.",
    highlights: [
      "Decoupled single HTMLAudioElement engine (audioEngine.js) synced cleanly through usePlayerSync + Zustand.",
      "Eliminated stale search responses via debounced dispatch and AbortController request cancellation.",
      "Deezer catalog integration through Vite proxy with automatic iTunes Search fallback normalization.",
      "Soft 3D Neumorphic CSS custom-property tokens plus DOM text-measurement marquee for overflowing titles.",
    ],
    builtItems: [
      "Singleton HTML5 Audio Engine (audioEngine.js) isolated outside React component trees via event pub/sub.",
      "Unidirectional playback & queue store (usePlayerStore.js) with cross-session localStorage persistence.",
      "Full transport deck: play/pause, previous/next, shuffle, cycle repeat modes (off / repeat all / repeat one), scrubbable seek timeline, and volume + mute controls.",
      "Debounced 400ms catalog search with AbortController cancellation (useMusicSearch.js) to eliminate race conditions.",
      "Deezer catalog mapper + fallback iTunes Search API endpoint normalization (deezerApi.js).",
      "Hand-crafted soft 3D Neumorphic UI token system (#E0E5EC / #FF6B35) built purely in CSS without third-party UI kits.",
      "Automated width-measurement marquee ticker (TrackInfo.jsx) triggering only when track titles overflow their container.",
    ],
    technologies: [
      "React",
      "Vite",
      "JavaScript ES6+",
      "Zustand",
      "HTML5 Audio API",
      "CSS Custom Properties",
      "Deezer & iTunes REST APIs",
      "Lucide React",
      "Vercel",
    ],
    challenges: [
      {
        challenge: "Race conditions and out-of-order UI updates when typing search queries rapidly.",
        solution:
          "Paired 400ms query debouncing with AbortController signal cleanup so superseded API requests cancel before committing state.",
      },
      {
        challenge: "Keeping long artist and song titles legible without layout jitter across narrow mobile cards.",
        solution:
          "Measured DOM scrollWidth vs clientWidth dynamically after render and computed CSS custom duration/distance tokens for conditional marquee scroll.",
      },
      {
        challenge: "Upstream catalog preview unavailability or CORS blocks.",
        solution:
          "Routed Deezer catalog calls through Vite proxy configuration and added an automatic iTunes Search mapper returning 500x500 artwork and 30s audio previews.",
      },
    ],
    githubUrl: "https://github.com/SourasishG/Muzo-music-player",
    liveDemoUrl: "https://code-alpha-muzo-music-player.vercel.app/",
    screens: [
      {
        id: "muzo-player",
        label: "Player Deck & Queue",
        src: "/images/projects/muzo/screenshot-01.jpg",
        alt: "MUZO soft neumorphic music player showing Now Playing artwork, orange seek scrub bar, transport controls, and Queue panel",
        caption: "Soft neumorphic player deck, real-time seek timeline, and persistent 11-track Queue / Discovery drawer.",
        width: 917,
        height: 670,
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
    id: "pokemon-atlas-3d",
    index: "03",
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
    index: "04",
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
    index: "05",
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
    index: "06",
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
