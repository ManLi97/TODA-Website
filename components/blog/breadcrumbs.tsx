// Visible breadcrumb trail — the exact counterpart of the BreadcrumbList in
// the page's JSON-LD (URL contract D6): same labels, same order, last item is
// the current page (no link). Server Component; locale-aware Link.
import { Link } from "@/i18n/navigation";

export type BreadcrumbTrailItem = { label: string; href?: string };

interface BreadcrumbsProps {
  items: BreadcrumbTrailItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="type-caption flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden="true" className="select-none">
                ›
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-text-secondary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-text-secondary">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
