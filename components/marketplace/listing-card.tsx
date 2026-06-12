import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import type { ListingCardView } from "@/lib/marketplace/catalog";

/** Tarjeta de anuncio fiel al design file (ListingCard.dc.html). */
export function ListingCard({ it }: { it: ListingCardView }) {
  return (
    <Link
      href={`/producto/${it.id}`}
      className="group flex flex-col overflow-hidden rounded-[14px] border border-[#E8E1D9] bg-white shadow-[0_1px_2px_rgba(41,35,31,0.04)] transition duration-150 hover:-translate-y-[3px] hover:border-[#E0D6CB] hover:shadow-[0_14px_30px_rgba(41,35,31,0.11)]"
    >
      {/* Imagen (placeholder rayado) */}
      <div className="relative flex h-[172px] items-end bg-[repeating-linear-gradient(135deg,#F1EAE1,#F1EAE1_11px,#ECE3D8_11px,#ECE3D8_22px)] p-3">
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white px-[9px] py-1 text-[11px] font-bold text-ink shadow-[0_1px_3px_rgba(41,35,31,.10)]">
          {it.catLabel}
        </span>
        {it.verified && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#E7F4EC] px-[9px] py-1 text-[11px] font-bold text-[#1F8A4C] shadow-[0_1px_3px_rgba(41,35,31,.08)]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1F8A4C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Verificado
          </span>
        )}
        <span className="rounded-md bg-white/70 px-[7px] py-[3px] font-mono text-[10.5px] text-[#9A8F84]">
          {it.photoLabel}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-col gap-[7px] px-[15px] pb-[15px] pt-[14px]">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-md px-2 py-[3px] text-[11px] font-bold"
            style={{ color: it.condColor, background: it.condBg }}
          >
            {it.condLabel}
          </span>
          <span className="inline-flex items-center gap-[3px] text-xs text-[#8B8178]">
            <MapPin className="h-[11px] w-[11px] text-[#A89E94]" strokeWidth={2.2} />
            {it.locationLabel}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[40px] text-[15.5px] font-bold leading-[1.3] text-ink">
          {it.title}
        </h3>

        <div className="mt-px flex items-baseline gap-[5px]">
          <span className="font-mono text-[19px] font-bold tabular-nums text-ink">
            {it.priceMain}
          </span>
          {it.priceSuffix && (
            <span className="text-xs font-semibold text-[#8B8178]">
              {it.priceSuffix}
            </span>
          )}
        </div>

        <div className="mt-[3px] flex items-center justify-between border-t border-[#F0E9E1] pt-[10px]">
          <span className="inline-flex items-center gap-1 text-[12.5px] text-[#6B6259]">
            <Star className="h-[13px] w-[13px] fill-brand text-brand" strokeWidth={0} />
            {it.rating}
            <span className="text-[#A89E94]">({it.ratingCount})</span>
          </span>
          <span className="text-[11.5px] font-semibold text-brand-strong">
            {it.fleteLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
