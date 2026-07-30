import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/** Avatar: foto si hay `src`; si no, iniciales sobre el color de marca. */
const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { src?: string | null }
>(({ className, src, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-semibold text-brand-foreground",
      className
    )}
    {...props}
  >
    {src ? (
      <Image
        src={src}
        alt=""
        fill
        sizes="40px"
        className="object-cover"
        unoptimized={!src.includes(".supabase.co/storage/")}
      />
    ) : (
      children
    )}
  </span>
));
Avatar.displayName = "Avatar";

export { Avatar };

/** Deriva hasta 2 iniciales de un nombre completo. */
export function initialsFromName(name: string | null | undefined): string {
  if (!name) return "RK";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "RK";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? first;
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}
