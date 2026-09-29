"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getDictionary, type Dictionary } from "./index";
import { localePath, type Locale } from "./config";
import { applyOverrides } from "./overrides";
import type { TextOverrides } from "@/lib/content/types";

type I18nValue = { lang: Locale; t: Dictionary; href: (path: string) => string };

const I18nContext = createContext<I18nValue | null>(null);

// The dictionary contains functions, so it cannot be passed from a server
// component as a prop; the provider receives the locale plus the admin's text
// overrides (plain JSON) and resolves the dictionary here.
export function I18nProvider({ lang, overrides, children }: { lang: Locale; overrides?: TextOverrides; children: ReactNode }) {
  const value = useMemo<I18nValue>(
    () => ({ lang, t: applyOverrides(getDictionary(lang), overrides), href: (path) => localePath(lang, path) }),
    [lang, overrides],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
