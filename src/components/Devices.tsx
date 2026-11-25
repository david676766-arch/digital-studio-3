"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ConceptProject } from "@/config/site";
import { Photo } from "./ui";

/* ------------------------------------------------------------------ */
/* Device frames (pure CSS — no images)                                */
/* ------------------------------------------------------------------ */

export function MacBook({ children, className = "" }: { children: ReactNode; className?: string }) {
  // Horizontal padding contains the wider base, so the device never overflows its column
  return (
    <div className={`relative px-[6%] ${className}`}>
      <div className="relative rounded-t-[2.4%_3.6%] border border-white/10 bg-[#0c0c0d] p-[1.5%] pb-[2.2%] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.9)]">
        <span aria-hidden className="absolute left-1/2 top-[0.55%] h-[0.9%] w-[0.9%] -translate-x-1/2 rounded-full bg-[#1d1d20]" />
        <div className="relative aspect-[16/10] overflow-hidden rounded-[0.35%] bg-black [container-type:inline-size]">
          {children}
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0)_38%)]" />
        </div>
      </div>
      <div aria-hidden className="relative -mx-[6.5%]">
        <div className="rounded-b-[30%_100%] bg-gradient-to-b from-[#3b3b3e] via-[#232325] to-[#121213] pb-[2.3%]" />
        <span className="absolute left-1/2 top-0 h-[42%] w-[13%] -translate-x-1/2 rounded-b-[40%] bg-[#141415]" />
      </div>
    </div>
  );
}

export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[15%_/_7%] bg-[#0b0b0c] p-[3.4%] shadow-[0_40px_70px_-30px_rgba(0,0,0,0.95)] ring-1 ring-white/15 ${className}`}>
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[12%_/_5.6%] bg-black [container-type:inline-size]">
        {children}
        <span aria-hidden className="absolute left-1/2 top-[1.6%] z-10 h-[3.3%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_40%)]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Concept website screens                                             */
/* ------------------------------------------------------------------ */

const cq = (n: number): CSSProperties => ({ fontSize: `${n}cqw` });
const SERIF = "var(--font-cormorant), Georgia, serif";
const SANS = "var(--font-manrope), system-ui, sans-serif";

type ScreenProps = { project: ConceptProject; view?: "home" | "detail" | "contact" };

/** Scrollable screen content: scrolls to its bottom when the surrounding `.device-group` is hovered. */
function Scroller({ children, screenH, bg }: { children: ReactNode; screenH: string; bg: string }) {
  return (
    <div lang="en" className="screen-scroll absolute inset-x-0 top-0" style={{ "--screen-h": screenH, background: bg } as CSSProperties}>
      {children}
    </div>
  );
}

function Lines({ n, color, widths = [100, 92, 76, 60] }: { n: number; color: string; widths?: number[] }) {
  return (
    <div className="space-y-[0.9em]">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-[0.42em] rounded-full" style={{ width: `${widths[i % widths.length]}%`, background: color, opacity: 0.28 }} />
      ))}
    </div>
  );
}

function Shot({ project, which, position = "center", className = "" }: { project: ConceptProject; which: "hero" | "second"; position?: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: project.theme.surface }}>
      <div className="absolute inset-0" style={{ objectPosition: position }}>
        <Photo photo={which === "hero" ? project.hero : project.second} alt="" sizes="(min-width: 1024px) 40vw, 70vw" className="[object-position:inherit]" />
      </div>
    </div>
  );
}

export function DesktopScreen({ project, view = "home" }: ScreenProps) {
  const th = project.theme;
  const head = th.serif ? SERIF : SANS;
  const nav = (
    <div className="flex items-center justify-between" style={{ height: "6cqw", padding: "0 4cqw", borderBottom: `1px solid ${th.fg}14` }}>
      <span style={{ ...cq(1.35), fontFamily: head, letterSpacing: "0.22em", fontWeight: th.serif ? 500 : 700 }}>{th.brand}</span>
      <span className="flex items-center" style={{ gap: "2.6cqw", ...cq(0.95), color: th.muted }}>
        {th.nav.map((n) => (
          <span key={n}>{n}</span>
        ))}
        <span style={{ border: `1px solid ${th.accent}`, color: th.fg, padding: "0.5cqw 1.3cqw", borderRadius: "99px" }}>{th.cta}</span>
      </span>
    </div>
  );

  if (view === "detail") {
    return (
      <Scroller screenH="62.5cqw" bg={th.bg}>
        <div style={{ color: th.fg, fontFamily: SANS, height: "100cqw" }}>
          {nav}
          <div className="grid grid-cols-2" style={{ height: "52cqw" }}>
            <Shot project={project} which="second" className="h-full" />
            <div className="flex flex-col justify-center" style={{ padding: "0 5cqw", gap: "1.6cqw" }}>
              <span style={{ ...cq(0.85), letterSpacing: "0.3em", color: th.accent, textTransform: "uppercase" }}>N°02 — {th.nav[0]}</span>
              <span style={{ ...cq(3.4), fontFamily: head, lineHeight: 1.05 }}>{th.headline}</span>
              <div style={cq(1.1)}>
                <Lines n={4} color={th.fg} />
              </div>
              <div className="flex" style={{ gap: "0.8cqw", marginTop: "1cqw" }}>
                {project.palette.map((p) => (
                  <span key={p.hex} className="rounded-full" style={{ width: "2.2cqw", height: "2.2cqw", background: p.hex, border: `1px solid ${th.fg}22` }} />
                ))}
              </div>
              <span className="self-start" style={{ background: th.accent, color: th.bg, ...cq(1), padding: "1cqw 2.4cqw", marginTop: "1cqw", letterSpacing: "0.12em" }}>{th.cta}</span>
            </div>
          </div>
          <div className="grid grid-cols-3" style={{ gap: "1.4cqw", padding: "3cqw 4cqw", height: "34cqw" }}>
            <Shot project={project} which="hero" position="30% 50%" className="h-full" />
            <div className="flex flex-col justify-end" style={{ background: th.surface, padding: "2cqw" }}>
              <span style={{ ...cq(1.8), fontFamily: head }}>{th.brand}</span>
              <div style={{ ...cq(1), marginTop: "1cqw" }}>
                <Lines n={3} color={th.fg} />
              </div>
            </div>
            <Shot project={project} which="second" position="70% 40%" className="h-full" />
          </div>
          <div className="flex items-center justify-between" style={{ height: "8cqw", padding: "0 4cqw", ...cq(0.9), color: th.muted, borderTop: `1px solid ${th.fg}14` }}>
            <span style={{ fontFamily: head, letterSpacing: "0.2em" }}>{th.brand}</span>
            <span>© Concept</span>
          </div>
        </div>
      </Scroller>
    );
  }

  return (
    <Scroller screenH="62.5cqw" bg={th.bg}>
      <div style={{ color: th.fg, fontFamily: SANS, height: "125cqw" }}>
        {nav}
        <div className="relative" style={{ height: "44cqw" }}>
          <Shot project={project} which="hero" className="absolute inset-0" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${th.bg}f0 0%, ${th.bg}99 38%, transparent 72%)` }} />
          <div className="absolute flex flex-col" style={{ left: "4cqw", bottom: "6cqw", gap: "1.6cqw", maxWidth: "44cqw" }}>
            <span style={{ ...cq(0.85), letterSpacing: "0.32em", color: th.accent, textTransform: "uppercase" }}>{th.nav[0]}</span>
            <span style={{ ...cq(4.6), fontFamily: head, lineHeight: 1.02, fontWeight: th.serif ? 400 : 600 }}>{th.headline}</span>
            <span className="self-start" style={{ background: th.accent, color: th.bg, ...cq(1), padding: "1cqw 2.4cqw", letterSpacing: "0.14em" }}>{th.cta}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center" style={{ height: "18cqw", padding: "0 4cqw", gap: "6cqw" }}>
          <span style={{ ...cq(2.5), fontFamily: head, lineHeight: 1.1 }}>{th.nav[2]} — {th.brand}</span>
          <div style={cq(1.1)}>
            <Lines n={4} color={th.fg} />
          </div>
        </div>
        <div className="grid grid-cols-3" style={{ height: "33cqw", gap: "1.6cqw", padding: "0 4cqw" }}>
          {[
            { which: "second" as const, pos: "50% 50%" },
            { which: "hero" as const, pos: "20% 40%" },
            { which: "second" as const, pos: "85% 70%" },
          ].map((c, i) => (
            <div key={i} className="flex flex-col" style={{ gap: "1cqw" }}>
              <Shot project={project} which={c.which} position={c.pos} className="flex-1" />
              <span style={{ ...cq(1.05), fontFamily: head }}>{th.nav[i % 3]}</span>
              <span style={{ ...cq(0.8), color: th.muted }}>0{i + 1} / 03</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center text-center" style={{ height: "16cqw", marginTop: "2cqw", background: th.surface, gap: "1.6cqw" }}>
          <span style={{ ...cq(2.8), fontFamily: head }}>{th.headline}</span>
          <span style={{ border: `1px solid ${th.fg}`, ...cq(0.95), padding: "0.9cqw 2.4cqw", letterSpacing: "0.14em" }}>{th.cta}</span>
        </div>
        <div className="flex items-center justify-between" style={{ height: "6cqw", padding: "0 4cqw", ...cq(0.9), color: th.muted }}>
          <span style={{ fontFamily: head, letterSpacing: "0.2em" }}>{th.brand}</span>
          <span className="flex" style={{ gap: "2cqw" }}>
            {th.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </div>
      </div>
    </Scroller>
  );
}

export function MobileScreen({ project, view = "home" }: ScreenProps) {
  const th = project.theme;
  const head = th.serif ? SERIF : SANS;
  const top = (
    <>
      <div className="flex items-center justify-between" style={{ height: "11cqw", padding: "0 7cqw", ...cq(3.4), fontWeight: 600 }}>
        <span>9:41</span>
        <span className="flex items-center" style={{ gap: "1.5cqw" }}>
          <span style={{ width: "5cqw", height: "2.6cqw", border: `1px solid ${th.fg}`, borderRadius: "1cqw" }} />
        </span>
      </div>
      <div className="flex items-center justify-between" style={{ height: "13cqw", padding: "0 6cqw" }}>
        <span style={{ ...cq(4.2), fontFamily: head, letterSpacing: "0.18em", fontWeight: th.serif ? 500 : 700 }}>{th.brand}</span>
        <span className="flex flex-col" style={{ gap: "1.4cqw" }}>
          <span style={{ width: "6cqw", height: "0.5cqw", background: th.fg }} />
          <span style={{ width: "4cqw", height: "0.5cqw", background: th.accent, alignSelf: "flex-end" }} />
        </span>
      </div>
    </>
  );

  if (view === "contact") {
    return (
      <Scroller screenH="216.67cqw" bg={th.bg}>
        <div style={{ color: th.fg, fontFamily: SANS, height: "216.67cqw" }}>
          {top}
          <div style={{ padding: "8cqw 6cqw 0" }}>
            <span style={{ ...cq(2.8), letterSpacing: "0.3em", color: th.accent, textTransform: "uppercase" }}>{th.nav[2]}</span>
            <div style={{ ...cq(9), fontFamily: head, lineHeight: 1.05, marginTop: "3cqw" }}>{th.headline}</div>
            <div style={{ marginTop: "10cqw" }} className="space-y-[6cqw]">
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ borderBottom: `1px solid ${th.fg}33`, paddingBottom: "3cqw" }}>
                  <div style={{ width: `${[30, 40, 55][i]}%`, height: "1.6cqw", background: th.muted, opacity: 0.5, borderRadius: "1cqw" }} />
                </div>
              ))}
              <div style={{ height: "26cqw", border: `1px solid ${th.fg}33` }} />
            </div>
            <div className="text-center" style={{ marginTop: "8cqw", background: th.accent, color: th.bg, ...cq(3.4), padding: "4.5cqw 0", letterSpacing: "0.14em" }}>{th.cta}</div>
          </div>
        </div>
      </Scroller>
    );
  }

  if (view === "detail") {
    return (
      <Scroller screenH="216.67cqw" bg={th.bg}>
        <div style={{ color: th.fg, fontFamily: SANS, paddingBottom: "10cqw" }}>
          {top}
          <div style={{ padding: "2cqw 6cqw 0" }}>
            <div className="relative" style={{ height: "110cqw" }}>
              <Shot project={project} which="second" className="absolute inset-0" />
            </div>
            <div className="flex justify-center" style={{ gap: "2cqw", marginTop: "4cqw" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="rounded-full" style={{ width: "2cqw", height: "2cqw", background: i === 0 ? th.fg : `${th.fg}44` }} />
              ))}
            </div>
            <div style={{ ...cq(2.8), letterSpacing: "0.3em", color: th.accent, textTransform: "uppercase", marginTop: "7cqw" }}>N°02 — {th.nav[0]}</div>
            <div style={{ ...cq(8.5), fontFamily: head, lineHeight: 1.05, marginTop: "3cqw" }}>{th.headline}</div>
            <div style={{ ...cq(3.4), marginTop: "6cqw" }}>
              <Lines n={5} color={th.fg} />
            </div>
            <div className="flex" style={{ gap: "3cqw", marginTop: "7cqw" }}>
              {project.palette.map((p) => (
                <span key={p.hex} className="rounded-full" style={{ width: "7cqw", height: "7cqw", background: p.hex, border: `1px solid ${th.fg}22` }} />
              ))}
            </div>
            <div className="text-center" style={{ marginTop: "8cqw", background: th.accent, color: th.bg, ...cq(3.4), padding: "4.5cqw 0", letterSpacing: "0.14em" }}>{th.cta}</div>
          </div>
        </div>
      </Scroller>
    );
  }

  return (
    <Scroller screenH="216.67cqw" bg={th.bg}>
      <div style={{ color: th.fg, fontFamily: SANS, height: "360cqw" }}>
        {top}
        <div className="relative" style={{ height: "132cqw" }}>
          <Shot project={project} which="hero" className="absolute inset-0" position="60% 50%" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${th.bg} 0%, ${th.bg}aa 30%, transparent 65%)` }} />
          <div className="absolute flex flex-col" style={{ left: "6cqw", right: "6cqw", bottom: "8cqw", gap: "4cqw" }}>
            <span style={{ ...cq(2.6), letterSpacing: "0.32em", color: th.accent, textTransform: "uppercase" }}>{th.nav[0]}</span>
            <span style={{ ...cq(10), fontFamily: head, lineHeight: 1.02, fontWeight: th.serif ? 400 : 600 }}>{th.headline}</span>
            <span className="self-start" style={{ background: th.accent, color: th.bg, ...cq(3.2), padding: "3cqw 6cqw", letterSpacing: "0.14em" }}>{th.cta}</span>
          </div>
        </div>
        <div style={{ padding: "10cqw 6cqw 0" }}>
          <div style={{ ...cq(6.5), fontFamily: head, lineHeight: 1.1 }}>{th.nav[2]} — {th.brand}</div>
          <div style={{ ...cq(3.4), marginTop: "5cqw" }}>
            <Lines n={4} color={th.fg} />
          </div>
        </div>
        <div className="grid grid-cols-2" style={{ gap: "3cqw", padding: "10cqw 6cqw 0" }}>
          {[
            { which: "second" as const, pos: "50% 50%" },
            { which: "hero" as const, pos: "25% 40%" },
          ].map((c, i) => (
            <div key={i}>
              <div className="relative" style={{ height: "52cqw" }}>
                <Shot project={project} which={c.which} position={c.pos} className="absolute inset-0" />
              </div>
              <div style={{ ...cq(3.4), fontFamily: head, marginTop: "2.5cqw" }}>{th.nav[i]}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center text-center" style={{ margin: "12cqw 0 0", padding: "12cqw 6cqw", background: th.surface, gap: "5cqw" }}>
          <span style={{ ...cq(7), fontFamily: head, lineHeight: 1.1 }}>{th.headline}</span>
          <span style={{ border: `1px solid ${th.fg}`, ...cq(3), padding: "3cqw 7cqw", letterSpacing: "0.14em" }}>{th.cta}</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "7cqw 6cqw", ...cq(2.8), color: th.muted }}>
          <span style={{ fontFamily: head, letterSpacing: "0.2em" }}>{th.brand}</span>
          <span>© Concept</span>
        </div>
      </div>
    </Scroller>
  );
}

/** MacBook with an overlapping iPhone — used for portfolio showcases. */
export function DeviceDuo({ project, className = "" }: { project: ConceptProject; className?: string }) {
  return (
    <div className={`relative pb-[6%] pr-[7%] ${className}`}>
      <MacBook className="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[1.2%]">
        <DesktopScreen project={project} />
      </MacBook>
      <Phone className="!absolute bottom-0 right-0 w-[23%] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[4%] group-hover:rotate-[-1.5deg]">
        <MobileScreen project={project} />
      </Phone>
    </div>
  );
}
