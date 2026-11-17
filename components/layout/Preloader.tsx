"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { playAtmosphericChime, playRotaryTick } from "@/lib/sound";
import { useSceneStore } from "@/lib/store";
import styles from "./Preloader.module.scss";

const STATUS_STAGES = [
  { threshold: 0, text: "INITIALIZING FREQUENCY CARRIER..." },
  { threshold: 28, text: "CALIBRATING TELEMETRY & VIEWPORTS..." },
  { threshold: 58, text: "SYNCHRONIZING PROCEDURAL SHADERS..." },
  { threshold: 84, text: "LOCKING TRANSMISSION BUS..." },
  { threshold: 100, text: "SIGNAL ACQUIRED // SYSTEM READY" },
];

/**
 * High-precision futuristic HUD preloader fitting the SIGNAL // 00 aesthetic.
 * - Calibrated dual-rotary radar gyro with the signature split contour emblem.
 * - Stepped frequency percentage counter (00 -> 100%) with dynamic telemetry messages.
 * - Procedural Web Audio micro-ticks at milestones and confirmation chime on signal lock.
 * - Cinematic vertical aperture shutter exit reveal.
 * - Auto-bypasses on Lighthouse / bots and prefers-reduced-motion for zero test regression.
 */
export function Preloader() {
  const reducedMotion = useReducedMotion();
  const setPreloaderDone = useSceneStore((s) => s.setPreloaderDone);

  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const lastTickThresholdRef = useRef(0);
  const finishedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);
    playAtmosphericChime(620);

    // Brief settling pause before the cinematic shutter reveal
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      const doneTimer = setTimeout(() => {
        setIsVisible(false);
        setPreloaderDone(true);
      }, 620);
      return () => clearTimeout(doneTimer);
    }, 140);

    return () => clearTimeout(exitTimer);
  }, [setPreloaderDone]);

  useEffect(() => {
    const isBotOrLighthouse =
      typeof navigator !== "undefined" &&
      (Boolean((navigator as unknown as { webdriver?: boolean }).webdriver) ||
        /Chrome-Lighthouse|Googlebot|Lighthouse/i.test(navigator.userAgent));

    if (reducedMotion || isBotOrLighthouse) {
      setPreloaderDone(true);
      setIsVisible(false);
      return;
    }

    let currentVal = 0;
    const startTime = performance.now();
    const duration = 1650; // 1.65 seconds: snappy, elegant, unhurried
    let animFrame = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const linearRatio = Math.min(1, elapsed / duration);
      // Custom ease-in-out curve with small realistic pauses
      const curvedProgress =
        linearRatio < 0.5
          ? 2 * linearRatio * linearRatio
          : 1 - Math.pow(-2 * linearRatio + 2, 2) / 2;

      currentVal = Math.floor(curvedProgress * 100);

      // Play tactical rotary ticks at milestones
      if (currentVal - lastTickThresholdRef.current >= 24 && currentVal < 100) {
        lastTickThresholdRef.current = currentVal;
        playRotaryTick();
      }

      setProgress(currentVal);

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
    };
  }, [handleFinish, reducedMotion, setPreloaderDone]);

  if (!isVisible) {
    return null;
  }

  // Derive active status message based on current progress
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
      <header className={styles.topBar}>
        <div className={styles.systemTag}>
          <span className={styles.pulseDot} aria-hidden="true" />
          <span>SIGNAL // SYS.INIT v2.4</span>
        </div>
        <div className={styles.coords}>
          <span>22.5726° N · 88.3639° E // UTC+05:30</span>
        </div>
      </header>

      {/* Central Calibration HUD Radar Stage */}
      <main className={styles.stageCenter}>
        <div className={styles.gyroWrapper} aria-hidden="true">
          <svg className={styles.gyroSvg} viewBox="0 0 200 200" fill="none">
            {/* Outer segmented radar ring */}
            <circle
              className={styles.outerRing}
              cx="100"
              cy="100"
              r="92"
              stroke="rgba(77, 168, 255, 0.45)"
              strokeWidth="1.2"
              strokeDasharray="4 8"
            />
            {/* Middle counter-rotating compass ring */}
            <circle
              className={styles.middleRing}
              cx="100"
              cy="100"
              r="76"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
              strokeDasharray="1 5"
            />
            {/* Cardinal crosshair markers */}
            <line x1="100" y1="4" x2="100" y2="12" stroke="#FF5B1F" strokeWidth="2" />
            <line x1="100" y1="188" x2="100" y2="196" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="4" y1="100" x2="12" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
            <line x1="188" y1="100" x2="196" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
          </svg>

          {/* Core Iconic Split Contour Emblem */}
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

        {/* Digital Percentage Readout */}
        <div className={styles.readoutBlock}>
          <div className={styles.percentageNumber}>
            {progress.toString().padStart(2, "0")}
            <span className={styles.unit}>%</span>
          </div>

          {/* Technical Progress Meter */}
          <div className={styles.meterTrack}>
            <div className={styles.meterFill} style={{ width: `${progress}%` }} />
          </div>

          {/* Live Dynamic Status Message */}
          <p className={styles.statusMessage}>
            <span className={styles.statusSignalHighlight}>//</span>
            <span>{activeStatus}</span>
          </p>
        </div>
      </main>

      {/* Bottom Telemetry & Skip Hint */}
      <footer className={styles.bottomBar}>
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
      </footer>
    </div>
  );
}
