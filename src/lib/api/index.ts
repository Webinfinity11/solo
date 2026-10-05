// Data access layer. Pages and components only talk to these functions.
// Content comes from the admin-managed store (lib/content), which falls back to
// the files in src/data for anything not saved yet.
import type { Locale } from "@/i18n/config";
import type { Category, CoaDocument, FaqItem, LegalDocument, Product } from "@/lib/types";
import type { SiteSettings, StoredProduct } from "@/lib/content/types";
import { getContent } from "@/lib/content/store";
import { content as staticContent } from "@/data/i18n";

export type CategoryWithCount = Category & { productCount: number; icon: string; showInFooter: boolean };

function localizeProduct(record: StoredProduct, lang: Locale): Product {
  const text = record.text[lang];
  const kind = staticContent[lang].kindText[record.kind];
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    categorySlug: record.categorySlug,
    shortDescription: text?.shortDescription ?? "",
    description: text?.description ?? "",
    seoTitle: text?.seoTitle || undefined,
    seoDescription: text?.seoDescription || undefined,
    images: record.images,
    variants: record.variants,
    specs: { ...record.specs, form: kind.form, storage: kind.storage, appearance: kind.appearance },
    badges: record.badges,
    featured: record.featured,
    status: record.status,
    createdAt: record.createdAt,
  };
}

async function activeProducts(): Promise<StoredProduct[]> {
  // A product without variants cannot be shown (cards and pages read variants[0]).
  return (await getContent()).products.filter((p) => p.status === "active" && p.variants.length > 0);
}

export async function getProducts(lang: Locale): Promise<Product[]> {
  return (await activeProducts()).map((p) => localizeProduct(p, lang));
}

export async function getProduct(lang: Locale, slug: string): Promise<Product | undefined> {
  const record = (await activeProducts()).find((p) => p.slug === slug);
  return record && localizeProduct(record, lang);
}

export async function getProductsByCategory(lang: Locale, categorySlug: string): Promise<Product[]> {
  return (await getProducts(lang)).filter((p) => p.categorySlug === categorySlug);
}

export async function getFeaturedProducts(lang: Locale): Promise<Product[]> {
  return (await getProducts(lang)).filter((p) => p.featured);
}

export async function getCategories(lang: Locale): Promise<CategoryWithCount[]> {
  const [{ categories }, products] = await Promise.all([getContent(), activeProducts()]);
  return [...categories]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      order: c.order,
      icon: c.icon,
      showInFooter: c.showInFooter,
      name: c.text[lang]?.name || c.slug,
      description: c.text[lang]?.description,
      seoTitle: c.text[lang]?.seoTitle || undefined,
      seoDescription: c.text[lang]?.seoDescription || undefined,
      productCount: products.filter((p) => p.categorySlug === c.slug).length,
    }));
}

export async function getCategory(lang: Locale, slug: string): Promise<CategoryWithCount | undefined> {
  return (await getCategories(lang)).find((c) => c.slug === slug);
}

export async function getCoa(productSlug?: string): Promise<CoaDocument[]> {
  const { coa } = await getContent();
  const list = productSlug ? coa.filter((d) => d.productSlug === productSlug) : coa;
  return [...list].sort((a, b) => b.testDate.localeCompare(a.testDate));
}

export async function getFaq(lang: Locale): Promise<{ groups: Record<string, string>; items: (FaqItem & { home?: boolean })[] }> {
  return (await getContent()).faq[lang];
}

export async function getLegalDocuments(lang: Locale): Promise<LegalDocument[]> {
  return (await getContent()).legal[lang];
}

export async function getLegalDocument(lang: Locale, slug: string): Promise<LegalDocument | undefined> {
  return (await getLegalDocuments(lang)).find((d) => d.slug === slug);
}

export async function getSettings(): Promise<SiteSettings> {
  return (await getContent()).settings;
}
