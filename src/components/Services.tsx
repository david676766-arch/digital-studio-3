"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SERVICE_IDS, SERVICE_SLUGS, servicePhoto, type ServiceId } from "@/config/site";
import { scrollToId } from "@/lib/scroll";
import { Arrow, Magnetic, Photo, Reveal, RevealMask, SectionHeading } from "./ui";

export const SELECT_SERVICE_EVENT = "ds:select-service";

/** Pre-selects a service in the inquiry form and scrolls to it. */
export function selectService(id: ServiceId) {
  window.dispatchEvent(new CustomEvent<ServiceId>(SELECT_SERVICE_EVENT, { detail: id }));
}

export default function Services() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);

  // GSAP parallax on the service photography (skipped for reduced motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="services" aria-labelledby="services-title" className="section-divider relative py-[clamp(6rem,13vw,10rem)]">
      <div className="container-luxe grid gap-12 lg:grid-cols-12 lg:gap-10">
        <SectionHeading
          id="services-title"
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          emphasis={t.services.titleEmphasis}
          className="lg:col-span-7"
        />
        <Reveal delay={0.15} className="flex flex-col justify-end lg:col-span-5">
          <p className="max-w-md text-[0.98rem] leading-relaxed text-ivory/65">{t.services.intro}</p>
          <ol className="mt-10 border-t border-ivory/10">
            {SERVICE_IDS.map((id, i) => (
              <li key={id} className="border-b border-ivory/10">
                <a
                  href={`#service-${id}`}
                  className="group flex items-center justify-between py-4 text-sm text-ivory/75 transition-colors hover:text-ivory"
                >
                  <span className="flex items-baseline gap-5">
                    <span className="text-[0.65rem] tracking-[0.2em] text-gold">0{i + 1}</span>
                    {t.services.items[id].title}
                  </span>
                  <Arrow className="text-gold opacity-40 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <div className="mt-[clamp(4rem,8vw,7rem)] space-y-[clamp(4rem,9vw,8rem)]">
        {SERVICE_IDS.map((id, i) => (
          <ServiceBlock key={id} id={id} index={i} />
        ))}
      </div>
    </section>
  );
}

function ServiceBlock({ id, index }: { id: ServiceId; index: number }) {
  const { t, href } = useLanguage();
  const item = t.services.items[id];
  const flip = index % 2 === 1;

  const inquire = () => {
    selectService(id);
    scrollToId("contact-form");
  };

  return (
    <article id={`service-${id}`} aria-labelledby={`service-${id}-title`} className="container-luxe scroll-mt-24">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <RevealMask className={`group relative overflow-hidden bg-graphite lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[16/11]">
            <div data-parallax className="absolute inset-x-0 -top-[10%] h-[120%]">
              <div className="absolute inset-0 transition-transform duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]">
                <Photo
                  photo={servicePhoto[id]}
                  alt={t.media.alts[servicePhoto[id] as keyof typeof t.media.alts]}
                  sizes="(min-width: 1024px) 58vw, 94vw"
                  className="saturate-[0.82] transition-[filter] duration-1000 group-hover:saturate-100"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/10 to-obsidian/20" />
            <span aria-hidden className="pointer-events-none absolute inset-4 border border-gold/0 transition-colors duration-700 group-hover:border-gold/30 md:inset-6" />
            <span className="display absolute bottom-4 left-5 text-[clamp(3.5rem,8vw,7rem)] leading-none text-ivory/90 md:bottom-6 md:left-8">
              0{index + 1}
            </span>
          </div>
        </RevealMask>

        <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
          <Reveal>
            <p className="flex items-center gap-4 text-[0.66rem] uppercase tracking-[0.32em] text-gold">
              <span className="h-px w-10 bg-gold/60" />
              {item.kicker}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h3 id={`service-${id}-title`} className="display mt-6 text-[clamp(2.4rem,4.6vw,4.4rem)] text-ivory">
              {item.title}
            </h3>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 text-[0.98rem] leading-relaxed text-ivory/70">{item.description}</p>
            <p className="mt-9 text-[0.62rem] uppercase tracking-[0.32em] text-ivory/45">{t.services.includes}</p>
            <ul className="mt-4 grid grid-cols-1 gap-px bg-ivory/10 sm:grid-cols-2">
              {item.deliverables.map((d) => (
                <li key={d} className="flex items-center gap-3 bg-obsidian px-4 py-3.5 text-[0.85rem] text-ivory/80">
                  <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" />
                  {d}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Magnetic>
                <button type="button" onClick={inquire} className="btn-outline">
                  {t.services.inquiry}
                  <Arrow />
                </button>
              </Magnetic>
              <Link href={href(`/services/${SERVICE_SLUGS[id]}`)} className="btn-ghost">
                {t.services.learnMore}
                <span className="sr-only">: {item.title}</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
