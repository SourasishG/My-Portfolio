"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let isRegistered = false;

/**
 * Registers GSAP plugins exactly once on the client.
 * Prevents duplicate plugin registrations across React 19 StrictMode mounts.
 */
export function ensureGsapRegistered() {
  if (typeof window === "undefined" || isRegistered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  isRegistered = true;
}

export { gsap, ScrollTrigger, SplitText };
