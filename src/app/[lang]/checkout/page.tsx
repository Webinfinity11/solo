import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { resolveLang } from "@/i18n/server";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t } = await resolveLang(params);
  return { title: t.checkout.title, robots: { index: false } };
}

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  if (!site.shopEnabled) notFound();
  const { t, href } = await resolveLang(params);
  return (
    <section className="container-site py-8 sm:py-12">
      <Breadcrumbs items={[{ label: t.common.home, href: href("/") }, { label: t.cart.title, href: href("/cart") }, { label: t.checkout.title }]} />
      <h1 className="mb-8 text-[34px] font-bold tracking-[-.035em] sm:text-[42px]">{t.checkout.title}</h1>
      <CheckoutForm />
    </section>
  );
}
