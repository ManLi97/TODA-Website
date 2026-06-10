// Second root layout — /admin lives OUTSIDE app/[locale] (no top-level
// app/layout.tsx exists, so multiple root layouts are valid). Internal tool:
// English-only, no next-intl, no site Header/Footer, never indexed.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../[locale]/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "400", "600"],
  variable: "--font-inter-var",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TODA Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-surface-base text-text-primary min-h-svh">{children}</body>
    </html>
  );
}
