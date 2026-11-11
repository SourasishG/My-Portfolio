"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/gsap";
import { SectionId, useSceneStore } from "@/lib/store";

const ORDERED_SECTIONS: SectionId[] = [
  "hero",
  "about",
  "projects",
  "toolkit",
  "journey",
  "beyond",
  "aspirations",
  "contact",
];

/**
 * Resolves the single active home section strictly from current DOM bounding geometry
 * along an upper-mid viewport probe line (`42%` of viewport height).
 * Avoids multi-trigger overlap and stale pin-spacer offsets across instant jumps,
 * Lenis smooth scrolling, native reduced-motion scroll, and resize/refresh passes.
 */
function syncActiveSection() {
  if (typeof window === "undefined" || window.location.pathname !== "/") return;

  const store = useSceneStore.getState();

  if (window.scrollY <= 8) {
    store.setActiveSection("hero");
    return;
  }

  const probeY = Math.round(window.innerHeight * 0.42);
  let matched: SectionId | null = null;
  let lastPassedReal: SectionId | null = null;

  for (const id of ORDERED_SECTIONS) {
    const el = document.getElementById(id);
    if (!el || el.dataset.stagingSentinel === "true") continue;

    const rect = el.getBoundingClientRect();
    if (rect.top <= probeY) {
      lastPassedReal = id;
    }
    if (rect.top <= probeY && rect.bottom > probeY) {
      matched = id;
      break;
    }
  }

  if (matched) {
    store.setActiveSection(matched);
  } else if (lastPassedReal) {
    store.setActiveSection(lastPassedReal);
  }
}

/**
 * Single Lenis smooth-scroll owner synced 1:1 with `gsap.ticker` + ScrollTrigger.
 * Also owns deterministic viewport-probe active-section synchronization on `/`.
 * Feeds transient scroll & pointer telemetry into `useSceneStore` with zero React re-renders.
 * Lenis is completely bypassed under `prefers-reduced-motion: reduce`.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLabRoute = pathname?.startsWith("/lab") ?? false;
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  // Sync active section immediately upon client route transitions onto "/"
  useEffect(() => {
    if (pathname !== "/") return;
    const rafId = window.requestAnimationFrame(syncActiveSection);
    return () => window.cancelAnimationFrame(rafId);
  }, [pathname]);

  // Fine-pointer telemetry -> Zustand transient pointer coordinates
  useEffect(() => {
    if (isLabRoute) return;
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
  }, [isLabRoute]);

  // Single Lenis instance synced with GSAP ticker + activeSection geometry observer
  useEffect(() => {
    if (isLabRoute) return;
    ensureGsapRegistered();

    const onRefresh = () => syncActiveSection();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    window.addEventListener("resize", syncActiveSection, { passive: true });
    const initialRaf = window.requestAnimationFrame(syncActiveSection);

    if (reducedMotion) {
      const onNativeScroll = () => {
        const docHeight = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const y = window.scrollY;
        useSceneStore.getState().setScrollState(y, Math.min(1, Math.max(0, y / docHeight)), 0);
        syncActiveSection();
      };
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      return () => {
        window.cancelAnimationFrame(initialRaf);
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        window.removeEventListener("resize", syncActiveSection);
        window.removeEventListener("scroll", onNativeScroll);
      };
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
      syncActiveSection();
    });

    // Ensure instant programmatic window.scrollTo jumps sync active section immediately too
    window.addEventListener("scroll", syncActiveSection, { passive: true });

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
      window.cancelAnimationFrame(initialRaf);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.removeEventListener("resize", syncActiveSection);
      window.removeEventListener("scroll", syncActiveSection);
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isLabRoute, reducedMotion]);

  return <>{children}</>;
}
