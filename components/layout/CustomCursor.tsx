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
 * Subtle trailing HUD cursor reticle using a single vanilla rAF loop mutating CSS transform.
 * Completely disabled on touch screens and under `prefers-reduced-motion: reduce`.
 */
export function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const isFinePointer = useSyncExternalStore(
    emptySubscribe,
    getIsFinePointer,
    () => false
  );

  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !isFinePointer) return;

    const ring = ringRef.current;
    if (!ring) return;

    const pos = { targetX: -100, targetY: -100, x: -100, y: -100, active: false };
    let rafId = 0;

    const handleMove = (e: PointerEvent) => {
      pos.targetX = e.clientX;
      pos.targetY = e.clientY;
      if (!pos.active) {
        pos.x = e.clientX;
        pos.y = e.clientY;
        pos.active = true;
        ring.dataset.visible = "true";
      }

      const targetEl = e.target as HTMLElement | null;
      const interactive = targetEl?.closest("a, button, input, textarea, [data-cursor]");
      ring.dataset.hover = interactive ? "true" : "false";
    };

    const handleLeave = () => {
      pos.active = false;
      ring.dataset.visible = "false";
    };

    const tick = () => {
      pos.x += (pos.targetX - pos.x) * 0.22;
      pos.y += (pos.targetY - pos.y) * 0.22;
      ring.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [isFinePointer, reducedMotion]);

  if (reducedMotion || !isFinePointer) {
    return null;
  }

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className={styles.reticle}
      data-visible="false"
      data-hover="false"
    />
  );
}
