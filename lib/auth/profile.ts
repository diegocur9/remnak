import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { SessionProfile } from "@/lib/auth/roles";

export { hasRole } from "@/lib/auth/roles";
export type { Profile, SessionProfile } from "@/lib/auth/roles";

const SESSION_PROFILE_COLUMNS =
  "id, full_name, avatar_url, role, secondary_roles, verification_status, municipio";

/**
 * Usuario autenticado + su profile. Memoizado por request (React cache) para
 * que header y layout no dupliquen la consulta. Devuelve null si no hay sesión.
 * Sólo servidor (usa cookies vía createClient).
 */
export const getSessionProfile = cache(
  async (): Promise<{ profile: SessionProfile | null }> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { profile: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select(SESSION_PROFILE_COLUMNS)
      .eq("id", user.id)
      .single();

    return { profile: (profile as SessionProfile | null) ?? null };
  }
);
