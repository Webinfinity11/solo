// Content storage: one row per document in Postgres (Neon). Reads are cached under
// the "content" tag; admin saves expire it so the next visit renders fresh pages.
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { neon } from "@neondatabase/serverless";
import { defaultContent } from "./defaults";
import type { ContentKey, SiteContent } from "./types";

export const CONTENT_TAG = "content";

function sql() {
  const url = process.env.DATABASE_URL;
  return url ? neon(url) : null;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let tableReady: Promise<unknown> | null = null;
function ensureTable(db: NonNullable<ReturnType<typeof sql>>) {
  tableReady ??= db`
    create table if not exists site_content (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )`;
  return tableReady;
}

async function readStored(): Promise<Partial<SiteContent>> {
  const db = sql();
  if (!db) return {};
  await ensureTable(db);
  const rows = (await db`select key, value from site_content`) as { key: ContentKey; value: unknown }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

const readCached = unstable_cache(readStored, ["site-content"], { tags: [CONTENT_TAG] });

/** Everything the site renders from: saved documents, falling back to the defaults. */
export const getContent = cache(async (): Promise<SiteContent> => {
  const stored = await readCached();
  return { ...defaultContent, ...stored };
});

/** Uncached read for the admin, so the editor always shows what is in the database. */
export async function getContentFresh(): Promise<SiteContent> {
  return { ...defaultContent, ...(await readStored()) };
}

export async function saveContent<K extends ContentKey>(key: K, value: SiteContent[K]): Promise<void> {
  const db = sql();
  if (!db) throw new Error("DATABASE_URL is not set — the database is not connected yet.");
  await ensureTable(db);
  await db`
    insert into site_content (key, value, updated_at) values (${key}, ${JSON.stringify(value)}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
}
