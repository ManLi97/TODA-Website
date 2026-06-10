// Admin session auth — stateless HMAC cookie, no session store, no Supabase Auth.
// Cookie value: "<expiryEpochMs>.<hmacSha256Hex(expiry, ADMIN_SESSION_SECRET)>".
// Swapping to Supabase Auth later means replacing this file only — callers use
// requireAdmin() / verifyPassword() and never touch cookie mechanics.
import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "toda_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

/** Timing-safe comparison via fixed-length digests (inputs may differ in length). */
function safeEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function createSessionCookieValue(): { value: string; expires: Date } {
  const expiry = Date.now() + SESSION_TTL_MS;
  return {
    value: `${expiry}.${sign(String(expiry))}`,
    expires: new Date(expiry),
  };
}

export function verifySessionCookieValue(value: string | undefined): boolean {
  if (!value) return false;
  const separator = value.indexOf(".");
  if (separator === -1) return false;

  const expiry = value.slice(0, separator);
  const mac = value.slice(separator + 1);
  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs) || expiryMs < Date.now()) return false;

  return safeEqual(mac, sign(expiry));
}

/** Gate for protected admin pages AND every admin server action (layouts don't protect actions). */
export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!verifySessionCookieValue(session)) redirect("/admin");
}
