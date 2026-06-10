// Category filter row — deck-style label pills as locale-aware links.
// Active pill wears the gold tint; inactive pills are neutral hairlines that
// tint gold on hover (.label-interactive). Wraps on mobile.
import { Link } from "@/i18n/navigation";
import { categoryName } from "@/lib/blog/format";
import type { BlogLocale, Category } from "@/lib/blog/types";

interface CategoryPillsProps {
  categories: Category[];
  locale: BlogLocale;
  allLabel: string;
  activeSlug?: string;
}

export function CategoryPills({ categories, locale, allLabel, activeSlug }: CategoryPillsProps) {
  if (categories.length === 0) return null;

  const pillClass = (active: boolean) =>
    ["label", "label-interactive", active ? "label--gold" : ""].filter(Boolean).join(" ");

  return (
    <nav aria-label="Blog categories" className="flex flex-wrap gap-2">
      <Link href="/blog" className={pillClass(!activeSlug)}>
        {allLabel}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/blog/category/${category.slug}`}
          className={pillClass(category.slug === activeSlug)}
        >
          {categoryName(category.name, locale)}
        </Link>
      ))}
    </nav>
  );
}
