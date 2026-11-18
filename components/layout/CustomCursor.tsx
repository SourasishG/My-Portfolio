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
 * - Smooth lerping 4-corner bracket targeting reticle with cardinal micro-ticks.
 * - Expands and rotates into a diamond target lock in SIGNAL orange on interactive hover.
 * - Tactile recoil scaling on pointerdown without interrupting translate3d tracking.
 * - Automatically sleeps rAF loop when settled (0% idle CPU) and disables on touch/reduced motion.
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
    let rafId: number | null = null;

    const tick = () => {
      const dx = pos.targetX - pos.x;
      const dy = pos.targetY - pos.y;

      if (Math.abs(dx) < 0.08 && Math.abs(dy) < 0.08) {
        pos.x = pos.targetX;
        pos.y = pos.targetY;
        reticle.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
        rafId = null;
        return;
      }

      pos.x += dx * 0.18;
      pos.y += dy * 0.18;
      reticle.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    const scheduleTick = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      pos.targetX = e.clientX;
      pos.targetY = e.clientY;

      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

      if (!pos.active) {
        pos.x = e.clientX;
        pos.y = e.clientY;
        pos.active = true;
        reticle.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
        dot.dataset.visible = "true";
        reticle.dataset.visible = "true";
      } else {
        scheduleTick();
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
      reticle.dataset.active = "false";
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("blur", handlePointerUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isFinePointer, isLabRoute, reducedMotion]);

  if (isLabRoute || reducedMotion || !isFinePointer) {
    return null;
  }

  return (
    <div className={styles.cursorContainer} aria-hidden="true">
      <div ref={dotRef} className={styles.pointerDot} data-visible="false" data-hover="false">
        <span className={styles.dotCore} />
      </div>

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
