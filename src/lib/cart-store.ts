"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

export const MAX_QUANTITY = 99;

type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  add: (productSlug: string, variantId: string, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      add: (productSlug, variantId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === variantId);
          const items = existing
            ? state.items.map((i) =>
                i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + quantity) } : i,
              )
            : [...state.items, { productSlug, variantId, quantity: Math.min(MAX_QUANTITY, quantity) }];
          return { items, drawerOpen: true };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QUANTITY, quantity) } : i)),
        })),
      remove: (variantId) => set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "solo-research-cart-v1",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);

/** False until the saved cart has been read from localStorage (avoids an "empty cart" flash). */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useCart.persist.hasHydrated()) setHydrated(true);
    return useCart.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
