import { notFound } from "next/navigation";
import { getDictionary } from "./index";
import { isLocale, localePath, type Locale } from "./config";

/** Resolve the `[lang]` route param for a server page: locale, dictionary and href helper. */
export async function resolveLang(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  return { lang: locale, t: getDictionary(locale), href: (path: string) => localePath(locale, path) };
}
