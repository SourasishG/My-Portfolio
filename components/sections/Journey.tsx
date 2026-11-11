"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileBadge2,
  GraduationCap,
} from "lucide-react";
import { CERTIFICATIONS } from "@/content/certifications";
import { JOURNEY_COPY } from "@/content/copy";
import {
  EDUCATION_RECORDS,
  EXPERIENCE_SPOTLIGHT,
  JOURNEY_TIMELINE,
} from "@/content/timeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import styles from "./Journey.module.scss";

/**
 * Section 05 — Experience, Credentials & Education (`#journey`).
 *
 * Animation & Ownership Contract:
 * - GSAP + ScrollTrigger strictly owns `.journey-hud-line` stroke draw (`once: true`),
 *   `.journey-spine-line` vertical scroll-scrubbed spline (`strokeDashoffset: 1 -> 0`),
 *   and `.journey-entry` `y`-only entrance settles (starting at `opacity: 1`).
 * - Framer Motion (`AnimatePresence`) exclusively owns `.cert-detail-panel` accordion
 *   open/close transitions on separate containers so GSAP and Framer Motion never conflict.
 * - Strictly accurate facts only: zero exaggerated internship duties or fabricated links.
 */
export function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const tracePathRef = useRef<SVGPathElement>(null);
  const timelineWrapRef = useRef<HTMLDivElement>(null);
  const spinePathRef = useRef<SVGPathElement>(null);

  const reducedMotion = useReducedMotion();
  const [expandedCertId, setExpandedCertId] = useState<string | null>(
    CERTIFICATIONS[0].id
  );

  useGSAP(
    () => {
      ensureGsapRegistered();
      const sectionEl = sectionRef.current;
      const tracePath = tracePathRef.current;
      const spinePath = spinePathRef.current;
      const timelineWrap = timelineWrapRef.current;
      if (!sectionEl) return;

      const preferReduced =
        reducedMotion ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      const entryEls = sectionEl.querySelectorAll(".journey-entry");

      if (preferReduced) {
        if (tracePath) {
          gsap.set(tracePath, { clearProps: "strokeDasharray,strokeDashoffset" });
        }
        if (spinePath) {
          gsap.set(spinePath, { clearProps: "strokeDasharray,strokeDashoffset" });
        }
        if (entryEls.length > 0) {
          gsap.set(entryEls, { clearProps: "opacity,transform" });
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

      if (spinePath && timelineWrap) {
        gsap.set(spinePath, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.to(spinePath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: timelineWrap,
            start: "top 75%",
            end: "bottom 68%",
            scrub: 0.35,
          },
        });
      }

      if (entryEls.length > 0) {
        gsap.from(entryEls, {
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
      id="journey"
      ref={sectionRef}
      className={styles.journeySection}
      aria-labelledby="journey-heading"
    >
      <div className={styles.container}>
        {/* Header Band */}
        <header className={styles.headerBand}>
          <div className={styles.headerMeta}>
            <span className={styles.hudTag}>{JOURNEY_COPY.sectionTag}</span>
            <span className={styles.subTag}>{JOURNEY_COPY.subTag}</span>
          </div>

          <svg
            className={styles.hudLineSvg}
            viewBox="0 0 1200 16"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={tracePathRef}
              className="journey-hud-line"
              d="M0 8 L330 8 L342 2 L1188 2 L1200 8"
              fill="none"
              stroke="rgba(77, 168, 255, 0.45)"
              strokeWidth="1"
              pathLength={1}
            />
          </svg>

          <div className={styles.introRow}>
            <h2 id="journey-heading" className={`${styles.heading} journey-entry`}>
              {JOURNEY_COPY.heading}
            </h2>
            <p className={`${styles.leadCopy} journey-entry`}>
              {JOURNEY_COPY.leadCopy}
            </p>
          </div>
        </header>

        {/* 05.1 Work Experience Spotlight + Chronological Timeline Spine */}
        <div className={styles.subBand}>
          <div className={styles.subBandHeader}>
            <span className={styles.subBandTag}>{JOURNEY_COPY.experienceTag}</span>
          </div>

          <div className={styles.experienceGrid}>
            {/* Left Sticky Internship Spotlight */}
            <aside
              className={`${styles.spotlightCard} journey-entry`}
              aria-labelledby="intern-spotlight-title"
            >
              <div className={styles.cornerTL} aria-hidden="true" />
              <div className={styles.cornerTR} aria-hidden="true" />
              <div className={styles.cornerBL} aria-hidden="true" />
              <div className={styles.cornerBR} aria-hidden="true" />

              <div className={styles.spotlightTop}>
                <span className={styles.internBadge}>
                  <Briefcase size={12} aria-hidden="true" />
                  <span>{EXPERIENCE_SPOTLIGHT.index} · INTERNSHIP</span>
                </span>
                <span className={styles.periodTag}>
                  {EXPERIENCE_SPOTLIGHT.period}
                </span>
              </div>

              <h3 id="intern-spotlight-title" className={styles.spotlightRole}>
                {EXPERIENCE_SPOTLIGHT.role}
              </h3>

              <p className={styles.spotlightOrg}>
                {EXPERIENCE_SPOTLIGHT.organization} · {EXPERIENCE_SPOTLIGHT.mode}
              </p>

              <p className={styles.spotlightProgram}>
                {EXPERIENCE_SPOTLIGHT.program} · Credential ID:{" "}
                <code>{EXPERIENCE_SPOTLIGHT.credentialId}</code>
              </p>

              <ul className={styles.responsibilityList}>
                {EXPERIENCE_SPOTLIGHT.responsibilities.map((item) => (
                  <li key={item} className={styles.responsibilityItem}>
                    {item}
                  </li>
                ))}
              </ul>

              <div className={styles.chipRow}>
                {EXPERIENCE_SPOTLIGHT.tags.map((tag) => (
                  <span key={tag} className={styles.techChip}>
                    {tag}
                  </span>
                ))}
              </div>
            </aside>

            {/* Right Chronological Spine Timeline */}
            <div ref={timelineWrapRef} className={styles.timelineWrap}>
              <div className={styles.spineRail} aria-hidden="true">
                <div className={styles.spineTrack} />
                <svg
                  className={styles.spineSvg}
                  viewBox="0 0 2 1000"
                  preserveAspectRatio="none"
                >
                  <path
                    ref={spinePathRef}
                    className="journey-spine-line"
                    d="M1 0 L1 1000"
                    fill="none"
                    stroke="#4DA8FF"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                  />
                </svg>
              </div>

              <ol className={styles.milestoneList}>
                {JOURNEY_TIMELINE.map((item) => {
                  const isInternship = item.kind === "internship";
                  return (
                    <li
                      key={item.id}
                      className={`${styles.milestoneItem} journey-entry`}
                    >
                      <span
                        className={`${styles.nodeMarker} ${
                          isInternship ? styles.nodeMarkerActive : ""
                        }`}
                        aria-hidden="true"
                      >
                        <span className={styles.nodeCore} />
                      </span>

                      <article
                        className={`${styles.milestoneCard} ${
                          isInternship ? styles.milestoneCardFeatured : ""
                        }`}
                      >
                        <div className={styles.milestoneMeta}>
                          <span className={styles.milestoneIndex}>
                            [{item.index}] · {item.kind.toUpperCase()}
                          </span>
                          <span className={styles.milestonePeriod}>
                            {item.period}
                          </span>
                        </div>

                        <h3 className={styles.milestoneTitle}>{item.title}</h3>
                        <p className={styles.milestoneOrg}>
                          {item.organization} · {item.locationOrMode}
                        </p>

                        <p className={styles.milestoneSummary}>{item.summary}</p>

                        <ul className={styles.milestoneHighlights}>
                          {item.highlights.map((hl) => (
                            <li key={hl} className={styles.milestoneHighlightItem}>
                              {hl}
                            </li>
                          ))}
                        </ul>

                        <div className={styles.milestoneFooter}>
                          <div className={styles.chipRow}>
                            {item.tags.map((tag) => (
                              <span key={tag} className={styles.techChip}>
                                {tag}
                              </span>
                            ))}
                          </div>

                          {(item.href || item.externalHref) && (
                            <div className={styles.milestoneLinks}>
                              {item.href && (
                                <Link href={item.href} className={styles.inlineLink}>
                                  <span>Case Study</span>
                                  <ArrowRight size={13} aria-hidden="true" />
                                </Link>
                              )}
                              {item.externalHref && (
                                <a
                                  href={item.externalHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.inlineLink}
                                >
                                  <span>{item.externalLabel ?? "Live Demo"}</span>
                                  <ArrowUpRight size={13} aria-hidden="true" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        {/* 05.2 Verified Certifications */}
        <section
          className={styles.certSection}
          aria-labelledby="journey-certs-heading"
        >
          <div className={styles.certHeader}>
            <div>
              <span className={styles.subBandTag}>
                {JOURNEY_COPY.certificationsTag}
              </span>
              <h3 id="journey-certs-heading" className={styles.subHeading}>
                {JOURNEY_COPY.certificationsHeading}
              </h3>
            </div>
            <p className={styles.certHint}>{JOURNEY_COPY.certificationsHint}</p>
          </div>

          <div className={styles.certList}>
            {CERTIFICATIONS.map((cert) => {
              const isExpanded = expandedCertId === cert.id;
              return (
                <article key={cert.id} className={styles.certItem}>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`cert-panel-${cert.id}`}
                    className={styles.certTrigger}
                    onClick={() =>
                      setExpandedCertId((prev) =>
                        prev === cert.id ? null : cert.id
                      )
                    }
                  >
                    <span className={styles.certIndex}>[{cert.index}]</span>
                    <span className={styles.certTitle}>{cert.title}</span>
                    <span className={styles.certIssuer}>
                      {cert.issuer} · {cert.platform}
                    </span>
                    <span className={styles.certDate}>{cert.dateLabel}</span>
                    <span className={styles.certCredentialCode}>
                      ID: {cert.credentialId}
                    </span>
                    <span className={styles.certChevron}>
                      <span>{isExpanded ? "Hide" : "Inspect"}</span>
                      {isExpanded ? (
                        <ChevronUp size={14} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={14} aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`cert-panel-${cert.id}`}
                        className={`${styles.certPanelWrap} cert-detail-panel`}
                        initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{
                          duration: reducedMotion ? 0 : 0.24,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <div className={styles.certPanelBody}>
                          <div className={styles.certDetailsCol}>
                            <div className={styles.certMetaTags}>
                              <span className={styles.certStatusBadge}>
                                <Award size={12} aria-hidden="true" />
                                <span>
                                  {cert.verifyUrl
                                    ? "Verified Credential Link Active"
                                    : "Certificate Scan Verified · QR Link Needs Input"}
                                </span>
                              </span>
                            </div>

                            <p className={styles.certMobileMeta}>
                              {cert.issuer} ({cert.platform}) · {cert.dateLabel} ·
                              ID <code>{cert.credentialId}</code>
                            </p>

                            {cert.subtitleNote && (
                              <p className={styles.certSubtitleNote}>
                                {cert.subtitleNote}
                              </p>
                            )}

                            <p className={styles.certVerifyNote}>
                              {cert.verifyStatusNote}
                            </p>

                            <div className={styles.chipRow}>
                              {cert.focusAreas.map((area) => (
                                <span key={area} className={styles.techChip}>
                                  {area}
                                </span>
                              ))}
                            </div>

                            <div className={styles.certActionRow}>
                              {cert.verifyUrl ? (
                                <a
                                  href={cert.verifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.verifyBtn}
                                >
                                  <span>Verify on Coursera</span>
                                  <ArrowUpRight size={13} aria-hidden="true" />
                                </a>
                              ) : (
                                <span className={styles.needsInputPill}>
                                  QR Verification URL: NEEDS INPUT (see scan)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles.certMediaCol}>
                            {cert.imageSrc &&
                            cert.imageWidth &&
                            cert.imageHeight ? (
                              <div className={styles.certScanFrame}>
                                <Image
                                  src={cert.imageSrc}
                                  alt={cert.imageAlt ?? `${cert.title} certificate`}
                                  width={cert.imageWidth}
                                  height={cert.imageHeight}
                                  sizes="(max-width: 767px) 92vw, 380px"
                                  className={styles.certScanImg}
                                />
                              </div>
                            ) : (
                              <div className={styles.certPlaceholderBox}>
                                <FileBadge2 size={20} aria-hidden="true" />
                                <span className={styles.placeholderTag}>
                                  NEEDS INPUT // SCAN IMAGE OPTIONAL
                                </span>
                                <p className={styles.placeholderText}>
                                  Credential ID <code>{cert.credentialId}</code> is
                                  verified via the live Coursera verification link.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </section>

        {/* 05.3 Education */}
        <section
          className={styles.educationSection}
          aria-labelledby="journey-education-heading"
        >
          <div className={styles.subBandHeader}>
            <span className={styles.subBandTag}>{JOURNEY_COPY.educationTag}</span>
            <h3 id="journey-education-heading" className={styles.subHeading}>
              {JOURNEY_COPY.educationHeading}
            </h3>
          </div>

          <div className={styles.educationGrid}>
            {EDUCATION_RECORDS.map((edu) => (
              <article
                key={edu.id}
                className={`${styles.educationCard} journey-entry`}
              >
                <div className={styles.cornerTL} aria-hidden="true" />
                <div className={styles.cornerTR} aria-hidden="true" />
                <div className={styles.cornerBL} aria-hidden="true" />
                <div className={styles.cornerBR} aria-hidden="true" />

                <div className={styles.eduTop}>
                  <span className={styles.eduIndex}>
                    <GraduationCap size={13} aria-hidden="true" />
                    <span>{edu.index}</span>
                  </span>
                  <span className={styles.periodTag}>{edu.period}</span>
                </div>

                <h4 className={styles.eduInstitution}>{edu.institution}</h4>
                <p className={styles.eduProgram}>{edu.program}</p>
                <p className={styles.eduBoard}>{edu.boardOrUniversity}</p>

                <div className={styles.eduMetricsRow}>
                  {edu.metrics.map((metric) => (
                    <div key={metric.label} className={styles.eduMetricBox}>
                      <span className={styles.eduMetricLabel}>
                        {metric.label}
                      </span>
                      <span className={styles.eduMetricValue}>
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.chipRow}>
                  {edu.focusAreas.map((topic) => (
                    <span key={topic} className={styles.techChip}>
                      {topic}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
