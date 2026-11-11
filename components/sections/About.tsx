"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { ContourSphereFallback } from "@/components/canvas/ContourSphere";
import { ABOUT_COPY } from "@/content/copy";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";
import styles from "./About.module.scss";

/**
 * Section 02 — Personal Architecture (`#about`).
 *
 * Animation & WebGL contract:
 * - GSAP + ScrollTrigger strictly owns the SVG hairline stroke trace (`.about-hud-line`),
 *   staggered reveal settle (`.about-reveal`), and `aboutSplit` transient store scrub (`0..0.9`).
 * - `#about-s2-aperture` acts as an optically transparent HUD viewfinder tracked smoothly by the
 *   single persistent `<Canvas>` `ContourSphere` (S2), falling back cleanly to `ContourSphereFallback`
 *   when WebGL is inactive or reduced motion is active.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const tracePathRef = useRef<SVGPathElement>(null);
  const apertureRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useReducedMotion();
  const useStaticFallback = useSceneStore((s) => s.useStaticFallback);

  useGSAP(
    () => {
      ensureGsapRegistered();
      const sectionEl = sectionRef.current;
      const tracePath = tracePathRef.current;
      const apertureEl = apertureRef.current;
      if (!sectionEl) return;

      const store = useSceneStore.getState();

      const activeTrigger = ScrollTrigger.create({
        trigger: sectionEl,
        start: "top 45%",
        end: "bottom 45%",
        onEnter: () => store.setActiveSection("about"),
        onEnterBack: () => store.setActiveSection("about"),
      });

      const splitTrigger = apertureEl
        ? ScrollTrigger.create({
            trigger: apertureEl,
            start: "top 88%",
            end: "bottom 18%",
            scrub: true,
            onUpdate: (self) => {
              store.setAboutSplit(Math.min(1, Math.max(0, self.progress * 0.92)));
            },
          })
        : null;

      if (reducedMotion) {
        if (tracePath) {
          gsap.set(tracePath, { strokeDashoffset: 0 });
        }
        return () => {
          activeTrigger.kill();
          splitTrigger?.kill();
        };
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

      const revealEls = sectionEl.querySelectorAll(".about-reveal");
      if (revealEls.length > 0) {
        gsap.from(revealEls, {
          y: 20,
          opacity: 0.2,
          duration: 0.62,
          ease: "expo.out",
          stagger: 0.06,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 84%",
            once: true,
          },
        });
      }

      if (captionRef.current) {
        gsap.fromTo(
          captionRef.current,
          { y: 6 },
          {
            y: -6,
            ease: "none",
            scrollTrigger: {
              trigger: sectionEl,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      return () => {
        activeTrigger.kill();
        splitTrigger?.kill();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      className={styles.aboutSection}
      aria-labelledby="about-heading"
    >
      <div className={styles.container}>
        <div className={styles.headerBand}>
          <div className={styles.headerMeta}>
            <span className={styles.hudTag}>{ABOUT_COPY.sectionTag}</span>
            <span className={styles.subTag}>{ABOUT_COPY.subTag}</span>
          </div>

          <svg
            className={styles.hudLineSvg}
            viewBox="0 0 1200 16"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={tracePathRef}
              className="about-hud-line"
              d="M0 8 L260 8 L272 2 L1188 2 L1200 8"
              fill="none"
              stroke="rgba(77, 168, 255, 0.45)"
              strokeWidth="1"
              pathLength={1}
            />
          </svg>
        </div>

        <div className={styles.grid}>
          <div className={styles.proseColumn}>
            <h2 id="about-heading" className={`${styles.heading} about-reveal`}>
              {ABOUT_COPY.heading}
            </h2>

            <div className={styles.paragraphs}>
              {ABOUT_COPY.paragraphs.map((text, idx) => (
                <p key={idx} className={`${styles.paragraph} about-reveal`}>
                  {text}
                </p>
              ))}
            </div>

            <div className={styles.pillarsGrid}>
              {ABOUT_COPY.pillars.map((pillar) => (
                <article
                  key={pillar.label}
                  className={`${styles.pillarCard} about-reveal`}
                >
                  <span className={styles.pillarLabel}>{pillar.label}</span>
                  <h3 className={styles.pillarValue}>{pillar.value}</h3>
                  <p className={styles.pillarDetail}>{pillar.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.mediaColumn}>
            <figure className={`${styles.portraitCard} about-reveal`}>
              <div className={styles.cornerTL} aria-hidden="true" />
              <div className={styles.cornerTR} aria-hidden="true" />
              <div className={styles.cornerBL} aria-hidden="true" />
              <div className={styles.cornerBR} aria-hidden="true" />

              <div className={styles.portraitFrame}>
                <Image
                  src="/images/profile/portrait-main.jpg"
                  alt={ABOUT_COPY.portraitAlt}
                  fill
                  sizes="(max-width: 1023px) 92vw, 460px"
                  quality={90}
                  className={styles.portraitImg}
                />
              </div>

              <figcaption
                ref={captionRef}
                className={`${styles.captionBar} about-caption`}
              >
                <span className={styles.captionPrimary}>
                  {ABOUT_COPY.portraitCaption}
                </span>
                <span className={styles.captionMeta}>
                  {ABOUT_COPY.portraitLocation}
                </span>
              </figcaption>
            </figure>

            <div className={`${styles.apertureBox} about-reveal`}>
              <div className={styles.cornerTL} aria-hidden="true" />
              <div className={styles.cornerTR} aria-hidden="true" />
              <div className={styles.cornerBL} aria-hidden="true" />
              <div className={styles.cornerBR} aria-hidden="true" />

              <div className={styles.apertureHeader}>
                <span className={styles.apertureTag}>{ABOUT_COPY.apertureTag}</span>
                <span className={styles.apertureHint}>{ABOUT_COPY.apertureHint}</span>
              </div>

              <div id="about-s2-aperture" ref={apertureRef} className={styles.apertureStage}>
                {useStaticFallback && (
                  <ContourSphereFallback
                    split
                    label="SIGNAL topographic contour sphere static illustration"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
