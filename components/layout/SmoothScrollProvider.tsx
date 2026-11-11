"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";

/**
 * Single Lenis smooth-scroll owner synced 1:1 with `gsap.ticker` + ScrollTrigger.
 * Feeds transient scroll & pointer telemetry into `useSceneStore` with zero React re-renders.
 * Completely bypassed under `prefers-reduced-motion: reduce`.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  // Fine-pointer telemetry -> Zustand transient pointer coordinates
  useEffect(() => {
    const fineMq = window.matchMedia("(pointer: fine)");
    if (!fineMq.matches) return;

    const handlePointerMove = (e: PointerEvent) => {
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const nx = (e.clientX / vw) * 2 - 1;
      const ny = -((e.clientY / vh) * 2 - 1);
      useSceneStore.getState().setPointer(nx, ny);
    };

    const handlePointerLeave = () => {
      useSceneStore.getState().setPointer(0, 0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  // Single Lenis instance synced with GSAP ticker
  useEffect(() => {
    ensureGsapRegistered();

    if (reducedMotion) {
      const onNativeScroll = () => {
        const docHeight = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const y = window.scrollY;
        useSceneStore.getState().setScrollState(y, Math.min(1, Math.max(0, y / docHeight)), 0);
      };
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      return () => window.removeEventListener("scroll", onNativeScroll);
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (instance: Lenis) => {
      ScrollTrigger.update();
      const maxScroll = Math.max(1, instance.limit || 1);
      const progress = Math.min(1, Math.max(0, instance.scroll / maxScroll));
      const clampedVelocity = Math.max(-1.5, Math.min(1.5, instance.velocity / 20));
      useSceneStore.getState().setScrollState(instance.scroll, progress, clampedVelocity);
    });

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Smooth anchor navigation when clicking #section links on main landing route
    const onAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const pathPart = href.slice(0, hashIndex);
      if (pathPart && pathPart !== "/" && pathPart !== window.location.pathname) {
        return;
      }

      const hashId = href.slice(hashIndex + 1);
      if (!hashId) return;

      const destEl = document.getElementById(hashId);
      if (destEl) {
        event.preventDefault();
        lenis.scrollTo(destEl, { offset: hashId === "hero" ? 0 : -64 });
      }
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
