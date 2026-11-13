"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, FileText, Menu, X } from "lucide-react";
import { NAV_ITEMS, SITE_IDENTITY, SOCIAL_LINKS } from "@/content/links";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { playAtmosphericChime, playMechanicalClick, playRotaryTick } from "@/lib/sound";
import { useSceneStore } from "@/lib/store";
import styles from "./Navigation.module.scss";

function formatKolkataIst(): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

/**
 * Persistent top HUD navigation bar (`Navigation`) + Framer Motion mobile drawer.
 * Hidden automatically on `/lab` so the shader sandbox keeps its dedicated instrument strip.
 */
export function Navigation() {
  const pathname = usePathname();
  const isLabRoute = pathname?.startsWith("/lab") ?? false;
  const reducedMotion = useReducedMotion();
  const activeSection = useSceneStore((s) => s.activeSection);
  const motionEnabled = useSceneStore((s) => s.motionEnabled);
  const toggleMotion = useSceneStore((s) => s.toggleMotion);
  const soundEnabled = useSceneStore((s) => s.soundEnabled);
  const toggleSound = useSceneStore((s) => s.toggleSound);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [kolkataTime, setKolkataTime] = useState<string>("--:--");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = useCallback((restoreFocus = false) => {
    setDrawerOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => {
        menuButtonRef.current?.focus();
      });
    }
  }, []);

  // Client-only live clock updates (avoids SSR timezone mismatch)
  useEffect(() => {
    if (isLabRoute) return;
    queueMicrotask(() => {
      setKolkataTime(formatKolkataIst());
    });
    const timer = window.setInterval(() => {
      setKolkataTime(formatKolkataIst());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [isLabRoute]);

  // Body scroll lock, initial focus & Escape handler while mobile drawer is open
  useEffect(() => {
    if (!drawerOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDrawer(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeDrawer, drawerOpen]);

  if (isLabRoute) {
    return null;
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/#hero" className={styles.brand} aria-label="SG SIGNAL — Sourasish Ghosh Home">
            <span className={styles.brandBrackets} aria-hidden="true">
              [
            </span>
            <span>{SITE_IDENTITY.brandMark}</span>
            <span className={styles.brandBrackets} aria-hidden="true">
              ]
            </span>
            <span className={styles.brandSub} aria-hidden="true">
              SIGNAL
            </span>
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary sections">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === "/" && activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  <span className={styles.navIndex}>{item.index}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.actions}>
            <div className={styles.clockTelemetry} aria-label="Kolkata local time">
              <span className={styles.clockDot} aria-hidden="true" />
              <span>KOLKATA {kolkataTime} IST</span>
            </div>

            <button
              type="button"
              className={styles.motionToggle}
              onClick={() => {
                toggleMotion();
                playMechanicalClick();
              }}
              aria-label={`Toggle interactive motion (currently ${motionEnabled ? "on" : "off"})`}
              title="Toggle interactive 3D and scroll motion"
            >
              <span
                className={`${styles.motionDot} ${!motionEnabled ? styles.motionOff : ""}`}
                aria-hidden="true"
              />
              <span>MOTION [{motionEnabled ? "ON" : "OFF"}]</span>
            </button>

            <button
              type="button"
              className={styles.motionToggle}
              onClick={() => {
                const next = !soundEnabled;
                toggleSound();
                if (next) {
                  playAtmosphericChime(580);
                }
              }}
              aria-label={`Toggle interactive audio feedback (currently ${soundEnabled ? "on" : "off"})`}
              title="Toggle tactile Web Audio feedback (inspired by Lorenzo Lottici & Luka Skhiladze)"
            >
              <span
                className={`${styles.motionDot} ${!soundEnabled ? styles.motionOff : ""}`}
                style={soundEnabled ? { backgroundColor: "#FF5B1F", boxShadow: "0 0 6px rgba(255, 91, 31, 0.7)" } : {}}
                aria-hidden="true"
              />
              <span>SOUND [{soundEnabled ? "ON" : "OFF"}]</span>
            </button>

            <a
              href={SITE_IDENTITY.resumeHref}
              download={SITE_IDENTITY.resumeFileName}
              className={styles.resumeLink}
            >
              <FileText size={13} aria-hidden="true" />
              <span>Resume</span>
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuToggle}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setDrawerOpen((prev) => !prev)}
            >
              {drawerOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className={styles.backdrop}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.22 }}
              onClick={() => closeDrawer(true)}
            />

            <motion.nav
              id="mobile-nav-drawer"
              className={styles.drawer}
              aria-label="Mobile navigation"
              role="dialog"
              aria-modal="true"
              initial={{ x: reducedMotion ? 0 : "100%", opacity: reducedMotion ? 1 : 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reducedMotion ? 0 : "100%", opacity: reducedMotion ? 0 : 0.9 }}
              transition={{
                duration: reducedMotion ? 0 : 0.34,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div>
                <div className={styles.drawerHeader}>
                  <span className={styles.drawerTag}>SIGNAL // NAVIGATION</span>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    className={styles.closeBtn}
                    aria-label="Close navigation menu"
                    onClick={() => closeDrawer(true)}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>

                <ul className={styles.drawerList}>
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === "/" && activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ""}`}
                          onClick={() => closeDrawer(false)}
                        >
                          <span>
                            <span className={styles.drawerIndex}>{item.index}</span>
                            {item.label}
                          </span>
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className={styles.drawerFooter}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                  <div className={styles.drawerClock}>KOLKATA {kolkataTime} IST</div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className={styles.motionToggle}
                      onClick={() => {
                        toggleMotion();
                        playMechanicalClick();
                      }}
                      aria-label={`Toggle motion (currently ${motionEnabled ? "on" : "off"})`}
                    >
                      <span
                        className={`${styles.motionDot} ${!motionEnabled ? styles.motionOff : ""}`}
                        aria-hidden="true"
                      />
                      <span>MOTION [{motionEnabled ? "ON" : "OFF"}]</span>
                    </button>
                    <button
                      type="button"
                      className={styles.motionToggle}
                      onClick={() => {
                        const next = !soundEnabled;
                        toggleSound();
                        if (next) {
                          playAtmosphericChime(580);
                        }
                      }}
                      aria-label={`Toggle sound (currently ${soundEnabled ? "on" : "off"})`}
                    >
                      <span
                        className={`${styles.motionDot} ${!soundEnabled ? styles.motionOff : ""}`}
                        style={soundEnabled ? { backgroundColor: "#FF5B1F", boxShadow: "0 0 6px rgba(255, 91, 31, 0.7)" } : {}}
                        aria-hidden="true"
                      />
                      <span>SOUND [{soundEnabled ? "ON" : "OFF"}]</span>
                    </button>
                  </div>
                </div>
                <a
                  href={SITE_IDENTITY.resumeHref}
                  download={SITE_IDENTITY.resumeFileName}
                  className={styles.drawerResume}
                  onClick={() => closeDrawer(false)}
                >
                  <FileText size={15} aria-hidden="true" />
                  <span>Download Resume (PDF)</span>
                </a>
                <div className={styles.drawerSocials}>
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.drawerSocialLink}
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href={`mailto:${SITE_IDENTITY.email}`}
                    className={styles.drawerSocialLink}
                  >
                    Email
                  </a>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
