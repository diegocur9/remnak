import type { Metadata } from "next";

import { ListingCard } from "@/components/marketplace/listing-card";
import {
  CATEGORY_LABEL,
  SAMPLE_LISTINGS,
  toCardView,
} from "@/lib/marketplace/catalog";
import type { Database } from "@/types/database";

type ListingCategory = Database["public"]["Enums"]["listing_category"];

export const metadata: Metadata = { title: "Catálogo" };

const CATEGORIES = Object.keys(CATEGORY_LABEL) as ListingCategory[];

export default function BuscarPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string };
}) {
  const q = searchParams.q?.trim().toLowerCase() ?? "";
  const categoria = CATEGORIES.includes(searchParams.categoria as ListingCategory)
    ? (searchParams.categoria as ListingCategory)
    : null;

  const results = SAMPLE_LISTINGS.filter((l) => {
    if (categoria && l.cat !== categoria) return false;
    if (q && !l.title.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
      <div className="mb-1.5 font-mono text-xs text-[#A1968B]">
        Inicio / Catálogo
      </div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-[30px] tracking-[-.01em] text-ink">
          {categoria ? CATEGORY_LABEL[categoria] : "Catálogo"}
        </h1>
        <span className="text-[13.5px] text-[#8B8178]">
          <strong className="font-mono text-ink">{results.length}</strong>{" "}
          resultados{q ? ` para “${searchParams.q}”` : ""}
        </span>
      </div>

      <p className="mb-6 inline-flex rounded-full border border-[#ECE4DB] bg-white px-3 py-1.5 text-[13px] text-[#6B6259]">
        Vista previa del catálogo · los filtros avanzados llegan en la próxima
        iteración.
      </p>

      {results.length === 0 ? (
        <p className="py-16 text-center text-texto-suave">
          No encontramos anuncios para esa búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((it) => (
            <ListingCard key={it.id} it={toCardView(it)} />
          ))}
        </div>
      )}
    </div>
  );
}
