// Gate + chrome for everything under /admin except the login screen.
// requireAdmin() here protects PAGES; every server action re-checks itself
// (layouts do not protect actions).
import { AdminDesktopNavigation, AdminMobileNavigation } from "@/components/admin/admin-navigation";
import { adminTextButtonClass } from "@/components/admin/admin-styles";
import { requireAdmin } from "@/lib/admin/auth";
import { logout } from "../actions";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-svh">
      <header className="border-border bg-surface-alt/95 sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-6 lg:gap-8">
            <span className="shrink-0 font-semibold whitespace-nowrap">
              TODA <span className="text-gold-400">Admin</span>
            </span>
            <AdminDesktopNavigation />
          </div>
          <form action={logout} className="shrink-0">
            <button type="submit" className={adminTextButtonClass}>
              Log out
            </button>
          </form>
        </div>
      </header>
      <AdminMobileNavigation />
      <main className="mx-auto max-w-6xl min-w-0 px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
