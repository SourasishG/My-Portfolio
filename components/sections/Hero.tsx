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
import { PortraitFallback } from "@/components/canvas/PortraitHalftone";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HERO_COPY } from "@/content/copy";
import { SITE_IDENTITY, SOCIAL_LINKS } from "@/content/links";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";
import styles from "./Hero.module.scss";

/**
 * Section 01 — Presence Hero (`#hero`).
 *
 * Visual & Motion Architecture:
 * - Monumental display typography combining Geist Sans with Instrument Serif italic.
 * - Sub-tagline with pulsating ember terminal cursor.
 * - 2.5D Halftone Portrait stage (`#hero-portrait-stage`) synced with Three.js canvas.
 * - Under reduced motion, low tier, or mobile, displays accessible pure CSS <PortraitFallback />.
 * - Facts telemetry strip displaying real, verified credentials and academic metrics.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const useStaticFallback = useSceneStore((s) => s.useStaticFallback);
  const motionEnabled = useSceneStore((s) => s.motionEnabled);

  const showFallbackInDom =
    useStaticFallback || !motionEnabled || reducedMotion || !isDesktop;

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
        !motionEnabled ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      if (!preferReduced && nameEl) {
        split = SplitText.create(nameEl, {
          type: "lines,chars",
          mask: "lines",
          aria: "auto",
        });

        gsap.from(split.chars, {
          yPercent: 25,
          duration: 0.76,
          ease: "expo.out",
          stagger: 0.018,
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
    { scope: sectionRef, dependencies: [reducedMotion, motionEnabled], revertOnUpdate: true }
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={styles.heroSection}
      aria-label="Hero Introduction"
    >
      <div className={styles.container}>
        {/* Top HUD Line */}
        <div className={styles.topHud}>
          <div className={styles.hudGroup}>
            <span className={styles.hudTag}>{HERO_COPY.sectionTag}</span>
            <span className={styles.coords}>{SITE_IDENTITY.coordinates}</span>
            <span className={styles.conceptTag}>{`${HERO_COPY.conceptLine} // 2026`}</span>
          </div>

          <div className={styles.statusPill}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>{HERO_COPY.availabilityLabel}</span>
          </div>
        </div>

        {/* Main Grid: Typography Column + 2.5D Halftone Portrait Stage */}
        <div className={styles.mainGrid}>
          <div className={styles.typographyCol}>
            <p className={styles.roleEyebrow}>{HERO_COPY.roleLabel}</p>

            <h1 ref={nameRef} className={`${styles.heroTitle} hero-name`}>
              <span className={styles.nameSans}>{HERO_COPY.firstName}</span>{" "}
              <span className={styles.serifAccent}>{HERO_COPY.lastName}</span>
            </h1>

            <p className={`${styles.manifesto} hero-headline`}>
              {HERO_COPY.manifesto}
              <span className={styles.terminalCursor} aria-hidden="true">
                ▮
              </span>
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

          {/* Right Column: 2.5D Halftone Portrait Stage Frame */}
          <div className={styles.portraitCol}>
            <div className={styles.portraitCard}>
              <div className={styles.cardHeader}>
                <span>
                  <span className={styles.bracket}>[ </span>
                  FIG 01.1 // T1/T2 EDITORIAL RELIEF
                  <span className={styles.bracket}> ]</span>
                </span>
                <span className={styles.bracket}>+</span>
              </div>

              <div id="hero-portrait-stage" className={styles.portraitStageAnchor}>
                {/* Luka Skhiladze-inspired Rotary Precision Dial */}
                <svg className={styles.rotaryDialSvg} viewBox="0 0 400 400" fill="none" aria-hidden="true">
                  <circle cx="200" cy="200" r="192" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="2 6" />
                  <circle cx="200" cy="200" r="184" stroke="rgba(77, 168, 255, 0.14)" strokeWidth="1" />
                  <line x1="200" y1="2" x2="200" y2="14" stroke="#FF5B1F" strokeWidth="1.5" />
                  <line x1="200" y1="386" x2="200" y2="398" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                  <line x1="2" y1="200" x2="14" y2="200" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                  <line x1="386" y1="200" x2="398" y2="200" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                  <text x="200" y="24" fill="#FF5B1F" fontSize="8" letterSpacing="0.1em" fontFamily="var(--font-mono)" textAnchor="middle">000° // NORTH</text>
                  <text x="376" y="203" fill="rgba(255, 255, 255, 0.45)" fontSize="7" letterSpacing="0.08em" fontFamily="var(--font-mono)" textAnchor="end">090°</text>
                  <text x="200" y="380" fill="rgba(255, 255, 255, 0.45)" fontSize="7" letterSpacing="0.08em" fontFamily="var(--font-mono)" textAnchor="middle">180°</text>
                  <text x="24" y="203" fill="rgba(255, 255, 255, 0.45)" fontSize="7" letterSpacing="0.08em" fontFamily="var(--font-mono)" textAnchor="start">270°</text>
                </svg>

                {showFallbackInDom && (
                  <PortraitFallback priority />
                )}
              </div>

              <div className={styles.cardFooter}>
                <span>MiDaS v2.1 MONOCULAR HEIGHTMAP</span>
                <span>fwidth() ANTI-ALIASED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Facts Telemetry Strip */}
        <div className={styles.factsStrip} aria-label="Key Engineer Telemetry">
          {HERO_COPY.facts.map((fact) => (
            <div key={fact.index} className={styles.factCard}>
              <div className={styles.factHeader}>
                <span className={styles.factIndex}>{fact.index}</span>
                <span>{`// ${fact.label}`}</span>
              </div>
              <div className={styles.factValue}>{fact.value}</div>
              <div className={styles.factMeta}>{fact.meta}</div>
            </div>
          ))}
        </div>

        {/* Bottom HUD: Social Links + Scroll Cue */}
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
