"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { ESTADO_POR_MUNICIPIO } from "@/lib/constants";
import { profileSchema } from "@/lib/validations/profile";

export interface ProfileActionResult {
  error?: string;
}

/**
 * Actualiza el perfil PROPIO. Solo campos editables: las columnas sensibles
 * (verification_status, rating, referidos, rol admin) las protege el trigger
 * protect_profile_sensitive_columns en DB — aquí ni se envían.
 */
export async function updateProfileAction(
  values: unknown
): Promise<ProfileActionResult> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión para editar tu perfil." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: d.fullName,
      phone: d.phone,
      municipio: d.municipio,
      estado: ESTADO_POR_MUNICIPIO[d.municipio],
      avatar_url: d.avatarUrl || null,
      razon_social: d.razonSocial || null,
      rfc: d.rfc || null,
      regimen_fiscal: d.regimenFiscal || null,
      uso_cfdi: d.usoCfdi || null,
      cp: d.cp || null,
    })
    .eq("id", user.id);
  if (error) return { error: "No se pudo guardar tu perfil. Intenta de nuevo." };

  revalidatePath("/perfil");
  revalidatePath("/", "layout"); // avatar/nombre en el header
  return {};
}
