// Button component — renders <button> by default.
// Also exports buttonVariants() for styling <Link> elements as buttons (Hero CTAs, nav CTAs etc.)
// without coupling this file to any router.

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface VariantOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-gold-500 text-surface-base hover:bg-gold-400 active:bg-gold-600",
  secondary: "border border-border-subtle text-text-primary hover:border-text-tertiary",
  ghost: "text-text-secondary hover:text-text-primary",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-[14px] px-5 py-2",
  md: "text-[16px] px-7 py-3",
  lg: "text-[16px] px-8 py-4",
};

const BASE =
  "inline-flex items-center justify-center font-semibold rounded-[980px] min-h-11 " +
  "transition-all duration-150 ease-[var(--ease-entry)] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 " +
  "active:scale-[0.97] cursor-pointer select-none";

// Pure function — no JSX, safe to call from Server Components and Client Components alike.
export function buttonVariants({ variant = "primary", size = "md" }: VariantOptions = {}): string {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [buttonVariants({ variant, size }), className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
