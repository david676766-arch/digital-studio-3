"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { NAV_SECTIONS, site, type NavSection } from "@/config/site";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { LanguageSwitcher, Magnetic, MailIcon, PhoneIcon, SectionLink, TelegramIcon } from "./ui";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-baseline gap-2 ${className}`}>
      <span className="display text-[1.35rem] tracking-[0.18em] text-ivory">DIGITAL</span>
      <span className="text-[0.62rem] font-medium tracking-[0.42em] text-gold">STUDIO</span>
    </span>
  );
}

export default function Header() {
  const { t, locale } = useLanguage();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<NavSection | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const onHome = pathname === `/${locale}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Highlight the section currently in view (home page) or "Work" on project pages
  useEffect(() => {
    if (!onHome) {
      setActive(pathname.includes("/work/") ? "work" : pathname.includes("/services/") ? "services" : null);
      return;
    }
    const sections = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id as NavSection);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [onHome, pathname]);

  // Close the menu on route change
  useEffect(() => setOpen(false), [pathname]);

  // Mobile menu: lock scroll, Escape to close, focus management
  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const id = window.setTimeout(() => firstLinkRef.current?.focus(), 80);
    const button = menuButtonRef.current;
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
      button?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1180px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const contacts = [
    { href: site.contacts.emailHref, label: site.contacts.email, Icon: MailIcon, external: false },
    { href: site.contacts.telegramHref, label: site.contacts.telegram, Icon: TelegramIcon, external: true },
    { href: site.contacts.phoneHref, label: site.contacts.phone, Icon: PhoneIcon, external: false },
  ];

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[80] -translate-y-24 bg-gold px-4 py-2 text-xs uppercase tracking-[0.2em] text-obsidian transition-transform focus:translate-y-0"
      >
        {t.nav.skipToContent}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700 ${
          scrolled || open || !onHome ? "border-b border-ivory/[0.07] bg-obsidian/80 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="container-luxe flex h-20 items-center justify-between gap-6">
          <SectionLink id="top" aria-label={t.nav.homeAria} onClick={() => setOpen(false)} className="relative z-[70] shrink-0">
            <Wordmark />
          </SectionLink>

          <nav aria-label="Primary" className="hidden min-[1180px]:block">
            <ul className="flex items-center gap-8">
              {NAV_SECTIONS.map((id) => (
                <li key={id}>
                  <SectionLink
                    id={id}
                    aria-current={active === id ? "true" : undefined}
                    className={`link-underline pb-1 text-[0.68rem] uppercase tracking-[0.22em] ${
                      active === id ? "text-gold" : "text-ivory/75 hover:text-ivory"
                    }`}
                  >
                    {t.nav[id]}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-6 min-[1180px]:flex">
            <LanguageSwitcher />
            <Magnetic strength={0.25}>
              <SectionLink id="contact" className="btn-gold !px-5 !py-3">
                {t.nav.cta}
              </SectionLink>
            </Magnetic>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="relative z-[70] flex h-11 items-center gap-3 min-[1180px]:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="hidden text-[0.65rem] uppercase tracking-[0.28em] text-ivory/80 sm:inline">{t.nav.menu}</span>
            <span className="relative block h-3 w-7">
              <span
                className={`absolute left-0 top-0 h-px w-full bg-ivory transition-transform duration-500 ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px transition-all duration-500 ${
                  open ? "w-full -translate-y-[5px] -rotate-45 bg-ivory" : "w-4 bg-gold"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            data-lenis-prevent
            className="fixed inset-0 z-[45] flex flex-col overflow-y-auto bg-obsidian/[0.97] backdrop-blur-2xl min-[1180px]:hidden"
            initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
            animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
            exit={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
            transition={{ duration: reduce ? 0.2 : 0.75, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile" className="container-luxe flex flex-1 flex-col justify-center pb-6 pt-28">
              <ul className="space-y-1">
                {NAV_SECTIONS.map((id, i) => (
                  <motion.li
                    key={id}
                    initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.25 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <SectionLink
                      ref={i === 0 ? firstLinkRef : undefined}
                      id={id}
                      onClick={() => setOpen(false)}
                      aria-current={active === id ? "true" : undefined}
                      className="group flex items-baseline gap-5 py-1.5"
                    >
                      <span className="text-[0.65rem] tracking-[0.2em] text-gold/80">0{i + 1}</span>
                      <span
                        className={`display text-[clamp(2.3rem,9vw,4rem)] transition-colors duration-300 group-hover:text-gold ${
                          active === id ? "text-gold" : "text-ivory"
                        }`}
                      >
                        {t.nav[id]}
                      </span>
                    </SectionLink>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="container-luxe border-t border-ivory/10 py-7"
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.6, duration: 0.6 }}
            >
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold">{t.nav.getInTouch}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {contacts.map(({ href, label, Icon, external }) => (
                  <li key={href}>
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group flex items-center gap-3 text-[0.92rem] text-ivory/80 transition-colors hover:text-gold"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/40 text-gold transition-colors group-hover:bg-gold group-hover:text-obsidian">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate">{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <LanguageSwitcher className="mt-6 -ml-1.5" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
