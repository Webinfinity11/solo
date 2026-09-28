import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveLang } from "@/i18n/server";
import { getCategories, getProducts } from "@/lib/api";
import { PageHero } from "@/components/ui/PageHero";
import { CatalogView } from "@/components/catalog/CatalogView";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, href } = await resolveLang(params);
  return { title: t.catalog.title, description: t.catalog.description, alternates: { canonical: href("/products") } };
}

export default async function ProductsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t, href } = await resolveLang(params);
  const [products, categories] = await Promise.all([getProducts(lang), getCategories(lang)]);

  return (
    <>
      <PageHero
        title={t.catalog.title}
        description={t.catalog.description}
        crumbs={[{ label: t.common.home, href: href("/") }, { label: t.common.catalog }]}
      />
      <section className="container-site py-10 sm:py-12">
        <Suspense>
          <CatalogView products={products} categories={categories} />
        </Suspense>
      </section>
    </>
  );
}
