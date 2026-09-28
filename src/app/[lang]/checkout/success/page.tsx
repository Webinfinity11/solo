import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import Link from "next/link";
import { resolveLang } from "@/i18n/server";
import { HexPattern } from "@/components/brand/HexPattern";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t } = await resolveLang(params);
  return { title: t.checkout.successTitle, robots: { index: false } };
}

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ lang: string }> }) {
  if (!site.shopEnabled) notFound();
  const { t, href } = await resolveLang(params);
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--blue-light),#f6fbff_51%,var(--blue-light))] py-24 text-center">
      <HexPattern hexes={[{ className: "left-[-3%] top-10 h-[178px] w-[158px]", opacity: 0.5 }, { className: "right-[-5%] top-8 h-[318px] w-[277px]", opacity: 0.35 }]} />
      <div className="container-site max-w-[640px]">
        <span className="hex-shape mx-auto mb-6 grid h-[80px] w-[70px] place-items-center bg-navy text-blue">
          <Icon name="check" className="size-9" strokeWidth={2.2} />
        </span>
        <h1 className="mb-3 text-[30px] font-bold tracking-[-.03em] sm:text-[36px]">{t.checkout.successTitle}</h1>
        <p className="mb-8 text-[15px] leading-relaxed text-muted">{t.checkout.successText}</p>
        <Link href={href("/products")} className="btn btn-navy">
          {t.checkout.successCta} <Icon name="arrow" className="size-[18px]" />
        </Link>
      </div>
    </section>
  );
}
