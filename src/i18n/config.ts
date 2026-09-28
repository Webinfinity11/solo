// Locale setup. Georgian is the default and is served without a URL prefix
// (/products). Future locales get a prefix (/en/products, /ru/products):
// add the code here, add a dictionary in ./dictionaries and translated data
// in src/data/i18n/<locale>.
export const locales = ["ka"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ka";

export const localeMeta: Record<Locale, { label: string; htmlLang: string; ogLocale: string }> = {
  ka: { label: "ქართული", htmlLang: "ka", ogLocale: "ka_GE" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Build a locale-aware href. `path` must start with "/". */
export function localePath(lang: Locale, path: string): string {
  if (lang === defaultLocale) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}
