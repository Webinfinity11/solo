import ka, { type Dictionary } from "./dictionaries/ka";
import en from "./dictionaries/en";
import ru from "./dictionaries/ru";
import ar from "./dictionaries/ar";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { ka, en, ru, ar };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

export type { Dictionary };
