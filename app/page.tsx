import Link from "next/link";
import { About } from "@/components/sections/About";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
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
      <Journey />

      {/* Minimal staging sentinel queued for Checkpoint 4e (Section 06 Beyond Technology $paper band) */}
      <section
        id="beyond"
        data-staging-sentinel="true"
        className={styles.sentinelBand}
        aria-label="Section 06 staging gate"
      >
        <div className={styles.sentinelInner}>
          <span className={styles.hudTag}>
            [06] // CHECKPOINT 4d STAGING GATE — BEYOND TECHNOLOGY ($PAPER)
          </span>
          <h2 className={styles.heading}>
            Section 05 Journey, Credentials &amp; Education Active
          </h2>
          <p className={styles.copy}>
            Section 05 (Employability.life AWS DevOps Internship spotlight,
            scroll-scrubbed milestone spine, 4 expandable certifications with
            real scans/Coursera verification, and SNU/CBSE Education) is
            integrated above. Section 06 (&ldquo;Beyond the screen&rdquo; on
            the single inverted <code>$paper</code> band + S7 velocity
            distortion) awaits Checkpoint 4d verification and approval.
          </p>
          <div className={styles.metaRow}>
            <Link href="/#journey" className={styles.backTopLink}>
              Back to Journey (#journey)
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
