// Blanket on-demand revalidation of every public blog surface + sitemap.
// Called by every admin mutation so publishes/edits appear without a redeploy.
// Blanket (route-pattern) invalidation is deliberate: a category rename or
// per-locale publish touches listing, category pages, article alternates and
// the sitemap at once — targeting individual paths would miss siblings.
import { revalidatePath } from "next/cache";

export function revalidateBlogPaths(): void {
  revalidatePath("/[locale]/blog", "page");
  revalidatePath("/[locale]/blog/[slug]", "page");
  revalidatePath("/[locale]/blog/category/[category]", "page");
  revalidatePath("/sitemap.xml");
}
