"use server";

// Checkout: validates the cart against the current catalogue (prices are never
// taken from the browser) and stores the order for the admin to process.
import { randomInt } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { locales } from "@/i18n/config";
import { site } from "@/data/site";
import { getContent } from "@/lib/content/store";
import { getCurrentCustomer } from "@/lib/customers/actions";
import { discountAmount, findActivePromo, roundMoney } from "@/lib/promo-codes";

export type OrderItem = { productSlug: string; name: string; variantId: string; label: string; price: number; quantity: number };
// reason "promo": the code was switched off or deleted after the buyer applied it.
export type PlaceOrderResult = { ok: true; number: string; total: number; payment: "bank" | "cod" } | { ok: false; reason?: "promo" };

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(200),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(4).max(300),
  note: z.string().trim().max(1000).optional().default(""),
  payment: z.enum(["bank", "cod"]),
  lang: z.enum(locales),
  items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
  promo: z.string().trim().max(40).optional(),
});

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  if (!site.shopEnabled) return { ok: false };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const o = parsed.data;

  const { products } = await getContent();
  const items: OrderItem[] = [];
  for (const line of o.items) {
    const product = products.find((p) => p.status === "active" && p.variants.some((v) => v.id === line.variantId));
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant || !variant.inStock) return { ok: false };
    items.push({ productSlug: product.slug, name: product.name, variantId: variant.id, label: variant.label, price: variant.price, quantity: line.quantity });
  }
  const subtotal = roundMoney(items.reduce((sum, i) => sum + i.price * i.quantity, 0));

  try {
    const sql = await db();
    if (!sql) return { ok: false };
    const promo = o.promo ? await findActivePromo(sql, o.promo) : null;
    if (o.promo && !promo) return { ok: false, reason: "promo" };
    const discount = promo ? discountAmount(subtotal, promo.discountPercent) : 0;
    const total = roundMoney(subtotal - discount);
    // The creator earns a share of what the buyer actually pays.
    const commission = promo ? roundMoney((total * promo.commissionPercent) / 100) : 0;
    const customer = await getCurrentCustomer();
    // Short, readable number for the payment reference: SR-260929-4821.
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    for (let attempt = 0; attempt < 5; attempt++) {
      const number = `SR-${date}-${randomInt(1000, 10000)}`;
      const rows = await sql`
        insert into orders (number, payment, first_name, last_name, phone, email, city, address, note, items, total, currency, lang, customer_id,
                            subtotal, discount, promo_code_id, promo_code, commission)
        values (${number}, ${o.payment}, ${o.firstName}, ${o.lastName}, ${o.phone}, ${o.email}, ${o.city}, ${o.address}, ${o.note},
                ${JSON.stringify(items)}::jsonb, ${total}, ${site.currency}, ${o.lang}, ${customer?.id ?? null},
                ${subtotal}, ${discount}, ${promo?.id ?? null}, ${promo?.code ?? null}, ${commission})
        on conflict (number) do nothing
        returning number`;
      if (rows.length) return { ok: true, number, total, payment: o.payment };
    }
  } catch (e) {
    console.error(e);
  }
  return { ok: false };
}
