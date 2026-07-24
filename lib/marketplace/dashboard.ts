import { formatMXN } from "@/lib/utils";

/**
 * Metadatos de estado para dashboards + datos de muestra de órdenes de
 * cliente (estas últimas se sustituyen por queries reales en el sprint de
 * órdenes).
 */

type Tone = { label: string; color: string; bg: string };

export const LISTING_STATUS_META: Record<string, Tone> = {
  active: { label: "Activo", color: "#1F8A4C", bg: "#E7F4EC" },
  paused: { label: "Pausado", color: "#9A6B0E", bg: "#FBF1DA" },
  draft: { label: "Borrador", color: "#6B6259", bg: "#F1ECE5" },
  sold: { label: "Vendido", color: "#2A6FB0", bg: "#E6F0FA" },
  flagged: { label: "Reportado", color: "#C0392B", bg: "#FBEBE9" },
};

export const ORDER_STATUS_META: Record<string, Tone> = {
  pending: { label: "Pendiente", color: "#6B6259", bg: "#F1ECE5" },
  paid: { label: "Pagado · preparar", color: "#9A6B0E", bg: "#FBF1DA" },
  confirmed: { label: "Confirmado", color: "#9A6B0E", bg: "#FBF1DA" },
  in_transit: { label: "En tránsito", color: "#2A6FB0", bg: "#E6F0FA" },
  delivered: { label: "Entregado", color: "#1F8A4C", bg: "#E7F4EC" },
  completed: { label: "Completado", color: "#1F8A4C", bg: "#E7F4EC" },
  disputed: { label: "En disputa", color: "#C0392B", bg: "#FBEBE9" },
  refunded: { label: "Reembolsado", color: "#6B6259", bg: "#F1ECE5" },
  cancelled: { label: "Cancelado", color: "#6B6259", bg: "#F1ECE5" },
};

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

/** Muestra visual hasta conectar órdenes reales (sprint de órdenes). */
export const CLIENT_ORDERS: ClientOrderSeed[] = [
  { id: "#RMN-2415", item: "Cemento CPC 30R — 38 sacos", seller: "Materiales del Mayab", total: 4082.4, step: 3, escrowDays: 5 },
  { id: "#RMN-2402", item: "Minicargador Bobcat S70 · renta 3 días", seller: "Rentas OBRA MX", total: 9918, step: 5, escrowDays: 0 },
  { id: "#RMN-2381", item: "Block hueco 15×20×40 — 600 pzas", seller: "Bloquera San José", total: 7018, step: 5, escrowDays: 0 },
];

export { formatMXN };
