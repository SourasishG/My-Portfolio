import Link from "next/link";
import { About } from "@/components/sections/About";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Toolkit } from "@/components/sections/Toolkit";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <About />
      <Projects />
      <Toolkit />

      {/* Minimal staging sentinel queued for Checkpoint 4d (Section 05 Experience, Certs & Education) */}
      <section
        id="journey"
        className={styles.sentinelBand}
        aria-label="Section 05 staging gate"
      >
        <div className={styles.sentinelInner}>
          <span className={styles.hudTag}>
            [05] // CHECKPOINT 4c STAGING GATE — EXPERIENCE &amp; EDUCATION
          </span>
          <h2 className={styles.heading}>
            Section 04 Technical Toolkit Active
          </h2>
          <p className={styles.copy}>
            Section 04 (Grouped Core Stack, Honest Currently Exploring band,
            interactive project-to-skill trace panel, and restrained{" "}
            <code>ToolkitConstellation</code> background lattice) is integrated
            above. Section 05 (AWS DevOps Intern timeline, Verified Certifications,
            and SNU / CBSE Education) awaits Checkpoint 4c verification and approval.
          </p>
          <div className={styles.metaRow}>
            <Link href="/#toolkit" className={styles.backTopLink}>
              Back to Toolkit (#toolkit)
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
