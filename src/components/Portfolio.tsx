"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PROJECTS, type ConceptProject, type ProjectSlug } from "@/config/site";
import { DeviceDuo } from "./Devices";
import { Arrow, Magnetic, Reveal, SectionHeading } from "./ui";

export default function Portfolio() {
  const { t } = useLanguage();
  return (
    <section id="work" aria-labelledby="work-title" className="section-divider relative py-[clamp(6rem,13vw,10rem)]">
      <div className="container-luxe">
        <div className="grid gap-10 lg:grid-cols-12">
          <SectionHeading id="work-title" eyebrow={t.work.eyebrow} title={t.work.title} emphasis={t.work.titleEmphasis} className="lg:col-span-7" />
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="border-l border-gold/50 pl-5 text-[0.9rem] leading-relaxed text-ivory/65">{t.work.notice}</p>
          </Reveal>
        </div>

        <ol className="mt-[clamp(4rem,8vw,7rem)] space-y-[clamp(5rem,11vw,10rem)]">
          {PROJECTS.map((p, i) => (
            <Showcase key={p.slug} project={p} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Showcase({ project, index }: { project: ConceptProject; index: number }) {
  const { t, href: localHref } = useLanguage();
  const item = t.work.items[project.slug as ProjectSlug];
  const flip = index % 2 === 1;
  const href = localHref(`/work/${project.slug}`);

  return (
    <li className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
      <Reveal className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
        <Link
          href={href}
          data-cursor={t.work.cursor}
          aria-label={`${t.work.view}: ${item.title}`}
          className="device-group group relative block rounded-sm bg-[radial-gradient(80%_70%_at_50%_45%,rgba(184,155,101,0.16)_0%,rgba(9,9,9,0)_70%)] px-[5%] py-[7%] outline-none"
        >
          <DeviceDuo project={project} />
          <span className="pointer-events-none absolute inset-0 border border-ivory/[0.06] transition-colors duration-700 group-hover:border-gold/30" />
        </Link>
      </Reveal>

      <Reveal delay={0.1} className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[0.68rem] tracking-[0.2em] text-ivory/45">
            0{index + 1} / 0{PROJECTS.length}
          </span>
          <span className="border border-gold/60 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.26em] text-gold">{t.work.conceptBadge}</span>
        </div>
        <p className="mt-7 text-[0.66rem] uppercase tracking-[0.3em] text-ivory/50">{t.work.categories[project.service]}</p>
        <h3 className="display mt-3 text-[clamp(2.6rem,5vw,4.6rem)] text-ivory">{item.title}</h3>
        <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-ivory/70">{item.summary}</p>
        <ul className="mt-7 flex flex-wrap gap-2">
          {item.deliverables.map((d) => (
            <li key={d} className="border border-ivory/15 px-3 py-1.5 text-[0.74rem] text-ivory/70">
              {d}
            </li>
          ))}
        </ul>
        <div className="mt-9">
          <Magnetic>
            <Link href={href} className="btn-outline">
              {t.work.view}
              <Arrow />
            </Link>
          </Magnetic>
        </div>
      </Reveal>
    </li>
  );
}
