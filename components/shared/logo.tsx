import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { cn } from "@/lib/utils";

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "text-xl",
  md: "text-[21px]",
  lg: "text-4xl sm:text-5xl",
};

const MARK_SIZE: Record<"sm" | "md" | "lg", number> = {
  sm: 28,
  md: 34,
  lg: 46,
};

/**
 * Wordmark Remnak en Archivo Black: "REM" en ink + "NAK" en brand.
 * Con `withMark`, antepone el cuadrado degradado del logo.
 */
export function Logo({
  size = "md",
  href = "/",
  withMark = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  withMark?: boolean;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-[11px]", className)}>
      {withMark && <BrandMark size={MARK_SIZE[size]} />}
      <span
        className={cn(
          "font-display leading-none tracking-tight text-ink",
          SIZE[size]
        )}
      >
        REM<span className="text-brand">NAK</span>
      </span>
    </span>
  );

  if (href === null) return content;

  return (
    <Link href={href} aria-label="Remnak — inicio" className="inline-flex">
      {content}
    </Link>
  );
}
