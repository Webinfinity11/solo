"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { cn, firstAvailableVariant, formatPrice } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { QuantityInput } from "./QuantityInput";
import { site } from "@/data/site";

// Variant selector + price; quantity + add to cart only when the shop is enabled.
export function ProductPurchase({ product }: { product: Product }) {
  const { t } = useI18n();
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState(firstAvailableVariant(product).id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  function handleAdd() {
    add(product.slug, variant.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div>
      <div className="mb-6 flex items-baseline gap-3">
        {site.shopEnabled ? (
          <>
            <p className="text-[30px] font-bold tracking-[-.03em]" aria-live="polite">
              {formatPrice(variant.price)}
            </p>
            {variant.compareAtPrice ? <p className="text-[17px] text-muted line-through">{formatPrice(variant.compareAtPrice)}</p> : null}
          </>
        ) : null}
        <p className={cn("flex items-center gap-1.5 text-[13px] font-bold", site.shopEnabled && "ml-auto", variant.inStock ? "text-success" : "text-oos")}>
          <span className={cn("size-2 rounded-full", variant.inStock ? "bg-success" : "bg-oos")} />
          {variant.inStock ? t.product.inStock : t.product.outOfStock}
        </p>
      </div>

      <fieldset className="mb-6">
        <legend className="mb-2.5 text-[13px] font-bold uppercase tracking-[.1em]">
          {t.product.size}: <span className="text-muted">{variant.label}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={!v.inStock}
              aria-pressed={v.id === variant.id}
              title={v.inStock ? undefined : t.product.unavailable}
              onClick={() => setVariantId(v.id)}
              className={cn(
                "min-w-[84px] border px-4 py-3 text-[14px] font-bold transition-colors",
                v.id === variant.id ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy",
                !v.inStock && "border-dashed text-oos line-through opacity-60 hover:border-line",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </fieldset>

      {site.shopEnabled ? (
        <div className="flex gap-3">
          <QuantityInput value={quantity} onChange={setQuantity} size="lg" />
          <button type="button" onClick={handleAdd} disabled={!variant.inStock} className={cn("btn btn-navy flex-1", added && "bg-navy-2")}>
            <Icon name={added ? "check" : "cart"} className="size-[18px]" />
            {added ? t.product.added : t.product.addToCart}
          </button>
        </div>
      ) : null}
    </div>
  );
}
