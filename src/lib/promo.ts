"use server";

// Creator promo codes on the storefront: checks a code the buyer typed (or opened via ?promo=).
import { db } from "@/lib/db";
import { findActivePromo } from "@/lib/promo-codes";

export type PromoCheck = { ok: true; code: string; percent: number } | { ok: false };

export async function checkPromo(code: string): Promise<PromoCheck> {
  try {
    const sql = await db();
    if (!sql) return { ok: false };
    const promo = await findActivePromo(sql, code);
    return promo ? { ok: true, code: promo.code, percent: promo.discountPercent } : { ok: false };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}
