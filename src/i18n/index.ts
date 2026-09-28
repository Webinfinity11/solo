import ka, { type Dictionary } from "./dictionaries/ka";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { ka };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

export type { Dictionary };
