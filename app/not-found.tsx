import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { ContourSphereFallback } from "@/components/canvas/ContourSphere";
import styles from "./not-found.module.scss";

export default function NotFoundPage() {
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.copyCol}>
            <span className={styles.hudTag}>[404] // SIGNAL INTERRUPTED</span>
            <h1 className={styles.heading}>Route not mapped.</h1>
            <p className={styles.description}>
              The requested path does not exist inside SIGNAL. You can return to
              the main landing sequence or jump directly to featured full-stack
              builds.
            </p>

            <div className={styles.actions}>
              <Link href="/" className={styles.primaryBtn}>
                <ArrowLeft size={15} aria-hidden="true" />
                <span>Return Home</span>
              </Link>
              <Link href="/#projects" className={styles.secondaryBtn}>
                <Compass size={15} aria-hidden="true" />
                <span>Selected Projects</span>
              </Link>
            </div>
          </div>

          <div className={styles.visualCol} aria-hidden="true">
            <ContourSphereFallback split label="Topographic contour 404 emblem" />
          </div>
        </div>
      </div>
    </main>
  );
}
