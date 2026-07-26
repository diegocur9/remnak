"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, hasRole } from "@/lib/auth/profile";
import { vehicleSchema, type VehicleInput } from "@/lib/validations/vehicle";
import type { Database } from "@/types/database";

/**
 * Server actions del módulo de fleteros (spec Fase 3). Mutaciones SIEMPRE
 * aquí; zod se re-valida en servidor. Errores en es-MX.
 */

type VehicleRow = Database["public"]["Tables"]["carrier_vehicles"]["Row"];
type VehicleInsert = Database["public"]["Tables"]["carrier_vehicles"]["Insert"];

export interface VehicleActionResult {
  error?: string;
  /** deleteVehicle: true si se pausó en lugar de borrar (tiene viajes). */
  soft?: boolean;
}

const VEHICLES_PATH = "/logistica/vehiculos";

async function requireLogistica(): Promise<
  { userId: string } | { error: string }
> {
  const { profile } = await getSessionProfile();
  if (!profile) return { error: "Inicia sesión para gestionar tus vehículos." };
  if (!hasRole(profile, "logistica"))
    return { error: "Tu cuenta no tiene rol de logística/fletes." };
  return { userId: profile.id };
}

function toRow(values: VehicleInput, carrierId: string): VehicleInsert {
  return {
    carrier_id: carrierId,
    vehicle_type: values.vehicleType,
    alias: values.alias || null,
    placas: values.placas,
    capacity_kg: values.capacityKg,
    cargo_length_m: values.cargoLengthM ?? null,
    cargo_width_m: values.cargoWidthM ?? null,
    cargo_height_m: values.cargoHeightM ?? null,
    cargo_volume_m3: values.cargoVolumeM3 ?? null,
    cargo_categories: values.cargoCategories,
    special_equipment: values.specialEquipment,
    accepts_loose_bulk: values.acceptsLooseBulk,
    photos: values.photos,
    tarjeta_circulacion_url: values.tarjetaCirculacionUrl || null,
    poliza_seguro_url: values.polizaSeguroUrl || null,
    permiso_sct: values.permisoSct || null,
    permiso_sct_vigencia: values.permisoSctVigencia || null,
    status: "pending",
  };
}

/** Alta de vehículo: nace 'pending'; el admin lo verifica. */
export async function createVehicle(
  values: unknown
): Promise<VehicleActionResult> {
  const gate = await requireLogistica();
  if ("error" in gate) return { error: gate.error };

  const parsed = vehicleSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("carrier_vehicles")
    .insert(toRow(parsed.data, gate.userId));
  if (error) {
    return { error: "No se pudo registrar el vehículo. Intenta de nuevo." };
  }

  revalidatePath(VEHICLES_PATH);
  redirect(`${VEHICLES_PATH}?created=1`);
}

/** Campos cuya edición obliga a re-verificar (todo excepto alias). */
function needsReverification(row: VehicleRow, next: VehicleInsert): boolean {
  const arrEq = (a: string[], b: string[]) =>
    a.length === b.length && a.every((x, i) => x === b[i]);
  return (
    row.vehicle_type !== next.vehicle_type ||
    row.placas !== next.placas ||
    Number(row.capacity_kg) !== Number(next.capacity_kg) ||
    (row.cargo_length_m ?? null) !== (next.cargo_length_m ?? null) ||
    (row.cargo_width_m ?? null) !== (next.cargo_width_m ?? null) ||
    (row.cargo_height_m ?? null) !== (next.cargo_height_m ?? null) ||
    (row.cargo_volume_m3 ?? null) !== (next.cargo_volume_m3 ?? null) ||
    !arrEq(row.cargo_categories, next.cargo_categories ?? []) ||
    !arrEq(row.special_equipment, next.special_equipment ?? []) ||
    row.accepts_loose_bulk !== next.accepts_loose_bulk ||
    !arrEq(row.photos, next.photos ?? []) ||
    (row.tarjeta_circulacion_url ?? null) !== (next.tarjeta_circulacion_url ?? null) ||
    (row.poliza_seguro_url ?? null) !== (next.poliza_seguro_url ?? null) ||
    (row.permiso_sct ?? null) !== (next.permiso_sct ?? null) ||
    (row.permiso_sct_vigencia ?? null) !== (next.permiso_sct_vigencia ?? null)
  );
}

/**
 * Edición con guard de ownership. Cambiar cualquier dato relevante para la
 * verificación (todo excepto alias) regresa el vehículo a 'pending' — el
 * trigger de la DB impide que authenticated toque status, así que la
 * degradación se hace con service_role. rejected + edición = re-envío.
 */
export async function updateVehicle(
  id: string,
  values: unknown
): Promise<VehicleActionResult> {
  const gate = await requireLogistica();
  if ("error" in gate) return { error: gate.error };

  const parsed = vehicleSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const { data: current } = await supabase
    .from("carrier_vehicles")
    .select("*")
    .eq("id", id)
    .eq("carrier_id", gate.userId)
    .maybeSingle();
  if (!current) return { error: "Vehículo no encontrado." };

  const row = toRow(parsed.data, gate.userId);
  const { status: _ignored, ...updatable } = row;
  const { error } = await supabase
    .from("carrier_vehicles")
    .update(updatable)
    .eq("id", id)
    .eq("carrier_id", gate.userId);
  if (error) return { error: "No se pudo actualizar el vehículo." };

  if (
    current.status !== "pending" &&
    needsReverification(current, row)
  ) {
    const admin = createAdminClient();
    await admin
      .from("carrier_vehicles")
      .update({ status: "pending", verified_at: null })
      .eq("id", id);
  }

  revalidatePath(VEHICLES_PATH);
  redirect(`${VEHICLES_PATH}?updated=1`);
}

/** Pausar/reactivar: solo verified <-> inactive (el trigger DB lo garantiza). */
export async function toggleVehicleActive(
  id: string
): Promise<VehicleActionResult> {
  const gate = await requireLogistica();
  if ("error" in gate) return { error: gate.error };

  const supabase = createClient();
  const { data: current } = await supabase
    .from("carrier_vehicles")
    .select("id, status")
    .eq("id", id)
    .eq("carrier_id", gate.userId)
    .maybeSingle();
  if (!current) return { error: "Vehículo no encontrado." };

  if (current.status !== "verified" && current.status !== "inactive") {
    return {
      error:
        current.status === "pending"
          ? "Este vehículo sigue en revisión — aún no puedes pausarlo."
          : "Este vehículo fue rechazado — edítalo para reenviarlo a revisión.",
    };
  }

  const next = current.status === "verified" ? "inactive" : "verified";
  const { error } = await supabase
    .from("carrier_vehicles")
    .update({ status: next })
    .eq("id", id)
    .eq("carrier_id", gate.userId);
  if (error) return { error: "No se pudo cambiar el estado del vehículo." };

  revalidatePath(VEHICLES_PATH);
  return {};
}

/**
 * Baja: si el fletero tiene viajes registrados se pausa (soft) para
 * conservar historial; si no, se elimina de verdad.
 * Nota: freight_assignments aún no referencia vehicle_id (gap documentado
 * en CONTEXT.md) — el check es por fletero, conservador.
 */
export async function deleteVehicle(
  id: string
): Promise<VehicleActionResult> {
  const gate = await requireLogistica();
  if ("error" in gate) return { error: gate.error };

  const supabase = createClient();
  const { data: current } = await supabase
    .from("carrier_vehicles")
    .select("id, status")
    .eq("id", id)
    .eq("carrier_id", gate.userId)
    .maybeSingle();
  if (!current) return { error: "Vehículo no encontrado." };

  const { count } = await supabase
    .from("freight_assignments")
    .select("id", { head: true, count: "exact" })
    .eq("carrier_id", gate.userId);
  const hasTrips = (count ?? 0) > 0;

  if (hasTrips && (current.status === "verified" || current.status === "inactive")) {
    if (current.status === "verified") {
      const { error } = await supabase
        .from("carrier_vehicles")
        .update({ status: "inactive" })
        .eq("id", id)
        .eq("carrier_id", gate.userId);
      if (error) return { error: "No se pudo pausar el vehículo." };
    }
    revalidatePath(VEHICLES_PATH);
    return { soft: true };
  }

  const { error } = await supabase
    .from("carrier_vehicles")
    .delete()
    .eq("id", id)
    .eq("carrier_id", gate.userId);
  if (error) return { error: "No se pudo eliminar el vehículo." };

  revalidatePath(VEHICLES_PATH);
  return {};
}
