"use server";

// Login/logout for the env-var password gate. Session is a stateless HMAC
// cookie scoped to /admin — see lib/admin/auth.ts for the mechanics.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, createSessionCookieValue, verifyPassword } from "@/lib/admin/auth";

export interface LoginState {
  error: string | null;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !verifyPassword(password)) {
    // Damp brute-force attempts; the real ceiling is the password itself.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { error: "Wrong password." };
  }

  const { value, expires } = createSessionCookieValue();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires,
  });
  redirect("/admin/posts");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", { path: "/admin", maxAge: 0 });
  redirect("/admin");
}
