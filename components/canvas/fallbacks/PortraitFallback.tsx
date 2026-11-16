import Image from "next/image";
import styles from "../PortraitHalftone.module.scss";

/**
 * High-res accessible static fallback for touch devices, low-tier GPUs,
 * prefers-reduced-motion, or initial render before WebGL mounts.
 */
export function PortraitFallback({
  alt = "Portrait of Sourasish Ghosh, Full-Stack Developer",
  priority = false,
}: {
  alt?: string;
  priority?: boolean;
}) {
  return (
    <div className={styles.fallbackContainer} aria-label={alt}>
      <div className={styles.imageWrap}>
        <Image
          src="/images/profile/portrait-bw.webp"
          alt={alt}
          width={420}
          height={420}
          priority={priority}
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 420px"
          className={styles.fallbackImage}
        />
        <div className={styles.dotScreenOverlay} aria-hidden="true" />
      </div>
    </div>
  );
}
