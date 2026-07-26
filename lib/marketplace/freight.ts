import type { Database } from "@/types/database";

/**
 * Catálogos del módulo de fleteros (spec Remnak_Modulo_Fleteros v1.0 §2–§3).
 * Única fuente para zod (validación) y UI (cards/chips) — no duplicar.
 */

export type VehicleType = Database["public"]["Enums"]["vehicle_type"];
export type CargoCategory = Database["public"]["Enums"]["cargo_category"];
export type VehicleStatus = Database["public"]["Enums"]["vehicle_status"];

export const VEHICLE_TYPES = [
  "moto",
  "pickup",
  "redilas",
  "volquete",
  "caja",
  "plataforma",
  "grua",
  "vidrio",
] as const satisfies readonly VehicleType[];

export const VEHICLE_TYPE_OPTIONS: {
  value: VehicleType;
  label: string;
  range: string;
  typical: string;
}[] = [
  { value: "moto", label: "Moto / mensajería", range: "Hasta ~20 kg", typical: "Tornillería, herramienta manual, sellador" },
  { value: "pickup", label: "Coche / camioneta", range: "Hasta ~500 kg", typical: "Lavabos, cajas, sacos sueltos, tubo corto" },
  { value: "redilas", label: "Camión de redilas", range: "1–3.5 ton", typical: "Block, cemento, varilla, tabique" },
  { value: "volquete", label: "Volquete", range: "3–7 ton granel", typical: "Grava, arena, tierra, escombro" },
  { value: "caja", label: "Camión caja seca", range: "3–10 ton protegido", typical: "Cemento en tarima, cajas frágiles" },
  { value: "plataforma", label: "Plataforma / lowboy", range: "Maquinaria pesada", typical: "Excavadoras, retros, compactadores" },
  { value: "grua", label: "Grúa / remolque", range: "Vehículos, estructura", typical: "Autos, estructura de acero, contenedor" },
  { value: "vidrio", label: "Camión de vidrio", range: "Con caballete/burro", typical: "Vidrio, cristal templado, cancelería" },
];

export const CARGO_CATEGORIES = [
  "granel",
  "paletizado",
  "largo_rigido",
  "fragil_plano",
  "voluminoso_pesado",
  "vehiculo_estructura",
  "ligero_pequeno",
  "sanitarios_fragil",
] as const satisfies readonly CargoCategory[];

export const CARGO_CATEGORY_OPTIONS: {
  value: CargoCategory;
  label: string;
  examples: string;
}[] = [
  { value: "granel", label: "Granel", examples: "Grava, arena, tierra, escombro" },
  { value: "paletizado", label: "Paletizado / apilable", examples: "Block, cemento, tabique" },
  { value: "largo_rigido", label: "Largo / rígido", examples: "Varilla, tubería, perfil, PTR" },
  { value: "fragil_plano", label: "Frágil plano", examples: "Vidrio, cristal templado, cancelería" },
  { value: "voluminoso_pesado", label: "Voluminoso pesado", examples: "Excavadora, retro, maquinaria" },
  { value: "vehiculo_estructura", label: "Vehículo / estructura", examples: "Autos, estructura de acero" },
  { value: "ligero_pequeno", label: "Ligero / pequeño", examples: "Tornillería, herramienta, accesorios" },
  { value: "sanitarios_fragil", label: "Sanitarios / frágil-volumen", examples: "Lavabo, WC, muebles de baño" },
];

/** Equipamiento especial (§3.1). En DB es text[]; validar contra este set. */
export const SPECIAL_EQUIPMENT = [
  "caballete_vidrio",
  "grua_hidraulica",
  "rampa",
  "amarres_carga",
  "lona_cubierta",
  "montacargas_propio",
] as const;
export type SpecialEquipment = (typeof SPECIAL_EQUIPMENT)[number];

export const SPECIAL_EQUIPMENT_OPTIONS: {
  value: SpecialEquipment;
  label: string;
  description: string;
}[] = [
  { value: "caballete_vidrio", label: "Caballete para vidrio", description: "Burro/caballete para transportar vidrio de canto (obligatorio en frágil plano)" },
  { value: "grua_hidraulica", label: "Grúa hidráulica", description: "Brazo hidráulico para cargar/descargar maquinaria o estructura" },
  { value: "rampa", label: "Rampa", description: "Para subir equipo rodante a la plataforma" },
  { value: "amarres_carga", label: "Amarres de carga", description: "Cinchos y tensores certificados para carga alta" },
  { value: "lona_cubierta", label: "Lona / cubierta", description: "Protección contra lluvia (temporada de huracanes jun–nov)" },
  { value: "montacargas_propio", label: "Montacargas propio", description: "El fletero trae su propio medio de carga/descarga" },
];

export const VEHICLE_STATUS_META: Record<
  VehicleStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "En revisión", color: "#9A6B0E", bg: "#FBF1DA" },
  verified: { label: "Verificado", color: "#1F8A4C", bg: "#E7F4EC" },
  rejected: { label: "Rechazado", color: "#C0392B", bg: "#FBEBE9" },
  inactive: { label: "Pausado", color: "#6B6259", bg: "#F1ECE5" },
};

export function vehicleTypeLabel(t: VehicleType): string {
  return VEHICLE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;
}

export function cargoCategoryLabel(c: CargoCategory): string {
  return CARGO_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;
}
