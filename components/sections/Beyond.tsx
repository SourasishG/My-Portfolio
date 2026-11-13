"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { Film, Gamepad2, Headphones, Trophy } from "lucide-react";
import { BEYOND_COPY, BEYOND_INTERESTS, BeyondInterest } from "@/content/copy";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";
import styles from "./Beyond.module.scss";

function InterestIcon({ id }: { id: BeyondInterest["id"] }) {
  if (id === "football") return <Trophy size={15} aria-hidden="true" />;
  if (id === "video-games") return <Gamepad2 size={15} aria-hidden="true" />;
  if (id === "music") return <Headphones size={15} aria-hidden="true" />;
  return <Film size={15} aria-hidden="true" />;
}

/**
 * Section 06 — Beyond the Screen (`#beyond`).
 *
 * Single `$paper` (`#F4F4F2`) light editorial interruption in SIGNAL.
 * - Uses `$paper-ink` (`#0A0A0A`) and `$paper-muted` (`#555966`) for WCAG AA/AAA text contrast.
 * - `$signal` (`#FF5B1F`) is restricted strictly to crisp non-text Swiss geometric motifs.
 * - GSAP + ScrollTrigger owns `.beyond-hud-line`, `.beyond-headline`, `.beyond-caption`, and
 *   `.beyond-card` entrance settles (`opacity: 1` preserved); S7 `VelocityPlane` renders inside
 *   the transparent `#beyond-s7-stage` aperture while solid `$paper` surrounds it seamlessly.
 */
export function Beyond() {
  const sectionRef = useRef<HTMLElement>(null);
  const tracePathRef = useRef<SVGPathElement>(null);

  const reducedMotion = useReducedMotion();
  const activeSection = useSceneStore((s) => s.activeSection);
  const useStaticFallback = useSceneStore((s) => s.useStaticFallback);
  const velocityShaderReady = useSceneStore((s) => s.velocityShaderReady);

  const s7ShaderVisible =
    !useStaticFallback &&
    !reducedMotion &&
    activeSection === "beyond" &&
    velocityShaderReady;

  useGSAP(
    () => {
      ensureGsapRegistered();
      const sectionEl = sectionRef.current;
      const tracePath = tracePathRef.current;
      if (!sectionEl) return;

      const preferReduced =
        reducedMotion ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      const revealEls = sectionEl.querySelectorAll(
        ".beyond-headline, .beyond-caption, .beyond-card"
      );

      if (preferReduced) {
        if (tracePath) {
          gsap.set(tracePath, { clearProps: "strokeDasharray,strokeDashoffset" });
        }
        if (revealEls.length > 0) {
          gsap.set(revealEls, { clearProps: "opacity,transform" });
        }
        return;
      }

      if (tracePath) {
        gsap.set(tracePath, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.to(tracePath, {
          strokeDashoffset: 0,
          duration: 0.85,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 80%",
            once: true,
          },
        });
      }

      if (revealEls.length > 0) {
        gsap.from(revealEls, {
          y: 16,
          duration: 0.56,
          ease: "expo.out",
          stagger: 0.055,
          clearProps: "transform",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 84%",
            once: true,
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true }
  );

  return (
    <section
      id="beyond"
      ref={sectionRef}
      className={`${styles.beyondSection} beyond-paper-section ${
        s7ShaderVisible ? styles.beyondShaderWindow : ""
      }`}
      aria-labelledby="beyond-heading"
    >
      <div className={styles.container}>
        {/* Swiss Header Band */}
        <header className={styles.headerBand}>
          <div className={styles.headerMeta}>
            <span className={styles.hudTag}>
              <span className={styles.signalSquare} aria-hidden="true" />
              <span>{BEYOND_COPY.sectionTag}</span>
            </span>
            <span className={styles.subTag}>{BEYOND_COPY.subTag}</span>
          </div>

          <svg
            className={styles.hudLineSvg}
            viewBox="0 0 1200 16"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={tracePathRef}
              className="beyond-hud-line"
              d="M0 8 L290 8 L302 2 L1188 2 L1200 8"
              fill="none"
              stroke="rgba(10, 10, 10, 0.28)"
              strokeWidth="1"
              pathLength={1}
            />
          </svg>

          <div className={styles.introRow}>
            <h2
              id="beyond-heading"
              className={`${styles.heading} beyond-headline`}
            >
              Beyond the{" "}
              <span className={styles.serifHeading}>screen</span>.
            </h2>
            <p className={`${styles.leadCopy} beyond-caption`}>
              {BEYOND_COPY.leadCopy}
            </p>
          </div>
        </header>

        {/* Main Editorial Split */}
        <div className={styles.splitGrid}>
          {/* Left Column: S7 Velocity Portrait Stage */}
          <figure className={styles.stageCol}>
            <div className={styles.stageFrame}>
              <div className={styles.signalCornerBar} aria-hidden="true" />
              <div className={styles.cornerTR} aria-hidden="true" />
              <div className={styles.cornerBL} aria-hidden="true" />
              <div className={styles.cornerBR} aria-hidden="true" />

              <div
                id="beyond-s7-stage"
                className={`${styles.stageAperture} ${
                  s7ShaderVisible ? styles.stageApertureShaderActive : ""
                }`}
              >
                <Image
                  src="/images/profile/portrait-alt.jpg"
                  alt={BEYOND_COPY.portraitAlt}
                  fill
                  loading="eager"
                  sizes="(max-width: 1023px) 92vw, 420px"
                  quality={90}
                  className={styles.stageImage}
                  style={{ opacity: s7ShaderVisible ? 0 : 1 }}
                />
              </div>
            </div>
          </figure>

          {/* Right Column: Perspective Note & 4 Interests Matrix */}
          <div className={styles.editorialCol}>
            <div className={`${styles.philosophyBox} beyond-caption`}>
              <span className={styles.editorialEyebrow}>
                OBSERVATION &amp; PERSPECTIVE
              </span>
              <p className={styles.philosophyText}>
                {BEYOND_COPY.philosophyNote}
              </p>
            </div>

            <div className={styles.interestsGrid}>
              {BEYOND_INTERESTS.map((item) => (
                <article
                  key={item.id}
                  className={`${styles.interestCard} beyond-card`}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.cardIndex}>
                      [{item.index}] · {item.lens}
                    </span>
                    <span className={styles.cardIcon}>
                      <InterestIcon id={item.id} />
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardCaption}>{item.caption}</p>
                  <span className={styles.cardRule} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
