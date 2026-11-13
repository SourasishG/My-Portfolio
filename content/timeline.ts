export type MilestoneKind = "internship" | "project" | "education";

export interface JourneyMilestone {
  id: string;
  index: string;
  kind: MilestoneKind;
  period: string;
  title: string;
  organization: string;
  locationOrMode: string;
  summary: string;
  highlights: string[];
  tags: string[];
  href?: string;
  externalHref?: string;
  externalLabel?: string;
}

export interface EducationRecord {
  id: string;
  index: string;
  institution: string;
  program: string;
  boardOrUniversity: string;
  period: string;
  metrics: Array<{ label: string; value: string }>;
  focusAreas: string[];
}

export const EXPERIENCE_SPOTLIGHT = {
  index: "EXP // 01",
  role: "AWS DevOps Intern",
  organization: "Employability.life",
  program: "XPro Project: AWS DevOps Initiative",
  collaborationNote: "Delivered by Employability.life in collaboration with Federation University",
  period: "November 2025 – January 2026",
  mode: "Remote",
  credentialId: "XPro27566969",
  responsibilities: [
    "Completed the XPro Project: AWS DevOps Initiative.",
    "Gained practical exposure to AWS and DevOps fundamentals.",
    "Developed an understanding of CI/CD workflows.",
    "Learned about cloud infrastructure and application deployment.",
    "Explored AWS services such as EC2 and S3.",
    "Gained familiarity with DevOps practices and cloud-based application management.",
  ],
  tags: ["AWS EC2", "AWS S3", "CI/CD", "Cloud Deployment", "DevOps Basics"],
} as const;

export const JOURNEY_TIMELINE: JourneyMilestone[] = [
  {
    id: "office-aid-2026",
    index: "01",
    kind: "project",
    period: "May 2026 – Present",
    title: "Office Aid — AI-Powered Office Automation Platform",
    organization: "Full-Stack Monorepo",
    locationOrMode: "Independent Build",
    summary:
      "Multi-module workplace web platform uniting project portfolios, agile Kanban tasks, executive KPIs, meeting schedules, support ticketing, and an integrated Gemini operations assistant (Herric).",
    highlights: [
      "Built 8 operational frontend views (React 19 + Liquid Glass dark UI) connected to an Express 5 REST backend and Prisma/Supabase PostgreSQL schema.",
      "Documented implemented backend/AI endpoints clearly alongside planned cloud deployment and E2E testing.",
    ],
    tags: ["React 19", "Node.js", "Express 5", "PostgreSQL", "Prisma", "Gemini API"],
    href: "/projects/office-aid",
  },
  {
    id: "muzo-2026",
    index: "02",
    kind: "project",
    period: "September 2026",
    title: "MUZO — Web Audio Discovery Platform",
    organization: "Frontend & Audio Engineering",
    locationOrMode: "Live on Vercel",
    summary:
      "Browser audio discovery player engineered around a provider-agnostic HTML5 Audio core, persistent Zustand queue state, race-free search, and custom pure-CSS 3D Neumorphism.",
    highlights: [
      "Eliminated stale API search responses with AbortController cancellation and automated catalog fallback routing.",
      "Built real-time scrub-seeking, localStorage queue persistence, and an automated overflow title marquee without external UI kits.",
    ],
    tags: ["React", "Zustand", "HTML5 Audio", "AbortController", "CSS Tokens", "Vercel"],
    href: "/projects/muzo",
    externalHref: "https://code-alpha-muzo-music-player.vercel.app/",
    externalLabel: "Live Demo",
  },
  {
    id: "employability-intern-2025",
    index: "03",
    kind: "internship",
    period: "November 2025 – January 2026",
    title: "AWS DevOps Intern",
    organization: "Employability.life",
    locationOrMode: "Remote",
    summary:
      "Completed the XPro Project: AWS DevOps Initiative, building foundational familiarity with cloud compute, storage, CI/CD workflows, and cloud application deployment.",
    highlights: [
      "Explored core AWS services including Amazon EC2 and Amazon S3 alongside deployment pipelines.",
      "Learned practical DevOps concepts bridging source repositories and hosted cloud infrastructure (Credential ID: XPro27566969).",
    ],
    tags: ["AWS EC2", "AWS S3", "CI/CD Workflows", "Cloud Basics"],
  },
  {
    id: "snu-btech-2023",
    index: "04",
    kind: "education",
    period: "2023 – 2027",
    title: "B.Tech in Computer Science & Engineering",
    organization: "Sister Nivedita University",
    locationOrMode: "Kolkata, India",
    summary:
      "Undergraduate computer science curriculum pairing data structures, database management systems, operating principles, and full-stack software engineering.",
    highlights: [
      "Pursuing core undergraduate CS curriculum while building full-stack web projects and studying Generative AI & Large Language Models.",
    ],
    tags: ["C / C++", "Python", "DBMS (SQL & NoSQL)", "Software Engineering"],
  },
  {
    id: "aditya-xii-2023",
    index: "05",
    kind: "education",
    period: "2023",
    title: "Senior Secondary Education (Class XII)",
    organization: "Aditya Academy Senior Secondary",
    locationOrMode: "CBSE Board · 80%",
    summary:
      "Completed Class XII higher secondary studies under the Central Board of Secondary Education before starting undergraduate Computer Science engineering.",
    highlights: ["Class XII Final Score: 80% (2023)."],
    tags: ["CBSE", "Mathematics", "Computer Science Track"],
  },
  {
    id: "aditya-x-2021",
    index: "06",
    kind: "education",
    period: "2021",
    title: "Secondary Education (Class X)",
    organization: "Aditya Academy Senior Secondary",
    locationOrMode: "CBSE Board · 86%",
    summary:
      "Completed foundational CBSE secondary schooling with strong academic consistency in quantitative and core subjects.",
    highlights: ["Class X Final Score: 86% (2021)."],
    tags: ["CBSE", "86% Aggregate"],
  },
];

export const EDUCATION_RECORDS: EducationRecord[] = [
  {
    id: "snu",
    index: "EDU // 01",
    institution: "Sister Nivedita University",
    program: "B.Tech in Computer Science and Engineering",
    boardOrUniversity: "Undergraduate Degree Program",
    period: "2023 – 2027",
    metrics: [{ label: "Degree Status", value: "In Progress" }],
    focusAreas: [
      "Computer Science Foundations",
      "Relational & Document Databases",
      "Full-Stack Web Systems",
      "Applied AI & LLM Study",
    ],
  },
  {
    id: "aditya-academy",
    index: "EDU // 02",
    institution: "Aditya Academy Senior Secondary",
    program: "Senior Secondary & Secondary Schooling",
    boardOrUniversity: "Central Board of Secondary Education (CBSE)",
    period: "2021 & 2023",
    metrics: [
      { label: "Class XII (2023)", value: "80%" },
      { label: "Class X (2021)", value: "86%" },
    ],
    focusAreas: ["CBSE Science & Mathematics", "Analytical Problem Solving"],
  },
];
