import { notFound } from "next/navigation";
import { getDictionary } from "./index";
import { applyOverrides } from "./overrides";
import { getContent } from "@/lib/content/store";
import { isLocale, localePath, locales, localeMeta, defaultLocale, type Locale } from "./config";

/** Resolve the `[lang]` route param for a server page: locale, dictionary and href helper. */
export async function resolveLang(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const content = await getContent();
  return {
    lang: locale,
    t: applyOverrides(getDictionary(locale), content.texts[locale]),
    href: (path: string) => localePath(locale, path),
    /** Canonical URL for this locale plus hreflang links to the other languages. */
    alternates: (path: string) => ({
      canonical: localePath(locale, path),
      languages: {
        ...Object.fromEntries(locales.map((l) => [localeMeta[l].htmlLang, localePath(l, path)])),
        "x-default": localePath(defaultLocale, path),
      },
    }),
  };
}
