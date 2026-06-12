import Link from "next/link";

import { cn } from "@/lib/utils";

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl sm:text-5xl",
};

/**
 * Wordmark Remnak en Archivo Black: "REM" en ink + "NAK" en brand —
 * reproduce el lockup del logo en tipografía viva (nítido y theme-aware).
 */
export function Logo({
  size = "md",
  href = "/",
  className,
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}) {
  const mark = (
    <span
      className={cn(
        "font-display leading-none tracking-tight text-ink",
        SIZE[size],
        className
      )}
    >
      REM<span className="text-brand">NAK</span>
    </span>
  );

  if (href === null) return mark;

  return (
    <Link href={href} aria-label="Remnak — inicio" className="inline-flex">
      {mark}
    </Link>
  );
}
