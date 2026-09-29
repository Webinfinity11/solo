import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { resolveLang } from "@/i18n/server";
import { getCoa, getProducts } from "@/lib/api";
import { getApprovedReviews } from "@/lib/reviews";
import { ReviewsSection } from "@/components/coa/ReviewsSection";
import { PageHero } from "@/components/ui/PageHero";
import { CoaTable } from "@/components/coa/CoaTable";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, alternates } = await resolveLang(params);
  return { title: t.coa.title, description: t.coa.description, alternates: alternates("/coa") };
}

export default async function CoaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t, href } = await resolveLang(params);
  const [docs, products, reviews] = await Promise.all([getCoa(), getProducts(lang), getApprovedReviews()]);

  return (
    <>
      <PageHero eyebrow={t.coa.eyebrow} title={t.coa.title} description={t.coa.description} crumbs={[{ label: t.common.home, href: href("/") }, { label: t.nav.labResults }]} />
      <section className="container-site py-10 sm:py-12">
        <Suspense>
          <CoaTable docs={docs} />
        </Suspense>
        <p className="mt-3 text-[12px] text-muted">{t.common.placeholderNote}</p>
      </section>
      <ReviewsSection reviews={reviews.filter((r) => products.some((p) => p.slug === r.productSlug))} products={products.map((p) => ({ slug: p.slug, name: p.name }))} />
      <section aria-labelledby="how-title" className="bg-navy py-14 text-white">
        <div className="container-site">
          <p className="eyebrow mb-2 text-blue">COA</p>
          <h2 id="how-title" className="mb-8 text-[28px] font-bold tracking-[-.03em] sm:text-[32px]">
            {t.coa.howTitle}
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.coa.how.map((item, i) => (
              <li key={item.title} className="border border-blue/35 p-5">
                <span className="hex-shape mb-4 grid h-[46px] w-[40px] place-items-center bg-blue text-[15px] font-bold text-navy">{i + 1}</span>
                <h3 className="mb-2 text-[16px] font-bold">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-white/78">{item.text}</p>
              </li>
            ))}
          </ol>
          <Link href={href("/quality")} className="text-link mt-8 text-white">
            {t.quality.eyebrow} <Icon name="arrow" className="size-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
