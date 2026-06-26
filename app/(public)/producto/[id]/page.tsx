import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MessageSquare, ShieldCheck, Star } from "lucide-react";

import { ListingCard } from "@/components/marketplace/listing-card";
import { ProductGallery } from "@/components/marketplace/product-gallery";
import { ProductPurchasePanel } from "@/components/marketplace/product-purchase-panel";
import {
  CATEGORY_LABEL,
  CONDITION_META,
  SAMPLE_LISTINGS,
  getSampleListing,
  toCardView,
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

const PRICE_TYPE_LABEL: Record<string, string> = {
  fijo: "Precio fijo",
  renta_diaria: "Renta diaria",
  subasta: "Subasta",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "RK";
}

export default function ProductoPage({ params }: { params: { id: string } }) {
  const it = getSampleListing(params.id);
  if (!it) notFound();

  const cm = CONDITION_META[it.cond];
  const catLabel = CATEGORY_LABEL[it.cat];
  const locationLabel = `${it.mun}, ${it.est}`;
  const priceSuffix = it.priceType === "renta_diaria" ? "/ día" : "";

  const specs: { k: string; v: string }[] = [
    { k: "Categoría", v: catLabel },
    { k: "Condición", v: cm.label },
    { k: "Marca", v: it.brand ?? "—" },
    { k: "Cantidad", v: it.unit },
    { k: "Tipo de precio", v: PRICE_TYPE_LABEL[it.priceType] ?? it.priceType },
    { k: "Ubicación", v: locationLabel },
  ];

  const related = SAMPLE_LISTINGS.filter(
    (x) => x.cat === it.cat && x.id !== it.id
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-8">
      {/* Breadcrumb */}
      <div className="mb-5 font-mono text-xs text-[#A1968B]">
        <Link href="/buscar" className="hover:text-ink">
          Catálogo
        </Link>{" "}
        / {catLabel} / <span className="text-[#6B6259]">{it.id}</span>
      </div>

      <div className="grid items-start gap-9 lg:grid-cols-[1fr_384px]">
        {/* Columna principal */}
        <div>
          <ProductGallery photoLabel={it.photoLabel} catLabel={catLabel} />

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center rounded-[7px] px-[11px] py-[5px] text-[12.5px] font-bold"
              style={{ color: cm.color, background: cm.bg }}
            >
              {cm.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6259]">
              <Star className="h-[13px] w-[13px] fill-brand text-brand" strokeWidth={0} />
              <strong className="text-ink">{it.rating}</strong> · {it.ratingCount}{" "}
              reseñas
            </span>
          </div>

          <h1 className="mb-[18px] mt-3.5 font-display text-[30px] leading-[1.12] tracking-[-.01em] text-ink">
            {it.title}
          </h1>
          <p className="mb-[30px] max-w-[600px] text-[15.5px] leading-[1.6] text-[#5A524B]">
            Material sobrante de obra en la Península. Se entrega tal cual se
            muestra; fotos y condición verificadas por el equipo de Remnak.
            Disponible para recolección o flete dentro de la plataforma.
          </p>

          <h2 className="mb-3.5 font-display text-[18px] text-ink">
            Especificaciones
          </h2>
          <div className="overflow-hidden rounded-[14px] border border-[#ECE4DB] bg-white">
            {specs.map((sp) => (
              <div
                key={sp.k}
                className="flex justify-between border-b border-[#F2ECE4] px-4 py-[13px] text-[13.5px] last:border-b-0"
              >
                <span className="text-[#8B8178]">{sp.k}</span>
                <span className="font-mono font-bold text-ink">{sp.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna lateral (sticky) */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-[88px]">
          <ProductPurchasePanel
            priceMain={formatMXN(it.price)}
            priceSuffix={priceSuffix}
            unit={it.unit}
            locationLabel={locationLabel}
          />

          <div className="flex gap-3 rounded-[14px] border border-[#F2E6D6] bg-[#FBF6EF] p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#E7F4EC]">
              <ShieldCheck className="h-5 w-5 text-[#1F8A4C]" strokeWidth={2.2} />
            </span>
            <div>
              <div className="mb-[3px] text-[13.5px] font-bold text-ink">
                Tu dinero está protegido
              </div>
              <div className="text-[12.5px] leading-[1.5] text-[#6B6259]">
                Retenemos el pago 7 días. Se libera al proveedor solo cuando
                confirmes que recibiste el material.
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#ECE4DB] bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-[linear-gradient(145deg,#37302A,#221D1A)] text-[15px] font-extrabold text-[#F4B488]">
                {initials(it.seller)}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-ink">{it.seller}</span>
                  {it.verified && (
                    <BadgeCheck className="h-[15px] w-[15px] text-[#1F8A4C]" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-[#8B8178]">
                  <Star className="h-[11px] w-[11px] fill-brand text-brand" strokeWidth={0} />
                  {it.rating} · {locationLabel}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-1.5 border-t border-[#F2ECE4] pt-3 text-[11.5px] leading-[1.5] text-[#A1968B]">
              <MessageSquare className="mt-px h-[13px] w-[13px] shrink-0" />
              <span>
                El chat se habilita{" "}
                <strong className="text-[#6B6259]">dentro de la orden</strong>{" "}
                tras la compra.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Relacionados */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-[18px] font-display text-[22px] text-ink">
            Más de esta categoría
          </h2>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <ListingCard key={r.id} it={toCardView(r)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
