"use client";

import Link from "next/link";
import { useCart, useCartHydrated } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { CartLine, useCartLines } from "./CartLine";
import { PromoField } from "./PromoField";
import { discountAmount } from "@/lib/promo-codes";

export function CartPageView() {
  const { t, href } = useI18n();
  const clear = useCart((s) => s.clear);
  const { lines, subtotal } = useCartLines();
  const promo = useCart((s) => s.promo);
  const hydrated = useCartHydrated();

  const discount = promo ? discountAmount(subtotal, promo.percent) : 0;

  if (!hydrated) return <div aria-busy="true" className="h-[360px] animate-pulse bg-mist" />;

  if (!lines.length) {
    return (
      <div className="border border-dashed border-line px-6 py-20 text-center text-muted">
        <Icon name="cart" className="mx-auto mb-5 size-12 text-blue" />
        <h2 className="mb-2 text-[22px] font-bold text-navy">{t.cart.empty}</h2>
        <p className="mb-7 text-[15px]">{t.cart.emptyText}</p>
        <Link href={href("/products")} className="btn btn-navy">
          {t.cart.browse} <Icon name="arrow" className="size-[18px]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="hidden grid-cols-[1fr_auto] border-b border-navy pb-3 text-[12px] font-bold uppercase tracking-[.1em] text-muted sm:grid">
          <span>{t.cart.product}</span>
          <span>{t.cart.lineTotal}</span>
        </div>
        {lines.map((line) => (
          <CartLine key={line.variant.id} line={line} />
        ))}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <Link href={href("/products")} className="text-link">
            <Icon name="arrow" className="size-5 rotate-180" /> {t.cart.browse}
          </Link>
          <button type="button" onClick={clear} className="text-[13px] text-muted underline underline-offset-4 hover:text-danger">
            {t.cart.clear}
          </button>
        </div>
      </div>

      <aside className="border border-line bg-mist p-6 lg:sticky lg:top-[110px]">
        <PromoField className="mb-6" />
        <dl className="space-y-2.5 border-t border-line pt-5 text-[14px]">
          <div className="flex justify-between">
            <dt>{t.cart.subtotal}</dt>
            <dd className="font-bold">{formatPrice(subtotal)}</dd>
          </div>
          {promo ? (
            <div className="flex justify-between text-success">
              <dt>
                {t.cart.discount} ({promo.code}, -{promo.percent}%)
              </dt>
              <dd className="font-bold">-{formatPrice(discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt>{t.cart.shipping}</dt>
            <dd className="text-right text-muted">{t.cart.shippingAtCheckout}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-[18px] font-bold">
            <dt>{t.cart.total}</dt>
            <dd>{formatPrice(subtotal - discount)}</dd>
          </div>
        </dl>
        <Link href={href("/checkout")} className="btn btn-navy mt-6 w-full">
          {t.cart.proceed} <Icon name="arrow" className="size-[18px]" />
        </Link>
        <p className="mt-4 flex gap-2 text-[12px] leading-relaxed text-muted">
          <Icon name="lock" className="size-4" /> {t.cart.note}
        </p>
      </aside>
    </div>
  );
}
