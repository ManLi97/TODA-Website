// Card component — used for blog listing, product overview grids, and static feature items.
// When href is provided: renders as <Link> with border hover + line-clamp — use for navigable cards.
// When href is omitted: renders as <div> without hover states + full excerpt — use for static items.
// Depth: surface color + the .elevated recipe (surface-aware shadow cascaded by PageSection).
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface CardProps {
  title: string;
  excerpt?: string;
  // Flexible single label: date, category, or any short metadata string
  label?: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

export function Card({ title, excerpt, label, href, imageSrc, imageAlt, className }: CardProps) {
  const baseClasses = [
    "bg-surface-elevated border border-border-subtle rounded-card overflow-hidden elevated",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Interactive classes applied only when the card is a link
  const linkClasses = [
    baseClasses,
    "group block transition-[border-color] duration-200 ease-[var(--ease-entry)]",
    "hover:border-text-tertiary",
  ].join(" ");

  const content = (
    <>
      {/* Cover image — omitted when no imageSrc, no placeholder */}
      {imageSrc && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {label && (
          <p className="text-text-tertiary mb-3 text-[12px] leading-none font-normal tracking-[-0.05px]">
            {label}
          </p>
        )}
        <h3 className="text-text-primary text-[17px] leading-[1.47] font-semibold tracking-[-0.2px]">
          {title}
        </h3>
        {excerpt && (
          <p
            className={[
              "text-text-secondary mt-2 text-[14px] leading-[1.43] font-normal tracking-[-0.1px]",
              // Clamp only for link cards — destination holds the full content.
              // Static feature cards show the full excerpt since there is no "read more" target.
              href ? "line-clamp-3" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {excerpt}
          </p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={linkClasses}>
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
