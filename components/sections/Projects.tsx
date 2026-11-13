"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
} from "lucide-react";
import { PROJECTS_COPY } from "@/content/copy";
import {
  FEATURED_PROJECTS,
  FeaturedProject,
  MORE_WORK_PROJECTS,
  ProjectScreenAsset,
} from "@/content/projects";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/gsap";
import { playMechanicalClick, playRotaryTick } from "@/lib/sound";
import { useSceneStore } from "@/lib/store";
import styles from "./Projects.module.scss";

/**
 * Section 03 — Selected Engineering (`#projects`).
 *
 * Animation & WebGL Ownership Contract:
 * - GSAP + ScrollTrigger owns `.projects-hud-line` stroke draw, `.projects-reveal`
 *   entrance settle (starting at `opacity: 1`), desktop-only `.projects-showcase-pin`
 *   pinning (`>= 1024px`), and direct DOM mutation of the HUD `scaleX` progress bar.
 * - `#projects-s3-stage` mirrors pointer UVs to Zustand (`setProjectPointer`) so the
 *   persistent `<Canvas>` `ProjectReveal` (S3) renders aligned halftone -> full-color
 *   revelation with zero per-frame React re-renders.
 * - Framer Motion (`AnimatePresence`) owns `.project-screen-caption`,
 *   `.more-work-hover-preview`, and `.more-work-accordion` transitions exclusively.
 */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const tracePathRef = useRef<SVGPathElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const pinTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastPinnedIdxRef = useRef<number>(0);

  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const useStaticFallback = useSceneStore((s) => s.useStaticFallback);
  const projectShaderReady = useSceneStore((s) => s.projectShaderReady);

  const [activeFeaturedIdx, setActiveFeaturedIdx] = useState(0);
  const [screenIdxBySlug, setScreenIdxBySlug] = useState<Record<string, number>>({
    muzo: 0,
    "office-aid": 0,
  });
  const [fullColorLocked, setFullColorLocked] = useState(false);
  const [hoveredArchiveId, setHoveredArchiveId] = useState<string>(
    MORE_WORK_PROJECTS[0].id
  );
  const [expandedArchiveId, setExpandedArchiveId] = useState<string | null>(
    MORE_WORK_PROJECTS[0].id
  );

  const usePinnedDesktop = isDesktop && !reducedMotion;

  const activeDesktopProject: FeaturedProject =
    FEATURED_PROJECTS[activeFeaturedIdx] ?? FEATURED_PROJECTS[0];
  const activeDesktopScreenIdx = screenIdxBySlug[activeDesktopProject.slug] ?? 0;
  const activeDesktopScreen: ProjectScreenAsset =
    activeDesktopProject.screens[activeDesktopScreenIdx] ??
    activeDesktopProject.screens[0];

  const syncVisualToStore = useCallback(
    (screen: ProjectScreenAsset, locked: boolean) => {
      const store = useSceneStore.getState();
      store.setProjectVisual(screen.src, screen.width, screen.height);
      if (locked) {
        store.setProjectPointer(0.5, 0.5, 2);
      }
    },
    []
  );

  // Sync active project texture to S3 whenever active project / screen / fullColorLocked changes
  useEffect(() => {
    if (!usePinnedDesktop) return;
    syncVisualToStore(activeDesktopScreen, fullColorLocked);
  }, [activeDesktopScreen, fullColorLocked, syncVisualToStore, usePinnedDesktop]);

  useGSAP(
    () => {
      ensureGsapRegistered();
      const sectionEl = sectionRef.current;
      const tracePath = tracePathRef.current;
      const pinEl = pinContainerRef.current;
      if (!sectionEl) return;

      const preferReduced =
        reducedMotion ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      const revealEls = sectionEl.querySelectorAll(".projects-reveal");

      if (preferReduced) {
        pinTriggerRef.current = null;
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
          duration: 0.9,
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
          duration: 0.58,
          ease: "expo.out",
          stagger: 0.05,
          clearProps: "transform",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 84%",
            once: true,
          },
        });
      }

      const mm = gsap.matchMedia();
      if (usePinnedDesktop && pinEl) {
        mm.add("(min-width: 1024px)", () => {
          const pinSt = ScrollTrigger.create({
            trigger: pinEl,
            start: "top 68px",
            end: "+=820",
            pin: true,
            scrub: 0.25,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            onUpdate: (self) => {
              if (progressFillRef.current) {
                progressFillRef.current.style.transform = `scaleX(${self.progress})`;
              }
              const nextIdx = self.progress >= 0.48 ? 1 : 0;
              if (nextIdx !== lastPinnedIdxRef.current) {
                lastPinnedIdxRef.current = nextIdx;
                setActiveFeaturedIdx(nextIdx);
              }
            },
          });

          pinTriggerRef.current = pinSt;
          // Recompute downstream Section 04+ trigger positions after desktop pin-spacer mounts
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          return () => {
            pinTriggerRef.current = null;
            pinSt.kill();
          };
        });
      } else {
        pinTriggerRef.current = null;
      }

      return () => {
        pinTriggerRef.current = null;
        mm.revert();
      };
    },
    {
      scope: sectionRef,
      dependencies: [reducedMotion, usePinnedDesktop],
      revertOnUpdate: true,
    }
  );

  const handleDesktopTabSelect = (idx: number) => {
    playMechanicalClick();
    lastPinnedIdxRef.current = idx;
    setActiveFeaturedIdx(idx);
    const chosenProject = FEATURED_PROJECTS[idx];
    const screenIdx = screenIdxBySlug[chosenProject.slug] ?? 0;
    syncVisualToStore(chosenProject.screens[screenIdx] ?? chosenProject.screens[0], fullColorLocked);

    const pinSt = pinTriggerRef.current;
    if (pinSt) {
      const targetProgress = idx === 0 ? 0.12 : 0.72;
      const targetScroll = pinSt.start + (pinSt.end - pinSt.start) * targetProgress;
      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${targetProgress})`;
      }
      pinSt.scroll(targetScroll);
      ScrollTrigger.update();
    }
  };

  const handleSelectScreen = (slug: string, idx: number, screen: ProjectScreenAsset) => {
    playMechanicalClick();
    setScreenIdxBySlug((prev) => ({ ...prev, [slug]: idx }));
    syncVisualToStore(screen, fullColorLocked);
  };

  const handleStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const u = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const v = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    useSceneStore.getState().setProjectPointer(u, v, fullColorLocked ? 2 : 1);
  };

  const handleStagePointerLeave = () => {
    useSceneStore.getState().setProjectPointer(0.5, 0.5, fullColorLocked ? 2 : 0);
  };

  const handleToggleFullColor = () => {
    playMechanicalClick();
    const next = !fullColorLocked;
    setFullColorLocked(next);
    useSceneStore.getState().setProjectPointer(0.5, 0.5, next ? 2 : 0);
  };

  const s3ShaderVisible =
    usePinnedDesktop && !useStaticFallback && !reducedMotion && projectShaderReady;

  const hoveredArchiveProject =
    MORE_WORK_PROJECTS.find((p) => p.id === hoveredArchiveId) ?? MORE_WORK_PROJECTS[0];

  return (
    <section
      id="projects"
      ref={sectionRef}
      className={styles.projectsSection}
      aria-labelledby="projects-heading"
    >
      <div className={styles.container}>
        {/* Header Band */}
        <header className={styles.headerBand}>
          <div className={styles.headerMeta}>
            <span className={styles.hudTag}>{PROJECTS_COPY.sectionTag}</span>
            <span className={styles.subTag}>{PROJECTS_COPY.subTag}</span>
          </div>

          <svg
            className={styles.hudLineSvg}
            viewBox="0 0 1200 16"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={tracePathRef}
              className="projects-hud-line"
              d="M0 8 L310 8 L322 2 L1188 2 L1200 8"
              fill="none"
              stroke="rgba(77, 168, 255, 0.45)"
              strokeWidth="1"
              pathLength={1}
            />
          </svg>

          <div className={styles.introRow}>
            <h2 id="projects-heading" className={`${styles.heading} projects-reveal`}>
              Systems engineered from{" "}
              <span className={styles.serifHeading}>architecture</span> to UI.
            </h2>
            <p className={`${styles.leadCopy} projects-reveal`}>{PROJECTS_COPY.leadCopy}</p>
          </div>
        </header>

        {/* Desktop Pinned Stage (>= 1024px & full motion) OR Linear Full Stack (< 1024px / reduced motion) */}
        {usePinnedDesktop ? (
          <div
            ref={pinContainerRef}
            className={`${styles.pinContainer} projects-showcase-pin`}
          >
            <div className={styles.hudControlBar}>
              <div className={styles.projectTabs} role="tablist" aria-label="Featured projects">
                {FEATURED_PROJECTS.map((project, idx) => {
                  const isActive = idx === activeFeaturedIdx;
                  return (
                    <button
                      key={project.slug}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.projectTab} ${
                        isActive ? styles.projectTabActive : ""
                      }`}
                      onClick={() => handleDesktopTabSelect(idx)}
                    >
                      <span className={styles.tabIndex}>[{project.index}]</span>
                      <span>{project.shortName}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.progressCluster}>
                <span className={styles.statusPill}>{activeDesktopProject.statusBadge}</span>
                <div className={styles.railTrack} aria-hidden="true">
                  <div ref={progressFillRef} className={styles.railFill} />
                </div>
              </div>
            </div>

            <div className={styles.showcaseGrid}>
              {/* Left Column: S3 WebGL Optical Aperture + Screen Switcher */}
              <div className={styles.stageColumn}>
                <div className={styles.stageFrame}>
                  <div className={styles.cornerTL} aria-hidden="true" />
                  <div className={styles.cornerTR} aria-hidden="true" />
                  <div className={styles.cornerBL} aria-hidden="true" />
                  <div className={styles.cornerBR} aria-hidden="true" />

                  <div
                    id="projects-s3-stage"
                    ref={stageRef}
                    className={styles.stageAperture}
                    onPointerMove={handleStagePointerMove}
                    onPointerLeave={handleStagePointerLeave}
                  >
                    <Image
                      key={activeDesktopScreen.src}
                      src={activeDesktopScreen.src}
                      alt={activeDesktopScreen.alt}
                      fill
                      sizes="(max-width: 1023px) 94vw, 760px"
                      priority={activeDesktopScreen.id === "muzo-player"}
                      className={styles.stageImage}
                      style={{ opacity: s3ShaderVisible ? 0 : 1 }}
                    />
                  </div>

                  <div className={styles.stageBar}>
                    <span className={styles.stageHint}>
                      {useStaticFallback
                        ? PROJECTS_COPY.shaderHintStatic
                        : PROJECTS_COPY.shaderHintDesktop}
                    </span>

                    {!useStaticFallback && (
                      <button
                        type="button"
                        aria-pressed={fullColorLocked}
                        className={`${styles.colorToggleBtn} ${
                          fullColorLocked ? styles.colorToggleActive : ""
                        }`}
                        onClick={handleToggleFullColor}
                      >
                        <Eye size={13} aria-hidden="true" />
                        <span>{fullColorLocked ? "Halftone Matrix" : "Full-Color View"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {activeDesktopProject.screens.length > 1 && (
                  <div
                    className={styles.screenSwitcher}
                    role="group"
                    aria-label={`${activeDesktopProject.name} interface screens`}
                  >
                    {activeDesktopProject.screens.map((screen, sIdx) => {
                      const isScreenActive = sIdx === activeDesktopScreenIdx;
                      return (
                        <button
                          key={screen.id}
                          type="button"
                          aria-pressed={isScreenActive}
                          className={`${styles.screenBtn} ${
                            isScreenActive ? styles.screenBtnActive : ""
                          }`}
                          onClick={() =>
                            handleSelectScreen(activeDesktopProject.slug, sIdx, screen)
                          }
                        >
                          {screen.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className={styles.screenCaptionBox}>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeDesktopScreen.id}
                      className={`${styles.screenCaption} project-screen-caption`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      {activeDesktopScreen.caption}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Engineering Breakdown Card */}
              <ProjectDetailCard project={activeDesktopProject} />
            </div>
          </div>
        ) : (
          <div className={styles.linearStack}>
            {FEATURED_PROJECTS.map((project) => {
              const chosenIdx = screenIdxBySlug[project.slug] ?? 0;
              const chosenScreen = project.screens[chosenIdx] ?? project.screens[0];

              return (
                <article key={project.slug} className={styles.stackedProjectCard}>
                  <div className={styles.stageColumn}>
                    <div className={styles.stageFrame}>
                      <div className={styles.cornerTL} aria-hidden="true" />
                      <div className={styles.cornerTR} aria-hidden="true" />
                      <div className={styles.cornerBL} aria-hidden="true" />
                      <div className={styles.cornerBR} aria-hidden="true" />

                      <div className={styles.stageAperture}>
                        <Image
                          src={chosenScreen.src}
                          alt={chosenScreen.alt}
                          fill
                          sizes="(max-width: 1023px) 94vw, 720px"
                          className={styles.stageImage}
                          style={{ opacity: 1 }}
                        />
                      </div>

                      <div className={styles.stageBar}>
                        <span className={styles.stageHint}>
                          {`[${project.index}] // ${project.statusBadge}`}
                        </span>
                      </div>
                    </div>

                    {project.screens.length > 1 && (
                      <div
                        className={styles.screenSwitcher}
                        role="group"
                        aria-label={`${project.name} interface screens`}
                      >
                        {project.screens.map((screen, sIdx) => {
                          const isScreenActive = sIdx === chosenIdx;
                          return (
                            <button
                              key={screen.id}
                              type="button"
                              aria-pressed={isScreenActive}
                              className={`${styles.screenBtn} ${
                                isScreenActive ? styles.screenBtnActive : ""
                              }`}
                              onClick={() => {
                                playMechanicalClick();
                                setScreenIdxBySlug((prev) => ({
                                  ...prev,
                                  [project.slug]: sIdx,
                                }));
                              }}
                            >
                              {screen.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className={styles.screenCaptionBox}>
                      <p className={styles.screenCaption}>{chosenScreen.caption}</p>
                    </div>
                  </div>

                  <ProjectDetailCard project={project} />
                </article>
              );
            })}
          </div>
        )}

        {/* 03.2 Additional Verified Repositories (More Work) */}
        <section
          className={styles.moreWorkSection}
          aria-labelledby="more-work-heading"
        >
          <div className={styles.moreWorkHeader}>
            <div className={styles.moreWorkHeadingGroup}>
              <span className={styles.hudTag}>{PROJECTS_COPY.moreWorkTag}</span>
              <h3 id="more-work-heading" className={styles.moreWorkHeading}>
                {PROJECTS_COPY.moreWorkHeading}
              </h3>
              <p className={styles.moreWorkNote}>{PROJECTS_COPY.moreWorkNote}</p>
            </div>

            <div className={styles.hoverPreviewSlot} aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.p
                  key={hoveredArchiveProject.id}
                  className={`${styles.hoverPreviewText} more-work-hover-preview`}
                  initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: reducedMotion ? 0 : 0.16 }}
                >
                  <span className={styles.hoverPreviewCategory}>
                    [{hoveredArchiveProject.index}] {hoveredArchiveProject.category}
                  </span>
                  {hoveredArchiveProject.summary}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className={styles.archiveList}>
            {MORE_WORK_PROJECTS.map((item) => {
              const isExpanded = expandedArchiveId === item.id;
              return (
                <article
                  key={item.id}
                  className={styles.archiveItem}
                  onMouseEnter={() => {
                    playRotaryTick();
                    setHoveredArchiveId(item.id);
                  }}
                  onFocus={() => {
                    playRotaryTick();
                    setHoveredArchiveId(item.id);
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`archive-panel-${item.id}`}
                    className={styles.archiveTrigger}
                    onClick={() => {
                      playMechanicalClick();
                      setExpandedArchiveId((prev) => (prev === item.id ? null : item.id));
                    }}
                  >
                    <span className={styles.archiveIndex}>[{item.index}]</span>
                    <span className={styles.archiveTitle}>{item.name}</span>
                    <span className={styles.archiveCategory}>{item.category}</span>
                    <span className={styles.archiveDate}>{item.dateLabel}</span>
                    <span className={styles.archiveChevron}>
                      <span>{isExpanded ? "Close" : "Inspect"}</span>
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
                        id={`archive-panel-${item.id}`}
                        className={`${styles.archiveBodyWrap} more-work-accordion`}
                        initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{
                          duration: reducedMotion ? 0 : 0.24,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <div className={styles.archiveBody}>
                          <div className={styles.archiveMobileMeta}>
                            <span>{item.category}</span>
                            <span>·</span>
                            <span>{item.dateLabel}</span>
                          </div>
                          <p className={styles.archiveSummary}>{item.summary}</p>
                          <p className={styles.archiveArchitecture}>{item.architectureNote}</p>

                          <div className={styles.archiveActions}>
                            <div className={styles.chipRow}>
                              {item.technologies.map((tech) => (
                                <span key={tech} className={styles.techChip}>
                                  {tech}
                                </span>
                              ))}
                            </div>

                            <div className={styles.archiveLinks}>
                              <a
                                href={item.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.secondaryLink}
                              >
                                <span>GitHub Repo</span>
                                <ArrowUpRight size={13} aria-hidden="true" />
                              </a>

                              {item.liveDemoUrl && (
                                <a
                                  href={item.liveDemoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.secondaryLink}
                                >
                                  <span>Live Demo</span>
                                  <ArrowUpRight size={13} aria-hidden="true" />
                                </a>
                              )}
                            </div>
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
      </div>
    </section>
  );
}

function ProjectDetailCard({ project }: { project: FeaturedProject }) {
  const visibleTech = project.technologies.slice(0, 7);
  const extraTechCount = Math.max(0, project.technologies.length - visibleTech.length);

  return (
    <div className={styles.detailCard}>
      <div className={styles.cornerTL} aria-hidden="true" />
      <div className={styles.cornerTR} aria-hidden="true" />
      <div className={styles.cornerBL} aria-hidden="true" />
      <div className={styles.cornerBR} aria-hidden="true" />

      <div className={styles.detailMeta}>
        <span className={styles.detailCategory}>
          [{project.index}] · {project.category}
        </span>
        <span className={styles.detailDate}>{project.dateRange}</span>
      </div>

      <h3 className={styles.projectTitle}>
        <Link href={`/projects/${project.slug}`}>{project.name}</Link>
      </h3>

      <p className={styles.projectTagline}>{project.tagline}</p>

      <ul className={styles.highlightsList}>
        {project.highlights.slice(0, 3).map((point) => (
          <li key={point} className={styles.highlightItem}>
            {point}
          </li>
        ))}
      </ul>

      {project.plannedItems && project.plannedItems.length > 0 && (
        <p className={styles.honestyNote}>
          <strong>Built vs Planned:</strong> Verified full-stack monorepo with{" "}
          {project.modules?.length ?? 8} built operational modules + PostgreSQL/Gemini
          backend; planned cloud deployment and automated E2E wiring documented clearly
          in the case study.
        </p>
      )}

      <div className={styles.chipRow}>
        {visibleTech.map((tech) => (
          <span key={tech} className={styles.techChip}>
            {tech}
          </span>
        ))}
        {extraTechCount > 0 && (
          <span className={styles.techChip}>+{extraTechCount} more</span>
        )}
      </div>

      <div className={styles.actionRow}>
        <Link
          href={`/projects/${project.slug}`}
          className={styles.primaryBtn}
          onClick={() => playMechanicalClick()}
        >
          <span>Read Case Study</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>

        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondaryLink}
          onClick={() => playMechanicalClick()}
        >
          <span>GitHub</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>

        {project.liveDemoUrl ? (
          <a
            href={project.liveDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondaryLink}
            onClick={() => playMechanicalClick()}
          >
            <span>Live Demo</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        ) : (
          <span className={styles.localStatusBadge}>
            <Layers size={12} aria-hidden="true" style={{ marginRight: "0.35rem" }} />
            Local Full-Stack Build
          </span>
        )}
      </div>
    </div>
  );
}
