"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PROJECTS, SERVICE_IDS, SERVICE_SLUGS, servicePhoto, site, type ProjectSlug, type ServiceId } from "@/config/site";
import { DeviceDuo } from "./Devices";
import { Arrow, Magnetic, Photo, Reveal, SectionLink, TelegramIcon } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ServicePage({ id }: { id: ServiceId }) {
  const { t, href, locale } = useLanguage();
  const reduce = useReducedMotion();
  const service = t.services.items[id];
  const page = t.servicePages.items[id];
  const sp = t.servicePages;
  const related = PROJECTS.find((p) => p.service === id) ?? PROJECTS.find((p) => p.services.includes(id));
  const others = SERVICE_IDS.filter((s) => s !== id);
  const inquiryHref = `/${locale}?service=${id}#contact-form`;
  const index = SERVICE_IDS.indexOf(id);

  // Hero text is painted immediately (good LCP); only a gentle slide-in is animated
  const rise = (delay: number) => ({
    initial: { y: reduce ? 0 : 24 },
    animate: { y: 0 },
    transition: { duration: 1.1, ease: EASE, delay },
  });

  return (
    <article className="pt-28 md:pt-36">
      <header className="container-luxe">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] text-ivory/50">
            <li>
              <SectionLink id="top" className="transition-colors hover:text-gold">
                {sp.breadcrumbHome}
              </SectionLink>
            </li>
            <li aria-hidden>/</li>
            <li>
              <SectionLink id="services" className="transition-colors hover:text-gold">
                {sp.breadcrumbServices}
              </SectionLink>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-gold">
              {service.title}
            </li>
          </ol>
        </nav>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <motion.p className="eyebrow" {...rise(0)}>
              0{index + 1} — {service.kicker}
            </motion.p>
            <motion.h1 className="display mt-6 text-[clamp(3rem,8vw,7.5rem)] text-ivory" {...rise(0.05)}>
              {service.title}
            </motion.h1>
            <motion.p className="display mt-6 text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.15] text-gold-light" {...rise(0.12)}>
              {page.headline}
            </motion.p>
            <motion.p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ivory/75" {...rise(0.18)}>
              {page.lead}
            </motion.p>
            <motion.div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4" {...rise(0.24)}>
              <Magnetic>
                <Link href={inquiryHref} className="btn-gold btn-lg">
                  {t.services.inquiry}
                  <Arrow />
                </Link>
              </Magnetic>
              <a href={site.contacts.telegramHref} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <TelegramIcon className="h-4 w-4 text-gold" />
                Telegram {site.contacts.telegram}
              </a>
            </motion.div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
              <Photo
                photo={servicePhoto[id]}
                alt={t.media.alts[servicePhoto[id] as keyof typeof t.media.alts]}
                sizes="(min-width: 1024px) 38vw, 94vw"
                priority
                className="saturate-[0.85]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />
            </div>
            <span aria-hidden className="absolute -bottom-5 -left-5 hidden h-28 w-28 border-b border-l border-gold/50 md:block" />
          </div>
        </div>
      </header>

      {/* What's included */}
      <section aria-labelledby="included-title" className="container-luxe mt-[clamp(5rem,10vw,9rem)]">
        <Reveal>
          <p className="eyebrow">{t.services.includes}</p>
          <h2 id="included-title" className="display mt-6 text-[clamp(2.2rem,4.5vw,4rem)] text-ivory">
            {sp.whatsIncluded}
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-px bg-ivory/10 md:grid-cols-2">
          {service.deliverables.map((d, i) => (
            <Reveal as="li" key={d} delay={(i % 2) * 0.08} className="group relative bg-obsidian p-8 md:p-10">
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold to-transparent transition-transform duration-700 group-hover:scale-x-100" />
              <span className="display text-2xl text-gold/70">0{i + 1}</span>
              <h3 className="display mt-5 text-[clamp(1.6rem,2.4vw,2.1rem)] text-ivory">{d}</h3>
              <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ivory/60">{page.details[i]}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Approach */}
      <section aria-labelledby="approach-title" className="mt-[clamp(5rem,10vw,9rem)] bg-onyx py-[clamp(4rem,9vw,8rem)]">
        <div className="container-luxe grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">{t.process.eyebrow}</p>
            <h2 id="approach-title" className="display mt-6 text-[clamp(2.2rem,4vw,3.6rem)] text-ivory">
              {sp.approach}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
            <p className="text-[1.1rem] leading-relaxed text-ivory/75">{page.approach}</p>
            <ol className="mt-10 flex flex-wrap gap-2">
              {t.process.steps.map((s, i) => (
                <li key={s.title} className="border border-ivory/15 px-3.5 py-2 text-[0.78rem] text-ivory/70">
                  <span className="mr-2 text-gold">0{i + 1}</span>
                  {s.title}
                </li>
              ))}
            </ol>
            <SectionLink id="process" className="btn-ghost mt-6">
              {t.process.title} {t.process.titleEmphasis}
            </SectionLink>
          </Reveal>
        </div>
      </section>

      {/* Related concept project */}
      {related && (
        <section aria-labelledby="related-title" className="container-luxe mt-[clamp(5rem,10vw,9rem)]">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow">{sp.related}</p>
              <h2 id="related-title" className="display mt-6 text-[clamp(2.4rem,4.5vw,4rem)] text-ivory">
                {t.work.items[related.slug as ProjectSlug].title}
              </h2>
              <span className="mt-5 inline-block border border-gold/60 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.26em] text-gold">
                {t.work.conceptBadge}
              </span>
              <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-ivory/70">{t.work.items[related.slug as ProjectSlug].summary}</p>
              <Link href={href(`/work/${related.slug}`)} className="btn-outline mt-9">
                {t.work.view}
                <Arrow />
              </Link>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <Link
                href={href(`/work/${related.slug}`)}
                data-cursor={t.work.cursor}
                aria-label={`${t.work.view}: ${t.work.items[related.slug as ProjectSlug].title}`}
                className="device-group group block bg-[radial-gradient(80%_70%_at_50%_45%,rgba(184,155,101,0.16)_0%,rgba(9,9,9,0)_70%)] px-[5%] py-[7%]"
              >
                <DeviceDuo project={related} />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Other services */}
      <section aria-labelledby="other-title" className="container-luxe mt-[clamp(5rem,10vw,9rem)] border-t border-ivory/10 pt-14">
        <h2 id="other-title" className="eyebrow">
          {sp.other}
        </h2>
        <ul className="mt-8 grid gap-px bg-ivory/10 md:grid-cols-3">
          {others.map((o) => (
            <li key={o} className="bg-obsidian">
              <Link href={href(`/services/${SERVICE_SLUGS[o]}`)} className="group flex h-full flex-col justify-between gap-8 p-7 transition-colors duration-500 hover:bg-graphite">
                <span className="text-[0.62rem] uppercase tracking-[0.3em] text-ivory/45">{t.services.items[o].kicker}</span>
                <span className="display flex items-baseline justify-between gap-4 text-[clamp(1.7rem,2.4vw,2.2rem)] text-ivory transition-colors group-hover:text-gold-light">
                  {t.services.items[o].title}
                  <Arrow className="shrink-0 text-gold transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="container-luxe mt-[clamp(4rem,8vw,7rem)]">
        <div className="flex flex-col items-start justify-between gap-8 border-y border-ivory/10 py-16 md:flex-row md:items-center">
          <div>
            <p className="display text-[clamp(2rem,4vw,3.4rem)] text-ivory">{sp.ctaTitle}</p>
            <p className="mt-3 max-w-lg text-[0.95rem] text-ivory/60">{sp.ctaText}</p>
          </div>
          <Magnetic>
            <Link href={inquiryHref} className="btn-gold btn-lg">
              {t.services.inquiry}
              <Arrow />
            </Link>
          </Magnetic>
        </div>
      </section>
    </article>
  );
}
