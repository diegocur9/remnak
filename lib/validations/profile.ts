import { z } from "zod";

import { MUNICIPIOS } from "@/lib/constants";

/** Regímenes fiscales SAT comunes en el piloto (guía v2.2 §3). */
export const REGIMENES_FISCALES = [
  { value: "601", label: "601 — General de Ley (Persona Moral)" },
  { value: "612", label: "612 — PF con Actividades Empresariales" },
  { value: "626", label: "626 — RESICO (Régimen Simplificado de Confianza)" },
  { value: "616", label: "616 — Sin obligaciones fiscales" },
] as const;

export const USOS_CFDI = [
  { value: "G01", label: "G01 — Adquisición de mercancías" },
  { value: "G03", label: "G03 — Gastos en general" },
  { value: "S01", label: "S01 — Sin efectos fiscales" },
] as const;

/** RFC MX: 3-4 letras + fecha (6) + homoclave (3). */
const RFC_RE = /^([A-ZÑ&]{3,4})\d{6}[A-Z0-9]{3}$/;

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(3, "Ingresa tu nombre completo")
    .max(120, "Nombre demasiado largo")
    .transform((v) => v.trim()),
  phone: z
    .string()
    .min(1, "El teléfono es obligatorio")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10, "Teléfono de 10 dígitos"),
  municipio: z.enum(MUNICIPIOS, { message: "Selecciona tu municipio" }),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),

  // Fiscales (opcionales, pero el RFC es crítico para proveedores — §3)
  razonSocial: z
    .string()
    .max(150)
    .transform((v) => v.trim())
    .optional()
    .or(z.literal("")),
  rfc: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => v === "" || RFC_RE.test(v), "RFC inválido (formato SAT)")
    .optional()
    .or(z.literal("")),
  regimenFiscal: z
    .string()
    .max(60)
    .optional()
    .or(z.literal("")),
  usoCfdi: z
    .string()
    .max(10)
    .optional()
    .or(z.literal("")),
  cp: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v === "" || /^\d{5}$/.test(v), "CP de 5 dígitos")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileFormValues = z.input<typeof profileSchema>;
