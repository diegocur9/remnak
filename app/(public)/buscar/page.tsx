import type { Metadata } from "next";

import {
  CatalogBrowser,
  type CatalogInitial,
} from "@/components/marketplace/catalog-browser";

export const metadata: Metadata = { title: "Catálogo" };

const CATS = ["materiales", "maquinaria", "herramientas", "liquidacion", "logistica", "profesionales"];
const CONDS = ["nuevo", "sobrante", "defectuoso"];
const SORTS = ["relevancia", "precio-asc", "precio-desc", "recientes"];
const MUNS = ["Campeche", "Mérida"];

export default function BuscarPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    categoria?: string;
    condicion?: string;
    mun?: string;
    verificados?: string;
    orden?: string;
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
    municipios: (searchParams.mun ?? "")
      .split(",")
      .map((m) => m.trim())
      .filter((m) => MUNS.includes(m)),
    verificados: searchParams.verificados === "1",
    orden: SORTS.includes(searchParams.orden ?? "")
      ? (searchParams.orden as CatalogInitial["orden"])
      : "relevancia",
  };

  return <CatalogBrowser initial={initial} />;
}
