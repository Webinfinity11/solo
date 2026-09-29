// Default content assembled from the files in src/data. Used for any document
// that has not been saved from the admin yet.
import { locales, type Locale } from "@/i18n/config";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { coaDocuments } from "@/data/coa";
import { site } from "@/data/site";
import { content } from "@/data/i18n";
import type { Localized, SiteContent } from "./types";

const FOOTER_HIDDEN_CATEGORIES = ["melanocortins", "lab-supplies"];

function perLocale<T>(pick: (lang: Locale) => T): Localized<T> {
  return Object.fromEntries(locales.map((lang) => [lang, pick(lang)])) as Localized<T>;
}

export const defaultContent: SiteContent = {
  products: products.map((record) => ({
    ...record,
    text: perLocale((lang) => content[lang].productText[record.slug] ?? { shortDescription: "", description: "" }),
  })),
  categories: categories.map((c) => ({
    ...c,
    showInFooter: !FOOTER_HIDDEN_CATEGORIES.includes(c.slug),
    text: perLocale((lang) => content[lang].categoryText[c.slug] ?? { name: c.slug, description: "" }),
  })),
  settings: {
    email: site.email,
    phone: "",
    whatsapp: "",
    hours: site.hours,
    social: site.social,
  },
  coa: coaDocuments,
  faq: perLocale((lang) => ({ groups: content[lang].faqGroups, items: content[lang].faq })),
  legal: perLocale((lang) => content[lang].legalDocuments),
  texts: perLocale(() => ({})),
};
