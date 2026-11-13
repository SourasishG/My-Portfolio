"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { FieldErrors, Resolver, useForm, useWatch } from "react-hook-form";
import { GlassObjectFallback } from "@/components/canvas/GlassObject";
import { CONTACT_COPY } from "@/content/copy";
import { SITE_IDENTITY, SOCIAL_LINKS } from "@/content/links";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ContactFormValues, contactSubmissionSchema } from "@/lib/contact-schema";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { playAtmosphericChime, playMechanicalClick, playRotaryTick } from "@/lib/sound";
import { useSceneStore } from "@/lib/store";
import styles from "./Contact.module.scss";

type SubmissionFeedback =
  | { kind: "success"; title: string; detail: string }
  | { kind: "error"; title: string; detail: string }
  | { kind: "warning"; title: string; detail: string };

/**
 * Lightweight zod resolver wired directly into `react-hook-form` without
 * introducing an unapproved third-party resolver dependency.
 */
const contactZodResolver: Resolver<ContactFormValues> = async (values) => {
  const result = contactSubmissionSchema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const fieldErrors: FieldErrors<ContactFormValues> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (
      key === "name" ||
      key === "email" ||
      key === "subject" ||
      key === "message" ||
      key === "company"
    ) {
      if (!fieldErrors[key]) {
        fieldErrors[key] = {
          type: issue.code,
          message: issue.message,
        };
      }
    }
  }
  return { values: {}, errors: fieldErrors };
};

/**
 * Section 08 — Contact & Collaboration (`#contact`).
 *
 * - Pairs Chromatic Glass Object **S4** inside `#contact-s4-stage` (max 2 active WebGL effects)
 *   with crisp static SVG prism fallback under reduced motion / low GPU / off-section scroll.
 * - Original geometric SVG connection line-art (`.contact-line-art`) animated once by GSAP.
 * - `react-hook-form` + `zod` form validated identically on client and `/api/contact` server route,
 *   including honeypot field, per-IP rate limiting feedback (`429`), and explicit delivery alerts
 *   via Framer Motion `AnimatePresence` (`.contact-form-feedback`).
 */
export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const hudPathRef = useRef<SVGPathElement>(null);
  const lineArtGroupRef = useRef<SVGGElement>(null);
  const copyTimerRef = useRef<number | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedback, setFeedback] = useState<SubmissionFeedback | null>(null);

  const reducedMotion = useReducedMotion();
  const activeSection = useSceneStore((s) => s.activeSection);
  const useStaticFallback = useSceneStore((s) => s.useStaticFallback);
  const glassObjectReady = useSceneStore((s) => s.glassObjectReady);

  const s4ShaderVisible =
    !useStaticFallback &&
    !reducedMotion &&
    activeSection === "contact" &&
    glassObjectReady;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: contactZodResolver,
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      company: "",
    },
  });

  const messageValue =
    useWatch({
      control,
      name: "message",
      defaultValue: "",
    }) ?? "";

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useGSAP(
    () => {
      ensureGsapRegistered();
      const sectionEl = sectionRef.current;
      const hudPath = hudPathRef.current;
      const lineGroup = lineArtGroupRef.current;
      if (!sectionEl) return;

      const preferReduced =
        reducedMotion ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      const introEls = sectionEl.querySelectorAll(".contact-intro");
      const artPaths = lineGroup ? lineGroup.querySelectorAll("path") : [];

      if (preferReduced) {
        if (hudPath) {
          gsap.set(hudPath, { clearProps: "strokeDasharray,strokeDashoffset" });
        }
        if (artPaths.length > 0) {
          gsap.set(artPaths, { clearProps: "strokeDasharray,strokeDashoffset" });
        }
        if (introEls.length > 0) {
          gsap.set(introEls, { clearProps: "opacity,transform" });
        }
        return;
      }

      if (hudPath) {
        gsap.set(hudPath, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.to(hudPath, {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 80%",
            once: true,
          },
        });
      }

      if (artPaths.length > 0) {
        gsap.set(artPaths, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.to(artPaths, {
          strokeDashoffset: 0,
          duration: 1.05,
          stagger: 0.14,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 75%",
            once: true,
          },
        });
      }

      if (introEls.length > 0) {
        gsap.from(introEls, {
          y: 16,
          duration: 0.56,
          ease: "expo.out",
          stagger: 0.06,
          clearProps: "transform",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 82%",
            once: true,
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true }
  );

  const handleCopyEmail = useCallback(async () => {
    playMechanicalClick();
    try {
      await navigator.clipboard.writeText(SITE_IDENTITY.email);
      setCopiedEmail(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedEmail(false);
      }, 2400);
    } catch {
      setCopiedEmail(false);
    }
  }, []);

  const onSubmit = async (data: ContactFormValues) => {
    playMechanicalClick();
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        message?: string;
        error?: string;
        fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
      } | null;

      if (response.ok && payload?.ok) {
        playAtmosphericChime();
        setFeedback({
          kind: "success",
          title: "Transmission delivered",
          detail:
            payload.message ||
            "Thank you for reaching out — I will respond by email soon.",
        });
        reset();
        return;
      }

      if (response.status === 400 && payload?.fieldErrors) {
        for (const field of ["name", "email", "subject", "message"] as const) {
          const msg = payload.fieldErrors[field];
          if (msg) {
            setError(field, { type: "server", message: msg });
          }
        }
      }

      if (response.status === 429) {
        setFeedback({
          kind: "warning",
          title: "Rate limit active",
          detail:
            payload?.error ||
            "Too many requests in a short window. Please wait briefly or email directly.",
        });
        return;
      }

      setFeedback({
        kind: response.status === 503 ? "warning" : "error",
        title:
          response.status === 503
            ? "Mail relay awaiting configuration"
            : "Delivery interrupted",
        detail:
          payload?.error ||
          "Unable to send right now. Please email sourasishghosh062@gmail.com directly.",
      });
    } catch {
      setFeedback({
        kind: "error",
        title: "Network error",
        detail:
          "Could not reach the server relay. Please check your connection or email sourasishghosh062@gmail.com directly.",
      });
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={`${styles.contactSection} ${
        s4ShaderVisible ? styles.contactShaderActive : ""
      }`}
      aria-labelledby="contact-heading"
    >
      <div className={styles.container}>
        {/* Header Band */}
        <header className={styles.headerBand}>
          <div className={styles.headerMeta}>
            <span className={styles.hudTag}>{CONTACT_COPY.sectionTag}</span>
            <span className={styles.subTag}>{CONTACT_COPY.subTag}</span>
          </div>

          <svg
            className={styles.hudLineSvg}
            viewBox="0 0 1200 16"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={hudPathRef}
              className="contact-hud-line"
              d="M0 8 L320 8 L334 2 L1188 2 L1200 8"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              pathLength={1}
            />
          </svg>

          <div className={styles.headingRow}>
            <h2 id="contact-heading" className={`${styles.heading} contact-intro`}>
              {"Let's build something "}
              <span className={styles.serifHeading}>dependable</span>.
            </h2>
            <div className={`${styles.leadBlock} contact-intro`}>
              <p className={styles.leadCopy}>{CONTACT_COPY.lead}</p>
              <p className={styles.availabilityNote}>{CONTACT_COPY.availabilityNote}</p>
            </div>
          </div>
        </header>

        {/* Main Asymmetric Grid: Stage + Direct Channels | Server-Validated Form */}
        <div className={styles.mainGrid}>
          {/* Left Column: S4 Aperture + Geometric Connection Art + Direct Channels */}
          <div className={styles.visualCol}>
            <figure className={styles.stageFrame}>
              <div className={styles.cornerTL} aria-hidden="true" />
              <div className={styles.cornerTR} aria-hidden="true" />
              <div className={styles.cornerBL} aria-hidden="true" />
              <div className={styles.cornerBR} aria-hidden="true" />

              <div
                id="contact-s4-stage"
                className={`${styles.stageAperture} ${
                  s4ShaderVisible ? styles.stageApertureShader : ""
                }`}
              >
                {/* Original Architectural SVG Geometric Connection Trace */}
                <svg
                  className={`${styles.lineArtOverlay} contact-line-art`}
                  viewBox="0 0 480 340"
                  fill="none"
                  aria-hidden="true"
                >
                  <g ref={lineArtGroupRef}>
                    <path
                      d="M28 52 L116 52 L148 92 L342 92 L374 52 L452 52"
                      stroke="rgba(77, 168, 255, 0.26)"
                      strokeWidth="1"
                      pathLength={1}
                    />
                    <path
                      d="M28 288 L128 288 L164 246 L316 246 L352 288 L452 288"
                      stroke="rgba(179, 136, 245, 0.24)"
                      strokeWidth="1"
                      pathLength={1}
                    />
                    <path
                      d="M54 52 L54 288 M426 52 L426 288"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                      pathLength={1}
                    />
                  </g>
                  <circle cx="54" cy="52" r="3" fill="#4DA8FF" fillOpacity="0.7" />
                  <circle cx="426" cy="288" r="3" fill="#B388F5" fillOpacity="0.7" />
                </svg>

                <div
                  className={styles.stageFallback}
                  style={{ opacity: s4ShaderVisible ? 0 : 1 }}
                >
                  <GlassObjectFallback />
                </div>
              </div>
            </figure>

            {/* Direct Channels & Resume Card */}
            <aside
              className={`${styles.channelsCard} contact-intro`}
              aria-label="Direct contact channels"
            >
              <div className={styles.channelsHeader}>
                <span className={styles.channelsTag}>
                  {CONTACT_COPY.directChannelTag}
                </span>
                <span className={styles.locationBadge}>
                  <MapPin size={12} aria-hidden="true" />
                  <span>{SITE_IDENTITY.location}</span>
                </span>
              </div>

              <div className={styles.emailRow}>
                <a
                  href={`mailto:${SITE_IDENTITY.email}`}
                  className={styles.emailLink}
                >
                  <Mail size={15} aria-hidden="true" />
                  <span>{SITE_IDENTITY.email}</span>
                </a>
                <button
                  type="button"
                  className={`${styles.copyBtn} ${copiedEmail ? styles.copyBtnActive : ""}`}
                  onClick={handleCopyEmail}
                  aria-label={
                    copiedEmail
                      ? "Email address copied to clipboard"
                      : "Copy email address to clipboard"
                  }
                >
                  {copiedEmail ? (
                    <>
                      <Check size={13} aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className={styles.socialGrid}>
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    onMouseEnter={() => playRotaryTick()}
                  >
                    <span className={styles.socialMeta}>
                      <span className={styles.socialLabel}>{item.label}</span>
                      <span className={styles.socialHandle}>{item.handle}</span>
                    </span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ))}

                <a
                  href={SITE_IDENTITY.resumeHref}
                  download={SITE_IDENTITY.resumeFileName}
                  className={styles.socialLink}
                  onMouseEnter={() => playRotaryTick()}
                >
                  <span className={styles.socialMeta}>
                    <span className={styles.socialLabel}>Resume (PDF)</span>
                    <span className={styles.socialHandle}>
                      {SITE_IDENTITY.resumeFileName}
                    </span>
                  </span>
                  <FileText size={14} aria-hidden="true" />
                </a>
              </div>
            </aside>
          </div>

          {/* Right Column: Typed React Hook Form + Zod Contact Form */}
          <div className={`${styles.formCard} contact-intro`}>
            <div className={styles.formHeader}>
              <span className={styles.formTag}>{CONTACT_COPY.formTag}</span>
              <h3 className={styles.formTitle}>{CONTACT_COPY.formTitle}</h3>
            </div>

            <form
              className={styles.form}
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Hidden honeypot input for automated spam traps */}
              <div className={styles.honeypotField} aria-hidden="true">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register("company")}
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="contact-name" className={styles.label}>
                    Name <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                    {...register("name")}
                  />
                  {errors.name && (
                    <span id="contact-name-error" role="alert" className={styles.errorText}>
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="contact-email" className={styles.label}>
                    Email <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    {...register("email")}
                  />
                  {errors.email && (
                    <span id="contact-email-error" role="alert" className={styles.errorText}>
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="contact-subject" className={styles.label}>
                  Subject <span className={styles.optionalTag}>(Optional)</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="Internship role, project collaboration, or inquiry"
                  className={`${styles.input} ${errors.subject ? styles.inputError : ""}`}
                  aria-invalid={errors.subject ? "true" : "false"}
                  aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                  {...register("subject")}
                />
                {errors.subject && (
                  <span id="contact-subject-error" role="alert" className={styles.errorText}>
                    {errors.subject.message}
                  </span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="contact-message" className={styles.label}>
                    Message <span className={styles.requiredMark}>*</span>
                  </label>
                  <span className={styles.charCount}>
                    {messageValue.length} / 2000
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell me about the role, team, or problem you are working on..."
                  className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                  aria-invalid={errors.message ? "true" : "false"}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  {...register("message")}
                />
                {errors.message && (
                  <span id="contact-message-error" role="alert" className={styles.errorText}>
                    {errors.message.message}
                  </span>
                )}
              </div>

              <div className={styles.submitRow}>
                <motion.button
                  type="submit"
                  className={`${styles.submitBtn} contact-submit-btn`}
                  disabled={isSubmitting}
                  whileHover={reducedMotion ? undefined : { y: -1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                >
                  <Send size={15} aria-hidden="true" />
                  <span>
                    {isSubmitting
                      ? CONTACT_COPY.formSubmitPending
                      : CONTACT_COPY.formSubmitIdle}
                  </span>
                </motion.button>

                <p className={styles.privacyNote}>{CONTACT_COPY.formPrivacyNote}</p>
              </div>

              {/* Framer Motion Status Banner (`.contact-form-feedback`) */}
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={`${feedback.kind}-${feedback.title}`}
                    role={feedback.kind === "success" ? "status" : "alert"}
                    aria-live="polite"
                    className={`${styles.feedbackBanner} ${styles[`feedback_${feedback.kind}`]} contact-form-feedback`}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className={styles.feedbackIcon} aria-hidden="true">
                      {feedback.kind === "success" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <AlertCircle size={18} />
                      )}
                    </span>
                    <div className={styles.feedbackBody}>
                      <strong className={styles.feedbackTitle}>{feedback.title}</strong>
                      <p className={styles.feedbackDetail}>{feedback.detail}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
