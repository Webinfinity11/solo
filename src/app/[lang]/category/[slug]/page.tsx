import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { locales } from "@/i18n/config";
import { resolveLang } from "@/i18n/server";
import { getCategories, getCategory, getProducts } from "@/lib/api";
import { PageHero } from "@/components/ui/PageHero";
import { CatalogView } from "@/components/catalog/CatalogView";

type Params = Promise<{ lang: string; slug: string }>;

export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await Promise.all(locales.map(async (lang) => (await getCategories(lang)).map((c) => ({ lang, slug: c.slug }))));
  return all.flat();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, href } = await resolveLang(params);
  const { slug } = await params;
  const category = await getCategory(lang, slug);
  if (!category) return {};
  return { title: category.name, description: category.description, alternates: { canonical: href(`/category/${slug}`) } };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { lang, t, href } = await resolveLang(params);
  const { slug } = await params;
  const [category, products, categories] = await Promise.all([getCategory(lang, slug), getProducts(lang), getCategories(lang)]);
  if (!category) notFound();

  return (
    <>
      <PageHero
        eyebrow={t.common.products(category.productCount)}
        title={category.name}
        description={category.description}
        crumbs={[
          { label: t.common.home, href: href("/") },
          { label: t.common.catalog, href: href("/products") },
          { label: category.name },
        ]}
      />
      <section className="container-site py-10 sm:py-12">
        <Suspense>
          <CatalogView products={products} categories={categories} lockedCategory={category.slug} />
        </Suspense>
      </section>
    </>
  );
}
