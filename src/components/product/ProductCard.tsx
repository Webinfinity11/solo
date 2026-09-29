"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { cn, firstAvailableVariant, isInStock } from "@/lib/utils";
import { ProductImage } from "@/components/brand/ProductImage";
import { Icon } from "@/components/ui/Icon";
import { useCatalog } from "@/components/layout/CatalogProvider";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

export function ProductCard({ product, priority, size = "md" }: { product: Product; priority?: boolean; size?: "md" | "lg" }) {
  const { t, href } = useI18n();
  const { categories } = useCatalog();
  const add = useCart((s) => s.add);
  const [justAdded, setJustAdded] = useState(false);

  const url = href(`/products/${product.slug}`);
  const category = categories.find((c) => c.slug === product.categorySlug);
  const inStock = isInStock(product);
  const isNew = product.badges?.includes("new");
  const isBest = product.badges?.includes("bestseller");

  function handleAdd() {
    // Adds the first in-stock size; other sizes are chosen on the product page.
    add(product.slug, firstAvailableVariant(product).id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1300);
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[3px] border border-line bg-white transition duration-300 ease-brand hover:-translate-y-1 hover:border-blue hover:shadow-[0_16px_26px_-19px_rgba(26,47,66,.55)]">
      <Link
        href={url}
        aria-label={product.name}
        className={cn("relative block w-full overflow-hidden bg-white px-2 pb-2 pt-8", size === "lg" ? "aspect-[1.2]" : "aspect-[1.04]")}
      >
        <span className="absolute start-3 top-3 z-10 bg-ice px-2 py-1 text-[9px] font-bold uppercase leading-tight tracking-[.07em]">
          {product.categorySlug === "lab-supplies" ? t.common.researchUseOnly : t.common.purityBadge}
        </span>
        {!inStock ? (
          <span className="absolute end-3 top-3 z-10 bg-oos px-2 py-1 text-[9px] font-bold uppercase leading-tight tracking-[.07em] text-white">
            {t.product.outOfStock}
          </span>
        ) : isBest ? (
          <span className="absolute end-3 top-3 z-10 bg-navy px-2 py-1 text-[9px] font-bold uppercase leading-tight tracking-[.07em] text-white">
            {t.product.bestseller}
          </span>
        ) : isNew ? (
          <span className="absolute end-3 top-3 z-10 bg-navy px-2 py-1 text-[9px] font-bold uppercase leading-tight tracking-[.07em] text-white">
            {t.product.new}
          </span>
        ) : null}
        <span className="block h-full w-full transition-transform duration-500 ease-brand group-hover:scale-[1.045]">
          <ProductImage name={product.name} src={product.images[0]} label={product.variants[0].label} priority={priority} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col bg-navy px-3 pb-3 pt-3.5 text-white sm:px-4 sm:pb-4 sm:pt-4">
        {category ? <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-[.12em] text-blue/80">{category.name}</p> : null}
        <h3 className={cn("font-bold leading-tight tracking-[-.02em]", size === "lg" ? "text-[18px]" : "text-[15px] sm:text-[16px]")}>
          <Link href={url} className="hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <div className="mb-4 mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
          {product.variants.map((v) => (
            <span
              key={v.id}
              className={cn("text-[12px] font-bold leading-tight text-ice", !v.inStock && "line-through opacity-50")}
            >
              {v.label}
            </span>
          ))}
        </div>
        {site.shopEnabled && inStock ? (
          <button
            type="button"
            onClick={handleAdd}
            className={cn(
              "mt-auto flex min-h-[38px] w-full items-center justify-center gap-2 border border-ice bg-white text-[12px] font-bold text-navy transition-colors hover:bg-blue",
              justAdded && "bg-blue",
            )}
          >
            <Icon name={justAdded ? "check" : "cart"} className="size-[15px]" />
            <span>{justAdded ? t.product.added : t.product.addToCart}</span>
          </button>
        ) : (
          <Link
            href={url}
            className="mt-auto flex min-h-[38px] w-full items-center justify-center gap-2 border border-ice bg-white text-[12px] font-bold text-navy transition-colors hover:bg-blue"
          >
            <span>{site.shopEnabled ? t.product.outOfStock : t.common.learnMore}</span>
            {site.shopEnabled ? null : <Icon name="arrow" className="size-[15px]" />}
          </Link>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products, columns = 4, priorityCount = 0, reveal }: { products: Product[]; columns?: 3 | 4; priorityCount?: number; reveal?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5",
        columns === 4 ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3",
      )}
    >
      {products.map((p, i) =>
        reveal ? (
          <Reveal key={p.id} delay={(i % columns) * 90} className="flex min-w-0 [&>article]:flex-1">
            <ProductCard product={p} priority={i < priorityCount} />
          </Reveal>
        ) : (
          <ProductCard key={p.id} product={p} priority={i < priorityCount} />
        ),
      )}
    </div>
  );
}
