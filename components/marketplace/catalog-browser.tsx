"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";

import { ListingCard } from "@/components/marketplace/listing-card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SAMPLE_LISTINGS,
  toCardView,
  type SampleListing,
} from "@/lib/marketplace/catalog";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type ListingCategory = Database["public"]["Enums"]["listing_category"];
type ListingCondition = Database["public"]["Enums"]["listing_condition"];
type SortKey = "relevancia" | "precio-asc" | "precio-desc" | "recientes";

const CAT_FACETS: { key: ListingCategory | "todas"; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "materiales", label: "Materiales" },
  { key: "maquinaria", label: "Maquinaria" },
  { key: "herramientas", label: "Herramientas" },
  { key: "liquidacion", label: "Liquidación" },
  { key: "logistica", label: "Fletes / RCD" },
];

const COND_FACETS: { key: ListingCondition | "todas"; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "nuevo", label: "Nuevo" },
  { key: "sobrante", label: "Sobrante" },
  { key: "defectuoso", label: "Defectuoso" },
];

const MUNICIPIOS = ["Campeche", "Mérida"] as const;

const SORTS: { key: SortKey; label: string }[] = [
  { key: "relevancia", label: "Relevancia" },
  { key: "precio-asc", label: "Precio ↑" },
  { key: "precio-desc", label: "Precio ↓" },
  { key: "recientes", label: "Recientes" },
];

export interface CatalogInitial {
  q: string;
  cat: ListingCategory | "todas";
  cond: ListingCondition | "todas";
  municipios: string[];
  verificados: boolean;
  orden: SortKey;
}

export function CatalogBrowser({ initial }: { initial: CatalogInitial }) {
  const router = useRouter();
  const [q] = useState(initial.q);
  const [cat, setCat] = useState(initial.cat);
  const [cond, setCond] = useState(initial.cond);
  const [municipios, setMunicipios] = useState<string[]>(initial.municipios);
  const [onlyVerified, setOnlyVerified] = useState(initial.verificados);
  const [sort, setSort] = useState<SortKey>(initial.orden);
  const [mobileFilters, setMobileFilters] = useState(false);

  // Mantén la URL en sincronía (compartible / marcable) sin recargar.
  function syncUrl(next: Partial<CatalogInitial>) {
    const merged = { q, cat, cond, municipios, verificados: onlyVerified, orden: sort, ...next };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.cat !== "todas") params.set("categoria", merged.cat);
    if (merged.cond !== "todas") params.set("condicion", merged.cond);
    if (merged.municipios.length) params.set("mun", merged.municipios.join(","));
    if (merged.verificados) params.set("verificados", "1");
    if (merged.orden !== "relevancia") params.set("orden", merged.orden);
    const qs = params.toString();
    router.replace(qs ? `/buscar?${qs}` : "/buscar", { scroll: false });
  }

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { todas: SAMPLE_LISTINGS.length };
    for (const l of SAMPLE_LISTINGS) counts[l.cat] = (counts[l.cat] ?? 0) + 1;
    return counts;
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = SAMPLE_LISTINGS.filter(
      (x) =>
        (cat === "todas" || x.cat === cat) &&
        (cond === "todas" || x.cond === cond) &&
        (municipios.length === 0 || municipios.includes(x.mun)) &&
        (!onlyVerified || x.verified) &&
        (!term || x.title.toLowerCase().includes(term))
    );
    if (sort === "precio-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "precio-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "recientes") list = [...list].reverse();
    return list;
  }, [q, cat, cond, municipios, onlyVerified, sort]);

  const hasFilters =
    cat !== "todas" || cond !== "todas" || municipios.length > 0 || onlyVerified;

  function clearAll() {
    setCat("todas");
    setCond("todas");
    setMunicipios([]);
    setOnlyVerified(false);
    syncUrl({ cat: "todas", cond: "todas", municipios: [], verificados: false });
  }

  function pickCat(key: ListingCategory | "todas") {
    setCat(key);
    syncUrl({ cat: key });
  }
  function pickCond(key: ListingCondition | "todas") {
    setCond(key);
    syncUrl({ cond: key });
  }
  function toggleMun(m: string, checked: boolean) {
    const next = checked ? [...municipios, m] : municipios.filter((x) => x !== m);
    setMunicipios(next);
    syncUrl({ municipios: next });
  }
  function toggleVerified() {
    const next = !onlyVerified;
    setOnlyVerified(next);
    syncUrl({ verificados: next });
  }
  function pickSort(key: SortKey) {
    setSort(key);
    syncUrl({ orden: key });
  }

  const sidebar = (
    <div className="flex flex-col gap-5 rounded-2xl border border-[#ECE4DB] bg-white p-[18px]">
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[13px] font-extrabold uppercase tracking-[.05em] text-ink">
            Filtros
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-brand-strong hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="flex flex-col gap-[3px]">
          {CAT_FACETS.map((c) => {
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => pickCat(c.key)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[9px] border px-[11px] py-2 text-[13.5px] transition",
                  active
                    ? "border-[#F6D3BC] bg-[#FBEADF] font-bold text-brand-strong"
                    : "border-transparent font-semibold text-[#5A524B] hover:bg-canvas"
                )}
              >
                <span>{c.label}</span>
                <span className="font-mono text-[11.5px] opacity-70">
                  {catCounts[c.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#F0E9E1]" />

      <div>
        <div className="mb-[11px] text-xs font-extrabold uppercase tracking-[.05em] text-ink">
          Condición
        </div>
        <div className="flex flex-wrap gap-[7px]">
          {COND_FACETS.map((c) => {
            const active = cond === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => pickCond(c.key)}
                className={cn(
                  "rounded-full border px-[13px] py-1.5 text-[12.5px] font-semibold transition",
                  active
                    ? "border-brand bg-[#FBEADF] text-brand-strong"
                    : "border-[#E6DED4] bg-white text-[#6B6259] hover:border-[#D7CCC0]"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#F0E9E1]" />

      <div>
        <div className="mb-[11px] text-xs font-extrabold uppercase tracking-[.05em] text-ink">
          Municipio
        </div>
        {MUNICIPIOS.map((m) => (
          <label
            key={m}
            className="flex cursor-pointer items-center gap-[9px] py-[5px] text-[13.5px] text-[#5A524B]"
          >
            <Checkbox
              checked={municipios.includes(m)}
              onCheckedChange={(v) => toggleMun(m, v === true)}
            />
            {m}
          </label>
        ))}
      </div>

      <div className="h-px bg-[#F0E9E1]" />

      <button
        type="button"
        onClick={toggleVerified}
        className="flex w-full items-center justify-between"
      >
        <span className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
          <ShieldCheck className="h-4 w-4 text-[#1F8A4C]" strokeWidth={2.1} />
          Solo verificados
        </span>
        <span
          className={cn(
            "relative h-[23px] w-10 rounded-full transition-colors",
            onlyVerified ? "bg-brand" : "bg-[#D7CCC0]"
          )}
        >
          <span
            className={cn(
              "absolute top-[2.5px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-all",
              onlyVerified ? "left-[19px]" : "left-[2.5px]"
            )}
          />
        </span>
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-7 sm:px-8">
      {/* Encabezado */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 font-mono text-xs text-[#A1968B]">
            Inicio / Catálogo
          </div>
          <h1 className="font-display text-[30px] tracking-[-.01em] text-ink">
            Catálogo
          </h1>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="text-[13.5px] text-[#8B8178]">
            <strong className="font-mono text-ink">{results.length}</strong>{" "}
            resultados
          </span>
          <div className="flex gap-0.5 rounded-[10px] bg-[#F1ECE5] p-[3px]">
            {SORTS.map((srt) => (
              <button
                key={srt.key}
                type="button"
                onClick={() => pickSort(srt.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition",
                  sort === srt.key
                    ? "bg-white text-ink shadow-[0_1px_3px_rgba(41,35,31,.12)]"
                    : "text-[#8B8178] hover:text-ink"
                )}
              >
                {srt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de filtros (móvil) */}
      <button
        type="button"
        onClick={() => setMobileFilters((v) => !v)}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E6DED4] bg-white px-4 py-2 text-[13px] font-semibold text-ink lg:hidden"
      >
        {mobileFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        Filtros
        {hasFilters && <span className="h-2 w-2 rounded-full bg-brand" />}
      </button>

      <div className="grid items-start gap-6 lg:grid-cols-[262px_1fr]">
        <aside className={cn("lg:sticky lg:top-[88px]", mobileFilters ? "block" : "hidden lg:block")}>
          {sidebar}
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE4DB] bg-white px-[13px] py-[7px] text-[13px] text-[#6B6259]">
              <ShieldCheck className="h-[13px] w-[13px] text-[#1F8A4C]" strokeWidth={2.4} />
              Pago en escrow en todos los anuncios
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE4DB] bg-white px-[13px] py-[7px] text-[13px] text-[#6B6259]">
              <Search className="h-[13px] w-[13px] text-brand-strong" strokeWidth={2.2} />
              Península de Yucatán
            </span>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E0D6CB] bg-white py-20 text-center">
              <p className="font-semibold text-ink">Sin resultados</p>
              <p className="mt-1 text-sm text-texto-suave">
                Prueba quitar algún filtro o cambiar la búsqueda.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 text-sm font-semibold text-brand-strong hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {results.map((it: SampleListing) => (
                <ListingCard key={it.id} it={toCardView(it)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
