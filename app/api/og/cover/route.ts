// OG-image endpoint for blog covers.
//
// Purpose: social crawlers (WhatsApp, Facebook, X, LinkedIn) refuse to render
// og:images above ~600 KB. The raw cover PNGs in Supabase storage are 2–2.5 MB,
// so WhatsApp showed a preview with no image. This route fetches the cover and
// re-encodes it to a small 1200×630 JPEG (~150–250 KB) on demand.
//
// Why a JPEG and not Supabase's transform endpoint: Supabase resize keeps the
// source PNG format (quality is ignored for lossless PNG → still ~1 MB) and its
// only lossy output is WebP, which WhatsApp does not reliably render.
//
// Contract: GET /api/og/cover?path=<id>/<file>.<ext> → image/jpeg.
// `path` is the blog_posts.cover_image_path value (relative to the blog-covers
// bucket). Validated strictly to prevent SSRF — only objects inside our own
// public blog-covers bucket can be fetched.

import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";

// sharp needs native bindings — force Node.js runtime (not edge).
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://todasolutions.com";

// Cover paths look like "<uuid>/<timestamp>.png" — no traversal, no scheme.
const COVER_PATH = /^[\w-]+\/[\w.-]+\.(png|jpe?g|webp)$/i;

// Brand fallback (also used on any error) so the og:image URL is never empty.
function fallback() {
  return NextResponse.redirect(`${SITE_URL}/og-image.png`, 302);
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!SUPABASE_URL || !path || path.includes("..") || !COVER_PATH.test(path)) {
    return fallback();
  }

  const source = `${SUPABASE_URL}/storage/v1/object/public/blog-covers/${path}`;

  try {
    const upstream = await fetch(source);
    if (!upstream.ok) return fallback();

    const input = Buffer.from(await upstream.arrayBuffer());
    const jpeg = await sharp(input)
      .resize(1200, 630, { fit: "cover" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        // Cover paths embed a timestamp, so a changed cover yields a new URL —
        // safe to cache aggressively at the CDN. Crawlers fetch this rarely.
        "Cache-Control":
          "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400",
      },
    });
  } catch {
    return fallback();
  }
}
