export type SkillGroupId =
  | "languages"
  | "frontend"
  | "backend"
  | "database"
  | "cloud-devops"
  | "tools";

export type SkillCategoryFilter = "all" | "core" | "exploring" | SkillGroupId;

export interface SkillConnection {
  label: string;
  context: string;
  href?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  qualifier?: string;
  group: SkillGroupId | "exploring";
  summary: string;
  connections: SkillConnection[];
}

export interface SkillCategoryGroup {
  id: SkillGroupId;
  index: string;
  title: string;
  subtitle: string;
  skills: SkillItem[];
}

export const CORE_SKILL_GROUPS: SkillCategoryGroup[] = [
  {
    id: "languages",
    index: "04.1",
    title: "Programming Languages",
    subtitle: "Problem solving, scripting, browser runtime & systems foundations",
    skills: [
      {
        id: "python",
        name: "Python",
        group: "languages",
        summary: "Core algorithmic computing, computer vision pipelines, and numerical ML experiments.",
        connections: [
          {
            label: "Face Recognition System",
            context: "OpenCV + PyTorch FaceNet pipeline",
            href: "https://github.com/SourasishG/Face-Recognition-System",
          },
          {
            label: "Gradient Descent Visualizer",
            context: "Pure NumPy optimization from scratch",
            href: "https://github.com/SourasishG/Gradient-Descent-Visualizer",
          },
        ],
      },
      {
        id: "javascript",
        name: "JavaScript",
        qualifier: "ES6+",
        group: "languages",
        summary: "Primary web application language across browser audio engines, state stores, and Express servers.",
        connections: [
          { label: "MUZO Case Study", context: "HTML5 Audio engine & AbortController search", href: "/projects/muzo" },
          { label: "Office Aid Case Study", context: "React 19 + Node/Express REST services", href: "/projects/office-aid" },
        ],
      },
      {
        id: "c",
        name: "C",
        group: "languages",
        summary: "Foundational procedural memory management, pointers, and university data structures.",
        connections: [
          { label: "B.Tech CSE Coursework", context: "Sister Nivedita University (2023–2027)" },
        ],
      },
      {
        id: "cpp",
        name: "C++",
        group: "languages",
        summary: "Object-oriented programming, STL containers, and competitive algorithm practice.",
        connections: [
          { label: "B.Tech CSE Coursework", context: "Algorithms & Object-Oriented Systems" },
        ],
      },
    ],
  },
  {
    id: "frontend",
    index: "04.2",
    title: "Frontend",
    subtitle: "Component architectures, semantic markup & custom CSS systems",
    skills: [
      {
        id: "react",
        name: "React.js",
        group: "frontend",
        summary: "Component-driven interfaces, custom hooks, state synchronization, and responsive dashboards.",
        connections: [
          { label: "MUZO Case Study", context: "React + Zustand playback UI", href: "/projects/muzo" },
          { label: "Office Aid Case Study", context: "React 19 modular workspace", href: "/projects/office-aid" },
          { label: "Pokémon Atlas 3D", context: "React 19 + R3F Explorer", href: "https://github.com/SourasishG/Pokemon-Atlas-3D" },
        ],
      },
      {
        id: "html5",
        name: "HTML5",
        group: "frontend",
        summary: "Semantic landmarks, keyboard-accessible structure, and native Audio media primitives.",
        connections: [
          { label: "MUZO Case Study", context: "Singleton HTMLAudioElement controller", href: "/projects/muzo" },
          { label: "SIGNAL Portfolio", context: "Accessible semantic App Router DOM" },
        ],
      },
      {
        id: "css3",
        name: "CSS3",
        group: "frontend",
        summary: "Hand-authored custom properties, grid/flex responsive systems, and neumorphic lighting.",
        connections: [
          { label: "MUZO Case Study", context: "Zero-library 3D Neumorphic token sheet", href: "/projects/muzo" },
        ],
      },
      {
        id: "tailwind",
        name: "Tailwind CSS",
        qualifier: "used in past projects",
        group: "frontend",
        summary: "Utility-first styling applied across multi-module React applications (this portfolio uses SCSS Modules).",
        connections: [
          { label: "Office Aid Case Study", context: "Tailwind CSS 4 Liquid Glass theme", href: "/projects/office-aid" },
          {
            label: "Support Ticket Dashboard",
            context: "Tailwind CSS 4 + shadcn/ui",
            href: "https://support-ticket-dashboard-lime.vercel.app/",
          },
        ],
      },
      {
        id: "scss",
        name: "SCSS",
        qualifier: "Sass Modules",
        group: "frontend",
        summary: "Modular stylesheet architecture, design tokens, nested selectors, responsive mixins, and zero-runtime CSS footprint.",
        connections: [
          { label: "SIGNAL Portfolio", context: "Full SCSS Modules token & layout architecture" },
          { label: "Design Token Layer", context: "Hand-authored mixins, breakpoints & color systems" },
        ],
      },
      {
        id: "gsap",
        name: "GSAP",
        qualifier: "ScrollTrigger",
        group: "frontend",
        summary: "High-performance scroll-driven timelines, pinned section scrubbing, and micro-interaction orchestration.",
        connections: [
          { label: "SIGNAL Portfolio", context: "GSAP ScrollTrigger timelines, pinning & text reveals" },
          { label: "Animation Architecture", context: "Dedicated ticker sync with Lenis smooth scroll" },
        ],
      },
      {
        id: "lenis",
        name: "Lenis",
        qualifier: "Smooth Scroll",
        group: "frontend",
        summary: "Lightweight momentum smooth scrolling engine synchronized with requestAnimationFrame and GSAP ticker.",
        connections: [
          { label: "SIGNAL Portfolio", context: "Lenis smooth scroll synced with GSAP ScrollTrigger" },
          { label: "Scroll Telemetry", context: "Real-time scroll progress & velocity tracking" },
        ],
      },
      {
        id: "locomotive",
        name: "Locomotive Scroll",
        group: "frontend",
        summary: "Virtual smooth scroll physics, viewport-based parallax triggers, and smooth element transformations.",
        connections: [
          { label: "Scroll Architecture", context: "Virtual scroll physics and viewport triggers" },
        ],
      },
    ],
  },
  {
    id: "backend",
    index: "04.3",
    title: "Backend",
    subtitle: "Server APIs, authentication, validation & business logic",
    skills: [
      {
        id: "nodejs",
        name: "Node.js",
        group: "backend",
        summary: "JavaScript server runtime powering REST endpoints, Prisma database clients, and AI service gateways.",
        connections: [
          { label: "Office Aid Case Study", context: "Node.js 22 backend API server", href: "/projects/office-aid" },
        ],
      },
      {
        id: "expressjs",
        name: "Express.js",
        group: "backend",
        summary: "Structured REST routing, middleware guards, JWT RBAC verification, and error handling.",
        connections: [
          { label: "Office Aid Case Study", context: "Express 5.3 across 11 /api/v1 route groups", href: "/projects/office-aid" },
        ],
      },
      {
        id: "rest-apis",
        name: "REST APIs",
        group: "backend",
        summary: "Designing JSON CRUD endpoints, Zod payload contracts, fallback external API mappers, and AbortController clients.",
        connections: [
          { label: "Office Aid Case Study", context: "JWT-authenticated REST API + 40 Postman tests", href: "/projects/office-aid" },
          { label: "MUZO Case Study", context: "Deezer & iTunes Search catalog normalization", href: "/projects/muzo" },
        ],
      },
    ],
  },
  {
    id: "database",
    index: "04.4",
    title: "Database",
    subtitle: "Relational schema modeling, ORMs & document storage",
    skills: [
      {
        id: "mysql",
        name: "MySQL",
        group: "database",
        summary: "Relational table design, foreign-key normalization, and SQL query writing.",
        connections: [
          { label: "Academic & Backend Practice", context: "Relational schema & SQL fundamentals" },
        ],
      },
      {
        id: "mongodb",
        name: "MongoDB",
        group: "database",
        summary: "Document-oriented collections and flexible JSON schema modeling for Node applications.",
        connections: [
          { label: "Full-Stack Practice", context: "NoSQL document storage workflows" },
        ],
      },
      {
        id: "postgresql",
        name: "PostgreSQL",
        group: "database",
        summary: "Production relational storage paired with Prisma ORM schemas and Supabase connection pooling.",
        connections: [
          { label: "Office Aid Case Study", context: "10-model Prisma 6 schema on Supabase PostgreSQL", href: "/projects/office-aid" },
        ],
      },
    ],
  },
  {
    id: "cloud-devops",
    index: "04.5",
    title: "Cloud & DevOps",
    subtitle: "Cloud compute, object storage & deployment automation basics",
    skills: [
      {
        id: "aws-ec2",
        name: "AWS EC2",
        group: "cloud-devops",
        summary: "Practical exposure to cloud compute instances and Linux deployment workflows.",
        connections: [
          { label: "Employability.life Internship", context: "AWS DevOps Intern (Nov 2025 – Jan 2026)" },
        ],
      },
      {
        id: "aws-s3",
        name: "AWS S3",
        group: "cloud-devops",
        summary: "Understanding cloud object storage buckets, permissions, and asset hosting fundamentals.",
        connections: [
          { label: "Employability.life Internship", context: "XPro AWS DevOps Initiative (XPro27566969)" },
        ],
      },
      {
        id: "cicd",
        name: "CI/CD",
        group: "cloud-devops",
        summary: "Foundational automated build/deploy pipeline workflows and verification checks.",
        connections: [
          { label: "Employability.life Internship", context: "CI/CD pipeline exposure & deployment concepts" },
        ],
      },
    ],
  },
  {
    id: "tools",
    index: "04.6",
    title: "Tools",
    subtitle: "Version control, hosted Postgres platforms & API verification",
    skills: [
      {
        id: "git",
        name: "Git",
        group: "tools",
        summary: "Daily branching, diff inspection, and clean commit workflows across every repository.",
        connections: [
          { label: "GitHub Profile", context: "Source control across all active projects", href: "https://github.com/SourasishG" },
        ],
      },
      {
        id: "github",
        name: "GitHub",
        group: "tools",
        summary: "Hosting public repositories, documentation READMEs, and collaborative code workflows.",
        connections: [
          { label: "SourasishG", context: "Verified public code portfolio", href: "https://github.com/SourasishG" },
        ],
      },
      {
        id: "supabase",
        name: "Supabase",
        group: "tools",
        summary: "Managed PostgreSQL backend platform configured with pgBouncer pooling and direct migrations.",
        connections: [
          { label: "Office Aid Case Study", context: "Supabase PostgreSQL datasource", href: "/projects/office-aid" },
        ],
      },
      {
        id: "postman",
        name: "Postman",
        group: "tools",
        summary: "API endpoint testing collections verifying auth flows, status codes, and payload contracts.",
        connections: [
          { label: "Office Aid Case Study", context: "40-endpoint backend Postman verification suite", href: "/projects/office-aid" },
        ],
      },
    ],
  },
];

export const CURRENTLY_EXPLORING_SKILLS: SkillItem[] = [
  {
    id: "nextjs",
    name: "Next.js",
    group: "exploring",
    summary: "Exploring App Router Server Components, static dynamic routes, and server API route proxies.",
    connections: [
      { label: "SIGNAL Portfolio", context: "This site is built with Next.js 16 App Router" },
      { label: "Support Ticket Dashboard", context: "Next.js 16 + Redux Toolkit", href: "https://support-ticket-dashboard-lime.vercel.app/" },
    ],
  },
  {
    id: "typescript",
    name: "TypeScript",
    group: "exploring",
    summary: "Learning strict compile-time contracts for props, API schemas, Zustand stores, and GLSL uniforms.",
    connections: [
      { label: "SIGNAL Portfolio", context: "Full strict TypeScript codebase" },
      { label: "Support Ticket Dashboard", context: "Strict TS SLA models", href: "https://github.com/SourasishG/support-ticket-dashboard" },
    ],
  },
  {
    id: "ai-ml",
    name: "AI/ML",
    group: "exploring",
    summary: "Studying mathematical optimization (gradient descent), embeddings, and practical computer vision pipelines.",
    connections: [
      { label: "Gradient Descent Visualizer", context: "Analytical MSE derivatives in NumPy", href: "https://github.com/SourasishG/Gradient-Descent-Visualizer" },
      { label: "Face Recognition System", context: "FaceNet 512-D embeddings", href: "https://github.com/SourasishG/Face-Recognition-System" },
    ],
  },
  {
    id: "generative-ai",
    name: "Generative AI",
    group: "exploring",
    summary: "Exploring practical GenAI integration patterns, prompt structure, and resilience fallbacks.",
    connections: [
      { label: "Office Aid Case Study", context: "Gemini-powered Herric workspace assistant", href: "/projects/office-aid" },
      { label: "Google Cloud & IBM Certs", context: "Intro GenAI & IBM Essentials courses" },
    ],
  },
  {
    id: "llms",
    name: "Large Language Models",
    group: "exploring",
    summary: "Understanding LLM context windows, workspace data injection, and structured output parsing.",
    connections: [
      { label: "Google Cloud Intro to LLMs", context: "Credential ID: 7QAB657M7FS4", href: "https://coursera.org/verify/7QAB657M7FS4" },
      { label: "Office Aid Case Study", context: "Prisma context injection into Herric prompts", href: "/projects/office-aid" },
    ],
  },
  {
    id: "ai-agents",
    name: "AI agents",
    group: "exploring",
    summary: "Investigating action-parsing assistants and AI-assisted development workflows that complement CS fundamentals.",
    connections: [
      { label: "Office Aid Case Study", context: "Herric schedule_meeting_action parser", href: "/projects/office-aid" },
    ],
  },
  {
    id: "threejs",
    name: "Three.js",
    group: "exploring",
    summary: "Learning BufferGeometry math, custom GLSL vertex/fragment shaders, and GPU disposal lifecycle.",
    connections: [
      { label: "SIGNAL Portfolio", context: "Custom S1–S8 shaders & constellation" },
      { label: "Pokémon Atlas 3D", context: "3D GLTF & hologram shaders", href: "https://github.com/SourasishG/Pokemon-Atlas-3D" },
    ],
  },
  {
    id: "r3f",
    name: "React Three Fiber",
    group: "exploring",
    summary: "Practicing declarative R3F scene graphs, useFrame transient store reads, and fallback error boundaries.",
    connections: [
      { label: "SIGNAL Portfolio", context: "Single persistent <Canvas> architecture" },
      { label: "Pokémon Atlas 3D", context: "SafeCanvas R3F explorer", href: "https://github.com/SourasishG/Pokemon-Atlas-3D" },
    ],
  },
  {
    id: "glsl",
    name: "GLSL",
    qualifier: "Shaders",
    group: "exploring",
    summary: "Authoring custom GPU vertex and fragment shaders, procedural noise math, and screen-space distortion matrices.",
    connections: [
      { label: "SIGNAL Portfolio", context: "Custom S1–S8 GLSL vertex and fragment shaders" },
      { label: "Shader Lab (/lab)", context: "Interactive real-time uniform testing and shader development" },
    ],
  },
  {
    id: "framer-motion",
    name: "Framer Motion",
    group: "exploring",
    summary: "Exploring declarative React mount/unmount transitions, AnimatePresence panels, and reduced-motion ergonomics.",
    connections: [
      { label: "SIGNAL Portfolio", context: "Drawers, hover filters & case study crossfades" },
      { label: "Office Aid Case Study", context: "Liquid Glass spring panels", href: "/projects/office-aid" },
    ],
  },
];
