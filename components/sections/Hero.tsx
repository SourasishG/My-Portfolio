"use client";

import { useEffect, useRef } from "react";
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
import { playRotaryTick } from "@/lib/sound";
import { useSceneStore } from "@/lib/store";
import styles from "./Hero.module.scss";

/**
 * Section 01 — Presence Hero (`#hero`).
 *
 * Luka Skhiladze & Lorenzo Lottici Fusion Architecture:
 * - Monumental display typography combining Geist Sans with Instrument Serif italic.
 * - Commanding Central 360° Rotary Tuner Dial Stage framing the interactive
 *   2.5D Halftone Portrait stage (`#hero-portrait-stage`).
 * - Real-time polar angle tracking with procedural audio rotary ticks (0 React setState per frame).
 * - Calibrated radar rings, cardinal degree markers, and radiating technical sector reticles.
 * - Elegant, un-boxed horizontal telemetry facts strip.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const rotaryStageRef = useRef<HTMLDivElement>(null);
  const dialNeedleRef = useRef<SVGGElement>(null);
  const lastSectorRef = useRef<number>(-1);

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
          yPercent: 30,
          duration: 0.85,
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
    { scope: sectionRef, dependencies: [reducedMotion, motionEnabled], revertOnUpdate: true }
  );

  // High-frequency pointer tracking on the central rotary stage (0 React setState)
  useEffect(() => {
    const stageEl = rotaryStageRef.current;
    if (!stageEl || reducedMotion) return;

    let rafId: number | null = null;
    let targetAngle = 0;
    let currentAngle = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = stageEl.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      // Calculate polar angle in degrees (0° at top, clockwise)
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;
      targetAngle = angle;

      const sectorIdx = Math.floor(angle / 60);
      if (sectorIdx !== lastSectorRef.current) {
        lastSectorRef.current = sectorIdx;
        playRotaryTick();
      }

      if (!rafId) {
        rafId = requestAnimationFrame(updateNeedle);
      }
    };

    const updateNeedle = () => {
      // Smooth interpolation of dial needle
      let diff = targetAngle - currentAngle;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      currentAngle += diff * 0.12;

      if (dialNeedleRef.current) {
        dialNeedleRef.current.style.transform = `rotate(${currentAngle}deg)`;
      }

      if (Math.abs(diff) > 0.1) {
        rafId = requestAnimationFrame(updateNeedle);
      } else {
        rafId = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={styles.heroSection}
      aria-label="Hero Introduction"
    >
      <div className={styles.container}>
        {/* Top Minimal Telemetry HUD */}
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

        {/* Header Block: Monumental Typography */}
        <header className={styles.heroHeader}>
          <p className={styles.roleEyebrow}>{HERO_COPY.roleLabel}</p>

          <h1 ref={nameRef} className={`${styles.heroTitle} hero-name`}>
            <span className={styles.nameSans}>{HERO_COPY.firstName}</span>{" "}
            <span className={styles.nameSans}>{HERO_COPY.lastName}</span>
          </h1>

          <p className={`${styles.manifesto} hero-headline`}>
            {HERO_COPY.manifesto}
            <span className={styles.terminalCursor} aria-hidden="true">
              ▮
            </span>
          </p>

          <p className={`${styles.bio} hero-sub`}>{HERO_COPY.supportingCopy}</p>
        </header>

        {/* Central Grand Rotary Tuner Stage (Luka Skhiladze Style) */}
        <div className={styles.centralStageWrap} ref={rotaryStageRef}>
          {/* Luka-inspired 360° Calibrated Rotary Tuner SVG Overlay */}
          <svg
            className={styles.rotaryDialSvg}
            viewBox="0 0 600 600"
            fill="none"
            aria-hidden="true"
          >
            {/* Concentric Radar Rings */}
            <circle cx="300" cy="300" r="290" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            <circle cx="300" cy="300" r="280" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 9" />
            <circle cx="300" cy="300" r="268" stroke="rgba(77, 168, 255, 0.22)" strokeWidth="1" />
            <circle cx="300" cy="300" r="198" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="2 6" />

            {/* Cardinal Axes */}
            <line x1="300" y1="8" x2="300" y2="28" stroke="#FF5B1F" strokeWidth="2" />
            <line x1="300" y1="572" x2="300" y2="592" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="8" y1="300" x2="28" y2="300" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="572" y1="300" x2="592" y2="300" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

            {/* Sector Radial Lines */}
            <line x1="300" y1="300" x2="534" y2="165" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="300" y1="300" x2="534" y2="435" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="300" y1="300" x2="66" y2="435" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="300" y1="300" x2="66" y2="165" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" strokeDasharray="4 8" />

            {/* Degree & Sector Callouts */}
            <text x="300" y="44" fill="#FF5B1F" fontSize="10" letterSpacing="0.14em" fontFamily="var(--font-mono)" textAnchor="middle">000° // NORTH · APIS</text>
            <text x="548" y="160" fill="rgba(255, 255, 255, 0.55)" fontSize="9" letterSpacing="0.1em" fontFamily="var(--font-mono)" textAnchor="start">060° // SYSTEMS</text>
            <text x="548" y="445" fill="rgba(255, 255, 255, 0.55)" fontSize="9" letterSpacing="0.1em" fontFamily="var(--font-mono)" textAnchor="start">120° // AWS INFRA</text>
            <text x="300" y="582" fill="rgba(255, 255, 255, 0.55)" fontSize="9" letterSpacing="0.1em" fontFamily="var(--font-mono)" textAnchor="middle">180° // SOUTH · SHADERS</text>
            <text x="52" y="445" fill="rgba(255, 255, 255, 0.55)" fontSize="9" letterSpacing="0.1em" fontFamily="var(--font-mono)" textAnchor="end">240° // AI AGENTS</text>
            <text x="52" y="160" fill="rgba(255, 255, 255, 0.55)" fontSize="9" letterSpacing="0.1em" fontFamily="var(--font-mono)" textAnchor="end">300° // REACT 19</text>

            {/* Interactive Rotating Pointer Needle */}
            <g
              ref={dialNeedleRef}
              style={{ transformOrigin: "300px 300px", transition: "none" }}
            >
              <line x1="300" y1="300" x2="300" y2="35" stroke="#FF5B1F" strokeWidth="1.5" strokeDasharray="3 4" />
              <circle cx="300" cy="35" r="5" fill="#FF5B1F" filter="drop-shadow(0 0 6px rgba(255, 91, 31, 0.8))" />
            </g>
          </svg>

          {/* Central 3D Halftone Portrait Stage Frame */}
          <div className={styles.portraitCenterCard}>
            <div id="hero-portrait-stage" className={styles.portraitStageAnchor}>
              {showFallbackInDom && <PortraitFallback priority />}
            </div>
          </div>
        </div>

        {/* Action Controls Cluster */}
        <div className={styles.ctaCluster}>
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

        {/* Minimal Facts Telemetry Bar (Lorenzo & Luka Restraint) */}
        <div className={styles.factsBar} aria-label="Key Engineer Telemetry">
          {HERO_COPY.facts.map((fact, idx) => (
            <div key={fact.index} className={styles.factItem}>
              <span className={styles.factIndex}>[{fact.index}]</span>
              <span className={styles.factLabel}>{fact.label}:</span>
              <strong className={styles.factValue}>{fact.value}</strong>
              <span className={styles.factMeta}>({fact.meta})</span>
              {idx < HERO_COPY.facts.length - 1 && (
                <span className={styles.factSep} aria-hidden="true">·</span>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Minimal HUD: Social Profiles & Scroll Indicator */}
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
            <span>SCROLL TO TUNE IN</span>
            <ArrowDown size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
