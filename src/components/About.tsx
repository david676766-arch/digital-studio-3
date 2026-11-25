"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { Photo, Reveal, RevealMask, SectionHeading } from "./ui";

export default function About() {
  const { t } = useLanguage();
  return (
    <section id="about" aria-labelledby="about-title" className="section-divider relative overflow-hidden bg-onyx py-[clamp(6rem,13vw,10rem)]">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-20 h-[36rem] w-[36rem] rounded-full bg-gold/[0.06] blur-[120px]" />
      <div className="container-luxe grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionHeading id="about-title" eyebrow={t.about.eyebrow} title={t.about.title} emphasis={t.about.titleEmphasis} />
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-2xl text-[1.08rem] leading-relaxed text-ivory/80">{t.about.intro}</p>
          </Reveal>
        </div>

        <div className="relative lg:col-span-4 lg:col-start-9">
          <RevealMask className="relative aspect-[4/5] overflow-hidden bg-graphite">
            <Photo photo="about" alt={t.about.imageAlt} sizes="(min-width: 1024px) 32vw, 94vw" className="grayscale-[0.3]" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 to-transparent" />
          </RevealMask>
          <span aria-hidden className="absolute -bottom-5 -left-5 hidden h-32 w-32 border-b border-l border-gold/50 md:block" />
        </div>
      </div>

      <div className="container-luxe mt-[clamp(4rem,8vw,7rem)]">
      <ul className="grid gap-px bg-ivory/10 md:grid-cols-2">
        {t.about.pillars.map((p, i) => (
          <Reveal as="li" key={p.title} delay={(i % 2) * 0.1} className="group relative overflow-hidden bg-onyx p-8 md:p-12">
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-light to-transparent transition-transform duration-700 group-hover:scale-x-100"
            />
            <div className="flex items-baseline justify-between gap-6">
              <h3 className="display text-[clamp(1.8rem,2.6vw,2.4rem)] text-ivory transition-colors duration-500 group-hover:text-gold-light">{p.title}</h3>
              <span className="display text-2xl text-gold/70">0{i + 1}</span>
            </div>
            <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-ivory/60">{p.text}</p>
          </Reveal>
        ))}
      </ul>
      </div>
    </section>
  );
}
