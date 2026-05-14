"use client";

// Wraps the app in Lenis smooth scroll. Skipped entirely when prefers-reduced-motion is set.
// GSAP's ticker drives Lenis (replaces manual RAF) so ScrollTrigger reads Lenis's
// smoothed scroll position — required for StickySection's scrub-based content pan.
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ lerp: 0.1 });

    // Feed Lenis's smoothed position to ScrollTrigger on every scroll tick
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP ticker drives Lenis — no manual RAF loop needed
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);

    // Disable GSAP lag-smoothing so it doesn't fight Lenis's own lerp
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
