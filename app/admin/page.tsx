// /admin — login screen; bounces straight to the dashboard when a valid
// session cookie is already present.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionCookieValue } from "@/lib/admin/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  if (verifySessionCookieValue(cookieStore.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/posts");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-sm">
        <p className="type-eyebrow text-text-tertiary mb-2">TODA</p>
        <h1 className="mb-8 text-2xl font-semibold">Admin</h1>
        <LoginForm />
      </div>
    </main>
  );
}
