// Data access layer. Pages and components only talk to these functions.
// Today they read local files; later swap the bodies for admin-API calls.
import type { Locale } from "@/i18n/config";
import type { Category, CoaDocument, FaqItem, LegalDocument, Product } from "@/lib/types";
import { categories as categoryRecords } from "@/data/categories";
import { products as productRecords, type ProductRecord } from "@/data/products";
import { coaDocuments } from "@/data/coa";
import { content } from "@/data/i18n";

export type CategoryWithCount = Category & { productCount: number; icon: string };

function localizeProduct(record: ProductRecord, lang: Locale): Product {
  const text = content[lang].productText[record.slug];
  const kind = content[lang].kindText[record.kind];
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    categorySlug: record.categorySlug,
    shortDescription: text?.shortDescription ?? "",
    description: text?.description ?? "",
    images: record.images,
    variants: record.variants,
    specs: { ...record.specs, form: kind.form, storage: kind.storage, appearance: kind.appearance },
    badges: record.badges,
    featured: record.featured,
    status: record.status,
    createdAt: record.createdAt,
  };
}

export async function getProducts(lang: Locale): Promise<Product[]> {
  return productRecords.filter((p) => p.status === "active").map((p) => localizeProduct(p, lang));
}

export async function getProduct(lang: Locale, slug: string): Promise<Product | undefined> {
  const record = productRecords.find((p) => p.slug === slug && p.status === "active");
  return record && localizeProduct(record, lang);
}

export async function getProductsByCategory(lang: Locale, categorySlug: string): Promise<Product[]> {
  return (await getProducts(lang)).filter((p) => p.categorySlug === categorySlug);
}

export async function getFeaturedProducts(lang: Locale): Promise<Product[]> {
  return (await getProducts(lang)).filter((p) => p.featured);
}

export async function getCategories(lang: Locale): Promise<CategoryWithCount[]> {
  const text = content[lang].categoryText;
  return [...categoryRecords]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      order: c.order,
      icon: c.icon,
      name: text[c.slug]?.name ?? c.slug,
      description: text[c.slug]?.description,
      productCount: productRecords.filter((p) => p.categorySlug === c.slug && p.status === "active").length,
    }));
}

export async function getCategory(lang: Locale, slug: string): Promise<CategoryWithCount | undefined> {
  return (await getCategories(lang)).find((c) => c.slug === slug);
}

export async function getCoa(productSlug?: string): Promise<CoaDocument[]> {
  const list = productSlug ? coaDocuments.filter((d) => d.productSlug === productSlug) : coaDocuments;
  return [...list].sort((a, b) => b.testDate.localeCompare(a.testDate));
}

export async function getFaq(lang: Locale): Promise<{ groups: Record<string, string>; items: (FaqItem & { home?: boolean })[] }> {
  return { groups: content[lang].faqGroups, items: content[lang].faq };
}

export async function getLegalDocuments(lang: Locale): Promise<LegalDocument[]> {
  return content[lang].legalDocuments;
}

export async function getLegalDocument(lang: Locale, slug: string): Promise<LegalDocument | undefined> {
  return content[lang].legalDocuments.find((d) => d.slug === slug);
}
