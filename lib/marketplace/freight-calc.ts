/**
 * Cálculo PRECISO de carga y viajes (decisión 2026-07-25).
 *
 * Un anuncio lista N unidades de un producto: la carga real se deriva de la
 * unidad (peso y dimensiones unitarias) × cantidad. Para cada vehículo se
 * calcula cuántas unidades caben por viaje (por peso, por volumen y por
 * dimensiones — con rotación horizontal) y cuántos viajes hacen falta para
 * mover TODO el lote. Granel (sin unidad discreta) se reparte por peso/volumen.
 *
 * Módulo puro: sin dependencias de DB — unit-testeable.
 */

/** Máximo de viajes que consideramos rentable ofrecer en el matching. */
export const MAX_TRIPS = 3;

export interface UnitCargo {
  /** Peso por unidad (kg). */
  unitWeightKg: number;
  unitLengthM?: number | null;
  unitWidthM?: number | null;
  unitHeightM?: number | null;
  /** Unidades del lote. */
  quantity: number;
}

export interface BulkCargo {
  totalWeightKg: number;
  totalVolumeM3?: number | null;
}

export interface VehicleCapacity {
  capacityKg: number;
  cargoLengthM?: number | null;
  cargoWidthM?: number | null;
  cargoHeightM?: number | null;
  cargoVolumeM3?: number | null;
}

export type TripConstraint = "peso" | "volumen" | "dimensiones";

export interface TripPlan {
  /** ¿El vehículo puede transportar esta carga (en ≤ MAX_TRIPS viajes)? */
  fits: boolean;
  /** Viajes necesarios para mover todo el lote (0 si no fits). */
  trips: number;
  /** Unidades por viaje (null para granel). */
  unitsPerTrip: number | null;
  /** Restricción que dominó el cálculo. */
  limitedBy: TripConstraint | null;
}

const EPS = 1e-9;

export function unitVolumeM3(u: UnitCargo): number | null {
  if (!u.unitLengthM || !u.unitWidthM || !u.unitHeightM) return null;
  return u.unitLengthM * u.unitWidthM * u.unitHeightM;
}

/** Totales del lote a partir de la unidad. */
export function cargoTotals(u: UnitCargo): {
  totalWeightKg: number;
  totalVolumeM3: number | null;
} {
  const vol = unitVolumeM3(u);
  return {
    totalWeightKg: Math.round(u.unitWeightKg * u.quantity * 100) / 100,
    totalVolumeM3:
      vol == null ? null : Math.round(vol * u.quantity * 100) / 100,
  };
}

/**
 * ¿Una unidad cabe físicamente en la caja del vehículo?
 * Rotación horizontal permitida (largo↔ancho); la altura no rota.
 * Dimensión no declarada (de la unidad o del vehículo) = sin restricción,
 * SALVO strictLength (largo_rigido): sin largo declarado del vehículo, no
 * se asume que la pieza larga cabe.
 */
export function unitFitsDimensions(
  u: UnitCargo,
  v: VehicleCapacity,
  opts: { strictLength?: boolean } = {}
): boolean {
  const uL = u.unitLengthM ?? null;
  const uW = u.unitWidthM ?? null;
  const uH = u.unitHeightM ?? null;

  if (uH != null && v.cargoHeightM != null && uH > v.cargoHeightM + EPS) {
    return false;
  }

  if (opts.strictLength && uL != null && v.cargoLengthM == null) return false;

  const fitsDim = (unit: number | null, veh: number | null | undefined) =>
    unit == null || veh == null || unit <= veh + EPS;

  // Orientación directa o rotada 90° en el plano horizontal. La rotada solo
  // cuenta si el vehículo declara AMBAS dimensiones — una dimensión ausente
  // no puede "absorber" una pieza que no cabe en la declarada.
  const direct = fitsDim(uL, v.cargoLengthM) && fitsDim(uW, v.cargoWidthM);
  const rotated =
    v.cargoLengthM != null && v.cargoWidthM != null
      ? fitsDim(uL, v.cargoWidthM) && fitsDim(uW, v.cargoLengthM)
      : false;
  return direct || rotated;
}

/** Plan de viajes para carga unitaria (block, sacos, varilla, tinacos…). */
export function planTripsForUnits(
  u: UnitCargo,
  v: VehicleCapacity,
  opts: { strictLength?: boolean } = {}
): TripPlan {
  if (u.unitWeightKg <= 0 || u.quantity <= 0 || v.capacityKg <= 0) {
    return { fits: false, trips: 0, unitsPerTrip: null, limitedBy: null };
  }
  if (!unitFitsDimensions(u, v, opts)) {
    return { fits: false, trips: 0, unitsPerTrip: 0, limitedBy: "dimensiones" };
  }

  const byWeight = Math.floor(v.capacityKg / u.unitWeightKg + EPS);
  const uVol = unitVolumeM3(u);
  const byVolume =
    uVol != null && v.cargoVolumeM3 != null
      ? Math.floor(v.cargoVolumeM3 / uVol + EPS)
      : Number.POSITIVE_INFINITY;

  const unitsPerTrip = Math.min(byWeight, byVolume);
  const limitedBy: TripConstraint = byVolume < byWeight ? "volumen" : "peso";

  if (unitsPerTrip < 1) {
    return { fits: false, trips: 0, unitsPerTrip: 0, limitedBy };
  }

  const trips = Math.ceil(u.quantity / unitsPerTrip);
  return {
    fits: trips <= MAX_TRIPS,
    trips,
    unitsPerTrip,
    limitedBy,
  };
}

/** Plan de viajes para granel / carga divisible (arena, grava, RCD). */
export function planTripsForBulk(b: BulkCargo, v: VehicleCapacity): TripPlan {
  if (b.totalWeightKg <= 0 || v.capacityKg <= 0) {
    return { fits: false, trips: 0, unitsPerTrip: null, limitedBy: null };
  }
  const tripsByWeight = Math.ceil(b.totalWeightKg / v.capacityKg - EPS);
  const tripsByVolume =
    b.totalVolumeM3 != null && v.cargoVolumeM3 != null
      ? Math.ceil(b.totalVolumeM3 / v.cargoVolumeM3 - EPS)
      : 1;

  const trips = Math.max(tripsByWeight, tripsByVolume, 1);
  return {
    fits: trips <= MAX_TRIPS,
    trips,
    unitsPerTrip: null,
    limitedBy: tripsByVolume > tripsByWeight ? "volumen" : "peso",
  };
}

export interface CargoProfile {
  /** Totales del lote (siempre presentes para matching). */
  totalWeightKg: number;
  totalVolumeM3?: number | null;
  /** Datos unitarios (si el anuncio los declara). */
  unit?: UnitCargo | null;
  /** true para categorías divisibles (granel). */
  isBulk?: boolean;
}

/** Dispatcher: unitario si hay datos de unidad; granel/divisible si no. */
export function planTrips(
  cargo: CargoProfile,
  v: VehicleCapacity,
  opts: { strictLength?: boolean } = {}
): TripPlan {
  if (!cargo.isBulk && cargo.unit && cargo.unit.unitWeightKg > 0) {
    return planTripsForUnits(cargo.unit, v, opts);
  }
  return planTripsForBulk(
    { totalWeightKg: cargo.totalWeightKg, totalVolumeM3: cargo.totalVolumeM3 },
    v
  );
}

/** Etiqueta corta es-MX para la UI. */
export function tripsLabel(plan: TripPlan): string {
  if (!plan.fits) return "No puede con esta carga";
  if (plan.trips === 1) return "1 viaje";
  return `${plan.trips} viajes`;
}
