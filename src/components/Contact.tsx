"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SERVICE_IDS, site, type ServiceId } from "@/config/site";
import { SELECT_SERVICE_EVENT } from "./Services";
import { Arrow, MailIcon, Magnetic, PhoneIcon, Reveal, SectionHeading, TelegramIcon } from "./ui";

type Values = {
  name: string;
  email: string;
  service: ServiceId | "other" | "";
  budget: string; // index into budgets (language independent)
  message: string;
  website: string; // honeypot
};
type Errors = Partial<Record<"name" | "email" | "service" | "message", string>>;
type Status = "idle" | "sending" | "success" | "error" | "unconfigured";

const EMPTY: Values = { name: "", email: "", service: "", budget: "", message: "", website: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  const { t } = useLanguage();
  const c = site.contacts;

  const cards = [
    { key: "email", href: c.emailHref, value: c.email, Icon: MailIcon, external: false, ...t.contact.cards.email },
    { key: "telegram", href: c.telegramHref, value: c.telegram, Icon: TelegramIcon, external: true, ...t.contact.cards.telegram },
    { key: "phone", href: c.phoneHref, value: c.phone, Icon: PhoneIcon, external: false, ...t.contact.cards.phone },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="section-divider relative overflow-hidden bg-onyx pt-[clamp(6rem,13vw,10rem)]">
      <div aria-hidden className="pointer-events-none absolute -left-60 top-20 h-[40rem] w-[40rem] rounded-full bg-gold/[0.06] blur-[140px]" />
      <div className="container-luxe relative">
        <div className="grid gap-10 lg:grid-cols-12">
          <SectionHeading
            id="contact-title"
            eyebrow={t.contact.eyebrow}
            title={t.contact.title}
            emphasis={t.contact.titleEmphasis}
            className="lg:col-span-8"
            size="text-[clamp(2.8rem,7.4vw,7rem)] uppercase tracking-[0.01em]"
          />
          <Reveal delay={0.1} className="flex items-end lg:col-span-4">
            <p className="text-[0.98rem] leading-relaxed text-ivory/65">{t.contact.intro}</p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-3">
          {cards.map(({ key, href, value, Icon, external, label, action }, i) => (
            <Reveal as="li" key={key} delay={i * 0.08}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="contact-card group relative flex h-full flex-col overflow-hidden border border-ivory/10 bg-obsidian/60 p-7 transition-colors duration-500 hover:border-gold/70 md:p-8"
              >
                <span aria-hidden className="contact-card-glow" />
                <span className="relative flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/50 text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-obsidian">
                    <Icon />
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivory/45">{label}</span>
                </span>
                <span className="relative mt-10 break-all text-[clamp(1.15rem,1.7vw,1.45rem)] text-ivory transition-colors duration-500 group-hover:text-gold-light">
                  {value}
                </span>
                <span className="relative mt-6 inline-flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-gold">
                  {action}
                  <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1} className="mt-10 flex justify-center md:justify-start">
          <Magnetic strength={0.2}>
            <a href={c.telegramHref} target="_blank" rel="noopener noreferrer" className="btn-gold btn-xl">
              <TelegramIcon className="h-5 w-5" />
              {t.contact.cta}
              <Arrow />
            </a>
          </Magnetic>
        </Reveal>
      </div>

      <InquiryForm />
    </section>
  );
}

function InquiryForm() {
  const { t, locale } = useLanguage();
  const uid = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const f = t.contact.form;

  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<ServiceId>).detail;
      if (SERVICE_IDS.includes(id)) {
        setStatus((s) => (s === "success" ? "idle" : s));
        setValues((v) => ({ ...v, service: id }));
      }
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    const fromUrl = new URLSearchParams(window.location.search).get("service");
    if (fromUrl && (SERVICE_IDS as readonly string[]).includes(fromUrl)) setValues((v) => ({ ...v, service: fromUrl as ServiceId }));
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, []);

  useEffect(() => {
    if (status === "success" || status === "unconfigured") resultRef.current?.focus({ preventScroll: true });
  }, [status]);

  const validate = (v: Values): Errors => {
    const e: Errors = {};
    if (!v.name.trim()) e.name = t.contact.errors.name;
    if (!EMAIL_RE.test(v.email.trim())) e.email = t.contact.errors.email;
    if (!v.service) e.service = t.contact.errors.service;
    if (v.message.trim().length < 20) e.message = t.contact.errors.message;
    return e;
  };

  // Keep error messages live and in the active language after the first submit attempt
  useEffect(() => {
    if (submitted) setErrors(validate(values));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, locale, submitted]);

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (status === "error" || status === "unconfigured") setStatus("idle");
  };

  const serviceLabel = (s: Values["service"]) => (s === "other" ? f.serviceOther : s ? t.services.items[s].title : "");
  const budgetLabel = values.budget === "" ? "" : f.budgets[Number(values.budget)];

  const mailtoHref = () => {
    const body = [
      `${f.name}: ${values.name}`,
      `${f.email}: ${values.email}`,
      `${f.service}: ${serviceLabel(values.service)}`,
      budgetLabel ? `${f.budget}: ${budgetLabel}` : "",
      "",
      values.message,
    ]
      .filter((l, i) => l !== "" || i === 4)
      .join("\n");
    return `${site.contacts.emailHref}?subject=${encodeURIComponent(`${f.emailSubject} — ${values.name}`)}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          service: values.service,
          serviceLabel: serviceLabel(values.service),
          budget: budgetLabel || null,
          message: values.message.trim(),
          website: values.website,
          locale,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
        setValues(EMPTY);
        setSubmitted(false);
        setErrors({});
      } else if (data.error === "not_configured") {
        setStatus("unconfigured");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const fieldId = (name: string) => `${uid}-${name}`;
  const errId = (name: string) => `${uid}-${name}-error`;
  const label = (name: string, text: string, optional = false): ReactNode => (
    <label htmlFor={fieldId(name)} className="text-[0.62rem] uppercase tracking-[0.28em] text-ivory/55">
      {text}
      {optional && <span className="ml-2 normal-case tracking-normal text-ivory/35">({f.optional})</span>}
    </label>
  );
  const errorText = (name: keyof Errors) =>
    errors[name] ? (
      <p id={errId(name)} className="mt-2 text-[0.78rem] text-[#e0a08b]">
        {errors[name]}
      </p>
    ) : null;

  return (
    <div id="contact-form" className="container-luxe relative mt-[clamp(5rem,10vw,8rem)] scroll-mt-24 border-t border-ivory/10 pb-[clamp(5rem,10vw,8rem)] pt-[clamp(4rem,8vw,6rem)]">
      <div className="grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow">{t.contact.formEyebrow}</p>
          <h3 className="display mt-6 text-[clamp(2.2rem,4vw,3.4rem)] text-ivory">{t.contact.formTitle}</h3>
          <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-ivory/60">{t.contact.formIntro}</p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
          <AnimatePresence mode="wait" initial={false}>
            {status === "success" ? (
              <motion.div
                key="success"
                ref={resultRef}
                tabIndex={-1}
                role="status"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[420px] flex-col justify-center border border-gold/40 p-10 outline-none md:p-14"
              >
                <span aria-hidden className="grid h-14 w-14 place-items-center rounded-full border border-gold text-gold">
                  <svg viewBox="0 0 16 12" className="h-4 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M1 6l5 5L15 1" />
                  </svg>
                </span>
                <h4 className="display mt-8 text-5xl text-ivory">{f.successTitle}</h4>
                <p className="mt-4 max-w-md text-ivory/65">{f.successText}</p>
                <button type="button" onClick={() => setStatus("idle")} className="btn-ghost mt-8 self-start">
                  {f.sendAnother}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                noValidate
                onSubmit={onSubmit}
                aria-busy={status === "sending"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative grid gap-x-8 gap-y-9 md:grid-cols-2"
              >
                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor={fieldId("website")}>Website</label>
                  <input id={fieldId("website")} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} />
                </div>

                <div>
                  {label("name", f.name)}
                  <input
                    id={fieldId("name")}
                    name="name"
                    autoComplete="name"
                    className="field"
                    placeholder={f.namePh}
                    value={values.name}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? errId("name") : undefined}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  {errorText("name")}
                </div>

                <div>
                  {label("email", f.email)}
                  <input
                    id={fieldId("email")}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="field"
                    placeholder={f.emailPh}
                    value={values.email}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? errId("email") : undefined}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  {errorText("email")}
                </div>

                <div className="md:col-span-2">
                  {label("service", f.service)}
                  <select
                    id={fieldId("service")}
                    name="service"
                    className={`field ${values.service ? "" : "text-ivory/35"}`}
                    value={values.service}
                    aria-invalid={!!errors.service}
                    aria-describedby={errors.service ? errId("service") : undefined}
                    onChange={(e) => update("service", e.target.value as Values["service"])}
                  >
                    <option value="">{f.servicePh}</option>
                    {SERVICE_IDS.map((id) => (
                      <option key={id} value={id}>
                        {t.services.items[id].title}
                      </option>
                    ))}
                    <option value="other">{f.serviceOther}</option>
                  </select>
                  {errorText("service")}
                </div>

                <div className="md:col-span-2">
                  <p id={fieldId("budget")} className="text-[0.62rem] uppercase tracking-[0.28em] text-ivory/55">
                    {f.budget}
                    <span className="ml-2 normal-case tracking-normal text-ivory/35">({f.optional})</span>
                  </p>
                  <div role="radiogroup" aria-labelledby={fieldId("budget")} className="mt-4 flex flex-wrap gap-2">
                    {f.budgets.map((b, i) => {
                      const checked = values.budget === String(i);
                      return (
                        <button
                          key={b}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          onClick={() => update("budget", checked ? "" : String(i))}
                          className={`border px-4 py-2.5 text-[0.78rem] transition-colors duration-300 ${
                            checked ? "border-gold bg-gold/15 text-gold" : "border-ivory/15 text-ivory/65 hover:border-ivory/40 hover:text-ivory"
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  {label("message", f.message)}
                  <textarea
                    id={fieldId("message")}
                    name="message"
                    rows={5}
                    className="field resize-none"
                    placeholder={f.messagePh}
                    value={values.message}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? errId("message") : undefined}
                    onChange={(e) => update("message", e.target.value)}
                  />
                  {errorText("message")}
                </div>

                <div className="flex flex-col gap-5 md:col-span-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-[0.78rem] text-ivory/40">{f.privacy}</p>
                  <Magnetic strength={0.2}>
                    <button type="submit" disabled={status === "sending"} className="btn-gold btn-lg disabled:cursor-wait disabled:opacity-80">
                      {status === "sending" && <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border border-obsidian/30 border-t-obsidian" />}
                      {status === "sending" ? f.sending : f.submit}
                      {status !== "sending" && <Arrow />}
                    </button>
                  </Magnetic>
                </div>

                <div className="md:col-span-2" aria-live="polite">
                  {status === "error" && (
                    <p role="alert" className="border border-[#e0a08b]/40 p-5 text-[0.88rem] text-[#e0a08b]">
                      {f.error}
                    </p>
                  )}
                  {status === "unconfigured" && (
                    <div ref={resultRef} tabIndex={-1} role="alert" className="border border-gold/40 bg-gold/[0.06] p-6 outline-none">
                      <p className="text-[0.95rem] font-medium text-gold-light">{f.notConfiguredTitle}</p>
                      <p className="mt-2 text-[0.88rem] leading-relaxed text-ivory/70">{f.notConfiguredText}</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <a href={mailtoHref()} className="btn-gold !px-5 !py-3">
                          <MailIcon className="h-4 w-4" />
                          {f.sendByEmail}
                        </a>
                        <a href={site.contacts.telegramHref} target="_blank" rel="noopener noreferrer" className="btn-outline !px-5 !py-3">
                          <TelegramIcon className="h-4 w-4" />
                          {f.openTelegram}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </div>
  );
}
