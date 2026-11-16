import styles from "../PortraitHalftone.module.scss";

/**
 * High-res accessible static fallback for touch devices, low-tier GPUs,
 * prefers-reduced-motion, or initial render before WebGL mounts.
 * Uses pre-optimized static WebP assets for instant edge CDN delivery and 0ms serverless delay.
 */
export function PortraitFallback({
  alt = "Portrait of Sourasish Ghosh, Full-Stack Developer",
}: {
  alt?: string;
  priority?: boolean;
}) {
  return (
    <div className={styles.fallbackContainer} aria-label={alt}>
      <div className={styles.imageWrap}>
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="/images/profile/portrait-bw-280.webp"
            type="image/webp"
            width={280}
            height={280}
          />
          <img
            src="/images/profile/portrait-bw-420.webp"
            alt={alt}
            width={420}
            height={420}
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            className={styles.fallbackImage}
          />
        </picture>
        <div className={styles.dotScreenOverlay} aria-hidden="true" />
      </div>
    </div>
  );
}
