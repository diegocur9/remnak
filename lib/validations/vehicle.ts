import { z } from "zod";

import {
  CARGO_CATEGORIES,
  SPECIAL_EQUIPMENT,
  VEHICLE_TYPES,
} from "@/lib/marketplace/freight";

export const MIN_VEHICLE_PHOTOS = 1;
export const MAX_VEHICLE_PHOTOS = 5;

const optionalPositive = (max: number, msg: string) =>
  z.coerce
    .number({ message: msg })
    .positive(msg)
    .max(max, msg)
    .optional();

export const vehicleSchema = z
  .object({
    vehicleType: z.enum(VEHICLE_TYPES, {
      message: "Selecciona el tipo de vehículo",
    }),
    alias: z
      .string()
      .max(60, "Máximo 60 caracteres")
      .transform((v) => v.trim())
      .optional()
      .or(z.literal("")),
    placas: z
      .string()
      .min(1, "Las placas son obligatorias")
      .transform((v) => v.trim().toUpperCase().replace(/\s+/g, "-"))
      .refine(
        (v) => /^[A-Z0-9-]{5,12}$/.test(v),
        "Placas inválidas (5–12 caracteres, letras/números/guiones)"
      ),
    capacityKg: z.coerce
      .number({ message: "Capacidad inválida" })
      .positive("La capacidad debe ser mayor a 0")
      .max(45_000, "Capacidad demasiado alta"),
    cargoLengthM: optionalPositive(30, "Largo inválido (m)"),
    cargoWidthM: optionalPositive(6, "Ancho inválido (m)"),
    cargoHeightM: optionalPositive(6, "Alto inválido (m)"),
    cargoVolumeM3: optionalPositive(120, "Volumen inválido (m³)"),
    cargoCategories: z
      .array(z.enum(CARGO_CATEGORIES))
      .min(1, "Selecciona al menos una categoría de carga"),
    specialEquipment: z.array(z.enum(SPECIAL_EQUIPMENT)).default([]),
    acceptsLooseBulk: z.boolean().default(false),
    photos: z
      .array(z.string().url("Foto inválida"))
      .min(MIN_VEHICLE_PHOTOS, "Sube al menos una foto del vehículo")
      .max(MAX_VEHICLE_PHOTOS, `Máximo ${MAX_VEHICLE_PHOTOS} fotos`),
    tarjetaCirculacionUrl: z.string().url().optional().or(z.literal("")),
    polizaSeguroUrl: z.string().url().optional().or(z.literal("")),
    permisoSct: z
      .string()
      .max(40, "Máximo 40 caracteres")
      .transform((v) => v.trim())
      .optional()
      .or(z.literal("")),
    /** Fecha ISO (yyyy-mm-dd). Requerida si se captura permiso SCT. */
    permisoSctVigencia: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
      .optional()
      .or(z.literal("")),
  })
  .refine((d) => !d.permisoSct || Boolean(d.permisoSctVigencia), {
    message: "Indica la vigencia del permiso SCT",
    path: ["permisoSctVigencia"],
  })
  .refine(
    (d) =>
      !d.permisoSctVigencia ||
      d.permisoSctVigencia > new Date().toISOString().slice(0, 10),
    {
      message: "El permiso SCT está vencido — captura una vigencia futura",
      path: ["permisoSctVigencia"],
    }
  )
  .refine(
    (d) => !d.cargoCategories.includes("largo_rigido") || Boolean(d.cargoLengthM),
    {
      message: "Para carga larga/rígida indica el largo útil de la caja (m)",
      path: ["cargoLengthM"],
    }
  )
  .refine(
    (d) =>
      !d.cargoCategories.includes("fragil_plano") ||
      d.specialEquipment.includes("caballete_vidrio"),
    {
      message:
        "El caballete para vidrio es obligatorio para transportar frágil plano",
      path: ["specialEquipment"],
    }
  );

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleFormValues = z.input<typeof vehicleSchema>;
