import type Lenis from "lenis";

/**
 * Shared scroll controller. Works with Lenis smooth scrolling when it is
 * active, and falls back to native scrolling (e.g. reduced motion).
 */
let lenis: Lenis | null = null;
let locks = 0;
let pending: (() => void) | null = null;

export const HEADER_OFFSET = 84;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

export function lockScroll() {
  locks += 1;
  document.body.classList.add("is-locked");
  lenis?.stop();
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.body.classList.remove("is-locked");
    lenis?.start();
    if (pending) {
      const run = pending;
      pending = null;
      requestAnimationFrame(() => run());
    }
  }
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Smoothly scroll to a section id ("top" scrolls to the very top). Returns false if the target does not exist. */
export function scrollToId(id: string, { immediate = false }: { immediate?: boolean } = {}) {
  if (id !== "top" && id !== "" && !document.getElementById(id)) return false;
  // Scrolling is locked (menu/intro open): run as soon as it is released
  if (locks > 0) {
    pending = () => scrollToId(id, { immediate });
    return true;
  }
  if (id === "top" || id === "") {
    if (lenis) lenis.scrollTo(0, { immediate, duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: immediate || prefersReducedMotion() ? "auto" : "smooth" });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) {
    lenis.scrollTo(el, { offset: -HEADER_OFFSET, immediate, duration: 1.4 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? "auto" : "smooth" });
  }
  return true;
}
