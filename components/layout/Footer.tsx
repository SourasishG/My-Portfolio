"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { ArrowUp, ArrowUpRight, FileText, Mail } from "lucide-react";
import { FOOTER_COPY } from "@/content/copy";
import { NAV_ITEMS, SITE_IDENTITY, SOCIAL_LINKS } from "@/content/links";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import styles from "./Footer.module.scss";

/**
 * Persistent site Footer rendered across `/` and project/utility routes (hidden on `/lab`).
 * Features an S2-inspired split topographic contour emblem + editorial wordmark animated by GSAP,
 * strict link honesty, and zero private phone exposure.
 */
export function Footer() {
  const pathname = usePathname();
  const isLabRoute = pathname?.startsWith("/lab") ?? false;
  const footerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (isLabRoute) return;
      ensureGsapRegistered();
      const footerEl = footerRef.current;
      if (!footerEl) return;

      const preferReduced =
        reducedMotion ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      const wordmarkEl = footerEl.querySelector(".footer-wordmark");
      const upperHalf = footerEl.querySelector(".footer-contour-upper");
      const lowerHalf = footerEl.querySelector(".footer-contour-lower");

      if (preferReduced) {
        if (wordmarkEl) gsap.set(wordmarkEl, { clearProps: "opacity,transform" });
        if (upperHalf) gsap.set(upperHalf, { clearProps: "transform" });
        if (lowerHalf) gsap.set(lowerHalf, { clearProps: "transform" });
        return;
      }

      if (wordmarkEl) {
        gsap.from(wordmarkEl, {
          y: 16,
          duration: 0.6,
          ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: footerEl,
            start: "top 88%",
            once: true,
          },
        });
      }

      if (upperHalf && lowerHalf) {
        gsap.fromTo(
          upperHalf,
          { x: 0, y: 0 },
          {
            x: -5,
            y: -6,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: {
              trigger: footerEl,
              start: "top 88%",
              once: true,
            },
          }
        );
        gsap.fromTo(
          lowerHalf,
          { x: 0, y: 0 },
          {
            x: 5,
            y: 6,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: {
              trigger: footerEl,
              start: "top 88%",
              once: true,
            },
          }
        );
      }
    },
    { scope: footerRef, dependencies: [isLabRoute, reducedMotion], revertOnUpdate: true }
  );

  if (isLabRoute) {
    return null;
  }

  return (
    <footer ref={footerRef} className={styles.footer} aria-label="Site footer">
      <div className={styles.container}>
        {/* Top Wordmark + S2 Split Contour Emblem */}
        <div className={styles.brandBanner}>
          <div className={styles.emblemWrap} aria-hidden="true">
            <svg
              className={`${styles.contourMark} footer-contour-split`}
              viewBox="0 0 120 120"
              fill="none"
            >
              <defs>
                <clipPath id="footerUpperClip">
                  <polygon points="0,0 120,0 120,52 0,68" />
                </clipPath>
                <clipPath id="footerLowerClip">
                  <polygon points="0,68 120,52 120,120 0,120" />
                </clipPath>
              </defs>

              <g className="footer-contour-upper" clipPath="url(#footerUpperClip)">
                <circle cx="60" cy="60" r="46" stroke="#F3F5F9" strokeWidth="1.2" />
                <ellipse cx="60" cy="52" rx="41" ry="15" stroke="#F3F5F9" strokeOpacity="0.7" strokeWidth="1" />
                <ellipse cx="60" cy="40" rx="28" ry="9" stroke="#F3F5F9" strokeOpacity="0.5" strokeWidth="1" />
                <path d="M18 58 C 42 42, 74 68, 102 52" stroke="#4DA8FF" strokeOpacity="0.75" strokeWidth="1.15" />
              </g>

              <g className="footer-contour-lower" clipPath="url(#footerLowerClip)">
                <circle cx="60" cy="60" r="46" stroke="#F3F5F9" strokeWidth="1.2" />
                <ellipse cx="60" cy="68" rx="41" ry="15" stroke="#F3F5F9" strokeOpacity="0.7" strokeWidth="1" />
                <ellipse cx="60" cy="80" rx="28" ry="9" stroke="#F3F5F9" strokeOpacity="0.5" strokeWidth="1" />
                <path d="M19 67 C 46 80, 74 52, 102 68" stroke="#FF5B1F" strokeOpacity="0.85" strokeWidth="1.15" />
              </g>
            </svg>
          </div>

          <div className={`${styles.wordmarkBlock} footer-wordmark`}>
            <span className={styles.wordmarkTag}>{SITE_IDENTITY.brandTag}</span>
            <p className={styles.wordmark}>{FOOTER_COPY.wordmark}</p>
            <p className={styles.tagline}>{FOOTER_COPY.tagline}</p>
          </div>

          <Link href="/#hero" className={styles.backTopBtn} aria-label="Back to top">
            <ArrowUp size={15} aria-hidden="true" />
            <span>Top</span>
          </Link>
        </div>

        {/* 3-Column Index & Channels */}
        <div className={styles.grid}>
          <div className={styles.col}>
            <span className={styles.colLabel}>ENGINEERING COLOPHON</span>
            <p className={styles.colCopy}>{FOOTER_COPY.colophon}</p>
            <p className={styles.colMeta}>{FOOTER_COPY.locationLine}</p>
            <p className={styles.colMeta}>{SITE_IDENTITY.coordinates}</p>
          </div>

          <nav className={styles.col} aria-label="Footer section index">
            <span className={styles.colLabel}>SECTION INDEX</span>
            <ul className={styles.linkList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className={styles.footerLink}>
                    <span className={styles.linkIdx}>{item.index}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/lab" className={styles.footerLink}>
                  <span className={styles.linkIdx}>LAB</span>
                  <span>Shader Lab (S1–S8)</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.col}>
            <span className={styles.colLabel}>DIRECT CHANNELS</span>
            <ul className={styles.channelList}>
              <li>
                <a href={`mailto:${SITE_IDENTITY.email}`} className={styles.channelLink}>
                  <Mail size={13} aria-hidden="true" />
                  <span>{SITE_IDENTITY.email}</span>
                </a>
              </li>
              {SOCIAL_LINKS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.channelLink}
                  >
                    <ArrowUpRight size={13} aria-hidden="true" />
                    <span>
                      {item.label} ({item.handle})
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={SITE_IDENTITY.resumeHref}
                  download={SITE_IDENTITY.resumeFileName}
                  className={styles.channelLink}
                >
                  <FileText size={13} aria-hidden="true" />
                  <span>Download Resume (PDF)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal / Copyright Bar */}
        <div className={styles.bottomBar}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} {FOOTER_COPY.copyrightName}. Built cleanly in Kolkata, India.
          </span>
          <span className={styles.statusNote}>
            SIGNAL // ALL 08 SECTIONS ACTIVE
          </span>
        </div>
      </div>
    </footer>
  );
}
