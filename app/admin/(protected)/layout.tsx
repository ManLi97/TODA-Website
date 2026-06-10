// Gate + chrome for everything under /admin except the login screen.
// requireAdmin() here protects PAGES; every server action re-checks itself
// (layouts do not protect actions).
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { logout } from "../actions";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-svh">
      <header className="border-border bg-surface-alt border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <span className="font-semibold">
              TODA <span className="text-gold-400">Admin</span>
            </span>
            <nav className="flex items-center gap-5 text-sm">
              <Link
                href="/admin/posts"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Posts
              </Link>
              <Link
                href="/admin/categories"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Categories
              </Link>
            </nav>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-text-tertiary hover:text-text-primary text-sm transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
