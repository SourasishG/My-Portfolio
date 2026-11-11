"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Layers } from "lucide-react";
import { FeaturedProject } from "@/content/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./CaseStudyView.module.scss";

interface CaseStudyViewProps {
  project: FeaturedProject;
  nextProject: FeaturedProject;
}

/**
 * Interactive Case Study presentation for `/projects/[slug]`.
 *
 * Animation Ownership:
 * - Framer Motion (`AnimatePresence`) owns gallery screenshot swaps cleanly
 *   and drops to `duration: 0` when `prefers-reduced-motion: reduce` is enabled.
 */
export function CaseStudyView({ project, nextProject }: CaseStudyViewProps) {
  const reducedMotion = useReducedMotion();
  const [activeScreenIdx, setActiveScreenIdx] = useState(0);

  const activeScreen = project.screens[activeScreenIdx] ?? project.screens[0];
  const hasPlannedList = Boolean(project.plannedItems && project.plannedItems.length > 0);

  return (
    <main id="main-content" className={styles.caseStudyMain}>
      <div className={styles.container}>
        {/* Top Back Bar */}
        <nav className={styles.topNav} aria-label="Case study breadcrumb">
          <Link href="/#projects" className={styles.backLink}>
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Back to Selected Projects</span>
          </Link>
          <span className={styles.hudTag}>
            CASE STUDY [{project.index}] // {project.slug.toUpperCase()}
          </span>
        </nav>

        {/* Title & Metadata Header */}
        <header className={styles.heroHeader}>
          <h1 className={styles.title}>{project.name}</h1>
          <p className={styles.tagline}>{project.tagline}</p>

          <div className={styles.metaGrid}>
            <div className={styles.metaCell}>
              <span className={styles.metaLabel}>SCOPE</span>
              <span className={styles.metaValue}>{project.category}</span>
            </div>
            <div className={styles.metaCell}>
              <span className={styles.metaLabel}>TIMELINE</span>
              <span className={styles.metaValue}>{project.dateRange}</span>
            </div>
            <div className={styles.metaCell}>
              <span className={styles.metaLabel}>DEPLOYMENT STATUS</span>
              <span className={styles.metaValue}>{project.statusBadge}</span>
            </div>
            <div className={styles.metaCell}>
              <span className={styles.metaLabel}>PRIMARY SCREENS</span>
              <span className={styles.metaValue}>
                {project.screens.length}{" "}
                {project.screens.length === 1 ? "Captured View" : "Captured Modules"}
              </span>
            </div>
          </div>

          <div className={styles.actionRow}>
            {project.liveDemoUrl ? (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryLink}
              >
                <span>Open Live Demo</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            ) : (
              <span className={styles.statusBadgeNote}>
                <Layers size={14} aria-hidden="true" style={{ marginRight: "0.45rem" }} />
                Active Local Full-Stack Monorepo (Cloud Hosting Pending)
              </span>
            )}

            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryLink}
            >
              <span>Inspect GitHub Source</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </header>

        {/* Interactive Screenshot Gallery */}
        <section className={styles.gallerySection} aria-label="Interface captures">
          <div className={styles.galleryFrame}>
            <div className={styles.cornerTL} aria-hidden="true" />
            <div className={styles.cornerTR} aria-hidden="true" />
            <div className={styles.cornerBL} aria-hidden="true" />
            <div className={styles.cornerBR} aria-hidden="true" />

            <div className={styles.galleryViewport}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScreen.id}
                  className={`${styles.galleryImgWrap} case-study-gallery-frame`}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.22 }}
                >
                  <Image
                    src={activeScreen.src}
                    alt={activeScreen.alt}
                    fill
                    sizes="(max-width: 1023px) 94vw, 1280px"
                    priority
                    className={styles.galleryImg}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {project.screens.length > 1 && (
            <div
              className={styles.screenTabs}
              role="group"
              aria-label="Switch project interface capture"
            >
              {project.screens.map((screen, idx) => {
                const isSelected = idx === activeScreenIdx;
                return (
                  <button
                    key={screen.id}
                    type="button"
                    aria-pressed={isSelected}
                    className={`${styles.screenTab} ${
                      isSelected ? styles.screenTabActive : ""
                    }`}
                    onClick={() => setActiveScreenIdx(idx)}
                  >
                    {screen.label}
                  </button>
                );
              })}
            </div>
          )}

          <p className={styles.galleryCaption}>{activeScreen.caption}</p>
        </section>

        {/* Overview, Problem Addressed, Contribution */}
        <section className={styles.threeColGrid} aria-label="Architecture context">
          <article className={styles.panelCard}>
            <span className={styles.hudTag}>01 // OVERVIEW</span>
            <h2 className={styles.panelHeading}>System Summary</h2>
            <p className={styles.panelBody}>{project.overview}</p>
          </article>

          <article className={styles.panelCard}>
            <span className={styles.hudTag}>02 // PROBLEM ADDRESSED</span>
            <h2 className={styles.panelHeading}>Engineering Friction</h2>
            <p className={styles.panelBody}>{project.problemAddressed}</p>
          </article>

          <article className={styles.panelCard}>
            <span className={styles.hudTag}>03 // MY CONTRIBUTION</span>
            <h2 className={styles.panelHeading}>Ownership &amp; Architecture</h2>
            <p className={styles.panelBody}>{project.roleSummary}</p>
          </article>
        </section>

        {/* Built vs Planned Section */}
        <section className={styles.sectionBlock} aria-labelledby="built-vs-planned-heading">
          <div>
            <span className={styles.hudTag}>04 // IMPLEMENTATION AUDIT</span>
            <h2 id="built-vs-planned-heading" className={styles.sectionTitle}>
              {hasPlannedList ? "Built vs Planned Scope" : "Built & Verified Scope"}
            </h2>
          </div>

          <div className={hasPlannedList ? styles.twoColGrid : undefined}>
            <article className={styles.panelCard}>
              <span className={styles.hudTag}>BUILT (VERIFIED IN SOURCE)</span>
              <ul className={styles.itemList}>
                {project.builtItems.map((item) => (
                  <li key={item} className={styles.builtItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            {project.plannedItems && project.plannedItems.length > 0 && (
              <article className={styles.panelCard}>
                <span className={styles.hudTag}>PLANNED / NEXT ITERATIONS</span>
                <ul className={styles.itemList}>
                  {project.plannedItems.map((item) => (
                    <li key={item} className={styles.plannedItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </section>

        {/* Operational Modules (when applicable) */}
        {project.modules && project.modules.length > 0 && (
          <section className={styles.sectionBlock} aria-labelledby="modules-heading">
            <div>
              <span className={styles.hudTag}>05 // WORKSPACE SURFACE</span>
              <h2 id="modules-heading" className={styles.sectionTitle}>
                Integrated Operational Modules
              </h2>
            </div>

            <div className={styles.modulesGrid}>
              {project.modules.map((modName, idx) => (
                <div key={modName} className={styles.moduleCard}>
                  <span className={styles.moduleIndex}>
                    MODULE {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.moduleName}>{modName}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Challenges & Solutions */}
        <section className={styles.sectionBlock} aria-labelledby="challenges-heading">
          <div>
            <span className={styles.hudTag}>ENGINEERING TRADE-OFFS</span>
            <h2 id="challenges-heading" className={styles.sectionTitle}>
              Challenges Faced &amp; Solutions
            </h2>
          </div>

          <div className={styles.challengeList}>
            {project.challenges.map((entry, idx) => (
              <article key={idx} className={styles.challengeRow}>
                <div>
                  <span className={styles.challengeSubLabel}>CHALLENGE 0{idx + 1}</span>
                  <p className={styles.challengeText}>{entry.challenge}</p>
                </div>
                <div>
                  <span className={styles.challengeSubLabel}>ARCHITECTURAL SOLUTION</span>
                  <p className={styles.solutionText}>{entry.solution}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Verified Technologies */}
        <section className={styles.sectionBlock} aria-labelledby="stack-heading">
          <div>
            <span className={styles.hudTag}>VERIFIED STACK</span>
            <h2 id="stack-heading" className={styles.sectionTitle}>
              Technologies Used
            </h2>
          </div>

          <div className={styles.techWrap}>
            {project.technologies.map((tech) => (
              <span key={tech} className={styles.techChip}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Next Case Study Navigation */}
        <footer className={styles.nextFooter}>
          <div className={styles.nextCopy}>
            <span className={styles.hudTag}>NEXT CASE STUDY [{nextProject.index}]</span>
            <h2 className={styles.nextTitle}>{nextProject.name}</h2>
            <p className={styles.nextTagline}>{nextProject.tagline}</p>
          </div>

          <div className={styles.actionRow}>
            <Link href={`/projects/${nextProject.slug}`} className={styles.primaryLink}>
              <span>Inspect {nextProject.shortName}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/#projects" className={styles.secondaryLink}>
              <span>All Projects</span>
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
