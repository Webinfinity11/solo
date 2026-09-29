// Admin access: one password (ADMIN_PASSWORD) and a signed, expiring session cookie.
// The password is also the signing key, so changing it signs everyone out.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "solo_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // Hash first so the comparison does not leak the length.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function isPasswordConfigured(): boolean {
  return Boolean(secret());
}

export function checkPassword(input: string): boolean {
  const key = secret();
  return Boolean(key) && safeEqual(input, key!);
}

export async function startSession(): Promise<void> {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set");
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export function isValidSession(value: string | undefined): boolean {
  const key = secret();
  if (!key || !value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) * 1000 < Date.now()) return false;
  return safeEqual(signature, sign(expires, key));
}

export async function isAdmin(): Promise<boolean> {
  return isValidSession((await cookies()).get(COOKIE)?.value);
}

/** Guard for admin pages and server actions. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
