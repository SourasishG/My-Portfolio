"use client";

import React, { useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./MagneticButton.module.scss";

type BaseProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "icon";
  className?: string;
  strength?: number;
  ariaLabel?: string;
  cursorTag?: string;
};

type AnchorVariantProps = BaseProps & {
  href: string;
  external?: boolean;
  download?: boolean | string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

type ButtonVariantProps = BaseProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export type MagneticButtonProps = AnchorVariantProps | ButtonVariantProps;

const SPRING_CONFIG = { stiffness: 320, damping: 24, mass: 0.45 };

/**
 * Interactive button owned strictly by Framer Motion (never paired with GSAP on transform/scale).
 * Applies a restrained pointer magnetic pull on hover-capable desktop pointers and falls back
 * cleanly to a static tactile focus/hover state on touch or `prefers-reduced-motion: reduce`.
 */
export function MagneticButton(props: MagneticButtonProps) {
  const {
    children,
    variant = "secondary",
    className = "",
    strength = 0.24,
    ariaLabel,
    cursorTag = "pointer",
  } = props;

  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, SPRING_CONFIG);
  const springY = useSpring(rawY, SPRING_CONFIG);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || e.pointerType === "touch") return;
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      rawX.set(Math.max(-10, Math.min(10, dx * strength)));
      rawY.set(Math.max(-10, Math.min(10, dy * strength)));
    },
    [rawX, rawY, reducedMotion, strength]
  );

  const handlePointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const variantClass = styles[variant] ?? styles.secondary;
  const combinedClass = `${styles.control} ${variantClass} ${className}`.trim();

  return (
    <motion.div
      ref={wrapperRef}
      className={styles.wrapper}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-cursor={cursorTag}
    >
      {props.href !== undefined ? (
        props.external || props.download ? (
          <a
            href={props.href}
            className={combinedClass}
            aria-label={ariaLabel}
            download={props.download}
            target={props.external ? "_blank" : undefined}
            rel={props.external ? "noopener noreferrer" : undefined}
            onClick={props.onClick}
          >
            {children}
          </a>
        ) : (
          <Link
            href={props.href}
            className={combinedClass}
            aria-label={ariaLabel}
            onClick={props.onClick}
          >
            {children}
          </Link>
        )
      ) : (
        <button
          type={props.type ?? "button"}
          className={combinedClass}
          aria-label={ariaLabel}
          disabled={props.disabled}
          onClick={props.onClick}
        >
          {children}
        </button>
      )}
    </motion.div>
  );
}
