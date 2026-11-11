import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main id="main-content" className={styles.stage}>
      <div className={styles.panel}>
        <span className={styles.hud}>SIGNAL // PHASE 3.5 — SHADER LAB GATE</span>
        <h1 className={styles.title}>SOURASISH GHOSH</h1>
        <p className={styles.copy}>
          Portfolio sections (01–08) remain unintegrated until Checkpoint 2 sign-off on
          the isolated Shader Lab for <strong>S1 (Hero Point-Cloud Blob)</strong> and{" "}
          <strong>S2 (Topographic Contour Sphere)</strong>.
        </p>
        <div className={styles.actions}>
          <Link href="/lab" className={styles.primaryCta}>
            Open Shader Lab (/lab)
          </Link>
        </div>
      </div>
    </main>
  );
}
