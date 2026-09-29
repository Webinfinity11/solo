"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Product, Variant } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/brand/ProductImage";
import { QuantityInput } from "@/components/product/QuantityInput";
import { useCatalog } from "@/components/layout/CatalogProvider";

export type ResolvedLine = { product: Product; variant: Variant; quantity: number; total: number };

/** Cart items joined with catalogue data; unknown variants are skipped. */
export function useCartLines() {
  const items = useCart((s) => s.items);
  const { findVariant } = useCatalog();
  return useMemo(() => {
    const lines: ResolvedLine[] = [];
    for (const item of items) {
      const found = findVariant(item.variantId);
      if (found) lines.push({ ...found, quantity: item.quantity, total: found.variant.price * item.quantity });
    }
    const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
    return { lines, subtotal, count: lines.reduce((n, l) => n + l.quantity, 0) };
  }, [items, findVariant]);
}

export function CartLine({ line, compact, onNavigate }: { line: ResolvedLine; compact?: boolean; onNavigate?: () => void }) {
  const { t, href } = useI18n();
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const url = href(`/products/${line.product.slug}`);

  return (
    <article className="grid grid-cols-[72px_1fr] items-center gap-4 border-b border-line py-5 sm:grid-cols-[88px_1fr]">
      <Link href={url} onClick={onNavigate} className="block aspect-[.8] w-full bg-white">
        <ProductImage name={line.product.name} src={line.variant.image ?? line.product.images[0]} label={line.variant.label} sizes="90px" />
      </Link>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-snug">
              <Link href={url} onClick={onNavigate} className="hover:underline hover:underline-offset-4">
                {line.product.name}
              </Link>
            </h3>
            <p className="mt-0.5 text-[12px] text-muted">
              {line.variant.label} · {formatPrice(line.variant.price)}
            </p>
          </div>
          <p className="shrink-0 text-[15px] font-bold">{formatPrice(line.total)}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <QuantityInput
            size={compact ? "sm" : "md"}
            value={line.quantity}
            min={1}
            onChange={(q) => setQuantity(line.variant.id, q)}
            label={`${t.cart.quantity}: ${line.product.name}`}
          />
          <button
            type="button"
            onClick={() => remove(line.variant.id)}
            className="py-2 text-[12px] text-muted underline underline-offset-4 transition-colors hover:text-danger"
          >
            {t.cart.remove}
          </button>
        </div>
      </div>
    </article>
  );
}
