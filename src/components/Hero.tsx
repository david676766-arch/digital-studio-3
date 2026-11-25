"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useIntro } from "@/lib/intro";
import { createGoldSilk } from "@/lib/goldSilk";
import { heroVideo } from "@/config/site";
import { Arrow, Magnetic, Photo, SectionLink, SplitText } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;
type Mode = "silk" | "video" | "photo";

export default function Hero() {
  const { t } = useLanguage();
  const { ready } = useIntro();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("silk");
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  playingRef.current = playing;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-14%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // WebGL golden silk (falls back to the looping video, then to a photograph)
  useEffect(() => {
    if (mode !== "silk") return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const silk = createGoldSilk(canvas, coarse ? 0.55 : 0.75);
    if (!silk) {
      setMode("video");
      return;
    }

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      const draw = () => {
        silk.resize();
        silk.render(18, [0.5, 0.2], 0);
      };
      draw();
      window.addEventListener("resize", draw);
      return () => {
        window.removeEventListener("resize", draw);
        silk.destroy();
      };
    }

    let raf = 0;
    let visible = true;
    let time = 4;
    let last = performance.now();
    const target: [number, number] = [0.6, 0.1];
    const mouse: [number, number] = [0.6, 0.1];
    let amt = 0;
    let amtTarget = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const [x, y] = silk.toSilkSpace(e.clientX, e.clientY);
      target[0] = x;
      target[1] = y;
      amtTarget = 1;
    };
    const onLeave = () => {
      amtTarget = 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(section);
    const onResize = () => silk.resize();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden && playingRef.current) {
        time += dt;
        mouse[0] += (target[0] - mouse[0]) * 0.05;
        mouse[1] += (target[1] - mouse[1]) * 0.05;
        amt += (amtTarget - amt) * 0.03;
        silk.render(time, mouse, amt);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      silk.destroy();
    };
  }, [mode]);

  // Video fallback: no autoplay for reduced motion / data saver
  useEffect(() => {
    if (mode !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData) {
      video.pause();
      setPlaying(false);
      return;
    }
    video.play().catch(() => setPlaying(false));
  }, [mode, reduce]);

  const togglePlay = () => {
    if (mode === "video") {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) video.play().then(() => setPlaying(true)).catch(() => setMode("photo"));
      else {
        video.pause();
        setPlaying(false);
      }
      return;
    }
    setPlaying((p) => !p);
  };

  return (
    <section ref={sectionRef} id="top" aria-labelledby="hero-title" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-obsidian">
      <motion.div style={{ y: mediaY }} className="absolute inset-0 -top-[2%] h-[106%]">
        {mode === "silk" && <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />}
        {mode === "video" && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroVideo.poster}
            aria-hidden
            onError={() => setMode("photo")}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            {heroVideo.sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} onError={() => setMode("photo")} />
            ))}
          </video>
        )}
        {mode === "photo" && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="animate-kenburns absolute inset-0">
              <Photo photo="heroFallback" alt="" sizes="100vw" priority />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/55 via-transparent to-obsidian" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/75 via-obsidian/15 to-transparent" />
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 top-20 hairline opacity-40" />

      <motion.div style={{ y: contentY, opacity: fade }} className="container-luxe relative flex h-full flex-col justify-end pb-[clamp(5.5rem,13vh,9rem)]">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 1, delay: 0.1 }}
        >
          {t.hero.eyebrow}
        </motion.p>

        <h1 id="hero-title" className="display mt-7 max-w-[16ch] text-[clamp(2.9rem,8.2vw,8.6rem)] text-ivory">
          <SplitText
            key={t.hero.titleA}
            parts={[{ text: t.hero.titleA }, { text: t.hero.titleB }, { text: t.hero.titleEmphasis, em: true }]}
            play={ready}
            delay={0.15}
            stagger={0.08}
          />
        </h1>

        <div className="mt-10 flex flex-col gap-9 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-xl text-[0.98rem] leading-relaxed text-ivory/70 md:text-[1.05rem]"
            initial={{ y: reduce ? 0 : 16 }}
            animate={ready ? { y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: 0.7 }}
          >
            {t.hero.lead}
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-x-7 gap-y-4"
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: 0.85 }}
          >
            <Magnetic>
              <SectionLink id="contact" className="btn-gold btn-lg">
                {t.hero.cta}
                <Arrow />
              </SectionLink>
            </Magnetic>
            <SectionLink id="services" className="btn-ghost">
              {t.hero.secondary}
            </SectionLink>
          </motion.div>
        </div>
      </motion.div>

      <div className="container-luxe pointer-events-none absolute inset-x-0 bottom-6 flex items-end justify-between">
        <SectionLink
          id="services"
          className="pointer-events-auto hidden flex-col items-center gap-3 text-[0.6rem] uppercase tracking-[0.35em] text-ivory/50 transition-colors hover:text-gold md:flex"
        >
          <span>{t.hero.scroll}</span>
          <span className="relative block h-10 w-px overflow-hidden bg-ivory/15">
            <span className="animate-scrollcue absolute inset-0 bg-gold" />
          </span>
        </SectionLink>
        {mode !== "photo" && !reduce && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? t.hero.pauseVideo : t.hero.playVideo}
            title={playing ? t.hero.pauseVideo : t.hero.playVideo}
            className="pointer-events-auto ml-auto grid h-10 w-10 place-items-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
          >
            {playing ? (
              <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
                <rect x="2" y="1" width="2.5" height="10" />
                <rect x="7.5" y="1" width="2.5" height="10" />
              </svg>
            ) : (
              <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
                <path d="M3 1.5v9l7-4.5z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
