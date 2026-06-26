import { formatMXN } from "@/lib/utils";

/** Datos de muestra para los dashboards (hasta conectar órdenes reales). */

type Tone = { label: string; color: string; bg: string };

export const LISTING_STATUS_META: Record<string, Tone> = {
  active: { label: "Activo", color: "#1F8A4C", bg: "#E7F4EC" },
  paused: { label: "Pausado", color: "#9A6B0E", bg: "#FBF1DA" },
  draft: { label: "Borrador", color: "#6B6259", bg: "#F1ECE5" },
  flagged: { label: "Reportado", color: "#C0392B", bg: "#FBEBE9" },
};

export const ORDER_STATUS_META: Record<string, Tone> = {
  paid: { label: "Pagado · preparar", color: "#9A6B0E", bg: "#FBF1DA" },
  in_transit: { label: "En tránsito", color: "#2A6FB0", bg: "#E6F0FA" },
  delivered: { label: "Entregado", color: "#1F8A4C", bg: "#E7F4EC" },
};

export interface SellerListingRow {
  title: string;
  cat: string;
  status: keyof typeof LISTING_STATUS_META;
  price: number;
  views: number;
  saves: number;
}

export const SELLER_LISTINGS: SellerListingRow[] = [
  { title: "Cemento CPC 30R — 38 sacos", cat: "Materiales", status: "active", price: 3040, views: 214, saves: 18 },
  { title: 'Varilla 3/8" corrugada — 1.2 ton', cat: "Materiales", status: "active", price: 18400, views: 341, saves: 27 },
  { title: "Impermeabilizante Fester 19 L", cat: "Materiales", status: "paused", price: 1180, views: 96, saves: 7 },
  { title: "Mortero seco — 60 sacos", cat: "Liquidación", status: "draft", price: 2700, views: 0, saves: 0 },
  { title: "Lámina R101 cal. B", cat: "Materiales", status: "flagged", price: 139, views: 54, saves: 3 },
];

export interface SellerOrderRow {
  id: string;
  item: string;
  buyer: string;
  total: number;
  status: keyof typeof ORDER_STATUS_META;
}

export const SELLER_ORDERS: SellerOrderRow[] = [
  { id: "#RMN-2418", item: 'Varilla 3/8" corrugada', buyer: "Constructora Itzáes", total: 21476, status: "paid" },
  { id: "#RMN-2415", item: "Cemento CPC 30R — 38 sacos", buyer: "Juan P. Méndez", total: 4082.4, status: "in_transit" },
  { id: "#RMN-2410", item: "Tinaco Rotoplas 1100 L", buyer: "Obras del Sureste", total: 2320, status: "delivered" },
];

export const SELLER_KPIS = [
  { label: "Ventas · 30 días", value: "$186,420", delta: "▲ 12% vs. mes anterior", deltaColor: "#1F8A4C", icon: "TrendingUp", iconBg: "#FBEADF", iconColor: "#F26B2C" },
  { label: "Órdenes activas", value: "3", delta: "1 por preparar hoy", deltaColor: "#9A6B0E", icon: "ShoppingBag", iconBg: "#E6F0FA", iconColor: "#2A6FB0" },
  { label: "En escrow", value: "$25,558", delta: "Se libera al confirmar", deltaColor: "#8B8178", icon: "ShieldCheck", iconBg: "#E7F4EC", iconColor: "#1F8A4C" },
  { label: "Calificación", value: "4.8", delta: "112 reseñas", deltaColor: "#8B8178", icon: "Star", iconBg: "#FBF1DA", iconColor: "#F26B2C" },
] as const;

export const STEP_NAMES = [
  "Pagado",
  "Confirmado",
  "En tránsito",
  "Entregado",
  "Completado",
];

export interface ClientOrderSeed {
  id: string;
  item: string;
  seller: string;
  total: number;
  step: number; // 1..5
  escrowDays: number;
}

export const CLIENT_ORDERS: ClientOrderSeed[] = [
  { id: "#RMN-2415", item: "Cemento CPC 30R — 38 sacos", seller: "Materiales del Mayab", total: 4082.4, step: 3, escrowDays: 5 },
  { id: "#RMN-2402", item: "Minicargador Bobcat S70 · renta 3 días", seller: "Rentas OBRA MX", total: 9918, step: 5, escrowDays: 0 },
  { id: "#RMN-2381", item: "Block hueco 15×20×40 — 600 pzas", seller: "Bloquera San José", total: 7018, step: 5, escrowDays: 0 },
];

/** Ids de SAMPLE_LISTINGS mostrados en "Guardados" del cliente. */
export const SAVED_LISTING_IDS = ["lamina-r101", "revolvedora", "tinaco"];

export { formatMXN };
