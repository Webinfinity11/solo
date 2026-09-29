import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { site } from "@/data/site";
import type { Product, Variant } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Uppercase for small caps-style labels. CSS text-transform leaves Georgian untouched,
 * but toUpperCase() maps Mkhedruli to Mtavruli (Unicode 11), Latin/Cyrillic as usual.
 */
export function mtavruli(value: string): string {
  return value.toUpperCase();
}

export function formatPrice(value: number): string {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(2);
  // Lari is written after the amount: 10 ₾.
  return `${rounded} ${site.currencySymbol}`;
}

export function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/\+/g, "-plus").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

/** "10 ₾" or "10 ₾ – 25 ₾" across the product's sizes. */
export function priceRange(product: Product): string {
  const prices = product.variants.map((v) => v.price);
  const [lo, hi] = [Math.min(...prices), Math.max(...prices)];
  return lo === hi ? formatPrice(lo) : `${formatPrice(lo)} – ${formatPrice(hi)}`;
}

export function isInStock(product: Product): boolean {
  return product.variants.some((v) => v.inStock);
}

export function firstAvailableVariant(product: Product): Variant {
  return product.variants.find((v) => v.inStock) ?? product.variants[0];
}

export function formatDate(iso: string, lang: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(lang === "ka" ? "ka-GE" : lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
