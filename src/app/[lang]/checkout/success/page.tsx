import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { site } from "@/data/site";
import { resolveLang } from "@/i18n/server";
import { getSettings } from "@/lib/api";
import { HexPattern } from "@/components/brand/HexPattern";
import { Icon } from "@/components/ui/Icon";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t } = await resolveLang(params);
  return { title: t.checkout.successTitle, robots: { index: false } };
}

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ lang: string }> }) {
  if (!site.shopEnabled) notFound();
  const { t } = await resolveLang(params);
  const { bank } = await getSettings();
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--blue-light),#f6fbff_51%,var(--blue-light))] py-20 text-center">
      <HexPattern hexes={[{ className: "start-[-3%] top-10 h-[178px] w-[158px]", opacity: 0.5 }, { className: "end-[-5%] top-8 h-[318px] w-[277px]", opacity: 0.35 }]} />
      <div className="container-site max-w-[640px]">
        <span className="hex-shape mx-auto mb-6 grid h-[80px] w-[70px] place-items-center bg-navy text-blue">
          <Icon name="check" className="size-9" strokeWidth={2.2} />
        </span>
        <h1 className="mb-6 text-[30px] font-bold tracking-[-.03em] sm:text-[36px]">{t.checkout.successTitle}</h1>
        {/* Order number and payment choice arrive in the query string. */}
        <Suspense>
          <OrderConfirmation bank={bank} />
        </Suspense>
      </div>
    </section>
  );
}
