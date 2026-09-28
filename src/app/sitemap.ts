import type { MetadataRoute } from "next";
import { locales, localePath } from "@/i18n/config";
import { getCategories, getLegalDocuments, getProducts } from "@/lib/api";
import { site } from "@/data/site";

const staticPaths = ["/", "/products", "/coa", "/quality", "/shipping", "/wholesale", "/about", "/faq", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of locales) {
    const [products, categories, legal] = await Promise.all([getProducts(lang), getCategories(lang), getLegalDocuments(lang)]);
    const paths = [
      ...staticPaths,
      ...categories.map((c) => `/category/${c.slug}`),
      ...products.map((p) => `/products/${p.slug}`),
      ...legal.map((d) => `/legal/${d.slug}`),
    ];
    for (const path of paths) {
      entries.push({ url: `${site.url}${localePath(lang, path)}`, changeFrequency: "weekly", priority: path === "/" ? 1 : path.startsWith("/products/") ? 0.8 : 0.6 });
    }
  }
  return entries;
}
