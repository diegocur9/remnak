import { z } from "zod";

import { MUNICIPIOS } from "@/lib/constants";

export const LISTING_CATEGORIES = [
  "materiales",
  "maquinaria",
  "herramientas",
  "profesionales",
  "logistica",
  "liquidacion",
] as const;

export const LISTING_CONDITIONS = ["nuevo", "sobrante", "defectuoso"] as const;

/** Subasta queda post-piloto: el formulario solo ofrece fijo y renta. */
export const LISTING_PRICE_TYPES = ["fijo", "renta_diaria"] as const;

export const MIN_PHOTOS = 3;
export const MAX_PHOTOS = 5;

export const listingSchema = z
  .object({
    title: z
      .string()
      .min(8, "El título debe tener al menos 8 caracteres")
      .max(90, "Máximo 90 caracteres")
      .transform((v) => v.trim()),
    description: z
      .string()
      .max(1200, "Máximo 1200 caracteres")
      .transform((v) => v.trim())
      .optional()
      .or(z.literal("")),
    category: z.enum(LISTING_CATEGORIES, { message: "Selecciona una categoría" }),
    condition: z.enum(LISTING_CONDITIONS, { message: "Selecciona la condición" }),
    priceType: z.enum(LISTING_PRICE_TYPES, { message: "Selecciona el tipo de precio" }),
    priceMxn: z.coerce
      .number({ message: "Precio inválido" })
      .positive("El precio debe ser mayor a 0")
      .max(10_000_000, "Precio demasiado alto"),
    quantity: z.coerce
      .number({ message: "Cantidad inválida" })
      .int("Debe ser un entero")
      .min(1, "Mínimo 1")
      .max(100_000, "Cantidad demasiado alta"),
    unit: z
      .string()
      .min(1, "Indica la unidad (p. ej. sacos, día, m³)")
      .max(40)
      .transform((v) => v.trim()),
    brand: z.string().max(60).transform((v) => v.trim()).optional().or(z.literal("")),
    model: z.string().max(60).transform((v) => v.trim()).optional().or(z.literal("")),
    municipio: z.enum(MUNICIPIOS, { message: "Selecciona el municipio" }),
    fleteDisponible: z.boolean(),
    fletePrecioMxn: z.coerce.number().min(0).max(1_000_000).optional(),
    pickupDisponible: z.boolean(),
    esRcd: z.boolean(),
    volumenM3: z.coerce.number().positive().max(100_000).optional(),
    /** URLs públicas ya subidas a listing-photos/{user_id}/. */
    photos: z
      .array(z.string().url("Foto inválida"))
      .min(MIN_PHOTOS, `Sube al menos ${MIN_PHOTOS} fotos`)
      .max(MAX_PHOTOS, `Máximo ${MAX_PHOTOS} fotos`),
    status: z.enum(["draft", "active"]),
  })
  .refine((d) => !d.fleteDisponible || (d.fletePrecioMxn ?? 0) > 0, {
    message: "Indica el precio del flete",
    path: ["fletePrecioMxn"],
  })
  .refine((d) => !d.esRcd || (d.volumenM3 ?? 0) > 0, {
    message: "Indica el volumen en m³",
    path: ["volumenM3"],
  })
  .refine((d) => d.fleteDisponible || d.pickupDisponible, {
    message: "Ofrece al menos flete o recolección en sitio",
    path: ["pickupDisponible"],
  });

export type ListingInput = z.infer<typeof listingSchema>;
