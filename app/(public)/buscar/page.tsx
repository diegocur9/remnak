import type { Metadata } from "next";

import {
  CatalogBrowser,
  type CatalogInitial,
} from "@/components/marketplace/catalog-browser";
import { fetchCatalog } from "@/lib/marketplace/queries";

export const metadata: Metadata = { title: "Catálogo" };

const CATS = ["materiales", "maquinaria", "herramientas", "liquidacion", "logistica", "profesionales"];
const CONDS = ["nuevo", "sobrante", "defectuoso"];
const SORTS = ["relevancia", "precio-asc", "precio-desc", "recientes"];
const ESTADOS = ["Campeche", "Yucatán"];

function parsePrice(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    categoria?: string;
    condicion?: string;
    estado?: string;
    verificados?: string;
    orden?: string;
    pmin?: string;
    pmax?: string;
  };
}) {
  const initial: CatalogInitial = {
    q: searchParams.q ?? "",
    cat: CATS.includes(searchParams.categoria ?? "")
      ? (searchParams.categoria as CatalogInitial["cat"])
      : "todas",
    cond: CONDS.includes(searchParams.condicion ?? "")
      ? (searchParams.condicion as CatalogInitial["cond"])
      : "todas",
    estados: (searchParams.estado ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter((e) => ESTADOS.includes(e)),
    verificados: searchParams.verificados === "1",
    orden: SORTS.includes(searchParams.orden ?? "")
      ? (searchParams.orden as CatalogInitial["orden"])
      : "relevancia",
    pmin: parsePrice(searchParams.pmin),
    pmax: parsePrice(searchParams.pmax),
  };

  // `q` se filtra server-side (ilike título/descripción); facetas en cliente.
  const items = await fetchCatalog(initial.q);

  return <CatalogBrowser initial={initial} items={items} />;
}
