"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { useLanguage } from "@/i18n/LanguageProvider";
import { introSession, useIntro } from "@/lib/intro";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { createLiquidGold, type LiquidGold } from "@/lib/liquidGold";
import { site } from "@/config/site";

type Mode = "pending" | "webgl" | "fallback" | "reduced";

/**
 * Cinematic 3–4 s intro: a liquid-gold wave reveals the DIGITAL STUDIO title,
 * then a second wave washes it away to reveal the site.
 * - WebGL shader with GSAP-driven timeline
 * - DOM/CSS fallback when WebGL is unavailable
 * - prefers-reduced-motion: short static title, then a gentle fade
 * - Skip button + Escape key
 */
export default function Intro() {
  const { t } = useLanguage();
  const { setReady } = useIntro();
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<Mode>("pending");
  const [showSkip, setShowSkip] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fbTitleRef = useRef<HTMLDivElement>(null);
  const fbBand1Ref = useRef<HTMLDivElement>(null);
  const fbBand2Ref = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const stopRef = useRef<() => void>(() => {});
  const goldRef = useRef<LiquidGold | null>(null);
  const finishedRef = useRef(false);
  const lockedRef = useRef(false);
  const taglineRef = useRef(t.intro.tagline);
  taglineRef.current = t.intro.tagline;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    tlRef.current?.kill();
    try {
      window.sessionStorage.setItem("ds-intro-seen", "1");
    } catch {
      /* storage unavailable */
    }
    if (lockedRef.current) {
      lockedRef.current = false;
      unlockScroll();
    }
    setReady(true);
    const overlay = overlayRef.current;
    const done = () => {
      stopRef.current();
      setVisible(false);
    };
    if (overlay) gsap.to(overlay, { autoAlpha: 0, duration: 0.5, ease: "power2.out", onComplete: done });
    else done();
  }, [setReady]);

  useEffect(() => {
    finishedRef.current = false;

    let seenThisSession = false;
    try {
      seenThisSession = window.sessionStorage.getItem("ds-intro-seen") === "1";
    } catch {
      /* storage unavailable */
    }
    if (introSession.played || seenThisSession) {
      introSession.played = true;
      setVisible(false);
      setReady(true);
      return;
    }
    introSession.played = true;
    // Visitors arriving on a deep link (e.g. /#contact) go straight to the content
    if (window.location.hash && window.location.hash !== "#top") {
      setVisible(false);
      setReady(true);
      return;
    }

    lockScroll();
    lockedRef.current = true;
    const release = () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        unlockScroll();
      }
    };
    const skipTimer = window.setTimeout(() => setShowSkip(true), 350);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setMode("reduced");
      const id = window.setTimeout(finish, 1100);
      return () => {
        window.clearTimeout(id);
        window.clearTimeout(skipTimer);
        window.removeEventListener("keydown", onKey);
        release();
        if (!finishedRef.current) introSession.played = false;
      };
    }

    let cancelled = false;
    let raf = 0;
    let gold: LiquidGold | null = null;
    const state = { time: 0, p1: 0, p2: 0 };
    const onResize = () => gold?.resize();

    const start = async () => {
      const family =
        getComputedStyle(document.documentElement).getPropertyValue("--font-cormorant").trim() ||
        "'Cormorant Garamond', Georgia, serif";
      try {
        await Promise.race([
          document.fonts.load(`300 80px ${family}`),
          new Promise((resolve) => window.setTimeout(resolve, 450)),
        ]);
      } catch {
        /* continue with fallback font */
      }
      if (cancelled) return;

      const canvas = canvasRef.current;
      gold = canvas
        ? createLiquidGold(canvas, { title: site.name, tagline: taglineRef.current, fontFamily: family })
        : null;

      const tl = gsap.timeline({ onComplete: finish });
      tlRef.current = tl;

      if (gold) {
        setMode("webgl");
        goldRef.current = gold;
        const g = gold;
        const t0 = performance.now();
        const tick = () => {
          // Freeze on the last frame once finished/skipped so the fade-out stays smooth
          if (finishedRef.current) return;
          state.time = (performance.now() - t0) / 1000;
          g.render(state);
          raf = requestAnimationFrame(tick);
        };
        tick();
        stopRef.current = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", onResize);
          goldRef.current = null;
          gold = null;
          g.destroy();
        };
        window.addEventListener("resize", onResize);
        tl.to(state, { p1: 1, duration: 1.65, ease: "power2.inOut" }, 0.1)
          .to(state, { p2: 1, duration: 1.45, ease: "power2.in" }, 2.15)
          .to({}, { duration: 0.05 });
      } else {
        setMode("fallback");
        const band1 = fbBand1Ref.current;
        const band2 = fbBand2Ref.current;
        const title = fbTitleRef.current;
        const overlay = overlayRef.current;
        if (!band1 || !band2 || !title || !overlay) {
          finish();
          return;
        }
        tl.fromTo(band1, { top: "105%" }, { top: "-80%", duration: 1.6, ease: "power2.inOut" }, 0.1)
          .fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, 0.75)
          .fromTo(band2, { top: "105%" }, { top: "-80%", duration: 1.45, ease: "power2.in" }, 2.1)
          .to(title, { autoAlpha: 0, duration: 0.35 }, 2.75)
          .to(overlay, { backgroundColor: "rgba(9,9,9,0)", duration: 0.5 }, 2.9);
      }
    };
    start();

    return () => {
      cancelled = true;
      window.clearTimeout(skipTimer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      tlRef.current?.kill();
      cancelAnimationFrame(raf);
      gold?.destroy();
      goldRef.current = null;
      release();
      // Unmounted before finishing (incl. React Strict Mode's dev double-run): allow it to play again
      if (!finishedRef.current) introSession.played = false;
    };
  }, [finish, setReady]);

  // Keep the WebGL title texture in the active language
  useEffect(() => {
    goldRef.current?.setTagline(t.intro.tagline);
  }, [t.intro.tagline]);

  useEffect(() => {
    if (showSkip) skipRef.current?.focus({ preventScroll: true });
  }, [showSkip]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      data-intro
      className={`fixed inset-0 z-[100] overflow-hidden ${mode === "webgl" ? "bg-transparent" : "bg-obsidian"}`}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />

      {/* DOM fallback + reduced-motion title */}
      <div
        ref={fbTitleRef}
        aria-hidden
        className={`pointer-events-none absolute inset-0 grid place-items-center px-6 text-center transition-opacity duration-700 ${
          mode === "reduced" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div>
          <p className="display text-[clamp(2.8rem,10vw,9rem)] tracking-[0.06em] text-ivory">{site.name}</p>
          <span className="mx-auto mt-6 block h-px w-24 bg-gold/70" />
          <p className="mt-5 text-[0.7rem] uppercase tracking-[0.38em] text-gold">{t.intro.tagline}</p>
        </div>
      </div>
      {mode !== "webgl" && mode !== "reduced" && (
        <>
          <FallbackBand refEl={fbBand1Ref} />
          <FallbackBand refEl={fbBand2Ref} />
        </>
      )}

      <button
        ref={skipRef}
        type="button"
        onClick={finish}
        className={`absolute bottom-6 right-6 z-10 inline-flex items-center gap-3 border border-ivory/20 bg-obsidian/40 px-5 py-3 text-[0.68rem] uppercase tracking-[0.28em] text-ivory/80 backdrop-blur-md transition-all duration-500 hover:border-gold hover:text-gold sm:bottom-10 sm:right-10 ${
          showSkip ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {t.intro.skip}
        <span aria-hidden className="text-gold">→</span>
      </button>
    </div>
  );
}

function FallbackBand({ refEl }: { refEl: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={refEl} aria-hidden className="absolute inset-x-0 h-[75vh]" style={{ top: "105%" }}>
      <svg className="absolute -top-[39px] left-0 h-10 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
        <path
          d="M0 40 C 180 0, 360 0, 540 20 S 900 40, 1080 16 S 1320 0, 1440 22 L1440 40 Z"
          fill="#c9ad74"
        />
      </svg>
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(180deg,#c9ad74 0%,#e9d7a8 12%,#a8854c 32%,#d9c08a 52%,#7d6131 74%,#b89b65 100%)",
        }}
      />
    </div>
  );
}
