// Promo code lookups and money math shared by checkout, the storefront check and the admin.
import type { Sql } from "@/lib/db";

export type ActivePromo = { id: number; code: string; discountPercent: number; commissionPercent: number };

/** Codes are stored and compared in upper case without spaces: "nino 10" → "NINO10". */
export function normalizeCode(code: string): string {
  return code.replace(/\s+/g, "").toUpperCase();
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Amount taken off a subtotal for a percent discount. */
export function discountAmount(subtotal: number, percent: number): number {
  return roundMoney((subtotal * percent) / 100);
}

export async function findActivePromo(sql: Sql, code: string): Promise<ActivePromo | null> {
  const normalized = normalizeCode(code);
  if (!normalized || normalized.length > 40) return null;
  const rows = (await sql`
    select id, code, discount_percent, commission_percent from promo_codes
    where code = ${normalized} and active limit 1`) as Record<string, unknown>[];
  const r = rows[0];
  return r
    ? { id: r.id as number, code: r.code as string, discountPercent: Number(r.discount_percent), commissionPercent: Number(r.commission_percent) }
    : null;
}
