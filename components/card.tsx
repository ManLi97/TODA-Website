// Card component — used for blog listing and product overview grids.
// Styling follows DESIGN.md card-elevated: surface-elevated background, border-subtle border,
// rounded-lg (16px), 24px padding. No box-shadow — elevation via surface color.
// Hover: 2px lift (translateY) + border lightens, per MOTION.md.
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface CardProps {
  title: string;
  excerpt?: string;
  // Flexible single label: date, category, or any short metadata string
  label?: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

export function Card({
  title,
  excerpt,
  label,
  href,
  imageSrc,
  imageAlt,
  className,
}: CardProps) {
  const wrapperClasses = [
    "group block bg-surface-elevated border border-border-subtle rounded-lg overflow-hidden",
    "transition-[transform,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
    "hover:-translate-y-0.5 hover:border-text-tertiary",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={wrapperClasses}>
      {/* Cover image — omitted when no imageSrc, no placeholder */}
      {imageSrc && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02]"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {label && (
          <p className="text-[12px] font-normal leading-none tracking-[-0.05px] text-text-tertiary mb-3">
            {label}
          </p>
        )}
        <h3 className="text-[17px] font-semibold leading-[1.47] tracking-[-0.2px] text-text-primary">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 text-[14px] font-normal leading-[1.43] tracking-[-0.1px] text-text-secondary line-clamp-3">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
