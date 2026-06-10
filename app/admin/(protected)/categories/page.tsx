// Category manager — top-level categories are created/renamed here with no
// code change; the public filter pills pick them up via revalidation.
import { createAdminClient } from "@/lib/supabase/admin";
import { CategoryForm } from "./category-form";

interface CategoryRow {
  id: string;
  slug: string;
  name: { de?: string; en?: string; es?: string };
  sort_order: number;
}

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true });
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  const categories = (data ?? []) as CategoryRow[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-text-tertiary mt-1 text-sm">
          Keep these few and clear — every category becomes a public filter.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <CategoryForm
            key={category.id}
            values={{
              id: category.id,
              slug: category.slug,
              nameDe: category.name?.de,
              nameEn: category.name?.en,
              nameEs: category.name?.es,
              sortOrder: category.sort_order,
            }}
          />
        ))}
      </div>

      <div className="border-border border-t pt-6">
        <h2 className="text-text-tertiary mb-4 text-sm font-semibold tracking-wide uppercase">
          New category
        </h2>
        <CategoryForm values={{}} />
      </div>
    </div>
  );
}
