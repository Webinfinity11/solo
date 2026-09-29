"use client";

import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { cn, formatPrice, mtavruli, priceRange } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { ProductImage } from "@/components/brand/ProductImage";

// "Select options" popup for products with several sizes: one tap adds that size to the cart.
export function VariantPicker({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const add = useCart((s) => s.add);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.name}
      closeLabel={t.common.close}
      className="w-[520px]"
      header={
        <div className="flex min-w-0 items-center gap-4">
          <span className="block size-16 shrink-0 border border-line bg-white">
            <ProductImage name={product.name} src={product.images[0]} label={product.variants[0].label} sizes="64px" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[20px] font-bold leading-tight tracking-[-.02em]">{product.name}</h2>
            <p className="mt-1 text-[15px] font-bold text-muted">{priceRange(product)}</p>
          </div>
        </div>
      }
    >
      <div className="px-5 pb-6 pt-4 sm:px-7">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-eyebrow [font-family:var(--font-display)]">{mtavruli(t.product.chooseSize)}</p>
        <ul className="flex flex-col gap-2.5">
          {product.variants.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                disabled={!v.inStock}
                onClick={() => {
                  add(product.slug, v.id);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-4 border border-line px-4 py-4 text-start transition-colors sm:px-5",
                  v.inStock ? "hover:border-navy hover:bg-mist" : "opacity-50",
                )}
              >
                <span className="flex-1 text-[16px] font-bold">{v.label}</span>
                {v.inStock ? (
                  <span className="text-[15px]">
                    {v.compareAtPrice ? <s className="me-2 text-muted">{formatPrice(v.compareAtPrice)}</s> : null}
                    <strong>{formatPrice(v.price)}</strong>
                  </span>
                ) : (
                  <span className="text-[13px] font-bold text-oos">{t.product.outOfStock}</span>
                )}
                <span aria-hidden="true" className="grid size-8 place-items-center border border-line bg-white">
                  <Icon name="plus" className="size-4" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
