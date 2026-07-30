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

export { formatMXN };
