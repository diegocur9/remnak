import { cn } from "@/lib/utils";

/**
 * Marca Remnak: cuadrado redondeado con degradado naranja y la "R" del logo.
 * Reproduce el mark del header del design file.
 */
export function BrandMark({
  size = 34,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const radius = Math.round(size * 0.26);
  const glyph = Math.round(size * 0.53);
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(145deg,#F58440,#E0571B)",
        boxShadow:
          "0 4px 10px rgba(224,87,27,.32),inset 0 1px 0 rgba(255,255,255,.4)",
      }}
      aria-hidden
    >
      <svg width={glyph} height={glyph} viewBox="0 0 32 32" fill="none">
        <path
          d="M7 6h7a7 7 0 0 1 0 14h-3l7 6"
          stroke="#fff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 6v20" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
