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
};

export default withNextIntl(nextConfig);
