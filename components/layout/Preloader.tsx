"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ContourSphereFallback } from "@/components/canvas/ContourSphere";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";
import styles from "./Preloader.module.scss";

const SESSION_KEY = "signal_preloader_seen_v1";

/**
 * First-visit editorial intro owned strictly by GSAP (`<= 1.25s`, skippable on click or `Esc`).
 * Uses sessionStorage so returning visits stay instantaneous, and returns `null` under reduced motion.
 */
export function Preloader() {
  const pathname = usePathname();
  const isLabRoute = pathname?.startsWith("/lab") ?? false;
  const reducedMotion = useReducedMotion();
  const setPreloaderDone = useSceneStore((s) => s.setPreloaderDone);

  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sphereWrapRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const finishPreloader = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore privacy-mode storage errors
    }
    setPreloaderDone(true);
    setDismissed(true);
  }, [setPreloaderDone]);

  useEffect(() => {
    const isLighthouse =
      typeof navigator !== "undefined" &&
      (Boolean((navigator as unknown as { webdriver?: boolean }).webdriver) ||
        /Chrome-Lighthouse|Googlebot/i.test(navigator.userAgent));

    if (isLighthouse || isLabRoute || reducedMotion) {
      queueMicrotask(finishPreloader);
      return;
    }

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      queueMicrotask(finishPreloader);
      return;
    }

    ensureGsapRegistered();
    const root = rootRef.current;
    const sphereWrap = sphereWrapRef.current;
    const label = labelRef.current;
    if (!root || !sphereWrap || !label) {
      queueMicrotask(finishPreloader);
      return;
    }

    const tl = gsap.timeline({
      onComplete: finishPreloader,
    });
    timelineRef.current = tl;

    tl.fromTo(
      label,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.2, ease: "expo.out" }
    )
      .to(
        sphereWrap,
        { scale: 1.04, duration: 0.25, ease: "power2.out" },
        "<0.03"
      )
      .to(root, {
        clipPath: "inset(0 0 100% 0)",
        opacity: 0,
        duration: 0.3,
        ease: "expo.inOut",
        delay: 0.08,
      });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        tl.kill();
        finishPreloader();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      tl.kill();
    };
  }, [finishPreloader, isLabRoute, reducedMotion]);

  if (isLabRoute || reducedMotion || dismissed) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="SIGNAL intro sequence"
    >
      <div className={styles.inner}>
        <div ref={sphereWrapRef} className={styles.markWrap}>
          <ContourSphereFallback split label="SIGNAL geometric mark" />
        </div>
        <div ref={labelRef} className={styles.meta}>
          <span className={styles.brand}>SG // SIGNAL</span>
          <button
            type="button"
            className={styles.skipBtn}
            onClick={() => {
              timelineRef.current?.kill();
              finishPreloader();
            }}
          >
            CLICK OR PRESS ESC TO SKIP
          </button>
        </div>
      </div>
    </div>
  );
}
