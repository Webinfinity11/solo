import ka, { type Dictionary } from "./dictionaries/ka";
import en from "./dictionaries/en";
import ru from "./dictionaries/ru";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { ka, en, ru };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

export type { Dictionary };
