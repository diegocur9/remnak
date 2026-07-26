import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { VehicleActions } from "@/components/marketplace/vehicle-actions";
import { VEHICLE_TYPE_ICONS } from "@/components/marketplace/vehicle-icons";
import {
  VEHICLE_STATUS_META,
  cargoCategoryLabel,
  vehicleTypeLabel,
} from "@/lib/marketplace/freight";
import { getVehiclesByCarrier } from "@/lib/queries/vehicles";
import { getSessionProfile } from "@/lib/auth/profile";

export const metadata: Metadata = { title: "Mis vehículos" };

function sctBadge(vigencia: string | null): {
  label: string;
  color: string;
  bg: string;
} | null {
  if (!vigencia) return { label: "Sin permiso SCT", color: "#C0392B", bg: "#FBEBE9" };
  const days = Math.floor(
    (new Date(vigencia).getTime() - Date.now()) / (24 * 3600 * 1000)
  );
  if (days < 0) return { label: "SCT vencido", color: "#C0392B", bg: "#FBEBE9" };
  if (days <= 7) return { label: `SCT vence en ${days} d`, color: "#C0392B", bg: "#FBEBE9" };
  if (days <= 30) return { label: `SCT vence en ${days} d`, color: "#9A6B0E", bg: "#FBF1DA" };
  return null;
}

export default async function VehiculosPage() {
  const { profile } = await getSessionProfile();
  if (!profile) return null; // el layout ya redirige
  const vehicles = await getVehiclesByCarrier(profile.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] tracking-tight text-ink">
            Mis vehículos
          </h1>
          <p className="mt-1 text-sm text-texto-suave">
            Solo las unidades verificadas con permiso SCT vigente aparecen en el
            matching de fletes.
          </p>
        </div>
        <Link
          href="/logistica/vehiculos/nuevo"
          className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-brand px-[22px] text-[15px] font-extrabold text-white shadow-[0_6px_16px_rgba(242,107,44,.3)] transition-colors hover:bg-[#E0571B]"
        >
          <Plus className="h-[17px] w-[17px]" strokeWidth={2.6} />
          Registrar vehículo
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E0D6CB] bg-white py-20 text-center">
          <p className="font-semibold text-ink">Aún no registras vehículos</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-texto-suave">
            Da de alta tu primera unidad para empezar a recibir solicitudes de
            flete compatibles con lo que puedes transportar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {vehicles.map((v) => {
            const Icon = VEHICLE_TYPE_ICONS[v.vehicle_type];
            const st = VEHICLE_STATUS_META[v.status];
            const sct = sctBadge(v.permiso_sct_vigencia);
            return (
              <div
                key={v.id}
                className="rounded-[18px] border border-[#ECE4DB] bg-white p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[linear-gradient(145deg,#FFF3EA,#FFE1CD)]">
                    {v.photos[0] ? (
                      <Image
                        src={v.photos[0]}
                        alt={v.alias ?? vehicleTypeLabel(v.vehicle_type)}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized={!v.photos[0].includes(".supabase.co/storage/")}
                      />
                    ) : (
                      <Icon className="h-7 w-7 text-brand" strokeWidth={2} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-bold text-ink">
                        {v.alias || vehicleTypeLabel(v.vehicle_type)}
                      </span>
                      <span
                        className="inline-flex rounded-full px-[9px] py-[3px] text-[11px] font-bold"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                      {sct && (
                        <span
                          className="inline-flex rounded-full px-[9px] py-[3px] text-[11px] font-bold"
                          style={{ color: sct.color, background: sct.bg }}
                        >
                          {sct.label}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[13px] text-texto-suave">
                      {vehicleTypeLabel(v.vehicle_type)} · placas{" "}
                      <span className="font-mono">{v.placas}</span> ·{" "}
                      <span className="font-mono tabular-nums">
                        {Number(v.capacity_kg).toLocaleString("es-MX")} kg
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {v.cargo_categories.map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-[#E6DED4] bg-canvas px-2 py-0.5 text-[11px] font-semibold text-[#6B6259]"
                        >
                          {cargoCategoryLabel(c)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <VehicleActions id={v.id} status={v.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
