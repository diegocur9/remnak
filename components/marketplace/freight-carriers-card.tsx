import { MapPin, Star, Truck } from "lucide-react";

import { VEHICLE_TYPE_ICONS } from "@/components/marketplace/vehicle-icons";
import { vehicleTypeLabel } from "@/lib/marketplace/freight";
import { tripsLabel } from "@/lib/marketplace/freight-calc";
import type { CompatibleCarrier } from "@/lib/queries/vehicles";
import { formatMXN } from "@/lib/utils";

/**
 * Fleteros compatibles con el envío (§6.3): SOLO compatibles, ya rankeados.
 * El comprador nunca ve un vehículo incompatible.
 */
export function FreightCarriersCard({
  matches,
  fletePrecioMxn,
  pickupDisponible,
}: {
  matches: CompatibleCarrier[];
  fletePrecioMxn: number;
  pickupDisponible: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-[#ECE4DB] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-[18px] w-[18px] text-brand" strokeWidth={2.2} />
          <span className="text-[13.5px] font-bold text-ink">
            Flete dentro de la plataforma
          </span>
        </div>
        <span className="font-mono text-[13.5px] font-bold tabular-nums text-ink">
          {formatMXN(fletePrecioMxn)}
        </span>
      </div>

      {matches.length === 0 ? (
        <p className="text-[12.5px] leading-[1.5] text-texto-suave">
          Aún no hay fleteros compatibles con esta carga en la zona.
          {pickupDisponible && " Puedes recoger en sitio."}
        </p>
      ) : (
        <div className="flex flex-col">
          {matches.slice(0, 4).map((m) => {
            const Icon = VEHICLE_TYPE_ICONS[m.vehicle.vehicle_type];
            const multiTrip = m.tripPlan.trips > 1;
            return (
              <div
                key={m.vehicle.id}
                className="flex items-center gap-3 border-b border-[#F2ECE4] py-2.5 last:border-b-0 last:pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(145deg,#FFF3EA,#FFE1CD)]">
                  <Icon className="h-[18px] w-[18px] text-brand" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold text-ink">
                    {vehicleTypeLabel(m.vehicle.vehicle_type)}
                    {m.vehicle.alias ? ` · ${m.vehicle.alias}` : ""}
                  </div>
                  <div className="flex items-center gap-2 text-[11.5px] text-[#8B8178]">
                    <span className="truncate">{m.carrier.full_name}</span>
                    <span className="inline-flex shrink-0 items-center gap-0.5">
                      <Star className="h-[10px] w-[10px] fill-brand text-brand" strokeWidth={0} />
                      {Math.round((m.carrier.rating_avg ?? 0) * 10) / 10}
                    </span>
                    {m.distanceKm != null && (
                      <span className="inline-flex shrink-0 items-center gap-0.5">
                        <MapPin className="h-[10px] w-[10px]" strokeWidth={2.2} />a{" "}
                        {m.distanceKm} km
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className={
                      multiTrip
                        ? "font-mono text-[11.5px] font-bold tabular-nums text-brand-strong"
                        : "font-mono text-[11.5px] tabular-nums text-[#1F8A4C]"
                    }
                  >
                    {tripsLabel(m.tripPlan)}
                  </div>
                  {multiTrip ? (
                    <div className="font-mono text-[10.5px] tabular-nums text-[#8B8178]">
                      ≈ {formatMXN(fletePrecioMxn * m.tripPlan.trips)}
                    </div>
                  ) : (
                    <div className="font-mono text-[10.5px] tabular-nums text-[#A89E94]">
                      {Number(m.vehicle.capacity_kg).toLocaleString("es-MX")} kg
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <p className="mt-2.5 border-t border-[#F2ECE4] pt-2.5 text-[11.5px] leading-[1.5] text-[#A1968B]">
            El fletero se asigna al crear la orden. Solo ves unidades
            verificadas que pueden transportar esta carga.
          </p>
        </div>
      )}
    </div>
  );
}
