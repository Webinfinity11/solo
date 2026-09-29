// Published (approved) reviews for the lab results page. Cached under the
// "reviews" tag; moderating a review in the admin expires it.
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CONTENT_TAG } from "@/lib/content/store";

export const REVIEWS_TAG = "reviews";

export type ReviewMedia = { url: string; type: "image" | "video" };
export type PublicReview = { id: number; productSlug: string; rating: number; body: string; author: string; date: string; media: ReviewMedia[] };

/** Only files uploaded through /api/reviews/upload (our Blob store, reviews/ folder) are accepted. */
export function isReviewMediaUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com") && u.pathname.startsWith("/reviews/");
  } catch {
    return false;
  }
}

function toMedia(value: unknown): ReviewMedia[] {
  return Array.isArray(value) ? value.filter((m): m is ReviewMedia => typeof m?.url === "string" && isReviewMediaUrl(m.url) && (m.type === "image" || m.type === "video")) : [];
}

/** "Giorgi Beridze" -> "Giorgi B." - reviews never show full names or emails. */
function shortName(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

async function readApproved(): Promise<PublicReview[]> {
  const sql = await db();
  if (!sql) return [];
  const rows = (await sql`
    select r.id, r.product_slug, r.rating, r.body, r.media, c.name, r.updated_at
    from reviews r join customers c on c.id = r.customer_id
    where r.status = 'approved'
    order by r.updated_at desc`) as { id: number; product_slug: string; rating: number; body: string; media: unknown; name: string; updated_at: string | Date }[];
  return rows.map((r) => ({
    id: r.id,
    productSlug: r.product_slug,
    rating: r.rating,
    body: r.body,
    author: shortName(r.name),
    date: new Date(r.updated_at).toISOString().slice(0, 10),
    media: toMedia(r.media),
  }));
}

// Also tagged "content", so any admin save refreshes the reviews shown on the site.
export const getApprovedReviews = unstable_cache(readApproved, ["approved-reviews"], { tags: [REVIEWS_TAG, CONTENT_TAG] });

export type AdminReview = PublicReview & { status: "pending" | "approved" | "rejected"; name: string; email: string; lang: string };

export async function getAllReviews(): Promise<AdminReview[]> {
  const sql = await db();
  if (!sql) return [];
  const rows = (await sql`
    select r.id, r.product_slug, r.rating, r.body, r.media, r.status, r.lang, r.updated_at, c.name, c.email
    from reviews r join customers c on c.id = r.customer_id
    order by (r.status = 'pending') desc, r.updated_at desc`) as {
    id: number;
    product_slug: string;
    rating: number;
    body: string;
    media: unknown;
    status: AdminReview["status"];
    lang: string;
    updated_at: string | Date;
    name: string;
    email: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    productSlug: r.product_slug,
    rating: r.rating,
    body: r.body,
    status: r.status,
    lang: r.lang,
    name: r.name,
    email: r.email,
    author: shortName(r.name),
    date: new Date(r.updated_at).toISOString().slice(0, 10),
    media: toMedia(r.media),
  }));
}
