/** Locale configuration shared by server and client code. */

/** Order used by the language switcher: UA / EN / DE */
export const LOCALES = ["uk", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

/** Primary language — used for "/" and as hreflang x-default. */
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Open Graph locale codes */
export const OG_LOCALE: Record<Locale, string> = { en: "en_GB", de: "de_DE", uk: "uk_UA" };

/** Replace (or add) the locale segment of a pathname: /de/work/x → /en/work/x */
export function switchLocalePath(pathname: string, locale: Locale) {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) parts[1] = locale;
  else parts.splice(1, 0, locale);
  return parts.join("/").replace(/\/$/, "") || `/${locale}`;
}
