import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

// Logo recortado: 1529×353 (relación ~4.33).
const LOGO_RATIO = 1529 / 353;
const HEIGHT: Record<"sm" | "md" | "lg", number> = {
  sm: 20,
  md: 28,
  lg: 40,
};

/** Logo Remnak (imagen del lockup oficial). */
export function Logo({
  size = "md",
  href = "/",
  className,
  priority = false,
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
  priority?: boolean;
}) {
  const h = HEIGHT[size];
  const w = Math.round(h * LOGO_RATIO);

  const img = (
    <Image
      src="/remnak-logo.png"
      alt="Remnak"
      width={w}
      height={h}
      priority={priority}
      className={cn("h-auto w-auto", className)}
      style={{ height: h, width: w }}
    />
  );

  if (href === null) return img;

  return (
    <Link href={href} aria-label="Remnak — inicio" className="inline-flex">
      {img}
    </Link>
  );
}
