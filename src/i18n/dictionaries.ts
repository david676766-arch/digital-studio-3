import en, { type Dictionary } from "./en";
import uk from "./uk";
import de from "./de";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { en, uk, de };

/** Works in server and client components. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
