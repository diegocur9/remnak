import type { UserRole } from "@/lib/constants";
import { hasRole, type SessionProfile } from "@/lib/auth/roles";

/** Áreas autenticadas existentes hoy. */
export const CLIENTE_HOME = "/cuenta";
export const PROVEEDOR_HOME = "/panel";

/** Prefijos protegidos → requieren sesión. */
export const PROTECTED_PREFIXES = [CLIENTE_HOME, PROVEEDOR_HOME, "/admin"];

/** Rutas de auth desde las que se redirige a un usuario ya autenticado. */
export const AUTH_ONLY_PREFIXES = ["/login", "/register"];

/**
 * Roles con acceso al área de proveedor (/panel): los actores de oferta.
 * cliente es el único exclusivo de comprador.
 */
export function isProviderSide(
  profile: Pick<SessionProfile, "role" | "secondary_roles"> | null
): boolean {
  return (
    hasRole(profile, "proveedor") ||
    hasRole(profile, "profesional") ||
    hasRole(profile, "logistica")
  );
}

/** Home post-login según el rol primario. */
export function homeForRole(role: UserRole): string {
  if (role === "cliente") return CLIENTE_HOME;
  if (role === "admin") return "/admin";
  return PROVEEDOR_HOME;
}

/**
 * Home según el profile completo (respeta multi-rol). Devuelve siempre un
 * destino al que el usuario SÍ tiene acceso, para que sirva como objetivo de
 * redirección en los guards sin provocar bucles (cliente↔proveedor, admin).
 */
export function homeForProfile(
  profile: Pick<SessionProfile, "role" | "secondary_roles"> | null
): string {
  if (!profile) return "/";
  if (hasRole(profile, "cliente")) return CLIENTE_HOME;
  if (isProviderSide(profile)) return PROVEEDOR_HOME;
  if (profile.role === "admin") return "/admin";
  return "/";
}
