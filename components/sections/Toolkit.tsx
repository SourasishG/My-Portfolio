"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Compass, Sparkles } from "lucide-react";
import { TOOLKIT_COPY } from "@/content/copy";
import {
  CORE_SKILL_GROUPS,
  CURRENTLY_EXPLORING_SKILLS,
  SkillCategoryFilter,
  SkillItem,
} from "@/content/skills";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { playMechanicalClick, playRotaryTick } from "@/lib/sound";
import { useSceneStore } from "@/lib/store";
import { SkillIcon } from "@/components/ui/SkillIcon";
import styles from "./Toolkit.module.scss";

const FILTER_OPTIONS: Array<{ id: SkillCategoryFilter; label: string }> = [
  { id: "all", label: "All Disciplines" },
  { id: "languages", label: "Languages" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "database", label: "Database" },
  { id: "cloud-devops", label: "Cloud & DevOps" },
  { id: "tools", label: "Tools" },
  { id: "exploring", label: "Currently Exploring" },
];

/**
 * Section 04 — Technical Toolkit (`#toolkit`).
 *
 * Animation & Honesty Contract:
 * - Zero skill bars, star ratings, or percentages.
 * - "Currently exploring" items are kept visually distinct (`$violet` grammar)
 *   and never framed as mastered tools.
 * - GSAP + ScrollTrigger owns `.toolkit-hud-line` stroke draw and `.toolkit-reveal`
 *   entry settle (`opacity: 1` preserved); Framer Motion owns `.skill-chip`,
 *   `.skill-highlight-pill`, and `.toolkit-trace-panel` interactions exclusively.
 */
export function Toolkit() {
  const sectionRef = useRef<HTMLElement>(null);
  const tracePathRef = useRef<SVGPathElement>(null);

  const reducedMotion = useReducedMotion();
  const useStaticFallback = useSceneStore((s) => s.useStaticFallback);

  const [categoryFilter, setCategoryFilter] =
    useState<SkillCategoryFilter>("all");
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [lockedSkillId, setLockedSkillId] = useState<string | null>(null);

  const allSkills = useMemo<SkillItem[]>(() => {
    const core = CORE_SKILL_GROUPS.flatMap((group) => group.skills);
    return [...core, ...CURRENTLY_EXPLORING_SKILLS];
  }, []);

  const inspectedSkillId = lockedSkillId ?? hoveredSkillId;
  const inspectedSkill = useMemo(
    () => allSkills.find((s) => s.id === inspectedSkillId) ?? null,
    [allSkills, inspectedSkillId]
  );

  // Update restrained background constellation accent tint transiently without React re-renders
  useEffect(() => {
    const store = useSceneStore.getState();
    const isExploringContext =
      inspectedSkill?.group === "exploring" || categoryFilter === "exploring";
    const activity = inspectedSkill ? 1.0 : categoryFilter !== "all" ? 0.55 : 0.15;
    store.setToolkitVisual(isExploringContext ? 1 : 0, activity);
  }, [categoryFilter, inspectedSkill]);

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

      const revealEls = sectionEl.querySelectorAll(".toolkit-reveal");

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

  const handleFilterClick = (filterId: SkillCategoryFilter) => {
    playMechanicalClick();
    setCategoryFilter((prev) => (prev === filterId && filterId !== "all" ? "all" : filterId));
  };

  const handleSkillClick = (skill: SkillItem) => {
    playMechanicalClick();
    setLockedSkillId((prev) => (prev === skill.id ? null : skill.id));
  };

  const isExploringInspected = inspectedSkill?.group === "exploring";

  return (
    <section
      id="toolkit"
      ref={sectionRef}
      className={styles.toolkitSection}
      aria-labelledby="toolkit-heading"
    >
      {useStaticFallback && (
        <div className={styles.constellationFallbackBg} aria-hidden="true" />
      )}

      <div className={styles.container}>
        {/* Header Band */}
        <header className={styles.headerBand}>
          <div className={styles.headerMeta}>
            <span className={styles.hudTag}>{TOOLKIT_COPY.sectionTag}</span>
            <span className={styles.subTag}>{TOOLKIT_COPY.subTag}</span>
          </div>

          <svg
            className={styles.hudLineSvg}
            viewBox="0 0 1200 16"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={tracePathRef}
              className="toolkit-hud-line"
              d="M0 8 L280 8 L292 2 L1188 2 L1200 8"
              fill="none"
              stroke="rgba(77, 168, 255, 0.45)"
              strokeWidth="1"
              pathLength={1}
            />
          </svg>

          <div className={styles.introRow}>
            <h2 id="toolkit-heading" className={`${styles.heading} toolkit-reveal`}>
              Core engineering stack &{" "}
              <span className={styles.serifHeading}>active exploration</span>.
            </h2>
            <p className={`${styles.leadCopy} toolkit-reveal`}>
              {TOOLKIT_COPY.leadCopy}
            </p>
          </div>
        </header>

        {/* Interactive Filter & Cross-Reference Trace Panel */}
        <div className={`${styles.controlPanel} toolkit-reveal`}>
          <div
            className={styles.filterRow}
            role="group"
            aria-label="Highlight toolkit discipline"
          >
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = categoryFilter === opt.id;
              const isExploringBtn = opt.id === "exploring";
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  aria-pressed={isSelected}
                  className={`${styles.filterPill} skill-highlight-pill ${
                    isSelected
                      ? isExploringBtn
                        ? styles.filterPillExploringActive
                        : styles.filterPillActive
                      : ""
                  }`}
                  whileHover={reducedMotion ? undefined : { y: -1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => handleFilterClick(opt.id)}
                >
                  {isExploringBtn && <Compass size={12} aria-hidden="true" />}
                  <span>{opt.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className={styles.traceCard} aria-live="polite">
            <div className={styles.cornerTL} aria-hidden="true" />
            <div className={styles.cornerTR} aria-hidden="true" />
            <div className={styles.cornerBL} aria-hidden="true" />
            <div className={styles.cornerBR} aria-hidden="true" />

            <div className={styles.traceHeader}>
              <span
                className={`${styles.traceBadge} ${
                  isExploringInspected ? styles.traceBadgeExploring : ""
                }`}
              >
                {lockedSkillId && (
                  <span className={styles.lockDot} aria-hidden="true" />
                )}
                {inspectedSkill ? (
                  <>
                    ACTIVE TRACE // {inspectedSkill.name.toUpperCase()}
                    {isExploringInspected ? " (CURRENTLY EXPLORING)" : ""}
                  </>
                ) : (
                  "STACK TRACE // READY"
                )}
              </span>

              {(lockedSkillId || categoryFilter !== "all") && (
                <button
                  type="button"
                  className={styles.traceResetBtn}
                  onClick={() => {
                    setLockedSkillId(null);
                    setHoveredSkillId(null);
                    setCategoryFilter("all");
                  }}
                >
                  Reset View
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={inspectedSkill ? inspectedSkill.id : "idle-trace"}
                className={`${styles.traceContent} toolkit-trace-panel`}
                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: reducedMotion ? 0 : 0.16 }}
              >
                {inspectedSkill ? (
                  <>
                    <p className={styles.traceSummary}>{inspectedSkill.summary}</p>
                    <div className={styles.traceLinks}>
                      {inspectedSkill.connections.map((conn) => {
                        if (conn.href?.startsWith("/")) {
                          return (
                            <Link
                              key={`${conn.label}-${conn.context}`}
                              href={conn.href}
                              className={styles.connectionChipLink}
                            >
                              <span>{conn.label}</span>
                              <span className={styles.connectionSub}>
                                · {conn.context}
                              </span>
                              <ArrowRight size={12} aria-hidden="true" />
                            </Link>
                          );
                        }
                        if (conn.href) {
                          return (
                            <a
                              key={`${conn.label}-${conn.context}`}
                              href={conn.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.connectionChipLink}
                            >
                              <span>{conn.label}</span>
                              <span className={styles.connectionSub}>
                                · {conn.context}
                              </span>
                              <ArrowUpRight size={12} aria-hidden="true" />
                            </a>
                          );
                        }
                        return (
                          <span
                            key={`${conn.label}-${conn.context}`}
                            className={styles.connectionChipStatic}
                          >
                            <span>{conn.label}</span>
                            <span className={styles.connectionSub}>
                              · {conn.context}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.traceHintText}>{TOOLKIT_COPY.inspectHint}</p>
                    <div className={styles.traceLinks}>
                      <Link href="/projects/muzo" className={styles.connectionChipLink}>
                        <span>Inspect MUZO Stack</span>
                        <ArrowRight size={12} aria-hidden="true" />
                      </Link>
                      <Link
                        href="/projects/office-aid"
                        className={styles.connectionChipLink}
                      >
                        <span>Inspect Office Aid Stack</span>
                        <ArrowRight size={12} aria-hidden="true" />
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 6 Core Foundation Groups (Zero proficiency bars or percentages) */}
        <div className={`${styles.categoryGrid} toolkit-category-grid toolkit-reveal`}>
          {CORE_SKILL_GROUPS.map((group) => {
            const isDimmed =
              categoryFilter !== "all" &&
              categoryFilter !== "core" &&
              categoryFilter !== group.id;
            const isHighlighted = categoryFilter === group.id;

            return (
              <article
                key={group.id}
                className={`${styles.categoryCard} ${
                  isDimmed ? styles.categoryCardDimmed : ""
                } ${isHighlighted ? styles.categoryCardHighlighted : ""}`}
                aria-labelledby={`toolkit-cat-${group.id}`}
              >
                <div className={styles.cornerTL} aria-hidden="true" />
                <div className={styles.cornerBR} aria-hidden="true" />

                <div className={styles.categoryHeader}>
                  <div className={styles.categoryMeta}>
                    <span className={styles.categoryIndex}>[{group.index}]</span>
                    <span className={styles.categoryCount}>
                      {group.skills.length} ITEMS
                    </span>
                  </div>
                  <h3 id={`toolkit-cat-${group.id}`} className={styles.categoryTitle}>
                    {group.title}
                  </h3>
                  <p className={styles.categorySubtitle}>{group.subtitle}</p>
                </div>

                <div className={styles.chipList}>
                  {group.skills.map((skill) => {
                    const isActiveSkill = inspectedSkill?.id === skill.id;
                    return (
                      <motion.button
                        key={skill.id}
                        type="button"
                        aria-pressed={lockedSkillId === skill.id}
                        className={`${styles.skillChip} skill-chip ${
                          isActiveSkill ? styles.skillChipActive : ""
                        }`}
                        whileHover={
                          reducedMotion ? undefined : { y: -1, scale: 1.02 }
                        }
                        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                        onMouseEnter={() => {
                          playRotaryTick();
                          if (!lockedSkillId) setHoveredSkillId(skill.id);
                        }}
                        onMouseLeave={() => {
                          if (!lockedSkillId) setHoveredSkillId(null);
                        }}
                        onFocus={() => {
                          if (!lockedSkillId) setHoveredSkillId(skill.id);
                        }}
                        onBlur={() => {
                          if (!lockedSkillId) setHoveredSkillId(null);
                        }}
                        onClick={() => handleSkillClick(skill)}
                      >
                        <span>{skill.name}</span>
                        {skill.qualifier && (
                          <span className={styles.skillQualifier}>
                            ({skill.qualifier})
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        {/* Distinct Currently Exploring Band */}
        <article
          className={`${styles.exploringBand} toolkit-reveal ${
            categoryFilter !== "all" && categoryFilter !== "exploring"
              ? styles.exploringBandDimmed
              : ""
          }`}
          aria-labelledby="toolkit-exploring-heading"
        >
          <div
            className={`${styles.cornerTL} ${styles.cornerViolet}`}
            aria-hidden="true"
          />
          <div
            className={`${styles.cornerTR} ${styles.cornerViolet}`}
            aria-hidden="true"
          />
          <div
            className={`${styles.cornerBL} ${styles.cornerViolet}`}
            aria-hidden="true"
          />
          <div
            className={`${styles.cornerBR} ${styles.cornerViolet}`}
            aria-hidden="true"
          />

          <div className={styles.exploringHeader}>
            <div className={styles.exploringTitleGroup}>
              <span className={styles.exploringPillBadge}>
                <Sparkles size={12} aria-hidden="true" />
                <span>{TOOLKIT_COPY.exploringTag}</span>
              </span>
              <h3 id="toolkit-exploring-heading" className={styles.exploringHeading}>
                {TOOLKIT_COPY.exploringHeading}
              </h3>
            </div>

            <p className={styles.exploringNote}>{TOOLKIT_COPY.exploringNote}</p>
          </div>

          <div className={styles.exploringChipGrid}>
            {CURRENTLY_EXPLORING_SKILLS.map((skill) => {
              const isActiveSkill = inspectedSkill?.id === skill.id;
              return (
                <motion.button
                  key={skill.id}
                  type="button"
                  aria-pressed={lockedSkillId === skill.id}
                  className={`${styles.exploringChip} skill-chip ${
                    isActiveSkill ? styles.exploringChipActive : ""
                  }`}
                  whileHover={reducedMotion ? undefined : { y: -1, scale: 1.02 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  onMouseEnter={() => {
                    playRotaryTick();
                    if (!lockedSkillId) setHoveredSkillId(skill.id);
                  }}
                  onMouseLeave={() => {
                    if (!lockedSkillId) setHoveredSkillId(null);
                  }}
                  onFocus={() => {
                    if (!lockedSkillId) setHoveredSkillId(skill.id);
                  }}
                  onBlur={() => {
                    if (!lockedSkillId) setHoveredSkillId(null);
                  }}
                  onClick={() => handleSkillClick(skill)}
                >
                  <span>{skill.name}</span>
                  <span className={styles.exploringMiniTag}>EXPLORING</span>
                </motion.button>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
