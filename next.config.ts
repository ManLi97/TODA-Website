import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // Blog cover images served from the Supabase public storage bucket.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "znocynswpsfckyfumema.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Cover uploads go through a server action; default limit is 1 MB.
      bodySizeLimit: "8mb",
    },
  },
  // Umfrage-Werkzeug: /umfrage/<slug> serves public/umfrage/<slug>.html as-is
  // (static HTML, no React, no locale prefix — middleware matcher excludes it).
  // afterFiles runs after the filesystem check, so the pretty URL resolves to the
  // public file; unknown slugs fall through to the 404.
  async rewrites() {
    return {
      afterFiles: [{ source: "/umfrage/:slug([a-z0-9-]+)", destination: "/umfrage/:slug.html" }],
    };
  },
  async headers() {
    return [
      {
        source: "/umfrage/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
