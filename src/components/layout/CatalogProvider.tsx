"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product, Variant } from "@/lib/types";
import type { CategoryWithCount } from "@/lib/api";

type CatalogValue = {
  products: Product[];
  categories: CategoryWithCount[];
  bySlug: Map<string, Product>;
  findVariant: (variantId: string) => { product: Product; variant: Variant } | undefined;
};

const CatalogContext = createContext<CatalogValue | null>(null);

// Client-side copy of the (small) catalogue for search, cart drawer and filters.
export function CatalogProvider({
  products,
  categories,
  children,
}: {
  products: Product[];
  categories: CategoryWithCount[];
  children: ReactNode;
}) {
  const value = useMemo<CatalogValue>(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const variants = new Map(products.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const)));
    return { products, categories, bySlug, findVariant: (id) => variants.get(id) };
  }, [products, categories]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return value;
}
