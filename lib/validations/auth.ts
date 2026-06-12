import { z } from "zod";

import { MUNICIPIOS, OTP_LENGTH, REGISTRABLE_ROLES } from "@/lib/constants";

const email = z
  .string()
  .min(1, "El correo es obligatorio")
  .email("Correo electrónico inválido")
  .transform((v) => v.trim().toLowerCase());

const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga");

// Teléfono MX: 10 dígitos (acepta espacios/guiones/paréntesis al capturar).
const phone = z
  .string()
  .min(1, "El teléfono es obligatorio")
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 10, "Ingresa un teléfono de 10 dígitos");

export const registerSchema = z.object({
  role: z.enum(REGISTRABLE_ROLES, {
    message: "Selecciona un tipo de cuenta",
  }),
  fullName: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(3, "Ingresa tu nombre completo")
    .max(120, "El nombre es demasiado largo")
    .transform((v) => v.trim()),
  email,
  password,
  phone,
  municipio: z.enum(MUNICIPIOS, {
    message: "Selecciona tu municipio",
  }),
  acceptPrivacy: z
    .boolean()
    .refine((v) => v === true, "Debes aceptar el aviso de privacidad"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "La contraseña es obligatoria"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  email,
  token: z
    .string()
    .length(OTP_LENGTH, `El código debe tener ${OTP_LENGTH} dígitos`)
    .regex(/^\d+$/, "El código solo contiene números"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
