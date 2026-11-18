"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { playAtmosphericChime, playRotaryTick } from "@/lib/sound";
import { useSceneStore } from "@/lib/store";
import styles from "./Preloader.module.scss";

const STATUS_STAGES = [
  { threshold: 0, text: "INITIALIZING FREQUENCY CARRIER..." },
  { threshold: 28, text: "CALIBRATING TELEMETRY & VIEWPORTS..." },
  { threshold: 58, text: "SYNCHRONIZING PROCEDURAL SHADERS..." },
  { threshold: 84, text: "LOCKING TRANSMISSION BUS..." },
  { threshold: 100, text: "SIGNAL ACQUIRED // SYSTEM READY" },
] as const;

function shouldBypassPreloader(): boolean {
  if (typeof window === "undefined") return false;
  const isBotOrLighthouse =
    Boolean((navigator as unknown as { webdriver?: boolean }).webdriver) ||
    /Chrome-Lighthouse|Googlebot|Lighthouse/i.test(navigator.userAgent);
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return isBotOrLighthouse || prefersReduced;
}

/**
 * High-precision futuristic HUD preloader fitting the SIGNAL // 00 aesthetic.
 * - Calibrated dual-rotary radar gyro with the signature split contour emblem.
 * - Stepped frequency percentage counter (00 -> 100%) with dynamic telemetry messages.
 * - Procedural Web Audio micro-ticks at milestones and confirmation chime on signal lock.
 * - Cinematic vertical aperture shutter exit reveal.
 * - Hydration-safe with zero duplicate landmarks; auto-bypasses on /lab, bots, and reduced motion.
 */
export function Preloader() {
  const pathname = usePathname();
  const isLabRoute = pathname?.startsWith("/lab") ?? false;
  const setPreloaderDone = useSceneStore((s) => s.setPreloaderDone);

  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(!isLabRoute);

  const lastTickThresholdRef = useRef(0);
  const lastRenderedProgressRef = useRef(0);
  const finishedRef = useRef(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (exitTimerRef.current !== null) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (doneTimerRef.current !== null) {
      clearTimeout(doneTimerRef.current);
      doneTimerRef.current = null;
    }
  }, []);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);
    playAtmosphericChime(620);

    clearTimers();
    exitTimerRef.current = setTimeout(() => {
      setIsExiting(true);
      doneTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setPreloaderDone(true);
      }, 620);
    }, 140);
  }, [clearTimers, setPreloaderDone]);

  useEffect(() => {
    if (isLabRoute || !isVisible) {
      setPreloaderDone(true);
      return;
    }

    let animFrame = 0;

    if (shouldBypassPreloader()) {
      animFrame = requestAnimationFrame(() => {
        finishedRef.current = true;
        setIsVisible(false);
        setPreloaderDone(true);
      });
      return () => cancelAnimationFrame(animFrame);
    }

    const startTime = performance.now();
    const duration = 1650;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const linearRatio = Math.min(1, elapsed / duration);
      const curvedProgress =
        linearRatio < 0.5
          ? 2 * linearRatio * linearRatio
          : 1 - Math.pow(-2 * linearRatio + 2, 2) / 2;

      const currentVal = Math.floor(curvedProgress * 100);

      if (currentVal - lastTickThresholdRef.current >= 24 && currentVal < 100) {
        lastTickThresholdRef.current = currentVal;
        playRotaryTick();
      }

      if (currentVal !== lastRenderedProgressRef.current) {
        lastRenderedProgressRef.current = currentVal;
        setProgress(currentVal);
      }

      if (linearRatio < 1 && !finishedRef.current) {
        animFrame = requestAnimationFrame(tick);
      } else if (!finishedRef.current) {
        handleFinish();
      }
    };

    animFrame = requestAnimationFrame(tick);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        handleFinish();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimers();
    };
  }, [clearTimers, handleFinish, isLabRoute, isVisible, setPreloaderDone]);

  if (isLabRoute || !isVisible) {
    return null;
  }

  const activeStatus =
    [...STATUS_STAGES]
      .reverse()
      .find((stage) => progress >= stage.threshold)?.text ?? STATUS_STAGES[0].text;

  return (
    <div
      className={styles.preloaderRoot}
      data-exiting={isExiting ? "true" : "false"}
      onClick={handleFinish}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Loading SIGNAL portfolio experience"
    >
      <div className={styles.bgAmbient} aria-hidden="true" />

      {/* Top Telemetry Row */}
      <div className={styles.topBar}>
        <div className={styles.systemTag}>
          <span className={styles.pulseDot} aria-hidden="true" />
          <span>SIGNAL // SYS.INIT v2.4</span>
        </div>
        <div className={styles.coords}>
          <span>22.5726° N · 88.3639° E // UTC+05:30</span>
        </div>
      </div>

      {/* Central Calibration HUD Radar Stage */}
      <div className={styles.stageCenter}>
        <div className={styles.gyroWrapper} aria-hidden="true">
          <svg className={styles.gyroSvg} viewBox="0 0 200 200" fill="none">
            <circle
              className={styles.outerRing}
              cx="100"
              cy="100"
              r="92"
              stroke="rgba(77, 168, 255, 0.45)"
              strokeWidth="1.2"
              strokeDasharray="4 8"
            />
            <circle
              className={styles.middleRing}
              cx="100"
              cy="100"
              r="76"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
              strokeDasharray="1 5"
            />
            <line x1="100" y1="4" x2="100" y2="12" stroke="#FF5B1F" strokeWidth="2" />
            <line x1="100" y1="188" x2="100" y2="196" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="4" y1="100" x2="12" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="188" y1="100" x2="196" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
          </svg>

          <div className={styles.coreEmblem}>
            <svg viewBox="0 0 120 120" fill="none" style={{ width: "100%", height: "100%" }}>
              <defs>
                <clipPath id="preloaderUpperClip">
                  <polygon points="0,0 120,0 120,52 0,68" />
                </clipPath>
                <clipPath id="preloaderLowerClip">
                  <polygon points="0,68 120,52 120,120 0,120" />
                </clipPath>
              </defs>

              <g clipPath="url(#preloaderUpperClip)">
                <circle cx="60" cy="60" r="46" stroke="#F3F5F9" strokeWidth="1.2" />
                <ellipse cx="60" cy="52" rx="41" ry="15" stroke="#F3F5F9" strokeOpacity="0.7" strokeWidth="1" />
                <path d="M18 58 C 42 42, 74 68, 102 52" stroke="#4DA8FF" strokeOpacity="0.9" strokeWidth="1.4" />
              </g>

              <g clipPath="url(#preloaderLowerClip)">
                <circle cx="60" cy="60" r="46" stroke="#F3F5F9" strokeWidth="1.2" />
                <ellipse cx="60" cy="68" rx="41" ry="15" stroke="#F3F5F9" strokeOpacity="0.7" strokeWidth="1" />
                <path d="M19 67 C 46 80, 74 52, 102 68" stroke="#FF5B1F" strokeOpacity="0.95" strokeWidth="1.4" />
              </g>
            </svg>
          </div>
        </div>

        <div className={styles.readoutBlock}>
          <div className={styles.percentageNumber}>
            {progress.toString().padStart(2, "0")}
            <span className={styles.unit}>%</span>
          </div>

          <div className={styles.meterTrack}>
            <div className={styles.meterFill} style={{ width: `${progress}%` }} />
          </div>

          <p className={styles.statusMessage}>
            <span className={styles.statusSignalHighlight}>{"//"}</span>
            <span>{activeStatus}</span>
          </p>
        </div>
      </div>

      {/* Bottom Telemetry & Skip Hint */}
      <div className={styles.bottomBar}>
        <span className={styles.architectLabel}>
          SOURASISH GHOSH · FULL-STACK ARCHITECTURE
        </span>
        <button
          type="button"
          className={styles.skipCue}
          aria-label="Skip preloader animation"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
        >
          [ CLICK / ESC TO SKIP ]
        </button>
      </div>
    </div>
  );
}
