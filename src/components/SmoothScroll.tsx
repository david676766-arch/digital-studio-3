"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerLenis, scrollToId } from "@/lib/scroll";

/**
 * Lenis smooth scrolling (disabled for reduced motion and touch-only devices,
 * where native scrolling feels better) + smooth in-page anchor navigation.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (document.body.classList.contains("is-locked")) lenis.stop();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  // Smooth scroll for same-page anchors: "#id" and "/#id" while on the home page
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const raw = a.getAttribute("href") ?? "";
      if (!raw.includes("#")) return;
      const url = new URL(raw, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search) return;
      const id = decodeURIComponent(url.hash.slice(1));
      if (scrollToId(id)) {
        e.preventDefault();
        window.history.pushState(null, "", id === "top" ? window.location.pathname : `#${id}`);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // When arriving on the home page with a hash (e.g. from a project page), scroll to it
  useEffect(() => {
    if (!/^\/(en|de|uk)\/?$/.test(pathname) || !window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const t = window.setTimeout(() => scrollToId(id, { immediate: true }), 60);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
