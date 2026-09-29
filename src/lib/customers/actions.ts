"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { locales } from "@/i18n/config";
import { getContent } from "@/lib/content/store";
import { isReviewMediaUrl, type ReviewMedia } from "@/lib/reviews";
import {
  accountsAvailable,
  currentCustomer,
  endCustomerSession,
  hashPassword,
  startCustomerSession,
  verifyPassword,
  type Customer,
} from "./auth";

// Error codes map to t.account.errors / t.reviews on the client.
export type AccountResult = { ok: true; customer: Customer } | { ok: false; error: "invalid" | "emailTaken" | "passwordShort" | "mustConfirm" | "unavailable" };
export type ReviewResult = { ok: true } | { ok: false; error: "login" | "tooShort" | "error" };

const email = z.string().trim().toLowerCase().email().max(200);

export async function getCurrentCustomer(): Promise<Customer | null> {
  if (!accountsAvailable()) return null;
  try {
    return await currentCustomer();
  } catch {
    return null;
  }
}

export async function registerCustomer(input: { name: string; email: string; password: string; confirm: boolean }): Promise<AccountResult> {
  if (!accountsAvailable()) return { ok: false, error: "unavailable" };
  const parsed = z
    .object({ name: z.string().trim().min(2).max(80), email, password: z.string().max(200), confirm: z.boolean() })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, password, confirm } = parsed.data;
  if (!confirm) return { ok: false, error: "mustConfirm" };
  if (password.length < 8) return { ok: false, error: "passwordShort" };
  try {
    const sql = (await db())!;
    const rows = (await sql`
      insert into customers (email, name, password_hash) values (${parsed.data.email}, ${name}, ${await hashPassword(password)})
      on conflict (email) do nothing
      returning id, name, email`) as Customer[];
    if (!rows[0]) return { ok: false, error: "emailTaken" };
    await startCustomerSession(rows[0].id);
    return { ok: true, customer: rows[0] };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "unavailable" };
  }
}

export async function loginCustomer(input: { email: string; password: string }): Promise<AccountResult> {
  if (!accountsAvailable()) return { ok: false, error: "unavailable" };
  const parsed = z.object({ email, password: z.string().max(200) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  try {
    const sql = (await db())!;
    const rows = (await sql`select id, name, email, password_hash from customers where email = ${parsed.data.email}`) as (Customer & { password_hash: string })[];
    const row = rows[0];
    if (!row || !(await verifyPassword(parsed.data.password, row.password_hash))) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      return { ok: false, error: "invalid" };
    }
    await startCustomerSession(row.id);
    return { ok: true, customer: { id: row.id, name: row.name, email: row.email } };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "unavailable" };
  }
}

export async function logoutCustomer(): Promise<void> {
  await endCustomerSession();
}

/** Creates the customer's review of a product, or replaces their earlier one (back to moderation). */
export async function submitReview(input: { productSlug: string; rating: number; body: string; lang: string; media?: ReviewMedia[] }): Promise<ReviewResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "login" };
  const parsed = z
    .object({
      productSlug: z.string().min(1),
      rating: z.number().int().min(1).max(5),
      body: z.string().trim().max(2000),
      lang: z.enum(locales),
      media: z.array(z.object({ url: z.string().refine(isReviewMediaUrl), type: z.enum(["image", "video"]) })).max(4).default([]),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "error" };
  const { productSlug, rating, body, lang, media } = parsed.data;
  if (body.length < 10) return { ok: false, error: "tooShort" };
  if (!(await getContent()).products.some((p) => p.slug === productSlug && p.status === "active")) return { ok: false, error: "error" };
  try {
    const sql = (await db())!;
    await sql`
      insert into reviews (customer_id, product_slug, rating, body, lang, media)
      values (${customer.id}, ${productSlug}, ${rating}, ${body}, ${lang}, ${JSON.stringify(media)}::jsonb)
      on conflict (customer_id, product_slug) do update
        set rating = excluded.rating, body = excluded.body, lang = excluded.lang, media = excluded.media, status = 'pending', updated_at = now()`;
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "error" };
  }
}
