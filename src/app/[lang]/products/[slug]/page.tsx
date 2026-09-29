import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import { resolveLang } from "@/i18n/server";
import { getCategory, getCoa, getProduct, getProducts } from "@/lib/api";
import { site } from "@/data/site";
import { isInStock } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Tabs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductGrid } from "@/components/product/ProductCard";
import { CoaList } from "@/components/coa/CoaList";

type Params = Promise<{ lang: string; slug: string }>;

// Items added in the admin after the build are rendered on first visit.
export const dynamicParams = true;

export async function generateStaticParams() {
  const all = await Promise.all(locales.map(async (lang) => (await getProducts(lang)).map((p) => ({ lang, slug: p.slug }))));
  return all.flat();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, alternates } = await resolveLang(params);
  const { slug } = await params;
  const product = await getProduct(lang, slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.name} — ${product.shortDescription}`,
    alternates: alternates(`/products/${slug}`),
    openGraph: { images: product.images[0] ? [{ url: product.images[0] }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { lang, t, href } = await resolveLang(params);
  const { slug } = await params;
  const product = await getProduct(lang, slug);
  if (!product) notFound();
  const [category, coa, all] = await Promise.all([getCategory(lang, product.categorySlug), getCoa(product.slug), getProducts(lang)]);
  const related = all.filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug).slice(0, 4);
  const fill = related.length < 4 ? all.filter((p) => p.featured && p.slug !== product.slug && !related.includes(p)).slice(0, 4 - related.length) : [];
  const unit = product.variants[0].unit;

  const facts: { label: string; value: string }[] = [
    { label: t.product.form, value: product.specs.form },
    { label: t.product.perVial, value: product.variants.map((v) => v.label).join(" / ") },
    { label: t.product.purity, value: product.specs.purity },
    { label: t.product.storage, value: product.specs.storage },
  ];
  const specRows = [
    [t.product.specs.cas, product.specs.cas],
    [t.product.specs.formula, product.specs.formula],
    [t.product.specs.molecularWeight, product.specs.molecularWeight],
    [t.product.specs.sequence, product.specs.sequence],
    [t.product.specs.purity, product.specs.purity],
    [t.product.specs.form, product.specs.form],
    [t.product.specs.appearance, product.specs.appearance],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const trust: { icon: IconName; label: string }[] = [
    { icon: "clock", label: t.product.trustDispatch },
    { icon: "box", label: t.product.trustDiscreet },
    { icon: "file", label: t.product.trustCoa },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.variants[0].sku,
    brand: { "@type": "Brand", name: "SOLO Research" },
    image: product.images.map((src) => `${site.url}${src}`),
    category: category?.name,
    // Prices are published only while the shop is enabled.
    offers: !site.shopEnabled ? undefined : product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: `${product.name} ${v.label}`,
      price: v.price,
      priceCurrency: site.currency,
      availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}${href(`/products/${product.slug}`)}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="container-site pb-6 pt-8 sm:pt-10">
        <Breadcrumbs
          items={[
            { label: t.common.home, href: href("/") },
            { label: t.common.catalog, href: href("/products") },
            ...(category ? [{ label: category.name, href: href(`/category/${category.slug}`) }] : []),
            { label: product.name },
          ]}
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <ProductGallery name={product.name} images={product.images} label={product.variants[0].label} />

          <div>
            {category ? (
              <Link href={href(`/category/${category.slug}`)} className="eyebrow mb-2 inline-block hover:text-navy">
                {category.name}
              </Link>
            ) : null}
            <h1 className="mb-3 text-[34px] font-bold leading-[1.1] tracking-[-.035em] sm:text-[42px]">{product.name}</h1>
            <p className="mb-5 text-[16px] leading-relaxed text-muted">{product.shortDescription}</p>
            <div className="mb-7 flex flex-wrap gap-2">
              <Badge tone="navy">{t.common.researchUseOnly}</Badge>
              <Badge>{unit === "ml" ? "USP" : t.common.purityBadge}</Badge>
              {unit === "mg" ? <Badge>{t.common.hplcTested}</Badge> : null}
              {!isInStock(product) ? <Badge tone="muted">{t.product.outOfStock}</Badge> : null}
            </div>

            <ProductPurchase product={product} />

            <dl className="mt-8 grid grid-cols-2 border-t border-line">
              {facts.map((f) => (
                <div key={f.label} className="border-b border-line py-3.5 pe-3 odd:border-r odd:pe-4 even:ps-4">
                  <dt className="mb-0.5 text-[11px] font-bold uppercase tracking-[.1em] text-eyebrow">{f.label}</dt>
                  <dd className="text-[14px] font-bold">{f.value}</dd>
                </div>
              ))}
            </dl>

            <Link href={`${href("/coa")}?q=${encodeURIComponent(product.name)}`} className="text-link mt-5">
              <Icon name="file" className="size-5" /> {t.product.viewCoa} <Icon name="arrow" className="size-5" />
            </Link>

            <ul className="mt-7 grid grid-cols-3 gap-2 bg-ice p-4">
              {trust.map((item) => (
                <li key={item.label} className="flex flex-col items-center gap-2 text-center text-[12px] font-bold leading-snug">
                  <Icon name={item.icon} className="size-6 text-navy" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-site pb-10">
        <Tabs
          tabs={[
            {
              id: "description",
              label: t.product.tabs.description,
              content: (
                <div className="max-w-3xl space-y-4 text-[15px] leading-[1.8] text-muted">
                  {product.description.split("\n\n").map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              ),
            },
            {
              id: "specs",
              label: t.product.tabs.specifications,
              content: (
                <table className="w-full max-w-3xl border-collapse text-start text-[14px]">
                  <tbody>
                    {specRows.map(([label, value]) => (
                      <tr key={label} className="border-b border-line">
                        <th scope="row" className="w-[42%] py-3 pe-4 align-top font-bold sm:w-[34%]">
                          {label}
                        </th>
                        <td className="break-all py-3 font-mono text-[13px] text-muted">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ),
            },
            { id: "coa", label: t.product.tabs.coa, content: <div className="max-w-3xl"><CoaList docs={coa} t={t} lang={lang} /></div> },
            {
              id: "storage",
              label: t.product.tabs.storage,
              content: (
                <ul className="max-w-3xl space-y-3">
                  {t.product.storageText.map((line) => (
                    <li key={line} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                      <Icon name="snowflake" className="mt-0.5 size-5 text-eyebrow" />
                      {line}
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              id: "shipping",
              label: t.product.tabs.shipping,
              content: (
                <div className="max-w-3xl">
                  <p className="mb-4 text-[15px] leading-relaxed text-muted">{t.product.shippingText}</p>
                  <Link href={href("/shipping")} className="text-link">
                    {t.product.shippingLink} <Icon name="arrow" className="size-5" />
                  </Link>
                </div>
              ),
            },
          ]}
        />
        <p className="mt-2 flex gap-3 border-s-[3px] border-blue bg-ice px-4 py-3.5 text-[13px] leading-relaxed">
          <Icon name="info" className="size-5 text-navy" />
          {t.product.disclaimerShort}
        </p>
      </section>

      {related.length + fill.length ? (
        <section aria-labelledby="related-title" className="container-site pb-14">
          <SectionHeading id="related-title" title={t.product.related} />
          <ProductGrid products={[...related, ...fill]} />
        </section>
      ) : null}

    </>
  );
}
