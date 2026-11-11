export interface NavAnchorItem {
  index: string;
  id: string;
  label: string;
  href: string;
}

export interface SocialLinkItem {
  id: "github" | "linkedin" | "instagram";
  label: string;
  handle: string;
  href: string;
}

export const SITE_IDENTITY = {
  brandMark: "SG",
  brandTag: "SIGNAL // 00",
  fullName: "Sourasish Ghosh",
  title: "Full-Stack Developer",
  location: "Kolkata, West Bengal, India",
  coordinates: "22.5726° N · 88.3639° E",
  email: "sourasishghosh062@gmail.com",
  resumeHref: "/docs/Sourasish-Ghosh-Resume.pdf",
  resumeFileName: "Sourasish-Ghosh-Resume.pdf",
  educationShort: "B.Tech CSE · Sister Nivedita University (2023–2027)",
} as const;

export const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: "github",
    label: "GitHub",
    handle: "@SourasishG",
    href: "https://github.com/SourasishG",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "in/sourasish-ghosh07",
    href: "https://www.linkedin.com/in/sourasish-ghosh07/",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@h3rric",
    href: "https://www.instagram.com/h3rric?srtk=MXR3ZG9zMWViNzB6MA==",
  },
];

export const NAV_ITEMS: NavAnchorItem[] = [
  { index: "01", id: "hero", label: "Hero", href: "/#hero" },
  { index: "02", id: "about", label: "About", href: "/#about" },
  { index: "03", id: "projects", label: "Projects", href: "/#projects" },
  { index: "04", id: "toolkit", label: "Toolkit", href: "/#toolkit" },
  { index: "05", id: "journey", label: "Journey", href: "/#journey" },
  { index: "06", id: "beyond", label: "Beyond", href: "/#beyond" },
  { index: "07", id: "aspirations", label: "Aspirations", href: "/#aspirations" },
  { index: "08", id: "contact", label: "Contact", href: "/#contact" },
];
