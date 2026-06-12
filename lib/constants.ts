import type { Database } from "@/types/database";

export type UserRole = Database["public"]["Enums"]["user_role"];

/** Roles seleccionables en el registro (admin se asigna manualmente). */
export const REGISTRABLE_ROLES = [
  "cliente",
  "proveedor",
  "profesional",
  "logistica",
] as const satisfies readonly UserRole[];

export type RegistrableRole = (typeof REGISTRABLE_ROLES)[number];

export interface RoleOption {
  value: RegistrableRole;
  label: string;
  tagline: string;
  description: string;
  /** Nombre de ícono de lucide-react. */
  icon: "ShoppingBag" | "Store" | "HardHat" | "Truck";
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "cliente",
    label: "Comprador",
    tagline: "Compro materiales y rento maquinaria",
    description: "Encuentra sobrantes, liquidaciones y equipo para tu obra.",
    icon: "ShoppingBag",
  },
  {
    value: "proveedor",
    label: "Proveedor",
    tagline: "Vendo o rento materiales y maquinaria",
    description: "Publica tu inventario y vende a obras de la región.",
    icon: "Store",
  },
  {
    value: "profesional",
    label: "Profesional",
    tagline: "Ofrezco servicios de obra",
    description: "Conecta con clientes que necesitan tu especialidad.",
    icon: "HardHat",
  },
  {
    value: "logistica",
    label: "Logística / Fletes",
    tagline: "Transporto materiales y equipo",
    description: "Recibe asignaciones de flete dentro de la plataforma.",
    icon: "Truck",
  },
];

/** Municipios del piloto. "Otro" permite registro fuera de la zona inicial. */
export const MUNICIPIOS = ["Campeche", "Mérida", "Otro"] as const;
export type Municipio = (typeof MUNICIPIOS)[number];

/** Estado por municipio (para prellenar profiles.estado). */
export const ESTADO_POR_MUNICIPIO: Record<Municipio, string | null> = {
  Campeche: "Campeche",
  Mérida: "Yucatán",
  Otro: null,
};

export const OTP_LENGTH = 8;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
