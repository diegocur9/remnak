import type { Database } from "@/types/database";

type ListingCategory = Database["public"]["Enums"]["listing_category"];

/**
 * Glifos duotono naranja (variante del estilo 3D del design file), sobre tile
 * "iluminado". Sin SVGs complejos: rectángulos/círculos/paths simples.
 */
const GLYPHS: Record<ListingCategory, React.ReactNode> = {
  materiales: (
    <>
      <rect x="4" y="6" width="11" height="7" rx="1.6" fill="#F26B2C" />
      <rect x="17" y="6" width="11" height="7" rx="1.6" fill="#FBA76B" />
      <rect x="4" y="15" width="7" height="7" rx="1.6" fill="#FBA76B" />
      <rect x="13" y="15" width="15" height="7" rx="1.6" fill="#F26B2C" />
    </>
  ),
  maquinaria: (
    <>
      <rect x="3" y="16" width="19" height="6" rx="2" fill="#F26B2C" />
      <rect x="13" y="10" width="7" height="7" rx="1.6" fill="#FBA76B" />
      <path d="M22 18l6-4v5z" fill="#F26B2C" />
      <circle cx="9" cy="24" r="3.1" fill="#B4501C" />
      <circle cx="19" cy="24" r="3.1" fill="#B4501C" />
    </>
  ),
  herramientas: (
    <g transform="rotate(45 16 16)">
      <rect x="14.3" y="6" width="3.4" height="20" rx="1.6" fill="#B4501C" />
      <rect x="9" y="5" width="14" height="6" rx="2.2" fill="#F26B2C" />
    </g>
  ),
  profesionales: (
    <>
      <path d="M5 22a11 11 0 0 1 22 0Z" fill="#F26B2C" />
      <rect x="3" y="21" width="26" height="4" rx="2" fill="#B4501C" />
      <rect x="14.4" y="9" width="3.2" height="6" rx="1.5" fill="#FBA76B" />
    </>
  ),
  logistica: (
    <>
      <rect x="2" y="11" width="15" height="9" rx="2" fill="#F26B2C" />
      <path d="M17 14h6l3 4v2h-9z" fill="#FBA76B" />
      <circle cx="8" cy="22" r="2.7" fill="#B4501C" />
      <circle cx="21" cy="22" r="2.7" fill="#B4501C" />
    </>
  ),
  liquidacion: (
    <>
      <path d="M15 5H7a2 2 0 0 0-2 2v8l12 12 10-10L15 5Z" fill="#F26B2C" />
      <circle cx="10.5" cy="10.5" r="2.1" fill="#fff" />
    </>
  ),
};

export function CategoryIcon({
  category,
  size = 56,
}: {
  category: ListingCategory;
  size?: number;
}) {
  const glyph = Math.round(size * 0.54);
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        background: "linear-gradient(145deg,#FFF3EA,#FFE1CD)",
        boxShadow:
          "0 7px 16px rgba(242,107,44,.20),inset 0 1px 0 rgba(255,255,255,.8)",
      }}
      aria-hidden
    >
      <svg width={glyph} height={glyph} viewBox="0 0 32 32">
        {GLYPHS[category]}
      </svg>
    </span>
  );
}
