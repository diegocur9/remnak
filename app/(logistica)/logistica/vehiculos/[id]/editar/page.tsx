import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VehicleForm } from "@/components/marketplace/vehicle-form";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/profile";
import type { VehicleInput } from "@/lib/validations/vehicle";

export const metadata: Metadata = { title: "Editar vehículo" };

export default async function EditarVehiculoPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile } = await getSessionProfile();
  if (!profile) return null; // el layout ya redirige

  // Ownership: solo el dueño edita (RLS también lo garantiza).
  const supabase = createClient();
  const { data: v } = await supabase
    .from("carrier_vehicles")
    .select("*")
    .eq("id", params.id)
    .eq("carrier_id", profile.id)
    .maybeSingle();
  if (!v) notFound();

  const defaults: Partial<VehicleInput> = {
    vehicleType: v.vehicle_type,
    alias: v.alias ?? "",
    placas: v.placas,
    capacityKg: Number(v.capacity_kg),
    cargoLengthM: v.cargo_length_m ?? undefined,
    cargoWidthM: v.cargo_width_m ?? undefined,
    cargoHeightM: v.cargo_height_m ?? undefined,
    cargoVolumeM3: v.cargo_volume_m3 ?? undefined,
    cargoCategories: v.cargo_categories,
    specialEquipment:
      v.special_equipment as VehicleInput["specialEquipment"],
    acceptsLooseBulk: v.accepts_loose_bulk,
    photos: v.photos,
    tarjetaCirculacionUrl: v.tarjeta_circulacion_url ?? "",
    polizaSeguroUrl: v.poliza_seguro_url ?? "",
    permisoSct: v.permiso_sct ?? "",
    permisoSctVigencia: v.permiso_sct_vigencia ?? "",
  };

  return (
    <VehicleForm
      userId={profile.id}
      vehicleId={v.id}
      currentStatus={v.status}
      defaults={defaults}
    />
  );
}
