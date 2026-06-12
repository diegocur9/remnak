import type { UserRole } from "@/lib/constants";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Subconjunto de profile que necesitan header, layouts y guards. */
export type SessionProfile = Pick<
  Profile,
  | "id"
  | "full_name"
  | "avatar_url"
  | "role"
  | "secondary_roles"
  | "verification_status"
  | "municipio"
>;

/**
 * Multi-rol: true si el rol es el primario O está en secondary_roles.
 * Función pura — segura para importar desde middleware (Edge).
 */
export function hasRole(
  profile: Pick<SessionProfile, "role" | "secondary_roles"> | null,
  role: UserRole
): boolean {
  if (!profile) return false;
  if (profile.role === role) return true;
  return (profile.secondary_roles ?? []).includes(role);
}
