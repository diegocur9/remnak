import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

/**
 * Queries del módulo de matching de fleteros (spec Remnak_Modulo_Fleteros
 * v1.0). Server-side; RLS aplica (público solo ve vehículos verified).
 */

export type VehicleRow = Database["public"]["Tables"]["carrier_vehicles"]["Row"];
export type VehicleType = Database["public"]["Enums"]["vehicle_type"];
export type CargoCategory = Database["public"]["Enums"]["cargo_category"];

/** Perfil del fletero que necesita el matching/UI (§5.1 regla 6, §6.3). */
export interface CarrierLite {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  verification_status: Database["public"]["Enums"]["verification_status"];
  role: Database["public"]["Enums"]["user_role"];
  secondary_roles: Database["public"]["Enums"]["user_role"][] | null;
  municipio: string | null;
  estado: string | null;
  lat: number | null;
  lng: number | null;
}

const CARRIER_SELECT =
  "id, full_name, avatar_url, rating_avg, rating_count, verification_status, role, secondary_roles, municipio, estado, lat, lng";

type VehicleWithCarrier = VehicleRow & { carrier: CarrierLite };

/** Vehículos de un fletero (todos los status; RLS limita a dueño/verified). */
export async function getVehiclesByCarrier(
  carrierId: string
): Promise<VehicleRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("carrier_vehicles")
    .select("*")
    .eq("carrier_id", carrierId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Un vehículo por id (null si no existe o RLS lo oculta). */
export async function getVehicleById(id: string): Promise<VehicleRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("carrier_vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

export interface CompatibleCarriersInput {
  cargoCategory: CargoCategory;
  weightKg: number;
  requiresEquipment: string[];
  /** Punto de recolección (ranking §5.3 por cercanía). */
  lat: number | null;
  lng: number | null;
  /**
   * Largo del material en metros (§5.1 regla 4, solo largo_rigido).
   * GAP de la spec: listings aún no guarda largo — pasar cuando se capture
   * (Fase 5); si se omite, la regla no filtra.
   */
  cargoLengthM?: number;
}

export interface CompatibleCarrier {
  vehicle: VehicleRow;
  carrier: CarrierLite;
  /** Distancia estimada al punto de recolección (null sin coordenadas). */
  distanceKm: number | null;
}

/** Haversine en km. */
function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)) * 10) / 10;
}

/**
 * Fleteros compatibles con un envío (§5.1) ordenados por ranking (§5.3).
 *
 * Compatibilidad (TODAS):
 *  1. cargoCategory ∈ vehicle.cargo_categories        (contains, GIN)
 *  2. vehicle.capacity_kg >= weightKg
 *  3. requiresEquipment ⊆ vehicle.special_equipment   (contains, GIN)
 *  4. largo_rigido: cargo_length_m >= cargoLengthM    (si se conoce el largo)
 *  5. vehicle verified + permiso SCT vigente (fecha futura; NULL excluido)
 *  6. carrier con rol logistica (primario o secundario) y perfil verified
 *  + granel: solo volquete, o redilas con accepts_loose_bulk (§3*)
 *
 * Ranking: rating (1 decimal) desc → cercanía asc (sin coords al final)
 * → capacity_kg asc (el vehículo MÁS PEQUEÑO que cumple gana el empate).
 */
export async function getCompatibleCarriers(
  input: CompatibleCarriersInput
): Promise<CompatibleCarrier[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("carrier_vehicles")
    .select(
      `*, carrier:profiles!carrier_vehicles_carrier_id_fkey!inner(${CARRIER_SELECT})`
    )
    .eq("status", "verified")
    .contains("cargo_categories", [input.cargoCategory])
    .gte("capacity_kg", input.weightKg)
    .gt("permiso_sct_vigencia", today)
    .eq("carrier.verification_status", "verified")
    .or("role.eq.logistica,secondary_roles.cs.{logistica}", {
      foreignTable: "carrier",
    });

  if (input.requiresEquipment.length > 0) {
    query = query.contains("special_equipment", input.requiresEquipment);
  }
  if (input.cargoCategory === "largo_rigido" && input.cargoLengthM) {
    query = query.gte("cargo_length_m", input.cargoLengthM);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  let rows = data as unknown as VehicleWithCarrier[];

  // §3*: granel suelto no viaja en redilas salvo accepts_loose_bulk.
  if (input.cargoCategory === "granel") {
    rows = rows.filter(
      (r) => r.vehicle_type !== "redilas" || r.accepts_loose_bulk
    );
  }

  const ranked: CompatibleCarrier[] = rows.map((r) => {
    const { carrier, ...vehicle } = r;
    const d =
      input.lat != null &&
      input.lng != null &&
      carrier.lat != null &&
      carrier.lng != null
        ? distanceKm(input.lat, input.lng, carrier.lat, carrier.lng)
        : null;
    return { vehicle: vehicle as VehicleRow, carrier, distanceKm: d };
  });

  ranked.sort((a, b) => {
    // 1) rating (redondeado a 1 decimal, como se muestra en UI)
    const ra = Math.round((a.carrier.rating_avg ?? 0) * 10);
    const rb = Math.round((b.carrier.rating_avg ?? 0) * 10);
    if (ra !== rb) return rb - ra;
    // 2) cercanía (sin coordenadas → al final)
    const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
    const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    // 3) ajuste de capacidad: el más pequeño que cumple
    return a.vehicle.capacity_kg - b.vehicle.capacity_kg;
  });

  return ranked;
}

/**
 * Conteo para el form del proveedor (§6.2: "Hay N fleteros que pueden
 * transportar esto"). Cuenta fleteros distintos, no vehículos.
 */
export async function countCompatibleCarriers(
  input: CompatibleCarriersInput
): Promise<number> {
  const matches = await getCompatibleCarriers(input);
  return new Set(matches.map((m) => m.carrier.id)).size;
}
