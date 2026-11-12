import Link from "next/link";
import { About } from "@/components/sections/About";
import { Aspirations } from "@/components/sections/Aspirations";
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
      <Aspirations />

      {/* Minimal staging sentinel queued for Checkpoint 5 (Section 08 Contact + S4 Chromatic Glass + Footer) */}
      <section
        id="contact"
        data-staging-sentinel="true"
        className={styles.sentinelBand}
        aria-label="Section 08 staging gate"
      >
        <div className={styles.sentinelInner}>
          <span className={styles.hudTag}>
            [08] // CHECKPOINT 4f STAGING GATE — CONTACT &amp; FOOTER
          </span>
          <h2 className={styles.heading}>
            Section 07 Engineering Aspirations &amp; S5 Chrome Arches Active
          </h2>
          <p className={styles.copy}>
            Section 07 (Engineering Aspirations, Continuous Exploration tracks,
            and procedural PBR S5 Chrome Fluid Arches) is integrated above.
            Section 08 (Chromatic Glass S4, Formspree-validated Contact Form,
            and Footer) awaits Checkpoint 4f verification and approval.
          </p>
          <div className={styles.metaRow}>
            <Link href="/#aspirations" className={styles.backTopLink}>
              Back to Aspirations (#aspirations)
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
