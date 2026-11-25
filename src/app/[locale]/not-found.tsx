"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Arrow } from "@/components/ui";

export default function NotFound() {
  const { t, href } = useLanguage();
  return (
    <section className="container-luxe flex min-h-[80svh] flex-col justify-center pt-28">
      <p className="eyebrow">404</p>
      <h1 className="display mt-6 text-[clamp(3rem,9vw,8rem)] text-ivory">{t.notFound.title}</h1>
      <p className="mt-6 max-w-lg text-ivory/65">{t.notFound.text}</p>
      <Link href={href()} className="btn-gold mt-10 self-start">
        {t.notFound.back}
        <Arrow />
      </Link>
    </section>
  );
}
