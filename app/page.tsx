import Link from "next/link";
import { About } from "@/components/sections/About";
import { Hero } from "@/components/sections/Hero";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <About />

      {/* Minimal staging sentinel queued for Checkpoint 4 (Section 03 Selected Projects) */}
      <section
        id="projects"
        className={styles.sentinelBand}
        aria-label="Section 03 staging gate"
      >
        <div className={styles.sentinelInner}>
          <span className={styles.hudTag}>
            [03] // CHECKPOINT 4 STAGING GATE — SELECTED PROJECTS
          </span>
          <h2 className={styles.heading}>
            Section 02 Personal Architecture Active
          </h2>
          <p className={styles.copy}>
            Section 02 (About, Studio Portrait &amp; S2 Procedural Topographic Aperture)
            is integrated above. Section 03 (MUZO, Office Aid &amp; More Work Showcase)
            awaits Checkpoint 4 verification and approval before implementation.
          </p>
          <div className={styles.metaRow}>
            <Link href="/#about" className={styles.backTopLink}>
              Back to About (#about)
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
