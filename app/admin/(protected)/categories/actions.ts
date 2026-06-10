"use server";

// Category mutations — same rules as post actions: self-checked auth,
// service-role writes, blanket blog revalidation.
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateBlogPaths } from "@/lib/admin/revalidate";
import { slugify } from "@/lib/blog/slugify";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveCategory(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formString(formData, "id") || null;
  const nameDe = formString(formData, "nameDe");
  const nameEn = formString(formData, "nameEn");
  const nameEs = formString(formData, "nameEs");
  const slug = slugify(formString(formData, "slug") || nameDe);
  if (!slug || !nameDe) {
    throw new Error("German name (and slug) are required");
  }

  const row = {
    slug,
    name: {
      de: nameDe,
      ...(nameEn && { en: nameEn }),
      ...(nameEs && { es: nameEs }),
    },
    sort_order: Number(formString(formData, "sortOrder")) || 0,
  };

  const supabase = createAdminClient();
  const { error } = id
    ? await supabase.from("blog_categories").update(row).eq("id", id)
    : await supabase.from("blog_categories").insert(row);
  if (error) throw new Error(`Category save failed: ${error.message}`);

  revalidateBlogPaths();
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing category id");

  // Posts keep existing (category_id → NULL via FK); they just lose the pill.
  const supabase = createAdminClient();
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) throw new Error(`Category delete failed: ${error.message}`);

  revalidateBlogPaths();
  revalidatePath("/admin/categories");
}
