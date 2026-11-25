"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import Link from "next/link";
import { NAV_SECTIONS, SERVICE_IDS, SERVICE_SLUGS, photos, site } from "@/config/site";
import { Wordmark } from "./Header";
import { LanguageSwitcher, MailIcon, Magnetic, PhoneIcon, SectionLink, TelegramIcon } from "./ui";

export default function Footer() {
  const { t, href } = useLanguage();
  const year = new Date().getFullYear();
  const credits = Array.from(new Map(Object.values(photos).map((p) => [p.page, p])).values());
  const c = site.contacts;

  const contacts = [
    { href: c.emailHref, label: c.email, Icon: MailIcon, external: false },
    { href: c.telegramHref, label: c.telegram, Icon: TelegramIcon, external: true },
    { href: c.phoneHref, label: c.phone, Icon: PhoneIcon, external: false },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-gold/20 bg-obsidian pt-[clamp(4rem,9vw,7rem)]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="container-luxe">
        <SectionLink id="contact" className="group block border-b border-ivory/10 pb-[clamp(3rem,7vw,5rem)]">
          <span className="eyebrow">{t.nav.getInTouch}</span>
          <span className="display mt-6 flex flex-wrap items-baseline gap-x-6 text-[clamp(2.6rem,8vw,8rem)] text-ivory transition-colors duration-700 group-hover:text-gold-light">
            {t.nav.cta}
            <span aria-hidden className="text-gold transition-transform duration-700 group-hover:translate-x-3">→</span>
          </span>
        </SectionLink>

        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLink id="top" aria-label={t.nav.homeAria}>
              <Wordmark />
            </SectionLink>
            <p className="mt-6 max-w-sm text-[0.9rem] leading-relaxed text-ivory/50">{t.footer.tagline}</p>
          </div>

          <nav aria-label={t.footer.navigate} className="lg:col-span-2">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">{t.footer.navigate}</p>
            <ul className="mt-5 space-y-3">
              {NAV_SECTIONS.map((id) => (
                <li key={id}>
                  <SectionLink id={id} className="link-underline text-[0.9rem] text-ivory/65 hover:text-ivory">
                    {t.nav[id]}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.nav.services} className="lg:col-span-2">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">{t.nav.services}</p>
            <ul className="mt-5 space-y-3">
              {SERVICE_IDS.map((id) => (
                <li key={id}>
                  <Link href={href(`/services/${SERVICE_SLUGS[id]}`)} className="link-underline text-[0.9rem] text-ivory/65 hover:text-ivory">
                    {t.services.items[id].title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">{t.footer.contact}</p>
            <ul className="mt-5 space-y-4">
              {contacts.map(({ href, label, Icon, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group inline-flex items-center gap-3 text-[0.95rem] text-ivory/75 transition-colors hover:text-gold-light"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-obsidian">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="break-all">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
            {site.socials.length > 0 && (
              <>
                <p className="mt-8 text-[0.62rem] uppercase tracking-[0.3em] text-gold">{t.footer.social}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {site.socials.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline text-[0.9rem] text-ivory/65 hover:text-ivory">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold">{t.footer.language}</p>
            <LanguageSwitcher className="-ml-1.5 mt-4 flex-wrap" flags={false} />
          </div>
        </div>

        <details className="group border-t border-ivory/10 py-6 text-[0.78rem] text-ivory/45">
          <summary className="flex cursor-pointer list-none items-center gap-3 uppercase tracking-[0.24em] hover:text-ivory/75 [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="text-gold transition-transform duration-300 group-open:rotate-45">+</span>
            {t.footer.credits}
          </summary>
          <p className="mt-4 max-w-3xl leading-relaxed">{t.footer.creditsIntro}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {credits.map((cr) => (
              <li key={cr.page}>
                <a href={cr.page} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-ivory/80">
                  {cr.author}
                </a>
              </li>
            ))}
          </ul>
        </details>

        <div className="flex flex-col gap-4 border-t border-ivory/10 py-8 text-[0.72rem] text-ivory/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. {t.footer.rights}
          </p>
          <Magnetic strength={0.3}>
            <SectionLink id="top" className="inline-flex items-center gap-3 uppercase tracking-[0.24em] transition-colors hover:text-gold">
              {t.footer.backToTop}
              <span aria-hidden>↑</span>
            </SectionLink>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}
