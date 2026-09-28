// Locale setup. Georgian is the default and is served without a URL prefix
// (/products); English and Russian get a prefix (/en/products, /ru/products).
// A new locale needs: its code here, a dictionary in ./dictionaries and
// translated data in src/data/i18n/<locale>.
export const locales = ["ka", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ka";

export const localeMeta: Record<Locale, { label: string; short: string; htmlLang: string; ogLocale: string }> = {
  ka: { label: "ქართული", short: "KA", htmlLang: "ka", ogLocale: "ka_GE" },
  en: { label: "English", short: "EN", htmlLang: "en", ogLocale: "en_US" },
  ru: { label: "Русский", short: "RU", htmlLang: "ru", ogLocale: "ru_RU" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Strip a locale prefix: "/en/products" -> { lang: "en", path: "/products" }. */
export function splitLocale(pathname: string): { lang: Locale; path: string } {
  const first = pathname.split("/")[1];
  if (isLocale(first) && first !== defaultLocale) {
    return { lang: first, path: pathname.slice(first.length + 1) || "/" };
  }
  return { lang: defaultLocale, path: pathname || "/" };
}

/** Build a locale-aware href. `path` must start with "/". */
export function localePath(lang: Locale, path: string): string {
  if (lang === defaultLocale) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}
