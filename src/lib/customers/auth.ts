// Customer accounts: scrypt password hashes and a signed, expiring session cookie
// (SESSION_SECRET). The account holds name, email and an optional delivery address.
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const scrypt = promisify(scryptCb) as (password: string, salt: string, keylen: number) => Promise<Buffer>;
const COOKIE = "solo_customer";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type Customer = { id: number; name: string; email: string; phone: string; city: string; address: string };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scrypt(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

function secret(): string | null {
  return process.env.SESSION_SECRET || null;
}

export function accountsAvailable(): boolean {
  return Boolean(secret() && process.env.DATABASE_URL);
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export async function startCustomerSession(id: number): Promise<void> {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET is not set");
  const payload = `${id}.${Math.floor(Date.now() / 1000) + MAX_AGE}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endCustomerSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** The signed-in customer, or null. Reads the cookie, so only call it from actions or dynamic routes. */
export async function currentCustomer(): Promise<Customer | null> {
  const key = secret();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!key || !value) return null;
  const [id, expires, signature] = value.split(".");
  if (!id || !expires || !signature || Number(expires) * 1000 < Date.now()) return null;
  const expected = Buffer.from(sign(`${id}.${expires}`, key));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const sql = await db();
  if (!sql) return null;
  const rows = (await sql`select id, name, email, phone, city, address from customers where id = ${Number(id)}`) as Customer[];
  return rows[0] ?? null;
}
