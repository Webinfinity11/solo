import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { resolveLang } from "@/i18n/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CartPageView } from "@/components/cart/CartPageView";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t } = await resolveLang(params);
  return { title: t.cart.title, robots: { index: false } };
}

export default async function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  if (!site.shopEnabled) notFound();
  const { t, href } = await resolveLang(params);
  return (
    <section className="container-site py-8 sm:py-12">
      <Breadcrumbs items={[{ label: t.common.home, href: href("/") }, { label: t.cart.title }]} />
      <h1 className="mb-8 text-[34px] font-bold tracking-[-.035em] sm:text-[42px]">{t.cart.title}</h1>
      <CartPageView />
    </section>
  );
}
