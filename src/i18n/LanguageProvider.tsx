"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Dictionary } from "./en";
import { getDictionary } from "./dictionaries";
import { LOCALES, switchLocalePath, type Locale } from "./config";

export { LOCALES, getDictionary };
export type { Locale };

type LanguageContextValue = {
  locale: Locale;
  t: Dictionary;
  /** Navigates to the same page in another language (/en/... → /de/...). */
  setLocale: (locale: Locale) => void;
  /** Prefixes a path with the active locale: href("/work/x") → "/en/work/x" */
  href: (path?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "ds-locale";

/** The language comes from the URL (/en, /de, /uk) so every page is server-rendered in its language. */
export function LanguageProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable */
      }
      const target = switchLocalePath(pathname || `/${locale}`, next) + window.location.hash;
      router.push(target, { scroll: false });
    },
    [locale, pathname, router],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      t: getDictionary(locale),
      setLocale,
      href: (path = "") => `/${locale}${path}`,
    }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
