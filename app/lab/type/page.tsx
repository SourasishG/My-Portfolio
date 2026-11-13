import type { Metadata } from "next";
import Link from "next/link";
import { Instrument_Serif, Newsreader, Geist, Geist_Mono } from "next/font/google";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import styles from "./type-lab.module.scss";

export const metadata: Metadata = {
  title: "Type Lab — Typography Comparison | SIGNAL Redesign",
  robots: { index: false, follow: false },
};

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const newsreader = Newsreader({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export default function TypeLabPage() {
  return (
    <div
      className={`${styles.labPage} ${instrumentSerif.variable} ${newsreader.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.navRow}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Back to Portfolio</span>
            </Link>
            <span className={styles.badge}>
              <Sparkles size={12} aria-hidden="true" />
              <span>Phase 1 — B4 Typography Study</span>
            </span>
          </div>

          <h1 className={styles.title}>Typography Pairings & Specimen</h1>
          <p className={styles.subtitle}>
            Comparing the primary recommendation (<strong>Instrument Serif</strong>) against an editorial
            alternative (<strong>Newsreader</strong>) paired with <strong>Geist</strong> (body & UI) and{" "}
            <strong>Geist Mono</strong> (technical HUD telemetry).
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {/* SET 1: INSTRUMENT SERIF */}
        <section className={styles.specimenCard}>
          <div className={styles.cardHeader}>
            <div className={styles.setInfo}>
              <span className={styles.setTag}>SET 01 // PRIMARY (RECOMMENDED)</span>
              <h2 className={styles.setName}>Instrument Serif + Geist + Geist Mono</h2>
              <p className={styles.setDesc}>
                Slender, razor-sharp editorial proportions with expressive vertical contrast. Designed for
                monumental display scales and italic emphasis.
              </p>
            </div>
            <span className={styles.activePill}>
              <Check size={12} aria-hidden="true" />
              <span>Master Prompt V2 Default</span>
            </span>
          </div>

          <div className={`${styles.specimenBody} ${styles.useInstrument}`}>
            <div className={styles.metaRow}>
              <span className={styles.hudLabel}>[01] // HERO NAME SPECIMEN — CLAMP(4REM, 14VW, 13REM)</span>
              <span className={styles.hudLabel}>DISPLAY: INSTRUMENT SERIF REGULAR + ITALIC</span>
            </div>

            <div className={styles.heroNameSample}>
              <span>Sourasish </span>
              <span className={styles.italicWord}>Ghosh</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.hudLabel}>[02] // ASPIRATIONS SECTION STATEMENT — CLAMP(2.25REM, 6VW, 5.5REM)</span>
              <span className={styles.hudLabel}>DISPLAY STATEMENT WITH EMBER ACCENT</span>
            </div>

            <div className={styles.statementSample}>
              &ldquo;Becoming a full-stack engineer who <span className={styles.italicWord}>owns</span> the whole system.&rdquo;
            </div>

            <div className={styles.metaRow}>
              <span className={styles.hudLabel}>[03] // UI BODY & MONOSPACE TELEMETRY SAMPLES</span>
              <span className={styles.hudLabel}>GEIST 17PX / 1.6 + GEIST MONO 11PX / +0.08EM</span>
            </div>

            <div className={styles.bodyGrid}>
              <div className={styles.bodyCol}>
                <span className={styles.uiLabel}>01 / PRESENCE</span>
                <p className={styles.bodyText}>
                  Computer Science undergraduate and Full-Stack Developer in Kolkata. I design, code, and ship complete
                  web products from first principles to cloud infrastructure.
                </p>
                <div className={styles.ctaRow}>
                  <button type="button" className={styles.primaryBtn}>
                    <span>View Selected Projects</span>
                    <span className={styles.btnCursor}>▮</span>
                  </button>
                  <button type="button" className={styles.secondaryBtn}>
                    <span>Download Resume</span>
                  </button>
                </div>
              </div>

              <div className={styles.telemetryCol}>
                <div className={styles.telemetryBox}>
                  <span className={styles.telemetryTag}>[STATUS: AVAILABLE]</span>
                  <div className={styles.telemetryLine}>
                    <span>COORDINATES</span>
                    <span>22.5726° N, 88.3639° E</span>
                  </div>
                  <div className={styles.telemetryLine}>
                    <span>TIME ZONE</span>
                    <span>KOLKATA (UTC +5:30)</span>
                  </div>
                  <div className={styles.telemetryLine}>
                    <span>STACK MATRIX</span>
                    <span>NEXT.JS · REACT 19 · THREE · PRISMA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SET 2: NEWSREADER */}
        <section className={styles.specimenCard}>
          <div className={styles.cardHeader}>
            <div className={styles.setInfo}>
              <span className={styles.setTag}>SET 02 // ALTERNATIVE COMPARISON</span>
              <h2 className={styles.setName}>Newsreader + Geist + Geist Mono</h2>
              <p className={styles.setDesc}>
                Literary editorial serif with generous x-height, traditional book bracketed serifs, and warm optical
                sizing. Gives a warmer, publishing-house gravitas.
              </p>
            </div>
            <span className={styles.altPill}>Alternative Candidate</span>
          </div>

          <div className={`${styles.specimenBody} ${styles.useNewsreader}`}>
            <div className={styles.metaRow}>
              <span className={styles.hudLabel}>[01] // HERO NAME SPECIMEN — CLAMP(4REM, 14VW, 13REM)</span>
              <span className={styles.hudLabel}>DISPLAY: NEWSREADER REGULAR + ITALIC</span>
            </div>

            <div className={styles.heroNameSample}>
              <span>Sourasish </span>
              <span className={styles.italicWord}>Ghosh</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.hudLabel}>[02] // ASPIRATIONS SECTION STATEMENT — CLAMP(2.25REM, 6VW, 5.5REM)</span>
              <span className={styles.hudLabel}>DISPLAY STATEMENT WITH EMBER ACCENT</span>
            </div>

            <div className={styles.statementSample}>
              &ldquo;Becoming a full-stack engineer who <span className={styles.italicWord}>owns</span> the whole system.&rdquo;
            </div>

            <div className={styles.metaRow}>
              <span className={styles.hudLabel}>[03] // UI BODY & MONOSPACE TELEMETRY SAMPLES</span>
              <span className={styles.hudLabel}>GEIST 17PX / 1.6 + GEIST MONO 11PX / +0.08EM</span>
            </div>

            <div className={styles.bodyGrid}>
              <div className={styles.bodyCol}>
                <span className={styles.uiLabel}>01 / PRESENCE</span>
                <p className={styles.bodyText}>
                  Computer Science undergraduate and Full-Stack Developer in Kolkata. I design, code, and ship complete
                  web products from first principles to cloud infrastructure.
                </p>
                <div className={styles.ctaRow}>
                  <button type="button" className={styles.primaryBtn}>
                    <span>View Selected Projects</span>
                    <span className={styles.btnCursor}>▮</span>
                  </button>
                  <button type="button" className={styles.secondaryBtn}>
                    <span>Download Resume</span>
                  </button>
                </div>
              </div>

              <div className={styles.telemetryCol}>
                <div className={styles.telemetryBox}>
                  <span className={styles.telemetryTag}>[STATUS: AVAILABLE]</span>
                  <div className={styles.telemetryLine}>
                    <span>COORDINATES</span>
                    <span>22.5726° N, 88.3639° E</span>
                  </div>
                  <div className={styles.telemetryLine}>
                    <span>TIME ZONE</span>
                    <span>KOLKATA (UTC +5:30)</span>
                  </div>
                  <div className={styles.telemetryLine}>
                    <span>STACK MATRIX</span>
                    <span>NEXT.JS · REACT 19 · THREE · PRISMA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
