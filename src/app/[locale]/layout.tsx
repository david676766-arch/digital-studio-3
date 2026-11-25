import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { preconnect } from "react-dom";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { IntroProvider } from "@/lib/intro";
import { SITE_URL, jsonLdGraph, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";
import { site } from "@/config/site";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: site.name,
    title: { default: t.seo.homeTitle, template: `%s | ${site.name}` },
    description: t.seo.homeDescription,
    creator: site.name,
    publisher: site.name,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  preconnect("https://images.unsplash.com");

  return (
    <html lang={locale} className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="grain">
        <noscript>
          <style>{`[data-intro]{display:none!important}[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}[style*="translateY(110%)"]{transform:none!important}[style*="clip-path"]{clip-path:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdGraph(organizationJsonLd(locale), websiteJsonLd()) }}
        />
        <LanguageProvider locale={locale}>
          <IntroProvider>
            <SmoothScroll />
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <Cursor />
          </IntroProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
