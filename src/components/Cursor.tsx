"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom desktop cursor: a small gold dot plus a trailing ring that grows over
 * interactive elements and can show a label (data-cursor="View").
 * Disabled on touch devices and when reduced motion is preferred.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [state, setState] = useState<"default" | "hover" | "text" | "hidden">("hidden");

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(mq.matches && !rm.matches);
    update();
    mq.addEventListener("change", update);
    rm.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      rm.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = e.target as Element | null;
      const textField = target?.closest?.("input, textarea, select, [contenteditable='true']");
      const labelled = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const interactive = target?.closest?.("a, button, [role='button'], label, summary");
      if (textField) setState("text");
      else if (labelled || interactive) setState("hover");
      else setState("default");
      setLabel(labelled?.dataset.cursor ?? "");
    };
    const onLeave = () => setState("hidden");
    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.18;
      ring.y += (pos.y - ring.y) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringSize = label ? 88 : state === "hover" ? 54 : 34;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      <div ref={ringRef} className="absolute left-0 top-0 will-change-transform">
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-[width,height,background-color,border-color,opacity] duration-300 ease-out ${
            label ? "border-gold bg-gold/90" : state === "hover" ? "border-gold/80 bg-gold/10" : "border-ivory/40"
          } ${state === "hidden" || state === "text" ? "opacity-0" : "opacity-100"}`}
          style={{ width: ringSize, height: ringSize }}
        >
          {label && <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-obsidian">{label}</span>}
        </div>
      </div>
      <div ref={dotRef} className="absolute left-0 top-0 will-change-transform">
        <div
          className={`h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold transition-opacity duration-200 ${
            state === "hidden" || state === "text" || label ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    </div>
  );
}
