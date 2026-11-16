"use client";

import { useEffect } from "react";
import { useSceneStore } from "@/lib/store";

/**
 * Editorial preloader: marks initialization done immediately so FCP, LCP,
 * Speed Index, and interactive DOM are unhindered by full-screen overlays.
 */
export function Preloader() {
  const setPreloaderDone = useSceneStore((s) => s.setPreloaderDone);

  useEffect(() => {
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  return null;
}
