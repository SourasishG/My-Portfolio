import React from "react";

export interface SkillIconProps {
  id: string;
  size?: number;
  className?: string;
}

/**
 * High-precision vector brand logos for Sourasish Ghosh's engineering toolkit.
 * Built entirely with lightweight inline SVG primitives (0 npm dependencies).
 */
export function SkillIcon({ id, size = 15, className }: SkillIconProps) {
  switch (id) {
    case "python":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <path
            d="M11.9 2c-3.2 0-3.9 1.4-3.9 2.8v2.2h7.8V8H5c-1.5 0-3 .8-3 3.5s1.2 3.5 3 3.5h1.5v-2c0-1.7 1.4-3.1 3.1-3.1h4.8c1.3 0 2.4-1.1 2.4-2.4V4.8C16.8 3.4 15.1 2 11.9 2zM9.5 4.2a.8.8 0 110 1.6.8.8 0 010-1.6z"
            fill="#3776AB"
          />
          <path
            d="M12.1 22c3.2 0 3.9-1.4 3.9-2.8V17H8.2V16H19c1.5 0 3-.8 3-3.5S20.8 9 19 9h-1.5v2c0 1.7-1.4 3.1-3.1 3.1H9.6c-1.3 0-2.4 1.1-2.4 2.4v2.7c0 1.4 1.7 2.8 4.9 2.8zM14.5 19.8a.8.8 0 110-1.6.8.8 0 010 1.6z"
            fill="#FFD43B"
          />
        </svg>
      );

    case "javascript":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#F7DF1E" />
          <path
            d="M7 16.5c.5.8 1.2 1.3 2.2 1.3 1.2 0 2-.7 2-2.2v-6.6h-2v6.6c0 .4-.2.7-.6.7-.4 0-.6-.3-.8-.7L7 16.5zm8.2-.2c.5.9 1.4 1.5 2.5 1.5 1.4 0 2.3-.8 2.3-2 0-1.3-.8-1.8-2.2-2.4l-.6-.3c-.9-.4-1.3-.7-1.3-1.4 0-.6.5-1.1 1.3-1.1.7 0 1.2.3 1.6.9l1.4-1c-.7-1.1-1.7-1.5-3-1.5-1.6 0-2.6 1-2.6 2.3 0 1.2.7 1.8 2 2.3l.6.3c1 .4 1.5.8 1.5 1.5 0 .7-.6 1.2-1.5 1.2-.9 0-1.5-.5-1.9-1.2l-1.6 1.2z"
            fill="#07080A"
          />
        </svg>
      );

    case "c":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#659AD2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <path d="M12 2l9 5.2v10.4L12 23l-9-5.2V7.2L12 2z" fill="#659AD2" fillOpacity="0.18" />
          <path d="M14.5 9.5a3.8 3.8 0 100 5" strokeWidth="2.2" stroke="#659AD2" />
        </svg>
      );

    case "cpp":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#00599C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <path d="M12 2l9 5.2v10.4L12 23l-9-5.2V7.2L12 2z" fill="#00599C" fillOpacity="0.18" />
          <path d="M11 9a3.5 3.5 0 100 6M14.5 12h2M15.5 11v2M18 12h2M19 11v2" strokeWidth="1.6" stroke="#00E5FF" />
        </svg>
      );

    case "react":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#00E5FF" strokeWidth="1.4" aria-hidden="true" className={className}>
          <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(0 12 12)" />
          <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.8" fill="#00E5FF" />
        </svg>
      );

    case "html5":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <polygon points="4 2 20 2 18.5 19 12 21.5 5.5 19" fill="#E34F26" />
          <polygon points="12 3.5 18.8 3.5 17.5 17.8 12 19.8" fill="#EF652A" />
          <path d="M8 7h8l-.4 3.8H9.3l.3 3.5 2.4.7 2.4-.7.2-1.6h1.8l-.3 3.2-4.1 1.2-4.1-1.2L7 7h1z" fill="#ffffff" />
        </svg>
      );

    case "css3":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <polygon points="4 2 20 2 18.5 19 12 21.5 5.5 19" fill="#1572B6" />
          <polygon points="12 3.5 18.8 3.5 17.5 17.8 12 19.8" fill="#33A9DC" />
          <path d="M8 7h8l-.4 3.8H9.3l.3 3.5 2.4.7 2.4-.7.2-1.6h1.8l-.3 3.2-4.1 1.2-4.1-1.2L7 7h1z" fill="#ffffff" />
        </svg>
      );

    case "tailwind":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <path
            d="M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.3-1.8 3.7-1.3.8.3 1.4.9 2 1.6 1.1 1.1 2.3 2.4 4.8 2.4 2.7 0 4.3-1.3 5-4-1 1.3-2.3 1.8-3.7 1.3-.8-.3-1.4-.9-2-1.6-1-1.1-2.2-2.4-4.8-2.4zM4.5 12c-2.7 0-4.3 1.3-5 4 1-1.3 2.3-1.8 3.7-1.3.8.3 1.4.9 2 1.6 1 1.1 2.3 2.4 4.8 2.4 2.7 0 4.3-1.3 5-4-1 1.3-2.3 1.8-3.7 1.3-.8-.3-1.4-.9-2-1.6-1-1.1-2.2-2.4-4.8-2.4z"
            fill="#38BDF8"
          />
        </svg>
      );

    case "nodejs":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#539E43" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <polygon points="12 2 21 7.2 21 16.8 12 22 3 16.8 3 7.2" fill="#539E43" fillOpacity="0.16" />
          <path d="M12 2v20M3 7.2l18 9.6M21 7.2L3 16.8" opacity="0.3" />
          <circle cx="12" cy="12" r="2.8" fill="#539E43" />
        </svg>
      );

    case "expressjs":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" />
          <path d="M7 8h4M7 12h3M7 16h4M14 8l3 8M17 8l-3 8" stroke="#ffffff" strokeWidth="1.8" />
        </svg>
      );

    case "rest-apis":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <rect x="3" y="4" width="18" height="6" rx="2" fill="#00E5FF" fillOpacity="0.1" />
          <rect x="3" y="14" width="18" height="6" rx="2" fill="#00E5FF" fillOpacity="0.1" />
          <line x1="8" y1="10" x2="8" y2="14" stroke="#FF5B1F" strokeWidth="1.8" />
          <line x1="16" y1="10" x2="16" y2="14" stroke="#FF5B1F" strokeWidth="1.8" />
          <circle cx="6" cy="7" r="1" fill="#00E5FF" />
          <circle cx="6" cy="17" r="1" fill="#00E5FF" />
        </svg>
      );

    case "mysql":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#00758F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <path d="M4 7c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3z" fill="#00758F" fillOpacity="0.2" />
          <path d="M4 7v10c0 2 3.6 3 8 3s8-1 8-3V7" />
          <path d="M4 12c0 2 3.6 3 8 3s8-1 8-3" />
          <path d="M12 11c2 0 4-1 4-2.5" stroke="#F29111" strokeWidth="1.6" />
        </svg>
      );

    case "mongodb":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <path
            d="M12 2C12 2 6 7 6 13.5C6 17.5 8.5 21 11.5 22V16.5C11.5 16.5 11 15 11 13C11 11 12 9 12 9C12 9 13 11 13 13C13 15 12.5 16.5 12.5 16.5V22C15.5 21 18 17.5 18 13.5C18 7 12 2 12 2Z"
            fill="#13AA52"
            stroke="#13AA52"
            strokeWidth="0.8"
          />
        </svg>
      );

    case "postgresql":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#4DA8FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <ellipse cx="12" cy="6" rx="8" ry="3" fill="#4DA8FF" fillOpacity="0.16" />
          <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
          <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
          <path d="M9 10a3 3 0 006 0" stroke="#FF5B1F" strokeWidth="1.4" />
        </svg>
      );

    case "aws-ec2":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" fill="#FF9900" fillOpacity="0.12" />
          <line x1="12" y1="2" x2="12" y2="22" opacity="0.4" />
          <line x1="3" y1="7" x2="21" y2="17" opacity="0.3" />
          <line x1="3" y1="17" x2="21" y2="7" opacity="0.3" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="#FF9900" />
        </svg>
      );

    case "aws-s3":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#569A31" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <path d="M4 6l8-3 8 3v12l-8 3-8-3V6z" fill="#569A31" fillOpacity="0.12" />
          <line x1="4" y1="6" x2="12" y2="9" />
          <line x1="20" y1="6" x2="12" y2="9" />
          <line x1="12" y1="9" x2="12" y2="21" />
          <path d="M8 12l4 1.5 4-1.5" stroke="#FF9900" strokeWidth="1.3" />
        </svg>
      );

    case "cicd":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <circle cx="6" cy="12" r="3" fill="#00E5FF" fillOpacity="0.2" />
          <circle cx="18" cy="12" r="3" fill="#FF5B1F" fillOpacity="0.2" stroke="#FF5B1F" />
          <path d="M9 12c1.5 3 4.5 3 6 0s4.5-3 6 0" />
          <path d="M9 12c1.5-3 4.5-3 6 0" />
        </svg>
      );

    case "git":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#F05032" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <circle cx="18" cy="6" r="2.8" fill="#F05032" fillOpacity="0.2" />
          <circle cx="6" cy="18" r="2.8" fill="#F05032" fillOpacity="0.2" />
          <circle cx="18" cy="18" r="2.8" fill="#F05032" fillOpacity="0.2" />
          <path d="M6 15.2V8.8a2.8 2.8 0 012.8-2.8H15.2M18 8.8v6.4" />
        </svg>
      );

    case "github":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );

    case "supabase":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <path d="M13.5 2L3 14.5H11L9.5 22L21 9.5H12.5L13.5 2Z" fill="#3ECF8E" stroke="#3ECF8E" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );

    case "postman":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#FF6C37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <circle cx="12" cy="12" r="9" fill="#FF6C37" fillOpacity="0.16" />
          <path d="M7.5 12l9-5-3.5 10.5-2-3.5-3.5-2z" fill="#FF6C37" />
        </svg>
      );

    case "nextjs":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <circle cx="12" cy="12" r="10" fill="#ffffff" fillOpacity="0.1" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <path d="M8 8v8M16 8v8M8 8l8 8" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "typescript":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6" />
          <path
            d="M6 9h7M9.5 9v8M14.5 15.5c.5.9 1.4 1.5 2.5 1.5 1.4 0 2.2-.8 2.2-2 0-1.3-.8-1.8-2.2-2.4l-.6-.3c-.9-.4-1.3-.7-1.3-1.4 0-.6.5-1.1 1.3-1.1.7 0 1.2.3 1.6.9l1.2-1c-.6-1-1.6-1.4-2.8-1.4-1.6 0-2.6 1-2.6 2.3 0 1.2.7 1.8 2 2.3l.6.3c1 .4 1.4.8 1.4 1.5 0 .7-.6 1.2-1.5 1.2-.9 0-1.4-.5-1.8-1.2l-1.5 1.1z"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "ai-ml":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <circle cx="6" cy="6" r="2" fill="#A855F7" />
          <circle cx="18" cy="6" r="2" fill="#A855F7" />
          <circle cx="12" cy="12" r="2.8" fill="#00E5FF" stroke="#00E5FF" />
          <circle cx="6" cy="18" r="2" fill="#FF5B1F" stroke="#FF5B1F" />
          <circle cx="18" cy="18" r="2" fill="#FF5B1F" stroke="#FF5B1F" />
          <line x1="8" y1="6" x2="16" y2="6" opacity="0.4" />
          <line x1="6" y1="8" x2="10.5" y2="10.5" opacity="0.6" />
          <line x1="18" y1="8" x2="13.5" y2="10.5" opacity="0.6" />
          <line x1="10.5" y1="13.5" x2="6" y2="16" opacity="0.6" />
          <line x1="13.5" y1="13.5" x2="18" y2="16" opacity="0.6" />
        </svg>
      );

    case "generative-ai":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <path d="M12 2l2.4 6.2L20.6 10.6 14.4 13 12 19.2 9.6 13 3.4 10.6 9.6 8.2 12 2z" fill="#00E5FF" />
          <path d="M19 16l1.2 3.1 3.1 1.2-3.1 1.2L19 24.6l-1.2-3.1-3.1-1.2 3.1-1.2L19 16z" fill="#FF5B1F" />
        </svg>
      );

    case "llms":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="rgba(255,255,255,0.25)" />
          <path d="M7 8h10M7 12h7M7 16h4" stroke="#00E5FF" strokeWidth="1.8" />
          <circle cx="16" cy="15" r="2" fill="#FF5B1F" stroke="#FF5B1F" />
        </svg>
      );

    case "ai-agents":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#FF5B1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <rect x="4" y="6" width="16" height="13" rx="3" fill="#FF5B1F" fillOpacity="0.12" />
          <line x1="12" y1="2" x2="12" y2="6" strokeWidth="1.8" />
          <circle cx="12" cy="2" r="1" fill="#FF5B1F" />
          <circle cx="9" cy="11" r="1.5" fill="#00E5FF" stroke="#00E5FF" />
          <circle cx="15" cy="11" r="1.5" fill="#00E5FF" stroke="#00E5FF" />
          <path d="M9 15h6" strokeLinecap="round" />
        </svg>
      );

    case "threejs":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <polygon points="12 3 2 20 22 20" fill="rgba(255,255,255,0.12)" />
          <polygon points="12 3 12 20 2 20" fill="rgba(255,255,255,0.06)" />
          <line x1="12" y1="3" x2="12" y2="20" stroke="#FF5B1F" strokeWidth="1.6" />
        </svg>
      );

    case "r3f":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" fill="#00E5FF" fillOpacity="0.15" />
          <ellipse cx="12" cy="12" rx="7" ry="2.5" transform="rotate(-30 12 12)" stroke="#FF5B1F" strokeWidth="1.3" />
          <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
        </svg>
      );

    case "framer-motion":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <path d="M4 2h16v8l-8 8V10H4V2z" fill="#0055FF" />
          <path d="M4 18h8l8-8v8H4z" fill="#FF0055" />
        </svg>
      );

    case "scss":
    case "sass":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#CF649A" fillOpacity="0.14" stroke="#CF649A" strokeWidth="1.2" />
          <path
            d="M17.5 7.5c-.5-.6-1.3-1-2.1-1-1.6 0-2.6 1.1-2.6 2.4 0 2.5 3.5 1.9 3.5 4.3 0 1.4-1.1 2.3-2.6 2.3-1.1 0-2-.5-2.5-1.3m-.9-6.9c.4.6.8 1.4.8 2.4 0 2.3-3.2 2-3.2 4.1 0 1.1.9 2 2.2 2 .9 0 1.6-.5 2.1-1.1"
            stroke="#CF649A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "gsap":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#08140B" stroke="#0AE448" strokeWidth="1.2" />
          <path
            d="M15.2 8.2c-.8-.8-2-1.2-3.4-1.2-2.7 0-4.6 1.8-4.6 4.8s1.9 4.8 4.6 4.8c2.3 0 3.7-1.1 4.1-2.9h-3.7v-1.7h5.6v.4c0 3.2-2.1 5.8-6 5.8-3.7 0-6.4-2.6-6.4-6.4s2.7-6.4 6.4-6.4c2 0 3.7.7 4.9 1.9l-1.5 1.7z"
            fill="#0AE448"
          />
        </svg>
      );

    case "lenis":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#0E1015" stroke="rgba(255, 91, 31, 0.45)" strokeWidth="1.2" />
          <path
            d="M5.5 15.5c3.2 0 3.2-7 6.5-7s3.2 7 6.5 7"
            stroke="#FF5B1F"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="5.5" cy="15.5" r="1.5" fill="#FFFFFF" />
          <circle cx="18.5" cy="15.5" r="1.5" fill="#00E5FF" />
        </svg>
      );

    case "locomotive":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#141414" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
          <path
            d="M8.5 6.5v9.2a1.3 1.3 0 001.3 1.3h5.7"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="15.5" cy="8" r="1.4" fill="#D4B27C" />
        </svg>
      );

    case "glsl":
    case "gsls":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={className}>
          <polygon points="12 2 22 7.8 22 16.2 12 22 2 16.2 2 7.8" fill="#5586A4" fillOpacity="0.16" stroke="#5586A4" strokeWidth="1.3" />
          <polygon points="12 2 22 7.8 12 12 2 7.8" fill="#5586A4" fillOpacity="0.32" />
          <line x1="12" y1="12" x2="12" y2="22" stroke="#00E5FF" strokeWidth="1.4" />
          <line x1="22" y1="7.8" x2="12" y2="12" stroke="#5586A4" strokeWidth="1.2" />
          <line x1="2" y1="7.8" x2="12" y2="12" stroke="#5586A4" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="2" fill="#FF5B1F" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
  }
}
