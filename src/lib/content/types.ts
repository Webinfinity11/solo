// Editable site content as stored in the database (one JSON document per key).
// Every document has a default built from the files in src/data, so the site
// works without a database and the admin starts from the current copy.
import type { Locale } from "@/i18n/config";
import type { CoaDocument, FaqItem, LegalDocument, ProductBadge, Variant } from "@/lib/types";
import type { ProductKind } from "@/data/products";
import type { CategoryIcon } from "@/data/categories";

export type Localized<T> = Record<Locale, T>;

export type StoredProduct = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  kind: ProductKind;
  images: string[];
  variants: Variant[];
  specs: { purity: string; cas?: string; formula?: string; molecularWeight?: string; sequence?: string };
  badges?: ProductBadge[];
  featured?: boolean;
  status: "active" | "hidden";
  createdAt: string;
  text: Localized<{ shortDescription: string; description: string }>;
};

export type StoredCategory = {
  id: string;
  slug: string;
  order: number;
  icon: CategoryIcon;
  showInFooter: boolean;
  text: Localized<{ name: string; description: string }>;
};

export type SiteSettings = {
  email: string;
  phone: string;
  /** WhatsApp number in international format, e.g. +995 555 12 34 56. */
  whatsapp: string;
  hours: Localized<string>;
  social: { label: string; href: string }[];
};

export type FaqDocument = { groups: Record<string, string>; items: (FaqItem & { home?: boolean })[] };

/** Dictionary overrides: "footer.tagline" -> text, "ticker" -> list of lines. */
export type TextOverrides = Record<string, string | string[]>;

export type SiteContent = {
  products: StoredProduct[];
  categories: StoredCategory[];
  settings: SiteSettings;
  coa: CoaDocument[];
  faq: Localized<FaqDocument>;
  legal: Localized<LegalDocument[]>;
  texts: Localized<TextOverrides>;
};

export type ContentKey = keyof SiteContent;
