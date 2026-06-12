"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ESTADO_POR_MUNICIPIO, type Municipio } from "@/lib/constants";
import { homeForRole } from "@/lib/auth/routes";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "@/lib/validations/auth";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface ActionResult {
  error?: string;
  /** Sólo para registro: indica al cliente a qué correo se envió el código. */
  email?: string;
}

/** Traduce los mensajes de error de Supabase Auth al español. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Tu correo aún no está verificado. Revisa tu bandeja.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con este correo. Inicia sesión.";
  if (m.includes("token has expired") || m.includes("expired"))
    return "El código expiró. Solicita uno nuevo.";
  if (m.includes("invalid") && m.includes("otp"))
    return "Código inválido. Verifica los dígitos.";
  if (m.includes("token") && m.includes("invalid"))
    return "Código inválido. Verifica los dígitos.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (m.includes("password")) return "La contraseña no cumple los requisitos.";
  return "Ocurrió un error. Inténtalo de nuevo.";
}

/**
 * El trigger on_auth_user_created ya creó la fila de profiles. Aquí, con sesión
 * activa, reconciliamos los datos del registro por si el trigger no mapeó la
 * metadata. Best-effort: si falla, no bloquea el flujo.
 */
async function reconcileProfile(
  supabase: SupabaseClient<Database>,
  user: User
) {
  const meta = user.user_metadata ?? {};
  const municipio = (meta.municipio as Municipio | undefined) ?? null;
  const update: Database["public"]["Tables"]["profiles"]["Update"] = {
    full_name: (meta.full_name as string | undefined) ?? null,
    phone: (meta.phone as string | undefined) ?? null,
    municipio,
    estado: municipio ? ESTADO_POR_MUNICIPIO[municipio] : null,
  };
  if (meta.role) update.role = meta.role as Database["public"]["Enums"]["user_role"];

  await supabase.from("profiles").update(update).eq("id", user.id);
}

export async function registerAction(
  values: unknown
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { email, password, fullName, phone, municipio, role } = parsed.data;

  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Si el correo de confirmación es un enlace (en vez de OTP), cae aquí.
      emailRedirectTo: `${appUrl}/auth/callback`,
      data: {
        full_name: fullName,
        role,
        phone,
        municipio,
        estado: ESTADO_POR_MUNICIPIO[municipio],
      },
    },
  });

  if (error) return { error: translateAuthError(error.message) };

  // Si el proyecto tiene confirmación de correo desactivada, signUp ya devuelve
  // sesión: reconciliamos y entramos directo.
  if (data.session && data.user) {
    await reconcileProfile(supabase, data.user);
    redirect(homeForRole(role));
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyOtpAction(values: unknown): Promise<ActionResult> {
  const parsed = verifyOtpSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Código inválido." };
  }
  const { email, token } = parsed.data;

  const supabase = createClient();
  // Confirmación de registro → tipo "signup" (coincide con resend).
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error || !data.user) {
    return { error: error ? translateAuthError(error.message) : "Código inválido." };
  }

  await reconcileProfile(supabase, data.user);
  const role =
    (data.user.user_metadata?.role as
      | Database["public"]["Enums"]["user_role"]
      | undefined) ?? "cliente";
  redirect(homeForRole(role));
}

export async function resendOtpAction(email: string): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) return { error: "Correo inválido." };

  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
  });
  if (error) return { error: translateAuthError(error.message) };
  return {};
}

export async function loginAction(values: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { email, password } = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/verify?email=${encodeURIComponent(email)}`);
    }
    return { error: translateAuthError(error.message) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  redirect(homeForRole(profile?.role ?? "cliente"));
}

export async function forgotPasswordAction(
  values: unknown
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Correo inválido." };
  }

  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  // No revelamos si el correo existe: siempre respondemos ok.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });
  return {};
}

export async function resetPasswordAction(
  values: unknown
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: translateAuthError(error.message) };

  redirect("/login?reset=ok");
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
