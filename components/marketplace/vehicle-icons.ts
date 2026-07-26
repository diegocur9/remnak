import {
  Bike,
  Car,
  Caravan,
  Container,
  Forklift,
  Frame,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type { VehicleType } from "@/lib/marketplace/freight";

/** Ícono por tipo de vehículo (cards y listados). */
export const VEHICLE_TYPE_ICONS: Record<VehicleType, LucideIcon> = {
  moto: Bike,
  pickup: Car,
  redilas: Truck,
  volquete: Container,
  caja: Package,
  plataforma: Forklift,
  grua: Caravan,
  vidrio: Frame,
};
