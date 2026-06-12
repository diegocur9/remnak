import { formatMXN } from "@/lib/utils";
import type { Database } from "@/types/database";

type ListingCategory = Database["public"]["Enums"]["listing_category"];
type ListingCondition = Database["public"]["Enums"]["listing_condition"];
type ListingPriceType = Database["public"]["Enums"]["listing_price_type"];

export interface SampleListing {
  id: string;
  title: string;
  cat: ListingCategory;
  cond: ListingCondition;
  priceType: ListingPriceType;
  price: number;
  unit: string;
  mun: string;
  est: string;
  seller: string;
  verified: boolean;
  rating: number;
  ratingCount: number;
  photoLabel: string;
  brand?: string;
  featured?: boolean;
  flete: boolean;
  fletePrice: number;
}

/**
 * Catálogo de muestra (datos realistas de construcción MX) tomado del design
 * file. Provisional hasta conectar listings reales de Supabase.
 */
export const SAMPLE_LISTINGS: SampleListing[] = [
  { id: "cemento-cpc30", title: "Cemento CPC 30R — 38 sacos sobrantes", cat: "materiales", cond: "sobrante", priceType: "fijo", price: 3040, unit: "lote · 38 sacos", mun: "Mérida", est: "Yuc.", seller: "Materiales del Mayab", verified: true, rating: 4.8, ratingCount: 34, photoLabel: "cemento_cpc30r.jpg", brand: "Cemex", featured: true, flete: true, fletePrice: 480 },
  { id: "varilla-38", title: 'Varilla 3/8" corrugada — 1.2 toneladas', cat: "materiales", cond: "sobrante", priceType: "fijo", price: 18400, unit: "1.2 ton", mun: "Campeche", est: "Camp.", seller: "Aceros Peninsular", verified: true, rating: 4.9, ratingCount: 51, photoLabel: "varilla_38.jpg", brand: "Deacero", featured: true, flete: true, fletePrice: 900 },
  { id: "minicargador-s70", title: "Minicargador Bobcat S70 — renta por día", cat: "maquinaria", cond: "nuevo", priceType: "renta_diaria", price: 2850, unit: "día", mun: "Mérida", est: "Yuc.", seller: "Rentas OBRA MX", verified: true, rating: 4.7, ratingCount: 22, photoLabel: "bobcat_s70.jpg", brand: "Bobcat", featured: true, flete: true, fletePrice: 1200 },
  { id: "block-15", title: "Block hueco 15×20×40 — 600 pzas", cat: "liquidacion", cond: "sobrante", priceType: "fijo", price: 5400, unit: "600 pzas", mun: "Campeche", est: "Camp.", seller: "Bloquera San José", verified: false, rating: 4.4, ratingCount: 12, photoLabel: "block_15.jpg", featured: true, flete: true, fletePrice: 650 },
  { id: "lamina-r101", title: "Lámina galvanizada R101 — defectuosa cal. B", cat: "materiales", cond: "defectuoso", priceType: "fijo", price: 139, unit: "c/u", mun: "Mérida", est: "Yuc.", seller: "Aceros Peninsular", verified: true, rating: 4.6, ratingCount: 18, photoLabel: "lamina_r101.jpg", flete: false, fletePrice: 0 },
  { id: "revolvedora", title: "Revolvedora 1 saco 1.5 HP — renta por día", cat: "maquinaria", cond: "nuevo", priceType: "renta_diaria", price: 420, unit: "día", mun: "Campeche", est: "Camp.", seller: "Rentas OBRA MX", verified: true, rating: 4.8, ratingCount: 40, photoLabel: "revolvedora.jpg", brand: "Mpro", flete: true, fletePrice: 300 },
  { id: "tinaco", title: "Tinaco Rotoplas 1100 L — sobrante nuevo", cat: "materiales", cond: "sobrante", priceType: "fijo", price: 1750, unit: "c/u", mun: "Mérida", est: "Yuc.", seller: "Ferre-Sureste", verified: true, rating: 4.7, ratingCount: 27, photoLabel: "tinaco_1100.jpg", brand: "Rotoplas", flete: true, fletePrice: 250 },
  { id: "andamio", title: "Andamio tubular módulo 1.5 m — renta", cat: "herramientas", cond: "sobrante", priceType: "renta_diaria", price: 95, unit: "día · módulo", mun: "Campeche", est: "Camp.", seller: "Rentas OBRA MX", verified: true, rating: 4.5, ratingCount: 15, photoLabel: "andamio.jpg", flete: true, fletePrice: 200 },
  { id: "rcd-agregado", title: "Agregado reciclado RCD — 18 m³", cat: "logistica", cond: "sobrante", priceType: "fijo", price: 7200, unit: "18 m³", mun: "Mérida", est: "Yuc.", seller: "EcoEscombros", verified: false, rating: 4.2, ratingCount: 8, photoLabel: "rcd_agregado.jpg", flete: true, fletePrice: 1100 },
];

export const CONDITION_META: Record<
  ListingCondition,
  { label: string; color: string; bg: string }
> = {
  nuevo: { label: "Nuevo", color: "#1F8A4C", bg: "#E7F4EC" },
  sobrante: { label: "Sobrante", color: "#C2571F", bg: "#FBEADF" },
  defectuoso: { label: "Defectuoso", color: "#9A6B0E", bg: "#FBF1DA" },
};

export const CATEGORY_LABEL: Record<ListingCategory, string> = {
  materiales: "Materiales",
  maquinaria: "Maquinaria",
  herramientas: "Herramientas",
  profesionales: "Profesional",
  logistica: "Logística",
  liquidacion: "Liquidación",
};

/** Categorías para la cuadrícula del Home (label de grid + conteo). */
export const HOME_CATEGORIES: {
  value: ListingCategory;
  label: string;
  count: string;
}[] = [
  { value: "materiales", label: "Materiales", count: "128 anuncios" },
  { value: "maquinaria", label: "Maquinaria", count: "46 · venta/renta" },
  { value: "herramientas", label: "Herramientas", count: "73 anuncios" },
  { value: "profesionales", label: "Profesionales", count: "31 maestros" },
  { value: "logistica", label: "Fletes", count: "19 transportistas" },
  { value: "liquidacion", label: "Liquidación", count: "24 lotes" },
];

export interface ListingCardView {
  id: string;
  title: string;
  catLabel: string;
  condLabel: string;
  condColor: string;
  condBg: string;
  locationLabel: string;
  priceMain: string;
  priceSuffix: string;
  rating: number;
  ratingCount: number;
  verified: boolean;
  photoLabel: string;
  fleteLabel: string;
}

/** Convierte un listing en el view-model que consume ListingCard. */
export function toCardView(it: SampleListing): ListingCardView {
  const cm = CONDITION_META[it.cond];
  return {
    id: it.id,
    title: it.title,
    catLabel: CATEGORY_LABEL[it.cat],
    condLabel: cm.label,
    condColor: cm.color,
    condBg: cm.bg,
    locationLabel: `${it.mun}, ${it.est}`,
    priceMain: formatMXN(it.price),
    priceSuffix: it.priceType === "renta_diaria" ? "/ día" : "",
    rating: it.rating,
    ratingCount: it.ratingCount,
    verified: it.verified,
    photoLabel: it.photoLabel,
    fleteLabel: it.flete ? "Flete disp." : "Recolección",
  };
}

export const FEATURED_LISTINGS = SAMPLE_LISTINGS.filter((l) => l.featured);

export function getSampleListing(id: string): SampleListing | undefined {
  return SAMPLE_LISTINGS.find((l) => l.id === id);
}
