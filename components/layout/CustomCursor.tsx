"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./CustomCursor.module.scss";

const emptySubscribe = () => () => {};

function getIsFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine) and (hover: hover)").matches;
}

/**
 * Clean, niche & futuristic precision HUD reticle cursor.
 * - Zero-latency pinpoint center dot locked to client coordinates.
 * - Smooth lerping 4-corner bracket targeting reticle (┌ ┐ └ ┘) with cardinal micro-ticks.
 * - Expands and rotates into a diamond target lock with neon signal amber/orange on interactive hover.
 * - Tactile recoil scaling on mousedown / click.
 * - Disabled on touch screens, lab routes, and prefers-reduced-motion.
 */
export function CustomCursor() {
  const pathname = usePathname();
  const isLabRoute = pathname?.startsWith("/lab") ?? false;
  const reducedMotion = useReducedMotion();
  const isFinePointer = useSyncExternalStore(
    emptySubscribe,
    getIsFinePointer,
    () => false
  );

  const dotRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLabRoute || reducedMotion || !isFinePointer) return;

    const dot = dotRef.current;
    const reticle = reticleRef.current;
    if (!dot || !reticle) return;

    const pos = { targetX: -100, targetY: -100, x: -100, y: -100, active: false };
    let rafId = 0;

    const handlePointerMove = (e: PointerEvent) => {
      pos.targetX = e.clientX;
      pos.targetY = e.clientY;

      // Pinpoint dot follows mouse instantly with 0 latency
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

      if (!pos.active) {
        pos.x = e.clientX;
        pos.y = e.clientY;
        pos.active = true;
        dot.dataset.visible = "true";
        reticle.dataset.visible = "true";
      }

      const targetEl = e.target as HTMLElement | null;
      const interactive = Boolean(
        targetEl?.closest(
          "a, button, input, textarea, select, [data-cursor], [role='button'], [role='tab']"
        )
      );

      dot.dataset.hover = interactive ? "true" : "false";
      reticle.dataset.hover = interactive ? "true" : "false";
    };

    const handlePointerDown = () => {
      reticle.dataset.active = "true";
    };

    const handlePointerUp = () => {
      reticle.dataset.active = "false";
    };

    const handleMouseLeave = () => {
      pos.active = false;
      dot.dataset.visible = "false";
      reticle.dataset.visible = "false";
    };

    const tick = () => {
      pos.x += (pos.targetX - pos.x) * 0.18;
      pos.y += (pos.targetY - pos.y) * 0.18;
      reticle.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isFinePointer, isLabRoute, reducedMotion]);

  if (isLabRoute || reducedMotion || !isFinePointer) {
    return null;
  }

  return (
    <div className={styles.cursorContainer} aria-hidden="true">
      {/* Instant Precision Core Dot */}
      <div ref={dotRef} className={styles.pointerDot} data-visible="false" data-hover="false" />

      {/* Smooth Lagging Futuristic Viewfinder Frame */}
      <div
        ref={reticleRef}
        className={styles.reticleFrame}
        data-visible="false"
        data-hover="false"
        data-active="false"
      >
        <div className={styles.reticleSvg}>
          <span className={`${styles.cornerBracket} ${styles.bracketTL}`} />
          <span className={`${styles.cornerBracket} ${styles.bracketTR}`} />
          <span className={`${styles.cornerBracket} ${styles.bracketBL}`} />
          <span className={`${styles.cornerBracket} ${styles.bracketBR}`} />
          <span className={`${styles.crosshairTick} ${styles.tickN}`} />
          <span className={`${styles.crosshairTick} ${styles.tickS}`} />
          <span className={`${styles.crosshairTick} ${styles.tickW}`} />
          <span className={`${styles.crosshairTick} ${styles.tickE}`} />
        </div>
      </div>
    </div>
  );
}
