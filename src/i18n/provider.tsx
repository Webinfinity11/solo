"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getDictionary, type Dictionary } from "./index";
import { localePath, type Locale } from "./config";

type I18nValue = { lang: Locale; t: Dictionary; href: (path: string) => string };

const I18nContext = createContext<I18nValue | null>(null);

// The dictionary contains functions, so it cannot be passed from a server
// component as a prop; the provider receives only the locale and resolves it here.
export function I18nProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const value: I18nValue = { lang, t: getDictionary(lang), href: (path) => localePath(lang, path) };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
