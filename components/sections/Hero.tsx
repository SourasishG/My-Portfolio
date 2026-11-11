"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Mail,
} from "lucide-react";
import { HeroBlobFallback } from "@/components/canvas/HeroBlob";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HERO_COPY } from "@/content/copy";
import { SITE_IDENTITY, SOCIAL_LINKS } from "@/content/links";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";
import styles from "./Hero.module.scss";

/**
 * Section 01 — Kinetic Core Hero (`#hero`).
 *
 * Rendering & animation ownership guarantees:
 * - Server-rendered headline (`<h1>SOURASISH GHOSH</h1>`) starts immediately at `opacity: 1` for instant LCP.
 * - GSAP + SplitText owns `.hero-name` upward character settle (`yPercent` inside line masks only)
 *   plus `#hero` ScrollTrigger writing `heroMorph` (`0..1`) into `useSceneStore`.
 * - Framer Motion strictly owns `.hero-cta-magnetic` and `.hero-social-btn` via `<MagneticButton>`.
 * - Automatically displays static SVG topology fallback when reduced motion is preferred or WebGL is inactive.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const useStaticFallback = useSceneStore((s) => s.useStaticFallback);

  useGSAP(
    () => {
      ensureGsapRegistered();
      const sectionEl = sectionRef.current;
      const nameEl = nameRef.current;
      if (!sectionEl) return;

      const store = useSceneStore.getState();
      let split: SplitText | null = null;
      const preferReduced =
        reducedMotion ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      if (!preferReduced && nameEl) {
        split = SplitText.create(nameEl, {
          type: "lines,chars",
          mask: "lines",
          aria: "auto",
        });

        gsap.from(split.chars, {
          yPercent: 22,
          duration: 0.72,
          ease: "expo.out",
          stagger: 0.016,
          clearProps: "transform",
        });
      }

      const morphTrigger = ScrollTrigger.create({
        trigger: sectionEl,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          store.setHeroMorph(self.progress);
        },
      });

      return () => {
        morphTrigger.kill();
        split?.revert();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true }
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={styles.heroSection}
      aria-label="Hero Introduction"
    >
      {useStaticFallback && (
        <div className={styles.fallbackStage} aria-hidden="true">
          <HeroBlobFallback label="SIGNAL point-cloud fallback visual" />
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.topHud}>
          <div className={styles.hudGroup}>
            <span className={styles.hudTag}>{HERO_COPY.sectionTag}</span>
            <span className={styles.coords}>{SITE_IDENTITY.coordinates}</span>
          </div>

          <div className={styles.statusPill}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>{HERO_COPY.availabilityLabel}</span>
          </div>
        </div>

        <div className={styles.mainBlock}>
          <p className={styles.roleEyebrow}>{HERO_COPY.roleLabel}</p>

          <h1 ref={nameRef} className={`${styles.heroTitle} hero-name`}>
            <span className={styles.nameLine}>{HERO_COPY.firstName}</span>{" "}
            <span className={styles.nameLine}>{HERO_COPY.lastName}</span>
          </h1>

          <p className={`${styles.manifesto} hero-headline`}>
            {HERO_COPY.manifesto}
          </p>

          <p className={`${styles.bio} hero-sub`}>{HERO_COPY.supportingCopy}</p>

          <div className={styles.ctaRow}>
            <MagneticButton
              href="/#projects"
              variant="primary"
              className="hero-cta-magnetic"
            >
              <span>{HERO_COPY.ctaPrimary}</span>
              <ArrowDownRight size={15} aria-hidden="true" />
            </MagneticButton>

            <MagneticButton
              href={SITE_IDENTITY.resumeHref}
              download={SITE_IDENTITY.resumeFileName}
              variant="secondary"
              className="hero-cta-magnetic"
            >
              <Download size={14} aria-hidden="true" />
              <span>{HERO_COPY.ctaResume}</span>
            </MagneticButton>

            <MagneticButton
              href="/#contact"
              variant="ghost"
              className="hero-cta-magnetic"
            >
              <Mail size={14} aria-hidden="true" />
              <span>{HERO_COPY.ctaContact}</span>
            </MagneticButton>
          </div>
        </div>

        <div className={styles.bottomHud}>
          <nav className={styles.socialGroup} aria-label="Social profiles">
            {SOCIAL_LINKS.map((social) => (
              <MagneticButton
                key={social.id}
                href={social.href}
                external
                variant="icon"
                className={`${styles.socialBtn} hero-social-btn`}
                ariaLabel={`${social.label} profile (${social.handle})`}
              >
                <span className={styles.socialLabel}>{social.label}</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </MagneticButton>
            ))}
          </nav>

          <Link href="/#about" className={styles.scrollCue}>
            <span className={styles.scrollTick} aria-hidden="true" />
            <span>{HERO_COPY.scrollCue}</span>
            <ArrowDown size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
