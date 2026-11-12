import Link from "next/link";
import { About } from "@/components/sections/About";
import { Beyond } from "@/components/sections/Beyond";
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
      <Beyond />

      {/* Minimal staging sentinel queued for Checkpoint 4f (Section 07 Aspirations & S5 Chrome Arches) */}
      <section
        id="aspirations"
        data-staging-sentinel="true"
        className={styles.sentinelBand}
        aria-label="Section 07 staging gate"
      >
        <div className={styles.sentinelInner}>
          <span className={styles.hudTag}>
            [07] // CHECKPOINT 4e STAGING GATE — ENGINEERING ASPIRATIONS
          </span>
          <h2 className={styles.heading}>
            Section 06 Beyond Technology ($paper) &amp; S7 Active
          </h2>
          <p className={styles.copy}>
            Section 06 (the single inverted <code>#F4F4F2</code> Swiss light
            editorial band covering Football, Video Games, Music &amp; Movies
            with scroll-velocity distortion shader S7) is integrated above.
            Section 07 (Engineering Aspirations &amp; S5 Chrome Fluid Arches)
            awaits Checkpoint 4e verification and approval.
          </p>
          <div className={styles.metaRow}>
            <Link href="/#beyond" className={styles.backTopLink}>
              Back to Beyond (#beyond)
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
