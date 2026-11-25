"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PROJECTS, type ProjectSlug } from "@/config/site";
import { MacBook, MobileScreen, DesktopScreen, Phone } from "./Devices";
import { Arrow, Magnetic, Reveal, SectionLink, SplitText } from "./ui";

/** Auto-scrolls the device screen once it is well inside the viewport (works on touch devices too). */
function AutoDevice({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) timer = window.setTimeout(() => el.classList.add("is-active"), 700);
        else el.classList.remove("is-active");
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <div ref={ref} className={`device-group group ${className}`}>
      {children}
    </div>
  );
}

export default function ProjectDetail({ slug }: { slug: ProjectSlug }) {
  const { t, href } = useLanguage();
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const project = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const item = t.work.items[slug];
  const nextItem = t.work.items[next.slug as ProjectSlug];

  return (
    <article className="pt-28 md:pt-36">
      {/* Intro */}
      <header className="container-luxe">
        <Reveal y={10}>
          <SectionLink id="work" className="inline-flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.26em] text-ivory/55 transition-colors hover:text-gold">
            <Arrow className="rotate-180" />
            {t.work.back}
          </SectionLink>
        </Reveal>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <span className="border border-gold/60 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.26em] text-gold">{t.work.conceptBadge}</span>
          <span className="text-[0.66rem] uppercase tracking-[0.3em] text-ivory/50">{t.work.categories[project.service]}</span>
        </div>
        <h1 className="display mt-6 text-[clamp(3.2rem,10vw,9.5rem)] text-ivory">
          <SplitText key={item.title} parts={[{ text: item.title }]} play stagger={0.1} />
        </h1>
        <Reveal delay={0.25}>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ivory/70">{item.summary}</p>
        </Reveal>

        <Reveal delay={0.35}>
          <dl className="mt-12 grid gap-px border-y border-ivory/10 bg-ivory/10 sm:grid-cols-3">
            {[
              { k: t.work.service, v: t.work.categories[project.service] },
              { k: t.work.scope, v: item.deliverables.join(" · ") },
              { k: t.work.type, v: t.work.typeValue },
            ].map((row) => (
              <div key={row.k} className="bg-obsidian py-6 sm:px-6 sm:first:pl-0">
                <dt className="text-[0.6rem] uppercase tracking-[0.3em] text-gold">{row.k}</dt>
                <dd className="mt-3 text-[0.9rem] leading-relaxed text-ivory/75">{row.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </header>

      {/* Hero device */}
      <section className="container-luxe mt-[clamp(4rem,8vw,7rem)]">
        <Reveal>
          <div className="rounded-sm bg-[radial-gradient(70%_60%_at_50%_40%,rgba(184,155,101,0.18)_0%,rgba(9,9,9,0)_70%)] px-[4%] py-[6%] md:px-[8%]">
            <AutoDevice>
              <MacBook>
                <DesktopScreen project={project} />
              </MacBook>
            </AutoDevice>
          </div>
        </Reveal>
      </section>

      {/* Idea & approach */}
      <section className="container-luxe mt-[clamp(4rem,9vw,8rem)] grid gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <p className="eyebrow">{t.work.idea}</p>
          <p className="display mt-6 text-[clamp(1.7rem,2.8vw,2.5rem)] leading-[1.2] text-ivory">{item.idea}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow">{t.work.approach}</p>
          <p className="mt-6 text-[1rem] leading-relaxed text-ivory/70">{item.approach}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {item.deliverables.map((d) => (
              <li key={d} className="border border-ivory/15 px-3 py-1.5 text-[0.75rem] text-ivory/70">
                {d}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Mobile screens */}
      <section className="mt-[clamp(5rem,10vw,9rem)] bg-onyx py-[clamp(4rem,9vw,8rem)]">
        <div className="container-luxe">
          <Reveal>
            <p className="eyebrow">{t.work.screens}</p>
            <p className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-ivory/65">{t.work.screensIntro}</p>
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 items-start gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-12">
            {(["home", "detail", "contact"] as const).map((view, i) => (
              <Reveal key={view} delay={i * 0.12} className={`mx-auto w-[72%] sm:w-full ${i === 1 ? "sm:mt-16" : ""}`}>
                <AutoDevice>
                  <Phone>
                    <MobileScreen project={project} view={view} />
                  </Phone>
                </AutoDevice>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Second desktop view */}
      <section className="container-luxe mt-[clamp(4rem,9vw,8rem)]">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <AutoDevice>
              <MacBook>
                <DesktopScreen project={project} view="detail" />
              </MacBook>
            </AutoDevice>
          </div>
        </Reveal>
      </section>

      {/* Design system */}
      <section className="container-luxe mt-[clamp(5rem,10vw,9rem)]">
        <Reveal>
          <p className="eyebrow">{t.work.system}</p>
        </Reveal>
        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-ivory/45">{t.work.palette}</p>
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {project.palette.map((c) => (
                <li key={c.hex}>
                  <span className="block aspect-[4/5] border border-ivory/10" style={{ background: c.hex }} />
                  <span className="mt-3 block text-[0.85rem] text-ivory/80">{c.name}</span>
                  <span className="block text-[0.72rem] uppercase tracking-[0.14em] text-ivory/45">{c.hex}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-ivory/45">{t.work.typography}</p>
            <div className="mt-5 border border-ivory/10 p-8">
              <p
                className="text-[clamp(4rem,8vw,6.5rem)] leading-none text-ivory"
                style={{ fontFamily: project.fonts[0] === "Manrope" ? "var(--font-manrope)" : "var(--font-cormorant)" }}
              >
                Aa
              </p>
              <p className="mt-6 text-[0.95rem] text-ivory/80">{project.fonts[0]}</p>
              <p className="text-[0.85rem] text-ivory/45">{project.fonts[1]}</p>
            </div>
          </Reveal>
        </div>
        <Reveal>
          <p className="mt-12 border-l border-gold/50 pl-5 text-[0.85rem] italic leading-relaxed text-ivory/50">{t.work.disclaimer}</p>
        </Reveal>
      </section>

      {/* Next project + CTA */}
      <section className="container-luxe mt-[clamp(5rem,10vw,9rem)] border-t border-ivory/10 pt-16">
        <Link href={href(`/work/${next.slug}`)} data-cursor={t.work.cursor} className="group block">
          <p className="eyebrow">{t.work.next}</p>
          <p className="display mt-6 flex flex-wrap items-baseline gap-x-6 text-[clamp(3rem,9vw,8rem)] text-ivory transition-colors duration-700 group-hover:text-gold-light">
            {nextItem.title}
            <span aria-hidden className="text-gold transition-transform duration-700 group-hover:translate-x-3">→</span>
          </p>
        </Link>
        <div className="mt-20 flex flex-col items-start justify-between gap-8 border-t border-ivory/10 py-16 md:flex-row md:items-center">
          <p className="display text-[clamp(2rem,4vw,3.4rem)] text-ivory">{t.work.ctaTitle}</p>
          <Magnetic>
            <SectionLink id="contact" className="btn-gold btn-lg">
              {t.work.ctaButton}
              <Arrow />
            </SectionLink>
          </Magnetic>
        </div>
      </section>
    </article>
  );
}
