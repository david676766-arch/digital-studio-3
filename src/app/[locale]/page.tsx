import type { Metadata } from "next";
import Intro from "@/components/Intro";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDictionary(locale);
  return pageMetadata({ locale, title: t.seo.homeTitle, description: t.seo.homeDescription, absoluteTitle: true });
}

export default function Home() {
  return (
    <>
      <Intro />
      <Hero />
      <Services />
      <Portfolio />
      <About />
      <Process />
      <Contact />
    </>
  );
}
