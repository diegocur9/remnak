"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/profile";
import { isProviderSide } from "@/lib/auth/routes";
import { ESTADO_POR_MUNICIPIO } from "@/lib/constants";
import { CARGO_CATEGORIES, SPECIAL_EQUIPMENT } from "@/lib/marketplace/freight";
import { countCompatibleCarriers } from "@/lib/queries/vehicles";
import { listingSchema } from "@/lib/validations/listing";
import type { Database } from "@/types/database";

export interface ListingActionResult {
  error?: string;
}

type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];

/**
 * Gate server-side: sesión + rol de oferta (proveedor/profesional/logistica)
 * + verificación aprobada (decisión ratificada: publicar exige verified).
 */
async function requireVerifiedProvider(): Promise<
  { userId: string } | { error: string }
> {
  const { profile } = await getSessionProfile();
  if (!profile) return { error: "Inicia sesión para publicar." };
  if (!isProviderSide(profile))
    return { error: "Tu cuenta no tiene rol de proveedor." };
  if (profile.verification_status !== "verified")
    return { error: "Tu cuenta aún no está verificada. Podrás publicar al aprobarse." };
  return { userId: profile.id };
}

function toRow(
  values: ReturnType<typeof listingSchema.parse>,
  userId: string
): ListingInsert {
  return {
    user_id: userId,
    title: values.title,
    description: values.description || null,
    category: values.category,
    condition: values.condition,
    price_type: values.priceType,
    price_mxn: values.priceMxn,
    quantity: values.quantity,
    unit: values.unit,
    brand: values.brand || null,
    model: values.model || null,
    municipio: values.municipio,
    estado: ESTADO_POR_MUNICIPIO[values.municipio],
    photos: values.photos,
    flete_disponible: values.fleteDisponible,
    flete_precio_mxn: values.fleteDisponible ? (values.fletePrecioMxn ?? 0) : null,
    // Perfil de carga (matching de fleteros) — solo con flete activo
    cargo_category: values.fleteDisponible ? (values.cargoCategory ?? null) : null,
    weight_kg: values.fleteDisponible ? (values.weightKg ?? null) : null,
    cargo_volume_m3: values.fleteDisponible ? (values.cargoVolumeM3 ?? null) : null,
    requires_equipment: values.fleteDisponible ? values.requiresEquipment : [],
    pickup_disponible: values.pickupDisponible,
    es_rcd: values.esRcd,
    volumen_m3: values.esRcd ? (values.volumenM3 ?? null) : null,
    status: values.status,
  };
}

export async function createListingAction(
  values: unknown
): Promise<ListingActionResult> {
  const gate = await requireVerifiedProvider();
  if ("error" in gate) return { error: gate.error };

  const parsed = listingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("listings")
    .insert(toRow(parsed.data, gate.userId));
  if (error) return { error: "No se pudo publicar el anuncio. Intenta de nuevo." };

  revalidatePath("/panel");
  revalidatePath("/buscar");
  redirect("/panel?published=1");
}

export async function updateListingAction(
  listingId: string,
  values: unknown
): Promise<ListingActionResult> {
  const gate = await requireVerifiedProvider();
  if ("error" in gate) return { error: gate.error };

  const parsed = listingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  // RLS también lo garantiza; el eq(user_id) hace el intento explícito.
  const { error } = await supabase
    .from("listings")
    .update(toRow(parsed.data, gate.userId))
    .eq("id", listingId)
    .eq("user_id", gate.userId);
  if (error) return { error: "No se pudo actualizar el anuncio." };

  revalidatePath("/panel");
  revalidatePath("/buscar");
  revalidatePath(`/producto/${listingId}`);
  redirect("/panel?updated=1");
}

/**
 * Conteo en vivo para el form de publicar (§6.2): "Hay N fleteros que
 * pueden transportar esto". Sin ranking (lat/lng nulos): solo cuenta.
 */
export async function countCompatibleForListing(input: {
  cargoCategory: string;
  weightKg: number;
  requiresEquipment: string[];
}): Promise<number> {
  const cat = CARGO_CATEGORIES.find((c) => c === input.cargoCategory);
  const weight = Number(input.weightKg);
  if (!cat || !Number.isFinite(weight) || weight <= 0) return 0;
  const equipment = (input.requiresEquipment ?? []).filter((e) =>
    (SPECIAL_EQUIPMENT as readonly string[]).includes(e)
  );
  return countCompatibleCarriers({
    cargoCategory: cat,
    weightKg: weight,
    requiresEquipment: equipment,
    lat: null,
    lng: null,
  });
}

export async function setListingStatusAction(
  listingId: string,
  status: "active" | "paused"
): Promise<ListingActionResult> {
  const gate = await requireVerifiedProvider();
  if ("error" in gate) return { error: gate.error };

  const supabase = createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId)
    .eq("user_id", gate.userId);
  if (error) return { error: "No se pudo cambiar el estado." };

  revalidatePath("/panel");
  revalidatePath("/buscar");
  return {};
}
