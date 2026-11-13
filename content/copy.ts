export const HERO_FACTS = [
  {
    index: "01",
    label: "ACADEMIC BASE",
    value: "B.Tech CSE · CGPA 8.08",
    meta: "Sister Nivedita University · 2023–2027",
  },
  {
    index: "02",
    label: "FEATURED WORK",
    value: "2 Shipped Case Studies",
    meta: "MUZO (Audio Discovery) & Office Aid (Monorepo)",
  },
  {
    index: "03",
    label: "CREDENTIALS",
    value: "4 Verified Certifications",
    meta: "AWS Cloud DevOps & HackerRank Verified",
  },
  {
    index: "04",
    label: "ENGINEERING FOCUS",
    value: "Full-Stack Architecture",
    meta: "React, Node.js REST APIs, SQL & Cloud Systems",
  },
] as const;

export const HERO_COPY = {
  sectionIndex: "01",
  sectionTag: "[01] // PRESENCE · FULL-STACK DEVELOPER",
  conceptLine: "NOISE TO SIGNAL",
  availabilityLabel: "Available for Full-Stack Roles & Internships",
  roleLabel: "Full-Stack Developer · Kolkata, India",
  firstName: "SOURASISH",
  lastName: "GHOSH",
  manifesto: "I design, develop, and build digital experiences.",
  supportingCopy:
    "B.Tech Computer Science undergraduate (CGPA 8.08) at Sister Nivedita University, Kolkata. Transforming curiosity into dependable full-stack architecture—bridging resilient Node.js APIs, relational persistence, and interactive WebGL craft.",
  ctaPrimary: "Explore Selected Work",
  ctaResume: "Download Resume",
  ctaContact: "Get in Touch",
  scrollCue: "Scroll to explore",
  facts: HERO_FACTS,
} as const;

export const ABOUT_COPY = {
  sectionIndex: "02",
  sectionTag: "[02] // PERSONAL ARCHITECTURE",
  subTag: "QUICK LEARNER · PATIENT PROBLEM-SOLVER",
  heading: "Understanding the system behind the syntax.",
  narrativeBeats: [
    {
      index: "01",
      tag: "THE SPARK",
      title: "Curiosity at the Interface",
      body: "My journey began in frontend development, learning how thoughtful interfaces respond to real people. Seeing code turn into fluid user experiences ignited a desire to understand every layer beneath the surface.",
    },
    {
      index: "02",
      tag: "THE ARCHITECTURE",
      title: "Pushing Deeper Across the Stack",
      body: "Over time my curiosity pushed deeper across the entire system—into Node.js and Express servers, REST APIs, relational and document persistence (PostgreSQL, MongoDB, Supabase), schema design, and AWS cloud deployment fundamentals.",
    },
    {
      index: "03",
      tag: "THE CRAFT & AI",
      title: "First Principles & Modern Craft",
      body: "I am passionate about first-principles engineering: understanding the architectural problem behind the code before writing syntax. I actively explore Large Language Models, AI-assisted development, and 3D WebGL craft to complement fundamental CS principles.",
    },
  ],
  paragraphs: [
    "My journey began in frontend development, learning how thoughtful interfaces respond to real people. Over time my curiosity pushed deeper across the stack—into Node.js and Express servers, REST APIs, relational and document databases, application architecture, and AWS cloud deployment fundamentals.",
    "Two traits define how I build: I learn quickly when facing unfamiliar tools, and I stay patient when diagnosing tricky edge cases. I am passionate about understanding the problem behind the code and how every layer of a software system connects end-to-end.",
    "I am also deeply interested in Artificial Intelligence, Large Language Models, and AI-assisted development workflows as complements to core engineering knowledge. In fact, building this SIGNAL portfolio with Next.js, TypeScript, Three.js, React Three Fiber, and Framer Motion is part of that ongoing exploration—turning concepts I am actively studying into working software.",
  ],
  portraitAlt:
    "Studio portrait of Sourasish Ghosh wearing glasses and a dark blazer against a cool slate backdrop",
  portraitCaption: "FIG 02.1 // SOURASISH GHOSH",
  portraitLocation: "KOLKATA, IN · SNU CSE '27",
  apertureTag: "S2 // PROCEDURAL TOPOGRAPHY",
  apertureHint: "SCROLL-SCRUBBED CROSS-SECTION",
  pillars: [
    {
      label: "ACADEMIC BASE",
      value: "B.Tech CSE · SNU (2023–2027)",
      detail: "Sister Nivedita University · Current CGPA 8.08",
    },
    {
      label: "WORK STYLE",
      value: "Quick Learner · Patient",
      detail: "Methodical experimentation & first-principles debugging",
    },
    {
      label: "ENGINEERING ARC",
      value: "Frontend -> Full-Stack -> Cloud",
      detail: "Connecting UI craft, REST APIs, SQL/NoSQL schemas & AWS basics",
    },
    {
      label: "AI & LEARNING ETHOS",
      value: "Tools Complement Core CS",
      detail: "Exploring AI/LLMs & 3D web while keeping fundamentals strong",
    },
  ],
} as const;

export const PROJECTS_COPY = {
  sectionIndex: "03",
  sectionTag: "[03] // SELECTED ENGINEERING",
  subTag: "PINNED SHOWCASE & CASE STUDIES",
  heading: "Systems engineered from architecture to UI.",
  leadCopy:
    "Two deep-dive systems built end-to-end—an isolated browser audio engine with race-free API search, and a full-stack workplace platform wired to PostgreSQL and Gemini AI—alongside a compact archive of additional repositories.",
  shaderHintDesktop: "S3 // HALFTONE OPTICAL REVEAL · MOVE POINTER TO INSPECT FULL-COLOR UI",
  shaderHintStatic: "FULL-COLOR INTERFACE CAPTURE · CLICK SCREENS TO INSPECT MODULES",
  moreWorkTag: "03.2 // ADDITIONAL REPOSITORIES",
  moreWorkHeading: "More engineering work",
  moreWorkNote:
    "Focused active index verified directly from public repositories — additional projects will be added over time.",
} as const;

export const TOOLKIT_COPY = {
  sectionIndex: "04",
  sectionTag: "[04] // TECHNICAL TOOLKIT",
  subTag: "GROUPED BY DISCIPLINE · ZERO ARBITRARY PERCENTAGES",
  heading: "Core engineering stack & active exploration.",
  leadCopy:
    "Every technology below reflects direct practical usage across applications, REST APIs, relational/document databases, and cloud deployments—paired honestly with the newer stack I am currently exploring.",
  inspectHint: "Hover or select any technology to trace where it is applied across projects.",
  exploringTag: "ACTIVE LEARNING ARC // CURRENTLY EXPLORING",
  exploringHeading: "Currently exploring",
  exploringNote:
    "These technologies are labeled Currently exploring rather than mastered skills. In fact, building this SIGNAL portfolio with Next.js, TypeScript, Three.js, React Three Fiber, and Framer Motion is hands-on practice turning active study into working software.",
} as const;

export const JOURNEY_COPY = {
  sectionIndex: "05",
  sectionTag: "[05] // EXPERIENCE, CREDENTIALS & EDUCATION",
  subTag: "VERIFIED MILESTONES · HONEST SCOPE",
  heading: "Academic base, internship practice & credentials.",
  leadCopy:
    "From CBSE foundations in Kolkata to B.Tech Computer Science at Sister Nivedita University, AWS & DevOps internship exposure at Employability.life, and verified Coursera credentials.",
  experienceTag: "05.1 // WORK EXPERIENCE & TIMELINE",
  certificationsTag: "05.2 // VERIFIED CERTIFICATIONS",
  certificationsHeading: "4 Credentials",
  certificationsHint:
    "Select any credential row to inspect certificate details, supplied scans, and verification links.",
  educationTag: "05.3 // ACADEMIC FOUNDATIONS",
  educationHeading: "Education",
} as const;

export interface BeyondInterest {
  id: "football" | "video-games" | "music" | "movies";
  index: string;
  title: string;
  lens: string;
  caption: string;
}

export const BEYOND_COPY = {
  sectionIndex: "06",
  sectionTag: "[06] // BEYOND THE SCREEN",
  subTag: "OFF-CLOCK OBSERVATION · KOLKATA",
  headline: "Beyond the screen.",
  leadCopy:
    "Patience, timing, and perspective outside engineering shape how I think about interfaces and software systems inside it.",
  portraitAlt:
    "Monochrome portrait of Sourasish Ghosh wearing glasses and a dark jacket outdoors at night",
  portraitCaption:
    "FIG 06.1 // SOURASISH GHOSH — S7 SCROLL-VELOCITY PLANE RESPONDS TO PAGE MOMENTUM.",
  portraitStaticCaption:
    "FIG 06.1 // SOURASISH GHOSH — MONOCHROME EDITORIAL FRAME.",
  philosophyNote:
    "Good engineering is unhurried observation paired with steady execution—stepping away from code keeps attention sharp for how people actually experience timing, rhythm, and clarity.",
} as const;

export const BEYOND_INTERESTS: BeyondInterest[] = [
  {
    id: "football",
    index: "01",
    title: "Football",
    lens: "SPATIAL TEMPO & TEAMWORK",
    caption:
      "Reading movement before a pass happens builds patience, anticipation, and awareness of how individual roles serve the wider shape.",
  },
  {
    id: "video-games",
    index: "02",
    title: "Video Games",
    lens: "INTERACTIVE SYSTEMS & FEEL",
    caption:
      "Appreciating feedback loops, tactile controls, visual state clarity, and how tight frame budgets keep complex worlds responsive.",
  },
  {
    id: "music",
    index: "03",
    title: "Music",
    lens: "RHYTHM & AUDITORY PACING",
    caption:
      "Attention to texture, pacing, and transition dynamics—curiosity that directly motivated engineering MUZO's browser audio engine.",
  },
  {
    id: "movies",
    index: "04",
    title: "Movies",
    lens: "FRAMING, LIGHT & CADENCE",
    caption:
      "Studying composition, contrast, and scene transitions that inspire clean visual storytelling and restrained motion.",
  },
];

export interface AspirationPillar {
  id: "ownership" | "architecture" | "ai-multiplier";
  index: string;
  tag: string;
  title: string;
  description: string;
}

export interface HorizonTrack {
  id: string;
  phase: string;
  focus: string;
  note: string;
}

export const ASPIRATIONS_COPY = {
  sectionIndex: "07",
  sectionTag: "[07] // ENGINEERING ASPIRATIONS & FUTURE VISION",
  subTag: "FULL-STACK DEPTH · AI COLLABORATION · LONG-TERM CRAFT",
  heading: "Becoming a full-stack engineer who owns the whole system.",
  manifesto:
    "My ultimate ambition is to grow into a highly capable Full-Stack Engineer who can design, develop, integrate, and ship complete websites and software applications from first principles.",
  supportingCopy:
    "I never want to limit myself to writing isolated lines of syntax. Understanding the problem behind the code, the architecture behind the application, and the people who rely on it is what turns working software into dependable engineering.",
  stageTag: "S5 // CHROME FLUID ARCHES",
  stageTelemetryLabel: "SCROLL-DRIVEN CAMERA ARC · BRUSHED CHROME PBR",
  stageStaticLabel: "S5 // MONOCHROME ARCH STUDY (REDUCED MOTION / STATIC VIEW)",
  ctaLabel: "Start a Conversation",
  ctaHref: "/#contact",
} as const;

export const ASPIRATIONS_PILLARS: AspirationPillar[] = [
  {
    id: "ownership",
    index: "01",
    tag: "END-TO-END OWNERSHIP",
    title: "Design, integrate, and ship complete systems.",
    description:
      "Bridging responsive frontend craft, reliable Node.js and REST API design, relational and document persistence, and cloud deployment readiness inside cohesive products.",
  },
  {
    id: "architecture",
    index: "02",
    tag: "FIRST-PRINCIPLES PROBLEM SOLVING",
    title: "Understand the reasoning behind every layer.",
    description:
      "Pairing patience and quick learning with deliberate debugging—measuring trade-offs, state ownership, and failure modes instead of treating abstractions as black boxes.",
  },
  {
    id: "ai-multiplier",
    index: "03",
    tag: "HUMAN + AI WORKFLOWS",
    title: "Pair LLMs and AI tools with strong CS fundamentals.",
    description:
      "Applying Generative AI and AI-assisted development workflows as engineering multipliers that accelerate iteration while keeping human architectural judgement at the center.",
  },
];

export const ASPIRATIONS_HORIZONS: HorizonTrack[] = [
  {
    id: "horizon-fullstack",
    phase: "ONGOING PRACTICE",
    focus: "Full-Stack TypeScript & Next.js",
    note: "Advancing from foundational JavaScript/React builds into typed full-stack App Router architectures and clean validation boundaries.",
  },
  {
    id: "horizon-ai",
    phase: "ACTIVE STUDY",
    focus: "Applied LLMs & AI Agents",
    note: "Exploring grounded prompt pipelines, structured tool calling, and practical AI integration patterns for real web workflows.",
  },
  {
    id: "horizon-cloud",
    phase: "CLOUD FOUNDATION",
    focus: "Production Deployment & DevOps",
    note: "Building on AWS EC2/S3 and CI/CD fundamentals toward repeatable testing, observability, and resilient service delivery.",
  },
  {
    id: "horizon-craft",
    phase: "CREATIVE WEB",
    focus: "Real-Time 3D & Restrained Motion",
    note: "Continuing to explore Three.js, React Three Fiber, and Framer Motion to make technical interfaces legible, tactile, and memorable.",
  },
];

export const CONTACT_COPY = {
  sectionTag: "[08] // CONTACT & COLLABORATION",
  subTag: "KOLKATA, IN · OPEN TO INTERNSHIPS & ROLES",
  heading: "Let's build something dependable.",
  lead: "Open to Software Engineering / Full-Stack internships, early-career engineering roles, and thoughtful product collaborations.",
  availabilityNote:
    "Based in Kolkata, India (IST · UTC+5:30). Usually responds within 24 hours by email.",
  stageTag: "S4 // CHROMATIC GLASS",
  stageTelemetryLabel: "REFRACTIVE PRISM · IOR 1.45",
  stageStaticLabel: "STATIC DISPERSION PLATE",
  directChannelTag: "DIRECT CHANNELS",
  formTag: "DIRECT TRANSMISSION // SERVER-VALIDATED",
  formTitle: "Send a message",
  formSubmitIdle: "Send Message",
  formSubmitPending: "Transmitting...",
  formPrivacyNote:
    "Validated via Zod on the server and routed securely without exposing client credentials.",
} as const;

export const FOOTER_COPY = {
  wordmark: "SIGNAL",
  tagline: "Sourasish Ghosh · Full-Stack Developer",
  colophon:
    "Engineered with Next.js App Router, TypeScript, SCSS Modules, Three.js / React Three Fiber, GSAP ScrollTrigger & Lenis.",
  locationLine: "Kolkata, West Bengal, India · B.Tech CSE (2023–2027)",
  copyrightName: "Sourasish Ghosh",
} as const;
