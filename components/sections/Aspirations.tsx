"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { ArrowDownRight, Compass, Cpu, Layers } from "lucide-react";
import { ChromeArchesFallback } from "@/components/canvas/ChromeArches";
import {
  ASPIRATIONS_COPY,
  ASPIRATIONS_HORIZONS,
  ASPIRATIONS_PILLARS,
  AspirationPillar,
} from "@/content/copy";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";
import styles from "./Aspirations.module.scss";

function PillarIcon({ id }: { id: AspirationPillar["id"] }) {
  if (id === "ownership") return <Layers size={16} aria-hidden="true" />;
  if (id === "architecture") return <Compass size={16} aria-hidden="true" />;
  return <Cpu size={16} aria-hidden="true" />;
}

/**
 * Section 07 — Aspirations & Future Vision (`#aspirations`).
 *
 * Returns crisply from Section 06 `$paper` (`#F4F4F2`) back to `$ink` (`#07080B`).
 * - GSAP + ScrollTrigger owns `.aspirations-hud-line` stroke draw, `.aspirations-copy`
 *   entrance settles (`opacity: 1` preserved), and continuous section scrub writing
 *   `aspirationsProgress` into `useSceneStore` for S5 `ChromeArches`.
 * - `#aspirations-s5-stage` exposes the transparent aperture on desktop/WebGL and
 *   automatically displays crisp monochrome `<ChromeArchesFallback />` under
 *   reduced motion, low GPU tier, or while scrolling outside Section 07.
 */
export function Aspirations() {
  const sectionRef = useRef<HTMLElement>(null);
  const tracePathRef = useRef<SVGPathElement>(null);

  const reducedMotion = useReducedMotion();
  const activeSection = useSceneStore((s) => s.activeSection);
  const useStaticFallback = useSceneStore((s) => s.useStaticFallback);
  const chromeArchesReady = useSceneStore((s) => s.chromeArchesReady);

  const s5ShaderVisible =
    !useStaticFallback &&
    !reducedMotion &&
    activeSection === "aspirations" &&
    chromeArchesReady;

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

      const copyEls = sectionEl.querySelectorAll(".aspirations-copy");

      if (preferReduced) {
        if (tracePath) {
          gsap.set(tracePath, { clearProps: "strokeDasharray,strokeDashoffset" });
        }
        if (copyEls.length > 0) {
          gsap.set(copyEls, { clearProps: "opacity,transform" });
        }
        const state = useSceneStore.getState();
        if (typeof state.setAspirationsProgress === "function") {
          state.setAspirationsProgress(0.35);
        } else {
          state.aspirationsProgress = 0.35;
        }
        return;
      }

      if (tracePath) {
        gsap.set(tracePath, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.to(tracePath, {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 80%",
            once: true,
          },
        });
      }

      if (copyEls.length > 0) {
        gsap.from(copyEls, {
          y: 16,
          duration: 0.56,
          ease: "expo.out",
          stagger: 0.055,
          clearProps: "transform",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 82%",
            once: true,
          },
        });
      }

      ScrollTrigger.create({
        trigger: sectionEl,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const state = useSceneStore.getState();
          if (typeof state.setAspirationsProgress === "function") {
            state.setAspirationsProgress(self.progress);
          } else {
            state.aspirationsProgress = self.progress;
          }
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true }
  );

  return (
    <section
      id="aspirations"
      ref={sectionRef}
      className={`${styles.aspirationsSection} ${
        s5ShaderVisible ? styles.aspirationsShaderActive : ""
      }`}
      aria-labelledby="aspirations-heading"
    >
      <div className={styles.container}>
        {/* Header Band */}
        <header className={styles.headerBand}>
          <div className={styles.headerMeta}>
            <span className={styles.hudTag}>{ASPIRATIONS_COPY.sectionTag}</span>
            <span className={styles.subTag}>{ASPIRATIONS_COPY.subTag}</span>
          </div>

          <svg
            className={styles.hudLineSvg}
            viewBox="0 0 1200 16"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={tracePathRef}
              className="aspirations-hud-line"
              d="M0 8 L260 8 L272 2 L1188 2 L1200 8"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              pathLength={1}
            />
          </svg>

          <div className={styles.headingRow}>
            <h2
              id="aspirations-heading"
              className={`${styles.heading} aspirations-copy`}
            >
              Becoming a full-stack engineer who owns the{" "}
              <span className={styles.serifHeading}>whole system</span>.
            </h2>

            <div className={`${styles.manifestoBlock} aspirations-copy`}>
              <p className={styles.manifestoLead}>{ASPIRATIONS_COPY.manifesto}</p>
              <p className={styles.supportingCopy}>
                {ASPIRATIONS_COPY.supportingCopy}
              </p>
            </div>
          </div>
        </header>

        {/* Sculptural Chrome Arches + Core Engineering Pillars */}
        <div className={styles.splitGrid}>
          <figure className={styles.stageCol}>
            <div
              className={`${styles.stageFrame} ${
                s5ShaderVisible ? styles.stageFrameShader : ""
              }`}
            >
              <div className={styles.cornerTL} aria-hidden="true" />
              <div className={styles.cornerTR} aria-hidden="true" />
              <div className={styles.cornerBL} aria-hidden="true" />
              <div className={styles.cornerBR} aria-hidden="true" />

              <div
                id="aspirations-s5-stage"
                className={`${styles.stageAperture} ${
                  s5ShaderVisible ? styles.stageApertureShader : ""
                }`}
              >
                <div
                  className={styles.stageFallback}
                  style={{ opacity: s5ShaderVisible ? 0 : 1 }}
                >
                  <ChromeArchesFallback />
                </div>
              </div>
            </div>
          </figure>

          <div className={styles.pillarsCol}>
            {ASPIRATIONS_PILLARS.map((pillar) => (
              <article
                key={pillar.id}
                className={`${styles.pillarCard} aspirations-copy`}
              >
                <div className={styles.pillarHeader}>
                  <span className={styles.pillarTag}>
                    [{pillar.index}] · {pillar.tag}
                  </span>
                  <span className={styles.pillarIcon}>
                    <PillarIcon id={pillar.id} />
                  </span>
                </div>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDescription}>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Continuous Learning Trajectory & Contact Transition */}
        <div className={styles.horizonSection}>
          <div className={`${styles.horizonHeader} aspirations-copy`}>
            <div className={styles.horizonTitleGroup}>
              <span className={styles.horizonTag}>
                NEXT HORIZONS // CONTINUOUS EXPLORATION
              </span>
              <h3 className={styles.horizonHeading}>
                Where active study meets production craft
              </h3>
            </div>

            <Link href={ASPIRATIONS_COPY.ctaHref} className={styles.horizonCta}>
              <span>{ASPIRATIONS_COPY.ctaLabel}</span>
              <ArrowDownRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.horizonsGrid}>
            {ASPIRATIONS_HORIZONS.map((track) => (
              <article
                key={track.id}
                className={`${styles.horizonCard} aspirations-copy`}
              >
                <span className={styles.horizonPhase}>{track.phase}</span>
                <h4 className={styles.horizonFocus}>{track.focus}</h4>
                <p className={styles.horizonNote}>{track.note}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
