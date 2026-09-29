"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { locales } from "@/i18n/config";
import { getContent } from "@/lib/content/store";
import { REVIEWS_TAG, isReviewMediaUrl, type ReviewMedia } from "@/lib/reviews";
import { revalidatePath, updateTag } from "next/cache";
import type { OrderItem } from "@/lib/orders";
import type { OrderStatus } from "@/lib/admin/order-status";
import type { SiteSettings } from "@/lib/content/types";
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
      returning id, name, email, phone, city, address`) as Customer[];
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
    const rows = (await sql`select id, name, email, phone, city, address, password_hash from customers where email = ${parsed.data.email}`) as (Customer & { password_hash: string })[];
    const row = rows[0];
    if (!row || !(await verifyPassword(parsed.data.password, row.password_hash))) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      return { ok: false, error: "invalid" };
    }
    await startCustomerSession(row.id);
    const { password_hash: _hash, ...customer } = row;
    return { ok: true, customer };
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
      insert into reviews (customer_id, product_slug, rating, body, lang, media, status)
      values (${customer.id}, ${productSlug}, ${rating}, ${body}, ${lang}, ${JSON.stringify(media)}::jsonb, 'approved')
      on conflict (customer_id, product_slug) do update
        set rating = excluded.rating, body = excluded.body, lang = excluded.lang, media = excluded.media, status = 'approved', updated_at = now()`;
    // Published straight away (the admin can hide or delete it later), so refresh the pages that list reviews.
    updateTag(REVIEWS_TAG);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "error" };
  }
}

// ---------- account dashboard ----------

export type AccountOrder = {
  number: string;
  status: OrderStatus;
  payment: "bank" | "cod";
  items: OrderItem[];
  total: number;
  city: string;
  address: string;
  createdAt: string;
};
export type AccountReview = { id: number; productSlug: string; rating: number; body: string; status: "pending" | "approved" | "rejected"; date: string; media: ReviewMedia[] };
export type AccountData = { customer: Customer; orders: AccountOrder[]; reviews: AccountReview[]; bank: SiteSettings["bank"] };

/** Everything the account page shows. Orders placed with the same email before signing up are included. */
export async function getAccountData(): Promise<AccountData | null> {
  const customer = await getCurrentCustomer();
  if (!customer) return null;
  const sql = (await db())!;
  const [orders, reviews, content] = await Promise.all([
    sql`select number, status, payment, items, total, city, address, created_at from orders
        where customer_id = ${customer.id} or lower(email) = lower(${customer.email})
        order by created_at desc limit 100` as Promise<Record<string, unknown>[]>,
    sql`select id, product_slug, rating, body, status, media, updated_at from reviews
        where customer_id = ${customer.id} order by updated_at desc` as Promise<Record<string, unknown>[]>,
    getContent(),
  ]);
  return {
    customer,
    bank: content.settings.bank,
    orders: orders.map((o) => ({
      number: o.number as string,
      status: o.status as OrderStatus,
      payment: o.payment as AccountOrder["payment"],
      items: o.items as OrderItem[],
      total: Number(o.total),
      city: o.city as string,
      address: o.address as string,
      createdAt: new Date(o.created_at as string).toISOString(),
    })),
    reviews: reviews.map((r) => ({
      id: r.id as number,
      productSlug: r.product_slug as string,
      rating: r.rating as number,
      body: r.body as string,
      status: r.status as AccountReview["status"],
      date: new Date(r.updated_at as string).toISOString().slice(0, 10),
      media: Array.isArray(r.media) ? (r.media as ReviewMedia[]).filter((m) => typeof m?.url === "string" && isReviewMediaUrl(m.url)) : [],
    })),
  };
}

export type ProfileResult = { ok: true; customer: Customer } | { ok: false; error: "invalid" | "login" | "wrongPassword" | "passwordShort" | "unavailable" };

export async function updateProfile(input: { name: string; phone: string; city: string; address: string }): Promise<ProfileResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "login" };
  const parsed = z
    .object({ name: z.string().trim().min(2).max(80), phone: z.string().trim().max(40), city: z.string().trim().max(80), address: z.string().trim().max(300) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, phone, city, address } = parsed.data;
  try {
    const sql = (await db())!;
    const rows = (await sql`
      update customers set name = ${name}, phone = ${phone}, city = ${city}, address = ${address}
      where id = ${customer.id} returning id, name, email, phone, city, address`) as Customer[];
    return { ok: true, customer: rows[0] };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "unavailable" };
  }
}

export async function changePassword(input: { current: string; next: string }): Promise<ProfileResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "login" };
  if (typeof input.next !== "string" || input.next.length < 8 || input.next.length > 200) return { ok: false, error: "passwordShort" };
  try {
    const sql = (await db())!;
    const rows = (await sql`select password_hash from customers where id = ${customer.id}`) as { password_hash: string }[];
    if (!rows[0] || !(await verifyPassword(String(input.current ?? ""), rows[0].password_hash))) {
      await new Promise((r) => setTimeout(r, 600));
      return { ok: false, error: "wrongPassword" };
    }
    await sql`update customers set password_hash = ${await hashPassword(input.next)} where id = ${customer.id}`;
    return { ok: true, customer };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "unavailable" };
  }
}

// ---------- the customer's own reviews ----------

/** Edit one of the customer's reviews from the account page (rating, text, and which attachments stay). */
export async function updateMyReview(input: { id: number; rating: number; body: string; media: ReviewMedia[] }): Promise<ReviewResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "login" };
  const parsed = z
    .object({
      id: z.number().int().positive(),
      rating: z.number().int().min(1).max(5),
      body: z.string().trim().max(2000),
      media: z.array(z.object({ url: z.string().refine(isReviewMediaUrl), type: z.enum(["image", "video"]) })).max(4),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "error" };
  const { id, rating, body, media } = parsed.data;
  if (body.length < 10) return { ok: false, error: "tooShort" };
  try {
    const sql = (await db())!;
    const rows = await sql`
      update reviews set rating = ${rating}, body = ${body}, media = ${JSON.stringify(media)}::jsonb, updated_at = now()
      where id = ${id} and customer_id = ${customer.id} returning id`;
    if (!rows.length) return { ok: false, error: "error" };
    updateTag(REVIEWS_TAG);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "error" };
  }
}

export async function deleteMyReview(id: number): Promise<ReviewResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "login" };
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "error" };
  try {
    const sql = (await db())!;
    const rows = await sql`delete from reviews where id = ${id} and customer_id = ${customer.id} returning id`;
    if (!rows.length) return { ok: false, error: "error" };
    updateTag(REVIEWS_TAG);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "error" };
  }
}
