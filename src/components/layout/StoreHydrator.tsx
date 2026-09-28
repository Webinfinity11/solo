"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

// The cart persists with skipHydration so the server HTML (empty cart) matches
// the first client render; the saved cart is loaded right after mount.
export function StoreHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}
