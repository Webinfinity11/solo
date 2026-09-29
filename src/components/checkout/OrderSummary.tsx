"use client";

import { useI18n } from "@/i18n/provider";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/brand/ProductImage";
import type { ResolvedLine } from "@/components/cart/CartLine";

export function OrderSummary({ lines, subtotal, shipping }: { lines: ResolvedLine[]; subtotal: number; shipping: number }) {
  const { t } = useI18n();
  return (
    <aside className="border border-line bg-mist p-5 sm:p-6 lg:sticky lg:top-[110px]">
      <h2 className="mb-4 text-[18px] font-bold">{t.checkout.summary}</h2>
      <ul className="max-h-[340px] divide-y divide-line overflow-auto">
        {lines.map((l) => (
          <li key={l.variant.id} className="flex items-center gap-3 py-3">
            <span className="relative block h-16 w-14 shrink-0 bg-white">
              <ProductImage name={l.product.name} src={l.variant.image ?? l.product.images[0]} label={l.variant.label} sizes="60px" />
              <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-navy text-[10px] font-bold text-white">{l.quantity}</span>
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-[14px]">{l.product.name}</strong>
              <small className="text-[12px] text-muted">{l.variant.label}</small>
            </span>
            <span className="text-[14px] font-bold">{formatPrice(l.total)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[14px]">
        <div className="flex justify-between">
          <dt>{t.cart.subtotal}</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t.cart.shipping}</dt>
          <dd>{shipping === 0 ? t.checkout.free : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-[18px] font-bold">
          <dt>{t.cart.total}</dt>
          <dd>{formatPrice(subtotal + shipping)}</dd>
        </div>
      </dl>
    </aside>
  );
}
