import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABEL,
  CONDITION_META,
  getSampleListing,
} from "@/lib/marketplace/catalog";
import { formatMXN } from "@/lib/utils";

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const listing = getSampleListing(params.id);
  return { title: listing?.title ?? "Anuncio" };
}

export default function ProductoPage({ params }: { params: { id: string } }) {
  const it = getSampleListing(params.id);
  if (!it) notFound();

  const cm = CONDITION_META[it.cond];
  const suffix = it.priceType === "renta_diaria" ? " / día" : "";

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-8 lg:px-8">
      <Link
        href="/buscar"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-texto-suave hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex h-[360px] items-end rounded-[18px] border border-[#ECE4DB] bg-[repeating-linear-gradient(135deg,#EFE7DD,#EFE7DD_13px,#E9E0D5_13px,#E9E0D5_26px)] p-4">
          <span className="rounded-md bg-white/70 px-2 py-[3px] font-mono text-[11px] text-[#9A8F84]">
            {it.photoLabel}
          </span>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white px-[9px] py-1 text-[11px] font-bold text-ink shadow-[0_1px_3px_rgba(41,35,31,.10)]">
              {CATEGORY_LABEL[it.cat]}
            </span>
            <span
              className="inline-flex items-center rounded-md px-2 py-[3px] text-[11px] font-bold"
              style={{ color: cm.color, background: cm.bg }}
            >
              {cm.label}
            </span>
            {it.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F4EC] px-[9px] py-1 text-[11px] font-bold text-[#1F8A4C]">
                <ShieldCheck className="h-3 w-3" strokeWidth={2.6} />
                Proveedor verificado
              </span>
            )}
          </div>

          <h1 className="font-display text-[28px] leading-tight tracking-[-.01em] text-ink">
            {it.title}
          </h1>
          <p className="mt-1 text-[13.5px] text-texto-suave">
            {it.seller} · {it.mun}, {it.est}
          </p>

          <div className="mt-3 flex items-center gap-1 text-[13px] text-[#6B6259]">
            <Star className="h-[14px] w-[14px] fill-brand text-brand" strokeWidth={0} />
            {it.rating}
            <span className="text-[#A89E94]">({it.ratingCount} reseñas)</span>
          </div>

          <div className="mt-5 flex items-baseline gap-1.5">
            <span className="font-mono text-[32px] font-bold tabular-nums text-ink">
              {formatMXN(it.price)}
            </span>
            <span className="text-sm font-semibold text-[#8B8178]">
              {suffix} · {it.unit}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <Button size="lg" className="flex-1" disabled>
              Comprar con escrow
            </Button>
            <Button size="lg" variant="outline" disabled>
              Guardar
            </Button>
          </div>
          <p className="mt-3 text-xs text-texto-suave">
            Ficha completa (galería, chat en orden, checkout con escrow) en la
            próxima iteración.
          </p>
        </div>
      </div>
    </div>
  );
}
