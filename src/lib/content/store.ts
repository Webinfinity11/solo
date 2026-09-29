// Content storage: one row per document in Postgres (Neon). Reads are cached under
// the "content" tag; admin saves expire it so the next visit renders fresh pages.
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { locales } from "@/i18n/config";
import { defaultContent } from "./defaults";
import type { ContentKey, SiteContent } from "./types";

export const CONTENT_TAG = "content";

export { hasDatabase };

async function readStored(): Promise<Partial<SiteContent>> {
  const sql = await db();
  if (!sql) return {};
  const rows = (await sql`select key, value from site_content`) as { key: ContentKey; value: unknown }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

const readCached = unstable_cache(readStored, ["site-content"], { tags: [CONTENT_TAG] });

/** Everything the site renders from: saved documents, falling back to the defaults. */
export const getContent = cache(async (): Promise<SiteContent> => {
  return withDefaults(await readCached());
});

/** Uncached read for the admin, so the editor always shows what is in the database. */
export async function getContentFresh(): Promise<SiteContent> {
  return withDefaults(await readStored());
}

// Saved documents predate fields and languages added later in code (e.g. a new
// locale or settings.whatsapp); fill those gaps from the defaults.
function withDefaults(stored: Partial<SiteContent>): SiteContent {
  const localized = <T>(saved: Record<string, T> | undefined, fallback: Record<string, T>) => ({ ...fallback, ...saved });
  return {
    ...defaultContent,
    ...stored,
    settings: {
      ...defaultContent.settings,
      ...stored.settings,
      bank: { ...defaultContent.settings.bank, ...stored.settings?.bank },
      hours: localized(stored.settings?.hours, defaultContent.settings.hours) },
    faq: localized(stored.faq, defaultContent.faq),
    legal: localized(stored.legal, defaultContent.legal),
    texts: localized(stored.texts, defaultContent.texts),
    products: (stored.products ?? defaultContent.products).map((p) => ({
      ...p,
      text: localized(p.text, defaultContent.products.find((d) => d.slug === p.slug)?.text ?? emptyProductText),
    })),
    categories: (stored.categories ?? defaultContent.categories).map((c) => ({
      ...c,
      text: localized(c.text, defaultContent.categories.find((d) => d.slug === c.slug)?.text ?? emptyCategoryText(c.slug)),
    })),
  } as SiteContent;
}

const emptyProductText = Object.fromEntries(locales.map((l) => [l, { shortDescription: "", description: "" }]));
const emptyCategoryText = (slug: string) => Object.fromEntries(locales.map((l) => [l, { name: slug, description: "" }]));

export async function saveContent<K extends ContentKey>(key: K, value: SiteContent[K]): Promise<void> {
  const sql = await db();
  if (!sql) throw new Error("DATABASE_URL is not set - the database is not connected yet.");
  await sql`
    insert into site_content (key, value, updated_at) values (${key}, ${JSON.stringify(value)}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
}
