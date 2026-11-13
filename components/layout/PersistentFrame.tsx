"use client";

import { usePathname } from "next/navigation";
import styles from "./PersistentFrame.module.scss";

/**
 * Architectural persistent corner telemetry and framing markers
 * inspired by Lorenzo Lottici and Luka Skhiladze.
 * Rendered at viewport corners with pointer-events: none on desktop.
 */
export function PersistentFrame() {
  const pathname = usePathname();
  const isLab = pathname?.startsWith("/lab") ?? false;

  if (isLab) return null;

  return (
    <div className={styles.frameRoot} aria-hidden="true">
      <div className={`${styles.cornerMarker} ${styles.topLeft}`}>
        <span className={styles.crosshair}>+</span>
        <span>22°34&apos; N · 88°24&apos; E</span>
      </div>

      <div className={`${styles.cornerMarker} ${styles.topRight}`}>
        <span className={styles.crosshair}>+</span>
        <span>IST · UTC+05:30</span>
      </div>

      <div className={`${styles.cornerMarker} ${styles.bottomLeft}`}>
        <span className={styles.crosshair}>+</span>
        <span>SIGNAL // V2.0</span>
      </div>

      <div className={`${styles.cornerMarker} ${styles.bottomRight}`}>
        <span className={styles.crosshair}>+</span>
        <span>SOURASISH GHOSH</span>
      </div>

      <div className={`${styles.hairlineBorder} ${styles.hairlineLeft}`} />
      <div className={`${styles.hairlineBorder} ${styles.hairlineRight}`} />
    </div>
  );
}
