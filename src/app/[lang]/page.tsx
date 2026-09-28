import type { Metadata } from "next";
import Link from "next/link";
import { resolveLang } from "@/i18n/server";
import { getFaq, getFeaturedProducts, getProducts } from "@/lib/api";
import { Hero } from "@/components/home/Hero";
import { TrustPromises } from "@/components/home/TrustPromises";
import { ProductGrid } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { mtavruli } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { alternates } = await resolveLang(params);
  return { alternates: alternates("/") };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t, href } = await resolveLang(params);
  const [featured, products, faq] = await Promise.all([getFeaturedProducts(lang), getProducts(lang), getFaq(lang)]);
  // Second section: the rest of the peptide range, products with photos first.
  const peptides = products
    .filter((p) => !p.featured && p.categorySlug !== "lab-supplies")
    .sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0))
    .slice(0, 8);

  return (
    <>
      <Hero t={t} href={href} />

      <section aria-labelledby="featured-title" className="bg-mist py-14 sm:py-16">
        <div className="container-site">
          <SectionHeading
            id="featured-title"
            eyebrow={t.home.featured.eyebrow}
            title={t.home.featured.title}
            action={
              <Link href={href("/products")} className="btn btn-light">
                {t.nav.allProducts} <Icon name="arrow" className="size-4" />
              </Link>
            }
          />
          <ProductGrid products={featured} reveal priorityCount={4} />
        </div>
      </section>

      <section aria-labelledby="peptides-title" className="py-14 sm:py-16">
        <div className="container-site">
          <Reveal>
            <SectionHeading
              id="peptides-title"
              eyebrow={t.home.peptides.eyebrow}
              title={t.home.peptides.title}
              action={
                <Link href={href("/products")} className="btn btn-light">
                  {t.nav.allProducts} ({products.length}) <Icon name="arrow" className="size-4" />
                </Link>
              }
            />
          </Reveal>
          <ProductGrid products={peptides} reveal />
        </div>
      </section>

      <TrustPromises t={t} href={href} />

      <section aria-labelledby="faq-title" className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--blue-light),#f6fbff_51%,var(--blue-light))] py-14 sm:py-16">
        <Reveal className="mx-auto w-[calc(100%-2*var(--gutter))] max-w-[730px]">
          <p className="eyebrow mb-1.5">{mtavruli(t.home.faq.eyebrow)}</p>
          <h2 id="faq-title" className="mb-6 text-[28px] font-bold tracking-[-.03em] sm:text-[32px]">
            {t.home.faq.title}
          </h2>
          <Accordion items={faq.items.filter((f) => f.home)} />
        </Reveal>
      </section>
    </>
  );
}
