import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />

      {/* Minimal scroll-morph sentinel queued for Checkpoint 4 (Sections 02–08) */}
      <section
        id="about"
        className={styles.sentinelBand}
        aria-label="Section 02 staging gate"
      >
        <div className={styles.sentinelInner}>
          <span className={styles.hudTag}>
            [02] // CHECKPOINT 3 SCROLL MORPH SENTINEL
          </span>
          <h2 className={styles.heading}>
            Section 01 Hero &amp; Core Layout Shell Active
          </h2>
          <p className={styles.copy}>
            Scrolling past the Hero transitions S1 vertex displacement smoothly toward
            topographic alignment. Remaining portfolio sections (02 About through 08
            Footer &amp; Case Studies) await Checkpoint 3 review and sign-off before
            integration.
          </p>
          <div className={styles.metaRow}>
            <Link href="/#hero" className={styles.backTopLink}>
              Return to Top (#hero)
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
