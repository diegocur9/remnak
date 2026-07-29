/**
 * Cálculo de dinero de una orden — modelo Guía MVP v2.2 (Fase 1 · Piloto).
 * TODO en pesos MXN (no centavos) — la conversión a centavos ocurre SOLO en
 * la frontera del procesador de pagos.
 *
 * Regla central: tarjeta = SPEI + 5 puntos (la diferencia es exactamente el
 * costo del procesador; los márgenes netos de Remnak son similares en ambos
 * métodos y el descuento SPEI se comunica con honestidad).
 * OXXO eliminado (decisión v2.2). Constantes configurables para el A/B §7.1.
 */

export type PaymentMethod = "tarjeta" | "spei";

/** Comisión (%) Fase 1 · Piloto — tabla maestra §2.1 de la guía v2.2. */
export const COMMISSION_PCT: Record<
  "estandar" | "mayoreo",
  Record<PaymentMethod, number>
> = {
  estandar: { tarjeta: 10, spei: 5 },
  mayoreo: { tarjeta: 8, spei: 4 },
};

/** Mayoreo: subtotal sin IVA mayor a este umbral. */
export const WHOLESALE_THRESHOLD_MXN = 10_000;

export const IVA_PCT = 16;

/** Comisión sobre el precio del flete — se cobra al fletero asociado (§6.3). */
export const FLETE_COMMISSION_PCT = 10;

/** Comisión del módulo Instalación (mano de obra) — Fase 1 (S6). */
export const INSTALACION_COMMISSION_PCT = 12;

/**
 * Escrow: liberación automática a las 72 h sin disputa tras la entrega
 * (decisión 2026-07-29). Una disputa CONGELA la liberación
 * (escrow_release_due = null) hasta resolverse — modelo CLAUDE.md.
 */
export const ESCROW_HOURS = 72;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function commissionPctFor(
  subtotalMxn: number,
  method: PaymentMethod
): number {
  const tier =
    subtotalMxn > WHOLESALE_THRESHOLD_MXN ? "mayoreo" : "estandar";
  return COMMISSION_PCT[tier][method];
}

export interface OrderTotals {
  subtotalMxn: number;
  fleteMxn: number;
  method: PaymentMethod;
  commissionPct: number;
  commissionMxn: number;
  ivaMxn: number;
  totalMxn: number;
  /** Lo que recibe el proveedor al liberar escrow (subtotal - comisión).
   *  Las retenciones fiscales (§3 guía) se restan en S6 junto con CFDI. */
  sellerNetMxn: number;
}

export function computeTotals(
  subtotalMxn: number,
  fleteMxn = 0,
  method: PaymentMethod = "tarjeta"
): OrderTotals {
  const subtotal = round2(subtotalMxn);
  const flete = round2(fleteMxn);
  const commissionPct = commissionPctFor(subtotal, method);
  const commissionMxn = round2((subtotal * commissionPct) / 100);
  const ivaMxn = round2(((subtotal + flete) * IVA_PCT) / 100);
  const totalMxn = round2(subtotal + flete + ivaMxn);
  return {
    subtotalMxn: subtotal,
    fleteMxn: flete,
    method,
    commissionPct,
    commissionMxn,
    ivaMxn,
    totalMxn,
    sellerNetMxn: round2(subtotal - commissionMxn),
  };
}

/** Comisión Remnak sobre un flete (se descuenta al liquidar el viaje). */
export function fleteCommissionMxn(fletePrecioMxn: number): number {
  return round2((fletePrecioMxn * FLETE_COMMISSION_PCT) / 100);
}

export function escrowReleaseDue(from = new Date()): string {
  return new Date(from.getTime() + ESCROW_HOURS * 3600 * 1000).toISOString();
}
