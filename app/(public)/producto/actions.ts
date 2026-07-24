"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface ToggleFavoriteResult {
  saved?: boolean;
  error?: string;
}

/**
 * Alterna favorito del usuario autenticado. El trigger on_favorite_change
 * mantiene listings.saves_count — no lo dupliques aquí.
 */
export async function toggleFavoriteAction(
  listingId: string
): Promise<ToggleFavoriteResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión para guardar anuncios." };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: "No se pudo quitar de guardados." };
    revalidatePath("/cuenta");
    return { saved: false };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, listing_id: listingId });
  if (error) return { error: "No se pudo guardar el anuncio." };
  revalidatePath("/cuenta");
  return { saved: true };
}
