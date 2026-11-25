"use client";

import { useRef, useState, type ComponentProps, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { LOCALES, useLanguage, getDictionary } from "@/i18n/LanguageProvider";
import { unsplashLoader, unsplashSrc } from "@/lib/images";
import type { PhotoKey } from "@/config/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Subtle fade-and-rise on scroll into view. Respects reduced motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  y = 32,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "header" | "section";
  y?: number;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as unknown as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.4 : 1.1, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

type Part = { text: string; em?: boolean };

/**
 * Word-by-word text reveal (each word rises from a mask).
 * `play` lets a parent control timing (e.g. hero waits for the intro); otherwise it plays in view.
 * A part ending with "-" joins the next part without a space (e.g. "Концепт-" + "проєкти.").
 */
export function SplitText({
  parts,
  className = "",
  delay = 0,
  stagger = 0.06,
  play,
}: {
  parts: Part[];
  className?: string;
  delay?: number;
  stagger?: number;
  play?: boolean;
}) {
  const reduce = useReducedMotion();
  const words: { w: string; em?: boolean; space: boolean }[] = [];
  parts.forEach((p, pi) => {
    const list = p.text.split(/\s+/).filter(Boolean);
    list.forEach((w, wi) => {
      const lastOfPart = wi === list.length - 1;
      const joinNext = lastOfPart && w.endsWith("-") && pi < parts.length - 1;
      words.push({ w, em: p.em, space: !joinNext });
    });
  });
  const controlled = play !== undefined;
  const anim = { opacity: 1, y: "0%" };
  return (
    <span className={className}>
      <span>
        {words.map(({ w, em, space }, idx) => (
          <span key={idx} className="-mb-[0.12em] inline-block overflow-hidden whitespace-pre pb-[0.12em] align-top">
            <motion.span
              className={`inline-block ${em ? "text-gold-gradient animate-shimmer italic" : ""}`}
              initial={{ opacity: reduce ? 0 : 1, y: reduce ? "0%" : "110%" }}
              {...(controlled
                ? { animate: play ? anim : undefined }
                : { whileInView: anim, viewport: { once: true, margin: "0px 0px -8% 0px" } })}
              transition={{ duration: reduce ? 0.4 : 1.05, ease: EASE, delay: delay + idx * stagger }}
            >
              {w}
            </motion.span>
            {space ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Section heading: eyebrow + word-revealed display title (second part gold italic). */
export function SectionHeading({
  eyebrow,
  title,
  emphasis,
  id,
  className = "",
  size = "text-[clamp(2.5rem,6vw,5.6rem)]",
}: {
  eyebrow: string;
  title: string;
  emphasis: string;
  id?: string;
  className?: string;
  size?: string;
}) {
  return (
    <header className={className}>
      <Reveal y={12}>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <h2 id={id} className={`display mt-6 text-ivory ${size}`}>
        <SplitText parts={[{ text: title }, { text: emphasis, em: true }]} />
      </h2>
    </header>
  );
}

/** Next/Image wrapper for Unsplash photography with a graceful fallback panel. */
export function Photo({
  photo,
  alt,
  sizes,
  className = "",
  priority = false,
}: {
  photo: PhotoKey;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-start justify-end bg-[radial-gradient(120%_90%_at_20%_10%,#2a2419_0%,#141210_45%,#090909_100%)] p-5 ${className}`}
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivory/30">{t.media.imageUnavailable}</span>
      </div>
    );
  }

  return (
    <Image
      src={unsplashSrc(photo)}
      loader={unsplashLoader}
      alt={alt}
      fill
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

/** Image container that reveals with a vertical curtain (clip-path) when scrolled into view. */
export function RevealMask({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.4 : 1.4, ease: [0.76, 0, 0.24, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Pulls its child gently towards the pointer (desktop only). */
export function Magnetic({ children, strength = 0.32, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: ReactPointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x: sx, y: sy }} className={`inline-flex ${className}`}>
      {children}
    </motion.span>
  );
}

/** Link to a home-page section that works from every page (smooth scroll on the home page). */
export function SectionLink({ id, children, ...rest }: { id: string } & Omit<ComponentProps<"a">, "href">) {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const home = `/${locale}`;
  const href = `${home}#${id}`;
  if (pathname === home) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

/** UA / EN / DE switcher with flags. */
export function LanguageSwitcher({ className = "", onChange, flags = true }: { className?: string; onChange?: () => void; flags?: boolean }) {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div role="group" aria-label={t.nav.language} className={`flex items-center gap-1 ${className}`}>
      {LOCALES.map((code, i) => {
        const dict = getDictionary(code);
        const active = code === locale;
        return (
          <span key={code} className="flex items-center">
            {i > 0 && <span aria-hidden className="mx-1 h-3 w-px bg-ivory/20" />}
            <button
              type="button"
              lang={code}
              aria-pressed={active}
              aria-label={dict.meta.langName}
              title={dict.meta.langName}
              onClick={() => {
                setLocale(code);
                onChange?.();
              }}
              className={`flex items-center gap-1.5 px-1.5 py-1 text-[0.68rem] font-medium tracking-[0.18em] transition-colors duration-300 ${
                active ? "text-gold" : "text-ivory/55 hover:text-ivory"
              }`}
            >
              {flags && (
                <span aria-hidden className={`text-[0.85rem] leading-none transition-opacity ${active ? "opacity-100" : "opacity-60"}`}>
                  {dict.meta.flag}
                </span>
              )}
              {dict.meta.short}
            </button>
          </span>
        );
      })}
    </div>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 12" className={`h-3 w-6 ${className}`} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 6h22M17 1l5 5-5 5" />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3.5 6l8.5 7 8.5-7" />
    </svg>
  );
}

export function TelegramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M21 4L3 11l6 2.2L18 7l-7 7.6.3 5.4 3-3.8 4.2 3.1z" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M5 3.5h3.5l1.8 4.4-2.3 1.4a11 11 0 005.7 5.7l1.4-2.3 4.4 1.8V18a2.5 2.5 0 01-2.5 2.5C10.4 20.5 3.5 13.6 3.5 6A2.5 2.5 0 015 3.5z" />
    </svg>
  );
}
