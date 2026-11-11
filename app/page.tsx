import Link from "next/link";
import { About } from "@/components/sections/About";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <About />
      <Projects />

      {/* Minimal staging sentinel queued for Checkpoint 4c (Section 04 Technical Toolkit) */}
      <section
        id="toolkit"
        className={styles.sentinelBand}
        aria-label="Section 04 staging gate"
      >
        <div className={styles.sentinelInner}>
          <span className={styles.hudTag}>
            [04] // CHECKPOINT 4b STAGING GATE — TECHNICAL TOOLKIT
          </span>
          <h2 className={styles.heading}>
            Section 03 Selected Engineering Active
          </h2>
          <p className={styles.copy}>
            Section 03 (MUZO, Office Aid with 5 verified workspace captures, S3
            Halftone Optical Reveal shader, More Work repository archive, and{" "}
            <code>/projects/[slug]</code> case studies) is integrated above. Section
            04 (Technical Toolkit &amp; Currently Exploring Architecture) awaits
            Checkpoint 4b verification and approval before implementation.
          </p>
          <div className={styles.metaRow}>
            <Link href="/#projects" className={styles.backTopLink}>
              Back to Projects (#projects)
            </Link>
            <Link href="/#hero" className={styles.backTopLink}>
              Return to Top (#hero)
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
