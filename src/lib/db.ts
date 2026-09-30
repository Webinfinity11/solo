// Postgres (Neon) connection shared by the content store, customer accounts and reviews.
// Tables are created on first use, so a fresh database needs no migration step.
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type Sql = NeonQueryFunction<false, false>;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let schemaReady: Promise<unknown> | null = null;

async function createSchema(sql: Sql) {
  await sql`
    create table if not exists site_content (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )`;
  await sql`
    create table if not exists customers (
      id serial primary key,
      email text not null unique,
      name text not null,
      password_hash text not null,
      created_at timestamptz not null default now()
    )`;
  await sql`
    create table if not exists reviews (
      id serial primary key,
      customer_id integer not null references customers(id) on delete cascade,
      product_slug text not null,
      rating integer not null check (rating between 1 and 5),
      body text not null,
      lang text not null,
      status text not null default 'pending',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (customer_id, product_slug)
    )`;
  // Photos/videos attached to a review: [{ url, type: "image" | "video" }].
  await sql`alter table reviews add column if not exists media jsonb not null default '[]'::jsonb`;
  // Profile details the customer keeps in their account; used to prefill checkout.
  await sql`alter table customers add column if not exists phone text not null default ''`;
  await sql`alter table customers add column if not exists city text not null default ''`;
  await sql`alter table customers add column if not exists address text not null default ''`;
  await sql`
    create table if not exists orders (
      id serial primary key,
      number text not null unique,
      status text not null default 'new',
      payment text not null,
      first_name text not null,
      last_name text not null,
      phone text not null,
      email text not null,
      city text not null,
      address text not null,
      note text not null default '',
      items jsonb not null,
      total numeric(10, 2) not null,
      currency text not null,
      lang text not null,
      customer_id integer references customers(id) on delete set null,
      created_at timestamptz not null default now()
    )`;
  // Creator promo codes: the buyer gets discount_percent off, the code's owner earns
  // commission_percent of what the buyer paid.
  await sql`
    create table if not exists promo_codes (
      id serial primary key,
      code text not null unique,
      owner text not null,
      contact text not null default '',
      discount_percent numeric(5, 2) not null default 10,
      commission_percent numeric(5, 2) not null default 20,
      active boolean not null default true,
      created_at timestamptz not null default now()
    )`;
  // Commission paid out to a code's owner.
  await sql`
    create table if not exists promo_payouts (
      id serial primary key,
      promo_code_id integer not null references promo_codes(id) on delete cascade,
      amount numeric(10, 2) not null,
      note text not null default '',
      created_at timestamptz not null default now()
    )`;
  // Promo details are copied onto the order, so later edits to the code do not change past orders.
  await sql`alter table orders add column if not exists promo_code_id integer references promo_codes(id) on delete set null`;
  await sql`alter table orders add column if not exists promo_code text`;
  await sql`alter table orders add column if not exists subtotal numeric(10, 2)`;
  await sql`alter table orders add column if not exists discount numeric(10, 2) not null default 0`;
  await sql`alter table orders add column if not exists commission numeric(10, 2) not null default 0`;
}

/** Connected client with the schema in place, or null when DATABASE_URL is not set. */
export async function db(): Promise<Sql | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const sql = neon(url);
  schemaReady ??= createSchema(sql)
    // Parallel build workers can race on "create table if not exists" (unique_violation /
    // duplicate_table); the other worker created it, so a second pass succeeds.
    .catch((e) => (["23505", "42P07"].includes((e as { code?: string }).code ?? "") ? createSchema(sql) : Promise.reject(e)))
    .catch((e) => {
      schemaReady = null;
      throw e;
    });
  await schemaReady;
  return sql;
}
